import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns radar tile images
 * 
 * Primary Source: RainViewer API v2 (48-hour history)
 * Fallback: Iowa State Mesonet (1-hour history)
 * 
 * RainViewer Layer Format: { timestamp: ms, url: "tile URL pattern" }
 * Mesonet Layer Format: "nexrad-n0q-mXXm"
 * 
 * Query Params:
 *   layer - Either RainViewer URL or Mesonet layer name
 *   z, x, y - Tile coordinates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const layer = searchParams.get('layer');
    const z = searchParams.get('z');
    const x = searchParams.get('x');
    const y = searchParams.get('y');
    
    if (!z || !x || !y || !layer) {
      return NextResponse.json(
        { error: 'Missing parameters. Required: layer, z, x, y' },
        { status: 400 }
      );
    }
    
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    if (isNaN(zNum) || isNaN(xNum) || isNaN(yNum)) {
      return NextResponse.json({ error: 'Invalid tile coordinates' }, { status: 400 });
    }

    if (zNum < 0 || zNum > 18) return getTransparentTile();
    
    const maxTile = Math.pow(2, zNum);
    if (xNum < 0 || xNum >= maxTile || yNum < 0 || yNum >= maxTile) {
      return getTransparentTile();
    }

    let tileUrl: string;

    // DETECT SOURCE: RainViewer or Mesonet
    if (layer.startsWith('http')) {
      // RainViewer: layer is a URL template like "https://tile.rainviewer.com/v2/radar/1704033600/{z}/{x}/{y}/..."
      // Replace {z}, {x}, {y} with actual coordinates
      tileUrl = layer
        .replace('{z}', String(zNum))
        .replace('{x}', String(xNum))
        .replace('{y}', String(yNum));
      
      console.log(`[Tile] RainViewer: z=${zNum} x=${xNum} y=${yNum}`);
    } else if (layer.startsWith('nexrad-n0q')) {
      // Mesonet: layer name like "nexrad-n0q-m15m"
      // Validate Mesonet layer format
      if (!/^nexrad-n0q(-m\d{2}m)?$/.test(layer)) {
        return NextResponse.json({ error: 'Invalid Mesonet layer' }, { status: 400 });
      }

      tileUrl = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/${layer}/${zNum}/${xNum}/${yNum}.png`;
      console.log(`[Tile] Mesonet: layer=${layer} z=${zNum}`);
    } else {
      return NextResponse.json({ error: 'Invalid layer format' }, { status: 400 });
    }

    // Fetch tile from source
    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'ski-conditions-aggregator',
        'Accept': 'image/png,image/webp,*/*'
      },
      next: { revalidate: 300 } // Cache 5 minutes
    });

    if (!response.ok) {
      console.warn(`[Tile] Source returned ${response.status}`);
      return getTransparentTile();
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength === 0) return getTransparentTile();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

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
      'Access-Control-Allow-Origin': '*'
    }
  });
}
