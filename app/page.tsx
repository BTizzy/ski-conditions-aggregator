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
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const HomePage: React.FC = () => {
  const [data, setData] = useState<Record<string, ResortConditions | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    // Load all resorts with proper rate limiting
    console.log(`Loading ${resorts.length} resorts with rate limiting...`);

    resorts.forEach((resort, index) => {
      setTimeout(() => {
        setLoading(l => ({ ...l, [resort.id]: true }));
        fetchConditions(resort.id)
          .then(cond => setData(d => ({ ...d, [resort.id]: cond })))
          .catch(e => {
            console.error(`Failed to load ${resort.name}:`, e);
            setError(er => ({ ...er, [resort.id]: e.message }));
          })
          .finally(() => setLoading(l => ({ ...l, [resort.id]: false })));
      }, index * 2000); // 2 second delay between each request to avoid overwhelming APIs
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-300 via-white to-blue-500 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/ski-bg.jpg')] bg-cover bg-center opacity-20" />

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
