import { NextResponse, NextRequest } from 'next/server';
import { radarManager } from '../lib/radar-manager';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns radar tile images from multiple sources
 *
 * Data Sources: Multi-source radar system (NOAA, RainViewer, Windy, Weather.com)
 * Priority: RainViewer > Windy > NOAA > Weather.com > Synthetic
 * Caching: Intelligent tile caching with source fallbacks
 *
 * Query Params:
 *   time - Unix timestamp for the radar frame
 *   z, x, y - Tile coordinates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const time = searchParams.get('time');
    const z = searchParams.get('z');
    const x = searchParams.get('x');
    const y = searchParams.get('y');

    if (!time || !z || !x || !y) {
      return NextResponse.json(
        { error: 'Missing parameters. Required: time, z, x, y' },
        { status: 400 }
      );
    }

    const timeNum = parseInt(time);
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);

    if (isNaN(timeNum) || isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (zNum < 0 || zNum > 18) return getTransparentTile();

    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }

    console.log(`[Tile] Request: time=${timeNum} z=${zNum} x=${xNum} y=${yNum}`);

    // Get tile from radar manager (handles multiple sources automatically)
    const tileBuffer = await radarManager.getTile(timeNum, zNum, xNum, yNum);

    if (tileBuffer) {
      console.log(`[Tile] Served from multi-source system`);
      return new NextResponse(new Uint8Array(tileBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300', // 5 minute cache
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Fallback to transparent tile if no source can provide data
    console.log(`[Tile] No data available, returning transparent tile`);
    return getTransparentTile();

  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

// Generate a transparent tile for areas with no data
function getTransparentTile(): NextResponse {
  // Create a 256x256 transparent PNG
  const width = 256;
  const height = 256;
  const png = new (require('pngjs').PNG)({ width, height, colorType: 6 }); // RGBA

  // Fill with transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = 0;     // R
      png.data[idx + 1] = 0; // G
      png.data[idx + 2] = 0; // B
      png.data[idx + 3] = 0; // A (transparent)
    }
  }

  return new NextResponse(png.data, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600', // Cache transparent tiles longer
      'Access-Control-Allow-Origin': '*'
    },
  });
}
