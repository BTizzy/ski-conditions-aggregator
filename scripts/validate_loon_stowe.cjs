#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = v => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const resorts = [
  { id: 'loon-mountain', name: 'Loon Mountain', lat: 44.0367, lon: -71.6217, elevationFt: 2800 },
  { id: 'stowe', name: 'Stowe', lat: 44.4654, lon: -72.6874, elevationFt: 3300 },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function roundHalf(x) { return Math.round(x * 2) / 2; }

function tempCtoRatio(tC) {
  if (tC === null || tC === undefined || Number.isNaN(tC)) return 10;
  if (tC <= -10) return 18;
  if (tC <= -2) return 14;
  if (tC <= 0) return 12;
  if (tC <= 3) return 10;
  return 8;
}

function snowFractionFromTempC(tC, baseTempF) {
  // mimic the model's logic
  if (tC === null || tC === undefined || Number.isNaN(tC)) return 0.8;
  if (tC <= -10) return 1.0;
  if (tC <= 0) return 0.95;
  if (tC <= 3) return 0.9;
  return 0.1;
}

async function fetchNearestStation(lat, lon) {
  const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
  const pRes = await fetch(pointUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!pRes.ok) throw new Error('points lookup failed ' + pRes.status);
  const pData = await pRes.json();
  const stationsUrl = pData.properties && pData.properties.observationStations;
  if (!stationsUrl) return { stationId: null, stationLat: null, stationLon: null, distanceKm: null };
  const sRes = await fetch(stationsUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!sRes.ok) throw new Error('stations list failed ' + sRes.status);
  const sData = await sRes.json();
  const first = (sData.features && sData.features[0]) || (sData && sData[0]);
  if (!first) return { stationId: null, stationLat: null, stationLon: null, distanceKm: null };
  const stationId = first.properties && first.properties.stationIdentifier;
  const coords = first.geometry && first.geometry.coordinates;
  const [lonS, latS] = coords || [null, null];
  const distanceKm = (latS != null) ? haversineKm(lat, lon, latS, lonS) : null;
  return { stationId, stationLat: latS, stationLon: lonS, distanceKm };
}

async function fetchStationObservations(stationId, startISO, endISO) {
  // NWS limits: use limit=500 to avoid 400 Bad Request
  const url = `https://api.weather.gov/stations/${stationId}/observations?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&limit=500`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!res.ok) {
    console.warn('failed station obs', stationId, res.status);
    return [];
  }
  const data = await res.json();
  return data.features || [];
}

async function computeStationWeeklySnow(observations) {
  // observations: array of features with properties containing precipitationLastHour.value (mm) and temperature.value (C)
  let sumSnowIn = 0;
  for (const f of observations) {
    const p = f.properties || f;
    const pMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value : (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : 0);
    const tempC = (p.temperature && typeof p.temperature.value === 'number') ? p.temperature.value : (typeof p.temperature === 'number' ? p.temperature : null);
    const precipIn = pMm / 25.4;
    const sf = snowFractionFromTempC(tempC);
    const ratio = tempC != null ? tempCtoRatio(tempC) : 10;
    let snowIn = precipIn * ratio * sf;
    if (precipIn > 0 && precipIn < 0.5) snowIn *= 0.6;
    sumSnowIn += snowIn;
  }
  return roundHalf(sumSnowIn);
}

async function run() {
  const out = [];
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const startISO = start.toISOString();
  const endISO = now.toISOString();

  for (const r of resorts) {
    console.log('\nProcessing', r.id);
    // call local API
    const apiUrl = `http://localhost:3000/api/scrape?resortId=${encodeURIComponent(r.id)}`;
    let apiResp = null;
    try {
      const a = await fetch(apiUrl);
      apiResp = await a.json();
    } catch (e) {
      console.warn('local API fetch failed', e.message);
    }

    // find nearest station and fetch observations
    let stationInfo = null;
    try {
      stationInfo = await fetchNearestStation(r.lat, r.lon);
    } catch (e) {
      console.warn('nearest station failed', e.message);
      stationInfo = { stationId: null, distanceKm: null };
    }

    let obs = [];
    if (stationInfo && stationInfo.stationId) {
      await sleep(500);
      obs = await fetchStationObservations(stationInfo.stationId, startISO, endISO);
      // rate-limit
      await sleep(500);
    }

    const stationWeeklySnow = obs.length > 0 ? await computeStationWeeklySnow(obs) : null;

    const modelWeekly = (apiResp && apiResp.weeklySnowfall != null) ? apiResp.weeklySnowfall : (apiResp && apiResp.rawData && apiResp.rawData.model && apiResp.rawData.model.weeklySnowfall) || null;
    const modelRecent = (apiResp && apiResp.recentSnowfall != null) ? apiResp.recentSnowfall : (apiResp && apiResp.rawData && apiResp.rawData.model && apiResp.rawData.model.recentSnowfall) || null;

    const row = {
      resortId: r.id,
      name: r.name,
      stationId: stationInfo.stationId,
      stationDistanceKm: stationInfo.distanceKm,
      stationWeeklySnow: stationWeeklySnow,
      modelWeeklySnow: modelWeekly,
      modelRecent: modelRecent,
      obsCount: obs.length,
      apiRaw: apiResp,
    };

    out.push(row);

    // polite delay
    await sleep(400);
  }

  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFile = path.join(outDir, `snow_validation_${ts}.json`);
  const csvFile = path.join(outDir, `snow_validation_${ts}.csv`);
  fs.writeFileSync(jsonFile, JSON.stringify(out, null, 2));
  // write CSV header
  const csvRows = ['resortId,name,stationId,stationDistanceKm,stationWeeklySnow,modelWeeklySnow,modelRecent,obsCount'];
  for (const r of out) {
    csvRows.push([r.resortId, r.name, r.stationId || '', r.stationDistanceKm ?? '', r.stationWeeklySnow ?? '', r.modelWeeklySnow ?? '', r.modelRecent ?? '', r.obsCount].join(','));
  }
  fs.writeFileSync(csvFile, csvRows.join('\n'));

  console.log('\nWrote', jsonFile, csvFile);
  console.log('Summary:');
  for (const r of out) {
    const err = (r.stationWeeklySnow != null && r.modelWeeklySnow != null) ? Math.abs(r.stationWeeklySnow - r.modelWeeklySnow) : null;
    console.log(`- ${r.name}: stationWeekly=${r.stationWeeklySnow}, modelWeekly=${r.modelWeeklySnow}, absError=${err}, obsCount=${r.obsCount}, stationDistKm=${r.stationDistanceKm}`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
