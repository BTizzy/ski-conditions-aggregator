-- Migration script for ski conditions aggregator database
-- Run this in Supabase SQL editor or via migration tool

-- Create resorts table
CREATE TABLE IF NOT EXISTS resorts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  website TEXT
);

-- Create conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id SERIAL PRIMARY KEY,
  resort_id TEXT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conditions_json JSONB,
  depth_cm INTEGER,
  snowfall_24h INTEGER,
  UNIQUE(resort_id, timestamp) -- Prevent duplicate entries for same resort at same time
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_conditions_timestamp ON conditions(timestamp);
CREATE INDEX IF NOT EXISTS idx_conditions_resort_id ON conditions(resort_id);

-- Create user_alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Could be UUID or auth user ID
  resort_ids TEXT[] NOT NULL, -- Array of resort IDs
  min_snowfall INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);

-- Optional: Enable Row Level Security (RLS) if using Supabase auth
-- ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own alerts" ON user_alerts FOR SELECT USING (auth.uid()::text = user_id);