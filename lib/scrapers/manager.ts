// lib/scrapers/manager.ts
import { ScrapedSnowData } from './index';
import { vailScraper } from './vail';
import { alterraScraper } from './alterra';
import { independentScraper } from './independent';

export class ResortScraperManager {
  private scrapers = [vailScraper, alterraScraper, independentScraper];

  async scrapeResortConditions(url: string, resortId?: string): Promise<ScrapedSnowData> {
    console.log(`[Scraper Manager] Starting scrape for ${resortId || 'unknown'} at ${url}`);

    // Find the appropriate scraper
    const scraper = this.scrapers.find(s => s.canHandle(url));

    if (!scraper) {
      console.log(`[Scraper Manager] No scraper found for ${url}, returning empty result`);
      return {
        success: false,
        error: 'No scraper available for this resort type'
      };
    }

    console.log(`[Scraper Manager] Using ${scraper.constructor.name} for ${url}`);

    try {
      const result = await scraper.scrape(url);

      if (result.success) {
        console.log(`[Scraper Manager] Successfully scraped data:`, {
          snowDepth24h: result.snowDepth24h,
          snowDepth7d: result.snowDepth7d,
          baseDepth: result.baseDepth,
          temp: result.temp,
          windSpeed: result.windSpeed
        });
      } else {
        console.log(`[Scraper Manager] Scraper failed: ${result.error}`);
      }

      return result;

    } catch (error) {
      console.error(`[Scraper Manager] Unexpected error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected scraping error'
      };
    }
  }
}

export const scraperManager = new ResortScraperManager();