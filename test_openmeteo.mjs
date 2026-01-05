import { fetchHistoricalWeather, convertToWeeklyObservations, get7DaySnowfallTotal, get24HourSnowfallTotal } from './lib/openmeteo.js';

// Test Open-Meteo integration for Wachusett
async function testOpenMeteoWachusett() {
  try {
    console.log('Testing Open-Meteo historical data for Wachusett Mountain...');

    // Wachusett coordinates
    const lat = 42.5031;
    const lon = -71.8867;

    console.log(`Fetching 7-day historical data for Wachusett: ${lat}, ${lon}`);

    const data = await fetchHistoricalWeather(lat, lon, 7);

    if (!data) {
      console.error('Failed to fetch Open-Meteo data');
      return;
    }

    console.log(`\nData received:`);
    console.log(`- Timezone: ${data.timezone}`);
    console.log(`- Elevation: ${data.elevation}m`);
    console.log(`- Hourly observations: ${data.hourly.time.length}`);

    const weeklyObservations = convertToWeeklyObservations(data);
    const snowfall7d = get7DaySnowfallTotal(data);
    const snowfall24h = get24HourSnowfallTotal(data);

    console.log(`\nSnowfall totals:`);
    console.log(`- 7-day snowfall: ${snowfall7d.toFixed(2)} inches`);
    console.log(`- 24-hour snowfall: ${snowfall24h.toFixed(2)} inches`);

    console.log(`\nWeekly observations (${weeklyObservations.length} days):`);
    weeklyObservations.forEach(obs => {
      console.log(`  ${obs.timestamp.split('T')[0]}: ${obs.tempC?.toFixed(1)}°C, ${obs.precipMm?.toFixed(2)}mm precip`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOpenMeteoWachusett();