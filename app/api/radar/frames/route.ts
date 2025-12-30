import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * Data Source: RainViewer.com API
 * Reference: https://www.rainviewer.com/api.html
 * 
 * Coverage: 10-minute intervals, 48-hour history (96 frames)
 * Updates: Every 10 minutes
 * Global Coverage: Worldwide precipitation radar
 */
export async function GET(request: Request) {
  try {
    console.log('[Radar Frames] Fetching RainViewer API...');
    
    // Get current RainViewer radar layers
    // This returns both historical and forecast layers with timestamps
    const res = await fetch('https://api.rainviewer.com/public/weather-maps-api-v2/GetWeatherMapsList', {
      method: 'GET',
      headers: {
        'User-Agent': 'ski-conditions-aggregator'
      }
    });

    if (!res.ok) {
      console.error('[Radar Frames] RainViewer API error:', res.status);
      throw new Error(`RainViewer returned ${res.status}`);
    }

    const data = await res.json();
    console.log('[Radar Frames] RainViewer response:', data);

    // Extract historical radar layers (past 48 hours at 10-min intervals)
    // RainViewer returns: { radar: { nowcast: [...], archive: [...] } }
    const archiveLayers = data?.radar?.archive || [];
    
    if (archiveLayers.length === 0) {
      console.warn('[Radar Frames] No archive layers found, using fallback');
      return fallbackResponse();
    }

    // Each archive layer has { time: millisecondsSinceEpoch, url: "tile URL pattern" }
    // Extract just the timestamps and base URLs
    const layers = archiveLayers.map((layer: any) => ({
      timestamp: layer.time,
      url: layer.url, // e.g., "https://tile.rainviewer.com/v2/radar/..."
    }));

    console.log(`[Radar Frames] Got ${layers.length} archive layers covering 48h`);

    const result = {
      radar: {
        layers: layers,
        source: 'rainviewer-48h'
      },
      metadata: {
        count: layers.length,
        source: 'rainviewer-api-v2',
        updateFrequency: '10 minutes',
        coverage: 'Worldwide',
        timeRange: 'Last 48 hours (10-min intervals)',
        reference: 'https://www.rainviewer.com/api.html'
      }
    };

    const res2 = NextResponse.json(result);
    res2.headers.set('Cache-Control', 'public, max-age=300');
    res2.headers.set('Access-Control-Allow-Origin', '*');
    return res2;

  } catch (error: any) {
    console.error('[Radar Frames] Error:', error.message);
    return fallbackResponse();
  }
}

function fallbackResponse() {
  // Fallback: Return Mesonet format (1-hour, 12 frames) if RainViewer fails
  const layers = [
    'nexrad-n0q-m55m',
    'nexrad-n0q-m50m',
    'nexrad-n0q-m45m',
    'nexrad-n0q-m40m',
    'nexrad-n0q-m35m',
    'nexrad-n0q-m30m',
    'nexrad-n0q-m25m',
    'nexrad-n0q-m20m',
    'nexrad-n0q-m15m',
    'nexrad-n0q-m10m',
    'nexrad-n0q-m05m',
    'nexrad-n0q',
  ];

  return NextResponse.json(
    {
      radar: { layers },
      metadata: {
        source: 'mesonet-fallback',
        note: 'RainViewer failed, using 1-hour Mesonet data'
      }
    },
    { status: 200 }
  );
}
