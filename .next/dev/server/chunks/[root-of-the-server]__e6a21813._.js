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
"[project]/app/api/radar/lib/interpolation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// IDW (Inverse Distance Weighting) interpolation for gridded radar tiles
// See COPILOT_PROMPT.md for methodology and requirements
__turbopack_context__.s([
    "idwGrid",
    ()=>idwGrid
]);
// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
function idwGrid(points, width, height, lat0, lon0, lat1, lon1, options = {}) {
    const power = options.power ?? 2;
    const radius = options.radius ?? Infinity;
    const minPoints = options.minPoints ?? 1;
    const nodata = options.nodata ?? NaN;
    const data = [];
    for(let y = 0; y < height; y++){
        const row = [];
        const lat = lat0 + (lat1 - lat0) * (y / (height - 1));
        for(let x = 0; x < width; x++){
            const lon = lon0 + (lon1 - lon0) * (x / (width - 1));
            // Compute weights
            let sumWeights = 0;
            let sumValues = 0;
            let used = 0;
            for (const pt of points){
                const d = haversine(lat, lon, pt.lat, pt.lon);
                if (d === 0) {
                    row.push(pt.value);
                    used = -1;
                    break;
                }
                if (d <= radius) {
                    const w = 1 / Math.pow(d, power);
                    sumWeights += w;
                    sumValues += w * pt.value;
                    used++;
                }
            }
            if (used === -1) continue;
            if (used >= minPoints && sumWeights > 0) {
                row.push(sumValues / sumWeights);
            } else {
                row.push(nodata);
            }
        }
        data.push(row);
    }
    return {
        width,
        height,
        lat0,
        lon0,
        lat1,
        lon1,
        data
    };
}
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
"[project]/app/api/radar/lib/historical.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Historical NWS data fetching and processing for synthetic radar
// Fetches past 48 hours of observations from all stations within 50 miles of each resort
// Enhanced with OpenWeatherMap for better precipitation data
__turbopack_context__.s([
    "getAccumulatedRainfallAtLocation",
    ()=>getAccumulatedRainfallAtLocation,
    "getAccumulatedSnowfallAtLocation",
    ()=>getAccumulatedSnowfallAtLocation,
    "getAllResortAreaHistorical",
    ()=>getAllResortAreaHistorical,
    "getResortAreaHistorical",
    ()=>getResortAreaHistorical
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/resorts.ts [app-route] (ecmascript)");
;
// Cache for resort area historical data
let cachedResortData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
// Haversine distance calculation
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Find all weather stations within a radius using OpenWeatherMap API
async function findNearbyStations(lat, lon, radiusMiles = 50) {
    try {
        // Use OpenWeatherMap stations API to find stations near the location
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.warn('No OpenWeatherMap API key found, using fallback');
            return [];
        }
        // Convert miles to meters for the API
        const radiusMeters = radiusMiles * 1609.34;
        const url = `https://api.openweathermap.org/data/2.5/station/find?lat=${lat}&lon=${lon}&cnt=50&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch stations near ${lat},${lon}: ${response.status}`);
            return [];
        }
        const data = await response.json();
        const stations = [];
        for (const station of data || []){
            const stationLat = station.coord?.lat;
            const stationLon = station.coord?.lon;
            const stationId = station.id?.toString();
            if (stationLat && stationLon && stationId) {
                const distance = haversineDistance(lat, lon, stationLat, stationLon);
                if (distance <= radiusMiles) {
                    stations.push({
                        id: stationId,
                        lat: stationLat,
                        lon: stationLon
                    });
                }
            }
        }
        console.log(`Found ${stations.length} stations within ${radiusMiles} miles of ${lat},${lon}`);
        return stations;
    } catch (error) {
        console.error(`Error finding nearby stations:`, error);
        return [];
    }
}
// Fetch historical observations from OpenWeatherMap API for past 48 hours
async function fetchHistoricalObservations(stationId, stationLat, stationLon) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.warn('No OpenWeatherMap API key found, using synthetic data');
        return [];
    }
    try {
        // Get 5-day forecast data (3-hour intervals) for better precipitation accuracy
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${stationLat}&lon=${stationLon}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            if (forecastResponse.status === 429) {
                console.warn(`OpenWeatherMap API error: 429 (rate limit exceeded) for station ${stationId}`);
            } else {
                console.warn(`OpenWeatherMap API error: ${forecastResponse.status} for station ${stationId}`);
            }
            return [];
        }
        const forecastData = await forecastResponse.json();
        // Convert forecast data to observation format
        const observations = [];
        for (const item of forecastData.list){
            // Extract precipitation data (rain and snow are separate in OpenWeatherMap)
            const rainMm = item.rain?.['3h'] || 0; // Rain in last 3 hours
            const snowMm = item.snow?.['3h'] || 0; // Snow in last 3 hours
            const totalPrecipMm = rainMm + snowMm;
            const observation = {
                timestamp: new Date(item.dt * 1000).toISOString(),
                temperature: item.main?.temp || null,
                windSpeed: item.wind?.speed ? item.wind.speed * 3.6 : null,
                windDirection: item.wind?.deg || null,
                textDescription: item.weather?.[0]?.description || 'Unknown',
                icon: item.weather?.[0]?.icon || '',
                raw: {
                    ...item,
                    precipitation: totalPrecipMm > 0 ? {
                        value: totalPrecipMm,
                        unitCode: 'mm'
                    } : undefined,
                    temperature: item.main?.temp ? {
                        value: item.main.temp,
                        unitCode: 'C'
                    } : undefined,
                    // Store rain/snow separately for better snow estimation
                    rain: rainMm > 0 ? {
                        value: rainMm,
                        unitCode: 'mm'
                    } : undefined,
                    snow: snowMm > 0 ? {
                        value: snowMm,
                        unitCode: 'mm'
                    } : undefined
                }
            };
            observations.push(observation);
        }
        // If we have forecast data, also get current conditions for more recent data
        try {
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${stationLat}&lon=${stationLon}&appid=${apiKey}&units=metric`;
            const currentResponse = await fetch(currentUrl);
            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                // Add current observation if it's not already covered by forecast
                const currentTime = new Date().getTime() / 1000;
                const hasRecentData = observations.some((obs)=>{
                    const obsTime = new Date(obs.timestamp).getTime() / 1000;
                    return Math.abs(obsTime - currentTime) < 3600; // Within 1 hour
                });
                if (!hasRecentData) {
                    const currentObservation = {
                        timestamp: new Date().toISOString(),
                        temperature: currentData.main?.temp || null,
                        windSpeed: currentData.wind?.speed ? currentData.wind.speed * 3.6 : null,
                        windDirection: currentData.wind?.deg || null,
                        textDescription: currentData.weather?.[0]?.description || 'Unknown',
                        icon: currentData.weather?.[0]?.icon || '',
                        raw: {
                            ...currentData,
                            precipitation: undefined,
                            temperature: currentData.main?.temp ? {
                                value: currentData.main.temp,
                                unitCode: 'C'
                            } : undefined
                        }
                    };
                    observations.unshift(currentObservation); // Add at beginning
                }
            }
        } catch (currentError) {
            console.warn(`Failed to fetch current weather for station ${stationId}:`, currentError);
        // Continue with forecast data only
        }
        return observations;
    } catch (error) {
        console.warn(`Failed to fetch forecast data for station ${stationId}:`, error);
        return [];
    }
}
// Estimate snowfall and rainfall from precipitation data
function estimateSnowfall(precipMm, tempC, rainMm, snowMm) {
    // If we have direct rain/snow data from OpenWeatherMap, use it directly
    if (rainMm !== undefined && snowMm !== undefined) {
        const totalPrecipMm = rainMm + snowMm;
        if (totalPrecipMm <= 0) return {
            snowfallIn: 0,
            rainfallIn: 0
        };
        // Convert mm to inches
        const snowfallIn = snowMm / 25.4;
        const rainfallIn = rainMm / 25.4;
        return {
            snowfallIn,
            rainfallIn
        };
    }
    // Fallback to temperature-based estimation if no direct rain/snow data
    if (precipMm <= 0) return {
        snowfallIn: 0,
        rainfallIn: 0
    };
    const precipIn = precipMm / 25.4;
    let snowFraction = 0;
    if (tempC <= -10) snowFraction = 1.0;
    else if (tempC <= -2) snowFraction = 0.95;
    else if (tempC <= 0) snowFraction = 0.9;
    else if (tempC <= 3) snowFraction = 0.6;
    else snowFraction = 0.1;
    let ratio = 10; // default liquid to snow ratio
    if (tempC <= -10) ratio = 18;
    else if (tempC <= -2) ratio = 14;
    else if (tempC <= 0) ratio = 12;
    else if (tempC <= 3) ratio = 10;
    else ratio = 8;
    const snowfallIn = precipIn * ratio * snowFraction;
    const rainfallIn = precipIn * (1 - snowFraction);
    return {
        snowfallIn,
        rainfallIn
    };
}
// Process observations into hourly snowfall estimates with station location
function processHourlySnowfall(observations, stationLat, stationLon, stationId) {
    const hourly = {};
    for (const obs of observations){
        const timestamp = new Date(obs.timestamp);
        const hourKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
        // Get rain and snow data separately if available, otherwise fall back to total precipitation
        const rainMm = obs.raw?.rain?.value || 0;
        const snowMm = obs.raw?.snow?.value || 0;
        const totalPrecip = obs.raw?.precipitation?.value || 0;
        // If we don't have separate rain/snow data, assume all precipitation is rain (will be converted in estimateSnowfall)
        const effectiveRain = rainMm + snowMm > 0 ? rainMm : totalPrecip;
        const effectiveSnow = snowMm;
        const temp = obs.raw?.temperature?.value || obs.temperature || 0;
        if (!hourly[hourKey]) {
            hourly[hourKey] = {
                rain: 0,
                snow: 0,
                temp: 0,
                count: 0
            };
        }
        hourly[hourKey].rain += effectiveRain;
        hourly[hourKey].snow += effectiveSnow;
        hourly[hourKey].temp += temp;
        hourly[hourKey].count += 1;
    }
    const result = [];
    for (const [key, data] of Object.entries(hourly)){
        const [year, month, day, hour] = key.split('-').map(Number);
        const timestamp = new Date(year, month, day, hour).getTime();
        const avgTemp = data.temp / data.count;
        const { snowfallIn, rainfallIn } = estimateSnowfall(data.rain + data.snow, avgTemp, data.rain, data.snow);
        result.push({
            timestamp,
            snowfallIn,
            rainfallIn,
            lat: stationLat,
            lon: stationLon,
            stationId
        });
    }
    return result.sort((a, b)=>a.timestamp - b.timestamp);
}
// Fetch historical data for a single station
async function fetchStationHistorical(station) {
    try {
        const observations = await fetchHistoricalObservations(station.id, station.lat, station.lon);
        const hourlyData = processHourlySnowfall(observations, station.lat, station.lon, station.id);
        return {
            stationId: station.id,
            lat: station.lat,
            lon: station.lon,
            hourlyData
        };
    } catch (error) {
        console.warn(`Failed to fetch data for station ${station.id}:`, error);
        return {
            stationId: station.id,
            lat: station.lat,
            lon: station.lon,
            hourlyData: []
        };
    }
}
async function getResortAreaHistorical(resortId) {
    const resort = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resorts"].find((r)=>r.id === resortId);
    if (!resort) {
        throw new Error(`Resort ${resortId} not found`);
    }
    // Use the resort location directly as a "station"
    const stationData = await fetchStationHistorical({
        id: `${resortId}-resort`,
        lat: resort.lat,
        lon: resort.lon
    });
    return {
        resortId,
        stations: stationData.hourlyData.length > 0 ? [
            stationData
        ] : []
    };
}
function getAccumulatedSnowfallAtLocation(stationData, lat, lon, upToTimestamp) {
    // Find the closest station with data
    let closestStation = null;
    let minDistance = Infinity;
    for (const station of stationData){
        const distance = haversineDistance(lat, lon, station.lat, station.lon);
        if (distance < minDistance && station.hourlyData.length > 0) {
            minDistance = distance;
            closestStation = station;
        }
    }
    if (!closestStation) return 0;
    return closestStation.hourlyData.filter((h)=>h.timestamp <= upToTimestamp).reduce((sum, h)=>sum + h.snowfallIn, 0);
}
function getAccumulatedRainfallAtLocation(stationData, lat, lon, upToTimestamp) {
    // Find the closest station with data
    let closestStation = null;
    let minDistance = Infinity;
    for (const station of stationData){
        const distance = haversineDistance(lat, lon, station.lat, station.lon);
        if (distance < minDistance && station.hourlyData.length > 0) {
            minDistance = distance;
            closestStation = station;
        }
    }
    if (!closestStation) return 0;
    return closestStation.hourlyData.filter((h)=>h.timestamp <= upToTimestamp).reduce((sum, h)=>sum + h.rainfallIn, 0);
}
async function getAllResortAreaHistorical() {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedResortData && now - cacheTimestamp < CACHE_DURATION) {
        console.log(`[Historical] Using cached resort data (${Math.round((now - cacheTimestamp) / 1000)}s old)`);
        return cachedResortData;
    }
    console.log('[Historical] Fetching fresh resort area historical data...');
    const resortPromises = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$resorts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resorts"].map((resort)=>getResortAreaHistorical(resort.id));
    const resortData = await Promise.all(resortPromises);
    // Add additional weather stations across the Northeast for better radar coverage
    const northeastStations = await getNortheastWeatherStations();
    resortData.push(...northeastStations);
    // Cache the results
    cachedResortData = resortData;
    cacheTimestamp = now;
    console.log(`[Historical] Cached ${resortData.length} resort areas with weather data`);
    return resortData;
}
// Generate additional weather stations across the Northeast region
async function getNortheastWeatherStations() {
    // Define a grid of weather stations across the Northeast
    // Coverage: roughly Maine to Pennsylvania, west to Ohio
    // Reduced from 27 to 9 stations to avoid rate limiting
    const stations = [
        // Maine
        {
            lat: 43.6615,
            lon: -70.2553,
            name: 'Portland, ME'
        },
        // New Hampshire
        {
            lat: 43.2081,
            lon: -71.5376,
            name: 'Concord, NH'
        },
        // Vermont
        {
            lat: 44.2601,
            lon: -72.5754,
            name: 'Montpelier, VT'
        },
        // Massachusetts
        {
            lat: 42.3601,
            lon: -71.0589,
            name: 'Boston, MA'
        },
        // Connecticut
        {
            lat: 41.7658,
            lon: -72.6734,
            name: 'Hartford, CT'
        },
        // New York
        {
            lat: 40.7128,
            lon: -74.0060,
            name: 'New York, NY'
        },
        {
            lat: 42.6526,
            lon: -73.7562,
            name: 'Albany, NY'
        },
        // Pennsylvania
        {
            lat: 39.9526,
            lon: -75.1652,
            name: 'Philadelphia, PA'
        },
        // Additional grid point for coverage
        {
            lat: 43.0,
            lon: -74.0,
            name: 'Adirondacks'
        }
    ];
    const stationPromises = stations.map(async (station, index)=>{
        try {
            // Add delay between API calls to avoid rate limiting (1 second between calls)
            if (index > 0) {
                await new Promise((resolve)=>setTimeout(resolve, 1000));
            }
            const stationData = await fetchStationHistorical({
                id: `northeast-${index}`,
                lat: station.lat,
                lon: station.lon
            });
            return {
                resortId: `northeast-${station.name.replace(/[^a-zA-Z0-9]/g, '')}`,
                stations: stationData.hourlyData.length > 0 ? [
                    stationData
                ] : []
            };
        } catch (error) {
            console.warn(`Failed to create station for ${station.name}:`, error);
            return null;
        }
    });
    const stationData = await Promise.all(stationPromises);
    return stationData.filter((data)=>data !== null);
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$interpolation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/radar/lib/interpolation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$historical$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/radar/lib/historical.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pngjs$2f$lib$2f$png$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pngjs/lib/png.js [app-route] (ecmascript)");
;
;
;
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
        // Handle real weather data (based on resort observations and weather stations)
        if (layer.startsWith('synthetic-')) {
            // Layer is "synthetic-{timestamp}" but now uses real weather data
            const timestamp = parseInt(layer.split('-')[1]);
            if (isNaN(timestamp)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid synthetic timestamp'
                }, {
                    status: 400
                });
            }
            console.log(`[Tile] Real weather data: z=${zNum} x=${xNum} y=${yNum} time=${timestamp}`);
            // Generate tile with real weather data from resort observations and weather stations
            return await generatePurelySyntheticTile(zNum, xNum, yNum, timestamp);
        }
        // If we get here, it's an invalid layer format
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid layer format - only real weather data layers supported'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('[Tile] Error:', error.message);
        return getTransparentTile();
    }
}
// Generate real weather data points from resort observations and weather stations
async function generateRealWeatherDataPoints(timestamp) {
    try {
        // Fetch all resort area historical data including additional weather stations
        const resortAreaData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$historical$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllResortAreaHistorical"])();
        const realPoints = [];
        // Create Point objects at station locations with accumulated precipitation
        for (const resortArea of resortAreaData){
            for (const station of resortArea.stations){
                // Get accumulated snowfall and rainfall up to the given timestamp
                const snowfall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$historical$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAccumulatedSnowfallAtLocation"])(resortArea.stations, station.lat, station.lon, timestamp);
                const rainfall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$historical$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAccumulatedRainfallAtLocation"])(resortArea.stations, station.lat, station.lon, timestamp);
                // Combine snowfall and rainfall for total precipitation value
                // Weight snowfall more heavily as it's more visible on radar
                const totalPrecipitation = snowfall + rainfall * 0.1;
                // Only add points with meaningful precipitation
                if (totalPrecipitation > 0) {
                    realPoints.push({
                        lat: station.lat,
                        lon: station.lon,
                        value: totalPrecipitation
                    });
                }
            }
        }
        console.log(`[Tile] Generated ${realPoints.length} real weather data points for timestamp ${new Date(timestamp).toISOString()}`);
        return realPoints;
    } catch (error) {
        console.error('[Tile] Error generating real weather data points:', error.message);
        return [];
    }
}
// Convert tile coordinates to lat/lon bounds (EPSG:4326)
function getTileBoundsLatLon(z, x, y) {
    // Correct Web Mercator to lat/lon conversion
    const n = Math.pow(2, z);
    const lon0 = x / n * 360 - 180;
    const lon1 = (x + 1) / n * 360 - 180;
    // Correct latitude calculation
    const lat0 = (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * y / n))) - Math.PI / 2) * 180 / Math.PI;
    const lat1 = (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * (y + 1) / n))) - Math.PI / 2) * 180 / Math.PI;
    // WMS 1.3.0 BBOX format for EPSG:4326: minY,minX,maxY,maxX
    // Y is latitude (minY = southern lat, maxY = northern lat)
    // X is longitude (minX = western lon, maxX = eastern lon)
    const minLat = Math.min(lat0, lat1);
    const maxLat = Math.max(lat0, lat1);
    const minLon = Math.min(lon0, lon1);
    const maxLon = Math.max(lon0, lon1);
    return `${minLat},${minLon},${maxLat},${maxLon}`;
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
async function generatePurelySyntheticTile(z, x, y, timestamp) {
    try {
        // Get tile bounds
        const n = Math.pow(2, z);
        const lon0 = x / n * 360 - 180;
        const lat0 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
        const lon1 = (x + 1) / n * 360 - 180;
        const lat1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;
        // Generate real weather data points from resort observations and weather stations
        const realPoints = await generateRealWeatherDataPoints(timestamp);
        console.log(`[Tile] Real weather data z=${z} x=${x} y=${y} t=${new Date(timestamp).toISOString().slice(0, 16)}: ${realPoints.length} data points`);
        // If no real data is available, return transparent tile
        if (realPoints.length === 0) {
            console.log('[Tile] No real weather data available, returning transparent tile');
            return getTransparentTile();
        }
        // Use optimized interpolation parameters for realistic weather radar appearance
        const grid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$interpolation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["idwGrid"])(realPoints, 256, 256, lat0, lon0, lat1, lon1, {
            power: 2,
            radius: 150 // Larger radius for smoother blending between weather systems
        });
        // Create PNG with Doppler-style radar coloring
        const pngBuffer = createDopplerRadarPNG(grid.data);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](new Uint8Array(pngBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=300',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('[Tile] Error generating tile with real weather data:', error.message);
        return getTransparentTile();
    }
}
function createDopplerRadarPNG(data) {
    const width = data[0].length;
    const height = data.length;
    const png = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pngjs$2f$lib$2f$png$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PNG"]({
        width,
        height
    });
    // Apply simple smoothing to reduce extreme local variations
    const smoothedData = smoothGrid(data, 2); // 2-pixel smoothing radius for smoother radar appearance
    // Find max value for scaling (cap at reasonable snowfall amounts)
    let maxVal = 0;
    for (const row of smoothedData){
        for (const val of row){
            if (val > maxVal) maxVal = val;
        }
    }
    // Doppler radar color scale (similar to weather.com/Apple Maps)
    // Based on reflectivity levels, but adapted for snowfall intensity
    function getDopplerColor(intensity) {
        // Scale 0-1 where 1 is maximum snowfall
        const normalized = Math.min(intensity, 1);
        if (normalized < 0.1) return [
            0,
            0,
            0,
            0
        ]; // Transparent for very light/no snow
        if (normalized < 0.2) return [
            173,
            216,
            230,
            180
        ]; // Light blue
        if (normalized < 0.3) return [
            135,
            206,
            235,
            200
        ]; // Sky blue
        if (normalized < 0.4) return [
            70,
            130,
            180,
            220
        ]; // Steel blue
        if (normalized < 0.5) return [
            25,
            25,
            112,
            240
        ]; // Midnight blue
        if (normalized < 0.6) return [
            0,
            100,
            0,
            255
        ]; // Dark green
        if (normalized < 0.7) return [
            34,
            139,
            34,
            255
        ]; // Forest green
        if (normalized < 0.8) return [
            255,
            215,
            0,
            255
        ]; // Gold
        if (normalized < 0.9) return [
            255,
            140,
            0,
            255
        ]; // Dark orange
        if (normalized < 0.98) return [
            220,
            20,
            60,
            255
        ]; // Crimson (less bright red)
        return [
            139,
            0,
            0,
            255
        ]; // Dark red for absolute maximum
    }
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const val = smoothedData[y][x];
            const intensity = maxVal > 0 ? Math.min(val / Math.max(maxVal, 0.1), 1.0) : 0; // Clamp to [0,1]
            const [r, g, b, a] = getDopplerColor(intensity);
            const idx = width * y + x << 2;
            png.data[idx] = r; // R
            png.data[idx + 1] = g; // G
            png.data[idx + 2] = b; // B
            png.data[idx + 3] = a; // A
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pngjs$2f$lib$2f$png$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PNG"].sync.write(png);
}
// Simple box filter smoothing to reduce extreme local variations
function smoothGrid(data, radius) {
    const height = data.length;
    const width = data[0].length;
    const smoothed = [];
    for(let y = 0; y < height; y++){
        const row = [];
        for(let x = 0; x < width; x++){
            let sum = 0;
            let count = 0;
            // Average over a box around this pixel
            for(let dy = -radius; dy <= radius; dy++){
                for(let dx = -radius; dx <= radius; dx++){
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width && !isNaN(data[ny][nx])) {
                        sum += data[ny][nx];
                        count++;
                    }
                }
            }
            row.push(count > 0 ? sum / count : 0);
        }
        smoothed.push(row);
    }
    return smoothed;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e6a21813._.js.map