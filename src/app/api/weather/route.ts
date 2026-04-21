import { NextResponse } from 'next/server';

const LOCATIONS = [
  { id: 'ushuaia', name: 'Ushuaia', lat: -54.8019, lon: -68.3030 },
  { id: 'riogrande', name: 'Río Grande', lat: -53.7833, lon: -67.7000 },
  { id: 'tolhuin', name: 'Tolhuin', lat: -54.5117, lon: -67.1936 },
  { id: 'malvinas', name: 'Islas Malvinas', lat: -51.6977, lon: -57.8517 },
  { id: 'antartida', name: 'Antártida', lat: -64.2406, lon: -56.6214 },
];

export async function GET() {
  try {
    const promises = LOCATIONS.map(async (loc) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=America%2FArgentina%2FUshuaia`;
      
      const res = await fetch(url, { next: { revalidate: 900 } });
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
    });

    const weatherData = await Promise.all(promises);
    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
