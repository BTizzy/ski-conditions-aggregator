import { NextResponse, NextRequest } from 'next/server';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable route caching (tiles are debugged live)

// Cache for resort conditions to avoid repeated API calls
let resortConditionsCache: ResortPoint[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Synthetic Radar Tile Generator - REALISTIC APPROACH
 *
 * Creates 48-frame animation using current resort data as the "end state"
 * Backtracks storm positions over time for realistic temporal coherence
 *
 * Query Params:
 *   hour - Hour offset from now (0-47, where 47 = current time)
 *   z, x, y - Tile coordinates (standard Web Mercator)
 */
export async function GET(request: NextRequest) {
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

    // Diagnostic logs to understand "uniform green" output
    // (We need to confirm snowfall values have variance and that some resorts have > 0 snowfall.)
    const snowfallValues = currentConditions.map(r => r.recentSnowfall ?? 0);
    const withSnow = currentConditions.filter(r => (r.recentSnowfall ?? 0) > 0);
    const minSnowfall = Math.min(...snowfallValues);
    const maxSnowfall = Math.max(...snowfallValues);
    const avgSnowfall = snowfallValues.reduce((a, v) => a + v, 0) / (snowfallValues.length || 1);
    console.log('[Synthetic Debug] Resort snowfall stats:', {
      total: currentConditions.length,
      withSnow: withSnow.length,
      minSnowfall,
      maxSnowfall,
      avgSnowfall,
      sampleResorts: currentConditions.slice(0, 5).map(r => ({
        name: r.name,
        lat: r.lat.toFixed(2),
        lon: r.lon.toFixed(2),
        snow: r.recentSnowfall,
      })),
    });

    console.log(`[Synthetic Tile] Hour ${hour}: ${currentConditions.length} resorts loaded`);
    console.log(`[Synthetic Tile] Sample resorts:`, currentConditions.slice(0, 3).map((r: any) => ({
      name: r.name, lat: r.lat, lon: r.lon, snowfall: r.recentSnowfall
    })));

    // Generate storm evolution for this hour
    const stormConditions = generateStormEvolution(currentConditions, hour);

    // --- Deep diagnostics: storm evolution + tile bounds + IDW sanity sampling ---
    // (Goal: determine whether resorts are being moved outside the requested tile
    //  and whether IDW has any neighbors within maxDistance.)
    console.log('[Tile Debug] Storm-evolved resorts:', stormConditions.slice(0, 3).map(r => {
      const original = currentConditions.find(c => c.id === r.id);
      return {
        name: r.name,
        originalLat: original ? original.lat.toFixed(4) : null,
        originalLon: original ? original.lon.toFixed(4) : null,
        stormLat: r.lat.toFixed(4),
        stormLon: r.lon.toFixed(4),
        snowfall: (r.recentSnowfall ?? 0).toFixed(2),
      };
    }));

    const n = Math.pow(2, z);
    const tileLonMin = (x / n) * 360 - 180;
    const tileLonMax = ((x + 1) / n) * 360 - 180;
    const tileLatMax = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    const tileLatMin = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;

    console.log('[Tile Debug] Tile bounds:', {
      z,
      x,
      y,
      latRange: [tileLatMin.toFixed(2), tileLatMax.toFixed(2)],
      lonRange: [tileLonMin.toFixed(2), tileLonMax.toFixed(2)],
    });

    const resortsInBounds = stormConditions.filter(r =>
      r.lat >= tileLatMin && r.lat <= tileLatMax && r.lon >= tileLonMin && r.lon <= tileLonMax
    );
    console.log('[Tile Debug] Resorts in tile bounds:', resortsInBounds.length);

    const centerLat = (tileLatMin + tileLatMax) / 2;
    const centerLon = (tileLonMin + tileLonMax) / 2;
    const centerSnow = interpolateIDW(
      { lat: centerLat, lon: centerLon },
      stormConditions,
      6,
      5.0,
      { logTag: 'center', z, x, y }
    );
    console.log('[Tile Debug] Center pixel interpolation:', {
      lat: centerLat.toFixed(4),
      lon: centerLon.toFixed(4),
      snowfall: centerSnow.toFixed(4),
    });

    console.log(`[Synthetic Tile] After storm evolution:`, stormConditions.slice(0, 3).map((r: any) => ({
      name: r.name, lat: r.lat.toFixed(4), lon: r.lon.toFixed(4), snowfall: r.recentSnowfall.toFixed(2)
    })));

    // Generate tile from storm data
    const tileBuffer = generateSyntheticTile(
      stormConditions,
      z, x, y,
      new Date(Date.now() - (47 - hour) * 60 * 60 * 1000) // hour=47 is now; hour=0 is 47h ago
    );

    return new NextResponse(new Uint8Array(tileBuffer), {
      headers: {
        'Content-Type': 'image/png',
        // Disable caching so we always see fresh server-side diagnostics.
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('[Synthetic Radar] Error:', error.message);
    return getTransparentTile();
  }
}

interface ResortPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  snowDepth: number;
  recentSnowfall: number; // inches in last 24h
  weeklySnowfall?: number;
  baseTemp: number;
  windSpeed: number;
  visibility: string;
}

/**
 * Get CURRENT resort conditions (most accurate data available)
 * This is our "end state" - the most recent snowfall data
 * Uses caching to avoid repeated API calls
 */
async function getCurrentResortConditions(): Promise<ResortPoint[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (resortConditionsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return resortConditionsCache;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/resorts/conditions`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return [];

    const data = await response.json();

    // Transform API response to ResortPoint format
    const conditions = data.resorts?.map((resort: any) => ({
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
 */
function generateStormEvolution(currentConditions: ResortPoint[], hourOffset: number): ResortPoint[] {
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
  const directionRad = (stormDirection * Math.PI) / 180;

  const deltaLat = Math.cos(directionRad) * speedDegreesPerHour;
  const deltaLon = Math.sin(directionRad) * speedDegreesPerHour;

  return currentConditions.map(resort => {
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
 */
function interpolateIDW(
  point: { lat: number; lon: number },
  samples: ResortPoint[],
  k: number = 6, // Use up to 6 nearest neighbors
  maxDistance: number = 5.0, // Wider radius so sparse regions still find neighbors
  debug?: { logTag?: string; z?: number; x?: number; y?: number }
): number {
  if (samples.length === 0) return 0;

  const doLog = Boolean(debug?.logTag);
  if (doLog) {
    console.log(
      `[IDW] (${debug?.logTag}) Interpolating at (${point.lat.toFixed(4)}, ${point.lon.toFixed(4)})` +
        ` z=${debug?.z} x=${debug?.x} y=${debug?.y} samples=${samples.length} maxDistance=${maxDistance}`
    );
  }

  // Filter samples within max distance and calculate weights
  const nearbySamples = samples
    .map(s => ({
      sample: s,
      dist: greatCircleDistance(point, { lat: s.lat, lon: s.lon })
    }))
    .filter(n => n.dist <= maxDistance)
    .sort((a, b) => a.dist - b.dist);

  if (doLog) {
    const nextFew = nearbySamples.slice(0, 6).map(n => ({
      name: n.sample.name,
      dist: Number(n.dist.toFixed(3)),
      snow: Number((n.sample.recentSnowfall ?? 0).toFixed(2)),
    }));
    console.log(`[IDW] (${debug?.logTag}) Nearby samples within radius: ${nearbySamples.length}`, nextFew);
  }

  // If there are no nearby points, treat as no-data (transparent).
  // (The alpha clamp + blur already prevents single-point haze.)
  if (nearbySamples.length === 0) return 0;

  // Use all nearby samples (up to k) for smoother interpolation
  const neighbors = nearbySamples.slice(0, k);

  // Calculate IDW weights with smoother falloff (reduced power for gentler gradients)
  const weights = neighbors.map(n => {
    if (n.dist === 0) return 1000; // Exact match gets high weight
    // Use power of 2.5 for smoother gradients (was power of 3)
    return 1 / Math.pow(n.dist + 0.1, 2.5); // Add small epsilon to avoid division by zero
  });

  const sum = weights.reduce((a, b) => a + b, 0);

  // Weighted average
  const result = neighbors.reduce(
    (acc, n, i) => acc + n.sample.recentSnowfall * (weights[i] / sum),
    0
  );

  return result;
}

/**
 * Haversine distance in degrees (rough estimate)
 * Good enough for interpolation purposes
 */
function greatCircleDistance(
  p1: { lat: number; lon: number },
  p2: { lat: number; lon: number }
): number {
  // For short distances, approximate with Euclidean
  const dlat = (p2.lat - p1.lat) * 111; // 1 degree lat = ~111km
  const dlon = (p2.lon - p1.lon) * 111 * Math.cos((p1.lat * Math.PI) / 180);
  return Math.sqrt(dlat * dlat + dlon * dlon) / 111; // Return in degrees
}

/**
 * Convert snowfall amount to radar color with realistic precipitation colors
 * Based on standard weather radar color schemes (green->yellow->orange->red)
 */
function snowfallToRGBA(inches: number): Uint8ClampedArray {
  // IMPORTANT: Most pixels should be fully transparent.
  // We hard-clamp tiny values to zero so blur + interpolation noise can't paint haze.
  if (inches < 0.25) return new Uint8ClampedArray([0, 0, 0, 0]);

  // Standard weather radar precipitation color scale (inches per hour)
  if (inches >= 8.0) return new Uint8ClampedArray([255, 0, 255, 255]);     // Extreme: Magenta (#FF00FF, 100% opacity)
  if (inches >= 4.0) return new Uint8ClampedArray([255, 0, 0, 230]);       // Very Heavy: Red (#FF0000, 90% opacity)
  if (inches >= 2.0) return new Uint8ClampedArray([255, 165, 0, 204]);     // Heavy: Orange (#FFA500, 80% opacity)
  if (inches >= 1.0) return new Uint8ClampedArray([255, 255, 0, 178]);     // Moderate: Yellow (#FFFF00, 70% opacity)
  if (inches >= 0.5) return new Uint8ClampedArray([0, 255, 0, 153]);       // Light: Green (#00FF00, 60% opacity)
  return new Uint8ClampedArray([0, 0, 0, 0]); // Transparent - no precipitation
}

/**
 * Web Mercator projection: lat/lon -> pixel coordinates
 */
function latlonToPixel(
  lat: number,
  lon: number,
  z: number,
  x: number,
  y: number
): { px: number; py: number } | null {
  // Convert to Web Mercator
  const n = Math.pow(2, z);
  const xtile = ((lon + 180) / 360) * n;
  const ytile = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n;

  if (xtile < x || xtile >= x + 1 || ytile < y || ytile >= y + 1) {
    return null; // Outside tile bounds
  }

  // Scale to 256x256 tile
  const px = Math.floor((xtile - x) * 256);
  const py = Math.floor((ytile - y) * 256);

  return { px, py };
}

/**
 * Generate a 256x256 PNG tile with interpolated snowfall data
 * Enhanced with Gaussian blur and temporal coherence
 */
function generateSyntheticTile(
  conditions: ResortPoint[],
  z: number,
  x: number,
  y: number,
  timestamp: Date
): Buffer {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  
  const n = Math.pow(2, z);
  
  console.log(`[Tile Generation] z=${z} x=${x} y=${y}, ${conditions.length} conditions`);

  // Create image data
  const imageData = ctx.createImageData(256, 256);
  const data = imageData.data;

  // For each pixel in the tile
  let idx = 0;
  for (let py = 0; py < 256; py++) {
    for (let px = 0; px < 256; px++) {
      // Convert pixel to lat/lon
      const xtile = x + px / 256;
      const ytile = y + py / 256;
      const lon = (xtile / n) * 360 - 180;
      const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * ytile) / n))) * 180) / Math.PI;

    // Interpolate snowfall at this location.
    const snowfall = interpolateIDW({ lat, lon }, conditions, 6, 5.0);

      // Sample a few points to verify interpolation is working
      if (px === 128 && py === 128) { // Center pixel
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

  // Tile-level pixel diagnostics (pre-blur). This tells us whether we're producing
  // mostly-transparent output or a constant alpha/color field.
  // Note: only logs a summary; does not dump large arrays.
  let nonTransparent = 0;
  let alphaMin = 255;
  let alphaMax = 0;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    if (a === 0) continue;
    nonTransparent++;
    if (a < alphaMin) alphaMin = a;
    if (a > alphaMax) alphaMax = a;
  }
  console.log('[Tile Debug] Pixel statistics (pre-blur):', {
    totalPixels: 256 * 256,
    nonTransparent,
    alphaMin: nonTransparent ? alphaMin : null,
    alphaMax: nonTransparent ? alphaMax : null,
  });

  // Apply Gaussian blur for smooth, natural-looking precipitation zones
  applyGaussianBlur(ctx, 256, 256, 0.5); // Reduced from 1.0 for sharper boundaries

  return canvas.toBuffer('image/png');
}

/**
 * Apply Gaussian blur to canvas for smooth precipitation zones
 */
function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sigma: number = 1.5
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);

  // Gaussian kernel size (should be odd)
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = createGaussianKernel(kernelSize, sigma);

  // Apply blur to each channel separately (including alpha)
  for (let channel = 0; channel < 4; channel++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;

        // Apply kernel
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
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
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i];
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Create Gaussian kernel for blur effect
 */
function createGaussianKernel(size: number, sigma: number): number[][] {
  const kernel: number[][] = [];
  const center = Math.floor(size / 2);
  let sum = 0;

  // Generate kernel
  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel[y][x] = value;
      sum += value;
    }
  }

  // Normalize
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }

  return kernel;
}

function getTransparentTile(): Response {
  const transparentPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);

  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
