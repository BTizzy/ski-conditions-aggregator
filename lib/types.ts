export interface Conditions {
  resortId: string;
  timestamp: Date;
  snowDepth: number; // in inches
  recentSnowfall: number; // in inches (last 24h)
  recentRainfall?: number; // in inches (last 24h)
  weeklySnowfall?: number; // in inches (last 7 days)
  weeklyRainfall?: number; // in inches (last 7 days)
  expectedOnGround?: number; // estimated inches actually on the ground after melt/compaction
  baseTemp: number; // in Fahrenheit
  windSpeed: number; // mph
  visibility: string; // e.g., 'Good', 'Poor'
  avalancheRisk?: string; // e.g., 'Low', 'Moderate'
  trailStatus: {
    open: number;
    total: number;
    groomed: number;
  };
  rawData: any; // JSON from API/scrape
  // Elevation data for temperature corrections
  elevationFt?: number | null; // computed midpoint elevation
  baseElevationFt?: number | null; // base lodge elevation
  summitElevationFt?: number | null; // summit elevation
}

export interface UserAlertPreferences {
  userId: string;
  minSnowfall: number;
  preferredResorts: string[]; // resort ids
  timeWindows: string[]; // e.g., ['morning', 'afternoon']
  enabled: boolean;
}

export interface HistoricalData {
  resortId: string;
  date: Date;
  snowDepth: number;
  recentSnowfall: number;
}

export interface PowderPrediction {
  resortId: string;
  date: Date;
  score: number; // 0-100, higher better
  factors: string[]; // e.g., ['fresh snow', 'low wind']
}

// Snow model / observation input types
export interface ObservationLike {
  tempC?: number | null; // Celsius
  precipMm?: number | null; // mm in recent period
  weeklyPrecipMm?: number | null; // mm over last 7 days (if available)
  weeklyObservations?: Array<{ precipMm?: number | null; tempC?: number | null; windKph?: number | null; timestamp?: string | null; isSnowfall?: boolean }>;
  windKph?: number | null;
  visibilityM?: number | null;
  text?: string | null;
  timestamp?: string | null;
  previousDepth?: number | null; // optional previous depth in inches
  previousWeekSnowfall?: number | null; // inches reported for prior 7-day total
  elevationFt?: number | null; // elevation of location
  avgTemp7d?: number | null; // average temp over last 7 days (C)
  avgWind7d?: number | null; // average wind over last 7 days (kph)
  avgSunHours7d?: number | null; // estimated average sun hours per day over last week
  stationDistanceKm?: number | null;
  // If available, a resort-reported 7-day snowfall total (in inches). Used to bias/blend
  // the model's weekly estimate toward on-mountain reports when provided.
  resortReportedWeekly?: number | null; // inches
  // Enhanced weather parameters for improved modeling
  humidity?: number | null; // relative humidity (0-100)
  dewpoint?: number | null; // dewpoint temperature in Celsius
  pressure?: number | null; // barometric pressure in hPa
  pressureTrend?: string | null; // 'rising', 'falling', or 'stable'
  windDirection?: number | null; // wind direction in degrees
  windChill?: number | null; // wind chill temperature in Celsius
  clouds?: any[] | null; // cloud layer information
  // Multi-station data for consensus modeling
  multiStationData?: Array<{
    stationId: string;
    distanceKm: number;
    elevationFt?: number;
    observation: any;
    quality: number; // 0-1 quality score
  }>;
  // Real 24-hour historical precipitation data from Open-Meteo API
  recent24hPrecipMm?: number | null; // total mm precipitation over last 24 hours
  recent24hObservations?: Array<{ precipMm?: number | null; tempC?: number | null; humidity?: number | null; windKph?: number | null; timestamp?: string | null }>;
}