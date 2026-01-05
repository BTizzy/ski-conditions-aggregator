// lib/scrapers/independent.ts
import * as cheerio from 'cheerio';
import { ScrapedSnowData, ResortScraper, ScrapingUtils } from './index';

export class IndependentResortScraper implements ResortScraper {
  canHandle(url: string): boolean {
    // Handle resorts that don't belong to major chains
    return url.includes('jaypeakresort.com') ||
           url.includes('smuggs.com') ||
           url.includes('bromley.com') ||
           url.includes('madriverglen.com') ||
           url.includes('skiburke.com') ||
           url.includes('brettonwoods.com') ||
           url.includes('waterville.com') ||
           url.includes('cranmore.com');
  }

  async scrape(url: string): Promise<ScrapedSnowData> {
    try {
      console.log(`[Independent Scraper] Scraping ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SkiConditionsAggregator/1.0)'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, header, footer').remove();

      const textContent = $('body').text().toLowerCase();
      console.log(`[Independent Scraper] Extracted text length: ${textContent.length}`);

      const result: ScrapedSnowData = { success: true };

      // Look for common patterns in independent resort websites
      const snowfallData = ScrapingUtils.findSnowfallData(textContent);
      console.log(`[Independent Scraper] Found ${snowfallData.length} snowfall data points:`, snowfallData);

      // Process snowfall data
      for (const data of snowfallData) {
        const normalizedValue = ScrapingUtils.normalizeUnits(data.value, data.unit, 'inches');

        switch (data.type) {
          case '24h':
            if (!result.snowDepth24h || normalizedValue > result.snowDepth24h) {
              result.snowDepth24h = normalizedValue;
            }
            break;
          case '48h':
            if (!result.snowDepth48h || normalizedValue > result.snowDepth48h) {
              result.snowDepth48h = normalizedValue;
            }
            break;
          case '7d':
            if (!result.snowDepth7d || normalizedValue > result.snowDepth7d) {
              result.snowDepth7d = normalizedValue;
            }
            break;
          case 'base':
            if (!result.baseDepth || normalizedValue > result.baseDepth) {
              result.baseDepth = normalizedValue;
            }
            break;
        }
      }

      // Look for specific patterns common in independent resorts
      // Jay Peak specific patterns
      if (url.includes('jaypeakresort.com')) {
        result.snowDepth24h = this.extractJayPeakSnow($);
      }

      // Mad River Glen specific patterns
      if (url.includes('madriverglen.com')) {
        result.snowDepth24h = this.extractMadRiverSnow($);
      }

      // Extract weather data
      const tempMatch = textContent.match(/(\d+(?:\.\d+)?)\s*°?\s*[fc]/i);
      if (tempMatch && !result.temp) {
        const temp = parseFloat(tempMatch[1]);
        result.temp = tempMatch[0].toLowerCase().includes('c') ? (temp * 9/5) + 32 : temp;
      }

      const windMatch = textContent.match(/wind\s*:?\s*(\d+(?:\.\d+)?)\s*(mph|kmh|kph)/i);
      if (windMatch && !result.windSpeed) {
        const wind = parseFloat(windMatch[1]);
        result.windSpeed = windMatch[2].toLowerCase().includes('km') ? wind * 0.621371 : wind;
      }

      console.log(`[Independent Scraper] Final result:`, result);
      return result;

    } catch (error) {
      console.error(`[Independent Scraper] Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractJayPeakSnow($: cheerio.CheerioAPI): number | undefined {
    // Jay Peak has specific snow report structure
    const snowText = $('.snow-report, .conditions').text().toLowerCase();
    const match = snowText.match(/(\d+(?:\.\d+)?)\s*(?:inch|inches|in|")/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private extractMadRiverSnow($: cheerio.CheerioAPI): number | undefined {
    // Mad River Glen has specific snow report structure
    const snowText = $('.snow-conditions, .report').text().toLowerCase();
    const match = snowText.match(/new\s*snow\s*:?\s*(\d+(?:\.\d+)?)\s*(?:inch|inches|in|")/);
    return match ? parseFloat(match[1]) : undefined;
  }
}

export const independentScraper = new IndependentResortScraper();