module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/radar/tile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Simple in-memory short-lived cache for the RainViewer frames JSON to avoid refetching on every tile request.
let framesCache = null;
const FRAMES_CACHE_TTL = 60 * 1000; // 1 minute
// In-memory tile cache: key -> { ts, contentType, buffer }
const tileCache = new Map();
const TILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Deduplicate concurrent fetches for the same tile
const pendingTileFetches = new Map();
async function fetchFramesList() {
    const now = Date.now();
    if (framesCache && now - framesCache.ts < FRAMES_CACHE_TTL) return framesCache.data;
    try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
            headers: {
                'User-Agent': 'ski-conditions-aggregator/1.0'
            }
        });
        if (!res.ok) throw new Error('frames_fetch_failed');
        const data = await res.json();
        framesCache = {
            ts: now,
            data
        };
        return data;
    } catch (e) {
        // keep existing cache if available
        if (framesCache) return framesCache.data;
        return null;
    }
}
function pickNearestTime(requested, availableTimes) {
    if (!availableTimes || availableTimes.length === 0) return requested;
    let best = availableTimes[0];
    let bestDiff = Math.abs(best - requested);
    for (const t of availableTimes){
        const d = Math.abs(t - requested);
        if (d < bestDiff) {
            best = t;
            bestDiff = d;
        }
    }
    return best;
}
async function GET(req) {
    try {
        const url = new URL(req.url);
        const timeParam = url.searchParams.get('time');
        const z = url.searchParams.get('z');
        const x = url.searchParams.get('x');
        const y = url.searchParams.get('y');
        if (!timeParam || !z || !x || !y) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'missing_params'
            }, {
                status: 400
            });
        }
        let requestedTime = Number(timeParam);
        if (Number.isNaN(requestedTime)) requestedTime = parseInt(timeParam, 10) || 0;
        // Try to fetch list of available frames and snap to nearest available time if requested is missing
        const framesData = await fetchFramesList();
        let availableTimes = [];
        let preferredHost = 'https://tilecache.rainviewer.com';
        if (framesData && framesData.radar) {
            const past = framesData.radar.past || [];
            const nowcast = framesData.radar.nowcast || [];
            const times = [];
            for (const f of past){
                times.push(f && (f.time || f) || 0);
            }
            for (const f of nowcast){
                times.push(f && (f.time || f) || 0);
            }
            availableTimes = times.filter(Boolean).sort((a, b)=>a - b);
            if (framesData.host) preferredHost = framesData.host.replace(/\/+$/, '');
        }
        // If requested time is not in availableTimes, pick nearest available (to reduce 404s)
        let usedTime = requestedTime;
        if (availableTimes.length > 0 && !availableTimes.includes(requestedTime)) {
            usedTime = pickNearestTime(requestedTime, availableTimes);
        }
        // Try multiple candidate hosts to increase chance of finding a tile
        const hostsToTry = [
            preferredHost,
            'https://tile.rainviewer.com',
            'https://tilecache.rainviewer.com'
        ];
        // Some RainViewer tile variants include extra path segments (e.g. "/2/1_0.png"). Try a few common suffix patterns.
        const tileSuffixes = [
            '{z}/{x}/{y}.png',
            '{z}/{x}/{y}/2/1_0.png',
            '{z}/{x}/{y}/2/0_0.png'
        ];
        const tried = [];
        const headers = {
            'User-Agent': 'ski-conditions-aggregator/1.0 (+https://localhost)',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            // Some RainViewer tiles may require a referer; use the public site origin which is commonly accepted
            'Referer': 'https://www.rainviewer.com/'
        };
        for (const host of hostsToTry){
            const sanitizedHost = host.replace(/\/+$/, '');
            for (const suffixTemplate of tileSuffixes){
                const suffix = suffixTemplate.replace('{z}', encodeURIComponent(z)).replace('{x}', encodeURIComponent(x)).replace('{y}', encodeURIComponent(y));
                const tileUrl = `${sanitizedHost}/v2/radar/${encodeURIComponent(usedTime)}/${suffix}`;
                // Check in-memory cache first
                try {
                    const cached = tileCache.get(tileUrl);
                    if (cached && Date.now() - cached.ts < TILE_CACHE_TTL) {
                        const respHeaders = new Headers();
                        respHeaders.set('Content-Type', cached.contentType || 'image/png');
                        respHeaders.set('Cache-Control', 'public, max-age=60');
                        respHeaders.set('Access-Control-Allow-Origin', '*');
                        respHeaders.set('Access-Control-Expose-Headers', 'X-RainViewer-Used-Host,X-RainViewer-Used-Time,X-RainViewer-Used-Suffix,X-Cache');
                        respHeaders.set('X-RainViewer-Used-Host', sanitizedHost);
                        respHeaders.set('X-RainViewer-Used-Time', String(usedTime));
                        respHeaders.set('X-Cache', 'HIT');
                        return new Response(Buffer.from(cached.buffer), {
                            status: 200,
                            headers: respHeaders
                        });
                    }
                } catch (e) {
                // ignore cache read errors and continue
                }
                // If there is already a pending fetch for this exact URL, await and return it
                if (pendingTileFetches.has(tileUrl)) {
                    try {
                        const pendingPromise = pendingTileFetches.get(tileUrl);
                        if (pendingPromise) {
                            const pendingResp = await pendingPromise;
                            try {
                                return pendingResp.clone();
                            } catch (e) {
                                return pendingResp;
                            }
                        }
                    } catch (e) {
                    // fall through to attempting fetch again
                    }
                }
                // perform fetch and record it in pending map to dedupe concurrent requests
                const fetchPromise = (async ()=>{
                    try {
                        const upstream = await fetch(tileUrl, {
                            headers
                        });
                        if (upstream.ok) {
                            const arrayBuffer = await upstream.arrayBuffer();
                            const buffer = new Uint8Array(arrayBuffer);
                            const ct = upstream.headers.get('content-type') || 'image/png';
                            // store in cache
                            try {
                                tileCache.set(tileUrl, {
                                    ts: Date.now(),
                                    contentType: ct,
                                    buffer
                                });
                            } catch (e) {}
                            const respHeaders = new Headers();
                            respHeaders.set('Content-Type', ct);
                            respHeaders.set('Cache-Control', 'public, max-age=60');
                            respHeaders.set('Access-Control-Allow-Origin', '*');
                            respHeaders.set('Access-Control-Expose-Headers', 'X-RainViewer-Used-Host,X-RainViewer-Used-Time,X-RainViewer-Used-Suffix,X-Cache');
                            respHeaders.set('X-RainViewer-Used-Host', sanitizedHost);
                            respHeaders.set('X-RainViewer-Used-Time', String(usedTime));
                            respHeaders.set('X-RainViewer-Used-Suffix', suffixTemplate);
                            respHeaders.set('X-Cache', 'MISS');
                            return new Response(Buffer.from(buffer), {
                                status: 200,
                                headers: respHeaders
                            });
                        }
                        tried.push({
                            host: sanitizedHost,
                            status: upstream.status,
                            url: tileUrl
                        });
                        return new Response(JSON.stringify({
                            error: 'upstream_tile_error',
                            status: upstream.status,
                            url: tileUrl
                        }), {
                            status: 502,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    } catch (e) {
                        tried.push({
                            host: sanitizedHost,
                            status: 0,
                            url: tileUrl
                        });
                        return new Response(JSON.stringify({
                            error: 'upstream_tile_error',
                            status: 0,
                            url: tileUrl
                        }), {
                            status: 502,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    } finally{
                        // cleanup pending map entry after a short delay to allow clones
                        setTimeout(()=>{
                            pendingTileFetches.delete(tileUrl);
                        }, 1000);
                    }
                })();
                pendingTileFetches.set(tileUrl, fetchPromise);
                const resp = await fetchPromise;
                // If we returned a successful image Response from inside fetchPromise, return it (clone to allow reuse)
                try {
                    return resp.clone();
                } catch (e) {
                    return resp;
                }
            }
        }
        // As a final fallback, try OpenWeather precipitation tiles if an API key is available.
        try {
            const owKey = process.env.OPENWEATHER_API_KEY || '';
            if (owKey) {
                const owUrl = `https://tile.openweathermap.org/map/precipitation_new/${encodeURIComponent(z)}/${encodeURIComponent(x)}/${encodeURIComponent(y)}.png?appid=${encodeURIComponent(owKey)}`;
                try {
                    const owResp = await fetch(owUrl, {
                        headers: {
                            'User-Agent': 'ski-conditions-aggregator/1.0'
                        }
                    });
                    if (owResp.ok) {
                        const ct = owResp.headers.get('content-type') || 'image/png';
                        const respHeaders = new Headers();
                        respHeaders.set('Content-Type', ct);
                        respHeaders.set('Cache-Control', 'public, max-age=60');
                        respHeaders.set('Access-Control-Allow-Origin', '*');
                        respHeaders.set('Access-Control-Expose-Headers', 'X-RainViewer-Used-Host,X-RainViewer-Used-Time,X-RainViewer-Used-Suffix,X-Cache');
                        respHeaders.set('X-RainViewer-Used-Host', 'openweathermap');
                        respHeaders.set('X-RainViewer-Used-Time', String(usedTime));
                        return new Response(owResp.body, {
                            status: 200,
                            headers: respHeaders
                        });
                    }
                    tried.push({
                        host: 'openweathermap',
                        status: owResp.status,
                        url: owUrl
                    });
                } catch (e) {
                    tried.push({
                        host: 'openweathermap',
                        status: 0,
                        url: owUrl
                    });
                }
            }
        } catch (e) {
        // ignore final-fallback errors
        }
        // If we reach here, no host returned a tile
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'upstream_tile_error',
            tried
        }, {
            status: 502
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'proxy_failed',
            message: String(e)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3f77afa3._.js.map