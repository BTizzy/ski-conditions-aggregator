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
"[project]/lib/resorts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resorts",
    ()=>resorts
]);
const resorts = [
    // --- Top Priority Resorts ---
    {
        id: 'loon-mountain',
        name: 'Loon Mountain',
        state: 'NH',
        lat: 44.0367,
        lon: -71.6217,
        scrapeUrl: 'https://www.loonmtn.com/mountain-info/conditions'
    },
    {
        id: 'sunday-river',
        name: 'Sunday River',
        state: 'ME',
        lat: 44.4722,
        lon: -70.8567,
        scrapeUrl: 'https://www.sundayriver.com/mountain-info/conditions'
    },
    {
        id: 'sugarloaf',
        name: 'Sugarloaf',
        state: 'ME',
        lat: 45.0311,
        lon: -70.3133,
        scrapeUrl: 'https://www.sugarloaf.com/conditions'
    },
    // --- Major Vermont Resorts ---
    {
        id: 'stowe',
        name: 'Stowe',
        state: 'VT',
        lat: 44.4654,
        lon: -72.6874,
        scrapeUrl: 'https://www.stowe.com/the-mountain/mountain-conditions/'
    },
    {
        id: 'killington',
        name: 'Killington',
        state: 'VT',
        lat: 43.6045,
        lon: -72.8201,
        scrapeUrl: 'https://www.killington.com/the-mountain/mountain-conditions'
    },
    {
        id: 'sugarbush',
        name: 'Sugarbush',
        state: 'VT',
        lat: 44.1436,
        lon: -72.8944,
        scrapeUrl: 'https://www.sugarbush.com/mountain-info/conditions/'
    },
    {
        id: 'okemo',
        name: 'Okemo',
        state: 'VT',
        lat: 43.4036,
        lon: -72.7202,
        scrapeUrl: 'https://www.okemo.com/the-mountain/mountain-conditions/'
    },
    {
        id: 'mount-snow',
        name: 'Mount Snow',
        state: 'VT',
        lat: 42.9606,
        lon: -72.9205,
        scrapeUrl: 'https://www.mountsnow.com/the-mountain/mountain-conditions/'
    },
    {
        id: 'stratton',
        name: 'Stratton',
        state: 'VT',
        lat: 43.1135,
        lon: -72.9205,
        scrapeUrl: 'https://www.stratton.com/the-mountain/mountain-conditions'
    },
    {
        id: 'jay-peak',
        name: 'Jay Peak',
        state: 'VT',
        lat: 44.9242,
        lon: -72.5316,
        scrapeUrl: 'https://jaypeakresort.com/ski-ride/conditions'
    },
    {
        id: 'smugglers-notch',
        name: "Smugglers' Notch",
        state: 'VT',
        lat: 44.5884,
        lon: -72.7815,
        scrapeUrl: 'https://www.smuggs.com/pages/winter/skiride/conditions.php'
    },
    {
        id: 'bromley',
        name: 'Bromley',
        state: 'VT',
        lat: 43.2137,
        lon: -72.9362,
        scrapeUrl: 'https://www.bromley.com/the-mountain/conditions/'
    },
    {
        id: 'mad-river-glen',
        name: 'Mad River Glen',
        state: 'VT',
        lat: 44.2019,
        lon: -72.9172,
        scrapeUrl: 'https://www.madriverglen.com/mountain-info/conditions'
    },
    // --- Major New Hampshire Resorts ---
    {
        id: 'bretton-woods',
        name: 'Bretton Woods',
        state: 'NH',
        lat: 44.2547,
        lon: -71.4417,
        scrapeUrl: 'https://www.brettonwoods.com/mountain-info/conditions'
    },
    {
        id: 'cannon-mountain',
        name: 'Cannon Mountain',
        state: 'NH',
        lat: 44.1786,
        lon: -71.6981,
        scrapeUrl: 'https://www.cannonmt.com/mountain-info/conditions'
    },
    {
        id: 'waterville-valley',
        name: 'Waterville Valley',
        state: 'NH',
        lat: 43.9506,
        lon: -71.5072,
        scrapeUrl: 'https://www.waterville.com/mountain-report'
    },
    {
        id: 'wildcat',
        name: 'Wildcat',
        state: 'NH',
        lat: 44.2581,
        lon: -71.2256,
        scrapeUrl: 'https://www.skiwildcat.com/the-mountain/mountain-conditions'
    },
    {
        id: 'attitash',
        name: 'Attitash',
        state: 'NH',
        lat: 44.0822,
        lon: -71.2292,
        scrapeUrl: 'https://www.attitash.com/the-mountain/mountain-conditions'
    },
    {
        id: 'cranmore',
        name: 'Cranmore',
        state: 'NH',
        lat: 44.0584,
        lon: -71.1284,
        scrapeUrl: 'https://www.cranmore.com/conditions'
    },
    // --- Southern New Hampshire additions ---
    {
        id: 'pats-peak',
        name: "Pats Peak",
        state: 'NH',
        lat: 43.0740,
        lon: -71.7508,
        // approximate base and summit elevations (ft). These are best-effort values and can be updated later.
        baseElevationFt: 620,
        summitElevationFt: 1030,
        scrapeUrl: 'https://www.patspeak.com',
        conditionsUrl: 'https://www.patspeak.com/conditions'
    },
    {
        id: 'mount-sunapee',
        name: 'Mount Sunapee',
        state: 'NH',
        lat: 43.3337,
        lon: -72.0586,
        baseElevationFt: 1600,
        summitElevationFt: 2743,
        scrapeUrl: 'https://www.mountsunapee.com',
        conditionsUrl: 'https://www.mountsunapee.com/mountain/conditions'
    },
    {
        id: 'gunstock',
        name: 'Gunstock',
        state: 'NH',
        lat: 43.5792,
        lon: -71.4246,
        baseElevationFt: 600,
        summitElevationFt: 2240,
        scrapeUrl: 'https://www.gunstock.com',
        conditionsUrl: 'https://www.gunstock.com/mountain-report'
    },
    {
        id: 'crotched-mountain',
        name: 'Crotched Mountain',
        state: 'NH',
        lat: 42.8537,
        lon: -71.6146,
        baseElevationFt: 400,
        summitElevationFt: 2066,
        scrapeUrl: 'https://www.crotchedmountain.org',
        conditionsUrl: 'https://www.crotchedmountain.org/mountain-report'
    },
    {
        id: 'mcintyre',
        name: 'McIntyre Ski Area',
        state: 'NH',
        lat: 42.9955,
        lon: -71.4601,
        baseElevationFt: 200,
        summitElevationFt: 350,
        scrapeUrl: 'https://www.mcintyreskiarea.com',
        conditionsUrl: 'https://www.mcintyreskiarea.com/conditions'
    },
    {
        id: 'ragged-mountain',
        name: 'Ragged Mountain',
        state: 'NH',
        lat: 43.2986,
        lon: -71.8514,
        baseElevationFt: 600,
        summitElevationFt: 1350,
        scrapeUrl: 'https://skiragged.com',
        conditionsUrl: 'https://skiragged.com/mountain-report'
    },
    // --- Additional Maine Resorts ---
    {
        id: 'saddleback',
        name: 'Saddleback',
        state: 'ME',
        lat: 44.9531,
        lon: -70.5272,
        scrapeUrl: 'https://www.saddlebackmaine.com/conditions/'
    },
    {
        id: 'squaw-mountain',
        name: 'Squaw Mountain',
        state: 'ME',
        lat: 44.0822,
        lon: -70.7567,
        scrapeUrl: 'https://www.squawmt.com/conditions/'
    },
    // --- Massachusetts Resorts ---
    {
        id: 'jiminy-peak',
        name: 'Jiminy Peak',
        state: 'MA',
        lat: 42.5556,
        lon: -73.2922,
        scrapeUrl: 'https://www.jiminypeak.com/mountain/conditions'
    },
    {
        id: 'wachusett',
        name: 'Wachusett',
        state: 'MA',
        lat: 42.5031,
        lon: -71.8867,
        scrapeUrl: 'https://www.wachusett.com/The-Mountain/Conditions.aspx'
    },
    // --- New York Resorts ---
    {
        id: 'whiteface',
        name: 'Whiteface',
        state: 'NY',
        lat: 44.3656,
        lon: -73.9022,
        scrapeUrl: 'https://whiteface.com/conditions'
    },
    {
        id: 'gore-mountain',
        name: 'Gore Mountain',
        state: 'NY',
        lat: 43.6747,
        lon: -74.0061,
        scrapeUrl: 'https://goremountain.com/conditions/'
    },
    {
        id: 'hunter-mountain',
        name: 'Hunter Mountain',
        state: 'NY',
        lat: 42.2022,
        lon: -74.2331,
        scrapeUrl: 'https://www.huntermtn.com/the-mountain/mountain-conditions'
    },
    {
        id: 'windham-mountain',
        name: 'Windham Mountain',
        state: 'NY',
        lat: 42.2917,
        lon: -74.2581,
        scrapeUrl: 'https://www.windhammountain.com/the-mountain/mountain-conditions'
    },
    {
        id: 'belleayre',
        name: 'Belleayre',
        state: 'NY',
        lat: 42.1356,
        lon: -74.5061,
        scrapeUrl: 'https://www.belleayre.com/conditions/'
    },
    // --- Pennsylvania Resorts ---
    {
        id: 'jack-frost-big-boulder',
        name: 'Jack Frost Big Boulder',
        state: 'PA',
        lat: 41.1081,
        lon: -75.6581,
        scrapeUrl: 'https://www.jfbb.com/conditions/'
    },
    {
        id: 'elk-mountain',
        name: 'Elk Mountain',
        state: 'PA',
        lat: 41.7131,
        lon: -75.5781,
        scrapeUrl: 'https://www.elkskier.com/conditions/'
    },
    {
        id: 'blue-mountain',
        name: 'Blue Mountain',
        state: 'PA',
        lat: 40.8117,
        lon: -75.5217,
        scrapeUrl: 'https://www.skibluemt.com/mountain-report/'
    },
    {
        id: 'seven-springs',
        name: 'Seven Springs',
        state: 'PA',
        lat: 40.0231,
        lon: -79.2981,
        scrapeUrl: 'https://www.7springs.com/conditions/'
    },
    // --- Connecticut Resorts ---
    {
        id: 'mount-southington',
        name: 'Mount Southington',
        state: 'CT',
        lat: 41.5992,
        lon: -72.9272,
        scrapeUrl: 'https://mountsouthington.com/conditions/'
    },
    {
        id: 'powder-ridge',
        name: 'Powder Ridge',
        state: 'CT',
        lat: 41.4992,
        lon: -72.8272,
        scrapeUrl: 'https://www.powderridgepark.com/conditions/'
    },
    // --- New Jersey Resorts ---
    {
        id: 'mountain-creek',
        name: 'Mountain Creek',
        state: 'NJ',
        lat: 41.1822,
        lon: -74.5081,
        scrapeUrl: 'https://www.mountaincreek.com/mountain/conditions/'
    },
    {
        id: 'campgaw-mountain',
        name: 'Campgaw Mountain',
        state: 'NJ',
        lat: 41.0481,
        lon: -74.2081,
        scrapeUrl: 'https://www.campgaw.com/conditions/'
    },
    // --- Additional New Hampshire Resorts ---
    {
        id: 'black-mountain',
        name: 'Black Mountain',
        state: 'NH',
        lat: 44.1667,
        lon: -71.1667,
        scrapeUrl: 'https://www.blackmt.com/conditions/'
    }
];
// Post-process to compute elevationFt for entries that provide base+summit
for (const r of resorts){
    if (r.baseElevationFt !== undefined && r.summitElevationFt !== undefined && (r.elevationFt === undefined || r.elevationFt === null)) {
        // midpoint elevation (average) between base lodge and summit
        r.elevationFt = Math.round((r.baseElevationFt + r.summitElevationFt) / 2 * 10) / 10;
    }
    // Keep object shape consistent: ensure elevationFt is number or undefined
    if (r.elevationFt === undefined) delete r.elevationFt;
}
}),
"[project]/app/api/resorts/conditions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/resorts.ts [app-route] (ecmascript)");
;
;
const dynamic = 'force-dynamic';
const revalidate = 60; // Cache 1 minute
async function GET(request) {
    try {
        console.log('[Resorts Conditions] Fetching conditions for all resorts...');
        // Fetch conditions for all resorts in parallel
        const resortPromises = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resorts"].map(async (resort)=>{
            try {
                // Call the existing scrape API for each resort
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/scrape?resortId=${resort.id}`, {
                    next: {
                        revalidate: 60
                    }
                });
                if (!response.ok) {
                    console.warn(`[Resorts Conditions] Failed to fetch ${resort.name}: ${response.status}`);
                    return {
                        id: resort.id,
                        name: resort.name,
                        lat: resort.lat,
                        lon: resort.lon,
                        conditions: null,
                        error: `HTTP ${response.status}`
                    };
                }
                const conditions = await response.json();
                return {
                    id: resort.id,
                    name: resort.name,
                    lat: resort.lat,
                    lon: resort.lon,
                    conditions: {
                        snowDepth: conditions.snowDepth || 0,
                        recentSnowfall: conditions.recentSnowfall || 0,
                        weeklySnowfall: conditions.weeklySnowfall || 0,
                        baseTemp: conditions.baseTemp || 20,
                        windSpeed: conditions.windSpeed || 0,
                        visibility: conditions.visibility || 'Good',
                        timestamp: conditions.timestamp
                    }
                };
            } catch (error) {
                console.warn(`[Resorts Conditions] Error fetching ${resort.name}:`, error);
                return {
                    id: resort.id,
                    name: resort.name,
                    lat: resort.lat,
                    lon: resort.lon,
                    conditions: null,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
        const results = await Promise.all(resortPromises);
        // Filter out resorts with errors and keep only those with valid conditions
        const validResorts = results.filter((r)=>r.conditions !== null);
        console.log(`[Resorts Conditions] Returning ${validResorts.length}/${results.length} resorts with conditions`);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            resorts: validResorts,
            metadata: {
                total: results.length,
                valid: validResorts.length,
                timestamp: new Date().toISOString()
            }
        });
        response.headers.set('Cache-Control', 'public, max-age=60');
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error) {
        console.error('[Resorts Conditions] Error:', error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__beb5e955._.js.map