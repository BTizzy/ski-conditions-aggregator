const { PNG } = require('pngjs');

async function testTile(frame, type) {
  const tileResponse = await fetch(`http://localhost:3000/api/radar/tile?layer=${frame.url}&z=8&x=75&y=95`);
  console.log(`${type} Tile API status:`, tileResponse.status);

  if (tileResponse.ok) {
    const buffer = await tileResponse.arrayBuffer();
    console.log(`${type} Tile received, size:`, buffer.byteLength, 'bytes');

    // Analyze the tile for quality issues
    const png = PNG.sync.read(Buffer.from(buffer));
    analyzeTileQuality(png, frame.url, type);

  } else {
    console.log(`${type} Tile API error:`, await tileResponse.text());
  }
}

function analyzeTileQuality(png, frameType, dataType) {
  const { width, height, data } = png;
  let visiblePixels = 0;
  let redPixels = 0;
  let extremeRedPixels = 0;
  const colorCounts = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) continue;

      visiblePixels++;
      const colorKey = `${r},${g},${b}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;

      if (r > 200 && g < 50 && b < 50) {
        redPixels++;
        if (r > 240) {
          extremeRedPixels++;
        }
      }
    }
  }

  const redPercentage = visiblePixels > 0 ? (redPixels / visiblePixels) * 100 : 0;
  const extremeRedPercentage = visiblePixels > 0 ? (extremeRedPixels / visiblePixels) * 100 : 0;
  const uniqueColors = Object.keys(colorCounts).length;

  console.log(`\n🎨 ${dataType} Tile Quality Analysis (${frameType}):`);
  console.log(`   Visible pixels: ${visiblePixels}`);
  console.log(`   Unique colors: ${uniqueColors}`);
  console.log(`   Red pixels: ${redPixels} (${redPercentage.toFixed(1)}%)`);
  console.log(`   Extreme red pixels: ${extremeRedPixels} (${extremeRedPercentage.toFixed(1)}%)`);

  // Check for issues
  const issues = [];
  if (extremeRedPercentage > 2) {
    issues.push(`EXTREME RED: ${extremeRedPercentage.toFixed(1)}% extreme red pixels`);
  }
  if (redPercentage > 15) {
    issues.push(`HIGH RED: ${redPercentage.toFixed(1)}% red pixels`);
  }
  if (uniqueColors < 10) {
    issues.push(`LOW COLOR DIVERSITY: only ${uniqueColors} unique colors`);
  }
  if (visiblePixels < 100) {
    issues.push(`MOSTLY TRANSPARENT: only ${visiblePixels} visible pixels`);
  }

  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  } else {
    console.log('✅ No quality issues detected');
  }
}

async function testRadarAPI() {
  try {
    console.log('Testing frames API...');
    const framesResponse = await fetch('http://localhost:3000/api/radar/frames');
    const framesData = await framesResponse.json();
    console.log('Frames API response:', framesData);

    if (framesData.radar?.past?.length > 0) {
      // Test both NEXRAD and synthetic frames
      const frames = framesData.radar.past;
      const nexradFrame = frames.find(f => f.url.startsWith('nexrad-'));
      const syntheticFrame = frames.find(f => f.url.startsWith('synthetic-'));

      if (nexradFrame) {
        console.log('Testing NEXRAD tile...');
        await testTile(nexradFrame, 'NEXRAD');
      }

      if (syntheticFrame) {
        console.log('Testing synthetic tile...');
        await testTile(syntheticFrame, 'SYNTHETIC');
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRadarAPI();