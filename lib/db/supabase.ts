import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database tables (can be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      resorts: {
        Row: {
          id: string;
          name: string;
          lat: number;
          lon: number;
          website: string | null;
        };
        Insert: {
          id: string;
          name: string;
          lat: number;
          lon: number;
          website?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          lat?: number;
          lon?: number;
          website?: string | null;
        };
      };
      conditions: {
        Row: {
          id: number;
          resort_id: string;
          timestamp: string;
          conditions_json: any | null;
          depth_cm: number | null;
          snowfall_24h: number | null;
        };
        Insert: {
          id?: number;
          resort_id: string;
          timestamp?: string;
          conditions_json?: any | null;
          depth_cm?: number | null;
          snowfall_24h?: number | null;
        };
        Update: {
          id?: number;
          resort_id?: string;
          timestamp?: string;
          conditions_json?: any | null;
          depth_cm?: number | null;
          snowfall_24h?: number | null;
        };
      };
      user_alerts: {
        Row: {
          id: number;
          user_id: string;
          resort_ids: string[];
          min_snowfall: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          resort_ids: string[];
          min_snowfall?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          resort_ids?: string[];
          min_snowfall?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};