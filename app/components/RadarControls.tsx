'use client';
import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight, RefreshCw, Eye, EyeOff } from 'lucide-react';

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
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onRefresh: () => void;
  onScrub: (frame: number) => void;
  onSourceChange: (source: string) => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  highlightPrecip: boolean;
  onHighlightChange: (highlight: boolean) => void;
  currentFrameTime: number | null;
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
  radarSource,
  isVisible,
  onVisibilityChange,
  onStepPrev,
  onStepNext,
  onRefresh,
  onScrub,
  onSourceChange,
  onJumpStart,
  onJumpEnd,
  highlightPrecip,
  onHighlightChange,
  currentFrameTime
}: RadarControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] pointer-events-auto
                    bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl
                    border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 min-w-[500px] max-w-[600px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="text-white font-bold text-sm tracking-wide">
            {radarSource === 'synthetic' ? '🧪 Synthetic Radar' : '🛰️ Live Radar'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onVisibilityChange(!isVisible)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                       transition-all duration-200 active:scale-95"
            title={isVisible ? 'Hide Radar' : 'Show Radar'}
          >
            {isVisible ? <Eye size={16} className="text-white/80" /> : <EyeOff size={16} className="text-white/50" />}
          </button>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                       transition-all duration-200 active:scale-95 hover:rotate-180"
            title="Refresh Radar"
          >
            <RefreshCw size={16} className="text-white/80 transition-transform duration-500" />
          </button>
          <span className="text-white/70 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            {currentFrame}/{frameCount}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onJumpStart}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                     transition-all duration-200 active:scale-95"
          title="Jump to Start"
        >
          <ChevronsLeft size={18} className="text-white/80" />
        </button>
        <button
          onClick={onStepPrev}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                     transition-all duration-200 active:scale-95"
          title="Previous Frame"
        >
          <SkipBack size={18} className="text-white/80" />
        </button>
        
        {/* Play/Pause Button */}
        <button
          data-testid="radar-play-pause"
          onClick={onPlayPause}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600
                     hover:from-blue-600 hover:to-purple-700
                     text-white font-bold py-2.5 px-6 rounded-lg
                     flex items-center justify-center gap-2
                     transition-all duration-200 shadow-lg hover:shadow-xl
                     active:scale-95 border border-white/20"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={onStepNext}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                     transition-all duration-200 active:scale-95"
          title="Next Frame"
        >
          <SkipForward size={18} className="text-white/80" />
        </button>
        <button
          onClick={onJumpEnd}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                     transition-all duration-200 active:scale-95"
          title="Jump to End"
        >
          <ChevronsRight size={18} className="text-white/80" />
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* Opacity Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/90 text-xs font-bold tracking-wide">
              Opacity
            </label>
            <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <input
            data-testid="radar-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none border border-white/10
                       cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-emerald-400
                       [&::-webkit-slider-thumb]:to-blue-500
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:shadow-emerald-400/50
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-webkit-slider-thumb]:transition-transform"
          />
        </div>

        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/90 text-xs font-bold tracking-wide">
              Speed
            </label>
            <span className="text-purple-400 text-xs font-mono font-bold bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
              {(2000 - speed)}ms
            </span>
          </div>
          <input
            data-testid="radar-speed"
            type="range"
            min="100"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none border border-white/10
                       cursor-pointer [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-purple-400
                       [&::-webkit-slider-thumb]:to-pink-500
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:shadow-purple-400/50
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-webkit-slider-thumb]:transition-transform"
          />
        </div>
      </div>
    </div>
  );
}