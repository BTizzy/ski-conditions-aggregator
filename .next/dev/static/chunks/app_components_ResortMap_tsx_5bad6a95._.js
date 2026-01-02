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
const ResortMap = ({ resorts = [], conditions = {}, loading = {}, errors = {} })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const popupsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const [radarPlaying, setRadarPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [radarSpeedMs, setRadarSpeedMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1500);
    const [radarOpacity, setRadarOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.6);
    const [radarFramesAvailable, setRadarFramesAvailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [frameCount, setFrameCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loadingStatus, setLoadingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Initializing map...');
    const [mapReady, setMapReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedResort, setSelectedResort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [radarFrameTimes, setRadarFrameTimes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [radarIndex, setRadarIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // FIXED: Properly initialize radarFramesRef as a Ref, not a boolean
    const radarFramesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const radarIndexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const radarPlayingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const tileBitmapCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const frameCanvasCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastRenderTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const mapPanZoomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        panning: false,
        zooming: false
    });
    // Initialize map
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (mapRef.current) return;
            if (!containerRef.current) return;
            if (containerRef.current.innerHTML !== '') containerRef.current.innerHTML = '';
            console.log('[Map] Starting initialization...');
            try {
                const map = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["map"](containerRef.current, {
                    center: [
                        43.5,
                        -71.5
                    ],
                    zoom: 7,
                    scrollWheelZoom: true
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tileLayer"]('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
                mapRef.current = map;
                if (!map.getPane('radarPane')) map.createPane('radarPane');
                const radarPane = map.getPane('radarPane');
                radarPane.style.zIndex = '400';
                radarPane.style.pointerEvents = 'none';
                const markerPane = map.getPane('markerPane');
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
                // --- Fix: Always force canvas to match map size, even if Leaflet/React race ---
                const resizeCanvas = {
                    "ResortMap.useEffect.resizeCanvas": ()=>{
                        if (!canvas || !map) return;
                        const size = map.getSize();
                        const dpr = window.devicePixelRatio || 1;
                        // Only resize if needed (avoid flicker)
                        if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
                            canvas.width = size.x * dpr;
                            canvas.height = size.y * dpr;
                            canvas.style.width = `${size.x}px`;
                            canvas.style.height = `${size.y}px`;
                            const ctx = canvas.getContext('2d');
                            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                            frameCanvasCache.current.clear();
                            console.log('[RadarCanvas] Resized to', size.x, size.y, 'dpr', dpr);
                        }
                    }
                }["ResortMap.useEffect.resizeCanvas"];
                // Force resize on next animation frame after mount
                requestAnimationFrame(resizeCanvas);
                map.on('resize', resizeCanvas);
                // Also force resize after 200ms in case of late layout
                setTimeout(resizeCanvas, 200);
                map.on('movestart', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.panning = true;
                    }
                }["ResortMap.useEffect"]);
                map.on('moveend', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.panning = false;
                        frameCanvasCache.current.clear();
                    }
                }["ResortMap.useEffect"]);
                map.on('zoomstart', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.zooming = true;
                    }
                }["ResortMap.useEffect"]);
                map.on('zoomend', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.zooming = false;
                        frameCanvasCache.current.clear();
                    }
                }["ResortMap.useEffect"]);
                setTimeout({
                    "ResortMap.useEffect": ()=>map.invalidateSize()
                }["ResortMap.useEffect"], 200);
                console.log('[Map] Initialization complete');
                setMapReady(true);
                setLoadingStatus('Map ready. Loading frames...');
            } catch (error) {
                console.error('[Map] Initialization failed:', error);
                setLoadingStatus('Map initialization failed');
            }
        }
    }["ResortMap.useEffect"], []);
    // Load radar frames
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (!mapReady) return;
            const loadFrames = {
                "ResortMap.useEffect.loadFrames": async ()=>{
                    try {
                        console.log('[Frames] Starting frame load...');
                        const startTime = Date.now();
                        const res = await fetch('/api/radar/frames');
                        if (!res.ok) throw new Error(`API returned ${res.status}`);
                        const data = await res.json();
                        const layers = data?.radar?.past || [];
                        const loadTime = Date.now() - startTime;
                        console.log(`[Frames] Loaded ${layers.length} frames in ${loadTime}ms, source: ${data?.radar?.source}`);
                        if (layers.length === 0) {
                            console.warn('[Frames] No frames returned from API');
                            setLoadingStatus('No radar frames available');
                            return;
                        }
                        const frameObjects = layers.map({
                            "ResortMap.useEffect.loadFrames.frameObjects": (layer)=>{
                                if (typeof layer === 'string') {
                                    return {
                                        url: layer,
                                        time: 0
                                    };
                                } else {
                                    return {
                                        url: layer.url,
                                        time: layer.time
                                    };
                                }
                            }
                        }["ResortMap.useEffect.loadFrames.frameObjects"]);
                        // Extract times for timeline
                        const frameTimes = frameObjects.map({
                            "ResortMap.useEffect.loadFrames.frameTimes": (f)=>typeof f.time === 'number' ? f.time : 0
                        }["ResortMap.useEffect.loadFrames.frameTimes"]);
                        radarFramesRef.current = frameObjects;
                        setFrameCount(frameObjects.length);
                        setRadarFramesAvailable(frameObjects.length > 0);
                        setRadarFrameTimes(frameTimes);
                        const sourceLabel = data?.radar?.source === 'rainviewer-48h' ? '48h RainViewer' : '1h Mesonet (fallback)';
                        setLoadingStatus(`Ready: ${frameObjects.length} frames (${sourceLabel})`);
                        console.log(`[Frames] Setup complete: ${frameObjects.length} frames, times range: ${new Date(Math.min(...frameTimes)).toLocaleTimeString()} - ${new Date(Math.max(...frameTimes)).toLocaleTimeString()}`);
                        // Force initial radar render after frames load
                        setTimeout({
                            "ResortMap.useEffect.loadFrames": ()=>{
                                if (canvasRef.current && mapRef.current) {
                                    const canvas = canvasRef.current;
                                    const map = mapRef.current;
                                    const size = map.getSize();
                                    const dpr = window.devicePixelRatio || 1;
                                    canvas.width = size.x * dpr;
                                    canvas.height = size.y * dpr;
                                    canvas.style.width = `${size.x}px`;
                                    canvas.style.height = `${size.y}px`;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                                    frameCanvasCache.current.clear();
                                    console.log('[Frames] Forced initial canvas resize after frame load');
                                }
                            }
                        }["ResortMap.useEffect.loadFrames"], 100);
                    } catch (e) {
                        console.error('[Frames] Load failed:', e);
                        setLoadingStatus(`Failed to load frames: ${e}`);
                    }
                }
            }["ResortMap.useEffect.loadFrames"];
            loadFrames();
        }
    }["ResortMap.useEffect"], [
        mapReady
    ]);
    // Add resort markers with proper popup binding
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (!mapRef.current || resorts.length === 0) return;
            const map = mapRef.current;
            const activeIds = new Set(resorts.map({
                "ResortMap.useEffect": (r)=>r.id
            }["ResortMap.useEffect"]));
            // Remove old markers
            markersRef.current.forEach({
                "ResortMap.useEffect": (marker, id)=>{
                    if (!activeIds.has(id)) {
                        marker.remove();
                        markersRef.current.delete(id);
                        popupsRef.current.delete(id);
                    }
                }
            }["ResortMap.useEffect"]);
            // Add or update markers
            resorts.forEach({
                "ResortMap.useEffect": (resort)=>{
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
                            markerColor = '#0EA5E9';
                            markerRadius = 12;
                            markerWeight = 3;
                        } else if (cond.recentSnowfall >= 6) {
                            markerColor = '#06B6D4';
                            markerRadius = 10;
                            markerWeight = 3;
                        } else if (cond.recentSnowfall >= 1) {
                            markerColor = '#3B82F6';
                            markerRadius = 9;
                        } else {
                            markerColor = '#F59E0B';
                            markerRadius = 8;
                        }
                    }
                    // Update existing marker style
                    if (markersRef.current.has(resort.id)) {
                        const existing = markersRef.current.get(resort.id);
                        existing.setStyle({
                            fillColor: markerColor,
                            radius: markerRadius,
                            weight: markerWeight
                        });
                        // Update popup content
                        if (popupsRef.current.has(resort.id)) {
                            const popup = popupsRef.current.get(resort.id);
                            popup.setContent(buildPopupContent(resort, cond, err, isLoading));
                        }
                        return;
                    }
                    // Create new marker
                    const marker = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["circleMarker"]([
                        resort.lat,
                        resort.lon
                    ], {
                        radius: markerRadius,
                        fillColor: markerColor,
                        color: '#FFFFFF',
                        weight: markerWeight,
                        opacity: 1,
                        fillOpacity: 0.9,
                        pane: 'markerPane'
                    }).addTo(map);
                    // Create popup content
                    const popupContent = buildPopupContent(resort, cond, err, isLoading);
                    const popup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["popup"]({
                        maxWidth: 320,
                        closeButton: true
                    }).setContent(popupContent);
                    // Bind popup to marker
                    marker.bindPopup(popup);
                    popupsRef.current.set(resort.id, popup);
                    // Add event listeners
                    marker.on('click', {
                        "ResortMap.useEffect": (e)=>{
                            if (cond) {
                                setSelectedResort({
                                    resort,
                                    conditions: cond
                                });
                            }
                            // Ensure popup opens
                            setTimeout({
                                "ResortMap.useEffect": ()=>{
                                    marker.openPopup();
                                }
                            }["ResortMap.useEffect"], 0);
                        }
                    }["ResortMap.useEffect"]);
                    marker.on('mouseover', {
                        "ResortMap.useEffect": function() {
                            this.setRadius(markerRadius * 1.3);
                        }
                    }["ResortMap.useEffect"]);
                    marker.on('mouseout', {
                        "ResortMap.useEffect": function() {
                            this.setRadius(markerRadius);
                        }
                    }["ResortMap.useEffect"]);
                    markersRef.current.set(resort.id, marker);
                }
            }["ResortMap.useEffect"]);
        }
    }["ResortMap.useEffect"], [
        resorts,
        conditions,
        loading,
        errors
    ]);
    // Build popup content
    const buildPopupContent = (resort, cond, err, isLoading)=>{
        const div = document.createElement('div');
        div.style.cssText = 'font-size: 13px; font-family: system-ui; padding: 8px; min-width: 240px;';
        let html = `<div style="font-weight: bold; font-size: 15px; margin-bottom: 12px; color: #1f2937;">${resort.name}, ${resort.state}</div>`;
        if (isLoading) {
            html += `<div style="color: #666; padding: 8px; background: #f3f4f6; border-radius: 4px;">⏳ Loading conditions...</div>`;
        } else if (err) {
            html += `<div style="color: #DC2626; padding: 8px; background: #fee2e2; border-radius: 4px;">❌ Error: ${err}</div>`;
        } else if (cond) {
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">`;
            html += `<div style="background: #dbeafe; padding: 8px; border-radius: 4px; border-left: 3px solid #0EA5E9;"><div style="font-size: 11px; color: #0c4a6e; font-weight: 600;">1-Day Snow</div><div style="color: #0EA5E9; font-weight: bold; font-size: 16px;">${cond.recentSnowfall}"</div></div>`;
            html += `<div style="background: #f0fdf4; padding: 8px; border-radius: 4px; border-left: 3px solid #22c55e;"><div style="font-size: 11px; color: #166534; font-weight: 600;">Base Depth</div><div style="color: #22c55e; font-weight: bold; font-size: 16px;">${cond.snowDepth}"</div></div>`;
            html += `<div style="background: #eff6ff; padding: 8px; border-radius: 4px; border-left: 3px solid #3B82F6;"><div style="font-size: 11px; color: #1e40af; font-weight: 600;">7-Day Snow</div><div style="color: #3B82F6; font-weight: bold; font-size: 16px;">${cond.weeklySnowfall || 'N/A'}"</div></div>`;
            html += `<div style="background: #fef3c7; padding: 8px; border-radius: 4px; border-left: 3px solid #F59E0B;"><div style="font-size: 11px; color: #92400e; font-weight: 600;">7-Day Rain</div><div style="color: #F59E0B; font-weight: bold; font-size: 16px;">${cond.weeklyRainfall ? cond.weeklyRainfall.toFixed(1) : 'N/A'}"</div></div>`;
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
    const getTileBitmap = async (layer, z, x, y)=>{
        const layerStr = typeof layer === 'string' ? layer : layer.url;
        const key = `${layerStr}_${z}_${x}_${y}`;
        if (tileBitmapCache.current.has(key)) return tileBitmapCache.current.get(key) || null;
        try {
            const url = `/api/radar/tile?layer=${encodeURIComponent(layerStr)}&z=${z}&x=${x}&y=${y}`;
            const resp = await fetch(url, {
                signal: AbortSignal.timeout(5000)
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
    const renderFrameToCanvas = async (layer, z, widthPx, heightPx, key)=>{
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
            const centerWorld = map.project(center, z);
            const leftWorldX = centerWorld.x - size.x / 2;
            const topWorldY = centerWorld.y - size.y / 2;
            const xMin = Math.floor(leftWorldX / 256);
            const xMax = Math.floor((leftWorldX + size.x) / 256);
            const yMin = Math.floor(topWorldY / 256);
            const yMax = Math.floor((topWorldY + size.y) / 256);
            const tilesAcross = Math.pow(2, z);
            // Fetch tiles in parallel with controlled concurrency
            const tilePromises = [];
            for(let tx = xMin; tx <= xMax; tx++){
                for(let ty = yMin; ty <= yMax; ty++){
                    const wrapX = (tx % tilesAcross + tilesAcross) % tilesAcross;
                    const wrapY = ty;
                    if (wrapY < 0 || wrapY >= tilesAcross) continue;
                    tilePromises.push((async ()=>{
                        const bitmap = await getTileBitmap(layer, z, wrapX, wrapY);
                        if (!bitmap) return;
                        const tileWorldX = tx * 256;
                        const tileWorldY = ty * 256;
                        const canvasX = (tileWorldX - leftWorldX) * dpr;
                        const canvasY = (tileWorldY - topWorldY) * dpr;
                        ctx.drawImage(bitmap, canvasX, canvasY, 256 * dpr, 256 * dpr);
                    })());
                }
            }
            // Wait for all tiles with concurrency limit
            const limit = 6;
            for(let i = 0; i < tilePromises.length; i += limit){
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            let lastTime = performance.now();
            let progress = 0;
            const step = {
                "ResortMap.useEffect.step": async (now)=>{
                    const c = canvasRef.current;
                    if (!c) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    // --- Fix: Always force canvas to match map size before drawing ---
                    const map = mapRef.current;
                    if (map && c) {
                        const size = map.getSize();
                        const dpr = window.devicePixelRatio || 1;
                        if (c.width !== size.x * dpr || c.height !== size.y * dpr) {
                            c.width = size.x * dpr;
                            c.height = size.y * dpr;
                            c.style.width = `${size.x}px`;
                            c.style.height = `${size.y}px`;
                            const ctx = c.getContext('2d');
                            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                            frameCanvasCache.current.clear();
                            console.log('[RadarCanvas] Animation forced resize', size.x, size.y, 'dpr', dpr);
                        }
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
                    setRadarIndex(idx); // For timeline UI
                    // Throttle to 20fps for radar
                    const timeSinceLastRender = now - lastRenderTimeRef.current;
                    if (timeSinceLastRender < 50) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    try {
                        // --- Canada fix: always show full radar, don't restrict by bounds ---
                        // (No code change needed here, but this comment documents the intent)
                        const z = map ? Math.max(0, Math.round(map.getZoom() || 5)) : 7;
                        const size = map ? map.getSize() : {
                            x: 800,
                            y: 600
                        };
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
                            console.log(`[Radar] Frame ${idx} → ${nextIdx}/${frames.length}`);
                        }
                    } catch (e) {
                        console.error('[RadarCanvas] Render error', e);
                    }
                    rafRef.current = requestAnimationFrame(step);
                }
            }["ResortMap.useEffect.step"];
            rafRef.current = requestAnimationFrame(step);
            return ({
                "ResortMap.useEffect": ()=>{
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                }
            })["ResortMap.useEffect"];
        }
    }["ResortMap.useEffect"], [
        radarFramesAvailable,
        radarSpeedMs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (canvasRef.current) canvasRef.current.style.opacity = String(radarOpacity);
        }
    }["ResortMap.useEffect"], [
        radarOpacity
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-screen bg-gray-100 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "flex-1 w-full",
                style: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: '400px'
                }
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 571,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 z-[99999] bg-white/95 rounded-lg p-4 shadow-lg max-w-xs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold mb-2 text-gray-800 text-sm",
                        children: [
                            "🛰 ",
                            radarFramesAvailable ? 'Radar 48h' : 'Loading Radar...'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 574,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    radarFramesAvailable ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setRadarPlaying(true);
                                            radarPlayingRef.current = true;
                                        },
                                        className: "px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold",
                                        children: "▶ Play"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 580,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setRadarPlaying(false);
                                            radarPlayingRef.current = false;
                                        },
                                        className: "px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 font-semibold",
                                        children: "⏸ Pause"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 581,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 579,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-semibold text-gray-700 block mb-1",
                                        children: "Speed"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 583,
                                        columnNumber: 37
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "500",
                                        max: "3000",
                                        step: "100",
                                        value: radarSpeedMs,
                                        onChange: (e)=>setRadarSpeedMs(Number(e.target.value)),
                                        className: "w-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 583,
                                        columnNumber: 116
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 583,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-semibold text-gray-700 block mb-1",
                                        children: "Opacity"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 584,
                                        columnNumber: 37
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "0",
                                        max: "1",
                                        step: "0.05",
                                        value: radarOpacity,
                                        onChange: (e)=>setRadarOpacity(Number(e.target.value)),
                                        className: "w-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 584,
                                        columnNumber: 118
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 584,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            radarFrameTimes.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-xs font-semibold text-gray-700 block mb-1",
                                        children: "Timeline"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 588,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-gray-500",
                                                children: radarFrameTimes[0] ? new Date(radarFrameTimes[0] * 1000).toLocaleString() : ''
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ResortMap.tsx",
                                                lineNumber: 590,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: 0,
                                                max: radarFrameTimes.length - 1,
                                                value: radarIndex,
                                                onChange: (e)=>{
                                                    const idx = Number(e.target.value);
                                                    radarIndexRef.current = idx;
                                                    setRadarIndex(idx);
                                                },
                                                className: "flex-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ResortMap.tsx",
                                                lineNumber: 591,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-gray-500",
                                                children: radarFrameTimes[radarFrameTimes.length - 1] ? new Date(radarFrameTimes[radarFrameTimes.length - 1] * 1000).toLocaleString() : ''
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ResortMap.tsx",
                                                lineNumber: 603,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 589,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 587,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-600 mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "animate-pulse",
                                children: [
                                    "⏳ ",
                                    loadingStatus
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 610,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-[10px] text-gray-500",
                                children: "This may take a few seconds..."
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 611,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 609,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-700 border-t pt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Status: ",
                                    loadingStatus
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 616,
                                columnNumber: 64
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Markers: ",
                                    markersRef.current.size,
                                    "/43"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 616,
                                columnNumber: 98
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 616,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 573,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            "      ",
            selectedResort && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 z-[99999] bg-white/95 rounded-lg p-5 shadow-lg max-w-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setSelectedResort(null),
                        className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 619,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold text-gray-800 text-base mb-3",
                        children: [
                            "📊 ",
                            selectedResort.resort.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 620,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "24h Snowfall:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 623,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-600 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.recentSnowfall,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 624,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 622,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            selectedResort.conditions.recentRainfall && selectedResort.conditions.recentRainfall > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "24h Rainfall:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 628,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-400 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.recentRainfall.toFixed(2),
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 629,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 627,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Weekly Snow:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 633,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-500 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.weeklySnowfall || 'N/A',
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 634,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 632,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            selectedResort.conditions.weeklyRainfall && selectedResort.conditions.weeklyRainfall > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Weekly Rain:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 638,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-300 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.weeklyRainfall.toFixed(2),
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 639,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 637,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Base Depth:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 643,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.snowDepth,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 644,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 642,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Temperature:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 647,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-600 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.baseTemp,
                                            "°F"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 648,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 646,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Wind:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 651,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold",
                                        children: [
                                            selectedResort.conditions.windSpeed,
                                            " mph"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 652,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 650,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Visibility:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 655,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold",
                                        children: selectedResort.conditions.visibility
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 656,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 654,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            (selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "block mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition",
                                children: "View Full Report →"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 659,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 621,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 618,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ResortMap.tsx",
        lineNumber: 570,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ResortMap, "lOMEqAdsJYqeM/+YaTORbNZPOzE=");
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