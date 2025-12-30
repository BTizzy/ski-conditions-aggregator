
import { NextResponse } from 'next/server';

// Example tile endpoints for MRMS, NEXRAD, QPE (Iowa State Mesonet, NOAA)
const TILE_SOURCES = [
  {
    name: 'NEXRAD',
    url: (time: string, z: string, x: string, y: string) =>
      `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::N0Q-${time}/${z}/${x}/${y}.png`,
  },
  {
    name: 'MRMS',
    url: (time: string, z: string, x: string, y: string) =>
      `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/mrms::REF-${time}/${z}/${x}/${y}.png`,
  },
  {
    name: 'QPE',
    url: (time: string, z: string, x: string, y: string) =>
      `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/mrms::QPE-${time}/${z}/${x}/${y}.png`,
  },
];

// Simple in-memory tile cache: key -> { ts, contentType, buffer }
const tileCache: Map<string, { ts: number; contentType: string; buffer: Uint8Array }> = new Map();
const TILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const time = url.searchParams.get('time');
    const z = url.searchParams.get('z');
    const x = url.searchParams.get('x');
    const y = url.searchParams.get('y');
    if (!time || !z || !x || !y) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    }

    // Try all sources in order, return first successful tile
    for (const src of TILE_SOURCES) {
      const tileUrl = src.url(time, z, x, y);
      // Check cache
      const cacheKey = `${src.name}_${tileUrl}`;
      const cached = tileCache.get(cacheKey);
      if (cached && (Date.now() - cached.ts) < TILE_CACHE_TTL) {
        const respHeaders = new Headers();
        respHeaders.set('Content-Type', cached.contentType || 'image/png');
        respHeaders.set('Cache-Control', 'public, max-age=60');
        respHeaders.set('Access-Control-Allow-Origin', '*');
        respHeaders.set('X-Radar-Source', src.name);
        respHeaders.set('X-Cache', 'HIT');
        return new Response(Buffer.from(cached.buffer), { status: 200, headers: respHeaders });
      }
      // Fetch tile
      try {
        const upstream = await fetch(tileUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator/1.0' } });
        if (upstream.ok) {
          const arrayBuffer = await upstream.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const ct = upstream.headers.get('content-type') || 'image/png';
          // store in cache
          try { tileCache.set(cacheKey, { ts: Date.now(), contentType: ct, buffer }); } catch {}
          const respHeaders = new Headers();
          respHeaders.set('Content-Type', ct);
          respHeaders.set('Cache-Control', 'public, max-age=60');
          respHeaders.set('Access-Control-Allow-Origin', '*');
          respHeaders.set('X-Radar-Source', src.name);
          respHeaders.set('X-Cache', 'MISS');
          return new Response(Buffer.from(buffer), { status: 200, headers: respHeaders });
        }
      } catch (e) {
        // try next source
      }
    }

    // Fallback: try OpenWeather precipitation tiles if API key is available
    try {
      const owKey = process.env.OPENWEATHER_API_KEY || '';
      if (owKey) {
        const owUrl = `https://tile.openweathermap.org/map/precipitation_new/${encodeURIComponent(z)}/${encodeURIComponent(x)}/${encodeURIComponent(y)}.png?appid=${encodeURIComponent(owKey)}`;
        const owResp = await fetch(owUrl, { headers: { 'User-Agent': 'ski-conditions-aggregator/1.0' } });
        if (owResp.ok) {
          const ct = owResp.headers.get('content-type') || 'image/png';
          const respHeaders = new Headers();
          respHeaders.set('Content-Type', ct);
          respHeaders.set('Cache-Control', 'public, max-age=60');
          respHeaders.set('Access-Control-Allow-Origin', '*');
          respHeaders.set('X-Radar-Source', 'openweathermap');
          return new Response(owResp.body, { status: 200, headers: respHeaders });
        }
      }
    } catch (e) {}

    // If we reach here, no host returned a tile
    return NextResponse.json({ error: 'no_radar_tile_found' }, { status: 502 });
  } catch (e: any) {
    return NextResponse.json({ error: 'proxy_failed', message: String(e) }, { status: 500 });
  }
}


