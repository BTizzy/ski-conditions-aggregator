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
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const mapInitializedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarContainerRef = useRef<HTMLDivElement | null>(null);

  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(500);
  const [radarOpacity, setRadarOpacity] = useState(0.75);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing map...');
  const [mapReady, setMapReady] = useState(false);
  const [selectedResort, setSelectedResort] = useState<ResortConditions | null>(null);

  const radarFramesRef = useRef<string[]>([]);
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // Initialize map - ONCE and ONLY ONCE
  useEffect(() => {
    if (mapInitializedRef.current) {
      console.log('[Map] Already initialized, skipping');
      return;
    }

    if (!containerRef.current) {
      console.error('[Map] Container ref not available');
      return;
    }

    mapInitializedRef.current = true;
    console.log('[Map] Starting initialization...');

    try {
      // Create map
      const map = L.map(containerRef.current, {
        center: [43.5, -71.5],
        zoom: 7,
        scrollWheelZoom: true,
      });

      console.log('[Map] Leaflet map created successfully');

      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      console.log('[Map] Base layer added');

      mapRef.current = map;

      // Create radar pane (BELOW markers so markers are visible)
      if (!map.getPane('radarPane')) {
        map.createPane('radarPane');
      }
      const radarPane = map.getPane('radarPane') as HTMLElement;
      radarPane.style.zIndex = '400'; // Below markers (default is 600)
      radarPane.style.pointerEvents = 'none';

      // Create markers pane (ABOVE radar)
      if (!map.getPane('markerPane')) {
        // markerPane already exists by default, just adjust z-index
        const markerPane = map.getPane('markerPane') as HTMLElement;
        markerPane.style.zIndex = '700'; // Above radar
      }

      // Create canvas container
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
      radarContainerRef.current = container2;

      // Size canvas
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

      setTimeout(() => {
        try {
          map.invalidateSize();
          console.log('[Map] Size invalidated');
        } catch (e) {
          console.error('[Map] Size invalidation error:', e);
        }
      }, 200);

      console.log('[Map] Initialization complete');
      setMapReady(true);
      setLoadingStatus('Map ready. Loading frames...');
    } catch (error) {
      console.error('[Map] Initialization failed:', error);
      setLoadingStatus('Map initialization failed');
      mapInitializedRef.current = false;
    }

    return () => {
      console.log('[Map] Cleanup');
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        console.error('[Map] Cleanup error:', e);
      }
      mapInitializedRef.current = false;
    };
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
        console.log('[Frames] API response:', data);

        const layers = data?.radar?.layers || [];
        console.log('[Frames] Loaded', layers.length, 'layers:', layers);

        radarFramesRef.current = layers;
        setFrameCount(layers.length);
        setRadarFramesAvailable(layers.length > 0);
        setLoadingStatus(`Ready: ${layers.length} frames`);
      } catch (e) {
        console.error('[Frames] Load failed:', e);
        setLoadingStatus(`Failed to load frames: ${e}`);
      }
    };

    loadFrames();
  }, [mapReady]);

  // Add resort markers
  useEffect(() => {
    if (!mapRef.current || resorts.length === 0) return;

    const map = mapRef.current;
    console.log('[Markers] Adding', resorts.length, 'resort markers');

    resorts.forEach((resort) => {
      // Skip if marker already exists
      if (markersRef.current.has(resort.id)) return;

      const cond = conditions[resort.id];
      const err = errors[resort.id];
      const isLoading = loading[resort.id];

      // Determine marker color based on conditions
      let markerColor = '#9CA3AF'; // gray - loading
      let markerIcon = '⏳';

      if (err) {
        markerColor = '#EF4444'; // red - error
        markerIcon = '⚠️';
      } else if (cond) {
        // Color based on recent snowfall
        if (cond.recentSnowfall >= 12) {
          markerColor = '#0EA5E9'; // bright blue - lots of snow
          markerIcon = '❄️';
        } else if (cond.recentSnowfall >= 6) {
          markerColor = '#06B6D4'; // cyan - moderate snow
          markerIcon = '⛷️';
        } else if (cond.recentSnowfall >= 1) {
          markerColor = '#3B82F6'; // blue - light snow
          markerIcon = '🏂';
        } else {
          markerColor = '#F59E0B'; // amber - no recent snow
          markerIcon = '⛰️';
        }
      }

      // Create custom HTML icon with proper styling
      const htmlIcon = L.divIcon({
        html: `<div style="background-color: ${markerColor}; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 24px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${markerIcon}</div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
        className: 'resort-marker',
      });

      const marker = L.marker([resort.lat, resort.lon], { icon: htmlIcon, pane: 'markerPane' })
        .addTo(map)
        .on('click', () => {
          if (cond) setSelectedResort(cond);
          marker.openPopup();
        });

      // Create popup content
      let popupHtml = `<div style="font-size: 12px; min-width: 200px; font-family: system-ui;">`;
      popupHtml += `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${resort.name}, ${resort.state}</div>`;

      if (isLoading) {
        popupHtml += `<div style="color: #666;">⏳ Loading conditions...</div>`;
      } else if (err) {
        popupHtml += `<div style="color: #DC2626;">❌ Error: ${err}</div>`;
      } else if (cond) {
        popupHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">`;
        popupHtml += `<div><span style="font-weight: 600;">24h Snow:</span> <span style="color: #0EA5E9; font-weight: bold;">${cond.recentSnowfall.toFixed(1)}"</span></div>`;
        popupHtml += `<div><span style="font-weight: 600;">Weekly:</span> <span style="color: #0EA5E9; font-weight: bold;">${(cond.weeklySnowfall || 0).toFixed(1)}"</span></div>`;
        popupHtml += `<div><span style="font-weight: 600;">Depth:</span> <span>${cond.snowDepth.toFixed(1)}"</span></div>`;
        popupHtml += `<div><span style="font-weight: 600;">Temp:</span> <span>${cond.baseTemp.toFixed(0)}°F</span></div>`;
        popupHtml += `<div><span style="font-weight: 600;">Wind:</span> <span>${cond.windSpeed.toFixed(0)} mph</span></div>`;
        popupHtml += `<div style="grid-column: 1/-1;"><span style="font-weight: 600;">Conditions:</span> <span style="font-size: 11px;">${cond.visibility}</span></div>`;
        popupHtml += `</div>`;
        popupHtml += `<div style="font-size: 10px; color: #666; margin-top: 8px;">Updated: ${new Date(cond.timestamp).toLocaleTimeString()}</div>`;
      } else {
        popupHtml += `<div style="color: #666;">No data available</div>`;
      }

      popupHtml += `</div>`;
      marker.bindPopup(popupHtml, { maxWidth: 250 });

      markersRef.current.set(resort.id, marker);
    });

    console.log('[Markers] Added', markersRef.current.size, 'markers to map');
  }, [resorts, conditions, loading, errors]);

  // Get tile bitmap
  const getTileBitmap = async (
    layer: string,
    z: number,
    x: number,
    y: number
  ): Promise<ImageBitmap | null> => {
    const key = `${layer}_${z}_${x}_${y}`;
    if (tileBitmapCache.current.has(key)) {
      return tileBitmapCache.current.get(key) || null;
    }

    try {
      const url = `/api/radar/tile?layer=${encodeURIComponent(layer)}&z=${z}&x=${x}&y=${y}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        console.debug('[Tile] HTTP', resp.status, 'for', key);
        return null;
      }

      const blob = await resp.blob();
      if (blob.size === 0) {
        console.debug('[Tile] Empty blob for', key);
        return null;
      }

      const bitmap = await createImageBitmap(blob);
      tileBitmapCache.current.set(key, bitmap);

      if (tileBitmapCache.current.size > 256) {
        const firstKey = tileBitmapCache.current.keys().next().value;
        if (firstKey) tileBitmapCache.current.delete(firstKey);
      }
      return bitmap;
    } catch (e) {
      console.debug('[Tile] Failed:', key, e);
      return null;
    }
  };

  // Render frame
  const renderFrameToCanvas = async (
    layer: string,
    z: number,
    widthPx: number,
    heightPx: number,
    key: string
  ): Promise<HTMLCanvasElement | null> => {
    if (frameCanvasCache.current.has(key)) {
      return frameCanvasCache.current.get(key) || null;
    }

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

      let tilesDrawn = 0;
      // Fetch and render tiles
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
          tilesDrawn++;
        }
      }

      console.debug('[RenderFrame] Drew', tilesDrawn, 'tiles for', layer);

      frameCanvasCache.current.set(key, c);
      if (frameCanvasCache.current.size > 32) {
        const firstKey = frameCanvasCache.current.keys().next().value;
        if (firstKey) frameCanvasCache.current.delete(firstKey);
      }
      return c;
    } catch (e) {
      console.error('[RenderFrame] Failed:', e);
      return null;
    }
  };

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let progress = 0;

    const step = async (now: number) => {
      const c = canvasRef.current;
      if (!c) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const ctx = c.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (!radarPlayingRef.current || !radarFramesAvailable) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const frames = radarFramesRef.current;
      if (frames.length === 0) {
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

      try {
        const map = mapRef.current;
        if (!map) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        const z = Math.max(0, Math.round(map.getZoom() || 5));
        const size = map.getSize();
        const keyPrev = `${frames[idx]}_${z}_${size.x}_${size.y}`;
        const keyNext = `${frames[nextIdx]}_${z}_${size.x}_${size.y}`;

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
      } catch (e) {
        console.debug('[AnimFrame]', e);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [radarFramesAvailable, radarSpeedMs]);

  // Update opacity
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.opacity = String(radarOpacity);
    }
  }, [radarOpacity]);

  return (
    <div className="relative w-full h-screen bg-gray-100 flex flex-col">
      {/* Map container */}
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '400px',
        }}
      />

      {/* Radar Controls */}
      <div className="absolute top-4 left-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs">
        <div className="font-bold mb-2 text-gray-800 text-sm">📡 Radar (Past 72h)</div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setRadarPlaying(true);
              radarPlayingRef.current = true;
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold"
          >
            ▶ Play
          </button>
          <button
            onClick={() => {
              setRadarPlaying(false);
              radarPlayingRef.current = false;
            }}
            className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 font-semibold"
          >
            ⏸ Pause
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 block mb-1">Speed</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={radarSpeedMs}
            onChange={(e) => setRadarSpeedMs(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-600">{radarSpeedMs}ms per frame</div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 block mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={radarOpacity}
            onChange={(e) => setRadarOpacity(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-600">{Math.round(radarOpacity * 100)}%</div>
        </div>

        <div className="text-xs text-gray-700 border-t pt-2">
          <div className="font-semibold">Status:</div>
          <div className="text-gray-600 text-wrap">{loadingStatus}</div>
          <div className="text-gray-600">Frames: {frameCount}</div>
          <div className="text-gray-600">Map: {mapReady ? '✅ Ready' : '⏳ Loading'}</div>
          <div className="text-gray-600">Markers: {markersRef.current.size}/43</div>
        </div>
      </div>

      {/* Selected Resort Info */}
      {selectedResort && (
        <div className="absolute top-4 right-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs">
          <button
            onClick={() => setSelectedResort(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
          <div className="font-bold text-gray-800 mb-2">📊 Current Conditions</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">24h Snow:</span> <span className="text-blue-600 font-bold">{selectedResort.recentSnowfall.toFixed(1)}"</span></div>
            <div><span className="font-semibold">Weekly:</span> <span className="text-blue-600 font-bold">{(selectedResort.weeklySnowfall || 0).toFixed(1)}"</span></div>
            <div><span className="font-semibold">Depth:</span> {selectedResort.snowDepth.toFixed(1)}"</div>
            <div><span className="font-semibold">Temp:</span> {selectedResort.baseTemp.toFixed(0)}°F</div>
            <div><span className="font-semibold">Wind:</span> {selectedResort.windSpeed.toFixed(0)} mph</div>
            <div><span className="font-semibold">Conditions:</span> <span className="text-xs">{selectedResort.visibility}</span></div>
            <div className="text-xs text-gray-500 mt-2">Updated: {new Date(selectedResort.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortMap;
