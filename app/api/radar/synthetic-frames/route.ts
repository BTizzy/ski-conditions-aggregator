import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache 1 minute

/**
 * Synthetic Radar Frames API
 * 
 * Returns 48 hourly frames (1 frame per hour) of synthetic snowfall radar
 * Generated from interpolated resort observation data
 * 
 * Response format matches your existing frames endpoint so it plugs right in
 */
export async function GET(request: Request) {
  try {
    console.log('[Synthetic Frames] API called at', new Date().toISOString());
    console.log('[Synthetic Frames] Generating 48 hourly frames...');
    const frames = [];
    const now = new Date();

    for (let i = 0; i < 48; i++) {
      const frameTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      const frameUrl = `/api/radar/synthetic?hour=${i}`;

      frames.push({
        timestamp: frameTime.getTime(),
        time: frameTime.getTime(),
        url: frameUrl,
        offset: i
      });
    }

    console.log(`[Synthetic Frames] Generated ${frames.length} frames`);

    return NextResponse.json({
      radar: {
        layers: frames,
        source: 'synthetic-idw-48h',
        baseUrl: '/api/radar/synthetic'
      },
      metadata: {
        count: frames.length,
        type: 'synthetic',
        method: 'IDW interpolation from resort observations',
        resortCount: 43,
        coverage: 'Northeast US',
        timeRange: 'Last 48 hours (1-hour intervals)',
        updateFrequency: 'Real-time',
        reference: 'Generated from ski resort condition observations'
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('[Synthetic Frames] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
