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
}),
"[project]/lib/nws.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNWSGridpoint",
    ()=>getNWSGridpoint,
    "getNWSObservation",
    ()=>getNWSObservation
]);
async function getNWSGridpoint(lat, lon) {
    const url = `https://api.weather.gov/points/${lat},${lon}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'ski-conditions-aggregator'
        }
    });
    if (!res.ok) throw new Error('Failed to get NWS gridpoint');
    const data = await res.json();
    return {
        office: data.properties.gridId,
        gridX: data.properties.gridX,
        gridY: data.properties.gridY
    };
}
async function getNWSObservation(lat, lon) {
    const grid = await getNWSGridpoint(lat, lon);
    const url = `https://api.weather.gov/gridpoints/${grid.office}/${grid.gridX},${grid.gridY}/forecast`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'ski-conditions-aggregator'
        }
    });
    if (!res.ok) throw new Error('Failed to get NWS forecast');
    const data = await res.json();
    const period = data.properties.periods[0];
    return {
        temperature: period.temperature,
        windSpeed: period.windSpeed ? parseInt(period.windSpeed) : null,
        windDirection: period.windDirection || null,
        textDescription: period.shortForecast,
        icon: period.icon,
        timestamp: period.startTime,
        raw: period
    };
}
}),
"[project]/lib/weather.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchCurrentWeather",
    ()=>fetchCurrentWeather
]);
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
async function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function fetchWithRetry(url, retries = 3, backoff = 1000) {
    for(let i = 0; i < retries; i++){
        try {
            const response = await fetch(url);
            if (response.ok) return response;
            if (response.status === 429) {
                await delay(backoff * Math.pow(2, i));
                continue;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            await delay(backoff * Math.pow(2, i));
        }
    }
    throw new Error('Max retries exceeded');
}
async function fetchCurrentWeather(lat, lon) {
    if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeather API key not configured');
    }
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    try {
        const response = await fetchWithRetry(url);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid response type: ${contentType}`);
        }
        const data = await response.json();
        // Check if the response contains an error
        if (data.cod && data.cod !== 200) {
            throw new Error(`OpenWeather API error: ${data.cod}`);
        }
        // Parse the data
        const temp = data.main.temp;
        const snowDepth = data.snow?.['1h'] ? data.snow['1h'] * 39.37 : 0; // Convert mm to inches
        const windSpeed = data.wind.speed;
        const visibility = data.visibility || 16093; // Default to 10 miles in meters
        return {
            temp,
            snowDepth,
            windSpeed,
            visibility
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
}
}),
"[project]/app/api/scrape/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/resorts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$nws$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/nws.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$weather$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/weather.ts [app-route] (ecmascript)");
;
;
;
;
// Resort-specific scraping removed. All logic now uses NWS-based predictive model.
async function scrapeResortConditions(url, resortId) {
    // No-op: always return zeros/nulls for legacy fields
    return {
        snowDepth: 0,
        recentSnowfall: 0,
        trailOpen: 0,
        trailTotal: 0,
        groomed: 0,
        baseTemp: null,
        windSpeed: null,
        visibility: null,
        rawHtml: null
    };
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const resortId = searchParams.get('resortId');
    if (!resortId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'resortId required'
        }, {
            status: 400
        });
    }
    const resort = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resorts"].find((r)=>r.id === resortId);
    if (!resort) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Resort not found'
        }, {
            status: 404
        });
    }
    try {
        // Fetch OpenWeather data for snowfall
        let weatherData = null;
        try {
            weatherData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$weather$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCurrentWeather"])(resort.lat, resort.lon);
        } catch (e) {
            console.warn(`Failed to fetch weather for ${resort.name}:`, e);
            weatherData = null;
        }
        // Fetch NWS weather for additional data
        let nws = null;
        try {
            nws = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$nws$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNWSObservation"])(resort.lat, resort.lon);
        } catch (e) {
            nws = null;
        }
        // Use real snowfall data from OpenWeather, fallback to NWS-based prediction
        const recentSnowfall = weatherData?.snowDepth || 0;
        const snowDepth = weatherData?.snowDepth || 0;
        // Predict resort conditions from NWS data (rules-based model)
        const elevationDiffFt = 2000; // TODO: use real elevation data
        const baseTemp = weatherData?.temp || (nws && nws.temperature !== null ? nws.temperature * 9 / 5 + 32 - elevationDiffFt / 1000 * 3 : 0);
        const windSpeed = weatherData?.windSpeed || (nws && nws.windSpeed !== null ? nws.windSpeed * 0.621371 : 0); // km/h to mph
        const visibility = nws ? nws.textDescription : 'Unknown';
        // Trail data is not available from our sources, so set to 0
        const trailOpen = 0;
        const trailTotal = 0;
        const groomed = 0;
        const conditions = {
            resortId,
            timestamp: new Date(),
            snowDepth,
            recentSnowfall,
            baseTemp,
            windSpeed,
            visibility,
            trailStatus: {
                open: trailOpen,
                total: trailTotal,
                groomed
            },
            rawData: {
                nws
            }
        };
        // TODO: Store in Supabase
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(conditions);
    } catch (error) {
        // If error is from scraping, return a clear error message
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message,
            type: 'scrape-failed'
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c91252a3._.js.map