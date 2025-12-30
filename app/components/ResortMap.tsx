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
  scrapeUrl?: string;
  conditionsUrl?: string;
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
  const popupsRef = useRef<Map<string, L.Popup>>(new Map());
  
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(800);
  const [radarOpacity, setRadarOpacity] = useState(0.6);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing map...');
  const [mapReady, setMapReady] = useState(false);
  const [selectedResort, setSelectedResort] = useState<{ resort: Resort; conditions: ResortConditions } | null>(null);

  // FIXED: Properly initialize radarFramesRef as a Ref, not a boolean
  const radarFramesRef = useRef<Array<{ url: string; time?: number }>>([]); 
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef(0);
  const mapPanZoomRef = useRef({ panning: false, zooming: false });

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;
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
      canvas.style.willChange = 'opacity';

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
        frameCanvasCache.current.clear();
      };

      resizeCanvas();
      map.on('resize', resizeCanvas);
      
      map.on('movestart', () => { mapPanZoomRef.current.panning = true; });
      map.on('moveend', () => { mapPanZoomRef.current.panning = false; frameCanvasCache.current.clear(); });
      map.on('zoomstart', () => { mapPanZoomRef.current.zooming = true; });
      map.on('zoomend', () => { mapPanZoomRef.current.zooming = false; frameCanvasCache.current.clear(); });

      setTimeout(() => map.invalidateSize(), 200);

      console.log('[Map] Initialization complete');
      setMapReady(true);
      setLoadingStatus('Map ready. Loading frames...');
    } catch (error) {
      console.error('[Map] Initialization failed:', error);
      setLoadingStatus('Map initialization failed');
    }
  }, []);

  // Load radar frames
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

        const frameObjects = layers.map((layer: any) => {
          if (typeof layer === 'string') {
            return { url: layer, time: 0 };
          } else {
            return { url: layer.url, time: layer.timestamp };
          }
        });

        // FIXED: Properly assign to ref.current
        radarFramesRef.current = frameObjects;
        setFrameCount(frameObjects.length);
        setRadarFramesAvailable(frameObjects.length > 0);
        
        const sourceLabel = data?.radar?.source === 'rainviewer-48h' ? '48h RainViewer' : '1h Mesonet (fallback)';
        setLoadingStatus(`Ready: ${frameObjects.length} frames (${sourceLabel})`);
        console.log('[Frames] Ready. Frames set:', frameObjects.length);
      } catch (e) {
        console.error('[Frames] Load failed:', e);
        setLoadingStatus(`Failed to load frames: ${e}`);
      }
    };

    loadFrames();
  }, [mapReady]);

  // Add resort markers with proper popup binding
  useEffect(() => {
    if (!mapRef.current || resorts.length === 0) return;

    const map = mapRef.current;
    const activeIds = new Set(resorts.map(r => r.id));

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
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

      // Update existing marker style
      if (markersRef.current.has(resort.id)) {
        const existing = markersRef.current.get(resort.id)!;
        existing.setStyle({ fillColor: markerColor, radius: markerRadius, weight: markerWeight });
        
        // Update popup content
        if (popupsRef.current.has(resort.id)) {
          const popup = popupsRef.current.get(resort.id)!;
          popup.setContent(buildPopupContent(resort, cond, err, isLoading));
        }
        return;
      }

      // Create new marker
      const marker = L.circleMarker([resort.lat, resort.lon], {
        radius: markerRadius,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: markerWeight,
        opacity: 1,
        fillOpacity: 0.9,
        pane: 'markerPane',
      }).addTo(map);

      // Create popup content
      const popupContent = buildPopupContent(resort, cond, err, isLoading);
      const popup = L.popup({ maxWidth: 320, closeButton: true }).setContent(popupContent);
      
      // Bind popup to marker
      marker.bindPopup(popup);
      popupsRef.current.set(resort.id, popup);

      // Add event listeners
      marker.on('click', (e) => {
        if (cond) {
          setSelectedResort({ resort, conditions: cond });
        }
        // Ensure popup opens
        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });

      marker.on('mouseover', function () { this.setRadius(markerRadius * 1.3); });
      marker.on('mouseout', function () { this.setRadius(markerRadius); });

      markersRef.current.set(resort.id, marker);
    });
  }, [resorts, conditions, loading, errors]);

  // Build popup content
  const buildPopupContent = (
    resort: Resort,
    cond: ResortConditions | null | undefined,
    err: string | null | undefined,
    isLoading: boolean | undefined
  ): HTMLElement => {
    const div = document.createElement('div');
    div.style.cssText = 'font-size: 13px; font-family: system-ui; padding: 8px; min-width: 240px;';
    
    let html = `<div style="font-weight: bold; font-size: 15px; margin-bottom: 12px; color: #1f2937;">${resort.name}, ${resort.state}</div>`;
    
    if (isLoading) {
      html += `<div style="color: #666; padding: 8px; background: #f3f4f6; border-radius: 4px;">⏳ Loading conditions...</div>`;
    } else if (err) {
      html += `<div style="color: #DC2626; padding: 8px; background: #fee2e2; border-radius: 4px;">❌ Error: ${err}</div>`;
    } else if (cond) {
      html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">`;
      html += `<div style="background: #dbeafe; padding: 8px; border-radius: 4px; border-left: 3px solid #0EA5E9;"><div style="font-size: 11px; color: #0c4a6e; font-weight: 600;">24h Snow</div><div style="color: #0EA5E9; font-weight: bold; font-size: 16px;">${cond.recentSnowfall}"</div></div>`;
      html += `<div style="background: #f0fdf4; padding: 8px; border-radius: 4px; border-left: 3px solid #22c55e;"><div style="font-size: 11px; color: #166534; font-weight: 600;">Base</div><div style="color: #22c55e; font-weight: bold; font-size: 16px;">${cond.snowDepth}"</div></div>`;
      html += `<div style="background: #eff6ff; padding: 8px; border-radius: 4px; border-left: 3px solid #3B82F6;"><div style="font-size: 11px; color: #1e40af; font-weight: 600;">Weekly</div><div style="color: #3B82F6; font-weight: bold; font-size: 16px;">${cond.weeklySnowfall || 'N/A'}"</div></div>`;
      html += `<div style="background: #fef2f2; padding: 8px; border-radius: 4px; border-left: 3px solid #EF4444;"><div style="font-size: 11px; color: #7f1d1d; font-weight: 600;">Temp</div><div style="color: #EF4444; font-weight: bold; font-size: 16px;">${cond.baseTemp}°F</div></div>`;
      html += `</div>`;
      html += `<div style="border-top: 1px solid #e5e7eb; padding-top: 10px; margin-bottom: 10px;">`;
      html += `<div style="font-size: 12px; color: #374151; margin-bottom: 6px;"><b>💨 Wind:</b> ${cond.windSpeed} mph</div>`;
      html += `<div style="font-size: 12px; color: #374151;"><b>👁️ Visibility:</b> ${cond.visibility}</div>`;
      html += `</div>`;
      
      if (resort.conditionsUrl || resort.scrapeUrl) {
        const url = resort.conditionsUrl || resort.scrapeUrl;
        html += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; background: #0EA5E9; color: white; padding: 10px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; text-decoration: none; text-align: center; cursor: pointer; margin-top: 8px; transition: background 0.2s;">📋 View Full Report →</a>`;
      }
    }
    
    div.innerHTML = html;
    return div;
  };

  // Get tile with connection pooling
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
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
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

      // Fetch tiles in parallel with controlled concurrency
      const tilePromises: Promise<void>[] = [];
      for (let tx = xMin; tx <= xMax; tx++) {
        for (let ty = yMin; ty <= yMax; ty++) {
          const wrapX = ((tx % tilesAcross) + tilesAcross) % tilesAcross;
          const wrapY = ty;
          if (wrapY < 0 || wrapY >= tilesAcross) continue;

          tilePromises.push(
            (async () => {
              const bitmap = await getTileBitmap(layer, z, wrapX, wrapY);
              if (!bitmap) return;

              const tileWorldX = tx * 256;
              const tileWorldY = ty * 256;
              const canvasX = (tileWorldX - leftWorldX) * dpr;
              const canvasY = (tileWorldY - topWorldY) * dpr;
              ctx.drawImage(bitmap, canvasX, canvasY, 256 * dpr, 256 * dpr);
            })()
          );
        }
      }

      // Wait for all tiles with concurrency limit
      const limit = 6;
      for (let i = 0; i < tilePromises.length; i += limit) {
        await Promise.all(tilePromises.slice(i, i + limit));
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

  // Animation loop - optimized
  useEffect(() => {
    let lastTime = performance.now();
    let progress = 0;

    const step = async (now: number) => {
      const c = canvasRef.current;
      if (!c) { rafRef.current = requestAnimationFrame(step); return; }

      const ctx = c.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(step); return; }

      if (!radarPlayingRef.current || !radarFramesAvailable) { 
        rafRef.current = requestAnimationFrame(step); 
        return; 
      }

      const frames = radarFramesRef.current;
      if (frames.length === 0) { rafRef.current = requestAnimationFrame(step); return; }

      // Skip during pan/zoom
      if (mapPanZoomRef.current.panning || mapPanZoomRef.current.zooming) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const elapsed = now - lastTime;
      lastTime = now;
      progress += elapsed;

      const dur = radarSpeedMs;
      const t = Math.min(1, progress / dur);
      const idx = radarIndexRef.current % frames.length;
      const nextIdx = (idx + 1) % frames.length;

      // Throttle to 20fps for radar
      const timeSinceLastRender = now - lastRenderTimeRef.current;
      if (timeSinceLastRender < 50) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

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

        lastRenderTimeRef.current = now;

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
        <div className="absolute top-4 right-4 z-[99999] bg-white/95 rounded-lg p-5 shadow-lg max-w-sm">
          <button onClick={() => setSelectedResort(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
          <div className="font-bold text-gray-800 text-base mb-3">📊 {selectedResort.resort.name}</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">24h Snowfall:</span>
              <span className="text-blue-600 font-bold text-lg">{selectedResort.conditions.recentSnowfall}"</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Weekly Total:</span>
              <span className="text-blue-500 font-bold text-lg">{selectedResort.conditions.weeklySnowfall || 'N/A'}"</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Base Depth:</span>
              <span className="text-gray-700 font-bold text-lg">{selectedResort.conditions.snowDepth}"</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Temperature:</span>
              <span className="text-red-600 font-bold text-lg">{selectedResort.conditions.baseTemp}°F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Wind:</span>
              <span className="text-gray-700 font-bold">{selectedResort.conditions.windSpeed} mph</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Visibility:</span>
              <span className="text-gray-700 font-bold">{selectedResort.conditions.visibility}</span>
            </div>
            {(selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl) && (
              <a 
                href={selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                View Full Report →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortMap;