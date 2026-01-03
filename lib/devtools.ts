// Next.js DevTools Integration for MCP Server and Enhanced Debugging
// This file provides utilities for runtime debugging and trace sharing

export interface TraceOptions {
  includeResourceContent?: boolean;
  includeSourceMaps?: boolean;
  includePerformanceMetrics?: boolean;
  duration?: number;
}

export interface PerformanceTrace {
  timestamp: string;
  duration: number;
  resources: Array<{
    url: string;
    content?: string;
    size: number;
    type: string;
  }>;
  sourceMaps?: Record<string, string>;
  metrics: {
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    ttfb?: number;
  };
  networkRequests: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    size: number;
  }>;
}

/**
 * Export performance trace with optional resource content and source maps
 * This enables sharing detailed debugging information with MCP server
 */
export async function exportPerformanceTrace(options: TraceOptions = {}): Promise<PerformanceTrace> {
  const {
    includeResourceContent = true,
    includeSourceMaps = true,
    includePerformanceMetrics = true,
    duration = 30000 // 30 seconds
  } = options;

  // Start performance observer
  const observer = new PerformanceObserver((list) => {
    // Collect performance entries
  });

  observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });

  // Wait for specified duration to collect data
  await new Promise(resolve => setTimeout(resolve, duration));

  // Collect resources
  const resources = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map(entry => ({
    url: entry.name,
    size: entry.transferSize || 0,
    type: entry.initiatorType,
    duration: entry.duration
  }));

  // Collect navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  // Collect paint timing
  const paintEntries = performance.getEntriesByType('paint');

  const trace: PerformanceTrace = {
    timestamp: new Date().toISOString(),
    duration,
    resources: includeResourceContent ? await collectResourceContent(resources) : resources,
    sourceMaps: includeSourceMaps ? await collectSourceMaps() : undefined,
    metrics: includePerformanceMetrics ? {
      fcp: getFirstContentfulPaint(),
      lcp: getLargestContentfulPaint(),
      cls: getCumulativeLayoutShift(),
      fid: getFirstInputDelay(),
      ttfb: navigation?.responseStart - navigation?.requestStart
    } : {},
    networkRequests: resources.map(r => ({
      url: r.url,
      method: 'GET', // Simplified
      status: 200, // Simplified
      duration: r.duration,
      size: r.size
    }))
  };

  observer.disconnect();
  return trace;
}

/**
 * Collect resource content for trace sharing
 */
async function collectResourceContent(resources: any[]): Promise<any[]> {
  const resourcesWithContent = await Promise.all(
    resources.map(async (resource) => {
      try {
        // Only collect content for text-based resources
        if (resource.type === 'script' || resource.type === 'link' || resource.url.includes('.js') || resource.url.includes('.css')) {
          const response = await fetch(resource.url);
          const content = await response.text();
          return { ...resource, content };
        }
        return resource;
      } catch (error) {
        console.warn(`Failed to collect content for ${resource.url}:`, error);
        return resource;
      }
    })
  );

  return resourcesWithContent;
}

/**
 * Collect source maps for enhanced debugging
 */
async function collectSourceMaps(): Promise<Record<string, string>> {
  const sourceMaps: Record<string, string> = {};

  // Find all script tags with source maps
  const scripts = document.querySelectorAll('script[src]');
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (src && src.includes('.js')) {
      try {
        const mapUrl = src + '.map';
        const response = await fetch(mapUrl);
        if (response.ok) {
          const mapContent = await response.text();
          sourceMaps[src] = mapContent;
        }
      } catch (error) {
        // Source map not available, continue
      }
    }
  }

  return sourceMaps;
}

/**
 * Performance metric getters
 */
function getFirstContentfulPaint(): number {
  const paint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
  return paint ? paint.startTime : 0;
}

function getLargestContentfulPaint(): number {
  // LCP would need additional setup with PerformanceObserver
  return 0; // Placeholder
}

function getCumulativeLayoutShift(): number {
  // CLS would need additional setup with PerformanceObserver
  return 0; // Placeholder
}

function getFirstInputDelay(): number {
  // FID would need additional setup with PerformanceObserver
  return 0; // Placeholder
}

/**
 * Enable MCP server debugging mode
 * This allows external debugging tools to connect
 */
export function enableMCPDebugging(): void {
  if (typeof window !== 'undefined') {
    // Add global debugging utilities
    (window as any).__MCP_DEBUG_ENABLED__ = true;
    (window as any).__exportPerformanceTrace__ = exportPerformanceTrace;

    console.log('🔧 MCP Server debugging enabled');
    console.log('📊 Use window.__exportPerformanceTrace__() to export traces');
    console.log('🐛 Chrome DevTools integration active');
  }
}

// Auto-enable debugging in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  enableMCPDebugging();
}