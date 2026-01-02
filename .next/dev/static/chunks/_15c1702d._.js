(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/devtools.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Next.js DevTools Integration for MCP Server and Enhanced Debugging
// This file provides utilities for runtime debugging and trace sharing
__turbopack_context__.s([
    "enableMCPDebugging",
    ()=>enableMCPDebugging,
    "exportPerformanceTrace",
    ()=>exportPerformanceTrace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
async function exportPerformanceTrace(options = {}) {
    const { includeResourceContent = true, includeSourceMaps = true, includePerformanceMetrics = true, duration = 30000 // 30 seconds
     } = options;
    // Start performance observer
    const observer = new PerformanceObserver((list)=>{
    // Collect performance entries
    });
    observer.observe({
        entryTypes: [
            'navigation',
            'resource',
            'measure',
            'paint'
        ]
    });
    // Wait for specified duration to collect data
    await new Promise((resolve)=>setTimeout(resolve, duration));
    // Collect resources
    const resources = performance.getEntriesByType('resource').map((entry)=>({
            url: entry.name,
            size: entry.transferSize || 0,
            type: entry.initiatorType,
            duration: entry.duration
        }));
    // Collect navigation timing
    const navigation = performance.getEntriesByType('navigation')[0];
    // Collect paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const trace = {
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
        networkRequests: resources.map((r)=>({
                url: r.url,
                method: 'GET',
                status: 200,
                duration: r.duration,
                size: r.size
            }))
    };
    observer.disconnect();
    return trace;
}
/**
 * Collect resource content for trace sharing
 */ async function collectResourceContent(resources) {
    const resourcesWithContent = await Promise.all(resources.map(async (resource)=>{
        try {
            // Only collect content for text-based resources
            if (resource.type === 'script' || resource.type === 'link' || resource.url.includes('.js') || resource.url.includes('.css')) {
                const response = await fetch(resource.url);
                const content = await response.text();
                return {
                    ...resource,
                    content
                };
            }
            return resource;
        } catch (error) {
            console.warn(`Failed to collect content for ${resource.url}:`, error);
            return resource;
        }
    }));
    return resourcesWithContent;
}
/**
 * Collect source maps for enhanced debugging
 */ async function collectSourceMaps() {
    const sourceMaps = {};
    // Find all script tags with source maps
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts){
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
 */ function getFirstContentfulPaint() {
    const paint = performance.getEntriesByType('paint').find((entry)=>entry.name === 'first-contentful-paint');
    return paint ? paint.startTime : 0;
}
function getLargestContentfulPaint() {
    // LCP would need additional setup with PerformanceObserver
    return 0; // Placeholder
}
function getCumulativeLayoutShift() {
    // CLS would need additional setup with PerformanceObserver
    return 0; // Placeholder
}
function getFirstInputDelay() {
    // FID would need additional setup with PerformanceObserver
    return 0; // Placeholder
}
function enableMCPDebugging() {
    if ("TURBOPACK compile-time truthy", 1) {
        // Add global debugging utilities
        window.__MCP_DEBUG_ENABLED__ = true;
        window.__exportPerformanceTrace__ = exportPerformanceTrace;
        console.log('🔧 MCP Server debugging enabled');
        console.log('📊 Use window.__exportPerformanceTrace__() to export traces');
        console.log('🐛 Chrome DevTools integration active');
    }
}
// Auto-enable debugging in development
if ("TURBOPACK compile-time truthy", 1) {
    enableMCPDebugging();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DevToolsInitializer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DevToolsInitializer",
    ()=>DevToolsInitializer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$devtools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/devtools.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function DevToolsInitializer() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DevToolsInitializer.useEffect": ()=>{
            // Enable MCP server debugging and devtools integration
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$devtools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enableMCPDebugging"])();
            // Add keyboard shortcut for exporting traces (Ctrl+Shift+D)
            const handleKeyDown = {
                "DevToolsInitializer.useEffect.handleKeyDown": (event)=>{
                    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                        event.preventDefault();
                        console.log('🔧 Exporting performance trace...');
                        // This would be called from the global window object
                        if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.__exportPerformanceTrace__) {
                            window.__exportPerformanceTrace__().then({
                                "DevToolsInitializer.useEffect.handleKeyDown": (trace)=>{
                                    console.log('📊 Performance trace exported:', trace);
                                // In a real implementation, this would send to MCP server
                                }
                            }["DevToolsInitializer.useEffect.handleKeyDown"]);
                        }
                    }
                }
            }["DevToolsInitializer.useEffect.handleKeyDown"];
            document.addEventListener('keydown', handleKeyDown);
            return ({
                "DevToolsInitializer.useEffect": ()=>document.removeEventListener('keydown', handleKeyDown)
            })["DevToolsInitializer.useEffect"];
        }
    }["DevToolsInitializer.useEffect"], []);
    // This component doesn't render anything
    return null;
}
_s(DevToolsInitializer, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = DevToolsInitializer;
var _c;
__turbopack_context__.k.register(_c, "DevToolsInitializer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_15c1702d._.js.map