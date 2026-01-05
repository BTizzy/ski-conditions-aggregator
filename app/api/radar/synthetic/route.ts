import { NextResponse, NextRequest } from 'next/server';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable route caching (tiles are debugged live)

// Cache for resort conditions to avoid repeated API calls
let resortConditionsCache: ResortPoint[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for historical precipitation data
let historicalCache = new Map<string, HistoricalPrecipitationPoint[]>();
let historicalCacheTimestamp: number = 0;

/**
 * Synthetic Radar Tile Generator - HISTORICAL DATA APPROACH
 *
 * Creates 72-frame animation using REAL historical precipitation data
 * No artificial storm simulation - uses actual weather observations
 *
 * Query Params:
 *   hour - Hour offset from now (0-71, where 71 = current time)
 *   z, x, y - Tile coordinates (standard Web Mercator)
 */
export async function GET(request: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 8);
  console.log(`🚨 SYNTHETIC ROUTE HIT [${reqId}] - request:`, request.url);
  console.log(`[Synthetic Tile] [${reqId}] Request:`, request.url);
  try {
    const { searchParams } = request.nextUrl;

    const hour = parseInt(searchParams.get('hour') || '0');
    const z = parseInt(searchParams.get('z') || '7');
    const x = parseInt(searchParams.get('x') || '0');
    const y = parseInt(searchParams.get('y') || '0');

    if (isNaN(hour) || hour < 0 || hour > 71) {
      console.warn(`[Synthetic Tile] [${reqId}] Invalid hour param -> transparent`, { hour });
      return getTransparentTile();
    }

    if (z < 0 || z > 18) {
      console.warn(`[Synthetic Tile] [${reqId}] Invalid z -> transparent`, { z });
      return getTransparentTile();
    }
    const maxTile = Math.pow(2, z);
    if (x < 0 || x >= maxTile || y < 0 || y >= maxTile) {
      console.warn(`[Synthetic Tile] [${reqId}] Invalid x/y -> transparent`, { z, x, y });
      return getTransparentTile();
    }

    // Calculate target time for this hour
    const targetTime = new Date(Date.now() - (71 - hour) * 60 * 60 * 1000); // hour=71 is now; hour=0 is 71h ago

    // Get historical precipitation data for the specific hour requested
    const hourData = await getHistoricalPrecipitationForHour(targetTime);

    if (!hourData || hourData.length === 0) {
      console.warn(`[Synthetic Tile] [${reqId}] No data for hour ${hour} -> transparent`);
      return getTransparentTile();
    }

    // Convert historical data to resort points for interpolation
    const resortPoints: ResortPoint[] = hourData.map(point => ({
      id: point.resortId,
      name: point.name,
      lat: point.lat,
      lon: point.lon,
      snowDepth: 0, // Not used for radar
      recentSnowfall: point.isSnow ? point.precipitationMm / 25.4 : 0, // Convert mm to inches, only snow
      recentRainfall: !point.isSnow ? point.precipitationMm / 25.4 : 0, // Only rain
      totalPrecipitation: point.precipitationMm / 25.4, // Total precipitation in inches
      baseTemp: point.temperatureC * 9/5 + 32, // Convert to Fahrenheit
      windSpeed: 0, // Not available in historical data
      visibility: 'Good' // Default
    }));

    // Generate tile from historical precipitation data
    const tileBuffer = generateSyntheticTile(
      resortPoints,
      z, x, y,
      targetTime
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

interface HistoricalPrecipitationPoint {
  resortId: string;
  name: string;
  lat: number;
  lon: number;
  timestamp: Date;
  precipitationMm: number; // Total precipitation in mm for this hour
  temperatureC: number;
  isSnow: boolean; // Whether this precipitation fell as snow
}

interface ResortPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  snowDepth: number;
  recentSnowfall: number; // inches in last 24h
  recentRainfall?: number; // inches in last 24h (estimated)
  totalPrecipitation: number; // total precipitation (snow + rain) in inches
  weeklySnowfall?: number;
  baseTemp: number;
  windSpeed: number;
  visibility: string;
  elevationFt?: number;
}

/**
 * Get historical precipitation data for the past 72 hours from all resorts
 * Uses Open-Meteo historical API for accurate hourly data
 */
// Cache for historical precipitation data
interface CachedHistoricalData {
  data: HistoricalPrecipitationPoint[];
  lastFetch: Date;
  resortId: string;
}

const historicalDataCache = new Map<string, CachedHistoricalData>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get historical precipitation data for a specific hour across all resorts
 * Uses cached data when available, fetches new data only when needed
 */
async function getHistoricalPrecipitationForHour(targetTime: Date): Promise<HistoricalPrecipitationPoint[]> {
  // Get all historical data (this will use cache when available)
  const allData = await getHistoricalPrecipitationData();

  // Find data points within 30 minutes of the target time
  const tolerance = 30 * 60 * 1000; // 30 minutes
  return allData.filter(point =>
    Math.abs(point.timestamp.getTime() - targetTime.getTime()) <= tolerance
  );
}

async function getHistoricalPrecipitationData(): Promise<HistoricalPrecipitationPoint[]> {
  const allData: HistoricalPrecipitationPoint[] = [];
  const resorts = await getBasicResortList();
  const now = new Date();

  // Get data for the past 72 hours
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 72 * 60 * 60 * 1000);

  console.log(`[Historical Data] Fetching 72h precipitation data from ${startTime.toISOString()} to ${endTime.toISOString()}`);

  // Check which resorts need fresh data
  const resortsToFetch: Array<{id: string, name: string, lat: number, lon: number}> = [];
  const cachedResorts: string[] = [];

  for (const resort of resorts) {
    const cached = historicalDataCache.get(resort.id);
    if (!cached || (now.getTime() - cached.lastFetch.getTime()) > CACHE_DURATION_MS) {
      resortsToFetch.push(resort);
    } else {
      cachedResorts.push(resort.id);
      allData.push(...cached.data);
    }
  }

  console.log(`[Historical Data] Using cached data for ${cachedResorts.length} resorts, fetching ${resortsToFetch.length} new`);

  // Fetch data for resorts that need it
  if (resortsToFetch.length > 0) {
    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 2; // Even smaller batches for reliability
    for (let i = 0; i < resortsToFetch.length; i += batchSize) {
      const batch = resortsToFetch.slice(i, i + batchSize);
      const promises = batch.map(async (resort) => {
        try {
          // Use Open-Meteo historical archive API
          const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${resort.lat}&longitude=${resort.lon}&start_date=${startTime.toISOString().split('T')[0]}&end_date=${endTime.toISOString().split('T')[0]}&hourly=precipitation,temperature_2m,relative_humidity_2m,dewpoint_2m&timezone=America/New_York`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // Longer timeout for historical data
          const response = await fetch(historicalUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.warn(`[Historical Data] Failed to fetch for ${resort.name}: ${response.status}`);
            return [];
          }

          const data = await response.json();

          if (!data.hourly?.time) {
            console.warn(`[Historical Data] No hourly data for ${resort.name}`);
            return [];
          }

          const { time, precipitation, temperature_2m, relative_humidity_2m, dewpoint_2m } = data.hourly;

          // Convert to our data structure
          const resortData: HistoricalPrecipitationPoint[] = [];
          for (let j = 0; j < time.length; j++) {
            const timestamp = new Date(time[j]);
            const precipMm = precipitation[j] || 0;
            const tempC = temperature_2m[j] ?? 0;
            const humidity = relative_humidity_2m[j] ?? 50;
            const dewpointC = dewpoint_2m[j] ?? tempC - 5;

            // Classify as snow vs rain
            const snowFraction = classifyPrecipitationType(tempC, dewpointC, humidity);
            const isSnow = snowFraction > 0.5; // More than 50% snow

            resortData.push({
              resortId: resort.id,
              name: resort.name,
              lat: resort.lat,
              lon: resort.lon,
              timestamp,
              precipitationMm: precipMm,
              temperatureC: tempC,
              isSnow
            });
          }

          // Cache the data
          historicalDataCache.set(resort.id, {
            data: resortData,
            lastFetch: now,
            resortId: resort.id
          });

          console.log(`[Historical Data] ${resort.name}: ${resortData.length} hourly records (fetched)`);
          return resortData;

        } catch (error) {
          console.warn(`[Historical Data] Error for ${resort.name}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(data => allData.push(...data));

      // Longer delay between batches for historical API
      if (i + batchSize < resortsToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  console.log(`[Historical Data] Total records: ${allData.length} from ${resorts.length} resorts (${cachedResorts.length} cached, ${resortsToFetch.length} fetched)`);
  return allData;
}

/**
 * Get precipitation data for a specific hour across all resorts
 */
function getPrecipitationForHour(allData: HistoricalPrecipitationPoint[], targetTime: Date): HistoricalPrecipitationPoint[] {
  // Find data points within 30 minutes of the target time
  const tolerance = 30 * 60 * 1000; // 30 minutes
  return allData.filter(point =>
    Math.abs(point.timestamp.getTime() - targetTime.getTime()) <= tolerance
  );
}

/**
 * Get basic resort list for historical data fetching
 */
async function getBasicResortList(): Promise<Array<{id: string, name: string, lat: number, lon: number}>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/resorts/conditions`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.resorts?.map((r: any) => ({
      id: r.id,
      name: r.name,
      lat: r.lat,
      lon: r.lon
    })) || [];
  } catch (error) {
    console.warn('[Basic Resort List] Failed to fetch:', error);
    return [];
  }
}

/**
 * Get precipitation data from nearby weather stations for each resort
 * Uses Open-Meteo API to get accurate total precipitation and weather conditions
 */
async function getResortPrecipitationData(resorts: Array<{id: string, name: string, lat: number, lon: number}>): Promise<Map<string, {totalPrecipMm: number, tempC: number, humidity: number, dewpointC: number}>> {
  const precipitationData = new Map<string, {totalPrecipMm: number, tempC: number, humidity: number, dewpointC: number}>();

  // Process resorts in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < resorts.length; i += batchSize) {
    const batch = resorts.slice(i, i + batchSize);
    const promises = batch.map(async (resort) => {
      try {
        // Get current weather conditions and recent precipitation
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&current=temperature_2m,relative_humidity_2m,dewpoint_2m,precipitation&hourly=precipitation&forecast_days=1&timezone=America/New_York`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(weatherUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Open-Meteo API returned ${response.status}`);
        }

        const data = await response.json();

        // Get current conditions
        const current = data.current;
        const tempC = current?.temperature_2m ?? 0;
        const humidity = current?.relative_humidity_2m ?? 50;
        const dewpointC = current?.dewpoint_2m ?? tempC - 5; // Estimate if not available
        const currentPrecipMm = current?.precipitation ?? 0;

        // Get hourly precipitation for the last 24 hours
        const hourlyPrecip = data.hourly?.precipitation ?? [];
        const last24hPrecipMm = hourlyPrecip.slice(-24).reduce((sum: number, precip: number) => sum + (precip || 0), 0);

        const totalPrecipMm = Math.max(currentPrecipMm, last24hPrecipMm);

        precipitationData.set(resort.id, {
          totalPrecipMm,
          tempC,
          humidity,
          dewpointC
        });

        console.log(`[Precipitation] ${resort.name}: ${totalPrecipMm.toFixed(2)}mm total precip, ${tempC.toFixed(1)}°C, ${humidity}% humidity`);

      } catch (error) {
        console.warn(`[Precipitation] Open-Meteo failed for ${resort.name}, trying NWS fallback:`, error);

        // Fallback: Try to get NWS data
        try {
          const nwsResponse = await fetch(`http://localhost:3000/api/scrape?resortId=${resort.id}`);
          if (nwsResponse.ok) {
            const nwsData = await nwsResponse.json();
            const tempC = nwsData.baseTemp ? (nwsData.baseTemp - 32) * 5/9 : 0; // Convert F to C
            const totalPrecipMm = (nwsData.recentSnowfall || 0) * 25.4; // Rough estimate: assume all precip is snow

            precipitationData.set(resort.id, {
              totalPrecipMm,
              tempC,
              humidity: 50, // Default
              dewpointC: tempC - 5 // Estimate
            });

            console.log(`[Precipitation] ${resort.name} (NWS fallback): ${totalPrecipMm.toFixed(2)}mm total precip`);
          } else {
            throw new Error('NWS fallback failed');
          }
        } catch (nwsError) {
          console.warn(`[Precipitation] All APIs failed for ${resort.name}, using estimates`);

          // Final fallback: Use seasonal estimates based on location and time of year
          const month = new Date().getMonth(); // 0-11
          const isWinter = month >= 10 || month <= 3; // Nov-Apr
          const isNortheast = resort.lat > 40 && resort.lat < 48 && resort.lon > -80 && resort.lon < -65;

          let estimatedPrecipMm = 0;
          let estimatedTempC = 0;

          if (isWinter && isNortheast) {
            // Winter in Northeast: expect some snow/rain mix
            estimatedPrecipMm = Math.random() * 10; // 0-10mm random variation
            estimatedTempC = -5 + Math.random() * 10; // -5 to +5°C
          } else if (isNortheast) {
            // Non-winter Northeast: expect rain
            estimatedPrecipMm = Math.random() * 5; // 0-5mm
            estimatedTempC = 5 + Math.random() * 15; // 5-20°C
          }

          precipitationData.set(resort.id, {
            totalPrecipMm: estimatedPrecipMm,
            tempC: estimatedTempC,
            humidity: 60,
            dewpointC: estimatedTempC - 3
          });

          console.log(`[Precipitation] ${resort.name} (estimate): ${estimatedPrecipMm.toFixed(2)}mm total precip`);
        }
      }
    });

    await Promise.all(promises);

    // Small delay between batches to be respectful to the API
    if (i + batchSize < resorts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return precipitationData;
}

/**
 * Classify precipitation as snow vs rain using dewpoint depression method
 * Returns the fraction that falls as snow (0.0 = all rain, 1.0 = all snow)
 */
function classifyPrecipitationType(tempC: number, dewpointC: number, humidity: number): number {
  const dewpointDepression = tempC - dewpointC;

  let snowFraction = 0.0;

  if (dewpointDepression <= 0) {
    // Dewpoint >= temperature: supercooled conditions, likely all snow
    snowFraction = 1.0;
  } else if (dewpointDepression <= 2) {
    // Very small depression: sleet or wet snow
    snowFraction = 0.9;
  } else if (dewpointDepression <= 5) {
    // Moderate depression: snow likely
    snowFraction = 0.8;
  } else if (dewpointDepression <= 8) {
    // Larger depression: mixed precipitation
    snowFraction = 0.5;
  } else {
    // Large depression: rain likely
    snowFraction = 0.1;
  }

  // Adjust based on humidity for additional confidence
  if (humidity > 90 && snowFraction < 0.8) {
    snowFraction = Math.min(0.8, snowFraction + 0.2); // High humidity favors snow
  } else if (humidity < 50 && snowFraction > 0.3) {
    snowFraction = Math.max(0.2, snowFraction - 0.2); // Low humidity favors rain
  }

  return snowFraction;
}

/**
 * Get CURRENT resort conditions with accurate precipitation data
 * This is our "end state" - the most recent weather data with proper snow/rain classification
 * Uses caching to avoid repeated API calls
 */
async function getCurrentResortConditions(): Promise<ResortPoint[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (resortConditionsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return resortConditionsCache;
  }

  try {
    // First get basic resort data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/resorts/conditions`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return [];

    const data = await response.json();

    // Get basic resort info
    const basicResorts = data.resorts?.map((resort: any) => ({
      id: resort.id,
      name: resort.name,
      lat: resort.lat,
      lon: resort.lon,
      elevationFt: resort.elevationFt
    })) || [];

    // Get accurate precipitation data from weather stations
    const precipitationData = await getResortPrecipitationData(basicResorts);

    // Transform API response to ResortPoint format with accurate precipitation
    const conditions = data.resorts?.map((resort: any) => {
      const precipData = precipitationData.get(resort.id);
      const totalPrecipMm = precipData?.totalPrecipMm ?? 0;
      const totalPrecipIn = totalPrecipMm / 25.4; // Convert mm to inches

      // Classify precipitation as snow vs rain
      const snowFraction = precipData ?
        classifyPrecipitationType(precipData.tempC, precipData.dewpointC, precipData.humidity) : 0.8;

      // Split total precipitation into snow and rain components
      const snowfallIn = totalPrecipIn * snowFraction;
      const rainfallIn = totalPrecipIn * (1 - snowFraction);

      console.log(`[Resort Conditions] ${resort.name}: ${totalPrecipIn.toFixed(2)}" total (${snowfallIn.toFixed(2)}" snow, ${rainfallIn.toFixed(2)}" rain, ${snowFraction.toFixed(2)} snow fraction)`);

      return {
        id: resort.id,
        name: resort.name,
        lat: resort.lat,
        lon: resort.lon,
        snowDepth: resort.conditions?.snowDepth || 0,
        recentSnowfall: Math.max(snowfallIn, resort.conditions?.recentSnowfall || 0), // Use max of calculated vs reported
        recentRainfall: rainfallIn,
        totalPrecipitation: totalPrecipIn,
        weeklySnowfall: resort.conditions?.weeklySnowfall,
        baseTemp: precipData?.tempC ? (precipData.tempC * 9/5 + 32) : (resort.conditions?.baseTemp || 20),
        windSpeed: resort.conditions?.windSpeed || 0,
        visibility: resort.conditions?.visibility || 'Good',
        elevationFt: resort.elevationFt
      };
    }) || [];

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
    const rainfall = Math.max(0, (resort.recentRainfall || 0) * intensityMultiplier);
    const totalPrecip = Math.max(0, resort.totalPrecipitation * intensityMultiplier);

    return {
      ...resort,
      lat: stormLat,
      lon: stormLon,
      recentSnowfall: snowfall,
      recentRainfall: rainfall,
      totalPrecipitation: totalPrecip
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
  // 0.25" was too aggressive in practice: if resorts report modest amounts,
  // IDW smoothing can easily push most pixels below that threshold -> fully transparent tiles.
  if (inches < 0.05) return new Uint8ClampedArray([0, 0, 0, 0]);

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
