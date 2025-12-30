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
"[project]/lib/nws.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchStationObservations",
    ()=>fetchStationObservations,
    "getHistoricalObservations",
    ()=>getHistoricalObservations,
    "getNWSGridpoint",
    ()=>getNWSGridpoint,
    "getNWSObservation",
    ()=>getNWSObservation,
    "getNearestNWSStation",
    ()=>getNearestNWSStation
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
async function getNearestNWSStation(lat, lon) {
    try {
        const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pRes = await fetch(pointUrl, {
            headers: {
                'User-Agent': 'ski-conditions-aggregator'
            }
        });
        if (!pRes.ok) return {
            stationId: null,
            distanceKm: null
        };
        const pData = await pRes.json();
        const stationsUrl = pData.properties.observationStations;
        if (!stationsUrl) return {
            stationId: null,
            distanceKm: null
        };
        const sRes = await fetch(stationsUrl, {
            headers: {
                'User-Agent': 'ski-conditions-aggregator'
            }
        });
        if (!sRes.ok) return {
            stationId: null,
            distanceKm: null
        };
        const sData = await sRes.json();
        const stations = sData.features || sData;
        if (!stations || stations.length === 0) return {
            stationId: null,
            distanceKm: null
        };
        // pick first station and compute distance if coordinates available
        const first = stations[0];
        const coords = first && first.geometry && first.geometry.coordinates ? first.geometry.coordinates : null;
        if (!coords) return {
            stationId: first.properties?.stationIdentifier ?? null,
            distanceKm: null
        };
        const [stLon, stLat] = coords;
        const distanceKm = haversineKm(lat, lon, stLat, stLon);
        return {
            stationId: first.properties?.stationIdentifier ?? null,
            distanceKm
        };
    } catch (e) {
        return {
            stationId: null,
            distanceKm: null
        };
    }
}
async function fetchStationObservations(stationId, startISO, endISO) {
    try {
        // NWS API enforces a maximum "limit" (500). Use 500 to avoid 400 Bad Request responses.
        const url = `https://api.weather.gov/stations/${stationId}/observations?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&limit=500`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'ski-conditions-aggregator'
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.features || [];
    } catch (e) {
        return [];
    }
}
async function getHistoricalObservations(lat, lon, days = 7) {
    try {
        const { stationId, distanceKm } = await getNearestNWSStation(lat, lon);
        if (!stationId) return {
            observations: [],
            stationId: null,
            stationDistanceKm: null
        };
        const end = new Date();
        const start = new Date(end.getTime() - days * 24 * 3600 * 1000);
        const startISO = start.toISOString();
        const endISO = end.toISOString();
        const obs = await fetchStationObservations(stationId, startISO, endISO);
        return {
            observations: obs,
            stationId,
            stationDistanceKm: distanceKm
        };
    } catch (e) {
        return {
            observations: [],
            stationId: null,
            stationDistanceKm: null
        };
    }
}
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (v)=>v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
}),
"[project]/lib/snowModel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "predictFromNWS",
    ()=>predictFromNWS
]);
/**
 * Lightweight snowfall/conditions model.
 * - Designed to run deterministically on NWS observations (and optional historical/aux inputs)
 * - Returns estimated recentSnowfall (last 24h), snowDepth (approx), baseTemp (F), windSpeed (mph), visibility (text), and a powder score 0-100.
 *
 * This is intentionally simple and easy to test against historical data. Improve as needed.
 */ function cToF(c) {
    if (c === null || c === undefined) return null;
    return c * 9 / 5 + 32;
}
function kphToMph(kph) {
    if (kph === null || kph === undefined) return null;
    return kph * 0.621371;
}
function predictFromNWS(nws, extra) {
    const result = {
        recentSnowfall: 0,
        snowDepth: 0,
        baseTemp: NaN,
        windSpeed: 0,
        visibility: 'Unknown',
        powderScore: 50,
        factors: []
    };
    if (!nws) return result;
    // Temperature handling: some NWS payloads have temperature in Fahrenheit (forecast periods)
    // while others use Celsius. Prefer raw.unit info when available.
    let tempC = null;
    if (typeof nws.temperature === 'number') {
        const unit = nws?.raw?.temperatureUnit || nws?.raw?.temperature?.unitCode || null;
        if (unit && String(unit).toUpperCase().startsWith('F')) {
            // temperature provided as Fahrenheit
            tempC = (nws.temperature - 32) * 5 / 9;
        } else {
            // assume provided in Celsius
            tempC = nws.temperature;
        }
    } else if (nws?.raw?.temperature?.value != null) {
        tempC = nws.raw.temperature.value;
    }
    if (tempC != null && !Number.isNaN(tempC)) result.baseTemp = +(tempC * 9 / 5 + 32).toFixed(1);
    // Wind speed: if nws.windSpeed is a number, the existing project tends to store mph already.
    if (typeof nws.windSpeed === 'number') {
        result.windSpeed = nws.windSpeed;
    } else if (nws?.raw?.windSpeed?.value != null) {
        // assume raw.windSpeed.value is m/s -> convert to mph
        const windMs = nws.raw.windSpeed.value;
        if (!Number.isNaN(windMs)) result.windSpeed = +(windMs * 2.23694).toFixed(2);
    }
    result.visibility = nws?.textDescription ?? result.visibility;
    // Use reported precipitation fields when available.
    // Many NWS observation payloads include 'precipitationLastHour' or in properties with unitCode/value.
    let precipIn = null; // inches in last window
    // try a few known fields (value might be mm or in depending on the source) — prefer explicit inches
    if (nws?.raw?.precipitationLastHour?.value != null) {
        const mm = nws.raw.precipitationLastHour.value;
        if (!Number.isNaN(mm)) precipIn = +(mm / 25.4);
    }
    // check raw precipitation container
    if (precipIn == null && nws?.raw?.precipitation?.value != null) {
        const v = nws.raw.precipitation.value;
        const unit = nws.raw.precipitation?.unitCode || '';
        if (typeof v === 'number') {
            if (unit.toLowerCase().includes('mm')) precipIn = +(v / 25.4);
            else precipIn = +v;
        }
    }
    // probabilityOfPrecipitation is often provided as a percent (0-100) inside raw fields
    const pop = nws?.raw?.probabilityOfPrecipitation?.value ?? nws?.raw?.probabilityOfPrecipitation ?? null;
    // Parse the text description for keywords (snow vs rain) as a tie-breaker
    const desc = (nws?.textDescription || '').toLowerCase();
    const mentionsSnow = desc.includes('snow') || desc.includes('flurr');
    const mentionsSleet = desc.includes('sleet') || desc.includes('mixed');
    // Determine a snowfall fraction: if temps are cold (< 34F) and mention snow, assume precip -> snow
    let snowFraction = 0.0;
    if (precipIn != null) {
        // If we have a measured precipitation amount, use temperature to estimate what portion was snow
        if (!Number.isNaN(result.baseTemp)) {
            if (result.baseTemp <= 28) snowFraction = 1.0;
            else if (result.baseTemp <= 32) snowFraction = 0.9;
            else if (result.baseTemp <= 36) snowFraction = 0.6;
            else snowFraction = 0.05; // mostly rain
        } else {
            // no temp, rely on text
            snowFraction = mentionsSnow ? 0.9 : mentionsSleet ? 0.6 : 0.2;
        }
    } else {
        // no measured precip — fall back to probability and text
        const p = typeof pop === 'number' && !Number.isNaN(pop) ? pop / 100 : 0;
        if (p > 0) {
            // if we only have a probability, set expected precip to a conservative value based on probability
            // assume up to 0.5 inches liquid at very high probabilities (p~1) for short windows
            const expectedLiquid = Math.min(0.5, 0.5 * p);
            if (!Number.isNaN(result.baseTemp)) {
                if (result.baseTemp <= 28) snowFraction = 1.0;
                else if (result.baseTemp <= 32) snowFraction = 0.95;
                else if (result.baseTemp <= 36) snowFraction = 0.6;
                else snowFraction = 0.1;
            } else {
                snowFraction = mentionsSnow ? 0.9 : mentionsSleet ? 0.6 : 0.2;
            }
            precipIn = expectedLiquid; // inches of liquid
        } else {
            snowFraction = mentionsSnow ? 0.8 : 0.0;
        }
    }
    // Convert liquid precipitation to snow inches using rough ratio depending on temp
    let liquidToSnowRatio = 10; // default 10:1
    if (!Number.isNaN(result.baseTemp)) {
        const tempCFromF = (result.baseTemp - 32) * 5 / 9;
        if (tempCFromF <= -10) liquidToSnowRatio = 18;
        else if (tempCFromF <= -2) liquidToSnowRatio = 14;
        else if (tempCFromF <= 0) liquidToSnowRatio = 12;
        else if (tempCFromF <= 3) liquidToSnowRatio = 10;
        else liquidToSnowRatio = 8; // wetter snow
    }
    // expected snow inches from measured precip
    let expectedSnowIn = 0;
    if (precipIn != null) {
        expectedSnowIn = precipIn * liquidToSnowRatio * snowFraction;
        // dampen for small liquid amounts
        if (precipIn > 0 && precipIn < 0.5) expectedSnowIn *= 0.6;
    } else {
        expectedSnowIn = (precipIn || 0) * liquidToSnowRatio * snowFraction;
    }
    // final smoothing: be conservative — round to nearest 0.5 inch
    const recent = Math.max(0, Math.round(expectedSnowIn * 2) / 2);
    result.recentSnowfall = recent;
    // snowDepth: if observation provides a depth field, prefer it. Try common fields: snowDepth, snowDepthLast24Hours
    const obsDepth = nws?.raw?.snowDepth?.value ?? nws?.raw?.snowDepth ?? nws?.raw?.snowFallLast24Hours?.value ?? null;
    if (obsDepth != null && !Number.isNaN(obsDepth)) {
        // If unit is mm convert, otherwise assume inches
        if (typeof obsDepth === 'number') {
            // heuristic: if value > 30, assume mm; convert mm -> inches
            if (obsDepth > 30) result.snowDepth = +(obsDepth / 25.4).toFixed(1);
            else result.snowDepth = +obsDepth.toFixed(1);
        }
    } else {
        // guess: previous depth plus recent snowfall (conservative)
        // if extra?.previousDepth provided use it
        const prev = extra && typeof extra.previousDepth === 'number' ? extra.previousDepth : 0;
        result.snowDepth = +Math.max(prev, prev + result.recentSnowfall).toFixed(1);
    }
    // powderScore: prefer conservative base; high score for fresh, cold, low wind
    let score = 50;
    score += Math.round((result.recentSnowfall - 2) * 4); // reward recent >2"
    if (!Number.isNaN(result.baseTemp) && result.baseTemp <= 20) score += 10;
    if (result.windSpeed > 25) score -= 20;
    if (result.recentSnowfall >= 8) score += 8;
    result.powderScore = Math.min(100, Math.max(0, score));
    // factors
    if (result.recentSnowfall >= 6) result.factors.push('recent-heavy');
    else if (result.recentSnowfall >= 2) result.factors.push('recent-light');
    if (!Number.isNaN(result.baseTemp) && result.baseTemp >= 36) result.factors.push('warm');
    if (result.windSpeed > 25) result.factors.push('windy');
    // compute weekly snowfall estimate
    let weekly = 0;
    let weeklySnowIn = 0; // snow inches (converted) aggregated
    let weeklyRainIn = 0; // liquid rain inches aggregated
    // Prefer detailed weeklyObservations if available (array of precip+temp samples)
    if (extra && Array.isArray(extra.weeklyObservations) && extra.weeklyObservations.length > 0) {
        let sumSnow = 0;
        for (const o of extra.weeklyObservations){
            const pMm = o && typeof o.precipMm === 'number' ? o.precipMm : 0;
            const tC = o && typeof o.tempC === 'number' ? o.tempC : extra.avgTemp7d ?? null;
            const precipIn = pMm / 25.4;
            // simple temp-based snow fraction per observation
            let sf = 0.0;
            if (tC != null) {
                if (tC <= -10) sf = 1.0;
                else if (tC <= 0) sf = 0.95;
                else if (tC <= 3) sf = 0.9;
                else sf = 0.1;
            } else {
                sf = mentionsSnow ? 0.8 : 0.2;
            }
            // choose ratio by temp
            let ratioLocal = liquidToSnowRatio;
            if (tC != null) {
                if (tC <= -10) ratioLocal = 18;
                else if (tC <= -2) ratioLocal = 14;
                else if (tC <= 0) ratioLocal = 12;
                else if (tC <= 3) ratioLocal = 10;
                else ratioLocal = 8;
            }
            let snowIn = precipIn * ratioLocal * sf;
            if (precipIn > 0 && precipIn < 0.5) snowIn *= 0.6;
            sumSnow += snowIn;
            // rain liquid inches that fell (liquid portion not snow)
            const rainLiquid = precipIn * (1 - sf);
            weeklyRainIn += rainLiquid;
            weeklySnowIn += snowIn;
        }
        weekly = Math.round(sumSnow * 2) / 2;
    } else if (extra && typeof extra.weeklyPrecipMm === 'number' && extra.weeklyPrecipMm !== null) {
        const inches = extra.weeklyPrecipMm / 25.4;
        // approximate splitting of weekly total into snow vs rain using avgTemp7d and snowFraction
        const avgSf = !Number.isNaN(result.baseTemp) ? result.baseTemp <= 32 ? 0.9 : 0.1 : snowFraction || 0.5;
        weeklySnowIn = Math.round(inches * liquidToSnowRatio * avgSf * 2) / 2;
        weeklyRainIn = Math.round(inches * (1 - avgSf) * 100) / 100;
        weekly = weeklySnowIn;
    } else if (extra && typeof extra.previousWeekSnowfall === 'number' && extra.previousWeekSnowfall !== null) {
        weekly = extra.previousWeekSnowfall;
    } else {
        // fallback: scale recent event conservatively (avoid recent*3 naive approach)
        // assume additional smaller events across week: recent + 0.5 * recent * 2
        weekly = Math.round((result.recentSnowfall + Math.max(0, result.recentSnowfall * 1.0)) * 2) / 2;
    }
    // Adjust weekly estimate for station distance (reduce confidence if station is far)
    const stationDist = extra && typeof extra.stationDistanceKm === 'number' ? extra.stationDistanceKm : null;
    if (stationDist != null && stationDist > 50) {
        // Reduce estimate progressively for stations further away. Start conservatively at 50km.
        // 50-150km -> reduce up to 30%, >=150km reduce up to 40%.
        let reduction = 0.1;
        if (stationDist >= 150) reduction = 0.4;
        else reduction = 0.1 + Math.min(0.3, (stationDist - 50) / 100 * 0.3);
        weekly = Math.max(0, weekly * (1 - reduction));
        result.factors.push('station-distance');
    }
    result.weeklySnowfall = Math.max(0, Math.round(weekly * 2) / 2);
    // attach computed weekly snow/rain totals (in inches)
    result.weeklySnowIn = Math.max(0, Math.round(weeklySnowIn * 2) / 2);
    result.weeklyRainIn = Math.max(0, Math.round(weeklyRainIn * 100) / 100);
    // If the caller provided a resort-reported weekly total (on-mountain report), blend
    // the model's weekly estimate with that report. This biases the estimate toward
    // resort-reported values when available while retaining model signals.
    // Default weight favors resort report moderately (resortWeight = 0.7) but this
    // can be tuned externally by callers if desired.
    if (extra && typeof extra.resortReportedWeekly === 'number' && extra.resortReportedWeekly !== null) {
        const resortVal = Math.max(0, extra.resortReportedWeekly);
        const modelVal = typeof result.weeklySnowfall === 'number' ? result.weeklySnowfall : 0;
        // Allow caller to override the resort weight; default to 0.7 for moderate trust.
        let resortWeight = 0.7;
        if (typeof extra.resortWeight === 'number' && extra.resortWeight >= 0 && extra.resortWeight <= 1) {
            resortWeight = extra.resortWeight;
        }
        const blended = Math.round((resortVal * resortWeight + modelVal * (1 - resortWeight)) * 2) / 2;
        result.factors.push('resort-reported');
        result.factors.push(`resort-weight:${resortWeight}`);
        result.weeklySnowfall = blended;
    }
    // Estimate expected on-ground depth after melt/compaction using environmental factors
    // Start from reported/estimated snowDepth
    const baseDepth = result.snowDepth || 0;
    let retention = 1.0;
    // temp effect (use avgTemp7d if available)
    const avgTempC = extra && typeof extra.avgTemp7d === 'number' ? extra.avgTemp7d : null;
    if (avgTempC != null) {
        if (avgTempC > 0) retention *= 0.6; // above freezing average -> significant melt
        else if (avgTempC > -2) retention *= 0.85; // near-freezing
        else retention *= 1.0; // cold preserves
    }
    // wind effect
    const avgWindKph = extra && typeof extra.avgWind7d === 'number' ? extra.avgWind7d : null;
    if (avgWindKph != null) {
        const avgWindMph = avgWindKph * 0.621371;
        if (avgWindMph > 40) retention *= 0.7;
        else if (avgWindMph > 25) retention *= 0.85;
    }
    // sun exposure
    const avgSun = extra && typeof extra.avgSunHours7d === 'number' ? extra.avgSunHours7d : null;
    if (avgSun != null) {
        if (avgSun > 4) retention *= 0.85;
        else if (avgSun > 2) retention *= 0.95;
    }
    // elevation effect (higher => better retention)
    const elev = extra && typeof extra.elevationFt === 'number' ? extra.elevationFt : null;
    if (elev != null) {
        const boost = 1 + Math.max(0, Math.min(0.3, (elev - 1000) / 10000));
        retention *= boost;
    }
    // age/compaction: if no fresh snow recently, compact
    if (result.recentSnowfall <= 1) retention *= 0.95;
    result.expectedOnGround = Math.round(Math.max(0, baseDepth * retention) * 10) / 10;
    return result;
}
const __TURBOPACK__default__export__ = {
    predictFromNWS
};
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$snowModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/snowModel.ts [app-route] (ecmascript)");
;
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
        // Fetch NWS weather for observation and let the local model predict snowfall/conditions
        let nws = null;
        try {
            nws = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$nws$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNWSObservation"])(resort.lat, resort.lon);
        } catch (e) {
            nws = null;
        }
        // Predict using our snow model (deterministic heuristics + optional extra inputs)
        // Attempt to fetch historical observations for the resort (last 7 days) to improve weekly totals
        let extra = {};
        // Allow callers to pass resort-reported weekly totals and a resort weight to bias the model.
        try {
            const urlObj = new URL(request.url);
            const rp = urlObj.searchParams.get('resortReportedWeekly');
            const rw = urlObj.searchParams.get('resortWeight');
            if (rp != null) {
                const parsed = parseFloat(rp);
                if (!Number.isNaN(parsed)) extra.resortReportedWeekly = parsed;
            }
            if (rw != null) {
                const parsed = parseFloat(rw);
                if (!Number.isNaN(parsed)) extra.resortWeight = parsed;
            }
        } catch (e) {
        // ignore
        }
        try {
            const hist = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$nws$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHistoricalObservations"])(resort.lat, resort.lon, 7);
            if (hist && Array.isArray(hist.observations) && hist.observations.length > 0) {
                const weeklyObs = [];
                let weeklyPrecipMm = 0;
                for (const f of hist.observations){
                    const p = f.properties || f;
                    const precipMm = p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number' ? p.precipitationLastHour.value : p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : null;
                    const tempC = p.temperature && typeof p.temperature.value === 'number' ? p.temperature.value : typeof p.temperature === 'number' ? p.temperature : null;
                    const windKph = p.windSpeed && typeof p.windSpeed.value === 'number' ? p.windSpeed.value * 3.6 : null; // m/s -> kph
                    weeklyObs.push({
                        precipMm: precipMm,
                        tempC: tempC,
                        windKph,
                        timestamp: p.timestamp || p.validTime || null
                    });
                    if (typeof precipMm === 'number') weeklyPrecipMm += precipMm;
                }
                extra.weeklyObservations = weeklyObs;
                extra.weeklyPrecipMm = weeklyPrecipMm;
                extra.avgTemp7d = weeklyObs.reduce((s, o)=>s + (o.tempC ?? 0), 0) / Math.max(1, weeklyObs.length);
                extra.avgWind7d = weeklyObs.reduce((s, o)=>s + (o.windKph ?? 0), 0) / Math.max(1, weeklyObs.length);
                extra.elevationFt = resort.elevationFt ?? null;
                extra.stationDistanceKm = hist.stationDistanceKm;
            }
        } catch (e) {
        // keep any previously collected extra fields (e.g., resortReportedWeekly/resortWeight)
        // but if historical fetch failed we simply proceed with what we have.
        }
        const pred = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$snowModel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].predictFromNWS(nws, extra);
        // Trail data is not available from our sources, so set to 0
        const trailOpen = 0;
        const trailTotal = 0;
        const groomed = 0;
        const conditions = {
            resortId,
            timestamp: new Date(),
            snowDepth: pred.snowDepth,
            recentSnowfall: pred.recentSnowfall,
            weeklySnowfall: pred.weeklySnowfall ?? 0,
            expectedOnGround: pred.expectedOnGround ?? pred.snowDepth,
            baseTemp: pred.baseTemp ?? 0,
            windSpeed: pred.windSpeed ?? 0,
            visibility: pred.visibility,
            trailStatus: {
                open: trailOpen,
                total: trailTotal,
                groomed
            },
            rawData: {
                nws,
                model: pred
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

//# sourceMappingURL=%5Broot-of-the-server%5D__15af94d3._.js.map