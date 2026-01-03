'use client';

import { useEffect } from 'react';
import { enableMCPDebugging } from '../lib/devtools';

export function DevToolsInitializer() {
  useEffect(() => {
    // Enable MCP server debugging and devtools integration
    enableMCPDebugging();

    // Add keyboard shortcut for exporting traces (Ctrl+Shift+D)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        console.log('🔧 Exporting performance trace...');
        // This would be called from the global window object
        if (typeof window !== 'undefined' && (window as any).__exportPerformanceTrace__) {
          (window as any).__exportPerformanceTrace__().then((trace: any) => {
            console.log('📊 Performance trace exported:', trace);
            // In a real implementation, this would send to MCP server
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // This component doesn't render anything
  return null;
}