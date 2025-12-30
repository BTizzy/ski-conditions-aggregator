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
  loading?: Record<string, boolean>;
  errors?: Record<string, string | null>;
}

const ResortMap: React.FC<ResortMapProps> = ({ resorts = [], conditions = {} }) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarContainerRef = useRef<HTMLDivElement | null>(null);
  const createdMapRef = useRef<boolean>(false);

  // Radar animation state
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(500);
  const [selectedWindowHours, setSelectedWindowHours] = useState<number>(24);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [currentRadarTime, setCurrentRadarTime] = useState<number | null>(null);
  
  // Refs for animation state
  const radarFramesRef = useRef<number[]>([]);
  const displayFramesRef = useRef<number[]>([]);
  const radarIndexRef = useRef<number>(0);
  const radarPlayingRef = useRef<boolean>(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // Create custom marker icon
  const createCustomIcon = (hasSnowfall: boolean | string | null) => {
    let fill = '#2563eb';
    let stroke = '#1d4ed8';
    if (hasSnowfall === 'snow') { fill = '#10b981'; stroke = '#059669'; }
    else if (hasSnowfall === 'rain') { fill = '#ef4444'; stroke = '#b91c1c'; }
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.272 0 0 6.272 0 14c0 14 14 22 14 22s14-8 14-22C28 6.272 21.728 0 14 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="14" cy="12" r="5" fill="white"/>
      </svg>
    `;
    return new L.Icon({ 
      iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), 
      iconSize: [28, 36], 
      iconAnchor: [14, 34], 
      popupAnchor: [0, -30] 
    });
  };

  // Initialize map and canvas overlay
  useEffect(() => {
    if (!mapDivRef.current) return;
    
    const globalAny = window as any;
    
    // Clean up any existing instance
    if (globalAny.__resortMapInstance) {
      try { globalAny.__resortMapInstance.remove(); } catch (e) {}
      globalAny.__resortMapInstance = null;
    }

    if (!mapRef.current) {
      const map = L.map(mapDivRef.current, { 
        center: [44, -72], 
        zoom: 7,
        scrollWheelZoom: true
      });
      
      // Add OSM base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      
      mapRef.current = map;
      createdMapRef.current = true;
      globalAny.__resortMapInstance = map;
      
      // Size map after mount
      setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 200);
    }

    const map = mapRef.current as L.Map;

    try {
      // Create radar pane for overlay (z-index 480 is above tiles, below markers)
      if (!map.getPane('radarPane')) {
        map.createPane('radarPane');
      }
      const pane = map.getPane('radarPane') as HTMLElement;
      pane.style.zIndex = '480';
      pane.style.pointerEvents = 'none';

      // Create canvas for radar animation
      if (!canvasRef.current && !radarContainerRef.current) {
        const container = document.createElement('div');
        container.id = 'radar-overlay-container';
        container.style.position = 'absolute';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'radar-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = String(radarOpacity);
        
        container.appendChild(canvas);
        pane.appendChild(container);
        
        canvasRef.current = canvas;
        radarContainerRef.current = container;
        
        // Handle map resize
        const resizeCanvas = () => {
          try {
            if (!canvas || !map) return;
            const size = map.getSize();
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = size.x * dpr;
            canvas.height = size.y * dpr;
            canvas.style.width = `${size.x}px`;
            canvas.style.height = `${size.y}px`;
            
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          } catch (e) {
            console.debug('[RadarMap] resize failed', e);
          }
        };
        
        map.on('resize', resizeCanvas);
        map.on('move', () => {
          // Redraw on map move
          radarIndexRef.current = Math.max(0, radarIndexRef.current);
        });
        map.on('zoom', () => {
          // Clear cache on zoom to ensure tiles are redrawn
          frameCanvasCache.current.clear();
        });
        
        resizeCanvas();
      }
    } catch (e) {
      console.debug('[RadarMap] setup failed', e);
    }

    return () => {
      try {
        if (markerLayerRef.current) {
          markerLayerRef.current.clearLayers();
          markerLayerRef.current.remove();
          markerLayerRef.current = null;
        }
        if (radarContainerRef.current && radarContainerRef.current.parentNode) {
          radarContainerRef.current.parentNode.removeChild(radarContainerRef.current);
        }
        if (mapRef.current && createdMapRef.current) {
          mapRef.current.remove();
        }
      } catch (e) {}
      mapRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  // Load radar frames from API
  const loadRadarFrames = async () => {
    try {
      const res = await fetch('/api/radar/frames');
      if (!res.ok) throw new Error('Failed to fetch frames');
      const data = await res.json();
      
      const past = (data?.radar?.past || []) as Array<{ time: number }>;
      const times = past.map((f) => f.time).filter(Boolean);
      
      radarFramesRef.current = times;
      setRadarFramesAvailable(times.length > 0);
      updateDisplayFrames(selectedWindowHours);
      
      return times;
    } catch (e) {
      console.debug('[Radar] loadRadarFrames failed', e);
      radarFramesRef.current = [];
      setRadarFramesAvailable(false);
      return [];
    }
  };

  // Update display frames based on selected window
  const updateDisplayFrames = (hours: number) => {
    const now = Date.now();
    const cutoff = now - hours * 3600 * 1000;
    const frames = (radarFramesRef.current || [])
      .filter((t) => t >= cutoff);
    
    const out = frames.length > 0 ? frames : radarFramesRef.current.slice(-Math.max(12, hours));
    displayFramesRef.current = out;
    radarIndexRef.current = Math.max(0, out.length - 1);
    setRadarFramesAvailable(out.length > 0);
    if (out.length > 0) {
      setCurrentRadarTime(out[radarIndexRef.current]);
    }
  };

  // Fetch radar tile image
  const getTileBitmap = async (time: number, z: number, x: number, y: number) => {
    const key = `${time}_${z}_${x}_${y}`;
    if (tileBitmapCache.current.has(key)) {
      return tileBitmapCache.current.get(key);
    }
    
    try {
      const url = `/api/radar/tile?time=${time}&z=${z}&x=${x}&y=${y}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      
      const blob = await resp.blob();
      const bitmap = await createImageBitmap(blob);
      
      tileBitmapCache.current.set(key, bitmap);
      
      // Simple cache eviction
      if (tileBitmapCache.current.size > 256) {
        const firstKey = tileBitmapCache.current.keys().next().value;
        if (firstKey) tileBitmapCache.current.delete(firstKey);
      }
      
      return bitmap;
    } catch (e) {
      console.debug('[Radar] getTileBitmap failed', e);
      return null;
    }
  };

  // Render single frame to canvas
  const renderFrameToCanvas = async (
    time: number,
    z: number,
    widthPx: number,
    heightPx: number,
    key: string
  ) => {
    if (frameCanvasCache.current.has(key)) {
      return frameCanvasCache.current.get(key);
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
      const halfX = size.x / 2;
      const halfY = size.y / 2;
      
      const center = map.getCenter();
      const centerWorld = (map as any).project(center, z);
      const leftWorldX = centerWorld.x - halfX;
      const topWorldY = centerWorld.y - halfY;
      
      const xMin = Math.floor(leftWorldX / 256);
      const xMax = Math.floor((leftWorldX + size.x) / 256);
      const yMin = Math.floor(topWorldY / 256);
      const yMax = Math.floor((topWorldY + size.y) / 256);
      const tilesAcross = Math.pow(2, z);
      
      // Fetch and render tiles
      for (let tx = xMin; tx <= xMax; tx++) {
        for (let ty = yMin; ty <= yMax; ty++) {
          const wrapX = ((tx % tilesAcross) + tilesAcross) % tilesAcross;
          const wrapY = ty;
          
          if (wrapY < 0 || wrapY >= tilesAcross) continue;
          
          const bitmap = await getTileBitmap(time, z, wrapX, wrapY);
          if (!bitmap) continue;
          
          const tileWorldX = tx * 256;
          const tileWorldY = ty * 256;
          const canvasX = (tileWorldX - leftWorldX) * dpr;
          const canvasY = (tileWorldY - topWorldY) * dpr;
          
          ctx.drawImage(bitmap, canvasX, canvasY, 256 * dpr, 256 * dpr);
        }
      }
      
      frameCanvasCache.current.set(key, c);
      
      // Simple eviction
      if (frameCanvasCache.current.size > 32) {
        const firstKey = frameCanvasCache.current.keys().next().value;
        if (firstKey) frameCanvasCache.current.delete(firstKey);
      }
      
      return c;
    } catch (e) {
      console.debug('[Radar] renderFrameToCanvas failed', e);
      return null;
    }
  };

  // Main animation loop
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
      
      const elapsed = now - lastTime;
      lastTime = now;
      progress += elapsed;
      
      const frames = displayFramesRef.current.length > 0 
        ? displayFramesRef.current 
        : radarFramesRef.current;
      
      if (frames.length === 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      
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
        
        const prevC = await renderFrameToCanvas(
          frames[idx],
          z,
          size.x,
          size.y,
          keyPrev
        );
        const nextC = await renderFrameToCanvas(
          frames[nextIdx],
          z,
          size.x,
          size.y,
          keyNext
        );
        
        if (prevC) ctx.drawImage(prevC, 0, 0);
        if (nextC) {
          ctx.globalAlpha = t;
          ctx.drawImage(nextC, 0, 0);
          ctx.globalAlpha = 1;
        }
        
        if (progress >= dur) {
          progress = 0;
          radarIndexRef.current = nextIdx;
          setCurrentRadarTime(frames[radarIndexRef.current]);
        }
      } catch (e) {
        console.debug('[Radar] animation frame failed', e);
      }
      
      rafRef.current = requestAnimationFrame(step);
    };
    
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [radarFramesAvailable, radarSpeedMs]);

  // Load frames on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const frames = await loadRadarFrames();
        if (mounted) setRadarFramesAvailable(frames.length > 0);
      } catch (e) {
        console.debug('[Radar] load failed', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Update display frames when window changes
  useEffect(() => {
    updateDisplayFrames(selectedWindowHours);
  }, [selectedWindowHours]);

  // Update canvas opacity
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
          icon: createCustomIcon(null),
        });
        
        let popupHtml = `<div class="font-bold">${resort.name}</div><div class="text-sm">${resort.state}</div>`;
        
        if (conditions[resort.id]) {
          const c = conditions[resort.id];
          popupHtml += `<div class="text-xs mt-2">`;
          if (c.snowDepth !== undefined) popupHtml += `<div>Snow: ${c.snowDepth}"</div>`;
          if (c.recentSnowfall !== undefined) popupHtml += `<div>24h: ${c.recentSnowfall}"</div>`;
          if (c.baseTemp !== undefined) popupHtml += `<div>Temp: ${c.baseTemp}°F</div>`;
          popupHtml += `</div>`;
        }
        
        marker.bindPopup(popupHtml);
        mg.addLayer(marker);
      }
      
      mg.addTo(map);
      markerLayerRef.current = mg;
    } catch (e) {
      console.debug('[RadarMap] marker update failed', e);
    }
  }, [resorts, conditions]);

  return (
    <div className="w-full h-screen relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
      <div ref={mapDivRef} className="w-full h-full" />
      
      {/* Radar Controls */}
      <div className="absolute top-4 left-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="font-bold mb-3 text-gray-800">Precipitation Radar (72h)</div>
        
        {/* Play/Pause */}
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
        
        {/* Time Window */}
        <div className="mb-3">
          <div className="text-xs font-semibold mb-2 text-gray-700">Time Window</div>
          <div className="flex gap-2">
            {[24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => setSelectedWindowHours(h)}
                className={`flex-1 px-2 py-1 text-xs rounded font-medium transition ${
                  selectedWindowHours === h
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
        
        {/* Speed Control */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 block mb-1">Speed (ms)</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={radarSpeedMs}
            onChange={(e) => setRadarSpeedMs(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600">{radarSpeedMs}ms</span>
        </div>
        
        {/* Opacity Control */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-700 block mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={radarOpacity}
            onChange={(e) => setRadarOpacity(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600">{Math.round(radarOpacity * 100)}%</span>
        </div>
        
        {/* Status */}
        <div className="text-xs text-gray-600 border-t pt-2">
          {radarFramesAvailable ? (
            <div>
              <div>{displayFramesRef.current.length || radarFramesRef.current.length} frames available</div>
              {currentRadarTime && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(currentRadarTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-yellow-600">Loading radar data...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResortMap;
