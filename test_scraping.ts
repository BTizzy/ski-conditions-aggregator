// test_scraping.js
import { scraperManager } from './lib/scrapers/manager';

async function testScraping() {
  console.log('Testing resort scraping functionality...\n');

  // Test resorts
  const testResorts = [
    { id: 'killington', url: 'https://www.killington.com/the-mountain/conditions-weather/current-conditions-weather/' },
    { id: 'stowe', url: 'https://www.stowe.com/the-mountain/mountain-conditions/snow-and-weather-report.aspx' },
    { id: 'loon-mountain', url: 'https://www.loonmtn.com/mountain-report' },
  ];

  for (const resort of testResorts) {
    console.log(`\n=== Testing ${resort.id} ===`);
    console.log(`URL: ${resort.url}`);

    try {
      const result = await scraperManager.scrapeResortConditions(resort.url, resort.id);

      if (result.success) {
        console.log('✅ Scraping successful!');
        console.log(`24h Snowfall: ${result.snowDepth24h !== undefined ? result.snowDepth24h : 'N/A'}"`);
        console.log(`7d Snowfall: ${result.snowDepth7d !== undefined ? result.snowDepth7d : 'N/A'}"`);
        console.log(`Base Depth: ${result.baseDepth !== undefined ? result.baseDepth : 'N/A'}"`);
        console.log(`Temperature: ${result.temp !== undefined ? result.temp : 'N/A'}°F`);
        console.log(`Wind Speed: ${result.windSpeed !== undefined ? result.windSpeed : 'N/A'} mph`);
      } else {
        console.log('❌ Scraping failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Unexpected error:', error instanceof Error ? error.message : String(error));
    }
  }
}

testScraping().catch(console.error);