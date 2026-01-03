import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * NOAA Radar Tile Processor
 * Converts cached NOAA radar frames into map tiles
 */

export interface TileCoords {
  z: number;
  x: number;
  y: number;
}

export interface NOAAFrame {
  timestamp: number;
  framePath: string;
  frameIndex: number;
  width: number;
  height: number;
}

/**
 * Convert lat/lng to tile coordinates
 */
export function latLngToTile(lat: number, lon: number, zoom: number): TileCoords {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
  return { z: zoom, x, y };
}

/**
 * Convert tile coordinates to lat/lng bounds
 */
export function tileToLatLngBounds(z: number, x: number, y: number) {
  const n = Math.pow(2, z);
  const lon1 = x / n * 360 - 180;
  const lat1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
  const lon2 = (x + 1) / n * 360 - 180;
  const lat2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;
  return { north: lat2, south: lat1, east: lon2, west: lon1 };
}

/**
 * Generate a tile from a NOAA radar frame
 * The NOAA radar covers the Northeast US, so we need to map tile coordinates to the radar image
 */
export async function generateNOAATile(
  frame: NOAAFrame,
  tileCoords: TileCoords
): Promise<Buffer | null> {
  try {
    // Load the cached frame
    if (!fs.existsSync(frame.framePath)) {
      console.error(`[NOAA Tile] Frame not found: ${frame.framePath}`);
      return null;
    }

    const image = await loadImage(frame.framePath);
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    // NOAA radar covers approximately Northeast US
    // Approximate bounds: ~35°N to 50°N, ~65°W to 85°W
    const radarBounds = {
      north: 50,
      south: 35,
      east: -65,
      west: -85,
    };

    // Get tile bounds
    const tileBounds = tileToLatLngBounds(tileCoords.z, tileCoords.x, tileCoords.y);

    // Check if tile intersects with radar coverage
    const intersects = !(
      tileBounds.north < radarBounds.south ||
      tileBounds.south > radarBounds.north ||
      tileBounds.east < radarBounds.west ||
      tileBounds.west > radarBounds.east
    );

    if (!intersects) {
      // Return transparent tile
      return canvas.toBuffer('image/png');
    }

    // Calculate the portion of the radar image that covers this tile
    const radarWidth = image.width;
    const radarHeight = image.height;

    // Convert tile bounds to pixel coordinates in radar image
    const pixelX1 = Math.max(0, Math.floor(
      ((tileBounds.west - radarBounds.west) / (radarBounds.east - radarBounds.west)) * radarWidth
    ));
    const pixelY1 = Math.max(0, Math.floor(
      ((radarBounds.north - tileBounds.north) / (radarBounds.north - radarBounds.south)) * radarHeight
    ));
    const pixelX2 = Math.min(radarWidth, Math.floor(
      ((tileBounds.east - radarBounds.west) / (radarBounds.east - radarBounds.west)) * radarWidth
    ));
    const pixelY2 = Math.min(radarHeight, Math.floor(
      ((radarBounds.north - tileBounds.south) / (radarBounds.north - radarBounds.south)) * radarHeight
    ));

    const tilePixelWidth = pixelX2 - pixelX1;
    const tilePixelHeight = pixelY2 - pixelY1;

    if (tilePixelWidth <= 0 || tilePixelHeight <= 0) {
      return canvas.toBuffer('image/png');
    }

    // Draw the relevant portion of the radar image onto the tile
    ctx.drawImage(
      image,
      pixelX1, pixelY1, tilePixelWidth, tilePixelHeight, // source
      0, 0, 256, 256 // destination
    );

    return canvas.toBuffer('image/png');

  } catch (error: any) {
    console.error(`[NOAA Tile] Error generating tile:`, error.message);
    return null;
  }
}

/**
 * Get cached tile path
 */
export function getTileCachePath(timestamp: number, z: number, x: number, y: number): string {
  const cacheDir = path.join(process.cwd(), 'cache', 'noaa-tiles', timestamp.toString());
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, `${z}-${x}-${y}.png`);
}

/**
 * Check if tile is cached
 */
export function isTileCached(timestamp: number, z: number, x: number, y: number): boolean {
  const tilePath = getTileCachePath(timestamp, z, x, y);
  return fs.existsSync(tilePath);
}

/**
 * Load cached tile
 */
export function loadCachedTile(timestamp: number, z: number, x: number, y: number): Buffer | null {
  const tilePath = getTileCachePath(timestamp, z, x, y);
  if (fs.existsSync(tilePath)) {
    return fs.readFileSync(tilePath);
  }
  return null;
}

/**
 * Cache a generated tile
 */
export function cacheTile(timestamp: number, z: number, x: number, y: number, tileBuffer: Buffer): void {
  const tilePath = getTileCachePath(timestamp, z, x, y);
  fs.writeFileSync(tilePath, tileBuffer);
}