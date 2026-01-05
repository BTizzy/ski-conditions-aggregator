import { getMultiStationObservations } from './lib/nws.js';

// Test multi-station functionality with a known resort location
async function testMultiStation() {
  try {
    console.log('Testing multi-station NWS observations...');

    // Test with Vail, Colorado coordinates
    const lat = 39.6403;
    const lon = -106.3742;

    console.log(`Fetching multi-station data for coordinates: ${lat}, ${lon}`);

    const result = await getMultiStationObservations(lat, lon, 7);

    console.log(`\nResults:`);
    console.log(`- Stations found: ${result.stations.length}`);
    console.log(`- Weighted precipitation total: ${result.weightedAverage.precipTotal.toFixed(2)}mm`);
    console.log(`- Average temperature: ${result.weightedAverage.avgTempC?.toFixed(1)}°C`);
    console.log(`- Average wind speed: ${result.weightedAverage.avgWindKph?.toFixed(1)} km/h`);

    console.log(`\nStation details:`);
    result.stations.forEach((station, index) => {
      console.log(`${index + 1}. ${station.stationId}: ${station.distance.toFixed(1)}km, ${station.precipTotal.toFixed(2)}mm precip`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMultiStation();