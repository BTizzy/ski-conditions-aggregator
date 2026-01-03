// OpenWeather integration removed.
// This file remains as a compatibility shim so imports won't immediately break.
export async function fetchCurrentWeather(): Promise<never> {
  throw new Error('OpenWeather integration removed. Use lib/snowModel.ts and NWS data (lib/nws.ts) instead.');
}