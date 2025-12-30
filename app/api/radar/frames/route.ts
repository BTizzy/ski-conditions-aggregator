import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * Data Source: RainViewer Public API (confirmed working 2025-12-30)
 * - Updates every 10 minutes
 * - ~2 hours of historical data on free tier  
 * - Global coverage
 * - No API key required for basic access
 * 
 * Query Params:
 *   ?hours=24  - Filter last N hours (default: 24, max: 72)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedHours = Math.min(parseInt(searchParams.get('hours') || '24'), 72);
    
    console.log(`[Radar API] Fetching frames for last ${requestedHours}h`);
    
    // Fetch from RainViewer - ONLY working free public API confirmed
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      headers: { 'User-Agent': 'ski-conditions-aggregator' },
      next: { revalidate: 300 } // Next.js cache 5 min
    });
    
    if (!response.ok) {
      throw new Error(`RainViewer API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract radar timestamps from response
    const pastFrames = (data.radar?.past || []) as Array<{ time: number; path: string }>;
    const nowcastFrames = (data.radar?.nowcast || []) as Array<{ time: number; path: string }>;
    
    // Calculate cutoff time
    const now = Date.now() / 1000; // Unix seconds
    const cutoff = now - (requestedHours * 3600);
    
    // Filter and extract timestamps only
    const allFrames = [...pastFrames, ...nowcastFrames];
    const timestamps = allFrames
      .filter(frame => frame.time >= cutoff)
      .map(frame => frame.time)
      .sort((a, b) => a - b); // Chronological order
    
    console.log(`[Radar API] Returning ${timestamps.length} frames (generated: ${new Date(data.generated * 1000).toISOString()})`);
    
    const result = {
      radar: {
        past: timestamps
      },
      metadata: {
        count: timestamps.length,
        generated: data.generated,
        source: 'rainviewer',
        timeRange: timestamps.length > 0 ? {
          oldest: new Date(timestamps[0] * 1000).toISOString(),
          newest: new Date(timestamps[timestamps.length - 1] * 1000).toISOString()
        } : null
      }
    };
    
    const res = NextResponse.json(result);
    res.headers.set('Cache-Control', 'public, max-age=300');
    res.headers.set('Access-Control-Allow-Origin', '*');
    return res;
    
  } catch (error: any) {
    console.error('[Radar API] Error fetching frames:', error.message);
    
    // Return empty array on error (graceful degradation)
    return NextResponse.json(
      { 
        radar: { past: [] },
        error: error.message
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=60', // Shorter cache on error
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
