"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiClient } from '../lib/api-client';
import { resorts } from '../lib/resorts';

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
  baseTemp: number;
  windSpeed: number;
  visibility: string;
  dataAge: number;
}

const HomePage: React.FC = () => {
  const [data, setData] = useState<Record<string, ResortConditions | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load conditions on mount with caching
  useEffect(() => {
    if (!mounted) return;

    const loadConditions = async () => {
      try {
        setLoading(true);
        console.log('[HomePage] Loading conditions with cache...');

        // This returns cached data immediately and fetches fresh in background
        const conditions = await apiClient.getResortConditions();

        console.log('[HomePage] Got', conditions.length, 'resort conditions');

        // Build map of resort data
        const conditionsMap: Record<string, ResortConditions | null> = {};
        resorts.forEach(resort => {
          const condition = conditions.find(c => c.resortId === resort.id);
          if (condition) {
            conditionsMap[resort.id] = {
              resortId: condition.resortId,
              timestamp: condition.conditions.timestamp,
              snowDepth: condition.conditions.snowDepth,
              recentSnowfall: condition.conditions.recentSnowfall,
              baseTemp: condition.conditions.baseTemp,
              windSpeed: condition.conditions.windSpeed,
              visibility: condition.conditions.visibility,
              dataAge: condition.conditions.dataAge || 0
            };
          } else {
            conditionsMap[resort.id] = null;
          }
        });

        setData(conditionsMap);
        setLastSync(new Date());
        setError(null);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[HomePage] Error loading conditions:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadConditions();

    // Auto-sync every 5 minutes
    const syncInterval = setInterval(() => {
      console.log('[HomePage] Auto-syncing data...');
      apiClient.syncData().catch(console.error);
    }, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ski Conditions Aggregator</h1>
            <p className="text-gray-400 text-sm">
              {loading ? 'Loading...' : `${Object.keys(data).length} resorts tracked`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastSync && (
              <div className="text-right">
                <p className="text-gray-300 text-sm">Last sync</p>
                <p className="text-gray-500 text-xs">{lastSync.toLocaleTimeString()}</p>
              </div>
            )}

            <button
              onClick={() => {
                console.log('[HomePage] Manual sync triggered');
                apiClient.syncData().catch(console.error);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Sync Now
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-500 text-red-300 text-sm rounded">
            {error}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <ResortMap conditions={data} />
        </div>

        {/* Stats Sidebar */}
        <aside className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Cache Status</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Strategy</p>
                <p className="text-green-400">Stale-while-revalidate</p>
              </div>

              <div>
                <p className="text-gray-400">Conditions TTL</p>
                <p className="text-gray-300">5 minutes</p>
              </div>

              <div>
                <p className="text-gray-400">Auto-sync</p>
                <p className="text-gray-300">Every 5 minutes</p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-2">Loaded: {Object.keys(data).length}</p>
                <p className="text-gray-400 text-xs">Errors: {Object.values(data).filter(d => !d).length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
