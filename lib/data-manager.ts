/**
 * Backend Data Manager
 * 
 * Handles:
 * 1. Data collection from scrapers
 * 2. Storage in Supabase
 * 3. Cache invalidation
 * 4. Data aggregation
 */

import { createClient } from '@supabase/supabase-js';
import { Conditions } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface StoredConditions extends Conditions {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export class DataManager {
  /**
   * Store conditions from scraper
   */
  async storeConditions(conditions: Conditions): Promise<StoredConditions | null> {
    try {
      const { data, error } = await supabase
        .from('resort_conditions')
        .insert([{
          resort_id: conditions.resortId,
          timestamp: conditions.timestamp,
          snow_depth: conditions.snowDepth,
          recent_snowfall: conditions.recentSnowfall,
          weekly_snowfall: conditions.weeklySnowfall,
          base_temp: conditions.baseTemp,
          wind_speed: conditions.windSpeed,
          visibility: conditions.visibility,
          trail_status: conditions.trailStatus,
          raw_data: conditions.rawData,
          elevation_ft: conditions.elevationFt,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data as StoredConditions;
    } catch (error) {
      console.error('[DataManager] Error storing conditions:', error);
      return null;
    }
  }

  /**
   * Get latest conditions for all resorts
   */
  async getLatestConditions(): Promise<Conditions[]> {
    try {
      // Get the latest entry for each resort (within last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('resort_conditions')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('resort_id', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get latest per resort
      const latest = new Map<string, StoredConditions>();
      for (const row of data || []) {
        if (!latest.has(row.resort_id)) {
          latest.set(row.resort_id, row);
        }
      }

      return Array.from(latest.values()) as Conditions[];
    } catch (error) {
      console.error('[DataManager] Error getting conditions:', error);
      return [];
    }
  }

  /**
   * Get historical data for a resort
   */
  async getHistoricalConditions(resortId: string, days: number = 7): Promise<Conditions[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('resort_conditions')
        .select('*')
        .eq('resort_id', resortId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Conditions[];
    } catch (error) {
      console.error('[DataManager] Error getting historical data:', error);
      return [];
    }
  }

  /**
   * Create database schema (run once during setup)
   */
  async initializeDatabase(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('init_schema');

      if (error && !error.message.includes('already exists')) {
        throw error;
      }

      console.log('[DataManager] Database schema initialized');
      return true;
    } catch (error) {
      console.error('[DataManager] Error initializing database:', error);
      return false;
    }
  }
}

export const dataManager = new DataManager();
