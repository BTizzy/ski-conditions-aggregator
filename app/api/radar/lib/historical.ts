// Historical NWS data fetching and processing for synthetic radar
// Fetches past 48 hours of observations from all stations within 50 miles of each resort
// Enhanced with OpenWeatherMap for better precipitation data

import { NWSObservation } from '../../../../lib/nws';
import { resorts } from '../../../../lib/resorts';

export interface HourlySnowfall {
  timestamp: number; // Unix timestamp (ms)
  snowfallIn: number; // Estimated snowfall inches for that hour
  rainfallIn: number; // Estimated rainfall inches for that hour
  lat: number;
  lon: number;
  stationId: string;
}

export interface StationData {
  stationId: string;
  lat: number;
  lon: number;
  hourlyData: HourlySnowfall[];
}

export interface ResortAreaData {
  resortId: string;
  stations: StationData[];
}

// Cache for resort area historical data
let cachedResortData: ResortAreaData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find all weather stations within a radius using OpenWeatherMap API
async function findNearbyStations(lat: number, lon: number, radiusMiles: number = 50): Promise<{id: string, lat: number, lon: number}[]> {
  try {
    // Use OpenWeatherMap stations API to find stations near the location
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('No OpenWeatherMap API key found, using fallback');
      return [];
    }

    // Convert miles to meters for the API
    const radiusMeters = radiusMiles * 1609.34;

    const url = `https://api.openweathermap.org/data/2.5/station/find?lat=${lat}&lon=${lon}&cnt=50&appid=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Failed to fetch stations near ${lat},${lon}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const stations: {id: string, lat: number, lon: number}[] = [];

    for (const station of data || []) {
      const stationLat = station.coord?.lat;
      const stationLon = station.coord?.lon;
      const stationId = station.id?.toString();

      if (stationLat && stationLon && stationId) {
        const distance = haversineDistance(lat, lon, stationLat, stationLon);
        if (distance <= radiusMiles) {
          stations.push({
            id: stationId,
            lat: stationLat,
            lon: stationLon
          });
        }
      }
    }

    console.log(`Found ${stations.length} stations within ${radiusMiles} miles of ${lat},${lon}`);
    return stations;
  } catch (error) {
    console.error(`Error finding nearby stations:`, error);
    return [];
  }
}

// Fetch historical observations from OpenWeatherMap API for past 48 hours
async function fetchHistoricalObservations(stationId: string, stationLat: number, stationLon: number): Promise<NWSObservation[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('No OpenWeatherMap API key found, using synthetic data');
    return [];
  }

  try {
    // Get 5-day forecast data (3-hour intervals) for better precipitation accuracy
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${stationLat}&lon=${stationLon}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      if (forecastResponse.status === 429) {
        console.warn(`OpenWeatherMap API error: 429 (rate limit exceeded) for station ${stationId}`);
      } else {
        console.warn(`OpenWeatherMap API error: ${forecastResponse.status} for station ${stationId}`);
      }
      return [];
    }

    const forecastData = await forecastResponse.json();

    // Convert forecast data to observation format
    const observations: NWSObservation[] = [];

    for (const item of forecastData.list) {
      // Extract precipitation data (rain and snow are separate in OpenWeatherMap)
      const rainMm = item.rain?.['3h'] || 0; // Rain in last 3 hours
      const snowMm = item.snow?.['3h'] || 0; // Snow in last 3 hours
      const totalPrecipMm = rainMm + snowMm;

      const observation: NWSObservation = {
        timestamp: new Date(item.dt * 1000).toISOString(), // Convert Unix timestamp
        temperature: item.main?.temp || null,
        windSpeed: item.wind?.speed ? item.wind.speed * 3.6 : null, // Convert m/s to km/h
        windDirection: item.wind?.deg || null,
        textDescription: item.weather?.[0]?.description || 'Unknown',
        icon: item.weather?.[0]?.icon || '',
        raw: {
          ...item,
          precipitation: totalPrecipMm > 0 ? { value: totalPrecipMm, unitCode: 'mm' } : undefined,
          temperature: item.main?.temp ? { value: item.main.temp, unitCode: 'C' } : undefined,
          // Store rain/snow separately for better snow estimation
          rain: rainMm > 0 ? { value: rainMm, unitCode: 'mm' } : undefined,
          snow: snowMm > 0 ? { value: snowMm, unitCode: 'mm' } : undefined
        }
      };

      observations.push(observation);
    }

    // If we have forecast data, also get current conditions for more recent data
    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${stationLat}&lon=${stationLon}&appid=${apiKey}&units=metric`;
      const currentResponse = await fetch(currentUrl);

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();

        // Add current observation if it's not already covered by forecast
        const currentTime = new Date().getTime() / 1000;
        const hasRecentData = observations.some(obs => {
          const obsTime = new Date(obs.timestamp).getTime() / 1000;
          return Math.abs(obsTime - currentTime) < 3600; // Within 1 hour
        });

        if (!hasRecentData) {
          const currentObservation: NWSObservation = {
            timestamp: new Date().toISOString(),
            temperature: currentData.main?.temp || null,
            windSpeed: currentData.wind?.speed ? currentData.wind.speed * 3.6 : null,
            windDirection: currentData.wind?.deg || null,
            textDescription: currentData.weather?.[0]?.description || 'Unknown',
            icon: currentData.weather?.[0]?.icon || '',
            raw: {
              ...currentData,
              precipitation: undefined, // Current weather doesn't have precipitation history
              temperature: currentData.main?.temp ? { value: currentData.main.temp, unitCode: 'C' } : undefined
            }
          };
          observations.unshift(currentObservation); // Add at beginning
        }
      }
    } catch (currentError) {
      console.warn(`Failed to fetch current weather for station ${stationId}:`, currentError);
      // Continue with forecast data only
    }

    return observations;
  } catch (error) {
    console.warn(`Failed to fetch forecast data for station ${stationId}:`, error);
    return [];
  }
}

// Estimate snowfall and rainfall from precipitation data
function estimateSnowfall(precipMm: number, tempC: number, rainMm?: number, snowMm?: number): { snowfallIn: number; rainfallIn: number } {
  // If we have direct rain/snow data from OpenWeatherMap, use it directly
  if (rainMm !== undefined && snowMm !== undefined) {
    const totalPrecipMm = rainMm + snowMm;
    if (totalPrecipMm <= 0) return { snowfallIn: 0, rainfallIn: 0 };

    // Convert mm to inches
    const snowfallIn = snowMm / 25.4;
    const rainfallIn = rainMm / 25.4;
    return { snowfallIn, rainfallIn };
  }

  // Fallback to temperature-based estimation if no direct rain/snow data
  if (precipMm <= 0) return { snowfallIn: 0, rainfallIn: 0 };

  const precipIn = precipMm / 25.4;
  let snowFraction = 0;

  if (tempC <= -10) snowFraction = 1.0;
  else if (tempC <= -2) snowFraction = 0.95;
  else if (tempC <= 0) snowFraction = 0.9;
  else if (tempC <= 3) snowFraction = 0.6;
  else snowFraction = 0.1;

  let ratio = 10; // default liquid to snow ratio
  if (tempC <= -10) ratio = 18;
  else if (tempC <= -2) ratio = 14;
  else if (tempC <= 0) ratio = 12;
  else if (tempC <= 3) ratio = 10;
  else ratio = 8;

  const snowfallIn = precipIn * ratio * snowFraction;
  const rainfallIn = precipIn * (1 - snowFraction);

  return { snowfallIn, rainfallIn };
}

// Process observations into hourly snowfall estimates with station location
function processHourlySnowfall(observations: NWSObservation[], stationLat: number, stationLon: number, stationId: string): HourlySnowfall[] {
  const hourly: { [hour: string]: { rain: number; snow: number; temp: number; count: number } } = {};

  for (const obs of observations) {
    const timestamp = new Date(obs.timestamp);
    const hourKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;

    // Get rain and snow data separately if available, otherwise fall back to total precipitation
    const rainMm = obs.raw?.rain?.value || 0;
    const snowMm = obs.raw?.snow?.value || 0;
    const totalPrecip = obs.raw?.precipitation?.value || 0;

    // If we don't have separate rain/snow data, assume all precipitation is rain (will be converted in estimateSnowfall)
    const effectiveRain = (rainMm + snowMm) > 0 ? rainMm : totalPrecip;
    const effectiveSnow = snowMm;

    const temp = obs.raw?.temperature?.value || obs.temperature || 0;

    if (!hourly[hourKey]) {
      hourly[hourKey] = { rain: 0, snow: 0, temp: 0, count: 0 };
    }

    hourly[hourKey].rain += effectiveRain;
    hourly[hourKey].snow += effectiveSnow;
    hourly[hourKey].temp += temp;
    hourly[hourKey].count += 1;
  }

  const result: HourlySnowfall[] = [];
  for (const [key, data] of Object.entries(hourly)) {
    const [year, month, day, hour] = key.split('-').map(Number);
    const timestamp = new Date(year, month, day, hour).getTime();
    const avgTemp = data.temp / data.count;
    const { snowfallIn, rainfallIn } = estimateSnowfall(data.rain + data.snow, avgTemp, data.rain, data.snow);

    result.push({
      timestamp,
      snowfallIn,
      rainfallIn,
      lat: stationLat,
      lon: stationLon,
      stationId
    });
  }

  return result.sort((a, b) => a.timestamp - b.timestamp);
}

// Fetch historical data for a single station
async function fetchStationHistorical(station: {id: string, lat: number, lon: number}): Promise<StationData> {
  try {
    const observations = await fetchHistoricalObservations(station.id, station.lat, station.lon);
    const hourlyData = processHourlySnowfall(observations, station.lat, station.lon, station.id);

    return {
      stationId: station.id,
      lat: station.lat,
      lon: station.lon,
      hourlyData
    };
  } catch (error) {
    console.warn(`Failed to fetch data for station ${station.id}:`, error);
    return {
      stationId: station.id,
      lat: station.lat,
      lon: station.lon,
      hourlyData: []
    };
  }
}

// Get comprehensive historical data for a resort area (using OpenWeatherMap directly at resort locations)
export async function getResortAreaHistorical(resortId: string): Promise<ResortAreaData> {
  const resort = resorts.find(r => r.id === resortId);
  if (!resort) {
    throw new Error(`Resort ${resortId} not found`);
  }

  // Use the resort location directly as a "station"
  const stationData = await fetchStationHistorical({
    id: `${resortId}-resort`,
    lat: resort.lat,
    lon: resort.lon
  });

  return {
    resortId,
    stations: stationData.hourlyData.length > 0 ? [stationData] : []
  };
}

// Get accumulated snowfall at a specific location and time
export function getAccumulatedSnowfallAtLocation(
  stationData: StationData[],
  lat: number,
  lon: number,
  upToTimestamp: number
): number {
  // Find the closest station with data
  let closestStation: StationData | null = null;
  let minDistance = Infinity;

  for (const station of stationData) {
    const distance = haversineDistance(lat, lon, station.lat, station.lon);
    if (distance < minDistance && station.hourlyData.length > 0) {
      minDistance = distance;
      closestStation = station;
    }
  }

  if (!closestStation) return 0;

  return closestStation.hourlyData
    .filter(h => h.timestamp <= upToTimestamp)
    .reduce((sum, h) => sum + h.snowfallIn, 0);
}

// Get accumulated rainfall at a specific location and time
export function getAccumulatedRainfallAtLocation(
  stationData: StationData[],
  lat: number,
  lon: number,
  upToTimestamp: number
): number {
  // Find the closest station with data
  let closestStation: StationData | null = null;
  let minDistance = Infinity;

  for (const station of stationData) {
    const distance = haversineDistance(lat, lon, station.lat, station.lon);
    if (distance < minDistance && station.hourlyData.length > 0) {
      minDistance = distance;
      closestStation = station;
    }
  }

  if (!closestStation) return 0;

  return closestStation.hourlyData
    .filter(h => h.timestamp <= upToTimestamp)
    .reduce((sum, h) => sum + h.rainfallIn, 0);
}

// Get all resort area historical data plus additional weather stations across Northeast
export async function getAllResortAreaHistorical(): Promise<ResortAreaData[]> {
  // Check if we have valid cached data
  const now = Date.now();
  if (cachedResortData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log(`[Historical] Using cached resort data (${Math.round((now - cacheTimestamp) / 1000)}s old)`);
    return cachedResortData;
  }

  console.log('[Historical] Fetching fresh resort area historical data...');
  const resortPromises = resorts.map(resort => getResortAreaHistorical(resort.id));
  const resortData = await Promise.all(resortPromises);
  
  // Add additional weather stations across the Northeast for better radar coverage
  const northeastStations = await getNortheastWeatherStations();
  resortData.push(...northeastStations);
  
  // Cache the results
  cachedResortData = resortData;
  cacheTimestamp = now;
  
  console.log(`[Historical] Cached ${resortData.length} resort areas with weather data`);
  return resortData;
}

// Generate additional weather stations across the Northeast region
async function getNortheastWeatherStations(): Promise<ResortAreaData[]> {
  // Define a grid of weather stations across the Northeast
  // Coverage: roughly Maine to Pennsylvania, west to Ohio
  // Reduced from 27 to 9 stations to avoid rate limiting
  const stations = [
    // Maine
    { lat: 43.6615, lon: -70.2553, name: 'Portland, ME' },
    
    // New Hampshire
    { lat: 43.2081, lon: -71.5376, name: 'Concord, NH' },
    
    // Vermont
    { lat: 44.2601, lon: -72.5754, name: 'Montpelier, VT' },
    
    // Massachusetts
    { lat: 42.3601, lon: -71.0589, name: 'Boston, MA' },
    
    // Connecticut
    { lat: 41.7658, lon: -72.6734, name: 'Hartford, CT' },
    
    // New York
    { lat: 40.7128, lon: -74.0060, name: 'New York, NY' },
    { lat: 42.6526, lon: -73.7562, name: 'Albany, NY' },
    
    // Pennsylvania
    { lat: 39.9526, lon: -75.1652, name: 'Philadelphia, PA' },
    
    // Additional grid point for coverage
    { lat: 43.0, lon: -74.0, name: 'Adirondacks' },
  ];
  
  const stationPromises = stations.map(async (station, index) => {
    try {
      // Add delay between API calls to avoid rate limiting (1 second between calls)
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const stationData = await fetchStationHistorical({
        id: `northeast-${index}`,
        lat: station.lat,
        lon: station.lon
      });
      
      return {
        resortId: `northeast-${station.name.replace(/[^a-zA-Z0-9]/g, '')}`,
        stations: stationData.hourlyData.length > 0 ? [stationData] : []
      };
    } catch (error) {
      console.warn(`Failed to create station for ${station.name}:`, error);
      return null;
    }
  });
  
  const stationData = await Promise.all(stationPromises);
  return stationData.filter((data): data is ResortAreaData => data !== null);
}