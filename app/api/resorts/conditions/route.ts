import { NextResponse } from 'next/server';
import { resorts } from '../../../../lib/resorts';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache 1 minute

/**
 * Resorts Conditions API
 *
 * Returns current conditions for all resorts
 * Used by synthetic radar generation
 */
export async function GET(request: Request) {
  try {
    console.log('[Resorts Conditions] Fetching conditions for all resorts...');

    // Fetch conditions for all resorts in parallel
    const resortPromises = resorts.map(async (resort: any) => {
      try {
        // Call the existing scrape API for each resort
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/scrape?resortId=${resort.id}`,
          { next: { revalidate: 60 } }
        );

        if (!response.ok) {
          console.warn(`[Resorts Conditions] Failed to fetch ${resort.name}: ${response.status}`);
          return {
            id: resort.id,
            name: resort.name,
            lat: resort.lat,
            lon: resort.lon,
            conditions: null,
            error: `HTTP ${response.status}`
          };
        }

        const conditions = await response.json();

        return {
          id: resort.id,
          name: resort.name,
          lat: resort.lat,
          lon: resort.lon,
          conditions: {
            snowDepth: conditions.snowDepth || 0,
            recentSnowfall: conditions.recentSnowfall || 0,
            weeklySnowfall: conditions.weeklySnowfall || 0,
            baseTemp: conditions.baseTemp || 20,
            windSpeed: conditions.windSpeed || 0,
            visibility: conditions.visibility || 'Good',
            timestamp: conditions.timestamp
          }
        };
      } catch (error) {
        console.warn(`[Resorts Conditions] Error fetching ${resort.name}:`, error);
        return {
          id: resort.id,
          name: resort.name,
          lat: resort.lat,
          lon: resort.lon,
          conditions: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(resortPromises);

    // Filter out resorts with errors and keep only those with valid conditions
    const validResorts = results.filter((r: any) => r.conditions !== null);

    console.log(`[Resorts Conditions] Returning ${validResorts.length}/${results.length} resorts with conditions`);

    const response = NextResponse.json({
      resorts: validResorts,
      metadata: {
        total: results.length,
        valid: validResorts.length,
        timestamp: new Date().toISOString()
      }
    });

    response.headers.set('Cache-Control', 'public, max-age=60');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error('[Resorts Conditions] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}