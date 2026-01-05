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

    // Parse the text description for keywords (snow vs rain) as a tie-breaker
    const desc = (nws?.textDescription || '').toLowerCase();
    const mentionsSnow = desc.includes('snow') || desc.includes('flurr');
    const mentionsSleet = desc.includes('sleet') || desc.includes('mixed');

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

    // Extract additional weather parameters for enhanced modeling
    let humidity = null as number | null;
    let dewpointC = null as number | null;
    let barometricPressure = null as number | null;
    let seaLevelPressure = null as number | null;
    let windDirection = null as number | null;
    let windChill = null as number | null;
    let cloudLayers = null as any[] | null;

    // Extract from NWS raw data
    if (nws?.raw) {
      humidity = nws.raw.relativeHumidity?.value ?? nws.raw.humidity ?? null;
      dewpointC = nws.raw.dewpoint?.value ?? null;
      barometricPressure = nws.raw.barometricPressure?.value ?? null;
      seaLevelPressure = nws.raw.seaLevelPressure?.value ?? null;
      windDirection = nws.raw.windDirection?.value ?? nws.windDirection ?? null;
      windChill = nws.raw.windChill?.value ?? null;
      cloudLayers = nws.raw.cloudLayers ?? null;
    }

    // Extract from extra data (OpenWeatherMap, etc.)
    if (extra) {
      if (extra.humidity != null && humidity == null) humidity = extra.humidity;
      if (extra.dewpoint != null && dewpointC == null) dewpointC = extra.dewpoint;
      if (extra.pressure != null && barometricPressure == null) barometricPressure = extra.pressure;
      if (extra.windDirection != null && windDirection == null) windDirection = extra.windDirection;
      if (extra.windChill != null && windChill == null) windChill = extra.windChill;
      if (extra.clouds != null && cloudLayers == null) cloudLayers = extra.clouds;
    }
    // Many NWS observation payloads include 'precipitationLastHour' or in properties with unitCode/value.
    let precipIn = null as null | number; // inches in last window

    // PRIORITY: Use real 24-hour historical precipitation data if available (from Open-Meteo)
    if (extra?.recent24hPrecipMm != null && extra.recent24hPrecipMm > 0) {
      precipIn = extra.recent24hPrecipMm / 25.4; // Convert mm to inches
      console.log(`[SnowModel] Using real 24h historical precipitation: ${extra.recent24hPrecipMm.toFixed(2)}mm (${precipIn.toFixed(2)}in)`);
    } else {
      // Fallback to NWS forecast-based precipitation data
      // try a few known fields (value might be mm or in depending on the source) — prefer explicit inches
      if (nws?.raw?.precipitationLastHour?.value != null) {
        const mm = nws.raw.precipitationLastHour.value;
        if (!Number.isNaN(mm)) precipIn = +(mm / 25.4);
      }
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

    // Enhanced precipitation type determination using dewpoint depression method
    // This is more accurate than simple temperature thresholds
    let snowFraction = 0.0;
    let precipitationType = 'unknown';

    if (precipIn != null) {
      // Use dewpoint depression (difference between temperature and dewpoint) for better accuracy
      if (tempC != null && dewpointC != null) {
        const dewpointDepression = tempC - dewpointC; // in Celsius

        // Enhanced precipitation type logic based on dewpoint depression
        if (dewpointDepression <= 0) {
          // Dewpoint >= temperature: supercooled conditions, likely all snow
          snowFraction = 1.0;
          precipitationType = 'snow';
        } else if (dewpointDepression <= 2) {
          // Very small depression: sleet or wet snow
          snowFraction = 0.9;
          precipitationType = 'sleet';
        } else if (dewpointDepression <= 5) {
          // Moderate depression: snow likely
          snowFraction = 0.8;
          precipitationType = 'snow';
        } else if (dewpointDepression <= 8) {
          // Larger depression: mixed precipitation
          snowFraction = 0.5;
          precipitationType = 'mixed';
        } else {
          // Large depression: rain likely
          snowFraction = 0.1;
          precipitationType = 'rain';
        }

        // Adjust based on humidity for additional confidence
        if (humidity != null) {
          if (humidity > 90 && snowFraction < 0.8) {
            snowFraction = Math.min(0.8, snowFraction + 0.2); // High humidity favors snow
            precipitationType = snowFraction > 0.5 ? 'snow' : 'mixed';
          } else if (humidity < 50 && snowFraction > 0.3) {
            snowFraction = Math.max(0.2, snowFraction - 0.2); // Low humidity favors rain
            precipitationType = snowFraction < 0.3 ? 'rain' : 'mixed';
          }
        }

        console.log(`[SnowModel] Dewpoint depression: ${dewpointDepression.toFixed(1)}°C, humidity: ${humidity}%, type: ${precipitationType}, snow fraction: ${snowFraction}`);
      } else {
        // Fallback to temperature-based logic if dewpoint not available
        if (!Number.isNaN(result.baseTemp)) {
          if (result.baseTemp <= 28) {
            snowFraction = 1.0;
            precipitationType = 'snow';
          } else if (result.baseTemp <= 32) {
            snowFraction = 0.9;
            precipitationType = 'sleet';
          } else if (result.baseTemp <= 36) {
            snowFraction = 0.6;
            precipitationType = 'mixed';
          } else {
            snowFraction = 0.05;
            precipitationType = 'rain';
          }
        } else {
          // Use text description as final fallback
          snowFraction = mentionsSnow ? 0.9 : (mentionsSleet ? 0.6 : 0.2);
          precipitationType = mentionsSnow ? 'snow' : (mentionsSleet ? 'sleet' : 'rain');
        }
      }
    } else {
      // No measured precipitation - use probability and text
      const p = (typeof pop === 'number' && !Number.isNaN(pop)) ? pop / 100 : 0;
      if (p > 0) {
        // Estimate expected liquid precipitation
        const expectedLiquid = Math.min(0.5, 0.5 * p);

        // Use same dewpoint-based logic for type determination
        if (tempC != null && dewpointC != null) {
          const dewpointDepression = tempC - dewpointC;
          if (dewpointDepression <= 2) {
            snowFraction = 1.0;
            precipitationType = 'snow';
          } else if (dewpointDepression <= 5) {
            snowFraction = 0.8;
            precipitationType = 'snow';
          } else if (dewpointDepression <= 8) {
            snowFraction = 0.4;
            precipitationType = 'mixed';
          } else {
            snowFraction = 0.1;
            precipitationType = 'rain';
          }
        } else {
          // Temperature-based fallback
          if (!Number.isNaN(result.baseTemp)) {
            if (result.baseTemp <= 28) {
              snowFraction = 1.0;
              precipitationType = 'snow';
            } else if (result.baseTemp <= 32) {
              snowFraction = 0.95;
              precipitationType = 'sleet';
            } else if (result.baseTemp <= 36) {
              snowFraction = 0.6;
              precipitationType = 'mixed';
            } else {
              snowFraction = 0.1;
              precipitationType = 'rain';
            }
          } else {
            snowFraction = mentionsSnow ? 0.9 : (mentionsSleet ? 0.6 : 0.2);
            precipitationType = mentionsSnow ? 'snow' : (mentionsSleet ? 'sleet' : 'rain');
          }
        }

        precipIn = expectedLiquid; // Set for downstream calculations
      } else {
        snowFraction = mentionsSnow ? 0.8 : 0.0;
        precipitationType = mentionsSnow ? 'snow' : 'rain';
      }
    }

    // Enhanced liquid-to-snow ratio using humidity-dependent ratios
    // Dry snow (low humidity): 15-20:1 ratio
    // Wet snow (high humidity): 8-10:1 ratio
    let liquidToSnowRatio = 10; // default 10:1

    if (humidity != null) {
      // Humidity-dependent ratios for more accurate snow accumulation
      if (humidity <= 30) {
        // Very dry air - light, fluffy snow
        liquidToSnowRatio = 18;
      } else if (humidity <= 50) {
        // Dry air - typical powder snow
        liquidToSnowRatio = 15;
      } else if (humidity <= 70) {
        // Moderate humidity - denser snow
        liquidToSnowRatio = 12;
      } else if (humidity <= 85) {
        // High humidity - heavier snow
        liquidToSnowRatio = 10;
      } else {
        // Very high humidity - wet, heavy snow
        liquidToSnowRatio = 8;
      }

      console.log(`[SnowModel] Humidity: ${humidity}%, liquid-to-snow ratio: ${liquidToSnowRatio}:1`);
    } else {
      // Fallback to temperature-based ratios if humidity not available
      if (!Number.isNaN(result.baseTemp)) {
        const tempCFromF = (result.baseTemp - 32) * 5 / 9;
        if (tempCFromF <= -10) liquidToSnowRatio = 18;
        else if (tempCFromF <= -2) liquidToSnowRatio = 14;
        else if (tempCFromF <= 0) liquidToSnowRatio = 12;
        else if (tempCFromF <= 3) liquidToSnowRatio = 10;
        else liquidToSnowRatio = 8; // wetter snow
      }
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

    // Enhanced pressure trend analysis for storm intensification detection
    let pressureTrendBoost = 1.0; // multiplier for weekly estimate
    const pressureTrend = extra?.pressureTrend || null;

    if (pressureTrend) {
      // Use explicit pressure trend from external data
      if (pressureTrend === 'falling') {
        pressureTrendBoost = 1.3; // Boost weekly estimate by 30%
        result.factors.push('pressure-falling');
        console.log(`[SnowModel] External pressure trend: falling, boosting weekly estimate by 30%`);
      } else if (pressureTrend === 'rising') {
        pressureTrendBoost = 0.8; // Reduce weekly estimate by 20%
        result.factors.push('pressure-rising');
        console.log(`[SnowModel] External pressure trend: rising, reducing weekly estimate by 20%`);
      }
    } else if (barometricPressure != null && seaLevelPressure != null) {
      // Calculate pressure change over time if we have multiple readings
      // For now, use current vs reference pressure (could be enhanced with historical data)
      const pressureDiff = seaLevelPressure - barometricPressure; // hPa difference

      if (pressureDiff < -2) {
        // Falling pressure - approaching storm system
        pressureTrendBoost = 1.3; // Boost weekly estimate by 30%
        result.factors.push('pressure-falling');
        console.log(`[SnowModel] Falling pressure detected (${pressureDiff.toFixed(1)} hPa), boosting weekly estimate by 30%`);
      } else if (pressureDiff > 2) {
        // Rising pressure - clearing weather
        pressureTrendBoost = 0.8; // Reduce weekly estimate by 20%
        result.factors.push('pressure-rising');
        console.log(`[SnowModel] Rising pressure detected (${pressureDiff.toFixed(1)} hPa), reducing weekly estimate by 20%`);
      }
    }

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
    // Apply pressure trend boost for storm intensification
    weekly = weekly * pressureTrendBoost;

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

    // Enhanced melt calculation using wind chill instead of temperature
    // Wind chill formula: T_wc = 35.74 + 0.6215*T - 35.75*(V^0.16) + 0.4275*T*(V^0.16)
    // where T is temperature in °F, V is wind speed in mph
    let effectiveTempF = result.baseTemp; // default to measured temperature

    if (result.baseTemp != null && result.windSpeed != null && !Number.isNaN(result.baseTemp) && !Number.isNaN(result.windSpeed)) {
      // Calculate wind chill if temperature <= 50°F and wind speed > 3 mph
      if (result.baseTemp <= 50 && result.windSpeed > 3) {
        const windChill = 35.74 + (0.6215 * result.baseTemp) - (35.75 * Math.pow(result.windSpeed, 0.16)) + (0.4275 * result.baseTemp * Math.pow(result.windSpeed, 0.16));
        effectiveTempF = Math.min(result.baseTemp, windChill); // Use the colder effective temperature
        console.log(`[SnowModel] Wind chill calculated: ${windChill.toFixed(1)}°F (actual: ${result.baseTemp}°F, wind: ${result.windSpeed} mph)`);
      }
    }

    // Use wind chill for melt calculations instead of raw temperature
    const effectiveTempC = effectiveTempF != null ? (effectiveTempF - 32) * 5 / 9 : null;
    if (effectiveTempC != null) {
      if (effectiveTempC > 0) retention *= 0.6; // above freezing effective temp -> significant melt
      else if (effectiveTempC > -2) retention *= 0.85; // near-freezing
      else retention *= 1.0; // cold preserves
      result.factors.push('wind-chill-melt');
    } else {
      // Fallback to avgTemp7d if available
      const avgTempC = (extra && typeof extra.avgTemp7d === 'number') ? extra.avgTemp7d : null;
      if (avgTempC != null) {
        if (avgTempC > 0) retention *= 0.6; // above freezing average -> significant melt
        else if (avgTempC > -2) retention *= 0.85; // near-freezing
        else retention *= 1.0; // cold preserves
      }
    }
    // wind effect
    const avgWindKph = (extra && typeof extra.avgWind7d === 'number') ? extra.avgWind7d : null;
    if (avgWindKph != null) {
      const avgWindMph = avgWindKph * 0.621371;
      if (avgWindMph > 40) retention *= 0.7;
      else if (avgWindMph > 25) retention *= 0.85;
    }
    // Enhanced sun/cloud exposure using cloud coverage data
    // Cloud coverage reduces solar radiation and melt potential
    let cloudEffect = 1.0; // default no cloud effect

    if (cloudLayers != null) {
      // cloudLayers is an array of cloud layer objects with coverage percentage
      let totalCoverage = 0;
      let layerCount = 0;

      if (Array.isArray(cloudLayers)) {
        for (const layer of cloudLayers) {
          if (layer.coverage != null) {
            totalCoverage += layer.coverage;
            layerCount++;
          }
        }
        if (layerCount > 0) {
          const avgCoverage = totalCoverage / layerCount;
          // Higher cloud coverage reduces melt (less solar radiation)
          if (avgCoverage >= 80) cloudEffect = 0.7; // Heavy overcast - significant melt reduction
          else if (avgCoverage >= 60) cloudEffect = 0.8; // Moderate overcast
          else if (avgCoverage >= 40) cloudEffect = 0.9; // Partly cloudy
          else if (avgCoverage >= 20) cloudEffect = 0.95; // Mostly clear
          else cloudEffect = 1.0; // Clear skies - full solar radiation

          result.factors.push('cloud-coverage');
          console.log(`[SnowModel] Cloud coverage: ${avgCoverage.toFixed(0)}%, melt reduction factor: ${cloudEffect}`);
        }
      }
    }

    // Apply cloud effect to retention
    retention *= cloudEffect;

    // Fallback to sun hours if cloud data not available
    const avgSun = (extra && typeof extra.avgSunHours7d === 'number') ? extra.avgSunHours7d : null;
    if (avgSun != null && cloudEffect === 1.0) { // Only use sun hours if no cloud data
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
