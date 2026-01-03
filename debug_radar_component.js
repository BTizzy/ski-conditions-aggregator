import React, { useEffect, useState } from 'react';

export default function RadarDebug() {
  const [frames, setFrames] = useState(null);
  const [tileTest, setTileTest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testRadar() {
      try {
        console.log('Testing radar frames API...');
        const framesRes = await fetch('/api/radar/frames');
        if (!framesRes.ok) throw new Error(`Frames API failed: ${framesRes.status}`);
        const framesData = await framesRes.json();
        console.log('Frames data:', framesData);
        setFrames(framesData);

        if (framesData?.radar?.past?.length > 0) {
          const firstFrame = framesData.radar.past[0];
          console.log('First frame:', firstFrame);

          const tileUrl = `/api/radar/tile?layer=${encodeURIComponent(firstFrame.url)}&z=7&x=37&y=45`;
          console.log('Testing tile URL:', tileUrl);

          const tileRes = await fetch(tileUrl);
          console.log('Tile response status:', tileRes.status);
          console.log('Tile response headers:', Object.fromEntries(tileRes.headers.entries()));

          if (tileRes.ok) {
            const blob = await tileRes.blob();
            console.log('Tile blob size:', blob.size, 'type:', blob.type);
            setTileTest({ status: tileRes.status, size: blob.size, type: blob.type });
          } else {
            const text = await tileRes.text();
            console.error('Tile API error:', text);
            setTileTest({ status: tileRes.status, error: text });
          }
        }
      } catch (err) {
        console.error('Radar test error:', err);
        setError(err.message);
      }
    }

    testRadar();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Radar Debug Component</h1>

      {error && (
        <div style={{ color: 'red', margin: '10px 0', padding: '10px', border: '1px solid red' }}>
          Error: {error}
        </div>
      )}

      {frames && (
        <div style={{ margin: '10px 0', padding: '10px', border: '1px solid green', background: '#f0f8f0' }}>
          <h3>Frames API Response:</h3>
          <pre>{JSON.stringify(frames, null, 2)}</pre>
        </div>
      )}

      {tileTest && (
        <div style={{ margin: '10px 0', padding: '10px', border: '1px solid blue', background: '#f0f8ff' }}>
          <h3>Tile API Test:</h3>
          <pre>{JSON.stringify(tileTest, null, 2)}</pre>
        </div>
      )}

      {!frames && !error && (
        <div>Loading...</div>
      )}
    </div>
  );
}