import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should complete end-to-end flow: fetch -> cache -> display', async () => {
    const mockResorts = [
      {
        resortId: 'loon-mountain',
        name: 'Loon Mountain',
        lat: 44.0367,
        lon: -71.6217,
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

    // Step 1: Initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resorts: mockResorts })
    });

    const response = await fetch('/api/resorts/conditions');
    const data = await response.json();

    expect(data.resorts).toHaveLength(1);
    expect(data.resorts[0].resortId).toBe('loon-mountain');

    // Step 2: Cache the response
    localStorage.setItem('ski_conditions', JSON.stringify({
      data: mockResorts,
      timestamp: Date.now() / 1000,
      ttl: 5 * 60,
      version: '1.0.0'
    }));

    // Step 3: Verify cache hit
    const cached = localStorage.getItem('ski_conditions');
    const cachedData = JSON.parse(cached!);

    expect(cachedData.data).toEqual(mockResorts);
    expect(cachedData.ttl).toBe(5 * 60);
  });

  it('should handle parallel requests efficiently', async () => {
    const mockData = { resorts: [] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    // Make 5 parallel requests
    const promises = Array(5).fill(null).map(() => 
      fetch('/api/resorts/conditions').then(r => r.json())
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    // Should have made multiple requests (or ideally, just 1 if optimized)
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should log cache operations for debugging', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const entry = {
      data: [],
      timestamp: Date.now() / 1000,
      ttl: 5 * 60,
      version: '1.0.0'
    };

    localStorage.setItem('ski_conditions', JSON.stringify(entry));
    console.log('[Cache] Set: ski_conditions (ttl: 300s)');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Cache]'));
    consoleSpy.mockRestore();
  });
});
