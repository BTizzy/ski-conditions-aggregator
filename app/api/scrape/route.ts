import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { resorts } from '../../../lib/resorts';
import { Conditions } from '../../../lib/types';
import { getNWSObservation, NWSObservation } from '../../../lib/nws';
import { getHistoricalObservations, getMultiStationObservations } from '../../../lib/nws';
import snowModel from '../../../lib/snowModel';
import { scraperManager } from '../../../lib/scrapers/manager';

// Calculate pressure trend from historical data (placeholder for future enhancement)
function calculatePressureTrend(historicalPressures: number[]): string {
  // For now, return 'stable' as we don't have historical pressure data
  // Future enhancement: analyze pressure changes over time
  // 'falling' if pressure decreasing, 'rising' if increasing, 'stable' otherwise
  return 'stable';
}

// Generate 24-hour historical observations using REAL past weather data from Open-Meteo
async function generate24HourObservationsFromHistoricalData(lat: number, lon: number) {
  const observations: Array<{ precipMm: number; tempC: number; humidity: number; windKph: number; timestamp: string }> = [];
  const now = new Date();

  // Calculate date range for past 24 hours: yesterday and day before yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1); // Yesterday
  const dayBefore = new Date(yesterday);
  dayBefore.setDate(dayBefore.getDate() - 1); // Day before yesterday

  const startDateStr = dayBefore.toISOString().split('T')[0];
  const endDateStr = yesterday.toISOString().split('T')[0];

  console.log(`[API] Fetching 24h historical data from ${startDateStr} to ${endDateStr} for ${lat},${lon}`);

  try {
    // Use Open-Meteo's FREE historical weather API for hourly data
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

    console.log(`[API] Got ${time.length} historical hourly records for 24h analysis`);

    // Get the last 24 hours of data (most recent)
    const last24Hours = time.slice(-24);
    const last24Precip = precipitation.slice(-24);
    const last24Temp = temperature_2m.slice(-24);
    const last24Humidity = relative_humidity_2m.slice(-24);
    const last24Wind = wind_speed_10m.slice(-24);

    // Convert to observations array (one per hour for the last 24h)
    let totalPrecipMm = 0;

    for (let i = 0; i < last24Hours.length; i++) {
      const timestamp = new Date(last24Hours[i]);
      const precipMm = last24Precip[i] || 0;
      const tempC = last24Temp[i] != null ? last24Temp[i] : 0;
      const humidity = last24Humidity[i] != null ? last24Humidity[i] : 50;
      const windKph = last24Wind[i] != null ? last24Wind[i] : 7.2;

      observations.push({
        precipMm,
        tempC,
        humidity,
        windKph,
        timestamp: timestamp.toISOString()
      });

      totalPrecipMm += precipMm;
    }

    console.log(`[API] 24h historical data summary: ${observations.length} observations, ${totalPrecipMm.toFixed(2)}mm total precipitation`);

    return {
      observations,
      totalPrecipMm,
      avgTempC: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.tempC, 0) / observations.length : 0,
      avgHumidity: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.humidity, 0) / observations.length : 50,
      avgWindKph: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.windKph, 0) / observations.length : 7.2
    };

  } catch (error) {
    console.error(`[API] Failed to fetch 24h historical data from Open-Meteo:`, error instanceof Error ? error.message : String(error));

    // Fallback: return empty observations (no synthetic data generation)
    console.log(`[API] Returning empty 24h historical observations - no actual past weather data available`);
    return {
      observations: [],
      totalPrecipMm: 0,
      avgTempC: 0,
      avgHumidity: 50,
      avgWindKph: 7.2
    };
  }
}

// Generate weekly observations using REAL historical weather data from Open-Meteo
async function generateWeeklyObservationsFromHistoricalData(lat: number, lon: number) {
  const observations: Array<{ precipMm: number; tempC: number; windKph: number; humidity: number; timestamp: string }> = [];
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

    dailyData.forEach((dayData, dateStr) => {
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
        humidity: avgHumidity,
        timestamp: timestamp.toISOString()
      });

      totalPrecipMm += dayData.precipMm;
      totalTempC += avgTempC;
      totalWindKph += avgWindKph;
      validDays++;

      console.log(`[API] Day ${dateStr}: ${dayData.precipMm.toFixed(2)}mm precip, ${avgTempC.toFixed(1)}°C, ${avgWindKph.toFixed(1)}km/h wind`);
    });

    console.log(`[API] Historical data summary: ${validDays} days, ${totalPrecipMm.toFixed(2)}mm total precipitation`);

    return {
      observations,
      totalPrecipMm,
      avgTempC: validDays > 0 ? totalTempC / validDays : 0,
      avgWindKph: validDays > 0 ? totalWindKph / validDays : 7.2,
      avgHumidity: validDays > 0 ? observations.reduce((sum, obs) => sum + (obs.humidity || 50), 0) / validDays : 50
    };

  } catch (error) {
    console.error(`[API] Failed to fetch historical data from Open-Meteo:`, error instanceof Error ? error.message : String(error));

    // Fallback: return empty observations (no synthetic data generation)
    console.log(`[API] Returning empty historical observations - no actual past weather data available`);
    return {
      observations: [],
      totalPrecipMm: 0,
      avgTempC: 0,
      avgWindKph: 7.2,
      avgHumidity: 50
    };
  }
}

// Intelligent resort website scraping with fallback to model estimates
async function scrapeResortConditions(url: string, resortId?: string): Promise<any> {
  try {
    console.log(`[API] Attempting to scrape resort data from ${url} for ${resortId || 'unknown'}`);

    const scrapedData = await scraperManager.scrapeResortConditions(url, resortId);

    if (scrapedData.success) {
      console.log(`[API] Successfully scraped resort data:`, scrapedData);

      // Return the scraped data in the expected format
      return {
        snowDepth: scrapedData.baseDepth || 0,
        recentSnowfall: scrapedData.snowDepth24h || 0,
        trailOpen: 0, // Not available from scraping
        trailTotal: 0, // Not available from scraping
        groomed: 0, // Not available from scraping
        baseTemp: scrapedData.temp || null,
        windSpeed: scrapedData.windSpeed || null,
        visibility: null, // Not available from scraping
        rawHtml: null, // Not storing raw HTML
        scrapedData: scrapedData // Include full scraped data for debugging
      };
    } else {
      console.log(`[API] Resort scraping failed: ${scrapedData.error}, will use model estimates`);
      // Return zeros/nulls for legacy fields when scraping fails
      return {
        snowDepth: 0,
        recentSnowfall: 0,
        trailOpen: 0,
        trailTotal: 0,
        groomed: 0,
        baseTemp: null,
        windSpeed: null,
        visibility: null,
        rawHtml: null,
        scrapeError: scrapedData.error
      };
    }
  } catch (error) {
    console.error(`[API] Unexpected error during resort scraping:`, error);
    // Return zeros/nulls for legacy fields on error
    return {
      snowDepth: 0,
      recentSnowfall: 0,
      trailOpen: 0,
      trailTotal: 0,
      groomed: 0,
      baseTemp: null,
      windSpeed: null,
      visibility: null,
      rawHtml: null,
      scrapeError: error instanceof Error ? error.message : 'Unknown scraping error'
    };
  }
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

    // Extract additional weather parameters for improved snow model accuracy
    let humidity = null;
    let dewpoint = null;
    let pressure = null;
    let pressureTrend = 'stable';

    // Extract from NWS data first (most reliable)
    if (nwsData?.raw) {
      humidity = nwsData.raw.relativeHumidity?.value || null;
      dewpoint = nwsData.raw.dewpoint?.value || null; // in Celsius
      pressure = nwsData.raw.barometricPressure?.value || null; // in Pascals
      console.log(`[API] NWS extracted: humidity=${humidity}%, dewpoint=${dewpoint}°C, pressure=${pressure}Pa`);
    }

    // Extract from OpenWeatherMap as fallback/supplement
    if (currentWeather?.main) {
      if (humidity === null) humidity = currentWeather.main.humidity || null; // percentage
      if (dewpoint === null && currentWeather.main.temp && humidity) {
        // Approximate dewpoint calculation: Td = T - ((100 - RH)/5)
        dewpoint = currentWeather.main.temp - ((100 - humidity) / 5);
      }
      if (pressure === null) pressure = currentWeather.main.pressure ? currentWeather.main.pressure * 100 : null; // hPa to Pa
      console.log(`[API] OpenWeatherMap extracted: humidity=${humidity}%, dewpoint=${dewpoint}°C, pressure=${pressure}Pa`);
    }

    // Predict using our snow model (deterministic heuristics + optional extra inputs)
    // Attempt to fetch historical observations for the resort (last 7 days) to improve weekly totals
    let extra: any = {};
    // Try resort scraping first for official snow reports
    let scrapedData = null;
    try {
      console.log(`[API] Attempting to scrape official resort data from ${resort.scrapeUrl}`);
      scrapedData = await scrapeResortConditions(resort.scrapeUrl, resortId);
      console.log(`[API] Scraped data from resort:`, scrapedData);
    } catch (e) {
      console.log(`[API] Resort scraping failed, will use model estimates:`, e);
    }

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

    // If scraping succeeded, use those values preferentially
    if (scrapedData && scrapedData.recentSnowfall !== null && scrapedData.recentSnowfall > 0) {
      extra.resortReported24h = scrapedData.recentSnowfall;
      console.log(`[API] Using scraped 24h snowfall: ${scrapedData.recentSnowfall}"`);
    }
    if (scrapedData && scrapedData.scrapedData?.snowDepth7d !== null && scrapedData.scrapedData.snowDepth7d > 0) {
      extra.resortReportedWeekly = scrapedData.scrapedData.snowDepth7d;
      extra.resortWeight = 0.85; // High trust in resort reports
      console.log(`[API] Using scraped 7d snowfall: ${scrapedData.scrapedData.snowDepth7d}" with high weight`);
    }

    // Add scraped weather data if available
    if (scrapedData && scrapedData.baseTemp !== null) {
      // Use scraped temperature if available (takes precedence over NWS)
      console.log(`[API] Using scraped temperature: ${scrapedData.baseTemp}°F`);
    }
    if (scrapedData && scrapedData.windSpeed !== null) {
      // Use scraped wind if available
      console.log(`[API] Using scraped wind speed: ${scrapedData.windSpeed} mph`);
    }
    try {
      console.log(`[API] Fetching multi-station historical observations`);
      const multiStationData = await getMultiStationObservations(resort.lat, resort.lon, 7);
      console.log(`[API] Multi-station data received: ${multiStationData.stations.length} stations, ${multiStationData.weightedAverage.precipTotal.toFixed(2)}mm weighted precip`);

      if (multiStationData.weightedAverage.precipTotal > 0) {
        console.log(`[API] Using multi-station data from ${multiStationData.stations.length} stations`);
        extra.weeklyObservations = multiStationData.weightedAverage.observations;
        extra.weeklyPrecipMm = multiStationData.weightedAverage.precipTotal;
        extra.avgTemp7d = multiStationData.weightedAverage.avgTempC;
        extra.avgWind7d = multiStationData.weightedAverage.avgWindKph;
        extra.multiStationCount = multiStationData.stations.length;
        extra.elevationFt = resort.elevationFt ?? null;

        // Add extracted weather parameters for improved snow model accuracy
        extra.humidity = humidity;
        extra.dewpoint = dewpoint;
        extra.pressure = pressure;
        extra.pressureTrend = pressureTrend;

        // Log station details for debugging
        multiStationData.stations.forEach(station => {
          console.log(`[API] Station ${station.stationId}: ${station.distance.toFixed(1)}km, ${station.precipTotal.toFixed(2)}mm precip`);
        });
      } else {
        // Fall back to single station approach
        console.log(`[API] Multi-station had no precipitation, falling back to single station`);
        const hist = await getHistoricalObservations(resort.lat, resort.lon, 7);
        console.log(`[API] Single station historical observations received:`, hist?.observations?.length || 0, 'observations');

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

          // Add extracted weather parameters for improved snow model accuracy
          extra.humidity = humidity;
          extra.dewpoint = dewpoint;
          extra.pressure = pressure;
          extra.pressureTrend = pressureTrend;
        }
      }

      // Fetch 24-hour historical observations for accurate recent snowfall calculation
      console.log(`[API] Fetching 24-hour historical observations for accurate recent snowfall`);
      const historical24hObs = await generate24HourObservationsFromHistoricalData(resort.lat, resort.lon);
      console.log(`[API] 24h historical data: ${historical24hObs.observations.length} observations, ${historical24hObs.totalPrecipMm.toFixed(2)}mm total precipitation`);

      if (historical24hObs.totalPrecipMm > 0) {
        extra.recent24hObservations = historical24hObs.observations;
        extra.recent24hPrecipMm = historical24hObs.totalPrecipMm;
        console.log(`[API] Using real 24h historical precipitation: ${historical24hObs.totalPrecipMm.toFixed(2)}mm`);
      } else {
        console.log(`[API] No real 24h historical precipitation data available, will use NWS forecast estimate`);
      }

    } catch (e) {
      console.error(`[API] Historical observations failed:`, e);
      // Try to get real historical data as fallback
      try {
        const historicalWeeklyObs = await generateWeeklyObservationsFromHistoricalData(resort.lat, resort.lon);
        console.log(`[API] Fallback historical data: ${historicalWeeklyObs.observations.length} observations, total precip: ${historicalWeeklyObs.totalPrecipMm}mm`);
        extra.weeklyObservations = historicalWeeklyObs.observations;
        extra.weeklyPrecipMm = historicalWeeklyObs.totalPrecipMm;
        extra.avgTemp7d = historicalWeeklyObs.avgTempC;
        extra.avgWind7d = historicalWeeklyObs.avgWindKph;
        extra.elevationFt = resort.elevationFt ?? null;
        extra.stationDistanceKm = 0; // local historical data

        // Add extracted weather parameters for improved snow model accuracy
        extra.humidity = humidity;
        extra.dewpoint = dewpoint;
        extra.pressure = pressure;
        extra.pressureTrend = pressureTrend;
      } catch (fallbackError) {
        console.error(`[API] Fallback historical data also failed:`, fallbackError);
      }
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
      // Include elevation data for temperature corrections
      elevationFt: resort.elevationFt ?? null,
      baseElevationFt: resort.baseElevationFt ?? null,
      summitElevationFt: resort.summitElevationFt ?? null,
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