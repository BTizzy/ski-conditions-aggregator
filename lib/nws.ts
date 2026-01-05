
export interface NWSObservation {
  temperature: number | null; // Celsius
  windSpeed: number | null; // km/h
  windDirection: number | null; // degrees
  textDescription: string;
  icon: string;
  timestamp: string;
  raw: any;
}

// Get NWS gridpoint for a given lat/lon
export async function getNWSGridpoint(lat: number, lon: number): Promise<{office: string, gridX: number, gridY: number}> {
  const url = `https://api.weather.gov/points/${lat},${lon}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!res.ok) throw new Error('Failed to get NWS gridpoint');
  const data = await res.json();
  return {
    office: data.properties.gridId,
    gridX: data.properties.gridX,
    gridY: data.properties.gridY,
  };
}

// Get current observation for a gridpoint
export async function getNWSObservation(lat: number, lon: number): Promise<NWSObservation> {
  const grid = await getNWSGridpoint(lat, lon);
  const url = `https://api.weather.gov/gridpoints/${grid.office}/${grid.gridX},${grid.gridY}/forecast`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!res.ok) throw new Error('Failed to get NWS forecast');
  const data = await res.json();
  const period = data.properties.periods[0];
  return {
    temperature: period.temperature,
    windSpeed: period.windSpeed ? parseInt(period.windSpeed) : null,
    windDirection: period.windDirection || null,
    textDescription: period.shortForecast,
    icon: period.icon,
    timestamp: period.startTime,
    raw: period,
  };
}

// Find nearest observation stations and return array of stations with distances (km)
export async function getNearestNWSStations(lat: number, lon: number, limit: number = 5): Promise<Array<{stationId: string, distanceKm: number}>> {
  try {
    const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const pRes = await fetch(pointUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
    if (!pRes.ok) return [];
    const pData = await pRes.json();
    const stationsUrl = pData.properties.observationStations;
    if (!stationsUrl) return [];
    const sRes = await fetch(stationsUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
    if (!sRes.ok) return [];
    const sData = await sRes.json();
    const stations = sData.features || sData;
    if (!stations || stations.length === 0) return [];

    // Calculate distance for each station and filter/sort
    const stationsWithDistance = stations
      .map((station: any) => {
        const coords = (station && station.geometry && station.geometry.coordinates) ? station.geometry.coordinates : null;
        if (!coords) return null;
        const [stLon, stLat] = coords;
        const distanceKm = haversineKm(lat, lon, stLat, stLon);
        return {
          stationId: station.properties?.stationIdentifier ?? null,
          distanceKm
        };
      })
      .filter((station: any) => station && station.stationId && station.distanceKm <= 150) // Max 150km range
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm) // Sort by distance
      .slice(0, limit); // Take top N

    return stationsWithDistance;
  } catch (e) {
    return [];
  }
}

// Find nearest observation station and return its id and distance (km) - LEGACY FUNCTION
export async function getNearestNWSStation(lat: number, lon: number): Promise<{stationId: string|null, distanceKm: number|null}> {
  const stations = await getNearestNWSStations(lat, lon, 1);
  if (stations.length === 0) return { stationId: null, distanceKm: null };
  return { stationId: stations[0].stationId, distanceKm: stations[0].distanceKm };
}

// Fetch hourly observations for a station between start and end ISO times. Returns array of observation objects.
export async function fetchStationObservations(stationId: string, startISO: string, endISO: string): Promise<any[]> {
  try {
    // NWS API enforces a maximum "limit" (500). Use 500 to avoid 400 Bad Request responses.
    const url = `https://api.weather.gov/stations/${stationId}/observations?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&limit=500`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.features || [];
  } catch (e) {
    return [];
  }
}

// Convenience: get historical observations near lat/lon for the last `days` days.
export async function getHistoricalObservations(lat: number, lon: number, days = 7): Promise<{observations: Array<any>, stationId: string|null, stationDistanceKm: number|null}> {
  try {
    const { stationId, distanceKm } = await getNearestNWSStation(lat, lon);
    if (!stationId) return { observations: [], stationId: null, stationDistanceKm: null };
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 3600 * 1000);
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    const obs = await fetchStationObservations(stationId, startISO, endISO);
    return { observations: obs, stationId, stationDistanceKm: distanceKm };
  } catch (e) {
    return { observations: [], stationId: null, stationDistanceKm: null };
  }
}

// Fetch observations from multiple nearby stations and return distance-weighted average
export async function getMultiStationObservations(lat: number, lon: number, days: number = 7): Promise<{
  stations: Array<{stationId: string, distance: number, observations: any[], precipTotal: number}>,
  weightedAverage: { observations: any[], precipTotal: number, avgTempC: number, avgWindKph: number }
}> {
  try {
    const nearbyStations = await getNearestNWSStations(lat, lon, 5);
    if (nearbyStations.length === 0) {
      return { stations: [], weightedAverage: { observations: [], precipTotal: 0, avgTempC: 0, avgWindKph: 0 } };
    }

    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 3600 * 1000);
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    console.log(`[Multi-Station] Fetching data from ${nearbyStations.length} stations within ${Math.max(...nearbyStations.map(s => s.distanceKm)).toFixed(1)}km`);

    // Fetch historical observations from each station in parallel
    const stationData = await Promise.all(
      nearbyStations.map(async (station) => {
        try {
          const observations = await fetchStationObservations(station.stationId, startISO, endISO);
          const precipTotal = calculatePrecipTotal(observations);
          return {
            stationId: station.stationId,
            distance: station.distanceKm,
            observations,
            precipTotal
          };
        } catch (error) {
          console.warn(`[Multi-Station] Failed to fetch from ${station.stationId}:`, error);
          return {
            stationId: station.stationId,
            distance: station.distanceKm,
            observations: [],
            precipTotal: 0
          };
        }
      })
    );

    // Calculate distance-weighted average
    const weightedAverage = calculateWeightedAverage(stationData, lat, lon);

    console.log(`[Multi-Station] Weighted average: ${weightedAverage.precipTotal.toFixed(2)}mm precip from ${stationData.length} stations`);

    return { stations: stationData, weightedAverage };
  } catch (error) {
    console.error('[Multi-Station] Error:', error);
    return { stations: [], weightedAverage: { observations: [], precipTotal: 0, avgTempC: 0, avgWindKph: 0 } };
  }
}

// Calculate total precipitation from observations
function calculatePrecipTotal(observations: any[]): number {
  let total = 0;
  for (const obs of observations) {
    const p = obs.properties || obs;
    const precipMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value :
                    (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : 0);
    if (typeof precipMm === 'number' && precipMm > 0) {
      total += precipMm;
    }
  }
  return total;
}

// Calculate inverse distance weighted average of observations
function calculateWeightedAverage(
  stationData: Array<{stationId: string, distance: number, observations: any[], precipTotal: number}>,
  targetLat: number,
  targetLon: number
): { observations: any[], precipTotal: number, avgTempC: number, avgWindKph: number } {
  // Filter out stations with no data
  const validStations = stationData.filter(s => s.observations.length > 0);

  if (validStations.length === 0) {
    return { observations: [], precipTotal: 0, avgTempC: 0, avgWindKph: 0 };
  }

  // Calculate weights using inverse distance squared (closer stations get exponentially more weight)
  const weights = validStations.map(station => {
    const distance = Math.max(station.distance, 0.1); // Avoid division by zero
    return 1 / (distance * distance);
  });

  // Normalize weights to sum to 1.0
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  // Create a map of timestamps to weighted observations
  const timestampMap = new Map<string, { precip: number[], temp: number[], wind: number[], weight: number }>();

  validStations.forEach((station, index) => {
    const weight = normalizedWeights[index];

    station.observations.forEach(obs => {
      const p = obs.properties || obs;
      const timestamp = p.timestamp || p.validTime || obs.timestamp;
      if (!timestamp) return;

      if (!timestampMap.has(timestamp)) {
        timestampMap.set(timestamp, { precip: [], temp: [], wind: [], weight: 0 });
      }

      const entry = timestampMap.get(timestamp)!;

      // Extract values
      const precipMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value :
                      (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : 0);
      const tempC = (p.temperature && typeof p.temperature.value === 'number') ? p.temperature.value :
                   (typeof p.temperature === 'number' ? p.temperature : null);
      const windMps = (p.windSpeed && typeof p.windSpeed.value === 'number') ? p.windSpeed.value : null;
      const windKph = windMps ? windMps * 3.6 : null; // m/s to km/h

      if (typeof precipMm === 'number') entry.precip.push(precipMm * weight);
      if (typeof tempC === 'number') entry.temp.push(tempC * weight);
      if (typeof windKph === 'number') entry.wind.push(windKph * weight);

      entry.weight += weight;
    });
  });

  // Calculate weighted averages for each timestamp
  const weightedObservations: any[] = [];
  let totalPrecip = 0;
  let totalTemp = 0;
  let totalWind = 0;
  let tempCount = 0;
  let windCount = 0;

  timestampMap.forEach((values, timestamp) => {
    const avgPrecip = values.precip.length > 0 ? values.precip.reduce((sum, val) => sum + val, 0) : 0;
    const avgTemp = values.temp.length > 0 ? values.temp.reduce((sum, val) => sum + val, 0) / values.weight : null;
    const avgWind = values.wind.length > 0 ? values.wind.reduce((sum, val) => sum + val, 0) / values.weight : null;

    weightedObservations.push({
      timestamp,
      precipMm: avgPrecip,
      tempC: avgTemp,
      windKph: avgWind
    });

    totalPrecip += avgPrecip;
    if (avgTemp !== null) {
      totalTemp += avgTemp;
      tempCount++;
    }
    if (avgWind !== null) {
      totalWind += avgWind;
      windCount++;
    }
  });

  // Sort observations by timestamp
  weightedObservations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    observations: weightedObservations,
    precipTotal: totalPrecip,
    avgTempC: tempCount > 0 ? totalTemp / tempCount : 0,
    avgWindKph: windCount > 0 ? totalWind / windCount : 0
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
