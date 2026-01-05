/**
 * Open-Meteo API integration for historical weather data
 * Provides snowfall and precipitation data for enhanced snow modeling
 */

export interface OpenMeteoHourlyData {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  snowfall: number[];
  relative_humidity_2m?: number[];
  dewpoint_2m?: number[];
  pressure_msl?: number[];
  windspeed_10m?: number[];
  winddirection_10m?: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: OpenMeteoHourlyData;
}

/**
 * Fetch historical weather data from Open-Meteo API
 */
export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  days: number = 7
): Promise<OpenMeteoResponse | null> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=temperature_2m,precipitation,snowfall,relative_humidity_2m,dewpoint_2m,pressure_msl,windspeed_10m,winddirection_10m&timezone=America/New_York`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Open-Meteo data:', error);
    return null;
  }
}

/**
 * Convert Open-Meteo data to format expected by snow model weeklyObservations
 */
export function convertToWeeklyObservations(openMeteoData: OpenMeteoResponse): Array<{
  precipMm: number;
  tempC: number;
  humidity?: number;
  dewpointC?: number;
  pressure?: number;
  windKph?: number;
  timestamp: string;
}> {
  const { hourly } = openMeteoData;
  const observations = [];

  // Group hourly data into daily observations (using noon values for temp, daily totals for precip)
  const dailyData: Record<string, any> = {};

  for (let i = 0; i < hourly.time.length; i++) {
    const date = hourly.time[i].split('T')[0];
    const hour = parseInt(hourly.time[i].split('T')[1].split(':')[0]);

    if (!dailyData[date]) {
      dailyData[date] = {
        precipMm: 0,
        tempC: null,
        humidity: null,
        dewpointC: null,
        pressure: null,
        windKph: null,
        timestamp: `${date}T12:00:00`,
        sampleCount: 0
      };
    }

    // Accumulate precipitation
    dailyData[date].precipMm += hourly.precipitation[i] || 0;

    // Use noon temperature as representative daily temp
    if (hour === 12) {
      dailyData[date].tempC = hourly.temperature_2m[i];
      dailyData[date].humidity = hourly.relative_humidity_2m?.[i];
      dailyData[date].dewpointC = hourly.dewpoint_2m?.[i];
      dailyData[date].pressure = hourly.pressure_msl?.[i];
      dailyData[date].windKph = hourly.windspeed_10m?.[i];
    }

    dailyData[date].sampleCount++;
  }

  // Convert to array format expected by snow model
  for (const date of Object.keys(dailyData).sort()) {
    const day = dailyData[date];
    if (day.tempC !== null) {
      observations.push({
        precipMm: day.precipMm,
        tempC: day.tempC,
        humidity: day.humidity,
        dewpointC: day.dewpointC,
        pressure: day.pressure,
        windKph: day.windKph,
        timestamp: day.timestamp
      });
    }
  }

  return observations;
}

/**
 * Get 7-day snowfall total from Open-Meteo data
 */
export function get7DaySnowfallTotal(openMeteoData: OpenMeteoResponse): number {
  const { hourly } = openMeteoData;
  let totalSnowfall = 0;

  for (const snowfall of hourly.snowfall) {
    totalSnowfall += snowfall || 0;
  }

  return totalSnowfall;
}

/**
 * Get 24-hour snowfall total from Open-Meteo data
 */
export function get24HourSnowfallTotal(openMeteoData: OpenMeteoResponse): number {
  const { hourly } = openMeteoData;
  let totalSnowfall = 0;

  // Get the most recent 24 hours of data
  const recentData = hourly.snowfall.slice(-24);

  for (const snowfall of recentData) {
    totalSnowfall += snowfall || 0;
  }

  return totalSnowfall;
}