// test_scraping_simple.js
import { scraperManager } from './lib/scrapers/manager.ts';

async function testScraping() {
  console.log('Testing resort scraping functionality...\n');

  // Test resorts
  const testResorts = [
    { id: 'killington', url: 'https://www.killington.com/the-mountain/conditions-weather/' },
    { id: 'stowe', url: 'https://www.stowe.com/the-mountain/conditions' },
  ];

  for (const resort of testResorts) {
    console.log(`\n=== Testing ${resort.id} ===`);
    console.log(`URL: ${resort.url}`);

    try {
      const result = await scraperManager.scrapeResortConditions(resort.url, resort.id);

      if (result.success) {
        console.log('✅ Scraping successful!');
        console.log(`24h Snowfall: ${result.snowDepth24h || 'N/A'}"`);
        console.log(`7d Snowfall: ${result.snowDepth7d || 'N/A'}"`);
        console.log(`Base Depth: ${result.baseDepth || 'N/A'}"`);
        console.log(`Temperature: ${result.temp || 'N/A'}°F`);
        console.log(`Wind Speed: ${result.windSpeed || 'N/A'} mph`);
      } else {
        console.log('❌ Scraping failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

testScraping().catch(console.error);