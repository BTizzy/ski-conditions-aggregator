import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * Data Source: Iowa State Mesonet NEXRAD N0Q (OFFICIAL DOCUMENTED API)
 * Reference: https://mesonet.agron.iastate.edu/ogc/ [web:59]
 * 
 * Layer Format:
 * - nexrad-n0q (current)
 * - nexrad-n0q-m05m, nexrad-n0q-m10m, ..., nexrad-n0q-m55m (past 5-min intervals)
 * 
 * Updates: Every 5-15 minutes
 * History: ~60 minutes (back to m55m)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minutes = parseInt(searchParams.get('minutes') || '60');
    
    console.log(`[Radar Frames] Generating timestamps for Mesonet layers`);
    
    // Generate layer names for Mesonet TMS
    // Format: nexrad-n0q-mXXm where XX is minutes ago (05, 10, 15...55)
    const layers: Array<{ layer: string; minutes: number }> = [
      { layer: 'nexrad-n0q', minutes: 0 } // Current/latest
    ];
    
    // Add historical layers: m05m, m10m, m15m, m20m, m25m, m30m, m35m, m40m, m45m, m50m, m55m
    for (let i = 5; i <= 55; i += 5) {
      if (i <= minutes) {
        layers.push({
          layer: `nexrad-n0q-m${String(i).padStart(2, '0')}m`,
          minutes: i
        });
      }
    }
    
    console.log(`[Radar Frames] Generated ${layers.length} layers for animation`);
    
    // Return layers (frontend will request tiles for each)
    const result = {
      radar: {
        layers: layers.map(l => l.layer)
      },
      metadata: {
        count: layers.length,
        source: 'iowa-state-mesonet-nexrad-n0q',
        updateFrequency: '5-15 minutes',
        coverage: 'Continental US, Alaska, Hawaii',
        timeRange: `Last ${layers[layers.length - 1]?.minutes || 0} minutes`,
        reference: 'https://mesonet.agron.iastate.edu/ogc/'
      }
    };
    
    const res = NextResponse.json(result);
    res.headers.set('Cache-Control', 'public, max-age=60');
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    
  } catch (error: any) {
    console.error('[Radar Frames] Error:', error.message);
    return NextResponse.json(
      { 
        radar: { layers: ['nexrad-n0q'] },
        error: error.message
      },
      { status: 500 }
    );
  }
}
