import { NextResponse, NextRequest } from 'next/server';

interface TileParams {
  time: string | number;
  z: string | number;
  x: string | number;
  y: string | number;
}

function parseTileParams(searchParams: URLSearchParams): TileParams | null {
  const time = searchParams.get('time');
  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');
  
  if (!time || z === null || x === null || y === null) return null;
  
  return {
    time: isNaN(Number(time)) ? time : Number(time),
    z: Number(z),
    x: Number(x),
    y: Number(y),
  };
}

/**
 * RainViewer tile proxy
 * RainViewer provides high-quality precipitation radar tiles
 * Format: https://tilecache.rainviewer.com/v2/radar/{time}/tiles/{z}/{x}/{y}/2/1_1.png
 */
async function getRainViewerTile(
  time: string | number,
  z: number,
  x: number,
  y: number
): Promise<Response | null> {
  try {
    // RainViewer has optional parameters: colors (1-16), opacity (0-100)
    // Use color scheme 2 (blue-red) for better visibility
    const url = `https://tilecache.rainviewer.com/v2/radar/${time}/tiles/${z}/${x}/${y}/2/1_1.png`;
    
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'ski-conditions-aggregator',
        'Accept': 'image/png',
      },
      // RainViewer cached tiles are stable
    });
    
    if (resp.ok) {
      // Return PNG with cache headers
      const buffer = await resp.arrayBuffer();
      const headers = new Headers();
      headers.set('Content-Type', 'image/png');
      headers.set('Cache-Control', 'public, max-age=86400'); // cache for 24h
      headers.set('Access-Control-Allow-Origin', '*');
      
      return new NextResponse(buffer, { headers });
    }
  } catch (e) {
    console.debug('[RainViewer tile] fetch failed:', e);
  }
  
  return null;
}

/**
 * NOAA MRMS tile fallback
 * Multi-Radar Multi-Sensor System precipitation rate
 * Tiles available at: https://mrms.ncep.noaa.gov/data/2D/PrecipRate/
 */
async function getMRMSTile(
  time: number | string,
  z: number,
  x: number,
  y: number
): Promise<Response | null> {
  try {
    // MRMS data format: YYYYmmdd_HHmmss
    // Convert timestamp to MRMS filename
    const timestamp = typeof time === 'number' ? time : parseInt(String(time));
    const date = new Date(timestamp);
    
    // Format: 20250101_120000Z
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    
    const filename = `${yyyy}${mm}${dd}_${hh}${min}${ss}Z`;
    
    // Note: MRMS tiles aren't directly available in typical XYZ format
    // Instead, use mesonet.agron.iastate.edu's WMS server which wraps MRMS
    const url = `https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms.cgi?` +
      `service=WMS&version=1.1.1&request=GetMap` +
      `&layers=mrms_qpe&styles=&bbox=-180,-90,180,90` +
      `&width=256&height=256&srs=EPSG:4326&format=image/png` +
      `&time=${filename}`;
    
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'ski-conditions-aggregator' },
    });
    
    if (resp.ok) {
      const buffer = await resp.arrayBuffer();
      const headers = new Headers();
      headers.set('Content-Type', 'image/png');
      headers.set('Cache-Control', 'public, max-age=3600'); // cache for 1h
      headers.set('Access-Control-Allow-Origin', '*');
      
      return new NextResponse(buffer, { headers });
    }
  } catch (e) {
    console.debug('[MRMS tile] fetch failed:', e);
  }
  
  return null;
}

/**
 * Generate transparent placeholder tile (1x1 transparent PNG)
 */
function getTransparentTile(): Response {
  // 1x1 transparent PNG (43 bytes)
  const png = Buffer.from([
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
  
  const headers = new Headers();
  headers.set('Content-Type', 'image/png');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Access-Control-Allow-Origin', '*');
  
  return new NextResponse(png, { headers });
}

export async function GET(request: NextRequest) {
  try {
    const params = parseTileParams(request.nextUrl.searchParams);
    
    if (!params) {
      return NextResponse.json(
        { error: 'missing_params', message: 'time, z, x, y required' },
        { status: 400 }
      );
    }
    
    const { time, z, x, y } = params;
    
    // Validate tile coordinates
    if (z < 0 || z > 28 || x < 0 || y < 0) {
      return new NextResponse(null, { status: 400 });
    }
    
    const maxTile = Math.pow(2, z);
    if (x >= maxTile || y >= maxTile) {
      return new NextResponse(null, { status: 400 });
    }
    
    // Try RainViewer first (preferred, higher quality)
    let response = await getRainViewerTile(time, z, x, y);
    
    // Fallback to MRMS if RainViewer fails
    if (!response) {
      response = await getMRMSTile(time, z, x, y);
    }
    
    // If both fail, return transparent placeholder
    if (!response) {
      response = getTransparentTile();
    }
    
    return response;
  } catch (e: any) {
    console.error('[RADAR TILE] error:', e);
    return NextResponse.json(
      { error: 'tile_fetch_failed', message: String(e) },
      { status: 500 }
    );
  }
}
