'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudFog, CloudLightning, Wind, Droplets, Thermometer, AlertCircle, Sunrise, Sunset, SunDim, AlertTriangle, Activity, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

const EarthquakeMap = dynamic(() => import('./EarthquakeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-b-3xl border-t border-slate-300 dark:border-[#222]">
      <Activity className="w-8 h-8 mb-4 animate-pulse text-blue-500" /> 
      <span className="text-xs font-bold uppercase tracking-widest">Iniciando Motor Geológico...</span>
    </div>
  )
});

const WeatherAlertMap = dynamic(() => import('./WeatherAlertMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-xl border border-slate-300 dark:border-[#222]">
        <AlertTriangle className="w-8 h-8 mb-4 animate-pulse text-yellow-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Alertas SMN...</span>
      </div>
    )
  });

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
  if (code === 1 || code === 2 || code === 3) return <Cloud className={`${className} text-slate-900 dark:text-white drop-shadow-md`} />;
  if (code >= 45 && code <= 48) return <CloudFog className={`${className} text-slate-800 dark:text-gray-200 drop-shadow-md`} />;
  if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-200 drop-shadow-md`} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-cyan-100 drop-shadow-md`} />;
  if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-300 drop-shadow-md`} />;
  if (code >= 85 && code <= 86) return <CloudSnow className={`${className} text-cyan-100 drop-shadow-md`} />;
  if (code >= 95) return <CloudLightning className={`${className} text-purple-300 drop-shadow-md`} />;
  return <Cloud className={`${className} text-slate-900 dark:text-white`} />;
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
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display uppercase">Clima Regional</h2>
          <p className="text-[13px] text-slate-500 dark:text-gray-400 font-medium">Condiciones meteorológicas y monitoreo geológico en tiempo real.</p>
        </div>
        
        {/* City Tabs */}
        <div className="flex bg-slate-100/50 dark:bg-black/40 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-white/5 items-center w-full md:w-auto overflow-x-auto scrollbar-hide">
          {dataList.map((loc, idx) => (
            <button
              key={loc.id}
              onClick={() => setSelectedIndex(idx)}
              className={`whitespace-nowrap px-6 py-2.5 text-[11px] font-black uppercase tracking-tight rounded-[1rem] transition-all duration-300 ${
                selectedIndex === idx 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card */}
      <div className={`relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br ${gradientClass} text-slate-900 dark:text-white transition-all duration-700`}>
        {/* Abstract Overlays */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-200 dark:bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-5 md:p-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Current Weather */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                    AHORA
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white/80">Hoy, {new Date().toLocaleDateString('es-AR')}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 drop-shadow-sm leading-none">{currentData.name}</h1>
                <p className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white/90 mt-2 flex items-center gap-3">
                  {getWeatherIcon(currentData.current.weatherCode, "w-8 h-8")} 
                  {getWeatherDescription(currentData.current.weatherCode)}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-12">
                <span className="text-[90px] md:text-[130px] font-black tracking-tighter leading-none drop-shadow-2xl font-display">
                  {currentData.current.temperature.toFixed(0)}°
                </span>
                <div className="w-16 md:w-20 h-1 md:h-1.5 bg-white/20 rounded-full"></div>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-4 mt-8">
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 flex-1 min-w-[120px]">
                  <Thermometer className="w-4 h-4 md:w-5 md:h-5 text-slate-900 dark:text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-900 dark:text-white/70">Sensación</span>
                    <span className="text-xs md:text-sm font-bold">{currentData.current.apparentTemperature.toFixed(0)}°C</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 flex-1 min-w-[120px]">
                  <Wind className="w-4 h-4 md:w-5 md:h-5 text-slate-900 dark:text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-900 dark:text-white/70">Viento</span>
                    <span className="text-xs md:text-sm font-bold">{currentData.current.windSpeed.toFixed(1)} km/h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 flex-1 min-w-[120px]">
                  <Droplets className="w-4 h-4 md:w-5 md:h-5 text-slate-900 dark:text-white/80" />
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-900 dark:text-white/70">Humedad</span>
                    <span className="text-xs md:text-sm font-bold">{currentData.current.humidity}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Astro & Forecast */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Extra info cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-black/10 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-3 md:p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Sunrise className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 mb-1 md:mb-2" />
                  <span className="text-[9px] md:text-xs font-bold text-slate-900 dark:text-white/70 uppercase">Salida</span>
                  <span className="text-sm md:text-lg font-bold">{formatTime(currentData.daily.sunrise[0])}</span>
                </div>
                <div className="bg-black/10 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-3 md:p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Sunset className="w-5 h-5 md:w-6 md:h-6 text-orange-400 mb-1 md:mb-2" />
                  <span className="text-[9px] md:text-xs font-bold text-slate-900 dark:text-white/70 uppercase">Puesta</span>
                  <span className="text-sm md:text-lg font-bold">{formatTime(currentData.daily.sunset[0])}</span>
                </div>
                <div className="bg-black/10 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-3 md:p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                  <SunDim className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-300 mb-1 md:mb-2" />
                  <span className="text-[9px] md:text-xs font-bold text-slate-900 dark:text-white/70 uppercase">UV Máx</span>
                  <span className="text-sm md:text-lg font-bold">{currentData.daily.uvIndexMax[0]?.toFixed(1)}</span>
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-black/20 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex-1 shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white/40 mb-6 flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 opacity-50" /> Pronóstico {currentData.daily.time.length} Días
                </h3>
                <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                  {currentData.daily.time.slice(0, 7).map((timeString, idx) => (
                    <div key={timeString} className={`flex flex-col items-center justify-between py-4 px-4 min-w-[80px] md:min-w-0 rounded-2xl transition-all duration-300 border border-white/0 hover:border-slate-300 dark:border-white/10 ${idx === 0 ? 'bg-slate-200 dark:bg-white/10 ring-1 ring-white/20' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10'}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white/70">{getDayName(timeString, idx)}</span>
                      <div className="my-3 transform hover:scale-110 transition-transform">
                        {getWeatherIcon(currentData.daily.weatherCode[idx], "w-8 h-8")}
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-lg font-black tracking-tight">{currentData.daily.temperatureMax[idx].toFixed(0)}°</span>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white/40">{currentData.daily.temperatureMin[idx].toFixed(0)}°</span>
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
        
        {/* SMN Alertas Custom Map */}
        <div className="bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#222] rounded-3xl p-0 relative overflow-hidden flex flex-col shadow-lg group hover:border-slate-300 dark:border-[#333] transition-colors">
           <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-300 dark:border-[#222] bg-white dark:bg-[#121212] z-10 shrink-0">
              <div className="flex items-center gap-3 text-yellow-500">
                 <AlertTriangle className="w-6 h-6" />
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Alertas Meteorológicas</h3>
              </div>
              <div className="flex gap-2">
                 <span className="text-[9px] uppercase font-black bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">Mapa Activo</span>
              </div>
           </div>
           <div className="w-full h-[350px] md:h-[500px] bg-white dark:bg-[#0c0c0c] relative isolate">
              <WeatherAlertMap />
           </div>
        </div>

        {/* Sismos y USGS */}
        <div className="bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#222] rounded-3xl p-0 flex flex-col shadow-lg overflow-hidden group hover:border-[#444] transition-colors relative">
           <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-300 dark:border-[#222] bg-white dark:bg-[#121212] z-10 shrink-0">
              <div className="flex items-center gap-3">
                 <Activity className="w-6 h-6 text-blue-500" />
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Sismos en Tiempo Real</h3>
              </div>
              <div className="flex gap-2">
                 <a href="https://www.inpres.gob.ar/desktop/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-black bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-gray-400 transition-colors">INPRES</a>
                 <a href="http://earg.fcaglp.unlp.edu.ar/sismologia/" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-black bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-gray-400 transition-colors">EARG</a>
              </div>
           </div>
           <div className="w-full h-[350px] md:h-[500px] bg-white dark:bg-[#0c0c0c] relative isolate">
              <EarthquakeMap />
           </div>
        </div>

      </div>

    </div>
  );
}
