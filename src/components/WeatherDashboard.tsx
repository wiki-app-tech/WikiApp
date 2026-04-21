'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudFog, CloudLightning, Wind, Droplets, Thermometer, AlertCircle, Loader2 } from 'lucide-react';

interface WeatherData {
  id: string;
  name: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

const LOCATIONS = [
  { id: 'ushuaia', name: 'Ushuaia', lat: -54.8019, lon: -68.3030 },
  { id: 'riogrande', name: 'Río Grande', lat: -53.7833, lon: -67.7000 },
  { id: 'tolhuin', name: 'Tolhuin', lat: -54.5117, lon: -67.1936 },
  { id: 'malvinas', name: 'Islas Malvinas', lat: -51.6977, lon: -57.8517 },
  { id: 'antartida', name: 'Antártida', lat: -64.2406, lon: -56.6214 },
];

// Open-Meteo Weather Codes interpretation
const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-10 h-10 text-[var(--color-accent-primary)] drop-shadow-md" />; // Clear sky
  if (code === 1 || code === 2 || code === 3) return <Cloud className="w-10 h-10 text-[var(--color-text-secondary)] drop-shadow-md" />; // Mainly clear, partly cloudy, and overcast
  if (code >= 45 && code <= 48) return <CloudFog className="w-10 h-10 text-gray-500 drop-shadow-md" />; // Fog
  if (code >= 51 && code <= 67) return <CloudRain className="w-10 h-10 text-blue-500 drop-shadow-md" />; // Drizzle & Rain
  if (code >= 71 && code <= 77) return <CloudSnow className="w-10 h-10 text-cyan-400 drop-shadow-md" />; // Snow fall
  if (code >= 80 && code <= 82) return <CloudRain className="w-10 h-10 text-blue-600 drop-shadow-md" />; // Rain showers
  if (code >= 85 && code <= 86) return <CloudSnow className="w-10 h-10 text-cyan-500 drop-shadow-md" />; // Snow showers
  if (code >= 95) return <CloudLightning className="w-10 h-10 text-purple-500 drop-shadow-md" />; // Thunderstorm
  return <Cloud className="w-10 h-10 text-[var(--color-text-secondary)]" />; // Default
};

const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Despejado';
  if (code === 1) return 'Mayormente Despejado';
  if (code === 2) return 'Parcialmente Nublado';
  if (code === 3) return 'Nublado';
  if (code >= 45 && code <= 48) return 'Niebla';
  if (code === 51 || code === 53 || code === 55) return 'Llovizna';
  if (code >= 61 && code <= 67) return 'Lluvia';
  if (code >= 71 && code <= 77) return 'Nieve';
  if (code >= 80 && code <= 82) return 'Chaparrones';
  if (code >= 85 && code <= 86) return 'Nevadas Fuertes';
  if (code >= 95) return 'Tormenta Eléctrica';
  return 'Desconocido';
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<Exclude<WeatherData, 'id' | 'name'>[] & { id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const promises = LOCATIONS.map(async (loc) => {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=America%2FArgentina%2FUshuaia`);
          if (!res.ok) throw new Error(`Error fetching ${loc.name}`);
          const data = await res.json();
          return {
            id: loc.id,
            name: loc.name,
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
          };
        });

        const results = await Promise.all(promises);
        setWeatherData(results);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('No se pudo cargar la información del clima. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Auto refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex-1">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Clima Regional</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1 font-medium">Condiciones meteorológicas actualizadas en tiempo real.</p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-accent-primary)]/20 shadow-sm">
          <Cloud className="w-4 h-4" /> REPORTE METEOROLÓGICO
        </div>
      </div>

      {loading && weatherData.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl h-48"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Error de Conexión</h3>
          <p className="text-red-600 dark:text-red-300 text-center max-w-md text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {weatherData.map((data) => (
            <div 
              key={data.id} 
              className="group flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-accent-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-accent-primary)]/5"
            >
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-[var(--color-accent-primary)] uppercase tracking-widest bg-[var(--color-accent-primary)]/10 px-2 py-1 rounded-md">
                      ESTACIÓN
                    </span>
                    <h3 className="font-bold text-[var(--color-text-primary)] text-2xl mt-3">{data.name}</h3>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">{getWeatherDescription(data.weatherCode)}</p>
                  </div>
                  <div className="bg-[var(--color-surface-sunken)] p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {getWeatherIcon(data.weatherCode)}
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold tracking-tighter text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors duration-300">
                    {data.temperature.toFixed(1)}°
                  </span>
                  <span className="text-lg font-bold text-[var(--color-text-tertiary)]">C</span>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50 grid grid-cols-3 gap-2 mt-auto">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <Thermometer className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mt-1">Sensación</span>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">{data.apparentTemperature.toFixed(1)}°</span>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center text-center px-2 border-x border-[var(--color-border-subtle)]">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mt-1">Humedad</span>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">{data.humidity}%</span>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mt-1">Viento</span>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">{data.windSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
