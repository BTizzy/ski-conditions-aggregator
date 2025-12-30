#!/usr/bin/env node
/*
  Cache station observations and run a small parameter sweep to recommend model tweaks.
  - For a list of resorts (default: loon-mountain, stowe, smugglers-notch, killington)
  - Fetch nearest station and observations (cached under scripts/cache/stations/{stationId}.json)
  - Compute station-derived weekly snowfall
  - Call local API /api/scrape?resortId=... to get current model output
  - Sweep parameters: liquidToSnowRatio base multiplier (0.8-1.2), small-precip dampening (0.4-1.0), stationDistanceStart (30-80km)
  - Compute MAE against stationWeeklySnow where available
  - Emit recommended parameter set and detailed report into scripts/output/
*/

const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const resorts = [
  'loon-mountain',
  'stowe',
  'smugglers-notch',
  'killington'
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function roundHalf(x) { return Math.round(x * 2) / 2; }

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; const toRad = v => v * Math.PI / 180; const dLat = toRad(lat2-lat1); const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
  const coords = first.geometry && first.geometry.coordinates; const [lonS, latS] = coords || [null, null];
  const distanceKm = (latS != null) ? haversineKm(lat, lon, latS, lonS) : null;
  return { stationId, stationLat: latS, stationLon: lonS, distanceKm };
}

async function fetchStationObservations(stationId, startISO, endISO) {
  const url = `https://api.weather.gov/stations/${stationId}/observations?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&limit=500`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator' } });
  if (!res.ok) {
    console.warn('failed station obs', stationId, res.status);
    return [];
  }
  const data = await res.json();
  return data.features || [];
}

function computeStationWeeklySnow(observations, opts) {
  // opts: { ratioMultiplier, smallDampen }
  const { ratioMultiplier=1.0, smallDampen=0.6 } = opts || {};
  let sumSnowIn = 0;
  for (const f of observations) {
    const p = f.properties || f;
    const pMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value : (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : 0);
    const tempC = (p.temperature && typeof p.temperature.value === 'number') ? p.temperature.value : (typeof p.temperature === 'number' ? p.temperature : null);
    const precipIn = pMm / 25.4;
    // snow fraction
    let sf = 0.8;
    if (tempC != null) {
      if (tempC <= -10) sf = 1.0;
      else if (tempC <= 0) sf = 0.95;
      else if (tempC <= 3) sf = 0.9;
      else sf = 0.1;
    }
    // ratio
    let ratio = 10;
    if (tempC != null) {
      if (tempC <= -10) ratio = 18;
      else if (tempC <= -2) ratio = 14;
      else if (tempC <= 0) ratio = 12;
      else if (tempC <= 3) ratio = 10;
      else ratio = 8;
    }
    ratio *= ratioMultiplier;
    let snowIn = precipIn * ratio * sf;
    if (precipIn > 0 && precipIn < 0.5) snowIn *= smallDampen;
    sumSnowIn += snowIn;
  }
  return roundHalf(sumSnowIn);
}

async function main() {
  // Minimal embedded resort metadata (avoid requiring TS modules from CJS)
  const resortsMeta = [
    { id: 'loon-mountain', name: 'Loon Mountain', lat: 44.0367, lon: -71.6217, elevationFt: 2800 },
    { id: 'stowe', name: 'Stowe', lat: 44.4654, lon: -72.6874, elevationFt: 3300 },
    { id: 'smugglers-notch', name: "Smugglers' Notch", lat: 44.5884, lon: -72.7815, elevationFt: 3000 },
    { id: 'killington', name: 'Killington', lat: 43.6045, lon: -72.8201, elevationFt: 4000 },
  ];
  const chosen = resortsMeta.filter(r => resorts.includes(r.id));
  const out = [];
  const now = new Date();
  const start = new Date(now.getTime() - 7*24*3600*1000);
  const startISO = start.toISOString(); const endISO = now.toISOString();

  const cacheDir = path.join(__dirname, 'cache','stations'); if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  for (const r of chosen) {
    console.log('Processing', r.id);
    let apiResp = null;
    try { const a = await fetch(`http://localhost:3000/api/scrape?resortId=${encodeURIComponent(r.id)}`); apiResp = await a.json(); } catch (e) { console.warn('api fetch failed', e.message); }

    // Try to find any cached OnTheSnow HTML for this resort and parse a resortReportedWeekly value.
    let resortReportedWeekly = null;
    try {
      const ontdir = path.join(__dirname, 'cache', 'onthesnow');
      if (fs.existsSync(ontdir)) {
        const files = fs.readdirSync(ontdir).filter(f => f.toLowerCase().includes(r.id.replace(/[^a-z0-9]/gi, '-')) || f.toLowerCase().includes(r.name.toLowerCase().replace(/[^a-z0-9]/gi, '-'))).map(f => path.join(ontdir, f));
        if (files.length > 0) {
          // pick the newest file
          files.sort((a,b)=> fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
          const text = fs.readFileSync(files[0], 'utf8');
          // attempt to parse weekly total using a few heuristic regexes
          const patterns = [
            /(?:last|past)\s*7\s*days?.{0,80}?([0-9]+(?:\.[0-9]+)?)\s*(?:inches|inch|in|\")/i,
            /7[- ]?day[s]?[^0-9]{0,40}?([0-9]+(?:\.[0-9]+)?)\s*(?:inches|inch|in|\")/i,
            /([0-9]+(?:\.[0-9]+)?)\s*(?:inches|inch|in|\")\s*(?:in\s*the\s*last\s*7\s*days)/i,
            /weekly\s*total[^0-9]{0,40}?([0-9]+(?:\.[0-9]+)?)\s*(?:inches|inch|in|\")/i,
          ];
          for (const p of patterns) {
            const m = text.match(p);
            if (m && m[1]) { resortReportedWeekly = parseFloat(m[1]); break; }
          }
        }
      }
    } catch(e) { /* ignore parse failures */ }

    let stationInfo = null;
    try { stationInfo = await fetchNearestStation(r.lat, r.lon); } catch (e) { console.warn('nearest station failed', e.message); stationInfo = { stationId:null }; }

    let observations = [];
    if (stationInfo && stationInfo.stationId) {
      const cacheFile = path.join(cacheDir, `${stationInfo.stationId}_${startISO}_${endISO}.json`.replace(/[:]/g,'-'));
      if (fs.existsSync(cacheFile)) {
        observations = JSON.parse(fs.readFileSync(cacheFile,'utf8'));
      } else {
        await sleep(400);
        observations = await fetchStationObservations(stationInfo.stationId, startISO, endISO);
        await sleep(400);
        fs.writeFileSync(cacheFile, JSON.stringify(observations, null, 2));
      }
    }

    const stationWeekly = observations.length>0 ? computeStationWeeklySnow(observations, {}) : null;
    // Re-call the local API with resortReportedWeekly attached so model will blend when available
    try {
      let apiUrl = `http://localhost:3000/api/scrape?resortId=${encodeURIComponent(r.id)}`;
      if (resortReportedWeekly != null) apiUrl += `&resortReportedWeekly=${encodeURIComponent(resortReportedWeekly)}`;
      apiResp = await fetch(apiUrl).then(a=>a.json()).catch(()=>apiResp);
    } catch(e) { /* ignore */ }

    out.push({ resortId: r.id, name: r.name, stationId: stationInfo.stationId, stationDistanceKm: stationInfo.distanceKm, obsCount: observations.length, stationWeekly, resortReportedWeekly, modelWeekly: (apiResp && apiResp.weeklySnowfall) || (apiResp && apiResp.rawData && apiResp.rawData.model && apiResp.rawData.model.weeklySnowfall) || null, apiRaw: apiResp });
  }

  // parameter sweep
  const ratios = [0.9, 1.0, 1.1];
  const smallDampens = [0.5, 0.6, 0.8];
  const resortWeights = [0.0, 0.5, 0.7, 0.9];
  const results = [];
  for (const rMult of ratios) {
    for (const sd of smallDampens) {
      for (const rw of resortWeights) {
        let errs = [];
        for (const row of out) {
          if (row.stationWeekly == null) continue;
          const files = fs.readdirSync(cacheDir).filter(f => f.startsWith(row.stationId+'_'));
          let obs = [];
          if (files.length>0) {
            obs = JSON.parse(fs.readFileSync(path.join(cacheDir, files[0]), 'utf8'));
          }
          const recomputed = computeStationWeeklySnow(obs, { ratioMultiplier: rMult, smallDampen: sd });
          // compare recomputed to model value (if model exists). If resortReportedWeekly is present
          // prefer comparing to blended model using rw (we can simulate by calling the local API with resortWeight)
          // For now compare recomputed vs modelWeekly (which may have been called with resortReportedWeekly earlier)
          if (row.modelWeekly != null) errs.push(Math.abs(recomputed - row.modelWeekly));
        }
        const mae = errs.length>0 ? (errs.reduce((a,b)=>a+b,0)/errs.length) : null;
        results.push({ rMult, sd, rw, mae });
      }
    }
  }

  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const outDir = path.join(__dirname, 'output'); if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const reportFile = path.join(outDir, `tune_report_${ts}.json`);
  fs.writeFileSync(reportFile, JSON.stringify({ sample: out, sweep: results }, null, 2));
  console.log('Wrote', reportFile);
  console.log('Sweep results (sorted by mae):');
  const sorted = results.filter(r=>r.mae!=null).sort((a,b)=>a.mae-b.mae);
  console.log(sorted.slice(0,5));
}

main().catch(err => { console.error(err); process.exit(1); });
