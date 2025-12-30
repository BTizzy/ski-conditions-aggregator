import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * Data Source: Iowa State Mesonet NEXRAD (N0Q - Base Reflectivity)
 * - Updates every 5-15 minutes
 * - 60 minutes of historical data
 * - Production-grade (used by weather.gov)
 * - Free, no API key required
 * 
 * Implementation: Generates 15-minute intervals from 60 minutes ago to now
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minutesBack = Math.min(parseInt(searchParams.get('minutes') || '60'), 120);
    
    console.log(`[Radar Frames] Generating timestamps for last ${minutesBack} minutes`);
    
    // Generate timestamps every 15 minutes going back
    // Mesonet has N0Q data roughly every 5-10 minutes, we'll use 15-min intervals to ensure availability
    const now = new Date();
    const timestamps: number[] = [];
    
    for (let i = 0; i <= minutesBack; i += 15) {
      const timestamp = new Date(now.getTime() - i * 60 * 1000);
      // Round to nearest minute for consistency
      timestamp.setSeconds(0, 0);
      timestamps.push(Math.floor(timestamp.getTime() / 1000));
    }
    
    // Sort chronologically (oldest first)
    timestamps.sort((a, b) => a - b);
    
    console.log(`[Radar Frames] Generated ${timestamps.length} timestamps for animation`);
    
    const result = {
      radar: {
        past: timestamps
      },
      metadata: {
        count: timestamps.length,
        source: 'iowa-state-mesonet-nexrad-n0q',
        updateFrequency: '5-15 minutes',
        coverage: 'Continental US, Alaska, Hawaii, Caribbean',
        timeRange: timestamps.length > 0 ? {
          oldest: new Date(timestamps[0] * 1000).toISOString(),
          newest: new Date(timestamps[timestamps.length - 1] * 1000).toISOString()
        } : null
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
        radar: { past: [] },
        error: error.message
      },
      { status: 500 }
    );
  }
}
