import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { resorts } from '../../../lib/resorts';
import { Conditions } from '../../../lib/types';
import { getNWSObservation, NWSObservation } from '../../../lib/nws';
import { getHistoricalObservations } from '../../../lib/nws';
import snowModel from '../../../lib/snowModel';

// Generate weekly observations using REAL historical weather data from Open-Meteo
async function generateWeeklyObservationsFromHistoricalData(lat: number, lon: number) {
  const observations = [];
  const now = new Date();

  // Calculate date range for past 7 days
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - 1); // Yesterday (don't include today)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 7 days ago

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log(`[API] Fetching historical data from ${startDateStr} to ${endDateStr} for ${lat},${lon}`);

  try {
    // Use Open-Meteo's FREE historical weather API
    const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=America/New_York`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    const response = await fetch(historicalUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.hourly || !data.hourly.time || !Array.isArray(data.hourly.time)) {
      throw new Error('Invalid response format from Open-Meteo API');
    }

    const { time, precipitation, temperature_2m, relative_humidity_2m, wind_speed_10m } = data.hourly;

    console.log(`[API] Got ${time.length} historical hourly records`);

    // Group by day and aggregate
    const dailyData = new Map();

    for (let i = 0; i < time.length; i++) {
      const timestamp = new Date(time[i]);
      const dateKey = timestamp.toISOString().split('T')[0];

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          precipMm: 0,
          temps: [],
          humidities: [],
          windSpeeds: []
        });
      }

      const dayData = dailyData.get(dateKey);
      dayData.precipMm += precipitation[i] || 0;
      if (temperature_2m[i] != null) dayData.temps.push(temperature_2m[i]);
      if (relative_humidity_2m[i] != null) dayData.humidities.push(relative_humidity_2m[i]);
      if (wind_speed_10m[i] != null) dayData.windSpeeds.push(wind_speed_10m[i]);
    }

    // Convert to observations array (one per day)
    let totalPrecipMm = 0;
    let totalTempC = 0;
    let totalWindKph = 0;
    let validDays = 0;

    for (const [dateStr, dayData] of dailyData.entries()) {
      const timestamp = new Date(dateStr + 'T12:00:00'); // Noon for daily average

      // Calculate daily averages
      const avgTempC = dayData.temps.length > 0
        ? dayData.temps.reduce((sum: number, temp: number) => sum + temp, 0) / dayData.temps.length
        : 0;

      const avgHumidity = dayData.humidities.length > 0
        ? dayData.humidities.reduce((sum: number, hum: number) => sum + hum, 0) / dayData.humidities.length
        : 50;

      const avgWindKph = dayData.windSpeeds.length > 0
        ? dayData.windSpeeds.reduce((sum: number, wind: number) => sum + wind, 0) / dayData.windSpeeds.length
        : 7.2;

      observations.push({
        precipMm: dayData.precipMm,
        tempC: avgTempC,
        windKph: avgWindKph,
        timestamp: timestamp.toISOString()
      });

      totalPrecipMm += dayData.precipMm;
      totalTempC += avgTempC;
      totalWindKph += avgWindKph;
      validDays++;

      console.log(`[API] Day ${dateStr}: ${dayData.precipMm.toFixed(2)}mm precip, ${avgTempC.toFixed(1)}°C, ${avgWindKph.toFixed(1)}km/h wind`);
    }

    console.log(`[API] Historical data summary: ${validDays} days, ${totalPrecipMm.toFixed(2)}mm total precipitation`);

    return {
      observations,
      totalPrecipMm,
      avgTempC: validDays > 0 ? totalTempC / validDays : 0,
      avgWindKph: validDays > 0 ? totalWindKph / validDays : 7.2
    };

  } catch (error) {
    console.error(`[API] Failed to fetch historical data from Open-Meteo:`, error instanceof Error ? error.message : String(error));

    // Fallback: return empty observations (no synthetic data generation)
    console.log(`[API] Returning empty historical observations - no actual past weather data available`);
    return {
      observations: [],
      totalPrecipMm: 0,
      avgTempC: 0,
      avgWindKph: 7.2
    };
  }
}

// Resort-specific scraping removed. All logic now uses NWS-based predictive model.
async function scrapeResortConditions(url: string, resortId?: string): Promise<any> {
  // No-op: always return zeros/nulls for legacy fields
  return { snowDepth: 0, recentSnowfall: 0, trailOpen: 0, trailTotal: 0, groomed: 0, baseTemp: null, windSpeed: null, visibility: null, rawHtml: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get('resortId');

  if (!resortId) {
    return NextResponse.json({ error: 'resortId required' }, { status: 400 });
  }

  const resort = resorts.find(r => r.id === resortId);
  if (!resort) {
    return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
  }

  try {
    console.log(`[API] Starting conditions fetch for ${resort.name} (${resortId})`);

    // Fetch all data in parallel to reduce response time
    console.log(`[API] Fetching NWS data and OpenWeatherMap current weather in parallel`);

    const [nws, openWeatherData] = await Promise.allSettled([
      getNWSObservation(resort.lat, resort.lon).catch(e => {
        console.error(`[API] NWS fetch failed:`, e);
        return null;
      }),
      // Fetch current weather from OpenWeatherMap for more realistic synthetic data
      (async () => {
        try {
          const apiKey = process.env.OPENWEATHER_API_KEY;
          if (apiKey) {
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${resort.lat}&lon=${resort.lon}&appid=${apiKey}&units=metric`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(currentUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
              return await response.json();
            }
          }
        } catch (error) {
          console.log(`[API] OpenWeatherMap fetch failed:`, error instanceof Error ? error.message : String(error));
        }
        return null;
      })()
    ]);

    const nwsData = nws.status === 'fulfilled' ? nws.value : null;
    const currentWeather = openWeatherData.status === 'fulfilled' ? openWeatherData.value : null;

    console.log(`[API] NWS data received:`, nwsData ? 'success' : 'failed');
    console.log(`[API] OpenWeatherMap data received:`, currentWeather ? 'success' : 'failed');

    // Predict using our snow model (deterministic heuristics + optional extra inputs)
    // Attempt to fetch historical observations for the resort (last 7 days) to improve weekly totals
    let extra: any = {};
    // Allow callers to pass resort-reported weekly totals and a resort weight to bias the model.
    try {
      const urlObj = new URL(request.url);
      const rp = urlObj.searchParams.get('resortReportedWeekly');
      const rw = urlObj.searchParams.get('resortWeight');
      if (rp != null) {
        const parsed = parseFloat(rp as string);
        if (!Number.isNaN(parsed)) extra.resortReportedWeekly = parsed;
      }
      if (rw != null) {
        const parsed = parseFloat(rw as string);
        if (!Number.isNaN(parsed)) extra.resortWeight = parsed;
      }
    } catch (e) {
      // ignore
    }
    try {
      console.log(`[API] Fetching historical observations`);
      const hist = await getHistoricalObservations(resort.lat, resort.lon, 7);
      console.log(`[API] Historical observations received:`, hist?.observations?.length || 0, 'observations');
      if (hist && Array.isArray(hist.observations) && hist.observations.length > 0) {
        const weeklyObs: any[] = [];
        let weeklyPrecipMm = 0;
        for (const f of hist.observations) {
          const p = f.properties || f;
          const precipMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value : (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : null);
          const tempC = (p.temperature && typeof p.temperature.value === 'number') ? p.temperature.value : (typeof p.temperature === 'number' ? p.temperature : null);
          const windKph = (p.windSpeed && typeof p.windSpeed.value === 'number') ? (p.windSpeed.value * 3.6) : null; // m/s -> kph
          weeklyObs.push({ precipMm: precipMm, tempC: tempC, windKph, timestamp: p.timestamp || p.validTime || null });
          if (typeof precipMm === 'number') weeklyPrecipMm += precipMm;
        }
        extra.weeklyObservations = weeklyObs;
        extra.weeklyPrecipMm = weeklyPrecipMm;
        extra.avgTemp7d = weeklyObs.reduce((s, o) => s + (o.tempC ?? 0), 0) / Math.max(1, weeklyObs.length);
        extra.avgWind7d = weeklyObs.reduce((s, o) => s + (o.windKph ?? 0), 0) / Math.max(1, weeklyObs.length);
        extra.elevationFt = resort.elevationFt ?? null;
        extra.stationDistanceKm = hist.stationDistanceKm;

        // Check if NWS data has any actual precipitation - if not, prefer Open-Meteo
        const hasPrecipitation = weeklyPrecipMm > 0;
        if (!hasPrecipitation) {
          console.log(`[API] NWS historical data has no precipitation (${weeklyPrecipMm}mm), trying Open-Meteo for better data`);
          const historicalWeeklyObs = await generateWeeklyObservationsFromHistoricalData(resort.lat, resort.lon);
          console.log(`[API] Open-Meteo fallback: ${historicalWeeklyObs.observations.length} observations, total precip: ${historicalWeeklyObs.totalPrecipMm}mm`);
          if (historicalWeeklyObs.totalPrecipMm > 0) {
            extra.weeklyObservations = historicalWeeklyObs.observations;
            extra.weeklyPrecipMm = historicalWeeklyObs.totalPrecipMm;
            extra.avgTemp7d = historicalWeeklyObs.avgTempC;
            extra.avgWind7d = historicalWeeklyObs.avgWindKph;
            extra.stationDistanceKm = 0; // local historical data
            console.log(`[API] Using Open-Meteo historical data: ${historicalWeeklyObs.totalPrecipMm}mm total precip`);
          } else {
            console.log(`[API] Using NWS historical observations (empty but available): ${hist.observations.length} observations, ${weeklyPrecipMm.toFixed(2)}mm total precip`);
          }
        } else {
          // Use real NWS historical observations when available
          // Do NOT override with synthetic data for winter resorts - use real data only
          console.log(`[API] Using real NWS historical observations: ${hist.observations.length} observations, ${weeklyPrecipMm.toFixed(2)}mm total precip`);
        }
      } else {
        // No historical observations available, try to get real historical data from Open-Meteo
        console.log(`[API] No NWS historical observations available, trying Open-Meteo historical data`);
        const historicalWeeklyObs = await generateWeeklyObservationsFromHistoricalData(resort.lat, resort.lon);
        console.log(`[API] Historical data: ${historicalWeeklyObs.observations.length} observations, total precip: ${historicalWeeklyObs.totalPrecipMm}mm`);
        extra.weeklyObservations = historicalWeeklyObs.observations;
        extra.weeklyPrecipMm = historicalWeeklyObs.totalPrecipMm;
        extra.avgTemp7d = historicalWeeklyObs.avgTempC;
        extra.avgWind7d = historicalWeeklyObs.avgWindKph;
        extra.elevationFt = resort.elevationFt ?? null;
        extra.stationDistanceKm = 0; // local historical data
      }
    } catch (e) {
      console.error(`[API] Historical observations failed:`, e);
      // Try to get real historical data as fallback
      console.log(`[API] Historical fetch failed, trying Open-Meteo historical data`);
      const historicalWeeklyObs = await generateWeeklyObservationsFromHistoricalData(resort.lat, resort.lon);
      console.log(`[API] Historical data fallback: ${historicalWeeklyObs.observations.length} observations, total precip: ${historicalWeeklyObs.totalPrecipMm}mm`);
      extra.weeklyObservations = historicalWeeklyObs.observations;
      extra.weeklyPrecipMm = historicalWeeklyObs.totalPrecipMm;
      extra.avgTemp7d = historicalWeeklyObs.avgTempC;
      extra.avgWind7d = historicalWeeklyObs.avgWindKph;
      extra.elevationFt = resort.elevationFt ?? null;
      extra.stationDistanceKm = 0; // local historical data
    }

    console.log(`[API] Calling predictFromNWS with nws=`, nwsData !== null, 'extra keys=', Object.keys(extra));
    const pred = snowModel.predictFromNWS(nwsData, extra);
    console.log(`[API] Prediction result:`, pred);

    // Trail data is not available from our sources, so set to 0
    const trailOpen = 0;
    const trailTotal = 0;
    const groomed = 0;

    const conditions: Conditions = {
      resortId,
      timestamp: new Date(),
      snowDepth: pred.snowDepth,
      recentSnowfall: pred.recentSnowfall,
      recentRainfall: pred.weeklyRainIn ? pred.weeklyRainIn / 7 * 1 : 0, // Estimate recent rain from weekly average
      weeklySnowfall: pred.weeklySnowfall ?? 0,
      weeklyRainfall: pred.weeklyRainIn ?? 0,
      expectedOnGround: pred.expectedOnGround ?? pred.snowDepth,
      baseTemp: pred.baseTemp ?? 0,
      windSpeed: pred.windSpeed ?? 0,
      visibility: pred.visibility,
      trailStatus: { open: trailOpen, total: trailTotal, groomed },
      rawData: { nws, model: pred },
    };

    console.log(`[API] Returning conditions for ${resort.name}:`, conditions);
    // TODO: Store in Supabase

    return NextResponse.json(conditions);
  } catch (error) {
    // If error is from scraping, return a clear error message
    const errorMsg = (error as Error)?.message || 'Unknown error';
    const errorStack = (error as Error)?.stack || '';
    console.error(`[API] Fatal error for ${resortId}:`, errorMsg, errorStack);
    return NextResponse.json(
      { error: errorMsg, type: 'scrape-failed', stack: errorStack },
      { status: 502 }
    );
  }
}