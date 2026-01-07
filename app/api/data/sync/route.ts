import { NextRequest, NextResponse } from 'next/server';
import { resorts } from '../../../../lib/resorts';

export const dynamic = 'force-dynamic';

/**
 * Data Sync Endpoint
 * 
 * POST /api/data/sync
 * 
 * Triggers background collection of all resort data:
 * 1. Scrapes current conditions from all resorts
 * 2. Collects NWS observations
 * 3. Runs snow model predictions
 * 4. Returns stats on what was collected
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Sync] Starting data collection for', resorts.length, 'resorts');

    const startTime = Date.now();
    const results = {
      resorts: 0,
      conditions: 0,
      radar: 0,
      errors: [] as string[]
    };

    // Fetch conditions from scrape API for each resort
    // This triggers the actual scraping and snow model
    const promises = resorts.map(async (resort) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/scrape?resortId=${resort.id}`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        await response.json(); // consume body
        results.conditions++;
        console.log(`[Sync] ✅ ${resort.name}`);

      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        results.errors.push(`${resort.name}: ${msg}`);
        console.warn(`[Sync] ❌ ${resort.name}: ${msg}`);
      }
    });

    // Wait for all resorts to complete (with timeout)
    await Promise.race([
      Promise.allSettled(promises),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sync timeout after 120s')), 120000)
      )
    ]);

    results.resorts = resorts.length;

    const duration = Date.now() - startTime;
    console.log('[Sync] Complete:', {
      ...results,
      durationMs: duration
    });

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      synced: results,
      durationMs: duration
    });

  } catch (error: any) {
    console.error('[Sync] Error:', error.message);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get sync status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    message: 'POST to trigger data sync',
    endpoint: '/api/data/sync',
    timeout: '120 seconds',
    resorts: resorts.length
  });
}
