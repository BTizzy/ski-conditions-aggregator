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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  const [radarPlaying, setRadarPlaying] = useState(true);
  const [debugSimEnabled, setDebugSimEnabled] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  const [radarFramesAvailable, setRadarFramesAvailable] = useState(false);
  const radarFramesRef = useRef<number[]>([]);
  const displayFramesRef = useRef<number[]>([]);
  const tileBitmapCache = useRef<Map<string, ImageBitmap>>(new Map());
  const frameCanvasCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const radarPlayingRef2 = useRef<boolean>(true);
  const [radarPlaying2, setRadarPlaying2] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(500);
  const radarIndexRef = useRef<number>(0);
  const [selectedWindowHours, setSelectedWindowHours] = useState<number>(24);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.85);
  const [radarStyleEnabled, setRadarStyleEnabled] = useState<boolean>(true);
  const [currentRadarTime, setCurrentRadarTime] = useState<number | null>(null);

  const drawSimOnCtx = (ctx: CanvasRenderingContext2D, frameIndex: number, w: number, h: number) => {
    try {
      ctx.clearRect(0, 0, w, h);
      ctx.save(); ctx.fillStyle = 'rgba(255,0,0,1)'; ctx.fillRect(2, 2, 6, 6); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = '#072b44'; ctx.fillRect(0, 0, w, h); ctx.restore();
      const t = frameIndex * 0.05;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = ((frameIndex * (2 + i)) % (w + 200)) - 100;
        const y = (h * (i + 1) / 7) + Math.sin(t * (0.7 + i * 0.12)) * 18;
        const g = ctx.createLinearGradient(x - 90, y, x + 160, y);
        g.addColorStop(0, 'rgba(60,160,255,0)');
        g.addColorStop(0.35, 'rgba(70,190,255,0.5)');
        g.addColorStop(1, 'rgba(60,160,255,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 90, y - 20, 260, 40);
      }
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      // ignore
    }
  };
  // map and markers refs
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const createdMapRef = useRef<boolean>(false);

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
    return new L.Icon({ iconUrl: 'data:image/svg+xml;base64,' + btoa(svg), iconSize: [28, 36], iconAnchor: [14, 34], popupAnchor: [0, -30] });
  };

  // Initialize (or reuse) leaflet map and ensure canvas pane exists
  useEffect(() => {
    if (!mapDivRef.current) return;
    const globalAny = window as any;
    // For robustness during HMR / StrictMode we always tear down any existing map instance and create fresh.
    if (globalAny.__resortMapInstance) {
      try { globalAny.__resortMapInstance.remove(); } catch (e) { /* ignore */ }
      try { delete globalAny.__resortMapInstance; delete globalAny.__resortMapInitialized; } catch (e) {}
      mapRef.current = null;
    }

    if (!mapRef.current) {
      // create map with wheel zoom disabled initially to avoid mid-mount wheel events
      const map = L.map(mapDivRef.current, { center: [44, -72], zoom: 7, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
      mapRef.current = map;
      createdMapRef.current = true;
      try { globalAny.__resortMapInstance = map; globalAny.__resortMapInitialized = true; } catch (e) {}
      // ensure proper sizing after mount and enable wheel zoom when size stabilizes
      setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 200);
      const enableWheelWhenReady = () => {
        try {
          const size = map.getSize();
          if (size && size.x > 0 && size.y > 0) {
            try { (map as any).scrollWheelZoom && (map as any).scrollWheelZoom.enable && (map as any).scrollWheelZoom.enable(); } catch (e) {}
            return;
          }
        } catch (e) {}
        setTimeout(enableWheelWhenReady, 200);
      };
      setTimeout(enableWheelWhenReady, 300);
    }

    const map = mapRef.current as L.Map;
    try {
      if (!map.getPane('radarPane')) map.createPane('radarPane');
      const pane = map.getPane('radarPane') as HTMLElement; pane.style.zIndex = '480'; pane.style.pointerEvents = 'none'; try { pane.style.mixBlendMode = 'screen'; } catch (e) {}
      try { const mPane = map.getPane('markerPane') as HTMLElement; if (mPane) { mPane.style.zIndex = '700'; } } catch (e) {}

        if (!canvasRef.current) {
        const c = document.createElement('canvas'); c.id = 'radar-sim-canvas'; c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0'; c.style.width = '100%'; c.style.height = '100%'; c.style.pointerEvents = 'none';
        c.style.opacity = String(radarOpacity);
        if (radarStyleEnabled) { c.style.filter = 'contrast(140%) saturate(160%) hue-rotate(-6deg) drop-shadow(0 0 6px rgba(0,0,0,0.12))'; }
          pane.appendChild(c); canvasRef.current = c; setCanvasReady(true);
          const resize = () => { try { const s = map.getSize(); c.width = Math.max(256, s.x * devicePixelRatio); c.height = Math.max(256, s.y * devicePixelRatio); c.style.width = `${s.x}px`; c.style.height = `${s.y}px`; const ctx = c.getContext('2d'); if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); } catch (e) {} };
          map.on('resize move zoom', resize); resize();
          // cleanup: remove resize handler when component unmounts
          const offResize = () => { try { map.off('resize move zoom', resize); } catch (e) {} };
          // attach cleanup to createdMapRef removal path via a timeout guard in case of HMR
          setTimeout(() => { if (!mapRef.current) offResize(); }, 1000);
      }
    } catch (e) {
      console.debug('[ResortMap] pane/canvas setup failed', e);
    }

    return () => {
      try { if (markerLayerRef.current) { markerLayerRef.current.clearLayers(); markerLayerRef.current.remove(); markerLayerRef.current = null; } } catch (e) {}
      try { if (canvasRef.current && canvasRef.current.parentNode) { canvasRef.current.parentNode.removeChild(canvasRef.current); } } catch (e) {}
      try { setCanvasReady(false); } catch(e) {}
      try { if (mapRef.current && createdMapRef.current) { mapRef.current.remove(); } } catch (e) {}
      try { if (globalAny && globalAny.__resortMapInstance) { delete globalAny.__resortMapInstance; delete globalAny.__resortMapInitialized; } } catch (e) {}
      mapRef.current = null;
      canvasRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapDivRef.current]);

  // Global error hook to capture Leaflet runtime errors for debugging
  useEffect(() => {
    const onErr = (ev: ErrorEvent) => {
      try {
        console.error('[GLOBAL ERROR]', ev.error || ev.message, ev);
        fetch('/api/radar/debug-pixel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'global_error', message: (ev.error && ev.error.stack) || ev.message, filename: ev.filename, lineno: ev.lineno, colno: ev.colno }) });
      } catch (e) {}
    };
    const onRej = (ev: PromiseRejectionEvent) => {
      try { console.error('[UNHANDLED REJECTION]', ev.reason); fetch('/api/radar/debug-pixel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'unhandled_rejection', reason: String(ev.reason) }) }); } catch (e) {}
    };
    window.addEventListener('error', onErr as EventListener);
    window.addEventListener('unhandledrejection', onRej as EventListener);
    return () => { window.removeEventListener('error', onErr as EventListener); window.removeEventListener('unhandledrejection', onRej as EventListener); };
  }, []);

  // Update markers whenever resorts change (keeps markers in sync and avoids recreating map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers(); markerLayerRef.current.remove(); markerLayerRef.current = null;
      }
      const mg = L.layerGroup();
      for (const r of resorts) {
        try {
          const m = L.marker([r.lat, r.lon], { icon: createCustomIcon(null as any) });
          let popupHtml = `<b>${r.name}</b><div>${r.state}</div>`;
          if (typeof conditions === 'object' && conditions[r.id]) {
            const c = conditions[r.id];
            popupHtml += `<div style='margin-top:6px;font-size:13px;'>`;
            if (c.snowDepth !== undefined) popupHtml += `<b>Snow Depth:</b> ${c.snowDepth} in<br/>`;
            if (c.recentSnowfall !== undefined) popupHtml += `<b>24h Snow:</b> ${c.recentSnowfall} in<br/>`;
            if (c.weeklySnowfall !== undefined) popupHtml += `<b>7d Snow:</b> ${c.weeklySnowfall} in<br/>`;
            if (c.rawData && c.rawData.model && c.rawData.model.weeklyRainIn !== undefined) popupHtml += `<b>7d Rain:</b> ${c.rawData.model.weeklyRainIn} in<br/>`;
            if (c.baseTemp !== undefined) popupHtml += `<b>Base Temp:</b> ${c.baseTemp}&deg;F<br/>`;
            if (c.windSpeed !== undefined) popupHtml += `<b>Wind:</b> ${c.windSpeed} mph<br/>`;
            if (c.visibility !== undefined) popupHtml += `<b>Visibility:</b> ${c.visibility}<br/>`;
            popupHtml += c.timestamp ? `<span style='color:#888;'>${new Date(c.timestamp).toLocaleString()}</span>` : '';
            popupHtml += `</div>`;
          }
          m.bindPopup(popupHtml);
          mg.addLayer(m);
        } catch (e) { console.debug('[ResortMap] failed to add marker', r, e); }
      }
      mg.addTo(map);
      markerLayerRef.current = mg;
    } catch (e) {
      console.debug('[ResortMap] marker setup failed', e);
    }
  }, [canvasReady, JSON.stringify(resorts), JSON.stringify(conditions)]);

  // Load radar frames list from RainViewer and store times
  const loadRadarFrames = async () => {
    try {
      const res = await fetch('/api/radar/frames');
      if (!res.ok) throw new Error('frames fetch failed');
      const j = await res.json();
      const past = (j && j.radar && j.radar.past) || [];
  const times = past.map((f: any) => (f && (f.time || f)) || 0).filter(Boolean); // full list
      radarFramesRef.current = times;
  setRadarFramesAvailable(times.length > 0);
  // build display frames for current window
  updateDisplayFrames(selectedWindowHours);
      return times;
    } catch (e) {
      console.debug('[RADAR] loadRadarFrames failed', e);
      radarFramesRef.current = [];
      setRadarFramesAvailable(false);
      return [] as number[];
    }
  };

  const updateDisplayFrames = (hours: number) => {
    const now = Date.now();
    const cutoff = now - hours * 3600 * 1000;
    const frames = (radarFramesRef.current || []).filter((t) => t >= cutoff);
    // ensure at least some frames (fallback to last N)
    const out = frames.length > 0 ? frames : (radarFramesRef.current.slice(-Math.max(24, Math.min(72, Math.floor(hours)))));
    displayFramesRef.current = out;
    radarIndexRef.current = Math.max(0, out.length - 1);
    setRadarFramesAvailable(out.length > 0);
    setCurrentRadarTime(out.length > 0 ? out[radarIndexRef.current] : null);
  };

  // Fetch tile image and return ImageBitmap (cached)
  const getTileBitmap = async (time: number, z: number, x: number, y: number) => {
    const key = `${time}_${z}_${x}_${y}`;
    const cache = tileBitmapCache.current;
    if (cache.has(key)) return cache.get(key) as ImageBitmap;
    try {
      const url = `/api/radar/tile?time=${encodeURIComponent(time)}&z=${z}&x=${x}&y=${y}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('tile fetch failed');
      const blob = await r.blob();
      const bitmap = await createImageBitmap(blob);
      cache.set(key, bitmap);
      // simple cache eviction after some size
      if (cache.size > 512) {
        const it = cache.keys(); const k = it.next().value as string | undefined; if (k) cache.delete(k);
      }
      return bitmap;
    } catch (e) {
      console.debug('[RADAR] getTileBitmap failed', e);
      return null;
    }
  };

  // Draw one radar frame (composite tiles) onto the overlay canvas
  const drawRadarFrame = async (time: number, ctx: CanvasRenderingContext2D) => {
    const map = mapRef.current; if (!map) return;
    try {
      const z = Math.max(0, Math.round(map.getZoom() || 5));
      const size = map.getSize();
      const key = `${time}_${z}_${size.x}_${size.y}`;
      const fc = await renderFrameToCanvas(time, z, size.x, size.y, key);
      if (!fc) return;
      // draw onto target ctx (fc is device-pixel sized)
      try { ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height); ctx.drawImage(fc, 0, 0); } catch (e) { console.debug('[RADAR] draw image failed', e); }
    } catch (e) { console.debug('[RADAR] drawRadarFrame failed', e); }
  };

  const renderFrameToCanvas = async (time: number, z: number, widthPx: number, heightPx: number, key: string) => {
    const cache = frameCanvasCache.current;
    if (cache.has(key)) return cache.get(key) as HTMLCanvasElement;
    try {
      const c = document.createElement('canvas'); c.width = Math.round(widthPx * devicePixelRatio); c.height = Math.round(heightPx * devicePixelRatio); c.style.width = `${widthPx}px`; c.style.height = `${heightPx}px`;
      const ctx = c.getContext('2d'); if (!ctx) return null;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const map = mapRef.current; if (!map) return null;
      const size = map.getSize(); const halfX = size.x/2; const halfY = size.y/2;
      const center = map.getCenter(); const centerWorld = (map as any).project(center, z);
      const leftWorldX = centerWorld.x - halfX;
      const topWorldY = centerWorld.y - halfY;
      const xMin = Math.floor(leftWorldX/256); const xMax = Math.floor((leftWorldX+size.x)/256);
      const yMin = Math.floor(topWorldY/256); const yMax = Math.floor((topWorldY+size.y)/256);
      const tilesAcross = Math.pow(2, z);
      for (let tx = xMin; tx <= xMax; tx++) {
        for (let ty = yMin; ty <= yMax; ty++) {
          const wrapX = ((tx % tilesAcross) + tilesAcross) % tilesAcross;
          const wrapY = ty;
          if (wrapY < 0 || wrapY >= tilesAcross) continue;
          const bitmap = await getTileBitmap(time, z, wrapX, wrapY);
          if (!bitmap) continue;
          const tileWorldX = tx * 256;
          const tileWorldY = ty * 256;
          const canvasX = Math.round((tileWorldX - leftWorldX) * devicePixelRatio);
          const canvasY = Math.round((tileWorldY - topWorldY) * devicePixelRatio);
          try { ctx.drawImage(bitmap, canvasX, canvasY, Math.round(256 * devicePixelRatio), Math.round(256 * devicePixelRatio)); } catch (e) { console.debug('[RADAR] draw tile failed', e); }
        }
      }
      cache.set(key, c);
      // simple eviction
      if (cache.size > 64) {
        const it = cache.keys(); const k = it.next().value as string | undefined; if (k) cache.delete(k);
      }
      return c;
    } catch (e) { console.debug('[RADAR] renderFrameToCanvas failed', e); return null; }
  };

  // Playback loop: crossfade between consecutive frames
  useEffect(() => {
    let rafId: number | null = null;
    let lastTime = performance.now();
    let progress = 0;
    let prevIndex = 0;

    const step = async (now: number) => {
      const c = canvasRef.current; if (!c) { rafId = requestAnimationFrame(step); return; }
      const ctx = c.getContext('2d'); if (!ctx) { rafId = requestAnimationFrame(step); return; }
      if (!radarPlayingRef2.current || !radarFramesAvailable || debugSimEnabled) { rafId = requestAnimationFrame(step); return; }
      const elapsed = now - lastTime; lastTime = now; progress += elapsed;
      const dur = radarSpeedMs;
      const t = Math.min(1, progress / dur);
  const frames = displayFramesRef.current.length > 0 ? displayFramesRef.current : radarFramesRef.current;
      if (frames.length === 0) { rafId = requestAnimationFrame(step); return; }
      const idx = radarIndexRef.current % frames.length;
      const nextIdx = (idx + 1) % frames.length;
      // draw prev frame (opaque) and next frame with alpha t to crossfade
      ctx.clearRect(0,0,c.width,c.height);
      try {
        const map = mapRef.current; if (!map) { rafId = requestAnimationFrame(step); return; }
        const z = Math.max(0, Math.round(map.getZoom() || 5));
        const size = map.getSize(); const keyPrev = `${frames[idx]}_${z}_${size.x}_${size.y}`; const keyNext = `${frames[nextIdx]}_${z}_${size.x}_${size.y}`;
        const prevC = await renderFrameToCanvas(frames[idx], z, size.x, size.y, keyPrev);
        const nextC = await renderFrameToCanvas(frames[nextIdx], z, size.x, size.y, keyNext);
        if (prevC) ctx.drawImage(prevC, 0, 0);
        if (nextC) { ctx.globalAlpha = t; ctx.drawImage(nextC, 0, 0); ctx.globalAlpha = 1.0; }
      } catch (e) { console.debug('[RADAR] crossfade draw error', e); }

      if (progress >= dur) {
        progress = 0; radarIndexRef.current = nextIdx; prevIndex = nextIdx; setCurrentRadarTime(frames[radarIndexRef.current]);
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radarFramesAvailable, radarPlaying2, radarSpeedMs, debugSimEnabled]);

  // load frames when map becomes ready
  useEffect(() => {
    let mounted = true;
    (async () => { try { await loadRadarFrames(); if (mounted) setRadarFramesAvailable(radarFramesRef.current.length > 0); } catch(e){} })();
    return () => { mounted = false; };
  }, []);

  // when selected window hours changes, rebuild display frames
  useEffect(() => {
    updateDisplayFrames(selectedWindowHours);
  }, [selectedWindowHours]);

  useEffect(() => {
    const c = canvasRef.current; if (!c || !canvasReady) return; const ctx = c.getContext('2d'); if (!ctx) return; let last = performance.now();
    const loop = (now: number) => { if (radarPlaying && debugSimEnabled) { if (now - last > 80) { frameRef.current = (frameRef.current + 1) % 100000; drawSimOnCtx(ctx, frameRef.current, c.width / devicePixelRatio, c.height / devicePixelRatio); last = now; } } rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop); return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [radarPlaying, debugSimEnabled, canvasReady]);

  const captureVirtual = async () => {
    try {
      const tmp = document.createElement('canvas'); tmp.width = 256; tmp.height = 256; const tctx = tmp.getContext('2d'); if (!tctx) return;
      drawSimOnCtx(tctx, frameRef.current || 0, 256, 256);
      // sample a small region to sanity-check non-transparent pixels
      try {
        const id = tctx.getImageData(0, 0, Math.min(64, tmp.width), Math.min(64, tmp.height)); let non = 0; for (let i = 3; i < id.data.length; i += 4) { if (id.data[i] !== 0) non++; }
        await fetch('/api/radar/debug-pixel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'virtual_capture_sample', sample: Array.from(id.data.slice(0, 16)), nonTransparentCount: non, w: tmp.width, h: tmp.height }) });
      } catch (e) { console.debug('[RADAR] sample failed', e); }
      const data = tmp.toDataURL('image/png'); console.debug('[RADAR] virtual capture len', data.length);
      await fetch('/api/radar/debug-screenshot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'virtual_capture', data }) });
      alert('Virtual capture uploaded');
    } catch (e) { console.error(e); alert('capture failed'); }
  };

  const captureManual = async () => {
    try {
      const src = canvasRef.current;
      if (!src) { alert('No radar canvas present to capture'); return; }
      // wait up to a couple RAFs for drawing/compositing to finish
      await new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
      // copy into temp canvas at full size
      const tmp = document.createElement('canvas'); tmp.width = src.width; tmp.height = src.height;
      const tctx = tmp.getContext('2d'); if (!tctx) { alert('Canvas context unavailable'); return; }
      try { tctx.drawImage(src, 0, 0); } catch (e) { console.debug('[RADAR] drawImage failed', e); }
      // stamp a small opaque marker so we can detect empty uploads
      try { tctx.fillStyle = 'rgba(255,0,0,1)'; tctx.fillRect(4,4,8,8); } catch (e) {}
      // sample a small region to sanity-check non-transparent pixels
      try {
        const id = tctx.getImageData(0, 0, Math.min(64, tmp.width), Math.min(64, tmp.height)); let non = 0; for (let i = 3; i < id.data.length; i += 4) { if (id.data[i] !== 0) non++; }
        await fetch('/api/radar/debug-pixel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'manual_capture_sample', sample: Array.from(id.data.slice(0, 16)), nonTransparentCount: non, w: tmp.width, h: tmp.height }) });
      } catch (e) { console.debug('[RADAR] manual sample failed', e); }

      const data = tmp.toDataURL('image/png');
      console.debug('[RADAR] manual capture len', data.length);
      const res = await fetch('/api/radar/debug-screenshot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'manual_capture', data }) });
      const j = await res.json();
      if (j && j.ok) { alert('Manual capture uploaded: ' + j.path); } else { alert('Manual capture upload failed'); }
    } catch (e) { console.error(e); alert('manual capture failed'); }
  };

  return (
    <div className="w-full h-screen relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
      <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 99999 }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Radar</div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={debugSimEnabled} onChange={(e) => setDebugSimEnabled(e.target.checked)} /> Use Local Simulation</label>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => { setRadarPlaying2(true); radarPlayingRef2.current = true; setDebugSimEnabled(false); setRadarPlaying(true); }} style={{ padding: '6px 8px' }}>Play</button>
              <button onClick={() => { setRadarPlaying2(false); radarPlayingRef2.current = false; setRadarPlaying(false); }} style={{ padding: '6px 8px' }}>Pause</button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 6 }}>
                <button onClick={() => setSelectedWindowHours(24)} style={{ padding: '6px 8px', background: selectedWindowHours===24? '#2563eb':'#e5e7eb', color: selectedWindowHours===24?'white':'#111' }}>24h</button>
                <button onClick={() => setSelectedWindowHours(48)} style={{ padding: '6px 8px', background: selectedWindowHours===48? '#2563eb':'#e5e7eb', color: selectedWindowHours===48?'white':'#111' }}>48h</button>
                <button onClick={() => setSelectedWindowHours(72)} style={{ padding: '6px 8px', background: selectedWindowHours===72? '#2563eb':'#e5e7eb', color: selectedWindowHours===72?'white':'#111' }}>72h</button>
              </div>
              <div style={{ marginLeft: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12 }}>Speed</label>
                <input type="range" min={100} max={2000} step={50} value={radarSpeedMs} onChange={(e)=> setRadarSpeedMs(Number(e.target.value))} />
              </div>
              <div style={{ marginLeft: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12 }}>Opacity</label>
                <input type="range" min={0} max={1} step={0.05} value={radarOpacity} onChange={(e)=> { setRadarOpacity(Number(e.target.value)); if (canvasRef.current) canvasRef.current.style.opacity = String(Number(e.target.value)); }} />
              </div>
              <div style={{ marginLeft: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12 }}>Weather Channel Mode</label>
                <input type="checkbox" checked={radarStyleEnabled} onChange={(e)=> { setRadarStyleEnabled(e.target.checked); if (canvasRef.current) { canvasRef.current.style.filter = e.target.checked ? 'contrast(140%) saturate(160%) hue-rotate(-6deg) drop-shadow(0 0 6px rgba(0,0,0,0.12))' : ''; } }} />
              </div>
              <button onClick={() => captureVirtual()} style={{ padding: '6px 8px', background: '#6b7280', color: '#fff' }}>Capture (virtual)</button>
              <button onClick={() => captureManual()} style={{ padding: '6px 8px', background: '#4b5563', color: '#fff' }}>Capture (manual)</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>{radarFramesAvailable ? `${displayFramesRef.current.length || radarFramesRef.current.length} frames` : 'No frames available'} {currentRadarTime ? `· ${new Date(currentRadarTime).toLocaleString()}` : ''}</div>
        </div>
      </div>
    </div>
  );
};

export default ResortMap;