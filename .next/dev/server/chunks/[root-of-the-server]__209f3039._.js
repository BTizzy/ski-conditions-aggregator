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
"[project]/app/api/radar/synthetic/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$canvas__$5b$external$5d$__$28$canvas$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$canvas$29$__ = __turbopack_context__.i("[externals]/canvas [external] (canvas, cjs, [project]/node_modules/canvas)");
;
;
const dynamic = 'force-dynamic';
const revalidate = 60; // Cache 1 minute
// Cache for resort conditions to avoid repeated API calls
let resortConditionsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
async function GET(request) {
    console.log('[Synthetic Tile] Request:', request.url);
    try {
        const { searchParams } = request.nextUrl;
        const hour = parseInt(searchParams.get('hour') || '0');
        const z = parseInt(searchParams.get('z') || '7');
        const x = parseInt(searchParams.get('x') || '0');
        const y = parseInt(searchParams.get('y') || '0');
        if (isNaN(hour) || hour < 0 || hour > 47) {
            return getTransparentTile();
        }
        if (z < 0 || z > 18) return getTransparentTile();
        const maxTile = Math.pow(2, z);
        if (x < 0 || x >= maxTile || y < 0 || y >= maxTile) {
            return getTransparentTile();
        }
        // Get current resort conditions (most accurate data)
        const currentConditions = await getCurrentResortConditions();
        if (!currentConditions || currentConditions.length === 0) {
            return getTransparentTile();
        }
        console.log(`[Synthetic Tile] Hour ${hour}: ${currentConditions.length} resorts loaded`);
        console.log(`[Synthetic Tile] Sample resorts:`, currentConditions.slice(0, 3).map((r)=>({
                name: r.name,
                lat: r.lat,
                lon: r.lon,
                snowfall: r.recentSnowfall
            })));
        // Generate storm evolution for this hour
        const stormConditions = generateStormEvolution(currentConditions, hour);
        console.log(`[Synthetic Tile] After storm evolution:`, stormConditions.slice(0, 3).map((r)=>({
                name: r.name,
                lat: r.lat.toFixed(4),
                lon: r.lon.toFixed(4),
                snowfall: r.recentSnowfall.toFixed(2)
            })));
        // Generate tile from storm data
        const tileBuffer = generateSyntheticTile(stormConditions, z, x, y, new Date(Date.now() - (47 - hour) * 60 * 60 * 1000) // Convert hour offset to timestamp
        );
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](new Uint8Array(tileBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=60',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('[Synthetic Radar] Error:', error.message);
        return getTransparentTile();
    }
}
/**
 * Get CURRENT resort conditions (most accurate data available)
 * This is our "end state" - the most recent snowfall data
 * Uses caching to avoid repeated API calls
 */ async function getCurrentResortConditions() {
    const now = Date.now();
    // Return cached data if still valid
    if (resortConditionsCache && now - cacheTimestamp < CACHE_DURATION) {
        return resortConditionsCache;
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/resorts/conditions`, {
            next: {
                revalidate: 60
            }
        });
        if (!response.ok) return [];
        const data = await response.json();
        // Transform API response to ResortPoint format
        const conditions = data.resorts?.map((resort)=>({
                id: resort.id,
                name: resort.name,
                lat: resort.lat,
                lon: resort.lon,
                snowDepth: resort.conditions?.snowDepth || 0,
                recentSnowfall: resort.conditions?.recentSnowfall || 0,
                weeklySnowfall: resort.conditions?.weeklySnowfall,
                baseTemp: resort.conditions?.baseTemp || 20,
                windSpeed: resort.conditions?.windSpeed || 0,
                visibility: resort.conditions?.visibility || 'Good'
            })) || [];
        // Update cache
        resortConditionsCache = conditions;
        cacheTimestamp = now;
        return conditions;
    } catch (error) {
        console.warn('[Synthetic] Failed to fetch current resort conditions:', error);
        // Return cached data if available, even if expired
        return resortConditionsCache || [];
    }
}
/**
 * Generate storm evolution for a specific hour
 * Creates realistic precipitation patterns by backtracking storm positions
 *
 * @param currentConditions - Current resort data (most accurate)
 * @param hourOffset - Hours from now (47 = current, 0 = 47 hours ago)
 * @returns Modified resort conditions for this hour
 */ function generateStormEvolution(currentConditions, hourOffset) {
    const hoursFromNow = 47 - hourOffset; // Convert to hours from current time
    const totalHours = 47; // 48 total frames (0-47)
    // Validate inputs
    if (!currentConditions || currentConditions.length === 0) {
        console.warn('[Storm Evolution] No current conditions provided');
        return [];
    }
    if (hourOffset < 0 || hourOffset > 47) {
        console.warn('[Storm Evolution] Invalid hour offset:', hourOffset);
        return currentConditions;
    }
    // Storm movement parameters (typical Northeast winter storm)
    const stormSpeedKmh = 35; // ~22 mph, typical for Northeast storms
    const stormDirection = 45; // Degrees from north (northeast movement)
    // Convert to coordinate movement per hour
    const speedDegreesPerHour = stormSpeedKmh / 111.32; // 1 degree ≈ 111.32 km
    const directionRad = stormDirection * Math.PI / 180;
    const deltaLat = Math.cos(directionRad) * speedDegreesPerHour;
    const deltaLon = Math.sin(directionRad) * speedDegreesPerHour;
    return currentConditions.map((resort)=>{
        // Validate resort data
        if (!resort || typeof resort.lat !== 'number' || typeof resort.lon !== 'number') {
            console.warn('[Storm Evolution] Invalid resort data:', resort);
            return resort;
        }
        // Calculate storm position at this hour
        const latOffset = deltaLat * hoursFromNow;
        const lonOffset = deltaLon * hoursFromNow;
        // Move storm position backward in time
        const stormLat = resort.lat - latOffset;
        const stormLon = resort.lon - lonOffset;
        // Calculate storm lifecycle (build-up, peak, dissipation)
        // stormProgress = 0 (current time) should have maximum intensity
        // stormProgress = 1 (47 hours ago) should have minimum intensity
        const stormProgress = hoursFromNow / totalHours; // 0 = current (peak), 1 = past (dissipation)
        // Realistic storm intensity curve (peak at present, dissipation into past)
        let intensityMultiplier;
        if (stormProgress < 0.2) {
            // Peak phase (current time)
            intensityMultiplier = 1.0;
        } else if (stormProgress < 0.5) {
            // Recent past - still strong
            intensityMultiplier = 0.8 - 0.4 * ((stormProgress - 0.2) / 0.3);
        } else {
            // Distant past - dissipating
            const dissipationProgress = (stormProgress - 0.5) / 0.5;
            intensityMultiplier = 0.4 * Math.pow(1 - dissipationProgress, 2);
        }
        // Apply intensity and ensure minimum values
        const snowfall = Math.max(0, resort.recentSnowfall * intensityMultiplier);
        return {
            ...resort,
            lat: stormLat,
            lon: stormLon,
            recentSnowfall: snowfall
        };
    });
}
/**
 * IDW (Inverse Distance Weighting) Interpolation
 * Estimates value at point based on weighted average of nearest neighbors
 * Enhanced for smoother gradients and realistic influence radius
 */ function interpolateIDW(point, samples, k = 6, maxDistance = 5.0 // 5.0° radius (~550km) for regional coverage
) {
    if (samples.length === 0) return 0;
    console.log(`[IDW] Interpolating at (${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}), ${samples.length} samples`);
    // Filter samples within max distance and calculate weights
    const nearbySamples = samples.map((s)=>({
            sample: s,
            dist: greatCircleDistance(point, {
                lat: s.lat,
                lon: s.lon
            })
        })).filter((n)=>n.dist <= maxDistance).sort((a, b)=>a.dist - b.dist);
    if (nearbySamples.length === 0) return 0;
    // Use all nearby samples (up to k) for smoother interpolation
    const neighbors = nearbySamples.slice(0, k);
    // Calculate IDW weights with smoother falloff (reduced power for gentler gradients)
    const weights = neighbors.map((n)=>{
        if (n.dist === 0) return 1000; // Exact match gets high weight
        // Use power of 2.5 for smoother gradients (was power of 3)
        return 1 / Math.pow(n.dist + 0.1, 2.5); // Add small epsilon to avoid division by zero
    });
    const sum = weights.reduce((a, b)=>a + b, 0);
    // Weighted average
    const result = neighbors.reduce((acc, n, i)=>acc + n.sample.recentSnowfall * (weights[i] / sum), 0);
    return result;
}
/**
 * Haversine distance in degrees (rough estimate)
 * Good enough for interpolation purposes
 */ function greatCircleDistance(p1, p2) {
    // For short distances, approximate with Euclidean
    const dlat = (p2.lat - p1.lat) * 111; // 1 degree lat = ~111km
    const dlon = (p2.lon - p1.lon) * 111 * Math.cos(p1.lat * Math.PI / 180);
    return Math.sqrt(dlat * dlat + dlon * dlon) / 111; // Return in degrees
}
/**
 * Convert snowfall amount to radar color with realistic precipitation colors
 * Based on standard weather radar color schemes (green->yellow->orange->red)
 */ function snowfallToRGBA(inches) {
    // Standard weather radar precipitation color scale (inches per hour)
    if (inches >= 8.0) return new Uint8ClampedArray([
        255,
        0,
        255,
        255
    ]); // Extreme: Magenta (#FF00FF, 100% opacity)
    if (inches >= 4.0) return new Uint8ClampedArray([
        255,
        0,
        0,
        230
    ]); // Very Heavy: Red (#FF0000, 90% opacity)
    if (inches >= 2.0) return new Uint8ClampedArray([
        255,
        165,
        0,
        204
    ]); // Heavy: Orange (#FFA500, 80% opacity)
    if (inches >= 1.0) return new Uint8ClampedArray([
        255,
        255,
        0,
        178
    ]); // Moderate: Yellow (#FFFF00, 70% opacity)
    if (inches >= 0.5) return new Uint8ClampedArray([
        0,
        255,
        0,
        153
    ]); // Light: Green (#00FF00, 60% opacity)
    if (inches >= 0.1) return new Uint8ClampedArray([
        144,
        238,
        144,
        102
    ]); // Very Light: Light Green (#90EE90, 40% opacity)
    if (inches >= 0.05) return new Uint8ClampedArray([
        224,
        255,
        255,
        51
    ]); // Trace: Very Light Cyan (#E0FFFF, 20% opacity)
    return new Uint8ClampedArray([
        0,
        0,
        0,
        0
    ]); // Transparent - no precipitation
}
/**
 * Web Mercator projection: lat/lon -> pixel coordinates
 */ function latlonToPixel(lat, lon, z, x, y) {
    // Convert to Web Mercator
    const n = Math.pow(2, z);
    const xtile = (lon + 180) / 360 * n;
    const ytile = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;
    if (xtile < x || xtile >= x + 1 || ytile < y || ytile >= y + 1) {
        return null; // Outside tile bounds
    }
    // Scale to 256x256 tile
    const px = Math.floor((xtile - x) * 256);
    const py = Math.floor((ytile - y) * 256);
    return {
        px,
        py
    };
}
/**
 * Generate a 256x256 PNG tile with interpolated snowfall data
 * Enhanced with Gaussian blur and temporal coherence
 */ function generateSyntheticTile(conditions, z, x, y, timestamp) {
    const canvas = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$canvas__$5b$external$5d$__$28$canvas$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$canvas$29$__["createCanvas"])(256, 256);
    const ctx = canvas.getContext('2d');
    const n = Math.pow(2, z); // ← ADD THIS LINE: Number of tiles at zoom level z
    console.log(`[Tile Generation] z=${z} x=${x} y=${y}, ${conditions.length} conditions`);
    // Create image data
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;
    // For each pixel in the tile
    let idx = 0;
    for(let py = 0; py < 256; py++){
        for(let px = 0; px < 256; px++){
            // Convert pixel to lat/lon
            const xtile = x + px / 256;
            const ytile = y + py / 256;
            const lon = xtile / n * 360 - 180;
            const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n))) * 180 / Math.PI;
            // Interpolate snowfall at this location with improved parameters
            const snowfall = interpolateIDW({
                lat,
                lon
            }, conditions, 6, 5.0);
            // Sample a few points to verify interpolation is working
            if (px === 128 && py === 128) {
                console.log(`[Tile] Center pixel snowfall: ${snowfall.toFixed(3)} inches at (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
            }
            // Convert to color
            const rgba = snowfallToRGBA(snowfall);
            data[idx++] = rgba[0]; // R
            data[idx++] = rgba[1]; // G
            data[idx++] = rgba[2]; // B
            data[idx++] = rgba[3]; // A
        }
    }
    ctx.putImageData(imageData, 0, 0);
    // Apply Gaussian blur for smooth, natural-looking precipitation zones
    applyGaussianBlur(ctx, 256, 256, 0.5); // Reduced from 1.0 for sharper boundaries
    return canvas.toBuffer('image/png');
}
/**
 * Apply Gaussian blur to canvas for smooth precipitation zones
 */ function applyGaussianBlur(ctx, width, height, sigma = 1.5) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    // Gaussian kernel size (should be odd)
    const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = createGaussianKernel(kernelSize, sigma);
    // Apply blur to each channel separately (including alpha)
    for(let channel = 0; channel < 4; channel++){
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                let sum = 0;
                let weightSum = 0;
                // Apply kernel
                for(let ky = 0; ky < kernelSize; ky++){
                    for(let kx = 0; kx < kernelSize; kx++){
                        const px = x + kx - Math.floor(kernelSize / 2);
                        const py = y + ky - Math.floor(kernelSize / 2);
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const weight = kernel[ky][kx];
                            const idx = (py * width + px) * 4 + channel;
                            sum += data[idx] * weight;
                            weightSum += weight;
                        }
                    }
                }
                const idx = (y * width + x) * 4 + channel;
                output[idx] = weightSum > 0 ? sum / weightSum : data[idx];
            }
        }
    }
    // Copy blurred data back
    for(let i = 0; i < data.length; i++){
        data[i] = output[i];
    }
    ctx.putImageData(imageData, 0, 0);
}
/**
 * Create Gaussian kernel for blur effect
 */ function createGaussianKernel(size, sigma) {
    const kernel = [];
    const center = Math.floor(size / 2);
    let sum = 0;
    // Generate kernel
    for(let y = 0; y < size; y++){
        kernel[y] = [];
        for(let x = 0; x < size; x++){
            const dx = x - center;
            const dy = y - center;
            const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            kernel[y][x] = value;
            sum += value;
        }
    }
    // Normalize
    for(let y = 0; y < size; y++){
        for(let x = 0; x < size; x++){
            kernel[y][x] /= sum;
        }
    }
    return kernel;
}
function getTransparentTile() {
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
            'Cache-Control': 'public, max-age=60',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__209f3039._.js.map