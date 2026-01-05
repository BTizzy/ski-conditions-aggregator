import { alterraScraper } from './lib/scrapers/alterra.js';

async function testScraper() {
  const url = 'https://globalconditionsfeed.azurewebsites.net/sr/printablereports';
  console.log(`Testing scraper on ${url}`);

  try {
    const result = await alterraScraper.scrape(url);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testScraper();