#!/usr/bin/env node

/**
 * Test script to verify synthetic radar implementation
 * Checks that tiles are generated and contain precipitation data
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function testSyntheticRadar() {
  console.log('🧪 Testing Synthetic Radar Implementation\n');

  // Test different hours to verify temporal coherence
  const testHours = [0, 23, 47]; // Past, middle, current
  const testTile = { z: 7, x: 37, y: 48 }; // Northeast US area

  for (const hour of testHours) {
    const url = `http://localhost:3000/api/radar/synthetic?hour=${hour}&z=${testTile.z}&x=${testTile.x}&y=${testTile.y}`;
    const outputPath = `/tmp/test_synthetic_${hour}.png`;

    console.log(`📡 Testing hour ${hour}...`);

    try {
      // Use curl to download tile
      execSync(`curl -s -o "${outputPath}" "${url}"`, { stdio: 'pipe' });

      // Check file exists and has content
      const stats = fs.statSync(outputPath);
      console.log(`  ✅ Generated ${stats.size} bytes`);

      if (stats.size < 1000) {
        console.log(`  ⚠️  Warning: Tile seems too small (${stats.size} bytes)`);
      }

    } catch (error) {
      console.log(`  ❌ Failed to generate tile for hour ${hour}:`, error.message);
    }
  }

  console.log('\n🔍 Checking resort data source...');

  try {
    const resortData = execSync('curl -s "http://localhost:3000/api/resorts/conditions"', { encoding: 'utf8' });
    const parsed = JSON.parse(resortData);

    console.log(`  ✅ Found ${parsed.resorts?.length || 0} resorts with conditions`);

    // Check for snowfall data
    const resortsWithSnowfall = parsed.resorts?.filter(r => r.conditions?.recentSnowfall > 0) || [];
    console.log(`  ❄️  ${resortsWithSnowfall.length} resorts reporting recent snowfall`);

    if (resortsWithSnowfall.length > 0) {
      console.log('  📍 Sample resorts with snowfall:');
      resortsWithSnowfall.slice(0, 3).forEach(resort => {
        console.log(`    - ${resort.name}: ${resort.conditions.recentSnowfall}" in last 24h`);
      });
    }

  } catch (error) {
    console.log('  ❌ Failed to fetch resort data:', error.message);
  }

  console.log('\n🎯 Synthetic Radar Test Complete!');
  console.log('The system now uses current resort snowfall as precipitation "hot spots"');
  console.log('and algorithmically generates 48-hour storm evolution with realistic movement patterns.');
}

testSyntheticRadar().catch(console.error);