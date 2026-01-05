import { getMultiStationObservations } from './lib/nws.js';

// Test multi-station functionality with Wachusett coordinates
async function testWachusettNWS() {
  try {
    console.log('Testing NWS historical observations for Wachusett Mountain...');

    // Wachusett coordinates from resorts.ts
    const lat = 42.5031;
    const lon = -71.8867;

    console.log(`Fetching multi-station data for Wachusett: ${lat}, ${lon}`);

    const result = await getMultiStationObservations(lat, lon, 7);

    console.log(`\nResults:`);
    console.log(`- Stations found: ${result.stations.length}`);
    console.log(`- Weighted precipitation total: ${result.weightedAverage.precipTotal.toFixed(2)}mm (${(result.weightedAverage.precipTotal / 25.4).toFixed(2)} inches)`);
    console.log(`- Average temperature: ${result.weightedAverage.avgTempC?.toFixed(1)}°C (${((result.weightedAverage.avgTempC * 9/5) + 32)?.toFixed(1)}°F)`);
    console.log(`- Average wind speed: ${result.weightedAverage.avgWindKph?.toFixed(1)} km/h (${(result.weightedAverage.avgWindKph * 0.621371)?.toFixed(1)} mph)`);

    console.log(`\nStation details:`);
    result.stations.forEach((station, index) => {
      console.log(`${index + 1}. ${station.stationId}: ${station.distance.toFixed(1)}km, ${station.precipTotal.toFixed(2)}mm (${(station.precipTotal / 25.4).toFixed(2)}") precip, ${station.observations.length} observations`);
    });

    // Show some recent observations from the closest station
    if (result.stations.length > 0) {
      const closestStation = result.stations[0];
      console.log(`\nRecent observations from closest station (${closestStation.stationId}):`);
      const recentObs = closestStation.observations.slice(-5); // Last 5 observations
      recentObs.forEach(obs => {
        // Extract timestamp from the observation ID URL
        // Format: https://api.weather.gov/stations/KFIT/observations/2026-01-04T01:52:00+00:00
        const idMatch = obs.id?.match(/observations\/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
        const timestamp = idMatch ? new Date(idMatch[1] + '+00:00').toLocaleString() : 'No timestamp';

        // Data is in properties
        const props = obs.properties || {};
        const temp = props.temperature?.value != null ? `${(props.temperature.value * 9/5 + 32).toFixed(1)}°F` : 'No temp';
        const precipHourly = props.precipitationLastHour?.value != null ? `${(props.precipitationLastHour.value).toFixed(2)}mm (${(props.precipitationLastHour.value / 25.4).toFixed(2)}")` : '0.00mm (0.00")';
        const precipLast6 = props.precipitationLast6Hours?.value != null ? `${(props.precipitationLast6Hours.value / 25.4).toFixed(2)}"` : 'N/A';

        // Check for snowfall data
        const snowDepth = props.snowDepth?.value != null ? `${(props.snowDepth.value / 25.4).toFixed(1)}"` : 'N/A';
        const snowfall = props.snowfall?.value != null ? `${(props.snowfall.value / 25.4).toFixed(2)}"` : 'N/A';

        console.log(`  ${timestamp}: ${temp}, ${precipHourly} hourly, snow depth: ${snowDepth}, snowfall: ${snowfall}`);
      });

      // Calculate total precipitation from this station manually
      let manualTotal = 0;
      closestStation.observations.forEach(obs => {
        const props = obs.properties || {};
        const precipMm = props.precipitationLastHour?.value || 0;
        manualTotal += precipMm;
      });
      console.log(`  Manual precipitation total: ${manualTotal.toFixed(2)}mm (${(manualTotal / 25.4).toFixed(2)} inches)`);
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWachusettNWS();