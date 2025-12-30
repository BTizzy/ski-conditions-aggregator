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
}

interface ResortMapProps {
  resorts?: Resort[];
  conditions?: Record<string, any>;
}

const ResortMap: React.FC<ResortMapProps> = ({ resorts = [], conditions = {} }) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarContainerRef = useRef<HTMLDivElement | null>(null);

  // Radar state
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(500);
  const [radarOpacity, setRadarOpacity] = useState(0.75);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  
  const radarFramesRef = useRef<string[]>([]);
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // Initialize map - ONCE
  useEffect(() => {
    if (mapInitializedRef.current || !mapDivRef.current) return;
    mapInitializedRef.current = true;

    try {
      const container = mapDivRef.current;
      
      // Check if already initialized
      if (container.classList.contains('leaflet-container')) {
        console.log('[Map] Container already has Leaflet, reusing');
        return;
      }

      console.log('[Map] Initializing Leaflet map');
      const map = L.map(mapDivRef.current, {
        center: [44, -72],
        zoom: 7,
        scrollWheelZoom: true
      });

      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      // Create radar pane
      if (!map.getPane('radarPane')) {
        map.createPane('radarPane');
      }
      const pane = map.getPane('radarPane') as HTMLElement;
      pane.style.zIndex = '480';
      pane.style.pointerEvents = 'none';

      // Create canvas
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
      canvas.style.opacity = String(radarOpacity);
      canvas.style.pointerEvents = 'none';

      container2.appendChild(canvas);
      pane.appendChild(container2);
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

      setTimeout(() => map.invalidateSize(), 200);
      console.log('[Map] Leaflet initialized successfully');
    } catch (e) {
      console.error('[Map] Failed to initialize:', e);
      setLoadingStatus('Map init failed');
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        console.error('[Cleanup] Error removing map:', e);
      }
      mapInitializedRef.current = false;
    };
  }, []);

  // Load frames
  useEffect(() => {
    const loadFrames = async () => {
      try {
        setLoadingStatus('Loading radar frames...');
        const res = await fetch('/api/radar/frames');
        const data = await res.json();
        const layers = data?.radar?.layers || [];
        console.log('[Frames] Loaded:', layers.length, 'layers');
        radarFramesRef.current = layers;
        setFrameCount(layers.length);
        setRadarFramesAvailable(layers.length > 0);
        setLoadingStatus(`Ready: ${layers.length} frames`);
      } catch (e) {
        console.error('[Frames] Load failed:', e);
        setLoadingStatus('Failed to load frames');
      }
    };

    loadFrames();
  }, []);

  // Get tile bitmap
  const getTileBitmap = async (layer: string, z: number, x: number, y: number): Promise<ImageBitmap | null> => {
    const key = `${layer}_${z}_${x}_${y}`;
    if (tileBitmapCache.current.has(key)) {
      return tileBitmapCache.current.get(key) || null;
    }

    try {
      const url = `/api/radar/tile?layer=${encodeURIComponent(layer)}&z=${z}&x=${x}&y=${y}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      const bitmap = await createImageBitmap(blob);
      tileBitmapCache.current.set(key, bitmap);
      if (tileBitmapCache.current.size > 256) {
        const firstKey = tileBitmapCache.current.keys().next().value;
        if (firstKey) tileBitmapCache.current.delete(firstKey);
      }
      return bitmap;
    } catch (e) {
      console.debug('[Tile] Fetch failed:', e);
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

      // Fetch tiles
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
      console.debug('[RenderFrame] Failed:', e);
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
        console.debug('[AnimFrame] Failed:', e);
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

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers();
        markerLayerRef.current.remove();
      }

      const mg = L.layerGroup();
      for (const resort of resorts) {
        const marker = L.marker([resort.lat, resort.lon], {
          icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDI4IDM2Ij48cGF0aCBkPSJNMTQgMEM2LjI3MiAwIDAgNi4yNzIgMCAxNGMwIDE0IDE0IDIyIDE0IDIyczE0LTggMTQtMjJDMjggNi4yNzIgMjEuNzI4IDAgMTQgMHoiIGZpbGw9IiMyNTYzZWIiIHN0cm9rZT0iIzFkNGVkOCIgc3Ryb2tlLXdpZHRoPSIxLjgiLz48Y2lyY2xlIGN4PSIxNCIgY3k9IjEyIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
            iconSize: [28, 36],
            iconAnchor: [14, 34],
            popupAnchor: [0, -30]
          })
        });

        let html = `<div class="font-bold">${resort.name}</div><div class="text-sm">${resort.state}</div>`;
        marker.bindPopup(html);
        mg.addLayer(marker);
      }
      mg.addTo(map);
      markerLayerRef.current = mg;
    } catch (e) {
      console.error('[Markers] Failed:', e);
    }
  }, [resorts]);

  return (
    <div className="w-full h-screen relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-200">
      <div ref={mapDivRef} className="w-full h-full" style={{ minHeight: '600px' }} />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs">
        <div className="font-bold mb-2 text-gray-800">Precipitation Radar</div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setRadarPlaying(true);
              radarPlayingRef.current = true;
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Play
          </button>
          <button
            onClick={() => {
              setRadarPlaying(false);
              radarPlayingRef.current = false;
            }}
            className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
          >
            Pause
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 block mb-1">Speed (ms)</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={radarSpeedMs}
            onChange={(e) => setRadarSpeedMs(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-600">{radarSpeedMs}ms</div>
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
          <div className="text-gray-600">{loadingStatus}</div>
          <div className="text-gray-600">Frames: {frameCount}</div>
        </div>
      </div>
    </div>
  );
};

export default ResortMap;
