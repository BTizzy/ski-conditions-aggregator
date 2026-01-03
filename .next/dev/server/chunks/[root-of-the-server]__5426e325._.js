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
"[project]/app/api/radar/lib/radar-manager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RadarSourceManager",
    ()=>RadarSourceManager,
    "radarManager",
    ()=>radarManager
]);
/**
 * Multi-Source Radar Manager
 * Orchestrates multiple radar data sources for seamless weather radar display
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$canvas__$5b$external$5d$__$28$canvas$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$canvas$29$__ = __turbopack_context__.i("[externals]/canvas [external] (canvas, cjs, [project]/node_modules/canvas)");
;
class RadarSourceManager {
    sources = [];
    frameCache = new Map();
    tileCache = new Map();
    lastUpdate = 0;
    CACHE_DURATION = 5 * 60 * 1000;
    constructor(){
        this.initializeSources();
    }
    initializeSources() {
        // NOAA RIDGE Radar - Highest priority, most reliable
        this.sources.push(new NOAARadarSource());
        // RainViewer - Global coverage, tile-based
        this.sources.push(new RainViewerSource());
        // Windy.com - Beautiful visualization
        this.sources.push(new WindySource());
        // Weather.com - High quality regional
        this.sources.push(new OpenWeatherMapSource());
        // Iowa State University METAR - Academic resource
        this.sources.push(new IowaStateSource());
        // College of DuPage Weather - High quality regional
        this.sources.push(new CollegeDuPageSource());
        // NCAR - Research-grade data
        this.sources.push(new NCARSource());
        // Aviation Weather Center - FAA/NOAA official
        this.sources.push(new AviationWeatherSource());
        // Weather Underground Tiles
        this.sources.push(new WeatherUndergroundSource());
        // Zoom Earth Real-Time
        this.sources.push(new ZoomEarthSource());
        // Ventusky Weather
        this.sources.push(new VentuskySource());
        // NOAA's Radar Viewer Direct Images
        this.sources.push(new NOAARadarViewerSource());
        // NOAA's Real-Time Mosaics
        this.sources.push(new NOAAMosaicsSource());
        // GOES Satellite Imagery
        this.sources.push(new GOESSatelliteSource());
        // MyRadar Public Tiles (RainViewer CDN)
        this.sources.push(new MyRadarSource());
        // Weather.gov Beta
        this.sources.push(new WeatherGovBetaSource());
        // Synthetic Resort Data Interpolation
        this.sources.push(new SyntheticRadarSource());
        // Sort by priority (highest first)
        this.sources.sort((a, b)=>b.priority - a.priority);
    }
    async getFrames() {
        const now = Date.now();
        // Return cached frames if recent (but clear tile cache for fresh animation)
        if (now - this.lastUpdate < this.CACHE_DURATION && this.frameCache.has('all')) {
            // Clear tile cache to ensure fresh animation data
            this.tileCache.clear();
            return this.frameCache.get('all');
        }
        // Clear all caches for fresh data
        this.frameCache.clear();
        this.tileCache.clear();
        const allFrames = [];
        const sourcePromises = this.sources.map((source)=>this.safeFetchFrames(source));
        const results = await Promise.allSettled(sourcePromises);
        results.forEach((result, index)=>{
            if (result.status === 'fulfilled' && result.value) {
                allFrames.push(...result.value);
            }
        });
        // Sort by time and deduplicate
        const uniqueFrames = this.deduplicateFrames(allFrames);
        uniqueFrames.sort((a, b)=>a.time - b.time); // Oldest first for chronological animation
        // Cache the results
        this.frameCache.set('all', uniqueFrames);
        this.lastUpdate = now;
        return uniqueFrames;
    }
    async safeFetchFrames(source) {
        try {
            return await source.fetchFrames();
        } catch (error) {
            console.warn(`[RadarManager] Failed to fetch from ${source.name}:`, error);
            return null;
        }
    }
    deduplicateFrames(frames) {
        const seen = new Set();
        return frames.filter((frame)=>{
            const key = `${frame.time}-${frame.source}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    async getTile(time, z, x, y) {
        const cacheKey = `${time}-${z}-${x}-${y}`;
        // Check cache first
        if (this.tileCache.has(cacheKey)) {
            return this.tileCache.get(cacheKey);
        }
        // Try sources in priority order (highest first)
        const sortedSources = [
            ...this.sources
        ].sort((a, b)=>b.priority - a.priority);
        for (const source of sortedSources){
            try {
                // Create a mock frame for this source and time
                const mockFrame = {
                    time: time,
                    url: `${source.name}-${time}`,
                    source: source.name,
                    coverage: source.coverage,
                    quality: 4
                };
                const tile = await source.fetchTile(mockFrame, z, x, y);
                if (tile) {
                    // Cache the tile
                    this.tileCache.set(cacheKey, tile);
                    // Limit cache size
                    if (this.tileCache.size > 1000) {
                        const firstKey = this.tileCache.keys().next().value;
                        if (firstKey) {
                            this.tileCache.delete(firstKey);
                        }
                    }
                    console.log(`[RadarManager] Served tile from ${source.name}`);
                    return tile;
                }
            } catch (error) {
                console.warn(`[RadarManager] Failed to fetch tile from ${source.name}:`, error);
            }
        }
        // No source could provide the tile
        console.log(`[RadarManager] No source could provide tile for time=${time} z=${z} x=${x} y=${y}`);
        return null;
    }
    findBestFrame(frames, targetTime) {
        // Find frames within 30 minutes of target time
        const candidates = frames.filter((frame)=>Math.abs(frame.time - targetTime) <= 30 * 60 * 1000);
        if (candidates.length === 0) return null;
        // Sort by quality, then by time proximity
        candidates.sort((a, b)=>{
            if (a.quality !== b.quality) return b.quality - a.quality;
            return Math.abs(a.time - targetTime) - Math.abs(b.time - targetTime);
        });
        return candidates[0];
    }
    getSourceInfo() {
        return this.sources.map((source)=>({
                name: source.name,
                priority: source.priority,
                coverage: source.coverage,
                maxHistoryHours: source.maxHistoryHours,
                requiresApiKey: source.requiresApiKey
            }));
    }
}
// NOAA RIDGE Radar Source
class NOAARadarSource {
    name = 'noaa';
    priority = 100;
    coverage = 'US';
    maxHistoryHours = 1;
    requiresApiKey = false;
    async fetchFrames() {
        // Iowa State only provides current radar data, not historical
        // Return a single current frame
        const now = Date.now();
        return [
            {
                time: now,
                url: `noaa-${now}`,
                source: this.name,
                coverage: 'northeast',
                quality: 5
            }
        ];
    }
    async fetchTile(frame, z, x, y) {
        try {
            // Use Iowa State University for current radar data
            // Note: This provides raw NEXRAD data that needs color processing
            const url = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/${z}/${x}/${y}.png`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ski-conditions-aggregator)',
                    'Referer': 'https://mesonet.agron.iastate.edu/'
                }
            });
            if (!response.ok) {
                console.warn(`[NOAA] Tile fetch failed: ${response.status} for ${url}`);
                return null;
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            // Process the raw NEXRAD data to apply proper precipitation colors
            return this.processNEXRADColors(buffer);
        } catch (error) {
            console.warn('[NOAA] Tile fetch error:', error);
            return null;
        }
    }
    processNEXRADColors(buffer) {
        // NEXRAD Level III data uses reflectivity values (dBZ)
        // We need to map these to precipitation colors similar to Weather.com/Apple Maps
        // dBZ range: -32 to +95, but valid precipitation is typically 0-60 dBZ
        const canvas = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$canvas__$5b$external$5d$__$28$canvas$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$canvas$29$__["createCanvas"])(256, 256);
        const ctx = canvas.getContext('2d');
        // Create image from buffer
        const img = new (__turbopack_context__.r("[externals]/canvas [external] (canvas, cjs, [project]/node_modules/canvas)")).Image();
        img.src = buffer;
        ctx.drawImage(img, 0, 0);
        // Get image data
        const imageData = ctx.getImageData(0, 0, 256, 256);
        const data = imageData.data;
        // Improved NEXRAD color mapping for precipitation
        // Based on standard reflectivity color scales used by weather services
        const getPrecipitationColor = (r, g, b, a)=>{
            if (a === 0) return [
                0,
                0,
                0,
                0
            ]; // Keep transparent pixels transparent
            // NEXRAD data often uses specific color encoding
            // Convert RGB to approximate dBZ value using a more sophisticated mapping
            const intensity = Math.max(r, g, b);
            // Map intensity to dBZ (rough approximation based on NEXRAD color scales)
            let dBZ = -32 + intensity / 255 * 127; // -32 to +95 dBZ range
            // Apply precipitation color scale (similar to Weather Underground/NOAA)
            if (dBZ < 0) return [
                0,
                0,
                0,
                0
            ]; // No data/transparent
            if (dBZ < 5) return [
                0,
                100,
                255,
                120
            ]; // Very light blue (very light precip)
            if (dBZ < 10) return [
                0,
                150,
                255,
                140
            ]; // Light blue
            if (dBZ < 15) return [
                0,
                200,
                255,
                160
            ]; // Blue
            if (dBZ < 20) return [
                0,
                255,
                200,
                180
            ]; // Blue-green
            if (dBZ < 25) return [
                0,
                255,
                100,
                200
            ]; // Green
            if (dBZ < 30) return [
                100,
                255,
                0,
                220
            ]; // Light green
            if (dBZ < 35) return [
                150,
                255,
                0,
                240
            ]; // Yellow-green
            if (dBZ < 40) return [
                255,
                255,
                0,
                255
            ]; // Yellow
            if (dBZ < 45) return [
                255,
                200,
                0,
                255
            ]; // Orange
            if (dBZ < 50) return [
                255,
                150,
                0,
                255
            ]; // Red-orange
            if (dBZ < 55) return [
                255,
                100,
                0,
                255
            ]; // Red
            if (dBZ < 60) return [
                255,
                0,
                100,
                255
            ]; // Magenta
            if (dBZ < 65) return [
                200,
                0,
                150,
                255
            ]; // Purple
            return [
                150,
                0,
                200,
                255
            ]; // Dark purple for extreme precipitation
        };
        // Process each pixel
        for(let i = 0; i < data.length; i += 4){
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            const [newR, newG, newB, newA] = getPrecipitationColor(r, g, b, a);
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
            data[i + 3] = newA;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toBuffer('image/png');
    }
}
// RainViewer Source
class RainViewerSource {
    name = 'rainviewer';
    priority = 90;
    coverage = 'global';
    maxHistoryHours = 2;
    requiresApiKey = false;
    async fetchFrames() {
        try {
            const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            if (!response.ok) throw new Error('RainViewer API failed');
            const data = await response.json();
            const frames = [];
            // RainViewer provides radar data for past 2 hours
            if (data.radar && data.radar.past) {
                data.radar.past.forEach((item)=>{
                    const timeMs = item.time * 1000;
                    frames.push({
                        time: timeMs,
                        url: `rainviewer-${timeMs}`,
                        source: this.name,
                        coverage: 'global',
                        quality: 4
                    });
                });
            }
            return frames;
        } catch (error) {
            console.warn('[RainViewer] Failed to fetch frames:', error);
            return [];
        }
    }
    async fetchTile(frame, z, x, y) {
        try {
            // Extract timestamp from frame URL
            const timestamp = frame.url.split('-')[1];
            if (!timestamp) return null;
            // RainViewer tile URL format
            const url = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/${z}/${x}/${y}/1/1_1.png`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ski-conditions-aggregator)',
                    'Referer': 'https://www.rainviewer.com/'
                }
            });
            if (!response.ok) {
                console.warn(`[RainViewer] Tile fetch failed: ${response.status} for ${url}`);
                return null;
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.warn('[RainViewer] Tile fetch error:', error);
            return null;
        }
    }
}
// Windy.com Source
class WindySource {
    name = 'windy';
    priority = 80;
    coverage = 'global';
    maxHistoryHours = 6;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        // Generate frames for last 6 hours, every 15 minutes
        for(let i = 0; i < 24; i++){
            const timestamp = now - i * 15 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `windy-${Math.floor(timestamp / 1000)}`,
                source: this.name,
                coverage: 'global',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        try {
            const timestamp = frame.url.split('-')[1];
            const url = `https://tiles.windy.com/radar/${timestamp}/${z}/${x}/${y}.png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// OpenWeatherMap Source
class OpenWeatherMapSource {
    name = 'openweathermap';
    priority = 95;
    coverage = 'global';
    maxHistoryHours = 2;
    requiresApiKey = true;
    async fetchFrames() {
        try {
            // OpenWeatherMap provides radar data for past 2 hours
            const frames = [];
            const now = Date.now();
            // Generate frames for last 2 hours, every 10 minutes (OpenWeatherMap requirement)
            for(let i = 0; i < 12; i++){
                const timestamp = now - i * 10 * 60 * 1000;
                frames.push({
                    time: timestamp,
                    url: `openweathermap-${Math.floor(timestamp / 1000)}`,
                    source: this.name,
                    coverage: 'global',
                    quality: 4
                });
            }
            return frames;
        } catch (error) {
            console.warn('[OpenWeatherMap] Failed to generate frames:', error);
            return [];
        }
    }
    async fetchTile(frame, z, x, y) {
        try {
            // OpenWeatherMap radar tiles (free tier available)
            const timestamp = frame.url.split('-')[1];
            // Note: OpenWeatherMap timestamps must be in 10-minute intervals
            const roundedTimestamp = Math.floor(parseInt(timestamp) / 600) * 600; // Round to 10 minutes
            const url = `https://maps.openweathermap.org/maps/2.0/radar/forecast/${z}/${x}/${y}?appid=demo&tm=${roundedTimestamp}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// Iowa State University METAR Source
class IowaStateSource {
    name = 'iowastate';
    priority = 95;
    coverage = 'US';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        // Generate frames for last 24 hours, every 10 minutes
        for(let i = 0; i < 144; i++){
            const timestamp = now - i * 10 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `iowastate-${timestamp}`,
                source: this.name,
                coverage: 'conus',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        try {
            // Iowa State provides NEXRAD Level III data in Web Mercator tiles
            const url = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/${z}/${x}/${y}.png`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ski-conditions-aggregator)',
                    'Referer': 'https://mesonet.agron.iastate.edu/'
                }
            });
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// Weather Underground Tiles Source
class WeatherUndergroundSource {
    name = 'wunderground';
    priority = 75;
    coverage = 'global';
    maxHistoryHours = 6;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        // Generate frames for last 6 hours, every 15 minutes
        for(let i = 0; i < 24; i++){
            const timestamp = now - i * 15 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `wunderground-${Math.floor(timestamp / 1000)}`,
                source: this.name,
                coverage: 'global',
                quality: 3
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        try {
            const url = `https://tile.wunderground.com/tile/radar/${z}/${x}/${y}.png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// Zoom Earth Real-Time Source
class ZoomEarthSource {
    name = 'zoomearth';
    priority = 70;
    coverage = 'global';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        // Generate frames for last 24 hours, every 30 minutes
        for(let i = 0; i < 48; i++){
            const timestamp = now - i * 30 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `zoomearth-${Math.floor(timestamp / 1000)}`,
                source: this.name,
                coverage: 'global',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        try {
            // Zoom Earth uses tile-based system, try to construct tile URL
            const timestamp = frame.url.split('-')[1];
            const url = `https://tiles.zoomearth.com/precipitation/${timestamp}/${z}/${x}/${y}.png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// Ventusky Weather Source
class VentuskySource {
    name = 'ventusky';
    priority = 65;
    coverage = 'global';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        // Generate frames for last 24 hours, every 1 hour
        for(let i = 0; i < 24; i++){
            const timestamp = now - i * 60 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `ventusky-${Math.floor(timestamp / 1000)}`,
                source: this.name,
                coverage: 'global',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        try {
            // Ventusky uses WebGL tiles, try to construct URL
            const timestamp = frame.url.split('-')[1];
            const url = `https://tiles.ventusky.com/${timestamp}/radar/${z}/${x}/${y}.png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// MyRadar Public Tiles (RainViewer CDN) Source
class MyRadarSource {
    name = 'myradar';
    priority = 80;
    coverage = 'global';
    maxHistoryHours = 2;
    requiresApiKey = false;
    async fetchFrames() {
        try {
            const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            if (!response.ok) throw new Error('MyRadar API failed');
            const data = await response.json();
            const frames = [];
            // Use same data as RainViewer but different CDN
            if (data.radar && data.radar.past) {
                data.radar.past.forEach((item)=>{
                    frames.push({
                        time: item.time * 1000,
                        url: `myradar-${item.time}`,
                        source: this.name,
                        coverage: 'global',
                        quality: 4
                    });
                });
            }
            return frames;
        } catch (error) {
            console.warn('[MyRadar] Failed to fetch frames:', error);
            return [];
        }
    }
    async fetchTile(frame, z, x, y) {
        try {
            const timestamp = frame.url.split('-')[1];
            const url = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/${z}/${x}/${y}/256/png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            return null;
        }
    }
}
// Placeholder classes for remaining sources (to be implemented)
class CollegeDuPageSource {
    name = 'collegedupage';
    priority = 82;
    coverage = 'regional';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 48; i++){
            const timestamp = now - i * 30 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `collegedupage-${timestamp}`,
                source: this.name,
                coverage: 'regional',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement College of DuPage tile fetching
        return null;
    }
}
class NCARSource {
    name = 'ncar';
    priority = 83;
    coverage = 'US';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 48; i++){
            const timestamp = now - i * 30 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `ncar-${timestamp}`,
                source: this.name,
                coverage: 'US',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement NCAR tile fetching
        return null;
    }
}
class AviationWeatherSource {
    name = 'aviationweather';
    priority = 95;
    coverage = 'US';
    maxHistoryHours = 2;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 8; i++){
            const timestamp = now - i * 15 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `aviation-${timestamp}`,
                source: this.name,
                coverage: 'US',
                quality: 5
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement Aviation Weather tile fetching
        return null;
    }
}
class NOAARadarViewerSource {
    name = 'noaa-radar-viewer';
    priority = 98;
    coverage = 'US';
    maxHistoryHours = 1;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 6; i++){
            const timestamp = now - i * 10 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `noaa-viewer-${timestamp}`,
                source: this.name,
                coverage: 'US',
                quality: 5
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement NOAA Radar Viewer tile fetching
        return null;
    }
}
class NOAAMosaicsSource {
    name = 'noaa-mosaics';
    priority = 97;
    coverage = 'US';
    maxHistoryHours = 2;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 12; i++){
            const timestamp = now - i * 10 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `noaa-mosaic-${timestamp}`,
                source: this.name,
                coverage: 'US',
                quality: 5
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement NOAA Mosaics tile fetching
        return null;
    }
}
class GOESSatelliteSource {
    name = 'goes-satellite';
    priority = 60;
    coverage = 'north-america';
    maxHistoryHours = 24;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 48; i++){
            const timestamp = now - i * 30 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `goes-${timestamp}`,
                source: this.name,
                coverage: 'north-america',
                quality: 3
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement GOES Satellite tile fetching
        return null;
    }
}
class SyntheticRadarSource {
    name = 'synthetic';
    priority = 10;
    coverage = 'northeast-us';
    maxHistoryHours = 48;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 48; i++){
            const timestamp = now - i * 60 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `/api/radar/synthetic?hour=${i}`,
                source: this.name,
                coverage: 'northeast-us',
                quality: 5
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // Extract hour from URL
        const hourMatch = frame.url.match(/hour=(\d+)/);
        if (!hourMatch) return null;
        const hour = parseInt(hourMatch[1]);
        if (isNaN(hour) || hour < 0 || hour > 47) return null;
        // Call the synthetic API
        try {
            const response = await fetch(`http://localhost:3000/api/radar/synthetic?hour=${hour}&z=${z}&x=${x}&y=${y}`);
            if (!response.ok) return null;
            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer);
        } catch (error) {
            console.error('[Synthetic Source] Fetch error:', error);
            return null;
        }
    }
}
class WeatherGovBetaSource {
    name = 'weathergov';
    priority = 78;
    coverage = 'US';
    maxHistoryHours = 2;
    requiresApiKey = false;
    async fetchFrames() {
        const frames = [];
        const now = Date.now();
        for(let i = 0; i < 8; i++){
            const timestamp = now - i * 15 * 60 * 1000;
            frames.push({
                time: timestamp,
                url: `weathergov-${timestamp}`,
                source: this.name,
                coverage: 'US',
                quality: 4
            });
        }
        return frames;
    }
    async fetchTile(frame, z, x, y) {
        // TODO: Implement Weather.gov Beta tile fetching
        return null;
    }
}
const radarManager = new RadarSourceManager();
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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$radar$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/radar/lib/radar-manager.ts [app-route] (ecmascript)");
;
;
const dynamic = 'force-dynamic';
async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const time = searchParams.get('time');
        const z = searchParams.get('z');
        const x = searchParams.get('x');
        const y = searchParams.get('y');
        if (!time || !z || !x || !y) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing parameters. Required: time, z, x, y'
            }, {
                status: 400
            });
        }
        const timeNum = parseInt(time);
        const zNum = parseInt(z);
        const xNum = parseInt(x);
        const yNum = parseInt(y);
        if (isNaN(timeNum) || isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid parameters'
            }, {
                status: 400
            });
        }
        if (zNum < 0 || zNum > 18) return getTransparentTile();
        const maxTile = Math.pow(2, zNum);
        if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
            return getTransparentTile();
        }
        console.log(`[Tile] Request: time=${timeNum} z=${zNum} x=${xNum} y=${yNum}`);
        // Get tile from radar manager (handles multiple sources automatically)
        const tileBuffer = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$radar$2f$lib$2f$radar$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["radarManager"].getTile(timeNum, zNum, xNum, yNum);
        if (tileBuffer) {
            console.log(`[Tile] Served from multi-source system`);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](new Uint8Array(tileBuffer), {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=300',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        // Fallback to transparent tile if no source can provide data
        console.log(`[Tile] No data available, returning transparent tile`);
        return getTransparentTile();
    } catch (error) {
        console.error('[Tile] Error:', error.message);
        return getTransparentTile();
    }
}
// Generate a transparent tile for areas with no data
function getTransparentTile() {
    // Create a 256x256 transparent PNG
    const width = 256;
    const height = 256;
    const png = new (__turbopack_context__.r("[project]/node_modules/pngjs/lib/png.js [app-route] (ecmascript)")).PNG({
        width,
        height,
        colorType: 6
    }); // RGBA
    // Fill with transparent
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const idx = width * y + x << 2;
            png.data[idx] = 0; // R
            png.data[idx + 1] = 0; // G
            png.data[idx + 2] = 0; // B
            png.data[idx + 3] = 0; // A (transparent)
        }
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](png.data, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5426e325._.js.map