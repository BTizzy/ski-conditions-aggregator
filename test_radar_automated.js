/**
 * Comprehensive Radar Quality Testing Script
 * Detailed frame-by-frame analysis and diagnostics
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

class ComprehensiveRadarTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.issues = [];
    this.testResults = {
      connectivity: false,
      frames: [],
      frameStats: {
        total: 0,
        nexrad: 0,
        synthetic: 0,
        working: 0,
        failed: 0,
        slow: 0
      },
      tileStats: {
        totalTests: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        errors: []
      },
      quality: {
        patternEvolution: 0,
        spatialCoherence: 0,
        temporalSmoothness: 0
      }
    };
  }

  async runComprehensiveTests() {
    console.log('🔬 COMPREHENSIVE RADAR QUALITY ANALYSIS\n');

    try {
      // Phase 1: Server connectivity
      console.log('📡 Phase 1: Server Connectivity');
      await this.testConnectivity();

      // Phase 2: Frame-by-frame analysis
      console.log('\n🎬 Phase 2: Frame-by-Frame Analysis');
      const frames = await this.testAllFrames();

      // Phase 3: Tile generation stress test
      console.log('\n🗺️  Phase 3: Tile Generation Stress Test');
      await this.testTileGenerationStress(frames);

      // Phase 4: Pattern quality analysis
      console.log('\n🎨 Phase 4: Pattern Quality Analysis');
      await this.testPatternQuality(frames);

      // Phase 5: Performance profiling
      console.log('\n⚡ Phase 5: Performance Profiling');
      await this.testPerformanceProfiling(frames);

      // Phase 6: Error diagnostics
      console.log('\n🚨 Phase 6: Error Diagnostics');
      await this.testErrorDiagnostics();

      // Generate comprehensive report
      this.generateComprehensiveReport();

    } catch (error) {
      console.error('❌ Comprehensive test suite failed:', error.message);
      this.issues.push(`Test suite failure: ${error.message}`);
      this.generateComprehensiveReport();
    }
  }

  async testConnectivity() {
    try {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/api/radar/frames`, { timeout: 5000 });
      const duration = Date.now() - start;

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      this.testResults.connectivity = true;
      console.log(`✅ Server responding (${duration}ms)`);

    } catch (error) {
      this.issues.push(`Server connection failed: ${error.message}`);
      throw error;
    }
  }

  async testAllFrames() {
    const response = await fetch(`${this.baseUrl}/api/radar/frames`);
    const data = await response.json();

    if (!data.radar?.past?.length) {
      throw new Error('No frames returned from API');
    }

    const frames = data.radar.past;
    this.testResults.frameStats.total = frames.length;

    console.log(`Found ${frames.length} frames (${data.radar.source})`);

    // Analyze frame distribution
    const timestamps = frames.map(f => f.time).sort((a, b) => a - b);
    const oldestFrame = timestamps[0];
    const newestFrame = timestamps[timestamps.length - 1];
    const totalSpan = newestFrame - oldestFrame;
    const hoursSpan = totalSpan / (1000 * 60 * 60);

    console.log(`Coverage: ${hoursSpan.toFixed(1)} hours`);
    console.log(`From: ${new Date(oldestFrame).toISOString()}`);
    console.log(`To:   ${new Date(newestFrame).toISOString()}`);

    // Test each frame individually
    console.log('\n🔍 Testing each frame individually...');

    const testTiles = [
      { z: 7, x: 38, y: 48 }, // Northeast coverage
      { z: 7, x: 39, y: 48 },
      { z: 8, x: 76, y: 96 },
      { z: 8, x: 77, y: 96 }
    ];

    let frameIndex = 0;
    for (const frame of frames) {
      const frameResult = {
        index: frameIndex,
        time: frame.time,
        url: frame.url,
        type: frame.url.startsWith('nexrad-') ? 'nexrad' : 'synthetic',
        tiles: [],
        success: true,
        avgResponseTime: 0,
        errors: []
      };

      if (frame.url.startsWith('nexrad-')) {
        this.testResults.frameStats.nexrad++;
      } else {
        this.testResults.frameStats.synthetic++;
      }

      // Test multiple tiles for this frame
      let totalResponseTime = 0;
      let tileCount = 0;

      for (const tile of testTiles) {
        try {
          const start = Date.now();
          const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${frame.url}&z=${tile.z}&x=${tile.x}&y=${tile.y}`;
          const response = await fetch(tileUrl, { timeout: 10000 });

          const duration = Date.now() - start;
          totalResponseTime += duration;
          tileCount++;

          if (!response.ok) {
            const error = `HTTP ${response.status}`;
            frameResult.errors.push(`${tile.z}/${tile.x}/${tile.y}: ${error}`);
            frameResult.tiles.push({ ...tile, success: false, error, duration });
          } else {
            const buffer = await response.arrayBuffer();
            if (buffer.byteLength < 100) {
              const error = 'Response too small';
              frameResult.errors.push(`${tile.z}/${tile.x}/${tile.y}: ${error}`);
              frameResult.tiles.push({ ...tile, success: false, error, duration });
            } else {
              frameResult.tiles.push({ ...tile, success: true, duration });
            }
          }
        } catch (error) {
          frameResult.errors.push(`${tile.z}/${tile.x}/${tile.y}: ${error.message}`);
          frameResult.tiles.push({ ...tile, success: false, error: error.message, duration: 0 });
        }
      }

      // Calculate frame success rate
      const successfulTiles = frameResult.tiles.filter(t => t.success).length;
      const successRate = successfulTiles / frameResult.tiles.length;

      frameResult.success = successRate >= 0.75; // 75% success threshold
      frameResult.avgResponseTime = tileCount > 0 ? totalResponseTime / tileCount : 0;

      if (frameResult.success) {
        this.testResults.frameStats.working++;
      } else {
        this.testResults.frameStats.failed++;
        this.issues.push(`Frame ${frameIndex} (${frameResult.type}) failed: ${successfulTiles}/${frameResult.tiles.length} tiles`);
      }

      if (frameResult.avgResponseTime > 2000) {
        this.testResults.frameStats.slow++;
        this.issues.push(`Frame ${frameIndex} slow: ${frameResult.avgResponseTime.toFixed(0)}ms avg`);
      }

      this.testResults.frames.push(frameResult);

      // Progress indicator
      if ((frameIndex + 1) % 10 === 0 || frameIndex === frames.length - 1) {
        const progress = ((frameIndex + 1) / frames.length * 100).toFixed(1);
        console.log(`  Progress: ${frameIndex + 1}/${frames.length} frames (${progress}%) - Working: ${this.testResults.frameStats.working}, Failed: ${this.testResults.frameStats.failed}`);
      }

      frameIndex++;
    }

    // Summary
    console.log(`\n📊 Frame Analysis Summary:`);
    console.log(`   Total Frames: ${this.testResults.frameStats.total}`);
    console.log(`   NEXRAD: ${this.testResults.frameStats.nexrad}`);
    console.log(`   Synthetic: ${this.testResults.frameStats.synthetic}`);
    console.log(`   Working: ${this.testResults.frameStats.working}`);
    console.log(`   Failed: ${this.testResults.frameStats.failed}`);
    console.log(`   Slow: ${this.testResults.frameStats.slow}`);

    const workingRate = (this.testResults.frameStats.working / this.testResults.frameStats.total * 100).toFixed(1);
    console.log(`   Success Rate: ${workingRate}%`);

    if (workingRate < 80) {
      this.issues.push(`LOW FRAME SUCCESS RATE: Only ${workingRate}% of frames are working`);
    }

    return frames;
  }

  async testTileGenerationStress(frames) {
    const stressTestTiles = [
      // Northeast ski areas
      { z: 7, x: 37, y: 47 }, { z: 7, x: 38, y: 47 }, { z: 7, x: 39, y: 47 },
      { z: 7, x: 37, y: 48 }, { z: 7, x: 38, y: 48 }, { z: 7, x: 39, y: 48 },
      { z: 7, x: 37, y: 49 }, { z: 7, x: 38, y: 49 }, { z: 7, x: 39, y: 49 },
      // Higher zoom levels
      { z: 8, x: 74, y: 94 }, { z: 8, x: 75, y: 94 }, { z: 8, x: 76, y: 94 },
      { z: 8, x: 74, y: 95 }, { z: 8, x: 75, y: 95 }, { z: 8, x: 76, y: 95 },
      { z: 8, x: 74, y: 96 }, { z: 8, x: 75, y: 96 }, { z: 8, x: 76, y: 96 }
    ];

    console.log(`Running stress test with ${stressTestTiles.length} tiles across ${frames.length} frames...`);

    const results = [];
    let totalTests = 0;
    let successfulTests = 0;
    let totalResponseTime = 0;

    // Test every 5th frame to avoid too much load
    const testFrames = frames.filter((_, i) => i % 5 === 0);

    for (const frame of testFrames) {
      for (const tile of stressTestTiles) {
        totalTests++;
        this.testResults.tileStats.totalTests++;

        try {
          const start = Date.now();
          const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${frame.url}&z=${tile.z}&x=${tile.x}&y=${tile.y}`;
          const response = await fetch(tileUrl, { timeout: 15000 });

          const duration = Date.now() - start;
          totalResponseTime += duration;

          if (response.ok) {
            const buffer = await response.arrayBuffer();
            if (buffer.byteLength >= 100) {
              successfulTests++;
              this.testResults.tileStats.successful++;
              results.push({ frame: frame.url, tile, success: true, duration });
            } else {
              this.testResults.tileStats.errors.push(`Small response: ${buffer.byteLength} bytes`);
              results.push({ frame: frame.url, tile, success: false, error: 'Small response', duration });
            }
          } else {
            const error = `HTTP ${response.status}`;
            this.testResults.tileStats.errors.push(error);
            results.push({ frame: frame.url, tile, success: false, error, duration });
          }
        } catch (error) {
          this.testResults.tileStats.errors.push(error.message);
          results.push({ frame: frame.url, tile, success: false, error: error.message, duration: 0 });
        }
      }
    }

    const successRate = totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(2) : 0;
    const avgResponseTime = totalTests > 0 ? (totalResponseTime / totalTests).toFixed(0) : 0;

    this.testResults.tileStats.avgResponseTime = parseFloat(avgResponseTime);

    console.log(`✅ Stress test results:`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Success rate: ${successRate}%`);
    console.log(`   Average response: ${avgResponseTime}ms`);

    // Analyze by frame type
    const nexradResults = results.filter(r => r.frame.startsWith('nexrad-'));
    const syntheticResults = results.filter(r => r.frame.startsWith('synthetic-'));

    if (nexradResults.length > 0) {
      const nexradSuccess = nexradResults.filter(r => r.success).length / nexradResults.length * 100;
      console.log(`   NEXRAD success: ${nexradSuccess.toFixed(1)}%`);
    }

    if (syntheticResults.length > 0) {
      const syntheticSuccess = syntheticResults.filter(r => r.success).length / syntheticResults.length * 100;
      console.log(`   Synthetic success: ${syntheticSuccess.toFixed(1)}%`);
    }

    if (successRate < 95) {
      this.issues.push(`STRESS TEST FAILURE: Only ${successRate}% success rate in comprehensive testing`);
    }

    if (parseFloat(avgResponseTime) > 3000) {
      this.issues.push(`SLOW PERFORMANCE: ${avgResponseTime}ms average response time`);
    }
  }

  async testPatternQuality(frames) {
    const syntheticFrames = frames.filter(f => f.url.startsWith('synthetic-'));

    if (syntheticFrames.length < 10) {
      console.log('⚠️  Not enough synthetic frames for comprehensive pattern analysis');
      return;
    }

    console.log(`Analyzing patterns in ${syntheticFrames.length} synthetic frames...`);

    // Test pattern evolution over time
    const testTile = { z: 7, x: 38, y: 48 };
    const patterns = [];
    const patternDetails = [];

    for (let i = 0; i < Math.min(20, syntheticFrames.length); i++) {
      const frame = syntheticFrames[i];
      const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${frame.url}&z=${testTile.z}&x=${testTile.x}&y=${testTile.y}`;

      try {
        const response = await fetch(tileUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch frame ${i}: HTTP ${response.status}`);
          continue;
        }

        const buffer = await response.arrayBuffer();
        const png = PNG.sync.read(Buffer.from(buffer));

        const signature = this.generateDetailedPatternSignature(png);
        patterns.push(signature.hash);
        patternDetails.push({
          frame: i,
          time: frame.time,
          signature: signature,
          url: frame.url
        });

      } catch (error) {
        console.warn(`Failed to analyze frame ${i}: ${error.message}`);
      }
    }

    // Analyze pattern evolution
    let patternChanges = 0;
    let totalComparisons = 0;

    for (let i = 1; i < patterns.length; i++) {
      totalComparisons++;
      if (patterns[i] !== patterns[i-1]) {
        patternChanges++;
      }
    }

    const changeRate = totalComparisons > 0 ? (patternChanges / totalComparisons) : 0;
    this.testResults.quality.patternEvolution = changeRate;

    console.log(`✅ Pattern evolution: ${(changeRate * 100).toFixed(1)}% change rate`);

    if (changeRate < 0.5) {
      this.issues.push(`STATIC PATTERNS: Synthetic data changes too slowly (${(changeRate * 100).toFixed(1)}% change rate)`);
    }

    // Test spatial coherence across multiple tiles
    const coherenceScore = await this.testDetailedSpatialCoherence(syntheticFrames);
    this.testResults.quality.spatialCoherence = coherenceScore;

    console.log(`✅ Spatial coherence: ${(coherenceScore * 10).toFixed(1)}/10`);

    // Analyze pattern consistency
    const uniquePatterns = new Set(patterns).size;
    const patternDiversity = uniquePatterns / patterns.length;

    console.log(`✅ Pattern diversity: ${(patternDiversity * 100).toFixed(1)}% unique patterns`);

    if (patternDiversity < 0.7) {
      this.issues.push(`LOW PATTERN DIVERSITY: Only ${(patternDiversity * 100).toFixed(1)}% unique patterns`);
    }
  }

  generateDetailedPatternSignature(png) {
    const { width, height, data } = png;

    // Analyze different quadrants and intensity bands
    const quadrants = [0, 0, 0, 0];
    const intensityBands = [0, 0, 0, 0]; // 0-63, 64-127, 128-191, 192-255
    let totalPixels = 0;
    let totalIntensity = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const a = data[idx + 3];
        if (a > 0) {
          const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const quadX = x < width / 2 ? 0 : 1;
          const quadY = y < height / 2 ? 0 : 2;
          quadrants[quadX + quadY] += intensity;
          totalIntensity += intensity;

          // Intensity bands
          const band = Math.floor(intensity / 64);
          intensityBands[Math.min(band, 3)]++;

          totalPixels++;
        }
      }
    }

    // Normalize and create hash
    const normalizedQuads = totalPixels > 0 ? quadrants.map(q => Math.round(q / totalPixels)) : [0, 0, 0, 0];
    const avgIntensity = totalPixels > 0 ? Math.round(totalIntensity / totalPixels) : 0;
    const hash = `${normalizedQuads.join('-')}-${avgIntensity}`;

    return {
      hash,
      quadrants: normalizedQuads,
      avgIntensity,
      intensityBands,
      totalPixels
    };
  }

  async testDetailedSpatialCoherence(frames) {
    const testFrames = frames.slice(0, 5); // Test first 5 frames
    let coherenceScore = 0;
    let tests = 0;

    const tileGrid = [
      { z: 7, x: 38, y: 48 }, // Center
      { z: 7, x: 39, y: 48 }, // East
      { z: 7, x: 38, y: 49 }, // South
      { z: 7, x: 37, y: 48 }, // West
      { z: 7, x: 38, y: 47 }  // North
    ];

    for (const frame of testFrames) {
      const signatures = [];

      for (const tile of tileGrid) {
        try {
          const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${frame.url}&z=${tile.z}&x=${tile.x}&y=${tile.y}`;
          const response = await fetch(tileUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const png = PNG.sync.read(Buffer.from(buffer));
            signatures.push(this.generateDetailedPatternSignature(png));
            tests++;
          }
        } catch (error) {
          // Skip failed tiles
        }
      }

      // Check coherence between adjacent tiles
      if (signatures.length >= 3) {
        // Compare center with adjacent tiles
        const center = signatures[0];
        let adjacentSimilarity = 0;

        for (let i = 1; i < signatures.length; i++) {
          const similarity = this.calculateSignatureSimilarity(center, signatures[i]);
          adjacentSimilarity += similarity;
        }

        coherenceScore += adjacentSimilarity / (signatures.length - 1);
      }
    }

    return tests > 0 ? coherenceScore / tests : 0;
  }

  calculateSignatureSimilarity(sig1, sig2) {
    // Compare quadrant patterns
    let quadSimilarity = 0;
    for (let i = 0; i < 4; i++) {
      const diff = Math.abs(sig1.quadrants[i] - sig2.quadrants[i]);
      quadSimilarity += Math.max(0, 1 - diff / 100); // Similarity score 0-1
    }
    quadSimilarity /= 4;

    // Compare average intensity
    const intensityDiff = Math.abs(sig1.avgIntensity - sig2.avgIntensity);
    const intensitySimilarity = Math.max(0, 1 - intensityDiff / 50);

    return (quadSimilarity + intensitySimilarity) / 2;
  }

  async testPerformanceProfiling(frames) {
    console.log('Running detailed performance profiling...');

    const performanceTests = 50; // Test 50 random frames
    const results = [];
    const responseTimeBuckets = {
      '0-500ms': 0,
      '500-1000ms': 0,
      '1000-2000ms': 0,
      '2000-5000ms': 0,
      '5000ms+': 0
    };

    for (let i = 0; i < performanceTests; i++) {
      const frameIndex = Math.floor(Math.random() * frames.length);
      const frame = frames[frameIndex];
      const testTile = { z: 7, x: 38, y: 48 };

      const start = Date.now();
      try {
        const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${frame.url}&z=${testTile.z}&x=${testTile.x}&y=${testTile.y}`;
        const response = await fetch(tileUrl, { timeout: 10000 });

        const duration = Date.now() - start;

        if (response.ok) {
          results.push({
            duration,
            success: true,
            frameType: frame.url.startsWith('nexrad-') ? 'nexrad' : 'synthetic',
            status: response.status
          });

          // Bucket response times
          if (duration < 500) responseTimeBuckets['0-500ms']++;
          else if (duration < 1000) responseTimeBuckets['500-1000ms']++;
          else if (duration < 2000) responseTimeBuckets['1000-2000ms']++;
          else if (duration < 5000) responseTimeBuckets['2000-5000ms']++;
          else responseTimeBuckets['5000ms+']++;
        } else {
          results.push({
            duration,
            success: false,
            frameType: frame.url.startsWith('nexrad-') ? 'nexrad' : 'synthetic',
            status: response.status,
            error: `HTTP ${response.status}`
          });
        }

      } catch (error) {
        const duration = Date.now() - start;
        results.push({
          duration,
          success: false,
          frameType: frame.url.startsWith('nexrad-') ? 'nexrad' : 'synthetic',
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (successful.length > 0) {
      const durations = successful.map(r => r.duration);
      const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
      const p95ResponseTime = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];

      console.log(`✅ Performance profiling results:`);
      console.log(`   Success rate: ${(successful.length / results.length * 100).toFixed(1)}%`);
      console.log(`   Average response: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`   95th percentile: ${p95ResponseTime}ms`);

      console.log(`   Response time distribution:`);
      Object.entries(responseTimeBuckets).forEach(([bucket, count]) => {
        if (count > 0) {
          console.log(`     ${bucket}: ${count} requests`);
        }
      });

      // Compare NEXRAD vs Synthetic performance
      const nexradResults = successful.filter(r => r.frameType === 'nexrad');
      const syntheticResults = successful.filter(r => r.frameType === 'synthetic');

      if (nexradResults.length > 0) {
        const nexradAvg = nexradResults.reduce((a, b) => a + b.duration, 0) / nexradResults.length;
        console.log(`   NEXRAD avg: ${nexradAvg.toFixed(0)}ms (${nexradResults.length} samples)`);
      }

      if (syntheticResults.length > 0) {
        const syntheticAvg = syntheticResults.reduce((a, b) => a + b.duration, 0) / syntheticResults.length;
        console.log(`   Synthetic avg: ${syntheticAvg.toFixed(0)}ms (${syntheticResults.length} samples)`);
      }

      if (avgResponseTime > 2000) {
        this.issues.push(`SLOW RESPONSES: Average ${avgResponseTime.toFixed(0)}ms`);
      }

      if (p95ResponseTime > 5000) {
        this.issues.push(`HIGH LATENCY: 95th percentile ${p95ResponseTime}ms`);
      }
    }

    if (failed.length > 5) {
      this.issues.push(`HIGH FAILURE RATE: ${failed.length}/${results.length} requests failed`);
    }
  }

  async testErrorDiagnostics() {
    console.log('Running error diagnostics...');

    // Test various edge cases and error conditions
    const diagnosticTests = [
      // Invalid zoom levels
      { layer: 'synthetic-1767217871447', z: -1, x: 38, y: 48, expected: 'Invalid zoom' },
      { layer: 'synthetic-1767217871447', z: 20, x: 38, y: 48, expected: 'Invalid zoom' },

      // Invalid coordinates
      { layer: 'synthetic-1767217871447', z: 7, x: -1, y: 48, expected: 'Invalid coordinates' },
      { layer: 'synthetic-1767217871447', z: 7, x: 38, y: -1, expected: 'Invalid coordinates' },

      // Invalid layer names
      { layer: 'invalid-layer', z: 7, x: 38, y: 48, expected: 'Invalid layer' },
      { layer: '', z: 7, x: 38, y: 48, expected: 'Missing layer' },

      // Valid but edge case coordinates
      { layer: 'synthetic-1767217871447', z: 7, x: 127, y: 48, expected: 'Valid edge case' },
      { layer: 'synthetic-1767217871447', z: 7, x: 38, y: 127, expected: 'Valid edge case' }
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const test of diagnosticTests) {
      try {
        const tileUrl = `${this.baseUrl}/api/radar/tile?layer=${test.layer}&z=${test.z}&x=${test.x}&y=${test.y}`;
        const response = await fetch(tileUrl, { timeout: 5000 });

        if (test.expected === 'Invalid zoom' || test.expected === 'Invalid coordinates' || test.expected === 'Invalid layer' || test.expected === 'Missing layer') {
          if (response.status >= 400) {
            passedTests++;
          } else {
            failedTests++;
            this.issues.push(`Error diagnostic failed: ${test.expected} returned ${response.status}`);
          }
        } else if (test.expected === 'Valid edge case') {
          if (response.status === 200) {
            passedTests++;
          } else {
            failedTests++;
            this.issues.push(`Edge case failed: ${JSON.stringify(test)} returned ${response.status}`);
          }
        }
      } catch (error) {
        if (test.expected.includes('Invalid') || test.expected.includes('Missing')) {
          passedTests++; // Expected to fail
        } else {
          failedTests++;
          this.issues.push(`Unexpected error in diagnostic test: ${error.message}`);
        }
      }
    }

    const diagnosticSuccessRate = (passedTests / (passedTests + failedTests) * 100).toFixed(1);
    console.log(`✅ Error diagnostics: ${passedTests}/${passedTests + failedTests} tests passed (${diagnosticSuccessRate}%)`);

    if (diagnosticSuccessRate < 90) {
      this.issues.push(`ERROR HANDLING ISSUES: Only ${diagnosticSuccessRate}% of error diagnostics passed`);
    }
  }

  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        connectivity: this.testResults.connectivity,
        framesAnalyzed: this.testResults.frameStats.total,
        framesWorking: this.testResults.frameStats.working,
        framesFailed: this.testResults.frameStats.failed,
        framesSlow: this.testResults.frameStats.slow,
        nexradFrames: this.testResults.frameStats.nexrad,
        syntheticFrames: this.testResults.frameStats.synthetic,
        tilesTested: this.testResults.tileStats.totalTests,
        tilesSuccessful: this.testResults.tileStats.successful,
        avgResponseTime: this.testResults.tileStats.avgResponseTime,
        issuesFound: this.issues.length,
        overallSuccess: this.issues.length === 0
      },
      quality: this.testResults.quality,
      frameDetails: this.testResults.frames.slice(0, 10), // First 10 frames as examples
      tileErrors: this.testResults.tileStats.errors.slice(0, 20), // First 20 errors
      issues: this.issues,
      recommendations: this.generateComprehensiveRecommendations()
    };

    // Save detailed report
    const reportPath = path.join(__dirname, 'radar-comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('� COMPREHENSIVE RADAR QUALITY TEST REPORT');
    console.log('='.repeat(60));

    console.log(`\n✅ OVERALL STATUS: ${report.summary.overallSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`📡 Connectivity: ${report.summary.connectivity ? '✅' : '❌'}`);
    console.log(`🎬 Frames Analyzed: ${report.summary.framesAnalyzed}`);
    console.log(`   Working: ${report.summary.framesWorking}`);
    console.log(`   Failed: ${report.summary.framesFailed}`);
    console.log(`   Slow: ${report.summary.framesSlow}`);
    console.log(`   NEXRAD: ${report.summary.nexradFrames}`);
    console.log(`   Synthetic: ${report.summary.syntheticFrames}`);

    const frameSuccessRate = report.summary.framesAnalyzed > 0 ? (report.summary.framesWorking / report.summary.framesAnalyzed * 100).toFixed(1) : 0;
    console.log(`   Success Rate: ${frameSuccessRate}%`);

    console.log(`🗺️  Tiles Tested: ${report.summary.tilesTested}`);
    console.log(`   Successful: ${report.summary.tilesSuccessful}`);
    console.log(`   Avg Response: ${report.summary.avgResponseTime.toFixed(0)}ms`);

    const tileSuccessRate = report.summary.tilesTested > 0 ? (report.summary.tilesSuccessful / report.summary.tilesTested * 100).toFixed(1) : 0;
    console.log(`   Success Rate: ${tileSuccessRate}%`);

    if (report.quality.patternEvolution > 0) {
      console.log(`\n🎨 PATTERN QUALITY:`);
      console.log(`   Evolution Rate: ${(report.quality.patternEvolution * 100).toFixed(1)}%`);
      console.log(`   Spatial Coherence: ${report.quality.spatialCoherence.toFixed(1)}/10`);
    }

    if (report.issues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${report.issues.length}):`);
      report.issues.slice(0, 10).forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      if (report.issues.length > 10) {
        console.log(`   ... and ${report.issues.length - 10} more`);
      }
    }

    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    // Show frame failure breakdown
    const failedFrames = this.testResults.frames.filter(f => !f.success);
    if (failedFrames.length > 0) {
      console.log(`\n❌ FRAME FAILURE BREAKDOWN:`);
      const nexradFailed = failedFrames.filter(f => f.type === 'nexrad').length;
      const syntheticFailed = failedFrames.filter(f => f.type === 'synthetic').length;
      console.log(`   NEXRAD failed: ${nexradFailed}`);
      console.log(`   Synthetic failed: ${syntheticFailed}`);

      if (failedFrames.length <= 5) {
        failedFrames.forEach((frame, i) => {
          console.log(`   Frame ${frame.index} (${frame.type}): ${frame.errors.length} errors`);
        });
      }
    }

    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    console.log('='.repeat(60));

    // Final assessment
    if (frameSuccessRate < 50) {
      console.log('\n🚨 CRITICAL: Less than 50% of frames are working!');
      console.log('   This explains why the animation only shows 2-3 frames.');
    } else if (frameSuccessRate < 80) {
      console.log('\n⚠️  WARNING: Frame success rate is below 80%.');
      console.log('   Animation may be choppy or incomplete.');
    } else {
      console.log('\n✅ Frame success rate is good.');
    }
  }

  generateComprehensiveRecommendations() {
    const recs = [];

    const frameSuccessRate = this.testResults.frameStats.total > 0 ? (this.testResults.frameStats.working / this.testResults.frameStats.total * 100) : 0;

    if (frameSuccessRate < 50) {
      recs.push('CRITICAL: Less than 50% of frames are working - investigate frame generation immediately');
    }

    if (this.testResults.frameStats.failed > this.testResults.frameStats.working) {
      recs.push('More frames are failing than working - check tile generation logic');
    }

    if (this.testResults.tileStats.avgResponseTime > 3000) {
      recs.push('Very slow response times - implement caching or optimize tile generation');
    }

    if (this.testResults.quality.patternEvolution < 0.3) {
      recs.push('Synthetic patterns are too static - increase time-based variation');
    }

    if (this.testResults.quality.spatialCoherence < 0.5) {
      recs.push('Poor spatial coherence - adjacent tiles should have more consistent patterns');
    }

    if (this.testResults.tileStats.errors.length > 10) {
      recs.push('High number of tile errors - check error handling and logging');
    }

    if (this.testResults.frameStats.nexrad === 0) {
      recs.push('No NEXRAD frames available - check real data source integration');
    }

    if (this.testResults.frameStats.synthetic === 0) {
      recs.push('No synthetic frames available - check fallback generation');
    }

    if (recs.length === 0) {
      recs.push('All systems performing well - radar animation should work smoothly');
    }

    return recs;
  }
}

// Main execution
async function main() {
  const tester = new ComprehensiveRadarTester();
  await tester.runComprehensiveTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveRadarTester;
