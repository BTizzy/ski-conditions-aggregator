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
           url.includes('cranmore.com') ||
           url.includes('wachusett.com');
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

      let textContent = $('body').text().toLowerCase();
      console.log(`[Independent Scraper] Extracted text length: ${textContent.length}`);

      // Also search in snow-specific sections
      const snowSections = $('[class*="snow"], [id*="snow"], .conditions, .report, .weather').text().toLowerCase();
      if (snowSections) {
        console.log(`[Independent Scraper] Found additional snow section text length: ${snowSections.length}`);
        textContent += ' ' + snowSections;
      }

      // Check for iframes that might contain snow data
      const iframes = $('iframe[src]');
      for (let i = 0; i < iframes.length; i++) {
        const iframeSrc = $(iframes[i]).attr('src');
        if (iframeSrc && (iframeSrc.includes('snow') || iframeSrc.includes('condition') || iframeSrc.includes('report'))) {
          try {
            // Fix protocol-relative URLs
            const fullUrl = iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc;
            console.log(`[Independent Scraper] Found potential snow data iframe: ${fullUrl}`);
            const iframeResponse = await fetch(fullUrl, {
              signal: AbortSignal.timeout(5000),
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SkiConditionsAggregator/1.0)'
              }
            });

            if (iframeResponse.ok) {
              const iframeHtml = await iframeResponse.text();
              const iframe$ = cheerio.load(iframeHtml);
              iframe$('script, style, nav, header, footer').remove();
              const iframeText = iframe$.text().toLowerCase();
              console.log(`[Independent Scraper] Iframe text length: ${iframeText.length}`);
              textContent += ' ' + iframeText; // Append iframe content
            }
          } catch (iframeError) {
            console.log(`[Independent Scraper] Failed to fetch iframe ${iframeSrc}: ${iframeError.message}`);
          }
        }
      }

      const result: ScrapedSnowData = { success: true };

      // Look for common patterns in independent resort websites
      const snowfallData = ScrapingUtils.findSnowfallData(textContent);
      console.log(`[Independent Scraper] Found ${snowfallData.length} snowfall data points:`, snowfallData);

      // Process snowfall data
      for (const data of snowfallData) {
        const normalizedValue = ScrapingUtils.normalizeUnits(data.value, data.unit, 'inches');

        switch (data.type) {
          case '24h':
            if (result.snowDepth24h === undefined || normalizedValue > result.snowDepth24h) {
              result.snowDepth24h = normalizedValue;
            }
            break;
          case '48h':
            if (result.snowDepth48h === undefined || normalizedValue > result.snowDepth48h) {
              result.snowDepth48h = normalizedValue;
            }
            break;
          case '7d':
            if (result.snowDepth7d === undefined || normalizedValue > result.snowDepth7d) {
              result.snowDepth7d = normalizedValue;
            }
            break;
          case 'base':
            if (result.baseDepth === undefined || normalizedValue > result.baseDepth) {
              result.baseDepth = normalizedValue;
            }
            break;
        }
      }

      // Look for specific patterns common in independent resorts
      // Jay Peak specific patterns
      if (url.includes('jaypeakresort.com')) {
        const jayPeakSnow = this.extractJayPeakSnow($);
        if (jayPeakSnow !== undefined && result.snowDepth24h === undefined) {
          result.snowDepth24h = jayPeakSnow;
        }
      }

      // Mad River Glen specific patterns
      if (url.includes('madriverglen.com')) {
        const madRiverSnow = this.extractMadRiverSnow($);
        if (madRiverSnow !== undefined && result.snowDepth24h === undefined) {
          result.snowDepth24h = madRiverSnow;
        }
      }

      // Bromley specific patterns - uses Next.js structured data
      if (url.includes('bromley.com')) {
        const bromleySnow = this.extractBromleySnow(html);
        if (bromleySnow !== undefined && result.snowDepth24h === undefined) {
          result.snowDepth24h = bromleySnow;
        }
      }

      // Smugglers Notch specific patterns
      if (url.includes('smuggs.com')) {
        const smugglersSnow = this.extractSmugglersNotchSnow($);
        if (smugglersSnow) {
          Object.assign(result, smugglersSnow);
        }
      }

      // Wachusett Mountain specific patterns
      if (url.includes('wachusett.com')) {
        const wachusettSnow = this.extractWachusettSnow($);
        if (wachusettSnow) {
          Object.assign(result, wachusettSnow);
        }
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

  private extractBromleySnow(html: string): number | undefined {
    try {
      // Bromley uses Next.js with structured JSON data in __NEXT_DATA__ script
      const nextDataMatch = html.match(/id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) return undefined;

      const jsonData = JSON.parse(nextDataMatch[1]);
      const recentSnowfall = jsonData?.props?.pageProps?.data?.entry?.recentSnowfall;

      if (recentSnowfall && Array.isArray(recentSnowfall) && recentSnowfall.length > 0) {
        // Use the first snowfall entry (most recent)
        const latestSnow = recentSnowfall[0];
        if (latestSnow.min !== undefined && latestSnow.max !== undefined) {
          // Return the max value as it's the upper bound of the range
          return Math.max(latestSnow.min, latestSnow.max);
        }
      }
      return undefined;
    } catch (error) {
      console.error('[Independent Scraper] Error parsing Bromley JSON data:', error);
      return undefined;
    }
  }

  private extractSmugglersNotchSnow($: cheerio.CheerioAPI): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Smugglers Notch shows snowfall data in specific structure
      // Look for "New Snowfall" heading followed by snow data
      $('p:contains("New Snowfall")').each((_, element) => {
        const $p = $(element);
        const $dataDiv = $p.prev('.report-snow-data');
        if ($dataDiv.length > 0) {
          const amountText = $dataDiv.find('.report-snow-data_amount').text();
          const match = amountText.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            result.snowDepth24h = parseFloat(match[1]);
            console.log(`[Independent Scraper] Found Smugglers Notch 24h snow: ${result.snowDepth24h}"`);
          }
        }
      });

      // Look for "Season Total" heading followed by snow data
      $('p:contains("Season Total")').each((_, element) => {
        const $p = $(element);
        const $dataDiv = $p.prev('.report-snow-data');
        if ($dataDiv.length > 0) {
          const amountText = $dataDiv.find('.report-snow-data_amount').text();
          const match = amountText.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            result.baseDepth = parseFloat(match[1]);
            console.log(`[Independent Scraper] Found Smugglers Notch base depth: ${result.baseDepth}"`);
          }
        }
      });

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.log(`[Independent Scraper] Error extracting Smugglers Notch data:`, error);
      return null;
    }
  }

  private extractWachusettSnow($: cheerio.CheerioAPI): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Wachusett Mountain shows 24h snowfall in a span with aria-label="24h Snowfall"
      const snowfallSpan = $('span[aria-label="24h Snowfall"]');
      if (snowfallSpan.length > 0) {
        const snowfallText = snowfallSpan.text().trim();
        const match = snowfallText.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          result.snowDepth24h = parseFloat(match[1]);
          console.log(`[Independent Scraper] Found Wachusett 24h snow: ${result.snowDepth24h}"`);
        }
      }

      // Look for base depth or seasonal totals - Wachusett might not show this prominently
      // For now, we'll focus on 24h snowfall which is the main issue

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.log(`[Independent Scraper] Error extracting Wachusett data:`, error);
      return null;
    }
  }
}

export const independentScraper = new IndependentResortScraper();