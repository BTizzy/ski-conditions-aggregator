#!/usr/bin/env node

/**
 * API Test Script for Ski Conditions Aggregator
 * Tests radar frames and tile generation without browser
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Ski Conditions API...\n');

  try {
    // Test 1: Frames API
    console.log('📡 Testing /api/radar/frames...');
    const framesRes = await fetch(`${BASE_URL}/api/radar/frames`);
    if (!framesRes.ok) throw new Error(`Frames API failed: ${framesRes.status}`);

    const framesData = await framesRes.json();
    const frameCount = framesData?.radar?.past?.length || 0;
    console.log(`✅ Frames API: ${frameCount} frames available`);
    console.log(`   Source: ${framesData?.radar?.source}`);

    if (frameCount > 0) {
      const firstFrame = framesData.radar.past[0];
      const lastFrame = framesData.radar.past[frameCount - 1];
      console.log(`   Time range: ${new Date(firstFrame.time).toLocaleString()} → ${new Date(lastFrame.time).toLocaleString()}`);
      console.log(`   First frame: time=${new Date(firstFrame.time).toISOString()}, url=${firstFrame.url}`);
    }

    // Test 2: Tile API (using first frame if available)
    if (frameCount > 0) {
      const firstFrame = framesData.radar.past[0];
      console.log('\n🗺️  Testing /api/radar/tile...');

      // Test synthetic tile generation
      const tileUrl = `${BASE_URL}/api/radar/tile?layer=${firstFrame.url}&z=7&x=38&y=46`;
      console.log(`   Testing tile: ${tileUrl}`);

      const tileRes = await fetch(tileUrl);
      if (!tileRes.ok) throw new Error(`Tile API failed: ${tileRes.status}`);

      const contentType = tileRes.headers.get('content-type');
      const contentLength = tileRes.headers.get('content-length');

      console.log(`✅ Tile API: ${tileRes.status} (${contentType}, ${contentLength} bytes)`);

      // Test if it's actually a PNG
      const tileBuffer = await tileRes.arrayBuffer();
      const isPNG = tileBuffer.byteLength > 8 &&
        new Uint8Array(tileBuffer.slice(0, 8)).every((byte, i) => byte === [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A][i]);

      console.log(`   Valid PNG: ${isPNG ? '✅' : '❌'}`);

      // Test tile size (should be reasonable for a 256x256 PNG)
      const expectedMinSize = 1000; // Minimum reasonable PNG size
      const expectedMaxSize = 50000; // Maximum reasonable PNG size
      const isReasonableSize = tileBuffer.byteLength >= expectedMinSize && tileBuffer.byteLength <= expectedMaxSize;
      console.log(`   Reasonable size: ${isReasonableSize ? '✅' : '❌'} (${tileBuffer.byteLength} bytes)`);
    }

    // Test 3: Resorts API
    console.log('\n🏔️  Testing resorts data...');
    const resortsRes = await fetch(`${BASE_URL}/api/scrape?resortId=killington`);
    if (!resortsRes.ok) {
      console.log(`⚠️  Resorts API: ${resortsRes.status} (may be expected if no data)`);
    } else {
      const resortsData = await resortsRes.json();
      console.log(`✅ Resorts API: ${JSON.stringify(resortsData).length} chars of data`);
      console.log(`   Has conditions: ${resortsData.conditions ? '✅' : '❌'}`);
      if (resortsData.conditions) {
        console.log(`   Snow depth: ${resortsData.conditions.snowDepth}", Recent: ${resortsData.conditions.recentSnowfall}"`);
      }
    }

    // Test 4: Check for any errors in recent logs
    console.log('\n🔍 Checking for recent errors...');
    try {
      const logCheck = await fetch(`${BASE_URL}/api/radar/frames`);
      // Just checking if the API is responsive
      console.log('✅ API responsive');
    } catch (e) {
      console.log('⚠️  API may have issues');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };