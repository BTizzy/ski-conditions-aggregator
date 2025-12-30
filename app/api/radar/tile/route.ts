import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns precipitation radar tile images
 * 
 * Data Source: RainViewer (confirmed working 2025-12-30)
 * Tile URL format: https://tilecache.rainviewer.com/v2/radar/{timestamp}/{z}/{x}/{y}/256/png
 * 
 * Query Params:
 *   time - Unix timestamp (seconds)
 *   z - Zoom level
 *   x - Tile X coordinate  
 *   y - Tile Y coordinate
 * 
 * Returns: 256x256 PNG image with precipitation overlay
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parse tile parameters
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
    
    // Validate coordinates
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
      return NextResponse.json(
        { error: 'Invalid tile coordinates' },
        { status: 400 }
      );
    }
    
    // Validate zoom level (typical range 0-18)
    if (zNum < 0 || zNum > 20) {
      return getTransparentTile();
    }
    
    // Validate tile bounds for zoom level
    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }
    
    // RainViewer tile URL
    // Format: /v2/radar/{timestamp}/{z}/{x}/{y}/{tile_size}/options.png
    // tile_size: 256 or 512
    // options: color scheme and smoothing (256 is default)
    const tileUrl = `https://tilecache.rainviewer.com/v2/radar/${time}/256/${zNum}/${xNum}/${yNum}/2/1_1.png`;
    
    console.log(`[Tile API] Fetching: z=${z} x=${x} y=${y} time=${time}`);
    
    // Fetch tile from RainViewer
    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'ski-conditions-aggregator',
        'Accept': 'image/png'
      },
      next: { revalidate: 3600 } // Cache 1 hour
    });
    
    if (!response.ok) {
      console.warn(`[Tile API] RainViewer returned ${response.status} for ${tileUrl}`);
      return getTransparentTile();
    }
    
    // Return the PNG tile
    const imageBuffer = await response.arrayBuffer();
    
    const result = new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache 1 hour
        'Access-Control-Allow-Origin': '*'
      }
    });
    
    return result;
    
  } catch (error: any) {
    console.error('[Tile API] Error:', error.message);
    return getTransparentTile();
  }
}

/**
 * Returns a 1x1 transparent PNG as fallback
 * 67 bytes - minimal overhead
 */
function getTransparentTile(): Response {
  // 1x1 transparent PNG
  const transparentPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);
  
  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
