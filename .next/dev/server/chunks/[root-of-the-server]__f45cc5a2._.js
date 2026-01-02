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
        console.log('[Radar Frames] Generating synthetic frames from real weather data...');
        // Generate synthetic frames only: every hour for last 48 hours
        const now = Date.now();
        const frames = [];
        // Synthetic data: every hour for last 48 hours (48 frames total)
        const totalHours = 48;
        const intervalMinutes = 60; // 1 frame per hour
        const totalFrames = totalHours; // 48 frames for 48 hours
        for(let i = 0; i < totalFrames; i++){
            const timestamp = now - (totalFrames - 1 - i) * intervalMinutes * 60 * 1000; // Start from oldest (47h ago) to newest (current)
            frames.push({
                time: Math.floor(timestamp / 1000),
                url: `synthetic-${timestamp}` // Synthetic layer identifier
            });
        }
        console.log(`[Radar Frames] Generated ${frames.length} synthetic frames (1 per hour, ${totalHours}h coverage)`);
        const result = {
            radar: {
                past: frames,
                source: 'synthetic-real-data'
            },
            metadata: {
                count: frames.length,
                source: 'synthetic',
                updateFrequency: `${intervalMinutes} minutes`,
                coverage: 'Northeast US (based on real weather station data)',
                timeRange: `Last ${totalHours} hours (${intervalMinutes}min intervals)`,
                reference: 'IDW interpolation of historical resort weather station data'
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
    // Fallback: Generate synthetic frames if main logic fails
    const now = Date.now();
    const frames = [];
    // Generate 30-minute interval frames for last 48 hours as fallback
    const totalHours = 48;
    const intervalMinutes = 30;
    const totalFrames = totalHours * 60 / intervalMinutes;
    for(let i = 0; i < totalFrames; i++){
        const timestamp = now - (totalFrames - 1 - i) * intervalMinutes * 60 * 1000; // Start from oldest to newest
        frames.push({
            time: Math.floor(timestamp / 1000),
            url: `synthetic-${timestamp}`
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        radar: {
            past: frames,
            source: 'synthetic-fallback'
        },
        metadata: {
            source: 'synthetic-fallback',
            note: 'Using synthetic fallback frame generation',
            count: frames.length,
            timeRange: `Last ${totalHours} hours (${intervalMinutes}min intervals)`
        }
    }, {
        status: 200
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f45cc5a2._.js.map