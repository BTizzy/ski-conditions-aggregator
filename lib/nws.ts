
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

// Find nearest observation station and return its id and distance (km)
export async function getNearestNWSStation(lat: number, lon: number): Promise<{stationId: string|null, distanceKm: number|null}> {
  try {
    const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const pRes = await fetch(pointUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
    if (!pRes.ok) return { stationId: null, distanceKm: null };
    const pData = await pRes.json();
    const stationsUrl = pData.properties.observationStations;
    if (!stationsUrl) return { stationId: null, distanceKm: null };
    const sRes = await fetch(stationsUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
    if (!sRes.ok) return { stationId: null, distanceKm: null };
    const sData = await sRes.json();
    const stations = sData.features || sData;
    if (!stations || stations.length === 0) return { stationId: null, distanceKm: null };
    // pick first station and compute distance if coordinates available
    const first = stations[0];
    const coords = (first && first.geometry && first.geometry.coordinates) ? first.geometry.coordinates : null;
    if (!coords) return { stationId: first.properties?.stationIdentifier ?? null, distanceKm: null };
    const [stLon, stLat] = coords;
    const distanceKm = haversineKm(lat, lon, stLat, stLon);
    return { stationId: first.properties?.stationIdentifier ?? null, distanceKm };
  } catch (e) {
    return { stationId: null, distanceKm: null };
  }
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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
