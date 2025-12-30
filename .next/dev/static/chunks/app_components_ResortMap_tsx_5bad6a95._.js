(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/ResortMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const ResortMap = ({ resorts = [], conditions = {} })=>{
    _s();
    const mapDivRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const frameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const [radarPlaying, setRadarPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [debugSimEnabled, setDebugSimEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [canvasReady, setCanvasReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [radarFramesAvailable, setRadarFramesAvailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const radarFramesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const displayFramesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const tileBitmapCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const frameCanvasCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const radarPlayingRef2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const [radarPlaying2, setRadarPlaying2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [radarSpeedMs, setRadarSpeedMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(500);
    const radarIndexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const [selectedWindowHours, setSelectedWindowHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(24);
    const [radarOpacity, setRadarOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.85);
    const [radarStyleEnabled, setRadarStyleEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentRadarTime, setCurrentRadarTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const drawSimOnCtx = (ctx, frameIndex, w, h)=>{
        try {
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.fillStyle = 'rgba(255,0,0,1)';
            ctx.fillRect(2, 2, 6, 6);
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = '#072b44';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
            const t = frameIndex * 0.05;
            ctx.globalCompositeOperation = 'lighter';
            for(let i = 0; i < 6; i++){
                const x = frameIndex * (2 + i) % (w + 200) - 100;
                const y = h * (i + 1) / 7 + Math.sin(t * (0.7 + i * 0.12)) * 18;
                const g = ctx.createLinearGradient(x - 90, y, x + 160, y);
                g.addColorStop(0, 'rgba(60,160,255,0)');
                g.addColorStop(0.35, 'rgba(70,190,255,0.5)');
                g.addColorStop(1, 'rgba(60,160,255,0)');
                ctx.fillStyle = g;
                ctx.fillRect(x - 90, y - 20, 260, 40);
            }
            ctx.globalCompositeOperation = 'source-over';
        } catch (e) {
        // ignore
        }
    };
    // map and markers refs
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markerLayerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const createdMapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const createCustomIcon = (hasSnowfall)=>{
        let fill = '#2563eb';
        let stroke = '#1d4ed8';
        if (hasSnowfall === 'snow') {
            fill = '#10b981';
            stroke = '#059669';
        } else if (hasSnowfall === 'rain') {
            fill = '#ef4444';
            stroke = '#b91c1c';
        }
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.272 0 0 6.272 0 14c0 14 14 22 14 22s14-8 14-22C28 6.272 21.728 0 14 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
        <circle cx="14" cy="12" r="5" fill="white"/>
      </svg>
    `;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"]({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
            iconSize: [
                28,
                36
            ],
            iconAnchor: [
                14,
                34
            ],
            popupAnchor: [
                0,
                -30
            ]
        });
    };
    // Initialize (or reuse) leaflet map and ensure canvas pane exists
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (!mapDivRef.current) return;
            const globalAny = window;
            // For robustness during HMR / StrictMode we always tear down any existing map instance and create fresh.
            if (globalAny.__resortMapInstance) {
                try {
                    globalAny.__resortMapInstance.remove();
                } catch (e) {}
                try {
                    delete globalAny.__resortMapInstance;
                    delete globalAny.__resortMapInitialized;
                } catch (e) {}
                mapRef.current = null;
            }
            if (!mapRef.current) {
                // create map with wheel zoom disabled initially to avoid mid-mount wheel events
                const map = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["map"](mapDivRef.current, {
                    center: [
                        44,
                        -72
                    ],
                    zoom: 7,
                    scrollWheelZoom: false
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tileLayer"]('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OSM'
                }).addTo(map);
                mapRef.current = map;
                createdMapRef.current = true;
                try {
                    globalAny.__resortMapInstance = map;
                    globalAny.__resortMapInitialized = true;
                } catch (e) {}
                // ensure proper sizing after mount and enable wheel zoom when size stabilizes
                setTimeout({
                    "ResortMap.useEffect": ()=>{
                        try {
                            map.invalidateSize();
                        } catch (e) {}
                    }
                }["ResortMap.useEffect"], 200);
                const enableWheelWhenReady = {
                    "ResortMap.useEffect.enableWheelWhenReady": ()=>{
                        try {
                            const size = map.getSize();
                            if (size && size.x > 0 && size.y > 0) {
                                try {
                                    map.scrollWheelZoom && map.scrollWheelZoom.enable && map.scrollWheelZoom.enable();
                                } catch (e) {}
                                return;
                            }
                        } catch (e) {}
                        setTimeout(enableWheelWhenReady, 200);
                    }
                }["ResortMap.useEffect.enableWheelWhenReady"];
                setTimeout(enableWheelWhenReady, 300);
            }
            const map = mapRef.current;
            try {
                if (!map.getPane('radarPane')) map.createPane('radarPane');
                const pane = map.getPane('radarPane');
                pane.style.zIndex = '480';
                pane.style.pointerEvents = 'none';
                try {
                    pane.style.mixBlendMode = 'screen';
                } catch (e) {}
                try {
                    const mPane = map.getPane('markerPane');
                    if (mPane) {
                        mPane.style.zIndex = '700';
                    }
                } catch (e) {}
                if (!canvasRef.current) {
                    const c = document.createElement('canvas');
                    c.id = 'radar-sim-canvas';
                    c.style.position = 'absolute';
                    c.style.left = '0';
                    c.style.top = '0';
                    c.style.width = '100%';
                    c.style.height = '100%';
                    c.style.pointerEvents = 'none';
                    c.style.opacity = String(radarOpacity);
                    if (radarStyleEnabled) {
                        c.style.filter = 'contrast(140%) saturate(160%) hue-rotate(-6deg) drop-shadow(0 0 6px rgba(0,0,0,0.12))';
                    }
                    pane.appendChild(c);
                    canvasRef.current = c;
                    setCanvasReady(true);
                    const resize = {
                        "ResortMap.useEffect.resize": ()=>{
                            try {
                                const s = map.getSize();
                                c.width = Math.max(256, s.x * devicePixelRatio);
                                c.height = Math.max(256, s.y * devicePixelRatio);
                                c.style.width = `${s.x}px`;
                                c.style.height = `${s.y}px`;
                                const ctx = c.getContext('2d');
                                if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
                            } catch (e) {}
                        }
                    }["ResortMap.useEffect.resize"];
                    map.on('resize move zoom', resize);
                    resize();
                    // cleanup: remove resize handler when component unmounts
                    const offResize = {
                        "ResortMap.useEffect.offResize": ()=>{
                            try {
                                map.off('resize move zoom', resize);
                            } catch (e) {}
                        }
                    }["ResortMap.useEffect.offResize"];
                    // attach cleanup to createdMapRef removal path via a timeout guard in case of HMR
                    setTimeout({
                        "ResortMap.useEffect": ()=>{
                            if (!mapRef.current) offResize();
                        }
                    }["ResortMap.useEffect"], 1000);
                }
            } catch (e) {
                console.debug('[ResortMap] pane/canvas setup failed', e);
            }
            return ({
                "ResortMap.useEffect": ()=>{
                    try {
                        if (markerLayerRef.current) {
                            markerLayerRef.current.clearLayers();
                            markerLayerRef.current.remove();
                            markerLayerRef.current = null;
                        }
                    } catch (e) {}
                    try {
                        if (canvasRef.current && canvasRef.current.parentNode) {
                            canvasRef.current.parentNode.removeChild(canvasRef.current);
                        }
                    } catch (e) {}
                    try {
                        setCanvasReady(false);
                    } catch (e) {}
                    try {
                        if (mapRef.current && createdMapRef.current) {
                            mapRef.current.remove();
                        }
                    } catch (e) {}
                    try {
                        if (globalAny && globalAny.__resortMapInstance) {
                            delete globalAny.__resortMapInstance;
                            delete globalAny.__resortMapInitialized;
                        }
                    } catch (e) {}
                    mapRef.current = null;
                    canvasRef.current = null;
                }
            })["ResortMap.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ResortMap.useEffect"], [
        mapDivRef.current
    ]);
    // Global error hook to capture Leaflet runtime errors for debugging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            const onErr = {
                "ResortMap.useEffect.onErr": (ev)=>{
                    try {
                        console.error('[GLOBAL ERROR]', ev.error || ev.message, ev);
                        fetch('/api/radar/debug-pixel', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: 'global_error',
                                message: ev.error && ev.error.stack || ev.message,
                                filename: ev.filename,
                                lineno: ev.lineno,
                                colno: ev.colno
                            })
                        });
                    } catch (e) {}
                }
            }["ResortMap.useEffect.onErr"];
            const onRej = {
                "ResortMap.useEffect.onRej": (ev)=>{
                    try {
                        console.error('[UNHANDLED REJECTION]', ev.reason);
                        fetch('/api/radar/debug-pixel', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: 'unhandled_rejection',
                                reason: String(ev.reason)
                            })
                        });
                    } catch (e) {}
                }
            }["ResortMap.useEffect.onRej"];
            window.addEventListener('error', onErr);
            window.addEventListener('unhandledrejection', onRej);
            return ({
                "ResortMap.useEffect": ()=>{
                    window.removeEventListener('error', onErr);
                    window.removeEventListener('unhandledrejection', onRej);
                }
            })["ResortMap.useEffect"];
        }
    }["ResortMap.useEffect"], []);
    // Update markers whenever resorts change (keeps markers in sync and avoids recreating map)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            const map = mapRef.current;
            if (!map) return;
            try {
                if (markerLayerRef.current) {
                    markerLayerRef.current.clearLayers();
                    markerLayerRef.current.remove();
                    markerLayerRef.current = null;
                }
                const mg = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["layerGroup"]();
                for (const r of resorts){
                    try {
                        const m = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marker"]([
                            r.lat,
                            r.lon
                        ], {
                            icon: createCustomIcon(null)
                        });
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
                    } catch (e) {
                        console.debug('[ResortMap] failed to add marker', r, e);
                    }
                }
                mg.addTo(map);
                markerLayerRef.current = mg;
            } catch (e) {
                console.debug('[ResortMap] marker setup failed', e);
            }
        }
    }["ResortMap.useEffect"], [
        canvasReady,
        JSON.stringify(resorts),
        JSON.stringify(conditions)
    ]);
    // Load radar frames list from RainViewer and store times
    const loadRadarFrames = async ()=>{
        try {
            const res = await fetch('/api/radar/frames');
            if (!res.ok) throw new Error('frames fetch failed');
            const j = await res.json();
            const past = j && j.radar && j.radar.past || [];
            const times = past.map((f)=>f && (f.time || f) || 0).filter(Boolean); // full list
            radarFramesRef.current = times;
            setRadarFramesAvailable(times.length > 0);
            // build display frames for current window
            updateDisplayFrames(selectedWindowHours);
            return times;
        } catch (e) {
            console.debug('[RADAR] loadRadarFrames failed', e);
            radarFramesRef.current = [];
            setRadarFramesAvailable(false);
            return [];
        }
    };
    const updateDisplayFrames = (hours)=>{
        const now = Date.now();
        const cutoff = now - hours * 3600 * 1000;
        const frames = (radarFramesRef.current || []).filter((t)=>t >= cutoff);
        // ensure at least some frames (fallback to last N)
        const out = frames.length > 0 ? frames : radarFramesRef.current.slice(-Math.max(24, Math.min(72, Math.floor(hours))));
        displayFramesRef.current = out;
        radarIndexRef.current = Math.max(0, out.length - 1);
        setRadarFramesAvailable(out.length > 0);
        setCurrentRadarTime(out.length > 0 ? out[radarIndexRef.current] : null);
    };
    // Fetch tile image and return ImageBitmap (cached)
    const getTileBitmap = async (time, z, x, y)=>{
        const key = `${time}_${z}_${x}_${y}`;
        const cache = tileBitmapCache.current;
        if (cache.has(key)) return cache.get(key);
        try {
            const url = `/api/radar/tile?time=${encodeURIComponent(time)}&z=${z}&x=${x}&y=${y}`;
            const r = await fetch(url);
            if (!r.ok) throw new Error('tile fetch failed');
            const blob = await r.blob();
            const bitmap = await createImageBitmap(blob);
            cache.set(key, bitmap);
            // simple cache eviction after some size
            if (cache.size > 512) {
                const it = cache.keys();
                const k = it.next().value;
                if (k) cache.delete(k);
            }
            return bitmap;
        } catch (e) {
            console.debug('[RADAR] getTileBitmap failed', e);
            return null;
        }
    };
    // Draw one radar frame (composite tiles) onto the overlay canvas
    const drawRadarFrame = async (time, ctx)=>{
        const map = mapRef.current;
        if (!map) return;
        try {
            const z = Math.max(0, Math.round(map.getZoom() || 5));
            const size = map.getSize();
            const key = `${time}_${z}_${size.x}_${size.y}`;
            const fc = await renderFrameToCanvas(time, z, size.x, size.y, key);
            if (!fc) return;
            // draw onto target ctx (fc is device-pixel sized)
            try {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(fc, 0, 0);
            } catch (e) {
                console.debug('[RADAR] draw image failed', e);
            }
        } catch (e) {
            console.debug('[RADAR] drawRadarFrame failed', e);
        }
    };
    const renderFrameToCanvas = async (time, z, widthPx, heightPx, key)=>{
        const cache = frameCanvasCache.current;
        if (cache.has(key)) return cache.get(key);
        try {
            const c = document.createElement('canvas');
            c.width = Math.round(widthPx * devicePixelRatio);
            c.height = Math.round(heightPx * devicePixelRatio);
            c.style.width = `${widthPx}px`;
            c.style.height = `${heightPx}px`;
            const ctx = c.getContext('2d');
            if (!ctx) return null;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            const map = mapRef.current;
            if (!map) return null;
            const size = map.getSize();
            const halfX = size.x / 2;
            const halfY = size.y / 2;
            const center = map.getCenter();
            const centerWorld = map.project(center, z);
            const leftWorldX = centerWorld.x - halfX;
            const topWorldY = centerWorld.y - halfY;
            const xMin = Math.floor(leftWorldX / 256);
            const xMax = Math.floor((leftWorldX + size.x) / 256);
            const yMin = Math.floor(topWorldY / 256);
            const yMax = Math.floor((topWorldY + size.y) / 256);
            const tilesAcross = Math.pow(2, z);
            for(let tx = xMin; tx <= xMax; tx++){
                for(let ty = yMin; ty <= yMax; ty++){
                    const wrapX = (tx % tilesAcross + tilesAcross) % tilesAcross;
                    const wrapY = ty;
                    if (wrapY < 0 || wrapY >= tilesAcross) continue;
                    const bitmap = await getTileBitmap(time, z, wrapX, wrapY);
                    if (!bitmap) continue;
                    const tileWorldX = tx * 256;
                    const tileWorldY = ty * 256;
                    const canvasX = Math.round((tileWorldX - leftWorldX) * devicePixelRatio);
                    const canvasY = Math.round((tileWorldY - topWorldY) * devicePixelRatio);
                    try {
                        ctx.drawImage(bitmap, canvasX, canvasY, Math.round(256 * devicePixelRatio), Math.round(256 * devicePixelRatio));
                    } catch (e) {
                        console.debug('[RADAR] draw tile failed', e);
                    }
                }
            }
            cache.set(key, c);
            // simple eviction
            if (cache.size > 64) {
                const it = cache.keys();
                const k = it.next().value;
                if (k) cache.delete(k);
            }
            return c;
        } catch (e) {
            console.debug('[RADAR] renderFrameToCanvas failed', e);
            return null;
        }
    };
    // Playback loop: crossfade between consecutive frames
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            let rafId = null;
            let lastTime = performance.now();
            let progress = 0;
            let prevIndex = 0;
            const step = {
                "ResortMap.useEffect.step": async (now)=>{
                    const c = canvasRef.current;
                    if (!c) {
                        rafId = requestAnimationFrame(step);
                        return;
                    }
                    const ctx = c.getContext('2d');
                    if (!ctx) {
                        rafId = requestAnimationFrame(step);
                        return;
                    }
                    if (!radarPlayingRef2.current || !radarFramesAvailable || debugSimEnabled) {
                        rafId = requestAnimationFrame(step);
                        return;
                    }
                    const elapsed = now - lastTime;
                    lastTime = now;
                    progress += elapsed;
                    const dur = radarSpeedMs;
                    const t = Math.min(1, progress / dur);
                    const frames = displayFramesRef.current.length > 0 ? displayFramesRef.current : radarFramesRef.current;
                    if (frames.length === 0) {
                        rafId = requestAnimationFrame(step);
                        return;
                    }
                    const idx = radarIndexRef.current % frames.length;
                    const nextIdx = (idx + 1) % frames.length;
                    // draw prev frame (opaque) and next frame with alpha t to crossfade
                    ctx.clearRect(0, 0, c.width, c.height);
                    try {
                        const map = mapRef.current;
                        if (!map) {
                            rafId = requestAnimationFrame(step);
                            return;
                        }
                        const z = Math.max(0, Math.round(map.getZoom() || 5));
                        const size = map.getSize();
                        const keyPrev = `${frames[idx]}_${z}_${size.x}_${size.y}`;
                        const keyNext = `${frames[nextIdx]}_${z}_${size.x}_${size.y}`;
                        const prevC = await renderFrameToCanvas(frames[idx], z, size.x, size.y, keyPrev);
                        const nextC = await renderFrameToCanvas(frames[nextIdx], z, size.x, size.y, keyNext);
                        if (prevC) ctx.drawImage(prevC, 0, 0);
                        if (nextC) {
                            ctx.globalAlpha = t;
                            ctx.drawImage(nextC, 0, 0);
                            ctx.globalAlpha = 1.0;
                        }
                    } catch (e) {
                        console.debug('[RADAR] crossfade draw error', e);
                    }
                    if (progress >= dur) {
                        progress = 0;
                        radarIndexRef.current = nextIdx;
                        prevIndex = nextIdx;
                        setCurrentRadarTime(frames[radarIndexRef.current]);
                    }
                    rafId = requestAnimationFrame(step);
                }
            }["ResortMap.useEffect.step"];
            rafId = requestAnimationFrame(step);
            return ({
                "ResortMap.useEffect": ()=>{
                    if (rafId) cancelAnimationFrame(rafId);
                }
            })["ResortMap.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ResortMap.useEffect"], [
        radarFramesAvailable,
        radarPlaying2,
        radarSpeedMs,
        debugSimEnabled
    ]);
    // load frames when map becomes ready
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            let mounted = true;
            ({
                "ResortMap.useEffect": async ()=>{
                    try {
                        await loadRadarFrames();
                        if (mounted) setRadarFramesAvailable(radarFramesRef.current.length > 0);
                    } catch (e) {}
                }
            })["ResortMap.useEffect"]();
            return ({
                "ResortMap.useEffect": ()=>{
                    mounted = false;
                }
            })["ResortMap.useEffect"];
        }
    }["ResortMap.useEffect"], []);
    // when selected window hours changes, rebuild display frames
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            updateDisplayFrames(selectedWindowHours);
        }
    }["ResortMap.useEffect"], [
        selectedWindowHours
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            const c = canvasRef.current;
            if (!c || !canvasReady) return;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            let last = performance.now();
            const loop = {
                "ResortMap.useEffect.loop": (now)=>{
                    if (radarPlaying && debugSimEnabled) {
                        if (now - last > 80) {
                            frameRef.current = (frameRef.current + 1) % 100000;
                            drawSimOnCtx(ctx, frameRef.current, c.width / devicePixelRatio, c.height / devicePixelRatio);
                            last = now;
                        }
                    }
                    rafRef.current = requestAnimationFrame(loop);
                }
            }["ResortMap.useEffect.loop"];
            rafRef.current = requestAnimationFrame(loop);
            return ({
                "ResortMap.useEffect": ()=>{
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                }
            })["ResortMap.useEffect"];
        }
    }["ResortMap.useEffect"], [
        radarPlaying,
        debugSimEnabled,
        canvasReady
    ]);
    const captureVirtual = async ()=>{
        try {
            const tmp = document.createElement('canvas');
            tmp.width = 256;
            tmp.height = 256;
            const tctx = tmp.getContext('2d');
            if (!tctx) return;
            drawSimOnCtx(tctx, frameRef.current || 0, 256, 256);
            // sample a small region to sanity-check non-transparent pixels
            try {
                const id = tctx.getImageData(0, 0, Math.min(64, tmp.width), Math.min(64, tmp.height));
                let non = 0;
                for(let i = 3; i < id.data.length; i += 4){
                    if (id.data[i] !== 0) non++;
                }
                await fetch('/api/radar/debug-pixel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'virtual_capture_sample',
                        sample: Array.from(id.data.slice(0, 16)),
                        nonTransparentCount: non,
                        w: tmp.width,
                        h: tmp.height
                    })
                });
            } catch (e) {
                console.debug('[RADAR] sample failed', e);
            }
            const data = tmp.toDataURL('image/png');
            console.debug('[RADAR] virtual capture len', data.length);
            await fetch('/api/radar/debug-screenshot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'virtual_capture',
                    data
                })
            });
            alert('Virtual capture uploaded');
        } catch (e) {
            console.error(e);
            alert('capture failed');
        }
    };
    const captureManual = async ()=>{
        try {
            const src = canvasRef.current;
            if (!src) {
                alert('No radar canvas present to capture');
                return;
            }
            // wait up to a couple RAFs for drawing/compositing to finish
            await new Promise((res)=>requestAnimationFrame(()=>requestAnimationFrame(()=>res())));
            // copy into temp canvas at full size
            const tmp = document.createElement('canvas');
            tmp.width = src.width;
            tmp.height = src.height;
            const tctx = tmp.getContext('2d');
            if (!tctx) {
                alert('Canvas context unavailable');
                return;
            }
            try {
                tctx.drawImage(src, 0, 0);
            } catch (e) {
                console.debug('[RADAR] drawImage failed', e);
            }
            // stamp a small opaque marker so we can detect empty uploads
            try {
                tctx.fillStyle = 'rgba(255,0,0,1)';
                tctx.fillRect(4, 4, 8, 8);
            } catch (e) {}
            // sample a small region to sanity-check non-transparent pixels
            try {
                const id = tctx.getImageData(0, 0, Math.min(64, tmp.width), Math.min(64, tmp.height));
                let non = 0;
                for(let i = 3; i < id.data.length; i += 4){
                    if (id.data[i] !== 0) non++;
                }
                await fetch('/api/radar/debug-pixel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'manual_capture_sample',
                        sample: Array.from(id.data.slice(0, 16)),
                        nonTransparentCount: non,
                        w: tmp.width,
                        h: tmp.height
                    })
                });
            } catch (e) {
                console.debug('[RADAR] manual sample failed', e);
            }
            const data = tmp.toDataURL('image/png');
            console.debug('[RADAR] manual capture len', data.length);
            const res = await fetch('/api/radar/debug-screenshot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'manual_capture',
                    data
                })
            });
            const j = await res.json();
            if (j && j.ok) {
                alert('Manual capture uploaded: ' + j.path);
            } else {
                alert('Manual capture upload failed');
            }
        } catch (e) {
            console.error(e);
            alert('manual capture failed');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-screen relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: mapDivRef,
                style: {
                    height: '100%',
                    width: '100%'
                }
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 416,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 99999
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: 'rgba(255,255,255,0.95)',
                        padding: 10,
                        borderRadius: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 600,
                                marginBottom: 6
                            },
                            children: "Radar"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ResortMap.tsx",
                            lineNumber: 419,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: debugSimEnabled,
                                    onChange: (e)=>setDebugSimEnabled(e.target.checked)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 420,
                                    columnNumber: 78
                                }, ("TURBOPACK compile-time value", void 0)),
                                " Use Local Simulation"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ResortMap.tsx",
                            lineNumber: 420,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 8,
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setRadarPlaying2(true);
                                        radarPlayingRef2.current = true;
                                        setDebugSimEnabled(false);
                                        setRadarPlaying(true);
                                    },
                                    style: {
                                        padding: '6px 8px'
                                    },
                                    children: "Play"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 422,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setRadarPlaying2(false);
                                        radarPlayingRef2.current = false;
                                        setRadarPlaying(false);
                                    },
                                    style: {
                                        padding: '6px 8px'
                                    },
                                    children: "Pause"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 423,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: 6,
                                        alignItems: 'center',
                                        marginLeft: 6
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelectedWindowHours(24),
                                            style: {
                                                padding: '6px 8px',
                                                background: selectedWindowHours === 24 ? '#2563eb' : '#e5e7eb',
                                                color: selectedWindowHours === 24 ? 'white' : '#111'
                                            },
                                            children: "24h"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 425,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelectedWindowHours(48),
                                            style: {
                                                padding: '6px 8px',
                                                background: selectedWindowHours === 48 ? '#2563eb' : '#e5e7eb',
                                                color: selectedWindowHours === 48 ? 'white' : '#111'
                                            },
                                            children: "48h"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 426,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelectedWindowHours(72),
                                            style: {
                                                padding: '6px 8px',
                                                background: selectedWindowHours === 72 ? '#2563eb' : '#e5e7eb',
                                                color: selectedWindowHours === 72 ? 'white' : '#111'
                                            },
                                            children: "72h"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 427,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 424,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginLeft: 8,
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                fontSize: 12
                                            },
                                            children: "Speed"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 430,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "range",
                                            min: 100,
                                            max: 2000,
                                            step: 50,
                                            value: radarSpeedMs,
                                            onChange: (e)=>setRadarSpeedMs(Number(e.target.value))
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 431,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 429,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginLeft: 8,
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                fontSize: 12
                                            },
                                            children: "Opacity"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 434,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "range",
                                            min: 0,
                                            max: 1,
                                            step: 0.05,
                                            value: radarOpacity,
                                            onChange: (e)=>{
                                                setRadarOpacity(Number(e.target.value));
                                                if (canvasRef.current) canvasRef.current.style.opacity = String(Number(e.target.value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 435,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 433,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginLeft: 8,
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                fontSize: 12
                                            },
                                            children: "Weather Channel Mode"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 438,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: radarStyleEnabled,
                                            onChange: (e)=>{
                                                setRadarStyleEnabled(e.target.checked);
                                                if (canvasRef.current) {
                                                    canvasRef.current.style.filter = e.target.checked ? 'contrast(140%) saturate(160%) hue-rotate(-6deg) drop-shadow(0 0 6px rgba(0,0,0,0.12))' : '';
                                                }
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ResortMap.tsx",
                                            lineNumber: 439,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 437,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>captureVirtual(),
                                    style: {
                                        padding: '6px 8px',
                                        background: '#6b7280',
                                        color: '#fff'
                                    },
                                    children: "Capture (virtual)"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 441,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>captureManual(),
                                    style: {
                                        padding: '6px 8px',
                                        background: '#4b5563',
                                        color: '#fff'
                                    },
                                    children: "Capture (manual)"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ResortMap.tsx",
                                    lineNumber: 442,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ResortMap.tsx",
                            lineNumber: 421,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 8,
                                fontSize: 12,
                                color: '#374151'
                            },
                            children: [
                                radarFramesAvailable ? `${displayFramesRef.current.length || radarFramesRef.current.length} frames` : 'No frames available',
                                " ",
                                currentRadarTime ? `· ${new Date(currentRadarTime).toLocaleString()}` : ''
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ResortMap.tsx",
                            lineNumber: 444,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ResortMap.tsx",
                    lineNumber: 418,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 417,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ResortMap.tsx",
        lineNumber: 415,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ResortMap, "0PHyF0pSXUziCwpScVoqCx1QSyA=");
_c = ResortMap;
const __TURBOPACK__default__export__ = ResortMap;
var _c;
__turbopack_context__.k.register(_c, "ResortMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ResortMap.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/ResortMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_components_ResortMap_tsx_5bad6a95._.js.map