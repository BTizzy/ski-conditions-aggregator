import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { resorts } from '../../../lib/resorts';
import { Conditions } from '../../../lib/types';
import { getNWSObservation, NWSObservation } from '../../../lib/nws';
import { getHistoricalObservations } from '../../../lib/nws';
import snowModel from '../../../lib/snowModel';

// Resort-specific scraping removed. All logic now uses NWS-based predictive model.
async function scrapeResortConditions(url: string, resortId?: string): Promise<any> {
  // No-op: always return zeros/nulls for legacy fields
  return { snowDepth: 0, recentSnowfall: 0, trailOpen: 0, trailTotal: 0, groomed: 0, baseTemp: null, windSpeed: null, visibility: null, rawHtml: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resortId = searchParams.get('resortId');

  if (!resortId) {
    return NextResponse.json({ error: 'resortId required' }, { status: 400 });
  }

  const resort = resorts.find(r => r.id === resortId);
  if (!resort) {
    return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
  }

  try {
    console.log(`[API] Starting conditions fetch for ${resort.name} (${resortId})`);

    // Fetch NWS weather for observation and let the local model predict snowfall/conditions
    let nws: NWSObservation | null = null;
    try {
      console.log(`[API] Fetching NWS data for lat=${resort.lat}, lon=${resort.lon}`);
      nws = await getNWSObservation(resort.lat, resort.lon);
      console.log(`[API] NWS data received:`, nws);
    } catch (e) {
      console.error(`[API] NWS fetch failed:`, e);
      nws = null;
    }

    // Predict using our snow model (deterministic heuristics + optional extra inputs)
    // Attempt to fetch historical observations for the resort (last 7 days) to improve weekly totals
    let extra: any = {};
    // Allow callers to pass resort-reported weekly totals and a resort weight to bias the model.
    try {
      const urlObj = new URL(request.url);
      const rp = urlObj.searchParams.get('resortReportedWeekly');
      const rw = urlObj.searchParams.get('resortWeight');
      if (rp != null) {
        const parsed = parseFloat(rp as string);
        if (!Number.isNaN(parsed)) extra.resortReportedWeekly = parsed;
      }
      if (rw != null) {
        const parsed = parseFloat(rw as string);
        if (!Number.isNaN(parsed)) extra.resortWeight = parsed;
      }
    } catch (e) {
      // ignore
    }
    try {
      console.log(`[API] Fetching historical observations`);
      const hist = await getHistoricalObservations(resort.lat, resort.lon, 7);
      console.log(`[API] Historical observations received:`, hist?.observations?.length || 0, 'observations');
      if (hist && Array.isArray(hist.observations) && hist.observations.length > 0) {
        const weeklyObs: any[] = [];
        let weeklyPrecipMm = 0;
        for (const f of hist.observations) {
          const p = f.properties || f;
          const precipMm = (p.precipitationLastHour && typeof p.precipitationLastHour.value === 'number') ? p.precipitationLastHour.value : (p.precipitation && typeof p.precipitation.value === 'number' ? p.precipitation.value : null);
          const tempC = (p.temperature && typeof p.temperature.value === 'number') ? p.temperature.value : (typeof p.temperature === 'number' ? p.temperature : null);
          const windKph = (p.windSpeed && typeof p.windSpeed.value === 'number') ? (p.windSpeed.value * 3.6) : null; // m/s -> kph
          weeklyObs.push({ precipMm: precipMm, tempC: tempC, windKph, timestamp: p.timestamp || p.validTime || null });
          if (typeof precipMm === 'number') weeklyPrecipMm += precipMm;
        }
        extra.weeklyObservations = weeklyObs;
        extra.weeklyPrecipMm = weeklyPrecipMm;
        extra.avgTemp7d = weeklyObs.reduce((s, o) => s + (o.tempC ?? 0), 0) / Math.max(1, weeklyObs.length);
        extra.avgWind7d = weeklyObs.reduce((s, o) => s + (o.windKph ?? 0), 0) / Math.max(1, weeklyObs.length);
        extra.elevationFt = resort.elevationFt ?? null;
        extra.stationDistanceKm = hist.stationDistanceKm;
      }
    } catch (e) {
      console.error(`[API] Historical observations failed:`, e);
      // keep any previously collected extra fields (e.g., resortReportedWeekly/resortWeight)
      // but if historical fetch failed we simply proceed with what we have.
    }

    console.log(`[API] Calling predictFromNWS with nws=`, nws !== null, 'extra keys=', Object.keys(extra));
    const pred = snowModel.predictFromNWS(nws, extra);
    console.log(`[API] Prediction result:`, pred);

    // Trail data is not available from our sources, so set to 0
    const trailOpen = 0;
    const trailTotal = 0;
    const groomed = 0;

    const conditions: Conditions = {
      resortId,
      timestamp: new Date(),
      snowDepth: pred.snowDepth,
      recentSnowfall: pred.recentSnowfall,
      weeklySnowfall: pred.weeklySnowfall ?? 0,
      expectedOnGround: pred.expectedOnGround ?? pred.snowDepth,
      baseTemp: pred.baseTemp ?? 0,
      windSpeed: pred.windSpeed ?? 0,
      visibility: pred.visibility,
      trailStatus: { open: trailOpen, total: trailTotal, groomed },
      rawData: { nws, model: pred },
    };

    console.log(`[API] Returning conditions for ${resort.name}:`, conditions);
    // TODO: Store in Supabase

    return NextResponse.json(conditions);
  } catch (error) {
    // If error is from scraping, return a clear error message
    const errorMsg = (error as Error)?.message || 'Unknown error';
    const errorStack = (error as Error)?.stack || '';
    console.error(`[API] Fatal error for ${resortId}:`, errorMsg, errorStack);
    return NextResponse.json(
      { error: errorMsg, type: 'scrape-failed', stack: errorStack },
      { status: 502 }
    );
  }
}