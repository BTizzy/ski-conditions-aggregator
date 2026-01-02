import { NextResponse, NextRequest } from 'next/server';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache 1 minute

/**
 * Synthetic Radar Tile Generator
 * 
 * Generates hourly radar tiles from resort observations using IDW interpolation
 * Returns 48 frames (1/hour) of synthetic snowfall heatmap overlay
 * 
 * Query Params:
 *   hour - Hour offset from now (0-47)
 *   z, x, y - Tile coordinates (standard Web Mercator)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const hour = parseInt(searchParams.get('hour') || '0');
    const z = parseInt(searchParams.get('z') || '7');
    const x = parseInt(searchParams.get('x') || '0');
    const y = parseInt(searchParams.get('y') || '0');
    
    if (isNaN(hour) || hour < 0 || hour > 47) {
      return getTransparentTile();
    }
    
    if (z < 0 || z > 18) return getTransparentTile();
    const maxTile = Math.pow(2, z);
    if (x < 0 || x >= maxTile || y < 0 || y >= maxTile) {
      return getTransparentTile();
    }

    // Get resort conditions for the target hour
    const targetTime = new Date(Date.now() - hour * 60 * 60 * 1000);
    const conditions = await getResortConditions(targetTime);
    
    if (!conditions || conditions.length === 0) {
      return getTransparentTile();
    }

    // Generate tile from interpolated data
    const tileBuffer = generateSyntheticTile(
      conditions,
      z, x, y,
      targetTime
    );

    return new NextResponse(tileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('[Synthetic Radar] Error:', error.message);
    return getTransparentTile();
  }
}

interface ResortPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  snowDepth: number;
  recentSnowfall: number; // inches in last 24h
  weeklySnowfall?: number;
  baseTemp: number;
  windSpeed: number;
  visibility: string;
}

/**
 * Get resort conditions - query your database
 * For now, this returns mock data. Replace with real DB query.
 */
async function getResortConditions(date: Date): Promise<ResortPoint[]> {
  try {
    // In production: Query your DB for conditions at this timestamp
    // For MVP: Use latest conditions
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/resorts/conditions`,
      { next: { revalidate: 60 } }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Transform API response to ResortPoint format
    return data.resorts?.map((resort: any) => ({
      id: resort.id,
      name: resort.name,
      lat: resort.lat,
      lon: resort.lon,
      snowDepth: resort.conditions?.snowDepth || 0,
      recentSnowfall: resort.conditions?.recentSnowfall || 0,
      weeklySnowfall: resort.conditions?.weeklySnowfall,
      baseTemp: resort.conditions?.baseTemp || 20,
      windSpeed: resort.conditions?.windSpeed || 0,
      visibility: resort.conditions?.visibility || 'Good'
    })) || [];
  } catch (error) {
    console.warn('[Synthetic] Failed to fetch resort conditions:', error);
    return [];
  }
}

/**
 * IDW (Inverse Distance Weighting) Interpolation
 * Estimates value at point based on weighted average of nearest neighbors
 */
function interpolateIDW(
  point: { lat: number; lon: number },
  samples: ResortPoint[],
  k: number = 5
): number {
  if (samples.length === 0) return 0;
  if (samples.length <= k) {
    // If fewer samples than k, use all
    const weights = samples.map(s => {
      const dist = greatCircleDistance(point, { lat: s.lat, lon: s.lon });
      return dist === 0 ? 1000 : 1 / (Math.pow(dist, 2));
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    return samples.reduce((acc, s, i) => acc + s.recentSnowfall * (weights[i] / sum), 0);
  }

  // Find k nearest neighbors
  const nearest = samples
    .map(s => ({
      sample: s,
      dist: greatCircleDistance(point, { lat: s.lat, lon: s.lon })
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);

  // Calculate IDW weights
  const weights = nearest.map(n => n.dist === 0 ? 1000 : 1 / Math.pow(n.dist, 2));
  const sum = weights.reduce((a, b) => a + b, 0);

  // Weighted average
  return nearest.reduce(
    (acc, n, i) => acc + n.sample.recentSnowfall * (weights[i] / sum),
    0
  );
}

/**
 * Haversine distance in degrees (rough estimate)
 * Good enough for interpolation purposes
 */
function greatCircleDistance(
  p1: { lat: number; lon: number },
  p2: { lat: number; lon: number }
): number {
  // For short distances, approximate with Euclidean
  const dlat = (p2.lat - p1.lat) * 111; // 1 degree lat = ~111km
  const dlon = (p2.lon - p1.lon) * 111 * Math.cos((p1.lat * Math.PI) / 180);
  return Math.sqrt(dlat * dlat + dlon * dlon) / 111; // Return in degrees
}

/**
 * Convert snowfall amount to radar color
 */
function snowfallToRGBA(inches: number): Uint8ClampedArray {
  // Color scale for snowfall (inches per hour)
  if (inches >= 2.0) return new Uint8ClampedArray([0, 71, 171, 200]); // Dark blue - heavy
  if (inches >= 1.0) return new Uint8ClampedArray([0, 150, 255, 190]); // Light blue - mod-heavy
  if (inches >= 0.5) return new Uint8ClampedArray([144, 238, 144, 160]); // Light green - moderate
  if (inches >= 0.25) return new Uint8ClampedArray([255, 255, 0, 130]); // Yellow - light
  if (inches >= 0.05) return new Uint8ClampedArray([255, 200, 0, 80]); // Orange - trace
  return new Uint8ClampedArray([0, 0, 0, 0]); // Transparent - none
}

/**
 * Web Mercator projection: lat/lon -> pixel coordinates
 */
function latlonToPixel(
  lat: number,
  lon: number,
  z: number,
  x: number,
  y: number
): { px: number; py: number } | null {
  // Convert to Web Mercator
  const n = Math.pow(2, z);
  const xtile = ((lon + 180) / 360) * n;
  const ytile = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n;

  if (xtile < x || xtile >= x + 1 || ytile < y || ytile >= y + 1) {
    return null; // Outside tile bounds
  }

  // Scale to 256x256 tile
  const px = Math.floor((xtile - x) * 256);
  const py = Math.floor((ytile - y) * 256);

  return { px, py };
}

/**
 * Generate a 256x256 PNG tile with interpolated snowfall data
 */
function generateSyntheticTile(
  conditions: ResortPoint[],
  z: number,
  x: number,
  y: number,
  timestamp: Date
): Buffer {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Create image data
  const imageData = ctx.createImageData(256, 256);
  const data = imageData.data;

  // For each pixel in the tile
  let idx = 0;
  for (let py = 0; py < 256; py++) {
    for (let px = 0; px < 256; px++) {
      // Convert pixel to lat/lon
      const n = Math.pow(2, z);
      const xtile = x + px / 256;
      const ytile = y + py / 256;
      const lon = (xtile / n) * 360 - 180;
      const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * ytile) / n))) * 180) / Math.PI;

      // Interpolate snowfall at this location
      const snowfall = interpolateIDW({ lat, lon }, conditions, 5);

      // Convert to color
      const rgba = snowfallToRGBA(snowfall);

      data[idx++] = rgba[0]; // R
      data[idx++] = rgba[1]; // G
      data[idx++] = rgba[2]; // B
      data[idx++] = rgba[3]; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toBuffer('image/png');
}

function getTransparentTile(): Response {
  const transparentPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);

  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
