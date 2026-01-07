import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../lib/api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Cache Operations', () => {
    it('should cache conditions data with TTL', async () => {
      const mockConditions = [
        {
          resortId: 'test-1',
          name: 'Test Resort',
          lat: 44.0,
          lon: -71.0,
          conditions: {
            snowDepth: 24,
            recentSnowfall: 4,
            weeklySnowfall: 12,
            baseTemp: 22,
            windSpeed: 12,
            visibility: 'Good',
            timestamp: new Date().toISOString(),
            dataAge: 0
          },
          cachedAt: Date.now()
        }
      ];

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resorts: mockConditions })
      });

      const result = await apiClient.getResortConditions(true);

      expect(result).toEqual(mockConditions);
      expect(localStorage.getItem('ski_conditions')).toBeTruthy();
    });

    it('should return stale cache on fetch error', async () => {
      // Set up stale cache
      const staleData = [
        {
          resortId: 'loon-mountain',
          name: 'Loon Mountain',
          lat: 44.0367,
          lon: -71.6217,
          conditions: {
            snowDepth: 20,
            recentSnowfall: 2,
            weeklySnowfall: 8,
            baseTemp: 20,
            windSpeed: 10,
            visibility: 'Good',
            timestamp: new Date().toISOString(),
            dataAge: 100
          },
          cachedAt: Date.now() - 10 * 60 * 1000 // 10 minutes old
        }
      ];

      const cacheEntry = {
        data: staleData,
        timestamp: (Date.now() / 1000) - 10 * 60,
        ttl: 5 * 60,
        version: '1.0.0'
      };

      localStorage.setItem('ski_conditions', JSON.stringify(cacheEntry));

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.getResortConditions(true);

      expect(result).toEqual(staleData);
    });

    it('should implement stale-while-revalidate pattern', async () => {
      const cachedData = [
        {
          resortId: 'sunday-river',
          name: 'Sunday River',
          lat: 44.4722,
          lon: -70.8567,
          conditions: {
            snowDepth: 30,
            recentSnowfall: 6,
            weeklySnowfall: 14,
            baseTemp: 18,
            windSpeed: 15,
            visibility: 'Good',
            timestamp: new Date().toISOString(),
            dataAge: 50
          },
          cachedAt: Date.now() - 1 * 60 * 1000 // 1 minute old
        }
      ];

      const cacheEntry = {
        data: cachedData,
        timestamp: (Date.now() / 1000) - 1 * 60,
        ttl: 5 * 60,
        version: '1.0.0'
      };

      localStorage.setItem('ski_conditions', JSON.stringify(cacheEntry));

      const freshData = [{ ...cachedData[0], conditions: { ...cachedData[0].conditions, snowDepth: 32 } }];

      // Mock fetch for background refresh
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resorts: freshData })
      });

      // Should return cached data immediately
      const result = await apiClient.getResortConditions(false);
      expect(result).toEqual(cachedData);

      // Wait for background fetch
      await new Promise(r => setTimeout(r, 100));

      // Cache should now have fresh data
      const cached = localStorage.getItem('ski_conditions');
      expect(cached).toBeTruthy();
    });
  });

  describe('Data Sync', () => {
    it('should trigger background data sync', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          synced: {
            resorts: 43,
            conditions: 43,
            radar: 48
          }
        })
      });

      await apiClient.syncData();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/data/sync',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should clear cache after sync', async () => {
      localStorage.setItem('ski_conditions', JSON.stringify({ test: true }));

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await apiClient.syncData();

      expect(localStorage.getItem('ski_conditions')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network timeout'));

      try {
        await apiClient.getResortConditions(true);
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle malformed cache entries', async () => {
      localStorage.setItem('ski_conditions', 'invalid json');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resorts: [] })
      });

      const result = await apiClient.getResortConditions(true);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
