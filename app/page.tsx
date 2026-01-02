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

const fetchConditions = async (resortId: string) => {
  const res = await fetch(`/api/scrape?resortId=${resortId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return res.json();
};

const HomePage: React.FC = () => {
  const [data, setData] = useState<Record<string, ResortConditions | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [radarDebug, setRadarDebug] = useState<any>(null);

  // Debug radar API
  useEffect(() => {
    const debugRadar = async () => {
      try {
        console.log('[Debug] Testing radar APIs...');
        const framesRes = await fetch('/api/radar/frames');
        if (framesRes.ok) {
          const framesData = await framesRes.json();
          console.log('[Debug] Frames API success:', framesData);

          if (framesData?.radar?.past?.length > 0) {
            const firstFrame = framesData.radar.past[0];
            const tileUrl = `/api/radar/tile?layer=${encodeURIComponent(firstFrame.url)}&z=7&x=37&y=45`;
            const tileRes = await fetch(tileUrl);
            console.log('[Debug] Tile API status:', tileRes.status);

            setRadarDebug({
              framesCount: framesData.radar.past.length,
              firstFrame: firstFrame,
              tileStatus: tileRes.status,
              tileUrl: tileUrl
            });
          }
        } else {
          console.error('[Debug] Frames API failed:', framesRes.status);
          setRadarDebug({ error: `Frames API failed: ${framesRes.status}` });
        }
      } catch (err) {
        console.error('[Debug] Radar debug error:', err);
        setRadarDebug({ error: err instanceof Error ? err.message : String(err) });
      }
    };

    debugRadar();
  }, []);

  useEffect(() => {
    // Load all resorts with proper rate limiting
    console.log(`Loading ${resorts.length} resorts with rate limiting...`);

    resorts.forEach((resort, index) => {
      setTimeout(() => {
        setLoading(l => ({ ...l, [resort.id]: true }));
        fetchConditions(resort.id)
          .then(cond => {
            console.log(`✅ Loaded ${resort.name}:`, cond);
            setData(d => ({ ...d, [resort.id]: cond }));
          })
          .catch(e => {
            console.error(`❌ Failed to load ${resort.name}:`, e.message);
            setError(er => ({ ...er, [resort.id]: e.message }));
          })
          .finally(() => setLoading(l => ({ ...l, [resort.id]: false })));
      }, index * 2000); // 2 second delay between each request to avoid overwhelming APIs
    });
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
        <span>🗻 {resorts.length} resorts • Loading conditions with 2-second rate limiting...</span>
      </div>

      {/* Radar Debug Panel */}
      {radarDebug && (
        <div className="relative z-10 mx-4 mb-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs font-mono">
          <div className="font-bold text-gray-800 mb-2">🔍 Radar Debug:</div>
          {radarDebug.error ? (
            <div className="text-red-600">❌ {radarDebug.error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-700">
              <div>📊 Frames: {radarDebug.framesCount || 'N/A'}</div>
              <div>🎯 Tile Status: {radarDebug.tileStatus || 'N/A'}</div>
              <div>🔗 First Frame: {radarDebug.firstFrame?.url?.substring(0, 20) || 'N/A'}...</div>
            </div>
          )}
        </div>
      )}

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
