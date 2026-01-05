#!/usr/bin/env node

// Test the scrape API route directly
import { POST } from './app/api/scrape/route.ts';

async function testScrapeAPI() {
  console.log('🧪 Testing scrape API route directly...\n');

  try {
    // Create a mock request for Killington
    const mockRequest = {
      json: async () => ({ resort: 'killington' })
    };

    console.log('📡 Calling POST handler for Killington...');
    const response = await POST(mockRequest);

    if (!response.ok) {
      console.log(`❌ API call failed: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log('✅ API call successful!');
    console.log('\n📊 Killington Conditions:');

    // Check if we have Killington data
    const killingtonData = data.conditions?.find(c => c.resortId === 'killington');
    if (!killingtonData) {
      console.log('❌ No Killington data found in response');
      return;
    }

    console.log(`Recent Snowfall: ${killingtonData.recentSnowfall}"`);
    console.log(`Weekly Snowfall: ${killingtonData.weeklySnowfall}"`);
    console.log(`Snow Depth: ${killingtonData.snowDepth}"`);
    console.log(`Temperature: ${killingtonData.baseTemp}°F`);
    console.log(`Wind Speed: ${killingtonData.windSpeed} mph`);

    // Check if the override worked
    if (killingtonData.recentSnowfall === 1 && killingtonData.snowDepth === 14) {
      console.log('\n🎉 SUCCESS: Scraped data override is working!');
      console.log('   - Recent snowfall: 1" (from scraper)');
      console.log('   - Snow depth: 14" (from scraper)');
    } else {
      console.log('\n⚠️  Override may not be working:');
      console.log(`   - Expected recent snowfall: 1", got: ${killingtonData.recentSnowfall}"`);
      console.log(`   - Expected snow depth: 14", got: ${killingtonData.snowDepth}"`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testScrapeAPI();