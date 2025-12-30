
import { NextResponse } from 'next/server';

// Example NOAA endpoints (public):
// MRMS tiled PNGs: https://mrms.ncep.noaa.gov/data/2D/PrecipRate/ (z/x/y.png)
// NEXRAD tiled: https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi (WMS)
// QPE tiled: https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms.cgi (WMS)

// For demo: Use Iowa State Mesonet for frame times (NEXRAD, MRMS, QPE)
const SOURCES = [
  {
    name: 'NEXRAD',
    url: 'https://mesonet.agron.iastate.edu/json/radar/nexrad_n0q.json',
    parse: (json: any) => (json && json.timestamps ? json.timestamps : [])
  },
  {
    name: 'MRMS',
    url: 'https://mesonet.agron.iastate.edu/json/radar/mrms_ref.json',
    parse: (json: any) => (json && json.timestamps ? json.timestamps : [])
  },
  {
    name: 'QPE',
    url: 'https://mesonet.agron.iastate.edu/json/radar/mrms_qpe.json',
    parse: (json: any) => (json && json.timestamps ? json.timestamps : [])
  }
];

export async function GET() {
  try {
    // Fetch all sources in parallel
    const results = await Promise.all(
      SOURCES.map(async (src) => {
        try {
          const res = await fetch(src.url);
          if (!res.ok) return [];
          const json = await res.json();
          return src.parse(json).map((t: string) => ({ time: t, source: src.name }));
        } catch {
          return [];
        }
      })
    );
    // Merge and deduplicate frames by time (ISO8601 or epoch seconds)
    const allFrames = ([] as any[]).concat(...results);
    // Sort descending (most recent first)
    allFrames.sort((a, b) => (a.time < b.time ? 1 : -1));
    // Remove duplicates (keep all sources for a time)
    const seen = new Set();
    const merged = allFrames.filter(f => {
      if (seen.has(f.time)) return false;
      seen.add(f.time);
      return true;
    });
    const response = NextResponse.json({ frames: merged });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'fetch_failed', message: String(e) }, { status: 500 });
  }
}
