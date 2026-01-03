#!/usr/bin/env node

// Simple test script for radar manager
import { radarManager } from './app/api/radar/lib/radar-manager.ts';

async function testRadarManager() {
  console.log('Testing radar manager...');

  try {
    const frames = await radarManager.getFrames();
    console.log(`✅ Fetched ${frames.length} frames`);

    if (frames.length > 0) {
      console.log('Sample frame:', frames[0]);
    }

    const sources = radarManager.getSourceInfo();
    console.log('Sources:', sources);

    console.log('✅ Radar manager test passed!');
  } catch (error) {
    console.error('❌ Radar manager test failed:', error);
  }
}

testRadarManager();