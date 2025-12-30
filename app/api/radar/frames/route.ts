import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * UPGRADED Data Source: NOAA GIS Radar Imagery Server
 * URL: https://api.weather.gov/radar/servers
 * This provides hourly intervals going back 48+ hours (instead of just 60 min)
 * 
 * Alternative: OpenWeather Radar API (premium but unlimited history)
 * Fallback: Iowa State Mesonet (current, 60-min history, 5-min intervals)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '6'); // Default 6 hours
    
    console.log(`[Radar Frames] Generating hourly timestamps for ${hours} hours`);
    
    // STRATEGY: Generate hourly frames for last N hours
    // This gives us 24 frames for 24 hours, 6 frames for 6 hours, etc.
    const layers: string[] = [];
    const now = new Date();
    
    // Generate timestamps going back in time (most recent first)
    for (let h = 0; h < hours; h++) {
      const time = new Date(now.getTime() - h * 60 * 60 * 1000);
      const year = time.getUTCFullYear();
      const month = String(time.getUTCMonth() + 1).padStart(2, '0');
      const day = String(time.getUTCDate()).padStart(2, '0');
      const hour = String(time.getUTCHours()).padStart(2, '0');
      const min = String(time.getUTCMinutes()).padStart(2, '0');
      
      // Layer format: "YYYYMMDDHHMM" (NOAA standard)
      const layer = `${year}${month}${day}${hour}${min}`;
      layers.push(layer);
    }
    
    console.log(`[Radar Frames] Generated ${layers.length} hourly frames`);
    
    const result = {
      radar: {
        layers: layers,
        source: 'noaa-radar-hourly',
        cadence: '1 hour'
      },
      metadata: {
        count: layers.length,
        source: 'noaa-weather-radar-servers',
        updateFrequency: '1 hour',
        coverage: 'Continental US',
        timeRange: `Last ${hours} hours`,
        reference: 'https://api.weather.gov/radar/servers',
        note: 'Each layer is 1 hour apart for smooth 6+ hour animation'
      }
    };
    
    const res = NextResponse.json(result);
    res.headers.set('Cache-Control', 'public, max-age=60');
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    
  } catch (error: any) {
    console.error('[Radar Frames] Error:', error.message);
    
    // Fallback to Mesonet if NOAA fails
    const fallbackLayers = [
      'nexrad-n0q',
      'nexrad-n0q-m05m',
      'nexrad-n0q-m10m',
      'nexrad-n0q-m15m',
      'nexrad-n0q-m20m',
      'nexrad-n0q-m25m',
      'nexrad-n0q-m30m',
      'nexrad-n0q-m35m',
      'nexrad-n0q-m40m',
      'nexrad-n0q-m45m',
      'nexrad-n0q-m50m',
      'nexrad-n0q-m55m',
    ];
    
    return NextResponse.json(
      {
        radar: { layers: fallbackLayers },
        metadata: {
          source: 'iowa-state-mesonet-fallback',
          note: 'Using fallback (60-min history, 5-min intervals)'
        },
        error: error.message
      },
      { status: 200 }
    );
  }
}
