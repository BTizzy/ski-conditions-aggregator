#!/usr/bin/env node

// Test the complete API override logic
import { scraperManager } from './lib/scrapers/manager.js';

const testResorts = [
  'killington', 'stowe', 'loon-mountain'
];

async function testCompleteOverride() {
  console.log('🧪 Testing complete API override logic...\n');

  for (const resortId of testResorts) {
    console.log(`=== Testing ${resortId} ===`);

    try {
      // Get resort data
      const resorts = (await import('./lib/resorts.js')).resorts;
      const resort = resorts.find(r => r.id === resortId);

      if (!resort) {
        console.log(`❌ Resort ${resortId} not found`);
        continue;
      }

      // Simulate the scrapeResortConditions function logic
      const rawScrapedData = await scraperManager.scrapeResortConditions(resort.scrapeUrl, resortId);

      let scrapedData = null;
      if (rawScrapedData.success) {
        scrapedData = {
          success: true,
          snowDepth: rawScrapedData.baseDepth || 0,
          recentSnowfall: rawScrapedData.snowDepth24h || 0,
          trailOpen: 0,
          trailTotal: 0,
          groomed: 0,
          baseTemp: rawScrapedData.temp || null,
          windSpeed: rawScrapedData.windSpeed || null,
          visibility: null,
          rawHtml: null,
          scrapedData: rawScrapedData // Include full scraped data for debugging
        };
      } else {
        scrapedData = {
          success: false,
          snowDepth: 0,
          recentSnowfall: 0,
          trailOpen: 0,
          trailTotal: 0,
          groomed: 0,
          baseTemp: null,
          windSpeed: null,
          visibility: null,
          rawHtml: null,
          scrapeError: rawScrapedData.error
        };
      }

      console.log(`Processed scraped data:`, {
        success: scrapedData.success,
        recentSnowfall: scrapedData.recentSnowfall,
        snowDepth: scrapedData.snowDepth,
        hasWeeklyData: scrapedData.scrapedData?.snowDepth7d ? true : false
      });

      // Simulate the override logic
      const mockPred = {
        recentSnowfall: 0, // Model prediction (zero)
        snowDepth: 0,      // Model prediction (zero)
        weeklySnowfall: 0, // Model prediction (zero)
        baseTemp: 30,
        windSpeed: 5
      };

      console.log(`Before override - Model predictions:`, {
        recentSnowfall: mockPred.recentSnowfall,
        snowDepth: mockPred.snowDepth,
        weeklySnowfall: mockPred.weeklySnowfall
      });

      if (scrapedData && scrapedData.success) {
        // Use scraped 24h snowfall if available and non-zero
        if (scrapedData.recentSnowfall !== null && scrapedData.recentSnowfall > 0) {
          mockPred.recentSnowfall = scrapedData.recentSnowfall;
          console.log(`✅ Override: recentSnowfall = ${scrapedData.recentSnowfall}"`);
        }

        // Use scraped 7d snowfall if available (access from the original scraped data)
        if (scrapedData.scrapedData && scrapedData.scrapedData.snowDepth7d !== null && scrapedData.scrapedData.snowDepth7d > 0) {
          mockPred.weeklySnowfall = scrapedData.scrapedData.snowDepth7d;
          console.log(`✅ Override: weeklySnowfall = ${scrapedData.scrapedData.snowDepth7d}"`);
        }

        // Use scraped base depth if available
        if (scrapedData.snowDepth !== null && scrapedData.snowDepth > 0) {
          mockPred.snowDepth = scrapedData.snowDepth;
          console.log(`✅ Override: snowDepth = ${scrapedData.snowDepth}"`);
        }
      }

      console.log(`After override - Final values:`, {
        recentSnowfall: mockPred.recentSnowfall,
        snowDepth: mockPred.snowDepth,
        weeklySnowfall: mockPred.weeklySnowfall
      });

      // Check if override worked
      const overrideWorked = (
        (scrapedData.recentSnowfall > 0 && mockPred.recentSnowfall === scrapedData.recentSnowfall) ||
        (scrapedData.snowDepth > 0 && mockPred.snowDepth === scrapedData.snowDepth) ||
        (scrapedData.scrapedData?.snowDepth7d > 0 && mockPred.weeklySnowfall === scrapedData.scrapedData.snowDepth7d)
      );

      if (overrideWorked) {
        console.log(`🎉 SUCCESS: Override logic worked correctly!`);
      } else {
        console.log(`⚠️  WARNING: Override may not have applied expected values`);
      }

      console.log('');

    } catch (error) {
      console.log(`❌ Error testing ${resortId}:`, error.message);
      console.log('');
    }
  }
}

testCompleteOverride().catch(console.error);