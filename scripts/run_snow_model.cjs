#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function cToF(c) {
  if (c === null || c === undefined) return null;
  return +(c * 9 / 5 + 32).toFixed(1);
}

function predict(sample) {
  // sample: { nws: { temperature, windSpeed, textDescription, raw }, extra: { tempC, precipMm } }
  const nws = sample.nws || {};
  const extra = sample.extra || {};

  let tempC = (typeof nws.temperature === 'number') ? nws.temperature : (extra.tempC ?? null);
  let precipMm = extra.precipMm ?? null;
  // prefer explicit precip from raw if available
  if (!precipMm && nws.raw && nws.raw.precipitationLastHour && typeof nws.raw.precipitationLastHour.value === 'number') {
    precipMm = nws.raw.precipitationLastHour.value;
  }

  const mentionsSnow = (nws.textDescription || '').toLowerCase().includes('snow') || (nws.textDescription || '').toLowerCase().includes('flurr');

  let snowFraction = 0;
  if (precipMm != null) {
    if (tempC != null) {
      if (tempC <= -10) snowFraction = 1.0;
      else if (tempC <= 0) snowFraction = 0.95;
      else if (tempC <= 3) snowFraction = 0.9;
      else snowFraction = 0.1;
    } else {
      snowFraction = mentionsSnow ? 0.9 : 0.2;
    }
  } else {
    snowFraction = mentionsSnow ? 0.8 : 0.0;
  }

  // liquid inches
  const precipIn = precipMm != null ? (precipMm / 25.4) : 0;
  let ratio = 10;
  if (tempC != null) {
    if (tempC <= -10) ratio = 18;
    else if (tempC <= -2) ratio = 14;
    else if (tempC <= 0) ratio = 12;
    else if (tempC <= 3) ratio = 10;
    else ratio = 8;
  }

  let expectedSnow = precipIn * ratio * snowFraction;
  // Be conservative for small liquid amounts
  if (precipIn > 0 && precipIn < 0.5) expectedSnow *= 0.6;
  expectedSnow = Math.round(expectedSnow * 2) / 2;

  // fallback if no precip but text suggests
  const recent = expectedSnow || (mentionsSnow ? 0.5 : 0);

  const baseDepth = extra.previousDepth ?? 6;
  const snowDepth = Math.round((baseDepth + recent) * 10) / 10;

  // weekly snowfall: prefer provided weeklyPrecipMm, otherwise scale recent
  let weekly = 0;
  if (extra.weeklyPrecipMm != null) {
    const inches = extra.weeklyPrecipMm / 25.4;
    weekly = Math.round((inches * ratio * (snowFraction || 1)) * 2) / 2;
  } else if (extra.previousWeekSnowfall != null) {
    weekly = extra.previousWeekSnowfall;
  } else {
    weekly = Math.round((recent * 3) * 2) / 2;
  }

  return {
    id: sample.id || sample.name || 'sample',
    recentSnowfall: recent,
    weeklySnowfall: weekly,
    snowDepth,
    baseTempF: cToF(tempC),
    expectedOnGround: Math.round((snowDepth * ( (extra.avgTemp7d != null && extra.avgTemp7d > 0) ? 0.6 : 1.0 )) * 10) / 10,
    notes: { precipMm, mentionsSnow }
  };
}

const file = path.join(__dirname, 'test', 'historical_sample.json');
if (!fs.existsSync(file)) {
  console.error('No sample data at', file);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
const samples = JSON.parse(raw);

for (const s of samples) {
  const out = predict(s);
  console.log(JSON.stringify(out, null, 2));
}

// exit
process.exit(0);
