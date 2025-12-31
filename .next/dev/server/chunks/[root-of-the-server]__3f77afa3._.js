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
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const dynamic = 'force-dynamic';
async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const layer = searchParams.get('layer');
        const z = searchParams.get('z');
        const x = searchParams.get('x');
        const y = searchParams.get('y');
        if (!z || !x || !y || !layer) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing parameters. Required: layer, z, x, y'
            }, {
                status: 400
            });
        }
        const zNum = parseInt(z);
        const xNum = parseInt(x);
        const yNum = parseInt(y);
        if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid tile coordinates'
            }, {
                status: 400
            });
        }
        if (zNum < 0 || zNum > 18) return getTransparentTile();
        const maxTile = Math.pow(2, zNum);
        if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
            return getTransparentTile();
        }
        let tileUrl;
        // DETECT SOURCE: RainViewer or Mesonet
        if (layer.startsWith('http')) {
            // RainViewer: layer is a URL template like "https://tile.rainviewer.com/v2/radar/1704033600/{z}/{x}/{y}/..."
            // Replace {z}, {x}, {y} with actual coordinates
            tileUrl = layer.replace('{z}', String(zNum)).replace('{x}', String(xNum)).replace('{y}', String(yNum));
            console.log(`[Tile] RainViewer: z=${zNum} x=${xNum} y=${yNum}`);
        } else if (layer.startsWith('nexrad-n0q')) {
            // Mesonet: layer name like "nexrad-n0q-m15m"
            // Validate Mesonet layer format
            if (!/^nexrad-n0q(-m\d{2}m)?$/.test(layer)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid Mesonet layer'
                }, {
                    status: 400
                });
            }
            tileUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/${layer}/${zNum}/${xNum}/${yNum}.png`;
            console.log(`[Tile] Mesonet: layer=${layer} z=${zNum}`);
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid layer format'
            }, {
                status: 400
            });
        }
        // Fetch tile from source
        const response = await fetch(tileUrl, {
            headers: {
                'User-Agent': 'ski-conditions-aggregator',
                'Accept': 'image/png,image/webp,*/*'
            },
            next: {
                revalidate: 300
            } // Cache 5 minutes
        });
        if (!response.ok) {
            console.warn(`[Tile] Source returned ${response.status}`);
            return getTransparentTile();
        }
        const imageBuffer = await response.arrayBuffer();
        if (imageBuffer.byteLength === 0) return getTransparentTile();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=300',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('[Tile] Error:', error.message);
        return getTransparentTile();
    }
}
function getTransparentTile() {
    // 1x1 transparent PNG
    const transparentPng = Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x0d,
        0x49,
        0x48,
        0x44,
        0x52,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x01,
        0x08,
        0x06,
        0x00,
        0x00,
        0x00,
        0x1f,
        0x15,
        0xc4,
        0x89,
        0x00,
        0x00,
        0x00,
        0x0a,
        0x49,
        0x44,
        0x41,
        0x54,
        0x78,
        0x9c,
        0x63,
        0x00,
        0x01,
        0x00,
        0x00,
        0x05,
        0x00,
        0x01,
        0x0d,
        0x0a,
        0x2d,
        0xb4,
        0x00,
        0x00,
        0x00,
        0x00,
        0x49,
        0x45,
        0x4e,
        0x44,
        0xae,
        0x42,
        0x60,
        0x82
    ]);
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](transparentPng, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3f77afa3._.js.map