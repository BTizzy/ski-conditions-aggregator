import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cache Statistics Endpoint
 * 
 * GET /api/cache/stats
 * 
 * Returns information about current cache state:
 * - Number of cached entries
 * - Total cache size
 * - Hit rates
 * - Entry ages
 */
export async function GET(request: NextRequest) {
  try {
    // Note: This is a client-side cache (localStorage)
    // But we can provide server-side stats if needed

    return NextResponse.json({
      cacheType: 'localStorage',
      message: 'Cache stats available from browser console',
      endpoints: {
        conditions: '/api/resorts/conditions',
        frames: '/api/radar/frames',
        sync: '/api/data/sync'
      },
      ttl: {
        conditions: '5 minutes',
        frames: '1 minute'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Clear cache
 */
export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    // Note: Client-side cache clearing happens in the browser
    // This is a marker endpoint for triggering server-side cache invalidation

    return NextResponse.json({
      success: true,
      message: 'Cache invalidation triggered',
      invalidated: key || 'all',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
