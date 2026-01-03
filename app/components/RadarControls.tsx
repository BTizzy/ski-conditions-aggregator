'use client';
import { useState } from 'react';
import { Play, Pause, Settings } from 'lucide-react';

interface RadarControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  frameCount: number;
  currentFrame: number;
  radarSource: string;
}

export default function RadarControls({
  isPlaying,
  onPlayPause,
  opacity,
  onOpacityChange,
  speed,
  onSpeedChange,
  frameCount,
  currentFrame,
  radarSource
}: RadarControlsProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                    bg-white/10 backdrop-blur-xl rounded-2xl
                    border border-white/20 shadow-2xl p-6 min-w-[400px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-semibold text-sm">
            {radarSource === 'synthetic' ? '🧪 Synthetic Radar' : '🛰️ Live Radar'}
          </span>
        </div>
        <span className="text-white/60 text-xs font-mono">
          {currentFrame}/{frameCount}
        </span>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-600
                   hover:from-blue-600 hover:to-purple-700
                   text-white font-bold py-3 px-6 rounded-xl
                   flex items-center justify-center gap-2
                   transition-all duration-200 shadow-lg hover:shadow-xl
                   active:scale-95"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {isPlaying ? 'Pause' : 'Play'} Animation
      </button>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* Opacity Control */}
        <div>
          <label className="text-white/80 text-xs font-semibold mb-2 block">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none
                       cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-blue-400
                       [&::-webkit-slider-thumb]:to-purple-500
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="text-white/60 text-xs mt-1 text-center">
            {Math.round(opacity * 100)}%
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <label className="text-white/80 text-xs font-semibold mb-2 block">
            Speed
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none
                       cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-green-400
                       [&::-webkit-slider-thumb]:to-blue-500
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="text-white/60 text-xs mt-1 text-center">
            {(2000 - speed)}ms
          </div>
        </div>
      </div>
    </div>
  );
}