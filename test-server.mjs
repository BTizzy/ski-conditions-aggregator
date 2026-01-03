#!/usr/bin/env node

// Simple Express server to test radar functionality
import express from 'express';
import { radarManager } from './app/api/radar/lib/radar-manager.ts';

const app = express();
const port = 3001;

app.get('/api/radar/frames', async (req, res) => {
  try {
    console.log('[Test Server] Fetching frames...');
    const frames = await radarManager.getFrames();
    const recentFrames = frames.slice(0, 288);

    res.json({
      radar: {
        past: recentFrames.map(frame => ({
          time: frame.time,
          url: frame.url,
          source: frame.source,
          coverage: frame.coverage,
          quality: frame.quality
        }))
      },
      frames: recentFrames
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/radar/tile/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const time = req.query.time;

    if (!time) {
      return res.status(400).json({ error: 'time parameter required' });
    }

    console.log(`[Test Server] Fetching tile ${z}/${x}/${y} at time ${time}`);

    // Find the frame for this time
    const frames = await radarManager.getFrames();
    const frame = frames.find(f => f.time.toString() === time);

    if (!frame) {
      return res.status(404).json({ error: 'Frame not found' });
    }

    const tile = await radarManager.getTile(frame, parseInt(z), parseInt(x), parseInt(y));

    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }

    res.set('Content-Type', 'image/png');
    res.send(tile);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});