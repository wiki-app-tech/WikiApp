'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudFog, CloudLightning, Wind, Droplets, Thermometer, AlertCircle, Sunrise, Sunset, SunDim, AlertTriangle, Activity, ExternalLink } from 'lucide-react';

interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
}

interface WeatherData {
  id: string;
  name: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
  };
  daily: DailyForecast;
}

// Map backgrounds depending on the weather code
const getWeatherGradient = (code: number) => {
  if (code === 0) return 'from-amber-400 to-orange-500'; // Clear
  if (code === 1 || code === 2) return 'from-blue-400 to-amber-200'; // Partly cloudy
  if (code === 3) return 'from-gray-400 to-gray-600'; // Overcast
  if (code >= 45 && code <= 48) return 'from-slate-300 to-gray-500'; // Fog
  if (code >= 51 && code <= 67) return 'from-blue-600 to-slate-800'; // Rain
  if (code >= 71 && code <= 77) return 'from-blue-200 to-cyan-600'; // Snow
  if (code >= 80 && code <= 82) return 'from-blue-500 to-indigo-800'; // Showers
  if (code >= 85 && code <= 86) return 'from-cyan-300 to-blue-700'; // Snow showers
  if (code >= 95) return 'from-purple-800 to-slate-900'; // Thunderstorm
  return 'from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]';
};

const getWeatherIcon = (code: number, className = "w-10 h-10") => {
  if (code === 0) return <Sun className={`${className} text-yellow-300 drop-shadow-md`} />;
  if (code === 1 || code === 2 || code === 3) return <Cloud className={`${className} text-white drop-shadow-md`} />;
  if (code >= 45 && code <= 48) return <CloudFog className={`${className} text-gray-200 drop-shadow-md`} />;
  if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-200 drop-shadow-md`} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-cyan-100 drop-shadow-md`} />;
  if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-300 drop-shadow-md`} />;
  if (code >= 85 && code <= 86) return <CloudSnow className={`${className} text-cyan-100 drop-shadow-md`} />;
  if (code >= 95) return <CloudLightning className={`${className} text-purple-300 drop-shadow-md`} />;
  return <Cloud className={`${className} text-white`} />;
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

const formatTime = (isoString: string) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDayName = (isoString: string, index: number) => {
  if (index === 0) return 'Hoy';
  if (index === 1) return 'Mañana';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
};

export default function WeatherDashboard() {
  const [dataList, setDataList] = useState<WeatherData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Error de red al cargar clima');
        const data = await res.json();
        setDataList(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('No se pudo cargar la información del clima. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, []);

  if (loading && dataList.length === 0) {
    return (
      <div className="w-full flex-1">
        <div className="animate-pulse bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl h-[600px] w-full mt-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-800 mt-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Error de Conexión</h3>
        <p className="text-red-600 dark:text-red-300 text-center max-w-md text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
          Reintentar
        </button>
      </div>
    );
  }

  if (dataList.length === 0) return null;

  const currentData = dataList[selectedIndex];
  const gradientClass = getWeatherGradient(currentData.current.weatherCode);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Clima Regional</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1 font-medium">Condiciones meteorológicas y pronóstico extendido.</p>
        </div>
        
        {/* City Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl w-full md:w-auto">
          {dataList.map((loc, idx) => (
            <button
              key={loc.id}
              onClick={() => setSelectedIndex(idx)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                selectedIndex === idx 
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-md' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card */}
      <div className={`relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br ${gradientClass} text-white transition-all duration-700`}>
        {/* Abstract Overlays */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-6 md:p-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Current Weather */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                    AHORA
                  </span>
                  <span className="text-sm font-semibold text-white/80">Hoy, {new Date().toLocaleDateString('es-AR')}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-4 drop-shadow-sm">{currentData.name}</h1>
                <p className="text-xl md:text-2xl font-medium text-white/90 mt-2 flex items-center gap-3">
                  {getWeatherIcon(currentData.current.weatherCode, "w-8 h-8")} 
                  {getWeatherDescription(currentData.current.weatherCode)}
                </p>
              </div>

              <div className="flex items-baseline mt-8 gap-3">
                <span className="text-8xl md:text-9xl font-black tracking-tighter drop-shadow-md">
                  {currentData.current.temperature.toFixed(0)}°
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Thermometer className="w-5 h-5 text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70">Sensación</span>
                    <span className="text-sm font-bold">{currentData.current.apparentTemperature.toFixed(0)}°C</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Wind className="w-5 h-5 text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70">Viento</span>
                    <span className="text-sm font-bold">{currentData.current.windSpeed.toFixed(1)} km/h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                  <Droplets className="w-5 h-5 text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70">Humedad</span>
                    <span className="text-sm font-bold">{currentData.current.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Astro & Forecast */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Extra info cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/10 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Sunrise className="w-6 h-6 text-yellow-300 mb-2" />
                  <span className="text-xs font-bold text-white/70 uppercase">Amanecer</span>
                  <span className="text-lg font-bold">{formatTime(currentData.daily.sunrise[0])}</span>
                </div>
                <div className="bg-black/10 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Sunset className="w-6 h-6 text-orange-400 mb-2" />
                  <span className="text-xs font-bold text-white/70 uppercase">Atardecer</span>
                  <span className="text-lg font-bold">{formatTime(currentData.daily.sunset[0])}</span>
                </div>
                <div className="bg-black/10 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <SunDim className="w-6 h-6 text-fuchsia-300 mb-2" />
                  <span className="text-xs font-bold text-white/70 uppercase">UV Máx</span>
                  <span className="text-lg font-bold">{currentData.daily.uvIndexMax[0]?.toFixed(1)}</span>
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-black/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/70 mb-4">Pronóstico {currentData.daily.time.length} Días</h3>
                <div className="grid grid-cols-7 gap-2 h-full">
                  {currentData.daily.time.map((timeString, idx) => (
                    <div key={timeString} className="flex flex-col items-center justify-between pb-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                      <span className="text-[11px] font-bold mt-3 uppercase text-white/80">{getDayName(timeString, idx)}</span>
                      <div className="my-2">
                        {getWeatherIcon(currentData.daily.weatherCode[idx], "w-6 h-6")}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold">{currentData.daily.temperatureMax[idx].toFixed(0)}°</span>
                        <span className="text-xs font-semibold text-white/50">{currentData.daily.temperatureMin[idx].toFixed(0)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Alertas Tempranas y Sismos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
        
        {/* SMN Alertas */}
        <div className="bg-[#121212] border border-red-900/40 rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-lg">
           <div className="flex items-center gap-3 text-red-500 mb-4 z-10 shrink-0">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Alertas Meteorológicas (SMN)</h3>
           </div>
           <div className="flex-1 w-full bg-white rounded-xl overflow-hidden border border-[#333] min-h-[350px]">
              <iframe 
                 src="https://www.smn.gob.ar/alertas" 
                 className="w-full h-full border-none"
                 title="Alertas Oficiales SMN"
                 sandbox="allow-scripts allow-same-origin allow-popups"
              />
           </div>
           <a href="https://www.smn.gob.ar/alertas" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold py-2 px-4 rounded-xl text-center transition-colors text-xs border border-red-500/20">
              Ver alertas a pantalla completa <ExternalLink className="w-3 h-3" />
           </a>
        </div>

        {/* Sismos y USGS */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-0 flex flex-col shadow-lg overflow-hidden group hover:border-[#444] transition-colors relative">
           <div className="p-6 pb-4 flex items-center justify-between border-b border-[#222]">
              <div className="flex items-center gap-3">
                 <Activity className="w-6 h-6 text-blue-500" />
                 <h3 className="text-lg font-bold text-white tracking-tight">Sismos en Tiempo Real</h3>
              </div>
              <div className="flex gap-2">
                 <a href="https://www.inpres.gob.ar/desktop/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-black bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg text-gray-400 transition-colors">INPRES</a>
                 <a href="http://earg.fcaglp.unlp.edu.ar/sismologia/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-black bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg text-gray-400 transition-colors">EARG</a>
              </div>
           </div>
           <div className="w-full h-[320px] bg-[#0c0c0c] relative">
              <iframe 
                 src="https://earthquake.usgs.gov/earthquakes/map/?extent=-55.14121,-71.46606&extent=-53.38005,-65.75317"
                 className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity"
                 title="USGS Earthquakes Map - Tierra del Fuego"
                 loading="lazy"
              />
           </div>
        </div>

      </div>

    </div>
  );
}
