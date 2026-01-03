import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { resorts } from '../../../lib/resorts';
import { Conditions } from '../../../lib/types';
import { getNWSObservation, NWSObservation } from '../../../lib/nws';
import { getHistoricalObservations } from '../../../lib/nws';
import snowModel from '../../../lib/snowModel';

// Generate weekly observations using real OpenWeatherMap forecast data and NWS data
async function generateWeeklyObservationsFromRealData(lat: number, lon: number, currentNWS: NWSObservation | null, currentWeather?: any) {
  const observations = [];
  let totalPrecipMm = 0;
  let totalTempC = 0;
  let totalWindKph = 0;
  const now = new Date();

  // Fetch real forecast data from OpenWeatherMap
  let forecastData = null;
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(forecastUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        forecastData = await response.json();
        console.log(`[API] Got real forecast data for ${lat},${lon}: ${forecastData.list?.length || 0} forecast points`);
      }
    }
  } catch (error) {
    console.log(`[API] Could not fetch forecast data, using current weather only:`, error instanceof Error ? error.message : String(error));
  }

  // Use provided current weather data or try to get current weather
  let realWeatherData = currentWeather;
  if (!realWeatherData) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const currentResponse = await fetch(currentUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          realWeatherData = {
            temp: currentData.main?.temp,
            humidity: currentData.main?.humidity,
            windSpeed: currentData.wind?.speed * 3.6, // m/s to kph
            weather: currentData.weather?.[0]?.main,
            description: currentData.weather?.[0]?.description
          };
        }
      }
    } catch (error) {
      console.log(`[API] Could not fetch current weather data:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Generate 7 daily observations instead of 168 hourly for better performance
  // This reduces processing time significantly while maintaining accuracy
  for (let i = 6; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily instead of hourly

    // Get forecast data for this day if available
    let forecastForDay = null;
    if (forecastData?.list) {
      // Find forecast entries for this day (within 24 hours of timestamp)
      const dayStart = new Date(timestamp);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      forecastForDay = forecastData.list.filter((f: any) => {
        const forecastTime = new Date(f.dt * 1000);
        return forecastTime >= dayStart && forecastTime < dayEnd;
      });
    }

    // Use forecast temperature or fall back to current weather or NWS data
    let baseTempC = realWeatherData?.temp ?? (currentNWS?.temperature ? (currentNWS.temperature - 32) * 5/9 : 0);

    // If we have forecast data, use the average temperature for the day
    if (forecastForDay && forecastForDay.length > 0) {
      const avgTemp = forecastForDay.reduce((sum: number, f: any) => sum + f.main.temp, 0) / forecastForDay.length;
      baseTempC = avgTemp;
    }

    // Add seasonal variation (colder in winter)
    const month = timestamp.getMonth();
    if (month >= 11 || month <= 2) { // Winter months (Dec-Feb)
      baseTempC -= 8; // Colder baseline for winter
    } else if (month >= 9 || month <= 4) { // Fall/Spring (Oct-Apr)
      baseTempC -= 3; // Mildly cooler
    }

    // Add daily temperature variation (simpler for daily observations)
    const hour = 12; // Assume noon for daily average
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5; // Reduced variation for daily
    const tempC = baseTempC + tempVariation + (Math.random() - 0.5) * 2; // Reduced noise for daily

    // Wind speed based on forecast or current conditions
    let baseWindKph = realWeatherData?.windSpeed ?? currentNWS?.windSpeed ?? 7.2;

    // If we have forecast data, use average wind speed
    if (forecastForDay && forecastForDay.length > 0) {
      const avgWind = forecastForDay.reduce((sum: number, f: any) => sum + (f.wind?.speed || 0) * 3.6, 0) / forecastForDay.length;
      if (avgWind > 0) baseWindKph = avgWind;
    }

    const windKph = Math.max(0, baseWindKph + (Math.random() - 0.5) * 4); // Reduced variation

    // Precipitation based on REAL forecast data or MORE REALISTIC synthetic fallback for winter resorts
    let precipMm = 0;
    const isWinter = month >= 11 || month <= 2;
    const isCold = tempC < 2;

    // Use real forecast precipitation data if available
    if (forecastData?.list) {
      // Find forecast entries for this day (within 24 hours of timestamp)
      const dayStart = new Date(timestamp);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const forecastForDay = forecastData.list.filter((f: any) => {
        const forecastTime = new Date(f.dt * 1000);
        return forecastTime >= dayStart && forecastTime < dayEnd;
      });

      if (forecastForDay.length > 0) {
        // Sum up precipitation from all forecast points for this day
        const totalForecastPrecip = forecastForDay.reduce((sum: number, f: any) => {
          const rain = f.rain?.['3h'] || 0;
          const snow = f.snow?.['3h'] || 0;
          return sum + rain + snow;
        }, 0);

        // Convert 3-hour totals to daily total and use directly WITHOUT artificial boosting
        precipMm = totalForecastPrecip;

        // Apply minimal randomization to account for forecast uncertainty, but keep close to real data
        precipMm *= 0.8 + Math.random() * 0.4; // 80-120% of forecast

        console.log(`[API] Using real forecast precipitation for day ${i}: ${precipMm.toFixed(2)}mm (from ${totalForecastPrecip.toFixed(2)}mm forecast)`);
      }
    }

    // If no forecast data available, use 0 precipitation (no synthetic data generation)
    // Real precipitation data should come from actual forecasts or historical observations
    if (precipMm === 0) {
      console.log(`[API] No forecast precipitation data available for day ${i}, using 0mm`);
    }

    observations.push({
      precipMm,
      tempC,
      windKph,
      timestamp: timestamp.toISOString()
    });

    totalPrecipMm += precipMm;
    totalTempC += tempC;
    totalWindKph += windKph;
  }

  return {
    observations,
    totalPrecipMm,
    avgTempC: totalTempC / observations.length,
    avgWindKph: totalWindKph / observations.length
  };
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

        // Use real NWS historical observations when available
        // Do NOT override with synthetic data for winter resorts - use real data only
        console.log(`[API] Using real NWS historical observations: ${hist.observations.length} observations, ${weeklyPrecipMm.toFixed(2)}mm total precip`);
      } else {
        // No historical observations available, try to get real forecast data
        console.log(`[API] No historical observations available, trying real forecast data`);
        const forecastWeeklyObs = await generateWeeklyObservationsFromRealData(resort.lat, resort.lon, nwsData, currentWeather);
        console.log(`[API] Forecast data: ${forecastWeeklyObs.observations.length} observations, total precip: ${forecastWeeklyObs.totalPrecipMm}mm`);
        extra.weeklyObservations = forecastWeeklyObs.observations;
        extra.weeklyPrecipMm = forecastWeeklyObs.totalPrecipMm;
        extra.avgTemp7d = forecastWeeklyObs.avgTempC;
        extra.avgWind7d = forecastWeeklyObs.avgWindKph;
        extra.elevationFt = resort.elevationFt ?? null;
        extra.stationDistanceKm = 0; // forecast data is local
      }
    } catch (e) {
      console.error(`[API] Historical observations failed:`, e);
      // Try to get real forecast data as fallback
      console.log(`[API] Historical fetch failed, trying real forecast data`);
      const forecastWeeklyObs = await generateWeeklyObservationsFromRealData(resort.lat, resort.lon, nwsData, currentWeather);
      console.log(`[API] Forecast data fallback: ${forecastWeeklyObs.observations.length} observations, total precip: ${forecastWeeklyObs.totalPrecipMm}mm`);
      extra.weeklyObservations = forecastWeeklyObs.observations;
      extra.weeklyPrecipMm = forecastWeeklyObs.totalPrecipMm;
      extra.avgTemp7d = forecastWeeklyObs.avgTempC;
      extra.avgWind7d = forecastWeeklyObs.avgWindKph;
      extra.elevationFt = resort.elevationFt ?? null;
      extra.stationDistanceKm = 0; // forecast data is local
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