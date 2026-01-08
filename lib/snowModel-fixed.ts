/**
 * FIXED: Snow Model with Elevation Lapse Rate
 * Key fix: Temperature adjusted for elevation (-3.5°F per 1000ft)
 */

const TEMP_LAPSE_RATE = -3.5; // °F per 1000 feet elevation gain
const STANDARD_ELEVATION = 1000; // Reference elevation in feet

export function adjustTempForElevation(baseTemp: number, elevationFt: number): number {
  if (!isFinite(baseTemp) || !isFinite(elevationFt)) return baseTemp;

  const elevationDiff = elevationFt - STANDARD_ELEVATION;
  const elevationKft = elevationDiff / 1000;
  const adjustment = elevationKft * TEMP_LAPSE_RATE;

  return baseTemp + adjustment;
}

export function predictFromNWS(nws: any, extra?: any) {
  const elevationFt = extra?.elevationFt ?? 1000;
  const baseTemp = nws?.temperature ?? 32;

  // CRITICAL FIX: Adjust temperature for elevation
  const adjustedTemp = adjustTempForElevation(baseTemp, elevationFt);

  const SNOW_RAIN_THRESHOLD = 34; // °F
  const isSnow = adjustedTemp < SNOW_RAIN_THRESHOLD;

  let snowRatio = 10;
  if (adjustedTemp < 28) {
    snowRatio = 12;
  } else if (adjustedTemp < 34) {
    snowRatio = 8;
  }

  const liquidPrecip = nws?.precipitation ?? 0;
  const snowDepth = isSnow ? liquidPrecip * snowRatio : 0;

  const windSpeed = nws?.windSpeed ?? 0;
  let powderScore = 50;

  if (isSnow && liquidPrecip > 0.1) {
    powderScore += Math.min(40, liquidPrecip * 40);
  }

  if (adjustedTemp > -20 && adjustedTemp < 10) {
    powderScore += 20;
  } else if (adjustedTemp > 10 && adjustedTemp < 34) {
    powderScore += 10;
  }

  const windScore = Math.max(0, 20 - (windSpeed / 2));
  powderScore += windScore;

  const visibility = nws?.visibility ?? 10;
  if (visibility > 5) {
    powderScore += 20;
  } else if (visibility > 1) {
    powderScore += 10;
  }

  powderScore = Math.max(0, Math.min(100, powderScore));

  return {
    snowDepth: Math.round(snowDepth * 10) / 10,
    recentSnowfall: snowDepth,
    weeklySnowfall: 0,
    baseTemp: Math.round(adjustedTemp),
    windSpeed,
    visibility: visibility > 5 ? 'Excellent' : visibility > 1 ? 'Good' : 'Poor',
    powderScore,
  };
}

export default { predictFromNWS, adjustTempForElevation };
