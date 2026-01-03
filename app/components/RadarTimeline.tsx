"use client";

import React from 'react';

interface RadarTimelineProps {
  frames: Array<{ time?: number; url: string }>;
  currentFrameIndex: number;
  isPlaying: boolean;
  onFrameSelect: (index: number) => void;
  onPlayPause: () => void;
}

const RadarTimeline: React.FC<RadarTimelineProps> = ({
  frames,
  currentFrameIndex,
  isPlaying,
  onFrameSelect,
  onPlayPause,
}) => {
  // Filter out frames without time
  const validFrames = frames.filter(frame => frame.time != null);
  if (validFrames.length === 0) return null;

  const currentFrame = validFrames[currentFrameIndex] || validFrames[0];
  const startTime = validFrames[0]?.time || 0;
  const endTime = validFrames[validFrames.length - 1]?.time || 0;
  const totalDuration = endTime - startTime;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffHours = Math.floor((now - timestamp) / (1000 * 60 * 60));

    if (diffHours === 0) return 'Now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const getProgress = () => {
    if (totalDuration === 0 || !currentFrame.time) return 0;
    return ((currentFrame.time - startTime) / totalDuration) * 100;
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / rect.width;
    const targetTime = startTime + (progress * totalDuration);

    // Find the closest frame
    let closestIndex = 0;
    let minDiff = Math.abs((validFrames[0]?.time || 0) - targetTime);

    validFrames.forEach((frame, index) => {
      if (!frame.time) return;
      const diff = Math.abs(frame.time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    onFrameSelect(closestIndex);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 max-w-md border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 font-bold text-lg shadow-md ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            title={isPlaying ? 'Pause radar animation' : 'Play radar animation'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="text-sm font-semibold text-gray-800">
            Radar: <span className="text-blue-600 font-bold">
              {currentFrame.time ? formatTime(currentFrame.time) : 'Unknown'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {frames.length} frames • {Math.round(totalDuration / (1000 * 60 * 60))}h range
        </div>
      </div>

      {/* Timeline */}
      <div
        className="relative h-3 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors shadow-inner"
        onClick={handleTimelineClick}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 shadow-md"
          style={{ width: `${getProgress()}%` }}
        />

        {/* Current position indicator */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:scale-110 transition-transform"
          style={{ left: `${getProgress()}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* Frame markers */}
        <div className="absolute inset-0 flex items-center">
          {validFrames.map((frame, index) => {
            if (!frame.time) return null;
            const position = totalDuration > 0 ? ((frame.time - startTime) / totalDuration) * 100 : 0;
            return (
              <div
                key={index}
                className="absolute w-1 h-2 bg-blue-400 rounded-full opacity-60 hover:opacity-100 hover:h-3 transition-all"
                style={{ left: `${position}%` }}
                title={formatTime(frame.time)}
              />
            );
          })}
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>
    </div>
  );
};

export default RadarTimeline;