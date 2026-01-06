"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { resorts } from '../lib/resorts';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ResortMap = dynamic(() => import('./components/ResortMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="text-blue-500 text-xl">Loading map...</div>
    </div>
  )
});

interface ResortConditions {
  resortId: string;
  timestamp: string;
  snowDepth: number;
  recentSnowfall: number;
  recentRainfall?: number;
  weeklySnowfall?: number;
  weeklyRainfall?: number;
  baseTemp: number;
  windSpeed: number;
  visibility: string;
  trailStatus: {
    open: number;
    total: number;
    groomed: number;
  };
  rawData: any;
}

function toResortConditions(resort: any): ResortConditions | null {
  if (!resort?.id || !resort?.conditions) return null;
  const c = resort.conditions;

  return {
    resortId: resort.id,
    timestamp: c.timestamp || new Date().toISOString(),
    snowDepth: c.snowDepth || 0,
    recentSnowfall: c.recentSnowfall || 0,
    recentRainfall: c.recentRainfall || 0,
    weeklySnowfall: c.weeklySnowfall || 0,
    weeklyRainfall: c.weeklyRainfall || 0,
    baseTemp: c.baseTemp || 20,
    windSpeed: c.windSpeed || 0,
    visibility: c.visibility || 'Unknown',
    trailStatus: {
      open: c.trailStatus?.open || 0,
      total: c.trailStatus?.total || 0,
      groomed: c.trailStatus?.groomed || 0,
    },
    rawData: c,
  };
}

const HomePage: React.FC = () => {
  const [data, setData] = useState<Record<string, ResortConditions | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatches by ensuring any text that depends on client-only
  // state (effects/network/etc.) is only rendered after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadConditions = async () => {
      // Mark all resorts as loading immediately (so UI can show a global loading state)
      const initialLoading: Record<string, boolean> = {};
      resorts.forEach(r => {
        initialLoading[r.id] = true;
      });
      setLoading(initialLoading);

      try {
        console.log('[Page] Fetching resort conditions via /api/resorts/conditions...');
        const res = await fetch('/api/resorts/conditions', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        if (!res.ok) {
          throw new Error(`Conditions API failed: ${res.status} ${res.statusText}`);
        }

        const apiData = await res.json();
        const list = apiData?.resorts || [];
        console.log('[Page] Got', list.length, 'resorts with conditions');

        const conditionsMap: Record<string, ResortConditions | null> = {};
        list.forEach((r: any) => {
          const parsed = toResortConditions(r);
          if (parsed) conditionsMap[r.id] = parsed;
        });

        // Set per-resort errors for any resort that didn't come back with conditions
        const errorMap: Record<string, string | null> = {};
        resorts.forEach(r => {
          if (!conditionsMap[r.id]) {
            errorMap[r.id] = 'No conditions data available';
          }
        });

        setData(conditionsMap);
        setError(errorMap);
      } catch (e: any) {
        console.error('[Page] Failed to load conditions:', e);
        setError(er => ({ ...er, global: e?.message || String(e) }));
      } finally {
        const doneLoading: Record<string, boolean> = {};
        resorts.forEach(r => {
          doneLoading[r.id] = false;
        });
        setLoading(doneLoading);
      }
    };

    loadConditions();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm 
                         border-b border-white/10 shadow-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">⛷️</div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text 
                               bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Ski Resort Conditions
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  Real-time weather & snowfall tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-white/90">
                  {resorts.length} Resorts
                </div>
                <div className="text-xs text-white/60">
                  {mounted && !error.global ? (
                    <span className="text-emerald-400">✓ {Object.keys(data).length} loaded</span>
                  ) : (
                    <span className="text-yellow-400 animate-pulse">● Loading...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Map */}
      <div className="flex-1 w-full relative">
        <ResortMap
          resorts={resorts}
          conditions={data}
          loading={loading}
          errors={error}
        />
      </div>
    </div>
  );
};

export default HomePage;
