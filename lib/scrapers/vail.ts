// lib/scrapers/vail.ts
import * as cheerio from 'cheerio';
import { ScrapedSnowData, ResortScraper, ScrapingUtils } from './index';

export class VailResortScraper implements ResortScraper {
  canHandle(url: string): boolean {
    return url.includes('stowe.com') ||
           url.includes('okemo.com') ||
           url.includes('mountsnow.com') ||
           url.includes('killington.com') ||
           url.includes('skiwildcat.com') ||
           url.includes('attitash.com') ||
           url.includes('cannonmt.com');
  }

  async scrape(url: string): Promise<ScrapedSnowData> {
    try {
      console.log(`[Vail Scraper] Scraping ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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

      // First, try to extract structured data from script tags
      let structuredData: any = null;
      $('script').each((_, element) => {
        const scriptContent = $(element).html();
        if (scriptContent && scriptContent.includes('FR.snowReportData')) {
          try {
            // Extract the JSON object from the script - look for the specific pattern
            const startIndex = scriptContent.indexOf('FR.snowReportData = {');
            const endIndex = scriptContent.indexOf('};', startIndex) + 1;
            if (startIndex !== -1 && endIndex !== -1) {
              const jsonString = scriptContent.substring(startIndex + 19, endIndex); // 19 = length of 'FR.snowReportData = '
              structuredData = JSON.parse(jsonString);
              console.log(`[Vail Scraper] Found structured data:`, structuredData);
            }
          } catch (error) {
            console.log(`[Vail Scraper] Failed to parse structured data:`, error);
          }
        }
      });

      // Remove script and style elements to clean up text
      $('script, style, nav, header, footer').remove();

      // Get all text content
      const textContent = $('body').text().toLowerCase();

      console.log(`[Vail Scraper] Extracted text length: ${textContent.length}`);

      const result: ScrapedSnowData = { success: true };

      // First, try to use structured data if available
      if (structuredData) {
        result.snowDepth24h = parseFloat(structuredData.TwentyFourHourSnowfall?.Inches || '0');
        result.snowDepth48h = parseFloat(structuredData.FortyEightHourSnowfall?.Inches || '0');
        result.snowDepth7d = parseFloat(structuredData.SevenDaySnowfall?.Inches || '0');
        result.baseDepth = parseFloat(structuredData.BaseDepth?.Inches || '0');
        console.log(`[Vail Scraper] Used structured data for snowfall`);
      } else {
        // Fallback to text pattern matching
        const snowfallData = ScrapingUtils.findSnowfallData(textContent);
        console.log(`[Vail Scraper] Found ${snowfallData.length} snowfall data points:`, snowfallData);

        // Process the found data
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
      }

      // Try to extract temperature and wind from structured data with better validation
      const tempPatterns = [
        /(\d+(?:\.\d+)?)\s*°?\s*[fF]\b/i,  // 32°F, 32°f
        /(\d+(?:\.\d+)?)\s*°?\s*[cC]\b/i,  // 0°C, 0°c
        /temperature:?\s*(\d+(?:\.\d+)?)\s*°?\s*[fF]\b/i,  // temperature: 32°F
        /temperature:?\s*(\d+(?:\.\d+)?)\s*°?\s*[cC]\b/i,  // temperature: 0°C
        /(\d+(?:\.\d+)?)\s*[fF]\b/i,  // 32F, 32f (no degree symbol)
        /(\d+(?:\.\d+)?)\s*[cC]\b/i   // 0C, 0c (no degree symbol)
      ];

      for (const pattern of tempPatterns) {
        const tempMatch = textContent.match(pattern);
        if (tempMatch && !result.temp) {
          const temp = parseFloat(tempMatch[1]);
          // Validate temperature is reasonable (-50°F to 100°F)
          if (temp >= -50 && temp <= 100) {
            result.temp = pattern.toString().includes('[cC]') ? (temp * 9/5) + 32 : temp;
            console.log(`[Vail Scraper] Found temperature: ${tempMatch[0]} -> ${result.temp}°F`);
            break;
          }
        }
      }

      const windPatterns = [
        /wind:?\s*(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\b/i,
        /(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\s*wind/i,
        /(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\b/i
      ];

      for (const pattern of windPatterns) {
        const windMatch = textContent.match(pattern);
        if (windMatch && !result.windSpeed) {
          const wind = parseFloat(windMatch[1]);
          const unit = windMatch[2].toLowerCase();
          // Validate wind speed is reasonable (0-100 mph)
          if (wind >= 0 && wind <= 100) {
            result.windSpeed = unit.includes('km') ? wind * 0.621371 : wind;
            console.log(`[Vail Scraper] Found wind: ${windMatch[0]} -> ${result.windSpeed} mph`);
            break;
          }
        }
      }

      console.log(`[Vail Scraper] Final result:`, result);
      return result;

    } catch (error) {
      console.error(`[Vail Scraper] Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const vailScraper = new VailResortScraper();