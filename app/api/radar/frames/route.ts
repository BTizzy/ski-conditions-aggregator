import { NextResponse } from 'next/server';

// NOAA MRMS (Multi-Radar Multi-Sensor System) - best source for precipitation data
// Public, free, reliable radar data updated every 2 minutes
const MRMS_BASE = 'https://mrms.ncep.noaa.gov/data/2D';

// Available MRMS 2D products for precipitation:
// PrecipRate - Current precipitation rate (dBZ-calibrated)
// ReflectivityQC - Quality-controlled base reflectivity
// GaugeOnlyQPE - Gauge-only quantitative precipitation estimate

interface FrameMetadata {
  time: number; // Unix timestamp in ms
  source: string;
  available: boolean;
}

// Fetch available MRMS frames from a directory listing
// MRMS stores files as YYYYmmdd_HHmmss timestamps
async function fetchMRMSFrames(): Promise<FrameMetadata[]> {
  try {
    // NOAA provides GRIB2 files and we can infer available times
    // Use mesonet.agron.iastate.edu's JSON API for cleaner frame access
    const resp = await fetch(
      'https://mesonet.agron.iastate.edu/json/radar/mrms_qpe.json',
      { headers: { 'User-Agent': 'ski-conditions-aggregator' } }
    );
    
    if (!resp.ok) return [];
    
    const json = await resp.json();
    const timestamps = (json?.timestamps || []) as string[];
    
    // Convert ISO timestamps to Unix ms and validate
    return timestamps
      .map((ts: string) => {
        const date = new Date(ts);
        const time = date.getTime();
        return isNaN(time) ? null : { time, source: 'MRMS_QPE', available: true };
      })
      .filter((f): f is FrameMetadata => f !== null)
      .sort((a, b) => b.time - a.time); // newest first
  } catch (e) {
    console.error('[MRMS] fetch failed:', e);
    return [];
  }
}

// Alternative: RainViewer API (higher quality, international coverage)
// Free tier with API key provides 72-hour lookback
async function fetchRainViewerFrames(): Promise<FrameMetadata[]> {
  try {
    // RainViewer public API - no key needed for basic access
    // Returns last 72 hours of precipitation data
    const resp = await fetch(
      'https://api.rainviewer.com/public/weather-maps-api/v1/coverage?key=free',
      { headers: { 'User-Agent': 'ski-conditions-aggregator' } }
    );
    
    if (!resp.ok) return [];
    
    const json = await resp.json();
    
    // RainViewer response format:
    // { radar: { nowcast: [...], past: [...], forecast: [...] } }
    const past = (json?.radar?.past || []) as Array<{ time?: number | string }>;
    
    return past
      .map((frame: any) => {
        const timeVal = frame?.time || frame;
        // RainViewer returns epoch seconds, convert to ms
        const time = typeof timeVal === 'string'
          ? new Date(timeVal).getTime()
          : typeof timeVal === 'number' && timeVal < 10000000000
            ? timeVal * 1000 // assume seconds
            : timeVal; // assume already ms
        
        return isNaN(time) ? null : { time, source: 'RainViewer', available: true };
      })
      .filter((f): f is FrameMetadata => f !== null)
      .sort((a, b) => b.time - a.time);
  } catch (e) {
    console.error('[RainViewer] fetch failed:', e);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch from multiple sources in parallel for redundancy
    const [mrmsFrames, rainViewerFrames] = await Promise.all([
      fetchMRMSFrames(),
      fetchRainViewerFrames(),
    ]);
    
    // Merge all frames, deduplicate by time (within 60s)
    const allFrames = [...mrmsFrames, ...rainViewerFrames];
    const grouped = new Map<number, FrameMetadata[]>();
    
    for (const frame of allFrames) {
      // Round to nearest minute to group similar times
      const bucket = Math.floor(frame.time / 60000) * 60000;
      if (!grouped.has(bucket)) grouped.set(bucket, []);
      grouped.get(bucket)!.push(frame);
    }
    
    // Build final frame list preferring RainViewer (higher quality)
    const frames: FrameMetadata[] = Array.from(grouped.values())
      .map((group) => {
        const rainViewerFrame = group.find((f) => f.source === 'RainViewer');
        return rainViewerFrame || group[0];
      })
      .sort((a, b) => b.time - a.time)
      .slice(0, 72); // limit to 72 hours
    
    // Return in expected format: { radar: { past: [] } }
    const response = NextResponse.json({
      radar: {
        past: frames.map((f) => ({ time: f.time })),
      },
      metadata: {
        totalFrames: frames.length,
        timeRange: frames.length > 0
          ? {
              oldest: new Date(frames[frames.length - 1].time).toISOString(),
              newest: new Date(frames[0].time).toISOString(),
            }
          : null,
        sources: ['MRMS', 'RainViewer'],
      },
    });
    
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 min cache
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (e: any) {
    console.error('[RADAR] frames route error:', e);
    return NextResponse.json(
      { error: 'fetch_failed', message: String(e), radar: { past: [] } },
      { status: 500 }
    );
  }
}
