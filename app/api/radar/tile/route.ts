import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns NEXRAD precipitation radar tile images
 * 
 * Data Source: Iowa State Mesonet Tile Map Service (TMS)
 * Official Docs: https://mesonet.agron.iastate.edu/ogc/
 * 
 * Layer Format (WORKING):
 * - nexrad-n0q (current/latest)
 * - nexrad-n0q-m05m, m10m, m15m, ... m55m (past 5-min intervals)
 * 
 * TMS Endpoint: /cache/tile.py/1.0.0/{LAYER}/{Z}/{X}/{Y}.png
 * Cache: 5 minutes
 * 
 * Query Params:
 *   layer - Mesonet layer name (e.g., 'nexrad-n0q' or 'nexrad-n0q-m15m')
 *   z - Zoom level (0-18)
 *   x - Tile X coordinate
 *   y - Tile Y coordinate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parse parameters
    const layer = searchParams.get('layer') || 'nexrad-n0q'; // Default to current
    const z = searchParams.get('z');
    const x = searchParams.get('x');
    const y = searchParams.get('y');
    
    if (!z || !x || !y) {
      return NextResponse.json(
        { error: 'Missing parameters. Required: z, x, y (layer optional)' },
        { status: 400 }
      );
    }
    
    // Parse and validate coordinates
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
      return NextResponse.json(
        { error: 'Invalid tile coordinates' },
        { status: 400 }
      );
    }
    
    // Validate zoom level
    if (zNum < 0 || zNum > 18) {
      return getTransparentTile();
    }
    
    // Validate tile bounds
    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }
    
    // Validate layer format
    if (!layer.startsWith('nexrad-n0q')) {
      return NextResponse.json(
        { error: 'Invalid layer. Must be nexrad-n0q or nexrad-n0q-mXXm' },
        { status: 400 }
      );
    }
    
    // Build Mesonet TMS URL
    // https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/{LAYER}/{Z}/{X}/{Y}.png
    const tileUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/${layer}/${zNum}/${xNum}/${yNum}.png`;
    
    console.log(`[Tile] Fetching: layer=${layer} z=${zNum} x=${xNum} y=${yNum}`);
    console.log(`[Tile] URL: ${tileUrl}`);
    
    // Fetch from Mesonet
    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'ski-conditions-aggregator',
        'Accept': 'image/png'
      },
      next: { revalidate: 300 } // Cache 5 minutes (matches Mesonet)
    });
    
    if (!response.ok) {
      console.warn(`[Tile] Mesonet returned ${response.status} for layer=${layer}`);
      return getTransparentTile();
    }
    
    // Return PNG tile
    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // 5-minute cache (Mesonet default)
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

/**
 * Returns a 1x1 transparent PNG as fallback when no data available
 */
function getTransparentTile(): Response {
  // 1x1 transparent PNG (67 bytes)
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
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
