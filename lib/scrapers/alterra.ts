// lib/scrapers/alterra.ts
import * as cheerio from 'cheerio';
import { ScrapedSnowData, ResortScraper, ScrapingUtils } from './index';

export class AlterraResortScraper implements ResortScraper {
  canHandle(url: string): boolean {
    return url.includes('loonmtn.com') ||
           url.includes('sundayriver.com') ||
           url.includes('sugarbush.com') ||
           url.includes('stratton.com') ||
           url.includes('sugarloaf.com') ||
           url.includes('mountsunapee.com');
  }

  async scrape(url: string): Promise<ScrapedSnowData> {
    try {
      console.log(`[Alterra Scraper] Scraping ${url}`);

      // For Alterra resorts, try the printable report URL first
      let scrapeUrl = url;
      let isPrintableReport = false;
      if (url.includes('loonmtn.com')) {
        scrapeUrl = 'https://globalconditionsfeed.azurewebsites.net/lm/printablereports';
        isPrintableReport = true;
      } else if (url.includes('sugarloaf.com')) {
        // Sugarloaf's main site is Next.js and doesn't load data without JS, so use printable report
        scrapeUrl = 'https://globalconditionsfeed.azurewebsites.net/sl/printablereports';
        isPrintableReport = true;
      } else if (url.includes('sundayriver.com')) {
        scrapeUrl = 'https://globalconditionsfeed.azurewebsites.net/sr/printablereports';
        isPrintableReport = true;
      } else if (url.includes('stratton.com')) {
        scrapeUrl = 'https://globalconditionsfeed.azurewebsites.net/sm/printablereports';
        isPrintableReport = true;
      } else if (url.includes('sugarbush.com')) {
        // Sugarbush has data on main page, try that first
        scrapeUrl = url;
        isPrintableReport = false;
      }

      console.log(`[Alterra Scraper] Using URL: ${scrapeUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(scrapeUrl, {
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
      console.log(`[Alterra Scraper] Extracted text length: ${textContent.length}`);

      // Look for structured data in JSON-LD or specific classes
      const jsonLd = $('script[type="application/ld+json"]').text();
      let structuredData = null;
      if (jsonLd) {
        try {
          structuredData = JSON.parse(jsonLd);
        } catch (e) {
          console.log(`[Alterra Scraper] Failed to parse JSON-LD:`, e);
        }
      }

      // Extract from structured data first
      const result: ScrapedSnowData = { success: true };

      if (structuredData && typeof structuredData === 'object') {
        // Look for snow conditions in structured data
        const snowData = this.extractFromStructuredData(structuredData);
        Object.assign(result, snowData);
      }

      // Extract data based on the source type
      if (isPrintableReport) {
        // For printable reports, try detailed extraction first, then conditions bar
        const printableData = this.extractFromPrintableReport($);
        if (printableData) {
          Object.assign(result, printableData);
        } else {
          // Fall back to conditions bar extraction
          this.extractFromConditionsBar($, result);
        }
      } else {
        // For main websites, try Next.js data extraction first
        const nextData = this.extractFromNextJsData(html);
        if (nextData) {
          Object.assign(result, nextData);
        }

        // Try HTML element extraction
        const htmlData = this.extractFromHtmlElements($);
        if (htmlData) {
          Object.assign(result, htmlData);
        }

      // Sugarbush specific extraction
        if (url.includes('sugarbush.com')) {
          const sugarbushData = this.extractSugarbushData($, textContent);
          if (sugarbushData) {
            Object.assign(result, sugarbushData);
          }
        }

        // If this is Sugarbush and no data was found on main page, skip Azure feed (shows wrong resort data)
        // if (url.includes('sugarbush.com') && !result.snowDepth24h && !result.baseDepth) {
        //   console.log(`[Alterra Scraper] No data found on Sugarbush main page, trying Azure feed`);
        //   try {
        //     const azureResponse = await fetch('https://globalconditionsfeed.azurewebsites.net/sb/printablereports', {
        //       signal: AbortSignal.timeout(5000),
        //       headers: {
        //         'User-Agent': 'Mozilla/5.0 (compatible; SkiConditionsAggregator/1.0)'
        //       }
        //     });

        //     if (azureResponse.ok) {
        //       const azureHtml = await azureResponse.text();
        //       const azure$ = cheerio.load(azureHtml);
        //       const azureData = this.extractFromPrintableReport(azure$);
        //       if (azureData) {
        //         Object.assign(result, azureData);
        //         console.log(`[Alterra Scraper] Successfully extracted data from Sugarbush Azure feed:`, azureData);
        //       }
        //     }
        //   } catch (azureError) {
        //     console.log(`[Alterra Scraper] Failed to fetch Sugarbush Azure feed:`, azureError);
        //   }
        // }

        // Fall back to text parsing
        const snowfallData = ScrapingUtils.findSnowfallData(textContent);
        console.log(`[Alterra Scraper] Found ${snowfallData.length} snowfall data points:`, snowfallData);

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

      // Extract weather data with improved validation
      // Use the new utility methods for better accuracy
      const temp = ScrapingUtils.extractTemperature(textContent);
      if (temp !== null && !result.temp) {
        result.temp = temp;
        console.log(`[Alterra Scraper] Found temperature: ${temp}°F`);
      }

      const wind = ScrapingUtils.extractWindSpeed(textContent);
      if (wind !== null && !result.windSpeed) {
        result.windSpeed = wind;
        console.log(`[Alterra Scraper] Found wind speed: ${wind} mph`);
      }

      console.log(`[Alterra Scraper] Final result:`, result);
      return result;

    } catch (error) {
      console.error(`[Alterra Scraper] Error scraping ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractFromNextJsData(html: string): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Look for Next.js data in script tags
      const scriptRegex = /self\.__next_f\.push\(\[1,"([^"]*)/g;
      let match;

      while ((match = scriptRegex.exec(html)) !== null) {
        const data = match[1];

        // Look for snow conditions data
        if (data.includes('snowConditionsContent')) {
          const snowMatch = data.match(/"snowConditionsContent":\s*({[^}]*})/);
          if (snowMatch) {
            try {
              const snowData = JSON.parse(snowMatch[1]);
              if (snowData.filteredLocationList && snowData.snowfallStatsList) {
                // This is the snow conditions component data
                // The actual values are likely in a separate data source
                console.log(`[Alterra Scraper] Found snow conditions component:`, snowData);
              }
            } catch (e) {
              console.log(`[Alterra Scraper] Failed to parse snow conditions:`, e);
            }
          }
        }

        // Look for summary panel data which might contain snowfall stats
        if (data.includes('summaryPanelContent')) {
          const summaryMatch = data.match(/"summaryPanelContent":\s*({[^}]*})/);
          if (summaryMatch) {
            try {
              const summaryData = JSON.parse(summaryMatch[1]);
              if (summaryData.largeStats) {
                // Check if any large stats contain snowfall data
                for (const stat of summaryData.largeStats) {
                  if (stat.snowfallStat && stat.snowfallStat !== '') {
                    // This might be snowfall data
                    console.log(`[Alterra Scraper] Found snowfall stat:`, stat);
                  }
                }
              }
            } catch (e) {
              console.log(`[Alterra Scraper] Failed to parse summary panel:`, e);
            }
          }
        }
      }

      // Try to extract from global window data or other patterns
      const windowDataMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[^;]*})/);
      if (windowDataMatch) {
        try {
          const windowData = JSON.parse(windowDataMatch[1]);
          const snowData = this.extractSnowDataFromWindowData(windowData);
          if (snowData) {
            Object.assign(result, snowData);
          }
        } catch (e) {
          console.log(`[Alterra Scraper] Failed to parse window data:`, e);
        }
      }

      // If we found any data, return it
      return Object.keys(result).length > 0 ? result : null;

    } catch (error) {
      console.log(`[Alterra Scraper] Error extracting Next.js data:`, error);
      return null;
    }
  }

  private extractFromHtmlElements($: cheerio.CheerioAPI): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Look for snow conditions in various HTML patterns used by Alterra resorts

      // Look for elements with snowfall data
      $('[data-stat-item], [data-testid*="snow"], .snowfall, .snow-conditions').each((_, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const statItem = $el.attr('data-stat-item');

        // Check for specific stat items
        if (statItem) {
          const value = parseFloat(text.replace(/[^\d.]/g, ''));
          if (!isNaN(value)) {
            switch (statItem) {
              case 'snow24Hours':
              case 'snow-24h':
                result.snowDepth24h = value;
                break;
              case 'snow48Hours':
              case 'snow-48h':
                result.snowDepth48h = value;
                break;
              case 'snow7Days':
              case 'snow-7d':
                result.snowDepth7d = value;
                break;
              case 'base':
              case 'base-depth':
                result.baseDepth = value;
                break;
            }
          }
        }

        // Look for text patterns
        if (text.match(/24.*hour.*snow/i) || text.match(/last.*24.*hour/i)) {
          const value = this.extractSnowValue(text);
          if (value !== null) result.snowDepth24h = value;
        }
        if (text.match(/48.*hour.*snow/i) || text.match(/last.*48.*hour/i)) {
          const value = this.extractSnowValue(text);
          if (value !== null) result.snowDepth48h = value;
        }
        if (text.match(/7.*day.*snow/i) || text.match(/past.*7.*day/i)) {
          const value = this.extractSnowValue(text);
          if (value !== null) result.snowDepth7d = value;
        }
        if (text.match(/base.*depth/i)) {
          const value = this.extractSnowValue(text);
          if (value !== null) result.baseDepth = value;
        }
      });

      // Look for weather data with improved extraction
      $('.weather, .temperature, [data-testid*="temp"], .temp').each((_, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const temp = ScrapingUtils.extractTemperature(text);
        if (temp !== null && !result.temp) {
          result.temp = temp;
        }
      });

      $('.wind, [data-testid*="wind"]').each((_, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const wind = ScrapingUtils.extractWindSpeed(text);
        if (wind !== null && !result.windSpeed) {
          result.windSpeed = wind;
        }
      });

      return Object.keys(result).length > 0 ? result : null;

    } catch (error) {
      console.log(`[Alterra Scraper] Error extracting HTML data:`, error);
      return null;
    }
  }

  private extractFromPrintableReport($: cheerio.CheerioAPI): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Look for the stats section in printable reports
      $('.stat, .stats .stat').each((_, element) => {
        const $el = $(element);
        const label = $el.find('.label').text().trim().toLowerCase();
        const value = $el.find('.stat').text().trim() || $el.text().trim();

        // Extract numeric value using improved cleaning
        const numericValue = ScrapingUtils.cleanNumeric(value);
        if (numericValue === null) return;

        // Validate values are reasonable for ski resort data
        if (label.includes('trails') && label.includes('open')) {
          // This is trails open, not snowfall - skip
          return;
        }

        // Additional validation: base depth shouldn't be > 300 inches, snowfall shouldn't be > 100 inches per period
        if (label.includes('base') && numericValue > 300) return;
        if ((label.includes('24') || label.includes('48') || label.includes('7')) && numericValue > 100) return;

        // Look for snowfall patterns in the text around this element
        const parentText = $el.parent().text().toLowerCase();

        if (parentText.includes('24') && parentText.includes('hour')) {
          result.snowDepth24h = numericValue;
        } else if (parentText.includes('48') && parentText.includes('hour')) {
          result.snowDepth48h = numericValue;
        } else if (parentText.includes('7') && parentText.includes('day')) {
          result.snowDepth7d = numericValue;
        } else if (parentText.includes('base')) {
          result.baseDepth = numericValue;
        }
      });

      // Look for snowfall data in paragraphs or other elements
      const fullText = $('body').text();

      // Simple text-based extraction for Azure printable reports
      const baseDepthMatch = fullText.match(/BASE DEPTH\s+(\d+(?:\.\d+)?)/i);
      if (baseDepthMatch) {
        const value = parseFloat(baseDepthMatch[1]);
        if (value > 0 && value < 300) { // Reasonable base depth
          result.baseDepth = value;
        }
      }

      const snowfallMatch = fullText.match(/SNOWFALL\s+(\d+(?:\.\d+)?)/i);
      if (snowfallMatch) {
        const value = parseFloat(snowfallMatch[1]);
        if (value >= 0 && value < 100) { // Reasonable snowfall
          result.snowDepth24h = value;
        }
      }

      // Look for patterns like "24 Hours: 2""
      const patterns = [
        /24\s*hours?:\s*(\d+(?:\.\d+)?)/i,
        /48\s*hours?:\s*(\d+(?:\.\d+)?)/i,
        /7\s*days?:\s*(\d+(?:\.\d+)?)/i,
        /base\s*depth:?\s*(\d+(?:\.\d+)?)/i,
        /base:?\s*(\d+(?:\.\d+)?)/i
      ];

      patterns.forEach((pattern, index) => {
        const match = fullText.match(pattern);
        if (match) {
          const value = parseFloat(match[1]);
          switch (index) {
            case 0:
              result.snowDepth24h = value;
              break;
            case 1:
              result.snowDepth48h = value;
              break;
            case 2:
              result.snowDepth7d = value;
              break;
            case 3:
            case 4:
              result.baseDepth = value;
              break;
          }
        }
      });

      // Extract temperature and wind from the current weather section
      const weatherText = $('body').text();
      const tempMatch = weatherText.match(/(\d+(?:\.\d+)?)\s*°?\s*[fc]/i);
      if (tempMatch && !result.temp) {
        const temp = parseFloat(tempMatch[1]);
        result.temp = tempMatch[0].toLowerCase().includes('c') ? (temp * 9/5) + 32 : temp;
      }

      const windMatch = weatherText.match(/wind\s*:?\s*(\d+(?:\.\d+)?)\s*(mph|kmh|kph)/i);
      if (windMatch && !result.windSpeed) {
        const wind = parseFloat(windMatch[1]);
        result.windSpeed = windMatch[2].toLowerCase().includes('km') ? wind * 0.621371 : wind;
      }

      return Object.keys(result).length > 0 ? result : null;

    } catch (error) {
      console.log(`[Alterra Scraper] Error extracting printable report data:`, error);
      return null;
    }
  }

  private extractSnowValue(text: string): number | null {
    // Use improved numeric extraction that handles ranges and quotes
    return ScrapingUtils.cleanNumeric(text);
  }

  private extractFromConditionsBar($: cheerio.CheerioAPI, result: Partial<ScrapedSnowData>): void {
    try {
      // Look for conditions bar data (used by Sugarloaf, Sunday River, etc.)
      $('#conditionsBar div, .conditionsBar div').each((_, element) => {
        const $el = $(element);
        const heading = $el.find('h2').text().trim().toLowerCase();
        const value = $el.text().replace(heading.toUpperCase(), '').trim();

        if (heading.includes('snowfall')) {
          // This is typically overnight snowfall, but better than nothing
          const numericValue = ScrapingUtils.cleanNumeric(value);
          if (numericValue !== null && numericValue >= 0) {
            // If we don't have 24h data, use this as 24h snowfall
            if (!result.snowDepth24h) {
              result.snowDepth24h = numericValue;
            }
          }
        } else if (heading.includes('base')) {
          const numericValue = ScrapingUtils.cleanNumeric(value);
          if (numericValue !== null && numericValue > 0 && numericValue < 300) {
            result.baseDepth = numericValue;
          }
        }
      });
    } catch (error) {
      console.log(`[Alterra Scraper] Error extracting conditions bar data:`, error);
    }
  }

  private extractSnowDataFromWindowData(data: any): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    // Look for snow conditions in various possible locations
    const searchInObject = (obj: any): void => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          // Check for common snow data patterns
          if (key.includes('snow') || key.includes('Snow')) {
            if (obj[key].depth24h || obj[key]['24h']) result.snowDepth24h = parseFloat(obj[key].depth24h || obj[key]['24h']);
            if (obj[key].depth48h || obj[key]['48h']) result.snowDepth48h = parseFloat(obj[key].depth48h || obj[key]['48h']);
            if (obj[key].depth7d || obj[key]['7d']) result.snowDepth7d = parseFloat(obj[key].depth7d || obj[key]['7d']);
            if (obj[key].baseDepth || obj[key].base) result.baseDepth = parseFloat(obj[key].baseDepth || obj[key].base);
          }

          // Check for weather data
          if (key.includes('weather') || key.includes('Weather')) {
            if (obj[key].temperature) result.temp = parseFloat(obj[key].temperature);
            if (obj[key].windSpeed) result.windSpeed = parseFloat(obj[key].windSpeed);
          }

          // Recursively search nested objects
          searchInObject(obj[key]);
        }
      }
    };

    searchInObject(data);
    return Object.keys(result).length > 0 ? result : null;
  }

  private extractFromStructuredData(data: any): Partial<ScrapedSnowData> {
    const result: Partial<ScrapedSnowData> = {};

    // Look for snow conditions in various structured data formats
    if (data.snowConditions) {
      const conditions = data.snowConditions;
      if (conditions.newSnow24h) result.snowDepth24h = parseFloat(conditions.newSnow24h);
      if (conditions.newSnow48h) result.snowDepth48h = parseFloat(conditions.newSnow48h);
      if (conditions.newSnow7d) result.snowDepth7d = parseFloat(conditions.newSnow7d);
      if (conditions.baseDepth) result.baseDepth = parseFloat(conditions.baseDepth);
    }

    if (data.weather) {
      const weather = data.weather;
      if (weather.temperature) {
        const temp = parseFloat(weather.temperature);
        result.temp = data.unit === 'celsius' ? (temp * 9/5) + 32 : temp;
      }
      if (weather.windSpeed) {
        const wind = parseFloat(weather.windSpeed);
        result.windSpeed = data.windUnit === 'kmh' ? wind * 0.621371 : wind;
      }
    }

    return result;
  }

  private extractSugarbushData($: cheerio.CheerioAPI, textContent: string): Partial<ScrapedSnowData> | null {
    const result: Partial<ScrapedSnowData> = {};

    try {
      // Sugarbush displays snowfall as: "0" Today, 0" 2-Day, 4" 3-Day, 91" Season Total
      // Look for this specific pattern in the text content
      const todayMatch = textContent.match(/(\d+(?:\.\d+)?)"?\s*today/i);
      if (todayMatch) {
        result.snowDepth24h = parseFloat(todayMatch[1]);
        console.log(`[Alterra Scraper] Found Sugarbush 24h snow: ${result.snowDepth24h}"`);
      }

      const twoDayMatch = textContent.match(/(\d+(?:\.\d+)?)"?\s*2-day/i);
      if (twoDayMatch) {
        result.snowDepth48h = parseFloat(twoDayMatch[1]);
        console.log(`[Alterra Scraper] Found Sugarbush 48h snow: ${result.snowDepth48h}"`);
      }

      const threeDayMatch = textContent.match(/(\d+(?:\.\d+)?)"?\s*3-day/i);
      if (threeDayMatch) {
        result.snowDepth7d = parseFloat(threeDayMatch[1]);
        console.log(`[Alterra Scraper] Found Sugarbush 7d snow: ${result.snowDepth7d}"`);
      }

      const seasonMatch = textContent.match(/(\d+(?:\.\d+)?)"?\s*season\s*total/i);
      if (seasonMatch) {
        result.baseDepth = parseFloat(seasonMatch[1]);
        console.log(`[Alterra Scraper] Found Sugarbush season total: ${result.baseDepth}"`);
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.log(`[Alterra Scraper] Error extracting Sugarbush data:`, error);
      return null;
    }
  }
}

export const alterraScraper = new AlterraResortScraper();