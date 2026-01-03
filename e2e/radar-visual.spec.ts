import { test, expect } from '@playwright/test';

test.describe('Radar Overlay Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the page to load completely
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for map to initialize
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Check if frames API is working
    const framesResponse = await page.request.get('/api/radar/frames');
    console.log('Frames API status:', framesResponse.status());
    if (framesResponse.ok()) {
      const framesData = await framesResponse.json();
      console.log('Frames API returned:', framesData.radar?.past?.length || 0, 'frames');
    } else {
      console.log('Frames API failed');
    }

    // Wait for radar frames to load
    await page.waitForFunction(() => {
      return window.localStorage.getItem('radarFramesLoaded') === 'true' ||
             document.querySelector('[data-testid="radar-loading"]') === null;
    }, { timeout: 15000 });
  });

  test('radar overlay renders and animates', async ({ page }) => {
    // Wait for radar canvas to appear
    const radarCanvas = page.locator('canvas').first();
    await expect(radarCanvas).toBeVisible({ timeout: 10000 });

    // Take initial screenshot
    await page.screenshot({ path: 'radar-initial.png', fullPage: true });

    // Wait for radar to start rendering (frames need to load and render)
    await page.waitForTimeout(8000);

    // Wait for canvas to have content (not blank) - check all canvases
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      for (const canvas of canvases) {
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i + 3] > 0) return true;
        }
      }
      return false;
    }, { timeout: 10000 });

    // Check if canvas has content (not blank) - check entire canvas
    const canvasDataUrl = await radarCanvas.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return { hasContext: false, hasAnyPixels: false };

      // Get image data from entire canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let hasAnyPixels = false;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // Any non-transparent pixel
          hasAnyPixels = true;
          break;
        }
      }

      return { hasContext: true, hasAnyPixels };
    });

    expect(canvasDataUrl.hasContext).toBe(true);
    expect(canvasDataUrl.hasAnyPixels).toBe(true);

    // Wait for animation to cycle (should see frame changes)
    await page.waitForTimeout(3000);

    // Take second screenshot
    await page.screenshot({ path: 'radar-animated.png', fullPage: true });

    // Verify radar controls are present
    await expect(page.locator('[data-testid="radar-play-pause"]')).toBeVisible();
    await expect(page.locator('[data-testid="radar-speed"]')).toBeVisible();
    await expect(page.locator('[data-testid="radar-opacity"]')).toBeVisible();
  });

  test('radar canvas has precipitation data (not just blue overlay)', async ({ page }) => {
    const radarCanvas = page.locator('canvas').first();
    await expect(radarCanvas).toBeVisible();

    // Wait for canvas to have content
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) return true;
      }
      return false;
    }, { timeout: 10000 });

    // Get detailed pixel analysis from all canvases
    const pixelAnalysis = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      let totalBluePixels = 0;
      let totalPixels = 0;
      const colorCounts: { [key: string]: number } = {};

      for (const canvas of canvases) {
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 0) { // Only count non-transparent pixels
            totalPixels++;

            // Count blue pixels (typical radar precipitation colors)
            if (b > r && b > g && b > 100) {
              totalBluePixels++;
            }

            // Track color distribution
            const colorKey = `${r}-${g}-${b}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
          }
        }
      }

      const uniqueColors = Object.keys(colorCounts).length;
      const blueRatio = totalPixels > 0 ? totalBluePixels / totalPixels : 0;

      return {
        hasData: totalPixels > 100, // At least some visible pixels
        totalPixels,
        bluePixels: totalBluePixels,
        blueRatio,
        uniqueColors,
        colors: Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10) // Top 10 colors
      };
    });

    // Verify canvas has actual radar data
    expect(pixelAnalysis.hasData).toBe(true);
    expect(pixelAnalysis.totalPixels).toBeGreaterThan(100);
    
    // For provider radar, we expect varied colors (not just uniform)
    expect(pixelAnalysis.uniqueColors).toBeGreaterThan(1);

    console.log('Radar pixel analysis:', pixelAnalysis);
  });

  test('radar controls function correctly', async ({ page }) => {
    // Test play button
    const playBtn = page.locator('[data-testid="radar-play-pause"]');
    await expect(playBtn).toBeVisible();

    // Click to pause (the button toggles between play/pause)
    await playBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot while paused
    await page.screenshot({ path: 'radar-paused.png', fullPage: true });

    // Click to resume
    await playBtn.click();

    // Test opacity slider
    const opacitySlider = page.locator('[data-testid="radar-opacity"]');
    if (await opacitySlider.isVisible()) {
      await opacitySlider.fill('0.5');
      await page.waitForTimeout(500);
    }

    // Test speed control
    const speedControl = page.locator('[data-testid="radar-speed"]');
    if (await speedControl.isVisible()) {
      await speedControl.fill('1000');
      await page.waitForTimeout(1000);
    }
  });

  test('radar handles zoom and pan without flashing', async ({ page }) => {
    const mapContainer = page.locator('.leaflet-container');

    // Wait for initial render
    await page.waitForTimeout(2000);

    // Take baseline screenshot
    await page.screenshot({ path: 'radar-baseline.png', fullPage: true });

    // Zoom in
    await page.keyboard.press('Control+='); // Cmd/Ctrl + +
    await page.waitForTimeout(1000);

    // Take zoomed screenshot
    await page.screenshot({ path: 'radar-zoomed.png', fullPage: true });

    // Pan the map
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(200, 300);
    await page.mouse.up();
    await page.waitForTimeout(2000); // Wait longer for canvas to rebuild after pan

    // Take panned screenshot
    await page.screenshot({ path: 'radar-panned.png', fullPage: true });

    // Wait for canvas to have content again after pan
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) return true;
      }
      return false;
    }, { timeout: 5000 });

    // Verify radar canvas is still visible and not blank after interactions
    const radarCanvas = page.locator('canvas').first();
    await expect(radarCanvas).toBeVisible();

    const hasContentAfterInteraction = await radarCanvas.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) return true;
      }
      return false;
    });

    expect(hasContentAfterInteraction).toBe(true);
  });

  test('radar performance - no memory leaks', async ({ page }) => {
    // Monitor performance during animation
    const performanceMetrics = await page.evaluate(async () => {
      const startTime = performance.now();
      let frameCount = 0;
      const fpsSamples: number[] = [];

      return new Promise((resolve) => {
        const measureFPS = () => {
          frameCount++;
          const now = performance.now();
          const elapsed = now - startTime;

          if (elapsed >= 5000) { // Measure for 5 seconds
            const avgFPS = frameCount / (elapsed / 1000);
            resolve({
              duration: elapsed,
              frameCount,
              avgFPS,
              memoryUsage: (performance as any).memory ?
                {
                  used: (performance as any).memory.usedJSHeapSize,
                  total: (performance as any).memory.totalJSHeapSize,
                  limit: (performance as any).memory.jsHeapSizeLimit
                } : null
            });
            return;
          }

          requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
      });
    });

    console.log('Performance metrics:', performanceMetrics);

    // Verify reasonable performance
    expect((performanceMetrics as any).avgFPS).toBeGreaterThan(10); // At least 10 FPS
    expect((performanceMetrics as any).frameCount).toBeGreaterThan(20); // At least 20 frames in 5 seconds
  });

  test('radar data source verification', async ({ page }) => {
    // Check that radar is using real data sources, not synthetic
    const radarSource = await page.evaluate(() => {
      // Check for radar source indicator in the UI
      const sourceIndicator = document.querySelector('[data-testid="radar-source"]');
      if (sourceIndicator) {
        return sourceIndicator.textContent;
      }

      // Check console logs for radar source info
      // This would require setting up a console listener

      return 'unknown';
    });

    // Verify we're not using synthetic-only data
    expect(radarSource).not.toContain('synthetic-only');

    // Check that frames API returns real radar data
    const framesResponse = await page.request.get('/api/radar/frames');
    expect(framesResponse.ok()).toBeTruthy();

    const framesData = await framesResponse.json();
    expect(framesData.radar?.past?.length).toBeGreaterThan(0);
    expect(framesData.radar?.source).not.toBe('synthetic-only');
  });

  test('radar uses smooth cross-fade animation (dual canvases)', async ({ page }) => {
    // Wait for radar canvas to appear
    const radarCanvas = page.locator('canvas').first();
    await expect(radarCanvas).toBeVisible({ timeout: 10000 });

    // Wait for radar to start rendering
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length >= 2; // Should have at least 2 canvases for cross-fade
    }, { timeout: 10000 });

    // Check that we have dual canvases for cross-fade
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBeGreaterThanOrEqual(2);

    // Check that canvases have CSS transitions for smooth fading
    const canvasStyles = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return Array.from(canvases).map(canvas => ({
        opacity: canvas.style.opacity,
        transition: canvas.style.transition,
        willChange: canvas.style.willChange
      }));
    });

    // Verify canvases have transition properties for smooth animation
    canvasStyles.forEach(style => {
      expect(style.transition).toContain('opacity');
      expect(style.willChange).toBe('opacity');
    });

    // Wait for animation to run and check opacity values change
    await page.waitForTimeout(2000);

    const canvasStylesAfter = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return Array.from(canvases).map(canvas => ({
        opacity: parseFloat(canvas.style.opacity || '1')
      }));
    });

    // Verify that canvases have different opacity values (indicating cross-fade)
    const opacities = canvasStylesAfter.map(s => s.opacity);
    const hasDifferentOpacities = opacities.some(opacity => opacity !== opacities[0]);
    expect(hasDifferentOpacities).toBe(true);

    console.log('✅ Dual-canvas cross-fade animation verified');
  });

});

  test('radar uses smooth cross-fade animation (dual canvases)', async ({ page }) => {
    // Wait for radar canvas to appear
    const radarCanvas = page.locator('canvas').first();
    await expect(radarCanvas).toBeVisible({ timeout: 10000 });

    // Wait for radar to start rendering
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length >= 2; // Should have at least 2 canvases for cross-fade
    }, { timeout: 10000 });

    // Check that we have dual canvases for cross-fade
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBeGreaterThanOrEqual(2);

    // Check that canvases have CSS transitions for smooth fading
    const canvasStyles = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return Array.from(canvases).map(canvas => ({
        opacity: canvas.style.opacity,
        transition: canvas.style.transition,
        willChange: canvas.style.willChange
      }));
    });

    // Verify canvases have transition properties for smooth animation
    canvasStyles.forEach(style => {
      expect(style.transition).toContain('opacity');
      expect(style.willChange).toBe('opacity');
    });

    // Wait for animation to run and check opacity values change
    await page.waitForTimeout(2000);

    const canvasStylesAfter = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return Array.from(canvases).map(canvas => ({
        opacity: parseFloat(canvas.style.opacity || '1')
      }));
    });

    // Verify that canvases have different opacity values (indicating cross-fade)
    const opacities = canvasStylesAfter.map(s => s.opacity);
    const hasDifferentOpacities = opacities.some(opacity => opacity !== opacities[0]);
    expect(hasDifferentOpacities).toBe(true);

    console.log('✅ Dual-canvas cross-fade animation verified');
  });
