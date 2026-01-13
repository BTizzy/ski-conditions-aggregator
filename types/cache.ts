export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // seconds
  version: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number;
  newestEntry: number;
  hitRate: number;
  entries: {
    key: string;
    size: number;
    age: number;
    ttl: number;
  }[];
}

export interface DataSyncResult {
  success: boolean;
  timestamp: number;
  synced: {
    resorts: number;
    conditions: number;
    radar: number;
  };
  errors: string[];
}

export interface ResortConditionsCached {
  resortId: string;
  name: string;
  lat: number;
  lon: number;
  conditions: {
    snowDepth: number;
    recentSnowfall: number;
    weeklySnowfall: number;
    baseTemp: number;
    windSpeed: number;
    visibility: string;
    timestamp: string;
    dataAge: number; // seconds since collection
  };
  cachedAt: number;
}
