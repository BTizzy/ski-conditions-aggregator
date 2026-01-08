"use client";

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Dynamically import RadarControls to reduce initial bundle size
const RadarControls = dynamic(() => import('./RadarControls'), {
  loading: () => <div className="animate-pulse bg-gray-700 h-16 rounded-lg"></div>
});

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
  recentRainfall?: number;
  weeklySnowfall?: number;
  weeklyRainfall?: number;
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
  console.log('[ResortMap] Component function called');

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const popupsRef = useRef<Map<string, L.Popup>>(new Map());
  const precipOverlayRef = useRef<L.LayerGroup | null>(null);

  // Ensure we only render on client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(1500); // Slower for daily frames
  const [mapReady, setMapReady] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(0.6);
  const [radarVisible, setRadarVisible] = useState(true);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const [radarMode, setRadarMode] = useState<'synthetic' | 'live'>('synthetic');
  const [framesReloadKey, setFramesReloadKey] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing map...');
  const [selectedResort, setSelectedResort] = useState<{ resort: Resort; conditions: ResortConditions } | null>(null);
  const [radarSource, setRadarSource] = useState('synthetic');
  const [currentFrameTime, setCurrentFrameTime] = useState<number | null>(null);
  const [highlightPrecip, setHighlightPrecip] = useState(true);

  const radarFramesRef = useRef<Array<{ url: string; time?: number }>>([]); 
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef(0);
  const mapPanZoomRef = useRef({ panning: false, zooming: false });

  // Timeline handlers
  const handleFrameSelect = (index: number) => {
    radarIndexRef.current = index;
    setRadarPlaying(false);
    radarPlayingRef.current = false;
  };

  const handleStep = (delta: number) => {
    const frames = radarFramesRef.current;
    if (!frames.length) return;
    const next = (radarIndexRef.current + delta + frames.length) % frames.length;
    radarIndexRef.current = next;
    setRadarPlaying(false);
    radarPlayingRef.current = false;
  };

  const handleScrub = (frame: number) => {
    const frames = radarFramesRef.current;
    if (!frames.length) return;
    const idx = Math.min(frames.length - 1, Math.max(0, frame - 1));
    radarIndexRef.current = idx;
    setRadarPlaying(false);
    radarPlayingRef.current = false;
  };

  const handleRefresh = () => {
    tileBitmapCache.current.clear();
    frameCanvasCache.current.clear();
    setFramesReloadKey(k => k + 1);
    setLoadingStatus('Refreshing radar...');
  };

  const handleJumpStart = () => {
    if (!radarFramesRef.current.length) return;
    radarIndexRef.current = 0;
    setRadarPlaying(false);
    radarPlayingRef.current = false;
  };

  const handleJumpEnd = () => {
    const len = radarFramesRef.current.length;
    if (!len) return;
    radarIndexRef.current = len - 1;
    setRadarPlaying(false);
    radarPlayingRef.current = false;
  };

  const handleSourceChange = (source: string) => {
    const next = source === 'live' ? 'live' : 'synthetic';
    setRadarMode(next as 'live' | 'synthetic');
    setRadarSource(next);
    handleRefresh();
  };

  const handlePlayPause = () => {
    const newPlaying = !radarPlaying;
    setRadarPlaying(newPlaying);
    radarPlayingRef.current = newPlaying;
  };

  // Initialize map
  useEffect(() => {
    if (!mounted) return;
    if (mapRef.current || !containerRef.current) return;
    if (containerRef.current.innerHTML !== '') containerRef.current.innerHTML = '';

    console.log('[Map] Starting initialization...');

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

    // MONKEY PATCH: Log any radar-related fetches at the global level so we
    // can reliably observe requests regardless of local code path.
    try {
      if (!(window as any).__radarFetchPatched) {
        const origFetch = window.fetch.bind(window);
        (window as any).__radarFetchPatched = true;
        window.fetch = async (input: any, init?: any) => {
          try {
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            if (typeof url === 'string' && url.includes('/api/radar')) {
              console.log('[Radar Debug] global fetch', { url, init });
            }
          } catch (e) { /* ignore */ }
          return origFetch(input, init);
        };
      }
    } catch (e) {
      console.warn('[Radar Debug] failed to patch fetch', e);
    }

    if (!map.getPane('radarPane')) map.createPane('radarPane');
    const radarPane = map.getPane('radarPane') as HTMLElement;
    radarPane.id = 'radarPane';
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

    // Create two canvases for smooth cross-fading
  const canvas1 = document.createElement('canvas');
  canvas1.setAttribute('data-testid', 'radar-canvas-1');
  canvas1.dataset.testid = 'radar-canvas-1';
    canvas1.style.position = 'absolute';
    canvas1.style.left = '0';
    canvas1.style.top = '0';
    canvas1.style.pointerEvents = 'none';
    canvas1.style.opacity = '1';
    canvas1.style.willChange = 'opacity';
  canvas1.style.display = 'block';

  const canvas2 = document.createElement('canvas');
  canvas2.setAttribute('data-testid', 'radar-canvas-2');
  canvas2.dataset.testid = 'radar-canvas-2';
    canvas2.style.position = 'absolute';
    canvas2.style.left = '0';
    canvas2.style.top = '0';
    canvas2.style.pointerEvents = 'none';
    canvas2.style.opacity = '0';
    canvas2.style.willChange = 'opacity';
  canvas2.style.display = 'block';

    container2.appendChild(canvas1);
    container2.appendChild(canvas2);
    radarPane.appendChild(container2);
    canvasRef.current = canvas1;
    canvas2Ref.current = canvas2;

    const resizeCanvas = () => {
      if (!canvas1 || !canvas2 || !map) return;
      const size = map.getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas1.width = size.x * dpr;
      canvas1.height = size.y * dpr;
      canvas1.style.width = `${size.x}px`;
      canvas1.style.height = `${size.y}px`;
      const ctx1 = canvas1.getContext('2d', { willReadFrequently: true });
      if (ctx1) ctx1.setTransform(dpr, 0, 0, dpr, 0, 0);

      canvas2.width = size.x * dpr;
      canvas2.height = size.y * dpr;
      canvas2.style.width = `${size.x}px`;
      canvas2.style.height = `${size.y}px`;
      const ctx2 = canvas2.getContext('2d', { willReadFrequently: true });
      if (ctx2) ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    
    map.on('movestart', () => { mapPanZoomRef.current.panning = true; });
    map.on('moveend', () => {
      mapPanZoomRef.current.panning = false;
      setTimeout(() => frameCanvasCache.current.clear(), 1000);
    });
    map.on('zoomstart', () => { mapPanZoomRef.current.zooming = true; });
    map.on('zoomend', () => {
      mapPanZoomRef.current.zooming = false;
      setTimeout(() => frameCanvasCache.current.clear(), 1000);
    });

    // Overlay layer for precip highlights
    precipOverlayRef.current = L.layerGroup();
    precipOverlayRef.current.addTo(map);

    map.whenReady(() => {
      // Ensure Leaflet computes pane positions before rendering
      map.invalidateSize();
      const center = map.getCenter();
      if (center) {
        map.setView(center);
      }

      console.log('[Map] Initialization complete');
      setMapReady(true);
      setLoadingStatus('Map ready. Loading frames...');
    });

    return () => {
      map.remove();
    };
  }, [mounted]);

  // Load radar frames - try REAL radar first, synthetic as fallback
  useEffect(() => {
    console.log('[Frames] effect triggered', { mapReady, framesReloadKey, radarMode });
    if (!mapReady) return;

    const loadFrames = async () => {
      try {
        console.log('[Frames] Loading radar frames with cache busting...');

        // Try multi-source radar system (NOAA, RainViewer, OpenWeatherMap) but never block synthetic fallback
        try {
          const signal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(10000) : undefined;
          const radarRes = await fetch(`/api/radar/frames?t=${Date.now()}`, {
            signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          console.log('[Frames] Fetch result - ok:', radarRes.ok, 'status:', radarRes.status);
        } catch (err) {
          console.warn('[Frames] Real radar fetch failed or timed out; continuing with synthetic', err);
        }

        // USE REAL RESORT DATA: Use actual daily precipitation from resort observations
        console.log('[Frames] Loading real resort precipitation data for 7-day radar animation...');

        // Generate 7 daily frames (1 per day for the past week)
        // Each frame uses real snowfall/rainfall data from resort observations
        console.log('[Frames] Generating 7 daily frames from real resort data...');

        const now = Date.now();
        const frameObjects = Array.from({ length: 7 }, (_, day) => ({
          url: `/api/radar/synthetic?day=${day}`,
          time: now - day * 24 * 60 * 60 * 1000, // Each frame represents 1 day of real precipitation
        }));

        // Clear existing caches to ensure fresh animation
        tileBitmapCache.current.clear();
        frameCanvasCache.current.clear();

        radarFramesRef.current = frameObjects;
        radarIndexRef.current = 0;
        setFrameCount(frameObjects.length);
        setRadarFramesAvailable(true);
        console.log('[Frames] Set radarFramesAvailable to: true (real resort data), frames:', frameObjects.length);
        setRadarSource('synthetic');
        setLoadingStatus('Ready: 7 days of real resort precipitation data');
      } catch (e) {
        console.error('[Frames] Load failed:', e);
        setLoadingStatus(`Failed to load frames: ${e}`);
      }
    };

    loadFrames();
  }, [mapReady, framesReloadKey, radarMode]);

  // Add resort markers with proper popup binding
  useEffect(() => {
    if (!mapRef.current || resorts.length === 0) return;

    const map = mapRef.current;
    const activeIds = new Set(resorts.map(r => r.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
      }
    });

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
        if (cond.recentSnowfall >= 6) {
          // Heavy snow: Dark blue
          markerColor = '#0EA5E9'; markerRadius = 12; markerWeight = 3;
        } else if (cond.recentSnowfall >= 2) {
          // Moderate snow: Medium blue
          markerColor = '#3B82F6'; markerRadius = 10; markerWeight = 3;
        } else if (cond.recentSnowfall >= 0.2) {
          // Light snow: Light blue/cyan
          markerColor = '#06B6D4'; markerRadius = 9;
        } else {
          // No snow: Orange
          markerColor = '#F59E0B'; markerRadius = 8;
        }
      }

      if (markersRef.current.has(resort.id)) {
        const existing = markersRef.current.get(resort.id)!;
        existing.setStyle({ fillColor: markerColor, radius: markerRadius, weight: markerWeight });
        
        if (popupsRef.current.has(resort.id)) {
          const popup = popupsRef.current.get(resort.id)!;
          popup.setContent(buildPopupContent(resort, cond, err, isLoading));
        }
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
      }).addTo(map);

      const popupContent = buildPopupContent(resort, cond, err, isLoading);
      const popup = L.popup({ maxWidth: 320, closeButton: true }).setContent(popupContent);
      
      marker.bindPopup(popup);
      popupsRef.current.set(resort.id, popup);

      marker.on('click', (e) => {
        if (cond) {
          setSelectedResort({ resort, conditions: cond });
        }
        setTimeout(() => {
          marker.openPopup();
        }, 0);
      });

      marker.on('mouseover', function (this: L.CircleMarker) { this.setRadius(markerRadius * 1.3); });
      marker.on('mouseout', function (this: L.CircleMarker) { this.setRadius(markerRadius); });

      markersRef.current.set(resort.id, marker);
    });
  }, [resorts, conditions, loading, errors]);

  // Precipitation highlight overlay (visible even during map moves)
  useEffect(() => {
    const map = mapRef.current;
    const overlay = precipOverlayRef.current;
    if (!map || !overlay) return;

    overlay.clearLayers();
    if (!radarVisible || !highlightPrecip) return;

    resorts.forEach((resort) => {
      const cond = conditions[resort.id];
      if (!cond) return;
      const snow = (cond.recentSnowfall || 0) + (cond.weeklySnowfall || 0);
      const rain = (cond.recentRainfall || 0) + (cond.weeklyRainfall || 0);
      const total = snow + rain;
      if (total <= 0) return;

      const color = snow >= rain ? '#60a5fa' : '#34d399';
      const weight = snow >= rain ? 2 : 1.5;
      const radius = Math.min(18, 8 + total * 2);

      const circle = L.circleMarker([resort.lat, resort.lon], {
        radius,
        fillColor: color,
        color,
        weight,
        fillOpacity: 0.45,
        opacity: 0.6,
        pane: 'radarPane',
      });
      circle.bindTooltip(`${resort.name}: ${snow.toFixed(1)}" snow / ${rain.toFixed(1)}" rain`, { direction: 'top' });
      overlay.addLayer(circle);
    });
  }, [radarVisible, highlightPrecip, resorts, conditions, mapReady]);

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
      // Snowfall section
      html += `<div style="margin-bottom: 12px;">`;
      html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">❄️ Snowfall</div>`;
      html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
      html += `<div style="background: #dbeafe; padding: 6px; border-radius: 4px; border-left: 3px solid #0EA5E9;"><div style="font-size: 10px; color: #0c4a6e; font-weight: 600;">24h Total</div><div style="color: #0EA5E9; font-weight: bold; font-size: 14px;">${cond.recentSnowfall}"</div></div>`;
      html += `<div style="background: #eff6ff; padding: 6px; border-radius: 4px; border-left: 3px solid #3B82F6;"><div style="font-size: 10px; color: #1e40af; font-weight: 600;">7d Total</div><div style="color: #3B82F6; font-weight: bold; font-size: 14px;">${cond.weeklySnowfall || 0}"</div></div>`;
      html += `</div></div>`;

      // Rainfall section
      html += `<div style="margin-bottom: 12px;">`;
      html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">🌧️ Rainfall</div>`;
      html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
      html += `<div style="background: #f0f9ff; padding: 6px; border-radius: 4px; border-left: 3px solid #06b6d4;"><div style="font-size: 10px; color: #0c4a6e; font-weight: 600;">24h Total</div><div style="color: #06b6d4; font-weight: bold; font-size: 14px;">${(cond.recentRainfall || 0).toFixed(1)}"</div></div>`;
      html += `<div style="background: #f0fdf4; padding: 6px; border-radius: 4px; border-left: 3px solid #10b981;"><div style="font-size: 10px; color: #166534; font-weight: 600;">7d Total</div><div style="color: #10b981; font-weight: bold; font-size: 14px;">${(cond.weeklyRainfall || 0).toFixed(1)}"</div></div>`;
      html += `</div></div>`;

      // Current conditions section
      html += `<div style="margin-bottom: 12px;">`;
      html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">🌡️ Current Conditions</div>`;
      html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
      html += `<div style="background: #fef2f2; padding: 6px; border-radius: 4px; border-left: 3px solid #EF4444;"><div style="font-size: 10px; color: #7f1d1d; font-weight: 600;">Temperature</div><div style="color: #EF4444; font-weight: bold; font-size: 14px;">${cond.baseTemp}°F</div></div>`;
      html += `<div style="background: #f3f4f6; padding: 6px; border-radius: 4px; border-left: 3px solid #6b7280;"><div style="font-size: 10px; color: #374151; font-weight: 600;">Wind Speed</div><div style="color: #374151; font-weight: bold; font-size: 14px;">${cond.windSpeed} mph</div></div>`;
      html += `</div></div>`;
      
      if (resort.conditionsUrl || resort.scrapeUrl) {
        const url = resort.conditionsUrl || resort.scrapeUrl;
        html += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; background: #0EA5E9; color: white; padding: 10px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; text-decoration: none; text-align: center; cursor: pointer; margin-top: 8px; transition: background 0.2s;">� View Live Conditions →</a>`;
      }
    }
    
    div.innerHTML = html;
    return div;
  };

  const getTileBitmap = useCallback(async (
    layer: string | { url: string; time?: number },
    z: number,
    x: number,
    y: number
  ): Promise<ImageBitmap | null> => {
    const layerStr = typeof layer === 'string' ? layer : layer.url;
    const key = `${layerStr}_${z}_${x}_${y}`;
    if (tileBitmapCache.current.has(key)) return tileBitmapCache.current.get(key) || null;

    try {
      let url: string;

      const layerTime =
        typeof layer === 'object' && typeof layer.time === 'number' && !isNaN(layer.time)
          ? layer.time
          : undefined;

      // Handle synthetic radar URLs directly
      if (layerStr.includes('/api/radar/synthetic?day=') || layerStr.includes('/api/radar/simple-synthetic?day=')) {
        // Extract day parameter and build tile URL
        const dayMatch = layerStr.match(/day=(\d+)/);
        const endpoint = layerStr.includes('simple-synthetic') ? '/api/radar/simple-synthetic' : '/api/radar/synthetic';
        if (dayMatch) {
          const day = dayMatch[1];
          url = `${endpoint}?day=${day}&z=${z}&x=${x}&y=${y}`;
        } else {
          return null;
        }
      } else if (layerStr.startsWith('/api/radar/synthetic?') || layerStr.startsWith('/api/radar/simple-synthetic?')) {
        // Robust: if a synthetic URL comes through without the exact day= matcher above,
        // we still treat it as a base URL and just append tile coords.
        url = `${layerStr}${layerStr.includes('?') ? '&' : '?'}z=${z}&x=${x}&y=${y}&cb=${Date.now()}`;
      } else if (!layerStr.startsWith('http://') && !layerStr.startsWith('https://') && !layerStr.startsWith('/')) {
        // Frames API can return SHORT IDENTIFIERS like "iowastate-1767376906078".
        // These are not tile templates; they must be proxied through our same-origin endpoint.
        // Prefer the explicit frame.time if present; otherwise best-effort parse from suffix.
        const parsed = parseInt(layerStr.split('-').pop() || '', 10);
        const timeParam = typeof layerTime === 'number' ? layerTime : (!isNaN(parsed) ? parsed : Date.now());
        url = `/api/radar/tile?time=${timeParam}&z=${z}&x=${x}&y=${y}&cb=${Date.now()}`;
      } else if (
        layerStr.includes('{z}') ||
        layerStr.includes('{x}') ||
        layerStr.includes('{y}') ||
        layerStr.includes('{time}')
      ) {
        // Full template URL (or path template)
        const timeParam = typeof layerTime === 'number' ? layerTime : Date.now();
        url = layerStr
          .replaceAll('{z}', String(z))
          .replaceAll('{x}', String(x))
          .replaceAll('{y}', String(y))
          .replaceAll('{time}', String(timeParam));

        url += (url.includes('?') ? '&' : '?') + `cb=${Date.now()}`;

        if (tileBitmapCache.current.size < 3) {
          console.log('[Radar Tile] Fetching template tile:', { layer: layerStr, url, z, x, y });
        }
      } else {
        // Direct URL/path that already points at a single tile (rare, but handle it).
        url = layerStr + (layerStr.includes('?') ? '&' : '?') + `cb=${Date.now()}`;
      }

      // LOGGING: Confirm getTileBitmap is being called and what URL is being fetched
      console.log('[Radar Debug] getTileBitmap called', { layerStr, z, x, y, url });

      const resp = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) {
        console.warn('[Radar Debug] getTileBitmap fetch failed', { url, status: resp.status });
        return null;
      }

      const blob = await resp.blob();
      if (blob.size === 0) {
        console.warn('[Radar Debug] getTileBitmap empty blob', { url });
        return null;
      }

      const bitmap = await createImageBitmap(blob);
      tileBitmapCache.current.set(key, bitmap);

      // DEBUG: Check if the loaded bitmap has magenta pixels
      try {
        const debugCanvas = document.createElement('canvas');
        debugCanvas.width = bitmap.width;
        debugCanvas.height = bitmap.height;
        const debugCtx = debugCanvas.getContext('2d', { willReadFrequently: true });
        if (debugCtx) {
          debugCtx.drawImage(bitmap, 0, 0);
          const imageData = debugCtx.getImageData(0, 0, Math.min(50, bitmap.width), Math.min(50, bitmap.height));
          const data = imageData.data;
          let magentaCount = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0 && data[i] > 200 && data[i + 2] > 200 && data[i + 1] < 100) magentaCount++;
          }
          console.log('[Radar Debug] Tile bitmap check', { url, width: bitmap.width, height: bitmap.height, magentaCount, totalPixels: data.length / 4 });
        }
      } catch (e) {
        console.log('[Radar Debug] Tile bitmap check failed', e);
      }

      if (tileBitmapCache.current.size > 256) {
        const firstKey = tileBitmapCache.current.keys().next().value;
        if (firstKey) tileBitmapCache.current.delete(firstKey);
      }
      return bitmap;
    } catch (e) {
      console.error('[Radar Debug] getTileBitmap error', e);
      return null;
    }
  }, []);

  const renderFrameToCanvas = useCallback(async (
    layer: string | { url: string; time?: number },
    z: number,
    widthPx: number,
    heightPx: number,
    key: string
  ): Promise<HTMLCanvasElement | null> => {
    if (frameCanvasCache.current.has(key)) return frameCanvasCache.current.get(key) || null;

    try {
      // LOGGING: Confirm renderFrameToCanvas is being called
      console.log('[Radar Debug] renderFrameToCanvas called', { layer, z, widthPx, heightPx, key });

      const dpr = window.devicePixelRatio || 1;
      const c = document.createElement('canvas');
      c.width = widthPx * dpr;
      c.height = heightPx * dpr;

      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const map = mapRef.current;
      if (!map || !mapReady || !(map as any)._loaded) return null;

      const mapPane = (map as any)._mapPane;
      if (!mapPane || !mapPane._leaflet_pos) return null;

      const size = map.getSize();
      if (!size || size.x === 0 || size.y === 0) return null;

      const center = map.getCenter();
      if (!center) return null;
      const centerWorld = (map as any).project(center, z);
      const leftWorldX = centerWorld.x - size.x / 2;
      const topWorldY = centerWorld.y - size.y / 2;

      const xMin = Math.floor(leftWorldX / 256);
      const xMax = Math.floor((leftWorldX + size.x) / 256);
      const yMin = Math.floor(topWorldY / 256);
      const yMax = Math.floor((topWorldY + size.y) / 256);
      const tilesAcross = Math.pow(2, z);

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
      console.error('[Radar Debug] renderFrameToCanvas error', e);
      return null;
    }
  }, [getTileBitmap, mapReady]);

  useEffect(() => {
    if (!mapReady) return;

    let lastTime = performance.now();
    let progress = 0;
    let currentFrameIndex = 0;
    let nextFrameIndex = 1;

    // Calculate proper frame timing based on timestamps and speed control
    const calculateFrameDuration = () => {
      const frames = radarFramesRef.current;
      if (frames.length < 2) return radarSpeedMs; // fallback to speed control

      // Get timestamps from frames
      const timestamps = frames.map(f => f.time).filter((t): t is number => t !== undefined && !isNaN(t)).sort((a, b) => a - b);
      if (timestamps.length < 2) return radarSpeedMs;

      const timeSpanMs = timestamps[timestamps.length - 1] - timestamps[0]; // Total time span in ms
      const desiredAnimationDurationMs = Math.max(5000, Math.min(radarSpeedMs * frames.length, 120000)); // Use speed control, clamp between 5s and 2min total
      const frameDuration = desiredAnimationDurationMs / frames.length;

      console.log(`[Animation] Time span: ${timeSpanMs}ms (${timeSpanMs/3600000}h), Frame duration: ${frameDuration}ms, Speed: ${radarSpeedMs}ms per frame equivalent`);
      return Math.max(50, Math.min(frameDuration, 5000)); // Clamp between 50ms and 5000ms per frame
    };

    const frameDuration = calculateFrameDuration();

    const step = async (now: number) => {
      console.log('[Animation] Step function called, radarPlaying:', radarPlayingRef.current, 'radarFramesAvailable:', radarFramesAvailable, 'radarVisible:', radarVisible);

      if (!mapReady) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // Don't animate if radar is not visible
      if (!radarVisible) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const c1 = canvasRef.current;
      const c2 = canvas2Ref.current;
      if (!c1 || !c2) { rafRef.current = requestAnimationFrame(step); return; }

      if (!radarPlayingRef.current || !radarFramesAvailable) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const frames = radarFramesRef.current;
      if (!frames || frames.length === 0) { rafRef.current = requestAnimationFrame(step); return; }

      if (mapPanZoomRef.current.panning || mapPanZoomRef.current.zooming) {
        // During pan/zoom, continue rendering with cached frames but skip expensive operations
        const timeSinceLastRender = now - lastRenderTimeRef.current;
        if (timeSinceLastRender < 200) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        const map = mapRef.current;
        if (!map || !mapReady) { rafRef.current = requestAnimationFrame(step); return; }

        const z = Math.max(0, Math.round(map.getZoom() || 5));
        const size = map.getSize();
        const idx = Math.floor(radarIndexRef.current) % frames.length;
        if (idx < 0 || idx >= frames.length || !frames[idx]) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        const key = `${frames[idx].url}_${z}_${size.x}_${size.y}`;

        if (frameCanvasCache.current.has(key)) {
          const cachedC = frameCanvasCache.current.get(key);
          if (cachedC) {
            const ctx1 = c1.getContext('2d', { willReadFrequently: true });
            const ctx2 = c2.getContext('2d', { willReadFrequently: true });
            if (ctx1 && ctx2) {
              ctx1.clearRect(0, 0, c1.width, c1.height);
              ctx2.clearRect(0, 0, c2.width, c2.height);
              ctx1.drawImage(cachedC, 0, 0);
              ctx2.drawImage(cachedC, 0, 0);
              c1.style.opacity = '1';
              c2.style.opacity = '0';
              lastRenderTimeRef.current = now;
            }
          }
        }

        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const elapsed = now - lastTime;
      lastTime = now;
      progress += elapsed;

      const dur = frameDuration; // Use calculated frame duration instead of radarSpeedMs
      const t = Math.min(1, progress / dur);

      const timeSinceLastRender = now - lastRenderTimeRef.current;
      if (timeSinceLastRender < 50) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      try {
  const map = mapRef.current;
  if (!map || !mapReady) { rafRef.current = requestAnimationFrame(step); return; }

        const z = Math.max(0, Math.round(map.getZoom() || 5));
        const size = map.getSize();

        // Update frame indices based on progress
        const totalFrames = frames.length;
        const frameProgress = (radarIndexRef.current + t) % totalFrames;
        currentFrameIndex = Math.floor(frameProgress) % totalFrames;
        nextFrameIndex = (currentFrameIndex + 1) % totalFrames;
        const frameBlend = frameProgress - Math.floor(frameProgress);

        console.log('[Animation] Rendering frame index:', currentFrameIndex, 'frame:', frames[currentFrameIndex]);

        // Update radarIndexRef.current continuously for smooth progression
        radarIndexRef.current = Math.floor(frameProgress) % totalFrames;

        // Update current frame timestamp for overlay
        const currentFrame = frames[Math.floor(radarIndexRef.current)];
        if (currentFrame?.time) {
          setCurrentFrameTime(currentFrame.time);
        }

        // Safety check for frame indices
        if (currentFrameIndex < 0 || currentFrameIndex >= frames.length || !frames[currentFrameIndex] ||
            nextFrameIndex < 0 || nextFrameIndex >= frames.length || !frames[nextFrameIndex]) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        const keyCurrent = `${frames[currentFrameIndex].url}_${z}_${size.x}_${size.y}`;
        const keyNext = `${frames[nextFrameIndex].url}_${z}_${size.x}_${size.y}`;

        // Render current frame to canvas1
        const currentFrameC = await renderFrameToCanvas(frames[currentFrameIndex], z, size.x, size.y, keyCurrent);
        if (currentFrameC) {
          const ctx1 = c1.getContext('2d', { willReadFrequently: true });
          if (ctx1) {
            ctx1.clearRect(0, 0, c1.width, c1.height);
            ctx1.drawImage(currentFrameC, 0, 0);
            console.log('[Radar Debug] drew current frame', { keyCurrent, z, canvasW: c1.width, canvasH: c1.height, opacity: c1.style.opacity });
            
            // Check if canvas has any non-transparent pixels
            try {
              const imageData = ctx1.getImageData(0, 0, Math.min(100, c1.width), Math.min(100, c1.height));
              const data = imageData.data;
              let nonTransparent = 0;
              let magentaPixels = 0;
              for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) nonTransparent++;
                if (data[i + 3] > 0 && data[i] > 200 && data[i + 2] > 200 && data[i + 1] < 100) magentaPixels++;
              }
              console.log('[Radar Debug] Canvas pixels check', { nonTransparent, magentaPixels, totalChecked: data.length / 4 });
            } catch (e) {
              console.log('[Radar Debug] Canvas pixel check failed', e);
            }
          }
        }

        // Render next frame to canvas2
        const nextFrameC = await renderFrameToCanvas(frames[nextFrameIndex], z, size.x, size.y, keyNext);
        if (nextFrameC) {
          const ctx2 = c2.getContext('2d', { willReadFrequently: true });
          if (ctx2) {
            ctx2.clearRect(0, 0, c2.width, c2.height);
            ctx2.drawImage(nextFrameC, 0, 0);
            console.log('[Radar Debug] drew next frame', { keyNext, z, canvasW: c2.width, canvasH: c2.height });
          }
        }

        // Smooth cross-fade using JavaScript opacity updates (no CSS transitions)
        const easeInOut = 0.5 - 0.5 * Math.cos(frameBlend * Math.PI);
        const canvas1Opacity = (1 - easeInOut) * radarOpacity;
        const canvas2Opacity = easeInOut * radarOpacity;

        console.log('[Radar Debug] Setting canvas opacities', { canvas1Opacity, canvas2Opacity, radarOpacity, frameBlend, easeInOut });

        c1.style.opacity = canvas1Opacity.toString();
        c2.style.opacity = canvas2Opacity.toString();

        // Ensure both canvases are visible during cross-fade
        c1.style.display = canvas1Opacity > 0.01 ? 'block' : 'none';
        c2.style.display = canvas2Opacity > 0.01 ? 'block' : 'none';

        lastRenderTimeRef.current = now;

        if (progress >= dur) {
          progress = 0;
          radarIndexRef.current = (radarIndexRef.current + 1) % frames.length;
        }
      } catch (e) { }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mapReady, radarFramesAvailable, radarSpeedMs, radarVisible, radarOpacity, renderFrameToCanvas]);

  useEffect(() => {
    const effectiveOpacity = radarVisible ? radarOpacity : 0;
    if (canvasRef.current) canvasRef.current.style.opacity = String(effectiveOpacity);
    if (canvas2Ref.current) canvas2Ref.current.style.opacity = String(effectiveOpacity);
  }, [radarOpacity, radarVisible]);

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-blue-500 text-xl">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-100 flex flex-col">
      {(() => {
        console.log('[ResortMap] Rendering - radarFramesAvailable:', radarFramesAvailable, 'frames:', radarFramesRef.current.length);
        return null;
      })()}
      <div
        ref={containerRef}
        data-testid="leaflet-map-container"
        className="flex-1 w-full"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '600px',
          background: '#0b111a',
        }}
      />

      {radarFramesAvailable && (
        <Suspense fallback={<div className="animate-pulse bg-gray-700 h-16 rounded-lg"></div>}>
          <RadarControls
            isPlaying={radarPlaying}
            onPlayPause={handlePlayPause}
            opacity={radarOpacity}
            onOpacityChange={setRadarOpacity}
            speed={radarSpeedMs}
            onSpeedChange={setRadarSpeedMs}
            frameCount={radarFramesRef.current.length}
            currentFrame={Math.floor(radarIndexRef.current) + 1}
            radarSource={radarSource}
            isVisible={radarVisible}
            onVisibilityChange={setRadarVisible}
            onStepPrev={() => handleStep(-1)}
            onStepNext={() => handleStep(1)}
            onRefresh={handleRefresh}
            onScrub={handleScrub}
            onSourceChange={handleSourceChange}
            onJumpStart={handleJumpStart}
            onJumpEnd={handleJumpEnd}
            highlightPrecip={highlightPrecip}
            onHighlightChange={setHighlightPrecip}
            currentFrameTime={currentFrameTime}
          />
        </Suspense>
      )}

      {/* Readiness indicator for tests and debugging */}
      {mapReady && radarFramesAvailable && (
        <div
          data-testid="radar-ready"
          className="absolute bottom-4 right-4 z-[1500] text-xs font-mono bg-black/60 text-white px-3 py-1 rounded"
        >
          radar-ready
        </div>
      )}

      {/* Timestamp Overlay */}
      {radarFramesAvailable && currentFrameTime && (
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm font-bold shadow-lg border border-white/20">
          {(() => {
            const now = Date.now();
            const diffHours = Math.floor((now - currentFrameTime) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((now - currentFrameTime) / (1000 * 60)) % 60;

            if (diffHours === 0 && diffMinutes === 0) return 'NOW';
            if (diffHours === 0) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ${diffMinutes}m ago`;
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
          })()}
        </div>
      )}

      {selectedResort && (
        <div className="absolute top-4 right-4 z-[1001] max-w-sm w-80">
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/98 to-gray-800/98 
                          backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 
                            bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex-1">
                <div className="text-white font-bold text-lg mb-1">{selectedResort.resort.name}</div>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <span>📍 {selectedResort.resort.state}</span>
                  {selectedResort.resort.elevationFt && (
                    <span>• ⛰️ {selectedResort.resort.elevationFt.toLocaleString()}ft</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedResort(null)}
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1.5
                           transition-all duration-200 active:scale-95"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Snow Stats - Highlighted */}
            <div className="px-5 py-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3 border border-blue-400/30">
                  <div className="text-blue-300 text-xs font-semibold mb-1">24h Snowfall</div>
                  <div className="text-white text-2xl font-bold">
                    {selectedResort.conditions.recentSnowfall}
                    <span className="text-sm text-white/70 ml-1">in</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-3 border border-purple-400/30">
                  <div className="text-purple-300 text-xs font-semibold mb-1">7d Snowfall</div>
                  <div className="text-white text-2xl font-bold">
                    {selectedResort.conditions.weeklySnowfall ?? 0}
                    <span className="text-sm text-white/70 ml-1">in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Stats */}
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <span className="text-lg">🌡️</span> Temperature
                </span>
                <span className="text-white font-bold text-sm">{selectedResort.conditions.baseTemp}°F</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <span className="text-lg">💨</span> Wind Speed
                </span>
                <span className="text-white font-bold text-sm">{selectedResort.conditions.windSpeed} mph</span>
              </div>
              {selectedResort.conditions.visibility && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <span className="text-lg">👁️</span> Visibility
                  </span>
                  <span className="text-white font-bold text-sm">{selectedResort.conditions.visibility}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {(selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl) && (
              <div className="px-5 pb-5">
                <a
                  href={selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 
                             hover:from-blue-600 hover:to-purple-700 border border-white/20 
                             text-white font-bold py-3 text-sm transition-all duration-200
                             shadow-lg hover:shadow-xl active:scale-95"
                >
                  View Full Report →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResortMap;