#!/usr/bin/env node

/**
 * Radar Debugging Script
 * Tests radar API endpoints and provides detailed debugging information
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, options, (res) => {
      let data = '';

      console.log(`\n[${new Date().toISOString()}] ${res.statusCode} ${url}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Request failed: ${url}`, err.message);
      reject(err);
    });

    req.setTimeout(10000, () => {
      console.error(`Request timeout: ${url}`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testRadarFrames() {
  console.log('\n=== TESTING RADAR FRAMES API ===');

  try {
    const response = await makeRequest(`${BASE_URL}/api/radar/frames`);

    if (response.status !== 200) {
      console.error('❌ Frames API failed:', response.status);
      return false;
    }

    const frames = response.data;
    console.log(`✅ Got ${frames.length} frames`);

    if (frames.length === 0) {
      console.error('❌ No frames returned');
      return false;
    }

    // Check frame structure
    const firstFrame = frames[0];
    console.log('First frame structure:', {
      timestamp: firstFrame.timestamp,
      hasTimestamp: !!firstFrame.timestamp,
      hasValidTime: firstFrame.validTime instanceof Date || typeof firstFrame.validTime === 'string'
    });

    return true;
  } catch (error) {
    console.error('❌ Frames API error:', error.message);
    return false;
  }
}

async function testRadarTile() {
  console.log('\n=== TESTING RADAR TILE API ===');

  try {
    // First get frames to get a valid timestamp
    const framesResponse = await makeRequest(`${BASE_URL}/api/radar/frames`);
    if (framesResponse.status !== 200 || !framesResponse.data.length) {
      console.error('❌ Cannot test tile API - no frames available');
      return false;
    }

    const timestamp = framesResponse.data[0].timestamp;
    console.log(`Testing tile for timestamp: ${timestamp}`);

    // Test tile request
    const tileUrl = `${BASE_URL}/api/radar/tile?z=8&x=75&y=95&time=${encodeURIComponent(timestamp)}`;
    const tileResponse = await makeRequest(tileUrl);

    console.log(`Tile response status: ${tileResponse.status}`);
    console.log(`Content-Type: ${tileResponse.headers['content-type']}`);
    console.log(`Content-Length: ${tileResponse.headers['content-length']}`);

    if (tileResponse.status === 200) {
      console.log('✅ Tile API working');
      return true;
    } else {
      console.error('❌ Tile API failed:', tileResponse.status);
      console.error('Response data:', tileResponse.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Tile API error:', error.message);
    return false;
  }
}

async function testDebugPixel() {
  console.log('\n=== TESTING DEBUG PIXEL API ===');

  try {
    const response = await makeRequest(`${BASE_URL}/api/radar/debug-pixel`);

    console.log(`Debug pixel response status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);

    if (response.status === 200) {
      console.log('✅ Debug pixel API working');
      return true;
    } else {
      console.error('❌ Debug pixel API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Debug pixel API error:', error.message);
    return false;
  }
}

async function testDebugScreenshot() {
  console.log('\n=== TESTING DEBUG SCREENSHOT API ===');

  try {
    const response = await makeRequest(`${BASE_URL}/api/radar/debug-screenshot`);

    console.log(`Debug screenshot response status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);

    if (response.status === 200) {
      console.log('✅ Debug screenshot API working');
      return true;
    } else {
      console.error('❌ Debug screenshot API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Debug screenshot API error:', error.message);
    return false;
  }
}

async function checkServerHealth() {
  console.log('\n=== CHECKING SERVER HEALTH ===');

  try {
    const response = await makeRequest(`${BASE_URL}/api/scrape?resortId=stowe`);

    if (response.status === 200) {
      console.log('✅ Server is healthy - API responding');
      return true;
    } else {
      console.error('❌ Server health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Server health check error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Radar Debugging Tests');
  console.log('================================');

  const results = {
    server: await checkServerHealth(),
    frames: await testRadarFrames(),
    tile: await testRadarTile(),
    debugPixel: await testDebugPixel(),
    debugScreenshot: await testDebugScreenshot()
  };

  console.log('\n================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('================================');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });

  const allPassed = Object.values(results).every(Boolean);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed - check browser console for client-side issues'}`);

  if (!allPassed) {
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Open browser to http://localhost:3000');
    console.log('2. Open DevTools (F12)');
    console.log('3. Check Console tab for JavaScript errors');
    console.log('4. Check Network tab for failed radar requests');
    console.log('5. Look for CORS errors or 404s on radar endpoints');
  }

  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testRadarFrames, testRadarTile, testDebugPixel, testDebugScreenshot };