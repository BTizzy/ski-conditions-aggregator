import { NextRequest, NextResponse } from 'next/server';
import { resorts } from '../../../lib/resorts';
import { getMultiStationObservations } from '../../../lib/nws';
import { scraperManager } from '../../../lib/scrapers/manager';

// Import the historical data functions from the scrape route
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

  console.log(`[Debug] Fetching historical data from ${startDateStr} to ${endDateStr} for ${lat},${lon}`);

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

    console.log(`[Debug] Got ${time.length} historical hourly records`);

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

      console.log(`[Debug] Day ${dateStr}: ${dayData.precipMm.toFixed(2)}mm precip, ${avgTempC.toFixed(1)}°C, ${avgWindKph.toFixed(1)}km/h wind`);
    });

    console.log(`[Debug] Historical data summary: ${validDays} days, ${totalPrecipMm.toFixed(2)}mm total precipitation`);

    return {
      observations,
      totalPrecipMm,
      avgTempC: validDays > 0 ? totalTempC / validDays : 0,
      avgWindKph: validDays > 0 ? totalWindKph / validDays : 7.2,
      avgHumidity: validDays > 0 ? observations.reduce((sum, obs) => sum + (obs.humidity || 50), 0) / validDays : 50
    };

  } catch (error) {
    console.error(`[Debug] Failed to fetch historical data from Open-Meteo:`, error instanceof Error ? error.message : String(error));

    // Fallback: return empty observations
    console.log(`[Debug] Returning empty historical observations - no actual past weather data available`);
    return {
      observations: [],
      totalPrecipMm: 0,
      avgTempC: 0,
      avgWindKph: 7.2,
      avgHumidity: 50
    };
  }
}

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

  console.log(`[Debug] Fetching 24h historical data from ${startDateStr} to ${endDateStr} for ${lat},${lon}`);

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

    console.log(`[Debug] Got ${time.length} historical hourly records for 24h analysis`);

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

    console.log(`[Debug] 24h historical data summary: ${observations.length} observations, ${totalPrecipMm.toFixed(2)}mm total precipitation`);

    return {
      observations,
      totalPrecipMm,
      avgTempC: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.tempC, 0) / observations.length : 0,
      avgHumidity: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.humidity, 0) / observations.length : 50,
      avgWindKph: observations.length > 0 ? observations.reduce((sum, obs) => sum + obs.windKph, 0) / observations.length : 7.2
    };

  } catch (error) {
    console.error(`[Debug] Failed to fetch 24h historical data from Open-Meteo:`, error instanceof Error ? error.message : String(error));

    // Fallback: return empty observations (no synthetic data generation)
    console.log(`[Debug] Returning empty 24h historical observations - no actual past weather data available`);
    return {
      observations: [],
      totalPrecipMm: 0,
      avgTempC: 0,
      avgHumidity: 50,
      avgWindKph: 7.2
    };
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get('resortId') || 'killington';
  const resort = resorts.find(r => r.id === resortId);

  if (!resort) {
    return NextResponse.json({ error: `Resort ${resortId} not found` }, { status: 404 });
  }

  const debugInfo: any = {
    resortId,
    resortName: resort.name,
    resortUrl: resort.scrapeUrl,
    coordinates: { lat: resort.lat, lon: resort.lon },
    timestamp: new Date().toISOString(),
    tests: {}
  };

  console.log(`[Debug API] Testing data sources for ${resort.name} (${resortId})`);

  // Test 1: Resort scraping
  try {
    console.log(`[Debug API] Testing resort scraping for ${resort.scrapeUrl}`);
    const scraped = await scraperManager.scrapeResortConditions(resort.scrapeUrl, resortId);
    debugInfo.tests.scraping = {
      success: scraped.success,
      data: scraped.success ? {
        snowDepth24h: scraped.snowDepth24h,
        snowDepth48h: scraped.snowDepth48h,
        snowDepth7d: scraped.snowDepth7d,
        baseDepth: scraped.baseDepth,
        temp: scraped.temp,
        windSpeed: scraped.windSpeed
      } : null,
      error: scraped.error
    };
    console.log(`[Debug API] Scraping result: ${scraped.success ? 'SUCCESS' : 'FAILED'} - ${scraped.error || 'OK'}`);
  } catch (e) {
    debugInfo.tests.scraping = { success: false, error: String(e) };
    console.log(`[Debug API] Scraping exception: ${String(e)}`);
  }

  // Test 2: Multi-station NWS
  try {
    console.log(`[Debug API] Testing multi-station NWS for ${resort.lat},${resort.lon}`);
    const multiStation = await getMultiStationObservations(resort.lat, resort.lon, 7);
    debugInfo.tests.multiStation = {
      stationCount: multiStation.stations.length,
      precipTotal: multiStation.weightedAverage.precipTotal,
      avgTempC: multiStation.weightedAverage.avgTempC,
      avgWindKph: multiStation.weightedAverage.avgWindKph,
      stations: multiStation.stations.map(s => ({
        id: s.stationId,
        distance: s.distance.toFixed(1) + 'km',
        precip: s.precipTotal.toFixed(2) + 'mm',
        obsCount: s.observations.length
      }))
    };
    console.log(`[Debug API] Multi-station result: ${multiStation.stations.length} stations, ${multiStation.weightedAverage.precipTotal.toFixed(2)}mm total precip`);
  } catch (e) {
    debugInfo.tests.multiStation = { error: String(e) };
    console.log(`[Debug API] Multi-station exception: ${String(e)}`);
  }

  // Test 3: Open-Meteo historical (weekly)
  try {
    console.log(`[Debug API] Testing Open-Meteo historical weekly data`);
    const historicalData = await generateWeeklyObservationsFromHistoricalData(resort.lat, resort.lon);
    debugInfo.tests.openMeteoHistorical = {
      totalPrecip: historicalData.totalPrecipMm.toFixed(2) + 'mm',
      obsCount: historicalData.observations.length,
      avgTemp: historicalData.avgTempC.toFixed(1) + '°C',
      avgWind: historicalData.avgWindKph.toFixed(1) + 'km/h',
      avgHumidity: historicalData.avgHumidity.toFixed(1) + '%'
    };
    console.log(`[Debug API] Open-Meteo historical result: ${historicalData.totalPrecipMm.toFixed(2)}mm precip, ${historicalData.observations.length} observations`);
  } catch (e) {
    debugInfo.tests.openMeteoHistorical = { error: String(e) };
    console.log(`[Debug API] Open-Meteo historical exception: ${String(e)}`);
  }

  // Test 4: Open-Meteo 24h
  try {
    console.log(`[Debug API] Testing Open-Meteo 24h historical data`);
    const historical24h = await generate24HourObservationsFromHistoricalData(resort.lat, resort.lon);
    debugInfo.tests.openMeteo24h = {
      totalPrecip: historical24h.totalPrecipMm.toFixed(2) + 'mm',
      obsCount: historical24h.observations.length,
      avgTemp: historical24h.avgTempC.toFixed(1) + '°C',
      avgWind: historical24h.avgWindKph.toFixed(1) + 'km/h',
      avgHumidity: historical24h.avgHumidity.toFixed(1) + '%'
    };
    console.log(`[Debug API] Open-Meteo 24h result: ${historical24h.totalPrecipMm.toFixed(2)}mm precip, ${historical24h.observations.length} observations`);
  } catch (e) {
    debugInfo.tests.openMeteo24h = { error: String(e) };
    console.log(`[Debug API] Open-Meteo 24h exception: ${String(e)}`);
  }

  console.log(`[Debug API] Completed testing for ${resort.name}`);

  return NextResponse.json(debugInfo, { status: 200 });
}