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
"[project]/app/api/radar/frames/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const dynamic = 'force-dynamic';
const revalidate = 300; // Cache for 5 minutes
async function GET(request) {
    try {
        console.log('[Radar Frames] Fetching RainViewer API...');
        // Get current RainViewer radar layers
        // This returns both historical and forecast layers with timestamps
        const res = await fetch('https://api.rainviewer.com/public/weather-maps-api-v2/GetWeatherMapsList', {
            method: 'GET',
            headers: {
                'User-Agent': 'ski-conditions-aggregator'
            }
        });
        if (!res.ok) {
            console.error('[Radar Frames] RainViewer API error:', res.status);
            throw new Error(`RainViewer returned ${res.status}`);
        }
        const data = await res.json();
        console.log('[Radar Frames] RainViewer response:', data);
        // Extract historical radar layers (past 48 hours at 10-min intervals)
        // RainViewer returns: { radar: { nowcast: [...], archive: [...] } }
        const archiveLayers = data?.radar?.archive || [];
        if (archiveLayers.length === 0) {
            console.warn('[Radar Frames] No archive layers found, using fallback');
            return fallbackResponse();
        }
        // Each archive layer has { time: millisecondsSinceEpoch, url: "tile URL pattern" }
        // Extract just the timestamps and base URLs
        const layers = archiveLayers.map((layer)=>({
                timestamp: layer.time,
                url: layer.url
            }));
        console.log(`[Radar Frames] Got ${layers.length} archive layers covering 48h`);
        const result = {
            radar: {
                layers: layers,
                source: 'rainviewer-48h'
            },
            metadata: {
                count: layers.length,
                source: 'rainviewer-api-v2',
                updateFrequency: '10 minutes',
                coverage: 'Worldwide',
                timeRange: 'Last 48 hours (10-min intervals)',
                reference: 'https://www.rainviewer.com/api.html'
            }
        };
        const res2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
        res2.headers.set('Cache-Control', 'public, max-age=300');
        res2.headers.set('Access-Control-Allow-Origin', '*');
        return res2;
    } catch (error) {
        console.error('[Radar Frames] Error:', error.message);
        return fallbackResponse();
    }
}
function fallbackResponse() {
    // Fallback: Return Mesonet format (1-hour, 12 frames) if RainViewer fails
    const layers = [
        'nexrad-n0q-m55m',
        'nexrad-n0q-m50m',
        'nexrad-n0q-m45m',
        'nexrad-n0q-m40m',
        'nexrad-n0q-m35m',
        'nexrad-n0q-m30m',
        'nexrad-n0q-m25m',
        'nexrad-n0q-m20m',
        'nexrad-n0q-m15m',
        'nexrad-n0q-m10m',
        'nexrad-n0q-m05m',
        'nexrad-n0q'
    ];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        radar: {
            layers
        },
        metadata: {
            source: 'mesonet-fallback',
            note: 'RainViewer failed, using 1-hour Mesonet data'
        }
    }, {
        status: 200
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f45cc5a2._.js.map