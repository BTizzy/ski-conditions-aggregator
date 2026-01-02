import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * RainViewer Radar Tile Proxy
 * 
 * Fetches actual precipitation radar tiles from RainViewer's tilecache API
 * instead of generating synthetic data.
 * 
 * Query Params:
 *   time - Unix timestamp for the radar frame (optional, for backward compatibility)
 *   layer - Layer identifier, can be timestamp or "synthetic-{timestamp}" (optional)
 *   z, x, y - Tile coordinates (required)
 * 
 * RainViewer API: https://www.rainviewer.com/api.html
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Get tile coordinates
    const z = searchParams.get('z');
    const x = searchParams.get('x');
    const y = searchParams.get('y');
    
    // Get time/layer parameter (supports both formats)
    const timeParam = searchParams.get('time');
    const layerParam = searchParams.get('layer');
    
    if (!z || !x || !y) {
      return NextResponse.json(
        { error: 'Missing parameters. Required: z, x, y' },
        { status: 400 }
      );
    }
    
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
      return NextResponse.json({ error: 'Invalid tile coordinates' }, { status: 400 });
    }

    // Validate tile coordinates
    if (zNum < 0 || zNum > 18) return getTransparentTile();
    
    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }

    // Extract timestamp from either time or layer parameter
    let timestamp: number | null = null;
    
    if (timeParam) {
      timestamp = parseInt(timeParam);
    } else if (layerParam) {
      // Handle "synthetic-{timestamp}" format or plain timestamp
      if (layerParam.startsWith('synthetic-')) {
        timestamp = parseInt(layerParam.split('-')[1]);
      } else {
        timestamp = parseInt(layerParam);
      }
    }
    
    if (!timestamp || isNaN(timestamp)) {
      console.log('[Tile] No valid timestamp provided, returning transparent tile');
      return getTransparentTile();
    }

    console.log(`[Tile] RainViewer proxy: z=${zNum} x=${xNum} y=${yNum} time=${timestamp}`);
    
    // Try fetching from RainViewer with multiple URL formats for compatibility
    return await fetchRainViewerTile(timestamp, zNum, xNum, yNum);

  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

/**
 * Fetch radar tile from RainViewer API
 * Tries multiple URL formats for compatibility
 */
async function fetchRainViewerTile(
  time: number,
  z: number,
  x: number,
  y: number
): Promise<Response> {
  // RainViewer tile URL formats to try (in order of preference)
  const urlFormats = [
    // Format 1: v2/radar/{time}/256/{z}/{x}/{y}/2/1_1.png
    `https://tilecache.rainviewer.com/v2/radar/${time}/256/${z}/${x}/${y}/2/1_1.png`,
    
    // Format 2: v2/radar/{time}/{z}/{x}/{y}/256/png
    `https://tilecache.rainviewer.com/v2/radar/${time}/${z}/${x}/${y}/256/png`,
    
    // Format 3: v2/radar/{time}/256/{z}/{x}/{y}/1/1_1.png
    `https://tilecache.rainviewer.com/v2/radar/${time}/256/${z}/${x}/${y}/1/1_1.png`,
  ];

  // Try each URL format
  for (const url of urlFormats) {
    try {
      console.log(`[Tile] Trying RainViewer URL: ${url}`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'SkiConditionsAggregator/1.0',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Verify we got an image
        if (contentType && contentType.startsWith('image/')) {
          console.log(`[Tile] Success with URL format: ${url}`);
          
          const imageBuffer = await response.arrayBuffer();
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400', // 24h cache for tiles
              'Access-Control-Allow-Origin': '*',
            },
          });
        } else {
          console.log(`[Tile] Got non-image response: ${contentType}`);
        }
      } else {
        console.log(`[Tile] HTTP ${response.status} from ${url}`);
      }
    } catch (err: any) {
      console.log(`[Tile] Fetch failed for ${url}: ${err.message}`);
      // Continue to next format
    }
  }

  // If all formats fail, return transparent tile as fallback
  console.log('[Tile] All RainViewer URLs failed, returning transparent tile');
  return getTransparentTile();
}

/**
 * Returns a 1x1 transparent PNG as fallback
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
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
