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
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Example NOAA endpoints (public):
// MRMS tiled PNGs: https://mrms.ncep.noaa.gov/data/2D/PrecipRate/ (z/x/y.png)
// NEXRAD tiled: https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi (WMS)
// QPE tiled: https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms.cgi (WMS)
// For demo: Use Iowa State Mesonet for frame times (NEXRAD, MRMS, QPE)
const SOURCES = [
    {
        name: 'NEXRAD',
        url: 'https://mesonet.agron.iastate.edu/json/radar/nexrad_n0q.json',
        parse: (json)=>json && json.timestamps ? json.timestamps : []
    },
    {
        name: 'MRMS',
        url: 'https://mesonet.agron.iastate.edu/json/radar/mrms_ref.json',
        parse: (json)=>json && json.timestamps ? json.timestamps : []
    },
    {
        name: 'QPE',
        url: 'https://mesonet.agron.iastate.edu/json/radar/mrms_qpe.json',
        parse: (json)=>json && json.timestamps ? json.timestamps : []
    }
];
async function GET() {
    try {
        // Fetch all sources in parallel
        const results = await Promise.all(SOURCES.map(async (src)=>{
            try {
                const res = await fetch(src.url);
                if (!res.ok) return [];
                const json = await res.json();
                return src.parse(json).map((t)=>({
                        time: t,
                        source: src.name
                    }));
            } catch  {
                return [];
            }
        }));
        // Merge and deduplicate frames by time (ISO8601 or epoch seconds)
        const allFrames = [].concat(...results);
        // Sort descending (most recent first)
        allFrames.sort((a, b)=>a.time < b.time ? 1 : -1);
        // Remove duplicates (keep all sources for a time)
        const seen = new Set();
        const merged = allFrames.filter((f)=>{
            if (seen.has(f.time)) return false;
            seen.add(f.time);
            return true;
        });
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            frames: merged
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'fetch_failed',
            message: String(e)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f45cc5a2._.js.map