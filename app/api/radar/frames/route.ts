import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 * 
 * Data Source: Synthetic radar data based on real historical weather station data
 * Coverage: Historical snowfall patterns with hourly temporal resolution
 * Updates: Every hour for 48-hour coverage
 */
export async function GET(request: Request) {
  try {
    console.log('[Radar Frames] Generating synthetic frames from real weather data...');
    
    // Generate synthetic frames only: every hour for last 48 hours
    const now = Date.now();
    const frames = [];
    
    // Synthetic data: every hour for last 48 hours (48 frames total)
    const totalHours = 48;
    const intervalMinutes = 60; // 1 frame per hour
    const totalFrames = totalHours; // 48 frames for 48 hours
    
    for (let i = 0; i < totalFrames; i++) {
      const timestamp = now - ((totalFrames - 1 - i) * intervalMinutes * 60 * 1000); // Start from oldest (47h ago) to newest (current)
      frames.push({
        time: Math.floor(timestamp / 1000), // Convert to seconds for frontend
        url: `synthetic-${timestamp}` // Synthetic layer identifier
      });
    }
    
    console.log(`[Radar Frames] Generated ${frames.length} synthetic frames (1 per hour, ${totalHours}h coverage)`);

    const result = {
      radar: {
        past: frames,
        source: 'synthetic-real-data'
      },
      metadata: {
        count: frames.length,
        source: 'synthetic',
        updateFrequency: `${intervalMinutes} minutes`,
        coverage: 'Northeast US (based on real weather station data)',
        timeRange: `Last ${totalHours} hours (${intervalMinutes}min intervals)`,
        reference: 'IDW interpolation of historical resort weather station data'
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
  // Fallback: Generate synthetic frames if main logic fails
  const now = Date.now();
  const frames = [];
  
  // Generate 30-minute interval frames for last 48 hours as fallback
  const totalHours = 48;
  const intervalMinutes = 30;
  const totalFrames = (totalHours * 60) / intervalMinutes;
  
  for (let i = 0; i < totalFrames; i++) {
    const timestamp = now - ((totalFrames - 1 - i) * intervalMinutes * 60 * 1000); // Start from oldest to newest
    frames.push({
      time: Math.floor(timestamp / 1000), // Convert to seconds for frontend
      url: `synthetic-${timestamp}`
    });
  }

  return NextResponse.json(
    {
      radar: {
        past: frames,
        source: 'synthetic-fallback'
      },
      metadata: {
        source: 'synthetic-fallback',
        note: 'Using synthetic fallback frame generation',
        count: frames.length,
        timeRange: `Last ${totalHours} hours (${intervalMinutes}min intervals)`
      }
    },
    { status: 200 }
  );
}
