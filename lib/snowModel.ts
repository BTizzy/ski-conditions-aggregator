import { NWSObservation } from './nws';
import { ObservationLike } from './types';

/**
 * Lightweight snowfall/conditions model.
 * - Designed to run deterministically on NWS observations (and optional historical/aux inputs)
 * - Returns estimated recentSnowfall (last 24h), snowDepth (approx), baseTemp (F), windSpeed (mph), visibility (text), and a powder score 0-100.
 *
 * This is intentionally simple and easy to test against historical data. Improve as needed.
 */

function cToF(c: number | null | undefined): number | null {
  if (c === null || c === undefined) return null;
  return c * 9 / 5 + 32;
}

function kphToMph(kph: number | null | undefined): number | null {
  if (kph === null || kph === undefined) return null;
  return kph * 0.621371;
}

export interface SnowPrediction {
  recentSnowfall: number; // inches (last 24h)
  snowDepth: number; // inches (estimate) - current depth on the ground
  weeklySnowfall?: number; // inches accumulated over last 7 days
  // weeklySnowIn: estimated snowfall in inches (converted from liquid via ratio)
  weeklySnowIn?: number;
  // weeklyRainIn: estimated liquid inches that fell as rain over last 7 days
  weeklyRainIn?: number;
  expectedOnGround?: number; // estimated inches on-ground after melt/compaction
  baseTemp: number | null; // Fahrenheit
  windSpeed: number | null; // mph
  visibility: string;
  powderScore: number; // 0-100
  factors: string[];
}

  // Improved deterministic snow model that consumes NWS observation payloads.
  // The model prefers numeric precipitation fields and probabilityOfPrecipitation when available
  // to avoid gross overestimation (Stowe case). Returns a consistent SnowPrediction object.
  export function predictFromNWS(nws: NWSObservation | null, extra?: ObservationLike): SnowPrediction {
    const result: any = {
      recentSnowfall: 0, // inches over recent window (e.g., last 24h)
      snowDepth: 0, // current depth estimate (inches)
      baseTemp: NaN, // Fahrenheit
      windSpeed: 0, // mph
      visibility: 'Unknown',
      powderScore: 50,
      factors: [] as string[],
    };

    if (!nws) return result;

    // Temperature handling: some NWS payloads have temperature in Fahrenheit (forecast periods)
    // while others use Celsius. Prefer raw.unit info when available.
    let tempC: number | null = null;
    if (typeof nws.temperature === 'number') {
      const unit = nws?.raw?.temperatureUnit || nws?.raw?.temperature?.unitCode || null;
      if (unit && String(unit).toUpperCase().startsWith('F')) {
        // temperature provided as Fahrenheit
        tempC = (nws.temperature - 32) * 5 / 9;
      } else {
        // assume provided in Celsius
        tempC = nws.temperature;
      }
    } else if (nws?.raw?.temperature?.value != null) {
      tempC = nws.raw.temperature.value;
    }
    if (tempC != null && !Number.isNaN(tempC)) result.baseTemp = +(tempC * 9 / 5 + 32).toFixed(1);

    // Wind speed: if nws.windSpeed is a number, the existing project tends to store mph already.
    if (typeof nws.windSpeed === 'number') {
      result.windSpeed = nws.windSpeed;
    } else if (nws?.raw?.windSpeed?.value != null) {
      // assume raw.windSpeed.value is m/s -> convert to mph
      const windMs = nws.raw.windSpeed.value;
      if (!Number.isNaN(windMs)) result.windSpeed = +(windMs * 2.23694).toFixed(2);
    }

    result.visibility = nws?.textDescription ?? result.visibility;

    // Use reported precipitation fields when available.
    // Many NWS observation payloads include 'precipitationLastHour' or in properties with unitCode/value.
    let precipIn = null as null | number; // inches in last window
    // try a few known fields (value might be mm or in depending on the source) — prefer explicit inches
    if (nws?.raw?.precipitationLastHour?.value != null) {
      const mm = nws.raw.precipitationLastHour.value;
      if (!Number.isNaN(mm)) precipIn = +(mm / 25.4);
    }
    // check raw precipitation container
    if (precipIn == null && nws?.raw?.precipitation?.value != null) {
      const v = nws.raw.precipitation.value;
      const unit = nws.raw.precipitation?.unitCode || '';
      if (typeof v === 'number') {
        if (unit.toLowerCase().includes('mm')) precipIn = +(v / 25.4);
        else precipIn = +v;
      }
    }

    // probabilityOfPrecipitation is often provided as a percent (0-100) inside raw fields
  const pop = (nws?.raw?.probabilityOfPrecipitation?.value ?? nws?.raw?.probabilityOfPrecipitation) ?? null;

    // Parse the text description for keywords (snow vs rain) as a tie-breaker
    const desc = (nws?.textDescription || '').toLowerCase();
    const mentionsSnow = desc.includes('snow') || desc.includes('flurr');
    const mentionsSleet = desc.includes('sleet') || desc.includes('mixed');

    // Determine a snowfall fraction: if temps are cold (< 34F) and mention snow, assume precip -> snow
    let snowFraction = 0.0;
    if (precipIn != null) {
      // If we have a measured precipitation amount, use temperature to estimate what portion was snow
      if (!Number.isNaN(result.baseTemp)) {
        if (result.baseTemp <= 28) snowFraction = 1.0;
        else if (result.baseTemp <= 32) snowFraction = 0.9;
        else if (result.baseTemp <= 36) snowFraction = 0.6;
        else snowFraction = 0.05; // mostly rain
      } else {
        // no temp, rely on text
        snowFraction = mentionsSnow ? 0.9 : (mentionsSleet ? 0.6 : 0.2);
      }
    } else {
      // no measured precip — fall back to probability and text
      const p = (typeof pop === 'number' && !Number.isNaN(pop)) ? pop / 100 : 0;
      if (p > 0) {
        // if we only have a probability, set expected precip to a conservative value based on probability
        // assume up to 0.5 inches liquid at very high probabilities (p~1) for short windows
        const expectedLiquid = Math.min(0.5, 0.5 * p);
        if (!Number.isNaN(result.baseTemp)) {
          if (result.baseTemp <= 28) snowFraction = 1.0;
          else if (result.baseTemp <= 32) snowFraction = 0.95;
          else if (result.baseTemp <= 36) snowFraction = 0.6;
          else snowFraction = 0.1;
        } else {
          snowFraction = mentionsSnow ? 0.9 : (mentionsSleet ? 0.6 : 0.2);
        }
        precipIn = expectedLiquid; // inches of liquid
      } else {
        snowFraction = mentionsSnow ? 0.8 : 0.0;
      }
    }

    // Convert liquid precipitation to snow inches using rough ratio depending on temp
    let liquidToSnowRatio = 10; // default 10:1
    if (!Number.isNaN(result.baseTemp)) {
      const tempCFromF = (result.baseTemp - 32) * 5 / 9;
      if (tempCFromF <= -10) liquidToSnowRatio = 18;
      else if (tempCFromF <= -2) liquidToSnowRatio = 14;
      else if (tempCFromF <= 0) liquidToSnowRatio = 12;
      else if (tempCFromF <= 3) liquidToSnowRatio = 10;
      else liquidToSnowRatio = 8; // wetter snow
    }

    // expected snow inches from measured precip
    let expectedSnowIn = 0;
    if (precipIn != null) {
      expectedSnowIn = precipIn * liquidToSnowRatio * snowFraction;
      // dampen for small liquid amounts
      if (precipIn > 0 && precipIn < 0.5) expectedSnowIn *= 0.6;
    } else {
      expectedSnowIn = (precipIn || 0) * liquidToSnowRatio * snowFraction;
    }

    // final smoothing: be conservative — round to nearest 0.5 inch
    const recent = Math.max(0, Math.round(expectedSnowIn * 2) / 2);
    result.recentSnowfall = recent;

    // snowDepth: if observation provides a depth field, prefer it. Try common fields: snowDepth, snowDepthLast24Hours
    const obsDepth = (nws?.raw?.snowDepth?.value ?? nws?.raw?.snowDepth ?? nws?.raw?.snowFallLast24Hours?.value) ?? null;
    if (obsDepth != null && !Number.isNaN(obsDepth)) {
      // If unit is mm convert, otherwise assume inches
      if (typeof obsDepth === 'number') {
        // heuristic: if value > 30, assume mm; convert mm -> inches
        if (obsDepth > 30) result.snowDepth = +(obsDepth / 25.4).toFixed(1);
        else result.snowDepth = +obsDepth.toFixed(1);
      }
    } else {
      // guess: previous depth plus recent snowfall (conservative)
      // if extra?.previousDepth provided use it
      const prev = (extra && typeof extra.previousDepth === 'number') ? extra.previousDepth : 0;
      result.snowDepth = +(Math.max(prev, prev + result.recentSnowfall)).toFixed(1);
    }

    // powderScore: prefer conservative base; high score for fresh, cold, low wind
    let score = 50;
    score += Math.round((result.recentSnowfall - 2) * 4); // reward recent >2"
    if (!Number.isNaN(result.baseTemp) && result.baseTemp <= 20) score += 10;
    if (result.windSpeed > 25) score -= 20;
    if (result.recentSnowfall >= 8) score += 8;
    result.powderScore = Math.min(100, Math.max(0, score));

    // factors
    if (result.recentSnowfall >= 6) result.factors.push('recent-heavy');
    else if (result.recentSnowfall >= 2) result.factors.push('recent-light');
    if (!Number.isNaN(result.baseTemp) && result.baseTemp >= 36) result.factors.push('warm');
    if (result.windSpeed > 25) result.factors.push('windy');

    // compute weekly snowfall estimate
  let weekly = 0;
  let weeklySnowIn = 0; // snow inches (converted) aggregated
  let weeklyRainIn = 0; // liquid rain inches aggregated
    // Prefer detailed weeklyObservations if available (array of precip+temp samples)
    if (extra && Array.isArray(extra.weeklyObservations) && extra.weeklyObservations.length > 0) {
      let sumSnow = 0;
      for (const o of extra.weeklyObservations) {
        const pMm = (o && typeof o.precipMm === 'number') ? o.precipMm : 0;
        const tC = (o && typeof o.tempC === 'number') ? o.tempC : (extra.avgTemp7d ?? null);
        const precipIn = pMm / 25.4;
        // simple temp-based snow fraction per observation
        let sf = 0.0;
        if (tC != null) {
          if (tC <= -10) sf = 1.0;
          else if (tC <= 0) sf = 0.95;
          else if (tC <= 3) sf = 0.9;
          else sf = 0.1;
        } else {
          sf = mentionsSnow ? 0.8 : 0.2;
        }
        // choose ratio by temp
        let ratioLocal = liquidToSnowRatio;
        if (tC != null) {
          if (tC <= -10) ratioLocal = 18;
          else if (tC <= -2) ratioLocal = 14;
          else if (tC <= 0) ratioLocal = 12;
          else if (tC <= 3) ratioLocal = 10;
          else ratioLocal = 8;
        }
        let snowIn = precipIn * ratioLocal * sf;
        if (precipIn > 0 && precipIn < 0.5) snowIn *= 0.6;
        sumSnow += snowIn;
        // rain liquid inches that fell (liquid portion not snow)
        const rainLiquid = precipIn * (1 - sf);
        weeklyRainIn += rainLiquid;
        weeklySnowIn += snowIn;
      }
      weekly = Math.round(sumSnow * 2) / 2;
    } else if (extra && typeof extra.weeklyPrecipMm === 'number' && extra.weeklyPrecipMm !== null) {
      const inches = extra.weeklyPrecipMm / 25.4;
      // approximate splitting of weekly total into snow vs rain using avgTemp7d and snowFraction
      const avgSf = (!Number.isNaN(result.baseTemp) ? (result.baseTemp <= 32 ? 0.9 : 0.1) : (snowFraction || 0.5));
      weeklySnowIn = Math.round((inches * liquidToSnowRatio * avgSf) * 2) / 2;
      weeklyRainIn = Math.round((inches * (1 - avgSf)) * 100) / 100;
      weekly = weeklySnowIn;
    } else if (extra && typeof extra.previousWeekSnowfall === 'number' && extra.previousWeekSnowfall !== null) {
      weekly = extra.previousWeekSnowfall;
    } else {
      // fallback: scale recent event conservatively (avoid recent*3 naive approach)
      // assume additional smaller events across week: recent + 0.5 * recent * 2
      weekly = Math.round((result.recentSnowfall + Math.max(0, result.recentSnowfall * 1.0)) * 2) / 2;
    }
    // Adjust weekly estimate for station distance (reduce confidence if station is far)
    const stationDist = (extra && typeof extra.stationDistanceKm === 'number') ? extra.stationDistanceKm : null;
    if (stationDist != null && stationDist > 50) {
      // Reduce estimate progressively for stations further away. Start conservatively at 50km.
      // 50-150km -> reduce up to 30%, >=150km reduce up to 40%.
      let reduction = 0.1;
      if (stationDist >= 150) reduction = 0.4;
      else reduction = 0.1 + Math.min(0.3, ((stationDist - 50) / 100) * 0.3);
      weekly = Math.max(0, weekly * (1 - reduction));
      result.factors.push('station-distance');
    }
  result.weeklySnowfall = Math.max(0, Math.round(weekly * 2) / 2);
  // attach computed weekly snow/rain totals (in inches)
  result.weeklySnowIn = Math.max(0, Math.round((weeklySnowIn) * 2) / 2);
  result.weeklyRainIn = Math.max(0, Math.round((weeklyRainIn) * 100) / 100);

    // If the caller provided a resort-reported weekly total (on-mountain report), blend
    // the model's weekly estimate with that report. This biases the estimate toward
    // resort-reported values when available while retaining model signals.
    // Default weight favors resort report moderately (resortWeight = 0.7) but this
    // can be tuned externally by callers if desired.
    if (extra && typeof extra.resortReportedWeekly === 'number' && extra.resortReportedWeekly !== null) {
      const resortVal = Math.max(0, extra.resortReportedWeekly);
      const modelVal = typeof result.weeklySnowfall === 'number' ? result.weeklySnowfall : 0;
      // Allow caller to override the resort weight; default to 0.7 for moderate trust.
      let resortWeight = 0.7;
      if (typeof (extra as any).resortWeight === 'number' && (extra as any).resortWeight >= 0 && (extra as any).resortWeight <= 1) {
        resortWeight = (extra as any).resortWeight;
      }
      const blended = Math.round(((resortVal * resortWeight) + (modelVal * (1 - resortWeight))) * 2) / 2;
      result.factors.push('resort-reported');
      result.factors.push(`resort-weight:${resortWeight}`);
      result.weeklySnowfall = blended;
    }

    // Estimate expected on-ground depth after melt/compaction using environmental factors
    // Start from reported/estimated snowDepth
    const baseDepth = result.snowDepth || 0;
    let retention = 1.0;
    // temp effect (use avgTemp7d if available)
    const avgTempC = (extra && typeof extra.avgTemp7d === 'number') ? extra.avgTemp7d : null;
    if (avgTempC != null) {
      if (avgTempC > 0) retention *= 0.6; // above freezing average -> significant melt
      else if (avgTempC > -2) retention *= 0.85; // near-freezing
      else retention *= 1.0; // cold preserves
    }
    // wind effect
    const avgWindKph = (extra && typeof extra.avgWind7d === 'number') ? extra.avgWind7d : null;
    if (avgWindKph != null) {
      const avgWindMph = avgWindKph * 0.621371;
      if (avgWindMph > 40) retention *= 0.7;
      else if (avgWindMph > 25) retention *= 0.85;
    }
    // sun exposure
    const avgSun = (extra && typeof extra.avgSunHours7d === 'number') ? extra.avgSunHours7d : null;
    if (avgSun != null) {
      if (avgSun > 4) retention *= 0.85;
      else if (avgSun > 2) retention *= 0.95;
    }
    // elevation effect (higher => better retention)
    const elev = (extra && typeof extra.elevationFt === 'number') ? extra.elevationFt : null;
    if (elev != null) {
      const boost = 1 + Math.max(0, Math.min(0.3, (elev - 1000) / 10000));
      retention *= boost;
    }
    // age/compaction: if no fresh snow recently, compact
    if (result.recentSnowfall <= 1) retention *= 0.95;

    result.expectedOnGround = Math.round(Math.max(0, baseDepth * retention) * 10) / 10;

    return result;
  }

export default {
  predictFromNWS,
};
