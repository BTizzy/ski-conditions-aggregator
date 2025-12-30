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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
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
        center: [44, -72],
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

      // Create radar pane
      if (!map.getPane('radarPane')) {
        map.createPane('radarPane');
      }
      const pane = map.getPane('radarPane') as HTMLElement;
      pane.style.zIndex = '480';
      pane.style.pointerEvents = 'none';

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
      {/* Map container - MUST have explicit height */}
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
          <div className="text-gray-600 text-wrap">{loadingStatus}</div>
          <div className="text-gray-600">Frames: {frameCount}</div>
          <div className="text-gray-600">Map: {mapReady ? '✅ Ready' : '⏳ Loading'}</div>
        </div>
      </div>
    </div>
  );
};

export default ResortMap;
