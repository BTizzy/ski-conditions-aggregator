'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RadarControls to reduce initial bundle size
const RadarControls = dynamic(() => import('./RadarControls'), {
  loading: () => <div className="animate-pulse bg-gray-700 h-16 rounded-lg"></div>
});

interface RadarOverlayProps {
  map: any; // Leaflet map instance
  radarFramesAvailable: boolean;
  setRadarFramesAvailable: (available: boolean) => void;
  loadingStatus: string;
  setLoadingStatus: (status: string) => void;
  framesReloadKey: number;
}

export default function RadarOverlay({
  map,
  radarFramesAvailable,
  setRadarFramesAvailable,
  loadingStatus,
  setLoadingStatus,
  framesReloadKey
}: RadarOverlayProps) {
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarSpeedMs, setRadarSpeedMs] = useState(1500);
  const [radarOpacity, setRadarOpacity] = useState(0.6);
  const [radarVisible, setRadarVisible] = useState(true);
  const [radarMode, setRadarMode] = useState<'synthetic' | 'live'>('synthetic');
  const [radarSource, setRadarSource] = useState('synthetic');
  const [highlightPrecip, setHighlightPrecip] = useState(false);
  const [currentFrameTime, setCurrentFrameTime] = useState<number | null>(null);

  const radarFramesRef = useRef<Array<{ url: string; time?: number }>>([]);
  const radarIndexRef = useRef(0);
  const radarPlayingRef = useRef(true);
  const tileBitmapCache = useRef(new Map<string, ImageBitmap>());
  const frameCanvasCache = useRef(new Map<string, HTMLCanvasElement>());
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Radar functionality will be implemented here
  // This is a placeholder for the extracted radar logic

  return (
    <>
      {radarFramesAvailable && (
        <Suspense fallback={<div className="animate-pulse bg-gray-700 h-16 rounded-lg"></div>}>
          <RadarControls
            isPlaying={radarPlaying}
            onPlayPause={() => setRadarPlaying(!radarPlaying)}
            opacity={radarOpacity}
            onOpacityChange={setRadarOpacity}
            speed={radarSpeedMs}
            onSpeedChange={setRadarSpeedMs}
            frameCount={radarFramesRef.current.length}
            currentFrame={Math.floor(radarIndexRef.current) + 1}
            radarSource={radarSource}
            isVisible={radarVisible}
            onVisibilityChange={setRadarVisible}
            onStepPrev={() => {/* TODO: implement */}}
            onStepNext={() => {/* TODO: implement */}}
            onRefresh={() => {/* TODO: implement */}}
            onScrub={() => {/* TODO: implement */}}
            onSourceChange={() => {/* TODO: implement */}}
            onJumpStart={() => {/* TODO: implement */}}
            onJumpEnd={() => {/* TODO: implement */}}
            highlightPrecip={highlightPrecip}
            onHighlightChange={setHighlightPrecip}
            currentFrameTime={currentFrameTime}
          />
        </Suspense>
      )}
    </>
  );
}