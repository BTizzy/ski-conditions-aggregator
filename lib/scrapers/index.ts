// lib/scrapers/index.ts
export interface ScrapedSnowData {
  snowDepth24h?: number; // 24-hour snowfall in inches
  snowDepth48h?: number; // 48-hour snowfall in inches
  snowDepth7d?: number;  // 7-day snowfall in inches
  baseDepth?: number;    // Base depth in inches
  temp?: number;         // Temperature in Fahrenheit
  windSpeed?: number;    // Wind speed in mph
  success: boolean;
  error?: string;
}

export interface ResortScraper {
  canHandle(url: string): boolean;
  scrape(url: string): Promise<ScrapedSnowData>;
}

// Common scraping utilities
export class ScrapingUtils {
  static extractNumber(text: string): number | null {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Improved numeric extraction that handles ranges, quotes, and units
   * Based on techniques from external repositories (snowradar_etl, snowbound)
   */
  static cleanNumeric(value: string | number | null): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;

    // Convert to string and clean
    let str = String(value).trim();

    // Remove quotes and other non-numeric characters except decimal points and hyphens
    str = str.replace(/["']/g, '');

    // Handle ranges (e.g., "30-40" -> average)
    if (str.includes('-')) {
      const parts = str.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const num1 = this.extractNumber(parts[0]);
        const num2 = this.extractNumber(parts[1]);
        if (num1 !== null && num2 !== null) {
          return (num1 + num2) / 2;
        }
      }
    }

    // Extract the first valid number
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Extract temperature with proper validation
   * Based on patterns from external repositories
   */
  static extractTemperature(text: string): number | null {
    if (!text || typeof text !== 'string') return null;

    // More specific temperature patterns to avoid false matches
    const patterns = [
      // Standard formats: 32°F, 0°C, -5°F
      /(-?\d+(?:\.\d+)?)\s*°?\s*[fF]\b/g,
      /(-?\d+(?:\.\d+)?)\s*°?\s*[cC]\b/g,
      // With temperature keyword: temperature: 32°F
      /temperature:?\s*(-?\d+(?:\.\d+)?)\s*°?\s*[fF]\b/gi,
      /temperature:?\s*(-?\d+(?:\.\d+)?)\s*°?\s*[cC]\b/gi,
      // Without degree symbol but with unit: 32F, 0C
      /(-?\d+(?:\.\d+)?)\s*[fF]\b(?![\w])/g,  // Negative lookbehind to avoid matching longer words
      /(-?\d+(?:\.\d+)?)\s*[cC]\b(?![\w])/g
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const temp = parseFloat(match[1]);

        // Validate temperature is reasonable (-50°F to 100°F)
        if (temp >= -50 && temp <= 100) {
          // Convert Celsius to Fahrenheit if needed
          const isCelsius = pattern.source.toLowerCase().includes('[c]') ||
                           match[0].toLowerCase().includes('c');
          return isCelsius ? (temp * 9/5) + 32 : temp;
        }
      }
    }

    return null;
  }

  /**
   * Extract wind speed with proper validation
   */
  static extractWindSpeed(text: string): number | null {
    if (!text || typeof text !== 'string') return null;

    const patterns = [
      /wind:?\s*(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\b/gi,
      /(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\s*wind/gi,
      /(\d+(?:\.\d+)?)\s*(mph|kmh|kph|km\/h)\b/gi
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const wind = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        // Validate wind speed is reasonable (0-100 mph)
        if (wind >= 0 && wind <= 100) {
          // Convert km/h to mph if needed
          return unit.includes('km') ? wind * 0.621371 : wind;
        }
      }
    }

    return null;
  }

  static normalizeUnits(value: number, unit: string, targetUnit: 'inches' | 'cm'): number {
    if (unit.toLowerCase().includes('cm') && targetUnit === 'inches') {
      return value * 0.393701; // cm to inches
    }
    if (unit.toLowerCase().includes('inch') && targetUnit === 'cm') {
      return value * 2.54; // inches to cm
    }
    return value;
  }

  static findSnowfallData(text: string): { value: number; unit: string; type: string }[] {
    const patterns = [
      // 24-hour patterns
      /(?:24\s*h(?:our)?|overnight|last\s*24h?)\s*:?\s*(\d+(?:\.\d+)?)\s*(inch|inches|in|"|cm)/gi,
      // 48-hour patterns
      /(?:48\s*h(?:our)?|last\s*48h?)\s*:?\s*(\d+(?:\.\d+)?)\s*(inch|inches|in|"|cm)/gi,
      // 7-day patterns
      /(?:7\s*day|week|weekly)\s*:?\s*(\d+(?:\.\d+)?)\s*(inch|inches|in|"|cm)/gi,
      // Base depth patterns
      /(?:base|depth)\s*:?\s*(\d+(?:\.\d+)?)\s*(inch|inches|in|"|cm)/gi,
      // New snow patterns
      /(?:new\s*snow|fresh\s*snow)\s*:?\s*(\d+(?:\.\d+)?)\s*(inch|inches|in|"|cm)/gi,
    ];

    const results: { value: number; unit: string; type: string }[] = [];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const rawValue = match[1];
        const unit = match[2];
        let type = 'unknown';

        const lowerText = match[0].toLowerCase();
        if (lowerText.includes('24') || lowerText.includes('overnight')) {
          type = '24h';
        } else if (lowerText.includes('48')) {
          type = '48h';
        } else if (lowerText.includes('7') || lowerText.includes('week')) {
          type = '7d';
        } else if (lowerText.includes('base') || lowerText.includes('depth')) {
          type = 'base';
        } else if (lowerText.includes('new') || lowerText.includes('fresh')) {
          type = '24h'; // Assume new snow is 24h
        }

        // Use improved numeric cleaning
        const value = this.cleanNumeric(rawValue);
        if (value !== null) {
          results.push({ value, unit, type });
        }
      }
    }

    return results;
  }
}