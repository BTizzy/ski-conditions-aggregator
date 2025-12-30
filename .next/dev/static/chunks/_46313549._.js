(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/resorts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/resorts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// Dynamically import the map component to avoid SSR issues with Leaflet
const ResortMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/app/components/ResortMap.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/app/components/ResortMap.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-blue-500 text-xl",
                children: "Loading map..."
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 10,
                columnNumber: 75
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 10,
            columnNumber: 18
        }, ("TURBOPACK compile-time value", void 0))
});
_c = ResortMap;
const fetchConditions = async (resortId)=>{
    const res = await fetch(`/api/scrape?resortId=${resortId}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};
const HomePage = ()=>{
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            // Load all resorts with proper rate limiting
            console.log(`Loading ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resorts"].length} resorts with rate limiting...`);
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resorts"].forEach({
                "HomePage.useEffect": (resort, index)=>{
                    setTimeout({
                        "HomePage.useEffect": ()=>{
                            setLoading({
                                "HomePage.useEffect": (l)=>({
                                        ...l,
                                        [resort.id]: true
                                    })
                            }["HomePage.useEffect"]);
                            fetchConditions(resort.id).then({
                                "HomePage.useEffect": (cond)=>setData({
                                        "HomePage.useEffect": (d)=>({
                                                ...d,
                                                [resort.id]: cond
                                            })
                                    }["HomePage.useEffect"])
                            }["HomePage.useEffect"]).catch({
                                "HomePage.useEffect": (e)=>{
                                    console.error(`Failed to load ${resort.name}:`, e);
                                    setError({
                                        "HomePage.useEffect": (er)=>({
                                                ...er,
                                                [resort.id]: e.message
                                            })
                                    }["HomePage.useEffect"]);
                                }
                            }["HomePage.useEffect"]).finally({
                                "HomePage.useEffect": ()=>setLoading({
                                        "HomePage.useEffect": (l)=>({
                                                ...l,
                                                [resort.id]: false
                                            })
                                    }["HomePage.useEffect"])
                            }["HomePage.useEffect"]);
                        }
                    }["HomePage.useEffect"], index * 2000); // 2 second delay between each request to avoid overwhelming APIs
                }
            }["HomePage.useEffect"]);
        }
    }["HomePage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen w-full bg-gradient-to-br from-blue-300 via-white to-blue-500 flex flex-col relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 -z-10 bg-[url('/ski-bg.jpg')] bg-cover bg-center opacity-20"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "relative z-10 p-6 text-center bg-white/10 backdrop-blur-sm rounded-lg mx-4 mt-4 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl tracking-tight flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSkiing"], {
                                className: "text-blue-300 drop-shadow-lg animate-bounce"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Northeast Ski Resort Conditions"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSnowboarding"], {
                                className: "text-blue-300 drop-shadow-lg animate-bounce"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-blue-100 text-lg font-medium drop-shadow-lg",
                        children: "Interactive map showing real-time weather conditions"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResortMap, {
                    resorts: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resorts"],
                    conditions: data,
                    loading: loading,
                    errors: error
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "relative z-10 p-4 text-center text-blue-800 opacity-90 font-semibold drop-shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "© ",
                            new Date().getFullYear(),
                            " Ski Conditions Aggregator"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-blue-400 text-sm mt-1",
                        children: "Designed for snow lovers — Feel the mountain vibes!"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(HomePage, "0Vf4e2ywRpGQhx3ohkUVARLpEW8=");
_c1 = HomePage;
const __TURBOPACK__default__export__ = HomePage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ResortMap");
__turbopack_context__.k.register(_c1, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_46313549._.js.map