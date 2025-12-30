import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns NEXRAD precipitation radar tile images
 * 
 * Data Source: Iowa State Mesonet Tile Map Service (TMS)
 * Tile Service: https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/
 * 
 * Layer: nexrad-n0q-900913
 * - N0Q = Base Reflectivity (Doppler radar measurement)
 * - 900913 = Web Mercator projection
 * - Updates every 5-15 minutes
 * - 60+ minutes of history
 * 
 * Query Params:
 *   time - Unix timestamp (seconds)
 *   z - Zoom level (0-18)
 *   x - Tile X coordinate
 *   y - Tile Y coordinate
 * 
 * Returns: 256x256 PNG image
 * Reference: https://mesonet.agron.iastate.edu/ogc/
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
    
    // Validate zoom level (Web Mercator typical range 0-18)
    if (zNum < 0 || zNum > 18) {
      return getTransparentTile();
    }
    
    // Validate tile bounds for zoom level
    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }
    
    // Convert Unix timestamp (seconds) to YYYYMMDDHHmi format for Mesonet
    const timeNum = parseInt(time);
    if (isNaN(timeNum)) {
      return getTransparentTile();
    }
    
    const date = new Date(timeNum * 1000);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mi = String(date.getUTCMinutes()).padStart(2, '0');
    
    const timeFormatted = `${yyyy}${mm}${dd}${hh}${mi}`;
    
    // Mesonet TMS endpoint for NEXRAD N0Q (Base Reflectivity)
    // Format: /cache/tile.py/1.0.0/{LAYER}/{Z}/{X}/{Y}.png
    // Layer with timestamp: ridge::{RADAR-PRODUCT-TIMESTAMP}
    const tileUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::DMX-N0Q-${timeFormatted}/${zNum}/${xNum}/${yNum}.png`;
    
    console.log(`[Tile] Fetching: z=${z} x=${x} y=${y} time=${timeFormatted} url=${tileUrl}`);
    
    // Fetch from Mesonet
    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'ski-conditions-aggregator',
        'Accept': 'image/png'
      },
      // Mesonet caches tiles for 5+ minutes
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      console.warn(`[Tile] Mesonet returned ${response.status} for ${tileUrl}`);
      // Try with current time (latest available)
      const now = new Date();
      const nowYyyy = now.getUTCFullYear();
      const nowMm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const nowDd = String(now.getUTCDate()).padStart(2, '0');
      const nowHh = String(now.getUTCHours()).padStart(2, '0');
      const nowMi = String(now.getUTCMinutes()).padStart(2, '0');
      const nowTime = `${nowYyyy}${nowMm}${nowDd}${nowHh}${nowMi}`;
      
      const fallbackUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::DMX-N0Q-${nowTime}/${zNum}/${xNum}/${yNum}.png`;
      console.log(`[Tile] Trying fallback with current time: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'ski-conditions-aggregator',
          'Accept': 'image/png'
        }
      });
      
      if (!fallbackResponse.ok) {
        console.warn(`[Tile] Fallback also failed, returning transparent`);
        return getTransparentTile();
      }
      
      return returnTile(fallbackResponse);
    }
    
    return returnTile(response);
    
  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

/**
 * Process and return tile response
 */
async function returnTile(response: Response): Promise<Response> {
  const imageBuffer = await response.arrayBuffer();
  
  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300', // 5-minute cache (Mesonet standard)
      'Access-Control-Allow-Origin': '*'
    }
  });
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
