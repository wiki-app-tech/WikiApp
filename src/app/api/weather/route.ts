import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LOCATIONS = [
  { id: 'ushuaia', name: 'Ushuaia', lat: -54.8019, lon: -68.3030, fallbackTemp: 6, fallbackMax: 9, fallbackMin: 2 },
  { id: 'riogrande', name: 'Río Grande', lat: -53.7833, lon: -67.7000, fallbackTemp: 7, fallbackMax: 10, fallbackMin: 1 },
  { id: 'tolhuin', name: 'Tolhuin', lat: -54.5117, lon: -67.1936, fallbackTemp: 5, fallbackMax: 8, fallbackMin: 0 },
  { id: 'malvinas', name: 'Islas Malvinas', lat: -51.6977, lon: -57.8517, fallbackTemp: 6, fallbackMax: 8, fallbackMin: 3 },
  { id: 'antartida', name: 'Antártida', lat: -64.2406, lon: -56.6214, fallbackTemp: -5, fallbackMax: -2, fallbackMin: -9 },
];

export async function GET() {
  try {
    const promises = LOCATIONS.map(async (loc) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=America%2FArgentina%2FUshuaia`;

        const res = await fetch(url, {
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) throw new Error(`Failed to fetch weather for ${loc.name}`);
        const data = await res.json();

        return {
          id: loc.id,
          name: loc.name,
          current: {
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
          },
          daily: {
            time: data.daily.time,
            weatherCode: data.daily.weather_code,
            temperatureMax: data.daily.temperature_2m_max,
            temperatureMin: data.daily.temperature_2m_min,
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset,
            uvIndexMax: data.daily.uv_index_max,
          }
        };
      } catch {
        const todayStr = new Date().toISOString().split('T')[0];
        return {
          id: loc.id,
          name: loc.name,
          current: {
            temperature: loc.fallbackTemp,
            apparentTemperature: loc.fallbackTemp - 2,
            humidity: 72,
            windSpeed: 24,
            weatherCode: 2,
          },
          daily: {
            time: [todayStr],
            weatherCode: [2],
            temperatureMax: [loc.fallbackMax],
            temperatureMin: [loc.fallbackMin],
            sunrise: [`${todayStr}T08:30`],
            sunset: [`${todayStr}T18:45`],
            uvIndexMax: [2],
          }
        };
      }
    });

    const weatherData = await Promise.all(promises);
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
