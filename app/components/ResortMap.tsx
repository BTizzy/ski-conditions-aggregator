"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Resort {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  elevationFt?: number;
}

interface ResortConditions {
  resortId: string;
  snowDepth: number;
  recentSnowfall: number;
  weeklySnowfall?: number;
  baseTemp: number;
  windSpeed: number;
  visibility: string;
  timestamp: string;
}

interface ResortMapProps {
  resorts?: Resort[];
  conditions?: Record<string, ResortConditions | null>;
  loading?: Record<string, boolean>;
  errors?: Record<string, string | null>;
}

const ResortMap: React.FC<ResortMapProps> = ({
  resorts = [],
  conditions = {},
  loading = {},
  errors = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(500);
  const [radarOpacity, setRadarOpacity] = useState(0.75);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing map...');
  const [mapReady, setMapReady] = useState(false);
  const [selectedResort, setSelectedResort] = useState<ResortConditions | null>(null);

  const radarFramesRef = useRef<Array<{ url: string; time?: number }>>([]); // Support both RainViewer & Mesonet
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return; // Already initialized

    if (!containerRef.current) return;
    if (containerRef.current.innerHTML !== '') containerRef.current.innerHTML = '';

    console.log('[Map] Starting initialization...');

    try {
      const map = L.map(containerRef.current, {
        center: [43.5, -71.5],
        zoom: 7,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      if (!map.getPane('radarPane')) map.createPane('radarPane');
      const radarPane = map.getPane('radarPane') as HTMLElement;
      radarPane.style.zIndex = '400';
      radarPane.style.pointerEvents = 'none';

      const markerPane = map.getPane('markerPane') as HTMLElement;
      markerPane.style.zIndex = '700';

      const container2 = document.createElement('div');
      container2.style.position = 'absolute';
      container2.style.left = '0';
      container2.style.top = '0';
      container2.style.width = '100%';
      container2.style.height = '100%';
      container2.style.pointerEvents = 'none';

      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = String(radarOpacity);

      container2.appendChild(canvas);
      radarPane.appendChild(container2);
      canvasRef.current = canvas;

      const resizeCanvas = () => {
        if (!canvas || !map) return;
        const size = map.getSize();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size.x * dpr;
        canvas.height = size.y * dpr;
        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resizeCanvas();
      map.on('resize', resizeCanvas);
      map.on('zoom', () => frameCanvasCache.current.clear());

      setTimeout(() => map.invalidateSize(), 200);

      console.log('[Map] Initialization complete');
      setMapReady(true);
      setLoadingStatus('Map ready. Loading frames...');
    } catch (error) {
      console.error('[Map] Initialization failed:', error);
      setLoadingStatus('Map initialization failed');
    }
  }, []);

  // Load radar frames (RainViewer 48-hour with Mesonet fallback)
  useEffect(() => {
    if (!mapReady) return;

    const loadFrames = async () => {
      try {
        console.log('[Frames] Fetching from API...');
        const res = await fetch('/api/radar/frames');
        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const data = await res.json();
        const layers = data?.radar?.layers || [];
        console.log('[Frames] Loaded', layers.length, 'layers, source:', data?.radar?.source);

        // Handle both RainViewer (array of objects with url/timestamp) and Mesonet (array of strings)
        const frameObjects = layers.map((layer: any) => {
          if (typeof layer === 'string') {
            // Mesonet format
            return { url: layer, time: 0 };
          } else {
            // RainViewer format
            return { url: layer.url, time: layer.timestamp };
          }
        });

        radarFramesRef.current = frameObjects;
        setFrameCount(frameObjects.length);
        setRadarFramesAvailable(frameObjects.length > 0);
        
        const sourceLabel = data?.radar?.source === 'rainviewer-48h' ? '48h RainViewer' : '1h Mesonet (fallback)';
        setLoadingStatus(`Ready: ${frameObjects.length} frames (${sourceLabel})`);
      } catch (e) {
        console.error('[Frames] Load failed:', e);
        setLoadingStatus(`Failed to load frames: ${e}`);
      }
    };

    loadFrames();
  }, [mapReady]);

  // Add resort markers with reconciliation
  useEffect(() => {
    if (!mapRef.current || resorts.length === 0) return;

    const map = mapRef.current;
    const activeIds = new Set(resorts.map(r => r.id));

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    resorts.forEach((resort) => {
      const cond = conditions[resort.id];
      const err = errors[resort.id];
      const isLoading = loading[resort.id];

      let markerColor = '#9CA3AF';
      let markerRadius = 8;
      let markerWeight = 2;

      if (err) {
        markerColor = '#EF4444';
        markerRadius = 7;
      } else if (cond) {
        if (cond.recentSnowfall >= 12) {
          markerColor = '#0EA5E9'; markerRadius = 12; markerWeight = 3;
        } else if (cond.recentSnowfall >= 6) {
          markerColor = '#06B6D4'; markerRadius = 10; markerWeight = 3;
        } else if (cond.recentSnowfall >= 1) {
          markerColor = '#3B82F6'; markerRadius = 9;
        } else {
          markerColor = '#F59E0B'; markerRadius = 8;
        }
      }

      if (markersRef.current.has(resort.id)) {
        const existing = markersRef.current.get(resort.id)!;
        existing.setStyle({ fillColor: markerColor, radius: markerRadius, weight: markerWeight });
        return;
      }

      const marker = L.circleMarker([resort.lat, resort.lon], {
        radius: markerRadius,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: markerWeight,
        opacity: 1,
        fillOpacity: 0.9,
        pane: 'markerPane',
      })
        .addTo(map)
        .on('click', () => { if (cond) setSelectedResort(cond); marker.openPopup(); })
        .on('mouseover', function () { this.setRadius(markerRadius * 1.3); })
        .on('mouseout', function () { this.setRadius(markerRadius); });

      let popupHtml = `<div style="font-size: 12px; min-width: 200px; font-family: system-ui;">`;
      popupHtml += `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${resort.name}, ${resort.state}</div>`;
      if (isLoading) popupHtml += `<div style="color: #666;">⏳ Loading...</div>`;
      else if (err) popupHtml += `<div style="color: #DC2626;">❌ Error: ${err}</div>`;
      else if (cond) {
        popupHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
        popupHtml += `<div><b>24h:</b> <span style="color:#0EA5E9">${cond.recentSnowfall}"</span></div>`;
        popupHtml += `<div><b>Base:</b> ${cond.snowDepth}"</div>`;
        popupHtml += `<div><b>Temp:</b> ${cond.baseTemp}°F</div>`;
        popupHtml += `</div>`;
      }
      popupHtml += `</div>`;
      
      marker.bindPopup(popupHtml, { maxWidth: 250 });
      markersRef.current.set(resort.id, marker);
    });
  }, [resorts, conditions, loading, errors]);

  // Get tile
  const getTileBitmap = async (
    layer: string | { url: string; time?: number },
    z: number,
    x: number,
    y: number
  ): Promise<ImageBitmap | null> => {
    const layerStr = typeof layer === 'string' ? layer : layer.url;
    const key = `${layerStr}_${z}_${x}_${y}`;
    if (tileBitmapCache.current.has(key)) return tileBitmapCache.current.get(key) || null;

    try {
      const url = `/api/radar/tile?layer=${encodeURIComponent(layerStr)}&z=${z}&x=${x}&y=${y}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;

      const blob = await resp.blob();
      if (blob.size === 0) return null;

      const bitmap = await createImageBitmap(blob);
      tileBitmapCache.current.set(key, bitmap);

      if (tileBitmapCache.current.size > 256) {
        const firstKey = tileBitmapCache.current.keys().next().value;
        if (firstKey) tileBitmapCache.current.delete(firstKey);
      }
      return bitmap;
    } catch (e) {
      return null;
    }
  };

  // Render frame to canvas
  const renderFrameToCanvas = async (
    layer: string | { url: string; time?: number },
    z: number,
    widthPx: number,
    heightPx: number,
    key: string
  ): Promise<HTMLCanvasElement | null> => {
    if (frameCanvasCache.current.has(key)) return frameCanvasCache.current.get(key) || null;

    try {
      const dpr = window.devicePixelRatio || 1;
      const c = document.createElement('canvas');
      c.width = widthPx * dpr;
      c.height = heightPx * dpr;

      const ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const map = mapRef.current;
      if (!map) return null;

      const size = map.getSize();
      const center = map.getCenter();
      const centerWorld = (map as any).project(center, z);
      const leftWorldX = centerWorld.x - size.x / 2;
      const topWorldY = centerWorld.y - size.y / 2;

      const xMin = Math.floor(leftWorldX / 256);
      const xMax = Math.floor((leftWorldX + size.x) / 256);
      const yMin = Math.floor(topWorldY / 256);
      const yMax = Math.floor((topWorldY + size.y) / 256);
      const tilesAcross = Math.pow(2, z);

      for (let tx = xMin; tx <= xMax; tx++) {
        for (let ty = yMin; ty <= yMax; ty++) {
          const wrapX = ((tx % tilesAcross) + tilesAcross) % tilesAcross;
          const wrapY = ty;
          if (wrapY < 0 || wrapY >= tilesAcross) continue;

          const bitmap = await getTileBitmap(layer, z, wrapX, wrapY);
          if (!bitmap) continue;

          const tileWorldX = tx * 256;
          const tileWorldY = ty * 256;
          const canvasX = (tileWorldX - leftWorldX) * dpr;
          const canvasY = (tileWorldY - topWorldY) * dpr;
          ctx.drawImage(bitmap, canvasX, canvasY, 256 * dpr, 256 * dpr);
        }
      }

      frameCanvasCache.current.set(key, c);
      if (frameCanvasCache.current.size > 32) {
        const firstKey = frameCanvasCache.current.keys().next().value;
        if (firstKey) frameCanvasCache.current.delete(firstKey);
      }
      return c;
    } catch (e) {
      return null;
    }
  };

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let progress = 0;

    const step = async (now: number) => {
      const c = canvasRef.current;
      if (!c) { rafRef.current = requestAnimationFrame(step); return; }

      const ctx = c.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(step); return; }

      if (!radarPlayingRef.current || !radarFramesAvailable) { rafRef.current = requestAnimationFrame(step); return; }

      const frames = radarFramesRef.current;
      if (frames.length === 0) { rafRef.current = requestAnimationFrame(step); return; }

      const elapsed = now - lastTime;
      lastTime = now;
      progress += elapsed;

      const dur = radarSpeedMs;
      const t = Math.min(1, progress / dur);
      const idx = radarIndexRef.current % frames.length;
      const nextIdx = (idx + 1) % frames.length;

      try {
        const map = mapRef.current;
        if (!map) { rafRef.current = requestAnimationFrame(step); return; }

        const z = Math.max(0, Math.round(map.getZoom() || 5));
        const size = map.getSize();
        const keyPrev = `${frames[idx].url}_${z}_${size.x}_${size.y}`;
        const keyNext = `${frames[nextIdx].url}_${z}_${size.x}_${size.y}`;

        ctx.clearRect(0, 0, c.width, c.height);

        const prevC = await renderFrameToCanvas(frames[idx], z, size.x, size.y, keyPrev);
        const nextC = await renderFrameToCanvas(frames[nextIdx], z, size.x, size.y, keyNext);

        if (prevC) ctx.drawImage(prevC, 0, 0);
        if (nextC) {
          ctx.globalAlpha = t;
          ctx.drawImage(nextC, 0, 0);
          ctx.globalAlpha = 1;
        }

        if (progress >= dur) {
          progress = 0;
          radarIndexRef.current = nextIdx;
        }
      } catch (e) { }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [radarFramesAvailable, radarSpeedMs]);

  useEffect(() => {
    if (canvasRef.current) canvasRef.current.style.opacity = String(radarOpacity);
  }, [radarOpacity]);

  return (
    <div className="relative w-full h-screen bg-gray-100 flex flex-col">
      <div ref={containerRef} className="flex-1 w-full" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }} />

      <div className="absolute top-4 left-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs">
        <div className="font-bold mb-2 text-gray-800 text-sm">🛰 Radar 48h</div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => { setRadarPlaying(true); radarPlayingRef.current = true; }} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold">▶ Play</button>
          <button onClick={() => { setRadarPlaying(false); radarPlayingRef.current = false; }} className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 font-semibold">⏸ Pause</button>
        </div>
        <div className="mb-3"><label className="text-xs font-semibold text-gray-700 block mb-1">Speed</label><input type="range" min="100" max="2000" step="50" value={radarSpeedMs} onChange={(e) => setRadarSpeedMs(Number(e.target.value))} className="w-full" /></div>
        <div className="mb-3"><label className="text-xs font-semibold text-gray-700 block mb-1">Opacity</label><input type="range" min="0" max="1" step="0.05" value={radarOpacity} onChange={(e) => setRadarOpacity(Number(e.target.value))} className="w-full" /></div>
        <div className="text-xs text-gray-700 border-t pt-2"><div>Status: {loadingStatus}</div><div>Markers: {markersRef.current.size}/43</div></div>
      </div>
      
      {selectedResort && (
        <div className="absolute top-4 right-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs">
          <button onClick={() => setSelectedResort(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg">✕</button>
          <div className="font-bold text-gray-800 mb-2">📊 Conditions</div>
          <div className="text-sm space-y-1"><div><span className="font-semibold">24h Snow:</span> <span className="text-blue-600 font-bold">{selectedResort.recentSnowfall}"</span></div><div><span className="font-semibold">Depth:</span> {selectedResort.snowDepth}"</div><div><span className="font-semibold">Temp:</span> {selectedResort.baseTemp}°F</div></div>
        </div>
      )}
    </div>
  );
};

export default ResortMap;
