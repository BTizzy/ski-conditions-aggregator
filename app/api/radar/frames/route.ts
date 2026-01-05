import { NextResponse } from 'next/server';
import { radarManager } from '../lib/radar-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * Radar Frames API - Returns timestamps for precipitation radar animation
 *
 * Data Sources: Multi-source radar system (NOAA, RainViewer, Windy, Weather.com)
 * Coverage: Global with priority for US/Northeast
 * Updates: Every 5 minutes for optimal performance
 * History: Up to 7 days from multiple sources
 */
export async function GET(request: Request) {
  try {
    console.log('[Radar Frames] Fetching multi-source radar frames...');

    const frames = await radarManager.getFrames();

    // Take frames from the last 7 days
    const now = Date.now();
    const cutoffTime = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    const recentFrames = frames.filter(frame => frame.time >= cutoffTime);

    console.log(`[Radar Frames] Returning ${recentFrames.length} frames from last 7 days (from ${frames.length} total)`);

    const result = {
      radar: {
        past: recentFrames.map(frame => ({
          time: frame.time,
          url: frame.url,
        })),
        source: 'multi-source',
        nowcast: [], // Future enhancement
      },
      metadata: {
        count: recentFrames.length,
        source: 'Multi-Source Radar System',
        updateFrequency: '5 minutes',
        coverage: 'Global (US/Northeast priority)',
        timeRange: 'Last 7 days (multi-source)',
        sources: radarManager.getSourceInfo(),
        totalAvailable: frames.length,
      }
    };

    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, max-age=300');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error('[Radar Frames] Error:', error.message);

    // Fallback to basic synthetic data
    const now = Date.now();
    const fallbackFrames = [];
    for (let i = 0; i < 48; i++) {
      const timestamp = now - (i * 60 * 60 * 1000); // Every hour
      fallbackFrames.push({
        time: timestamp,
        url: `fallback-${timestamp}`,
      });
    }

    return NextResponse.json({
      radar: {
        past: fallbackFrames,
        source: 'fallback-synthetic'
      },
      metadata: {
        count: fallbackFrames.length,
        source: 'Fallback Synthetic',
        error: error.message,
      }
    });
  }
}
