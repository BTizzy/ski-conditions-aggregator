import { NextResponse, NextRequest } from 'next/server';
import { idwGrid, Point } from '../lib/interpolation';
import { getAllResortAreaHistorical, getAccumulatedSnowfallAtLocation, getAccumulatedRainfallAtLocation } from '../lib/historical';
import { resorts } from '../../../../lib/resorts';
import { PNG } from 'pngjs';

export const dynamic = 'force-dynamic';

/**
 * Radar Tile Proxy - Returns radar tile images based on real weather data
 * 
 * Data Source: IDW interpolation of actual historical weather station data from resorts and Northeast stations
 * Coverage: Northeast US precipitation patterns (snowfall and rainfall)
 * 
 * Query Params:
 *   layer - Must be "synthetic-{timestamp}"
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

    // Handle real weather data (based on resort observations and weather stations)
    if (layer.startsWith('synthetic-')) {
      // Layer is "synthetic-{timestamp}" but now uses real weather data
      const timestamp = parseInt(layer.split('-')[1]);
      if (isNaN(timestamp)) {
        return NextResponse.json({ error: 'Invalid synthetic timestamp' }, { status: 400 });
      }

      console.log(`[Tile] Real weather data: z=${zNum} x=${xNum} y=${yNum} time=${timestamp}`);
      
      // Generate tile with real weather data from resort observations and weather stations
      return await generatePurelySyntheticTile(zNum, xNum, yNum, timestamp);
    }

    // If we get here, it's an invalid layer format
    return NextResponse.json({ error: 'Invalid layer format - only real weather data layers supported' }, { status: 400 });

  } catch (error: any) {
    console.error('[Tile] Error:', error.message);
    return getTransparentTile();
  }
}

// Generate real weather data points from resort observations and weather stations
async function generateRealWeatherDataPoints(
  timestamp: number
): Promise<Point[]> {
  try {
    // Fetch all resort area historical data including additional weather stations
    const resortAreaData = await getAllResortAreaHistorical();
    const realPoints: Point[] = [];

    // Create Point objects at station locations with accumulated precipitation
    for (const resortArea of resortAreaData) {
      for (const station of resortArea.stations) {
        // Get accumulated snowfall and rainfall up to the given timestamp
        const snowfall = getAccumulatedSnowfallAtLocation(
          resortArea.stations,
          station.lat,
          station.lon,
          timestamp
        );
        const rainfall = getAccumulatedRainfallAtLocation(
          resortArea.stations,
          station.lat,
          station.lon,
          timestamp
        );

        // Combine snowfall and rainfall for total precipitation value
        // Weight snowfall more heavily as it's more visible on radar
        const totalPrecipitation = snowfall + (rainfall * 0.1);

        // Only add points with meaningful precipitation
        if (totalPrecipitation > 0) {
          realPoints.push({
            lat: station.lat,
            lon: station.lon,
            value: totalPrecipitation
          });
        }
      }
    }

    console.log(`[Tile] Generated ${realPoints.length} real weather data points for timestamp ${new Date(timestamp).toISOString()}`);
    return realPoints;
  } catch (error: any) {
    console.error('[Tile] Error generating real weather data points:', error.message);
    return [];
  }
}

// Convert tile coordinates to lat/lon bounds (EPSG:4326)
function getTileBoundsLatLon(z: number, x: number, y: number): string {
  // Correct Web Mercator to lat/lon conversion
  const n = Math.pow(2, z);
  const lon0 = (x / n) * 360 - 180;
  const lon1 = ((x + 1) / n) * 360 - 180;

  // Correct latitude calculation
  const lat0 = (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * y / n))) - Math.PI / 2) * 180 / Math.PI;
  const lat1 = (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * (y + 1) / n))) - Math.PI / 2) * 180 / Math.PI;

  // WMS 1.3.0 BBOX format for EPSG:4326: minY,minX,maxY,maxX
  // Y is latitude (minY = southern lat, maxY = northern lat)
  // X is longitude (minX = western lon, maxX = eastern lon)
  const minLat = Math.min(lat0, lat1);
  const maxLat = Math.max(lat0, lat1);
  const minLon = Math.min(lon0, lon1);
  const maxLon = Math.max(lon0, lon1);
  return `${minLat},${minLon},${maxLat},${maxLon}`;
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

async function generatePurelySyntheticTile(z: number, x: number, y: number, timestamp: number): Promise<Response> {
  try {
    // Get tile bounds
    const n = Math.pow(2, z);
    const lon0 = (x / n) * 360 - 180;
    const lat0 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
    const lon1 = ((x + 1) / n) * 360 - 180;
    const lat1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;

    // Generate real weather data points from resort observations and weather stations
    const realPoints = await generateRealWeatherDataPoints(timestamp);

    console.log(`[Tile] Real weather data z=${z} x=${x} y=${y} t=${new Date(timestamp).toISOString().slice(0,16)}: ${realPoints.length} data points`);

    // If no real data is available, return transparent tile
    if (realPoints.length === 0) {
      console.log('[Tile] No real weather data available, returning transparent tile');
      return getTransparentTile();
    }

    // Use optimized interpolation parameters for realistic weather radar appearance
    const grid = idwGrid(realPoints, 256, 256, lat0, lon0, lat1, lon1, {
      power: 2,    // Moderate power for natural falloff
      radius: 150  // Larger radius for smoother blending between weather systems
    });

    // Create PNG with Doppler-style radar coloring
    const pngBuffer = createDopplerRadarPNG(grid.data);

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('[Tile] Error generating tile with real weather data:', error.message);
    return getTransparentTile();
  }
}

function createDopplerRadarPNG(data: number[][]): Buffer {
  const width = data[0].length;
  const height = data.length;
  const png = new PNG({ width, height });

  // Apply simple smoothing to reduce extreme local variations
  const smoothedData = smoothGrid(data, 2); // 2-pixel smoothing radius for smoother radar appearance

  // Find max value for scaling (cap at reasonable snowfall amounts)
  let maxVal = 0;
  for (const row of smoothedData) {
    for (const val of row) {
      if (val > maxVal) maxVal = val;
    }
  }

  // Doppler radar color scale (similar to weather.com/Apple Maps)
  // Based on reflectivity levels, but adapted for snowfall intensity
  function getDopplerColor(intensity: number): [number, number, number, number] {
    // Scale 0-1 where 1 is maximum snowfall
    const normalized = Math.min(intensity, 1);

    if (normalized < 0.1) return [0, 0, 0, 0]; // Transparent for very light/no snow
    if (normalized < 0.2) return [173, 216, 230, 180]; // Light blue
    if (normalized < 0.3) return [135, 206, 235, 200]; // Sky blue
    if (normalized < 0.4) return [70, 130, 180, 220]; // Steel blue
    if (normalized < 0.5) return [25, 25, 112, 240]; // Midnight blue
    if (normalized < 0.6) return [0, 100, 0, 255]; // Dark green
    if (normalized < 0.7) return [34, 139, 34, 255]; // Forest green
    if (normalized < 0.8) return [255, 215, 0, 255]; // Gold
    if (normalized < 0.9) return [255, 140, 0, 255]; // Dark orange
    if (normalized < 0.98) return [220, 20, 60, 255]; // Crimson (less bright red)
    return [139, 0, 0, 255]; // Dark red for absolute maximum
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = smoothedData[y][x];
      const intensity = maxVal > 0 ? Math.min(val / Math.max(maxVal, 0.1), 1.0) : 0; // Clamp to [0,1]
      const [r, g, b, a] = getDopplerColor(intensity);

      const idx = (width * y + x) << 2;
      png.data[idx] = r;     // R
      png.data[idx + 1] = g; // G
      png.data[idx + 2] = b; // B
      png.data[idx + 3] = a; // A
    }
  }

  return PNG.sync.write(png);
}

// Simple box filter smoothing to reduce extreme local variations
function smoothGrid(data: number[][], radius: number): number[][] {
  const height = data.length;
  const width = data[0].length;
  const smoothed: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;

      // Average over a box around this pixel
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width && !isNaN(data[ny][nx])) {
            sum += data[ny][nx];
            count++;
          }
        }
      }

      row.push(count > 0 ? sum / count : 0);
    }
    smoothed.push(row);
  }

  return smoothed;
}
