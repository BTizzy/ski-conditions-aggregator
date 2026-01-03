'use client';
import { useState } from 'react';
import { Search, Filter, TrendingDown } from 'lucide-react';

interface Resort {
  id: string;
  name: string;
  state: string;
  recentSnowfall: number;
  snowDepth: number;
  baseTemp: number;
}

export default function ResortSidebar({ resorts }: { resorts: Resort[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'snowfall' | 'name'>('snowfall');

  const filtered = resorts
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'snowfall') return b.recentSnowfall - a.recentSnowfall;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="fixed right-4 top-4 bottom-4 w-80
                    bg-white/10 backdrop-blur-xl rounded-2xl
                    border border-white/20 shadow-2xl overflow-hidden
                    flex flex-col z-[2000] pointer-events-auto">

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-bold text-lg mb-3">
          Resort Conditions
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search resorts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20
                       rounded-lg text-white placeholder-white/40
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortBy(s => s === 'snowfall' ? 'name' : 'snowfall')}
          className="text-xs text-white/60 hover:text-white flex items-center gap-1"
        >
          <Filter size={14} />
          Sort by: {sortBy === 'snowfall' ? 'Snowfall' : 'Name'}
        </button>
      </div>

      {/* Resort List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map(resort => (
          <div
            key={resort.id}
            className="p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-xl
                       border border-white/10 cursor-pointer
                       transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {resort.name}
                </h3>
                <p className="text-white/60 text-xs">{resort.state}</p>
              </div>
              <div className="text-blue-400 font-bold text-lg">
                {resort.recentSnowfall}"
              </div>
            </div>
            <div className="flex gap-3 text-xs text-white/60">
              <span>Base: {resort.snowDepth}"</span>
              <span>Temp: {resort.baseTemp}°F</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}