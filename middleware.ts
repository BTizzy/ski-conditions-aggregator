import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for intelligent HTTP caching
 * 
 * Strategy:
 * 1. /api/resorts/conditions -> 60 second public cache
 * 2. /api/radar/frames -> 60 second public cache
 * 3. /api/scrape -> no cache (always fresh)
 * 4. /api/data/sync -> no cache (always fresh)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set cache headers based on endpoint
  const response = NextResponse.next();

  if (pathname === '/api/resorts/conditions') {
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'max-age=60');
  } else if (pathname === '/api/radar/frames') {
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    response.headers.set('CDN-Cache-Control', 'max-age=60');
  } else if (pathname.startsWith('/api/scrape') || pathname === '/api/data/sync') {
    // Never cache these
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  return response;
}

export const config = {
  matcher: ['/api/:path*']
};
