"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { resorts } from '../lib/resorts';
import { FaSkiing, FaSnowboarding } from 'react-icons/fa';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ResortMap = dynamic(() => import('./components/ResortMap'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><div className="text-blue-500 text-xl">Loading map...</div></div>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-300 via-white to-blue-500 flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 p-6 text-center bg-white/10 backdrop-blur-sm rounded-lg mx-4 mt-4 shadow-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl tracking-tight flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <FaSkiing className="text-blue-300 drop-shadow-lg animate-bounce" />
          <span>Northeast Ski Resort Conditions</span>
          <FaSnowboarding className="text-blue-300 drop-shadow-lg animate-bounce" />
        </h1>
        <p className="text-blue-100 text-lg font-medium drop-shadow-lg">
          Interactive map showing real-time weather conditions
        </p>
      </header>

      {/* Status Bar */}
      <div className="relative z-10 px-4 py-2 text-center bg-white/20 backdrop-blur-sm text-blue-100 text-sm font-medium">
        <span>🗻 {resorts.length} resorts • {error.global ? `Error: ${error.global}` : 'Loading conditions…'}</span>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <ResortMap
          resorts={resorts}
          conditions={data}
          loading={loading}
          errors={error}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-blue-800 opacity-90 font-semibold drop-shadow-lg">
        <span>&copy; {new Date().getFullYear()} Ski Conditions Aggregator</span>
        <span className="block text-blue-400 text-sm mt-1">Designed for snow lovers &mdash; Feel the mountain vibes!</span>
      </footer>
    </div>
  );
};

export default HomePage;
