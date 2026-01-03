import { NextResponse } from 'next/server';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

/**
 * NOAA Radar Scraper API - Downloads and processes NOAA radar GIF into tiles
 *
 * Source: https://radar.weather.gov/ridge/standard/NORTHEAST_loop.gif
 * Process: Downloads GIF, extracts frames, converts to tile format, caches locally
 */
export async function GET(request: Request) {
  try {
    console.log('[NOAA Scraper] Starting NOAA radar scrape...');

    // Download the NOAA radar GIF
    const gifUrl = 'https://radar.weather.gov/ridge/standard/NORTHEAST_loop.gif';
    console.log(`[NOAA Scraper] Downloading from ${gifUrl}...`);

    const response = await fetch(gifUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SkiConditionsAggregator/1.0)',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to download GIF: ${response.status} ${response.statusText}`);
    }

    const gifBuffer = await response.arrayBuffer();
    console.log(`[NOAA Scraper] Downloaded ${gifBuffer.byteLength} bytes`);

    // Parse the GIF
    const gifData = parseGIF(gifBuffer);
    const frames = decompressFrames(gifData, true);

    console.log(`[NOAA Scraper] Parsed ${frames.length} frames from GIF`);

    // Process frames into tiles
    const processedFrames = [];
    const cacheDir = path.join(process.cwd(), 'cache', 'noaa-radar');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const timestamp = Date.now() + (i * 600000); // 10 minutes apart (approximate)

      console.log(`[NOAA Scraper] Processing frame ${i + 1}/${frames.length}...`);

      // Create canvas for this frame
      const canvas = createCanvas(frame.dims.width, frame.dims.height);
      const ctx = canvas.getContext('2d');

      // Create image data from frame
      const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
      imageData.data.set(frame.pixels);
      ctx.putImageData(imageData, 0, 0);

      // Save frame as PNG for caching
      const frameFilename = `noaa-frame-${timestamp}.png`;
      const framePath = path.join(cacheDir, frameFilename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(framePath, buffer);

      processedFrames.push({
        timestamp,
        framePath,
        frameIndex: i,
        width: frame.dims.width,
        height: frame.dims.height,
      });
    }

    console.log(`[NOAA Scraper] Processed ${processedFrames.length} frames`);

    // Return metadata about processed frames
    const result = {
      success: true,
      frames: processedFrames.map(frame => ({
        time: Math.floor(frame.timestamp / 1000),
        url: `noaa-${frame.timestamp}`,
        frameIndex: frame.frameIndex,
        dimensions: {
          width: frame.width,
          height: frame.height,
        },
      })),
      metadata: {
        source: 'NOAA Weather.gov',
        url: gifUrl,
        totalFrames: processedFrames.length,
        cacheLocation: cacheDir,
        processedAt: new Date().toISOString(),
      },
    };

    console.log(`[NOAA Scraper] Complete! Returning ${result.frames.length} frame metadata`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[NOAA Scraper] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to scrape NOAA radar',
        details: error.message,
      },
      { status: 500 }
    );
  }
}