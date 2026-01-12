/**
 * Direct NWS Weather Data
 * Drop synthetic generation, use real hourly data
 */

export async function getHourlyWeather(station: string, hours: number = 24) {
  try {
    const gridPoints = await fetch(`https://api.weather.gov/points/${station}`)
      .then(r => r.json());

    const hourlyUrl = gridPoints.properties.forecastHourly;
    const forecast = await fetch(hourlyUrl).then(r => r.json());

    const hourlyData = forecast.properties.periods.slice(0, hours).map((period: any, i: number) => ({
      hour: i,
      timestamp: new Date(period.startTime).getTime(),
      temp: period.temperature,
      precip: period.probabilityOfPrecipitation?.value ?? 0,
      wind: extractWindSpeed(period.windSpeed),
    }));

    return hourlyData;
  } catch (error) {
    console.error('[WeatherDirect] Failed to fetch hourly data:', error);
    return [];
  }
}

function extractWindSpeed(windStr: string | undefined): number {
  if (!windStr) return 0;
  const match = windStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function useAvailableWeatherData(currentObs: any, hourlyData: any) {
  if (hourlyData && hourlyData.length > 0) {
    return hourlyData;
  }

  if (currentObs) {
    return [
      {
        hour: 0,
        timestamp: currentObs.observationTime?.getTime() ?? Date.now(),
        temp: currentObs.temperature,
        precip: currentObs.precipitation,
        wind: currentObs.windSpeed,
      },
    ];
  }

  return [];
}

export default { getHourlyWeather, useAvailableWeatherData };
