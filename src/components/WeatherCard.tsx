'use client';

import { useState, useMemo, useEffect } from 'react';
import { CloudSunIcon, SunSmallIcon } from './Icons';

interface WeatherCardProps {
    cities: Record<string, { lat: number, lon: number }>;
}

export default function WeatherCard({ cities }: WeatherCardProps) {
    const [selectedCity, setSelectedCity] = useState('Ushuaia');
    const [weatherData, setWeatherData] = useState<any>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch('/data/weather.json');
                const data = await res.json();
                setWeatherData(data);
            } catch (error) {
                console.error("Error fetching weather:", error);
            }
        };
        fetchWeather();
    }, []);

    return (
        <section className="card-wotech overflow-hidden">
            {/* City Selector Tabs */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0">
                    {Object.keys(cities).map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all duration-200 whitespace-nowrap ${
                                selectedCity === city
                                    ? 'bg-accent-primary text-white shadow-sm'
                                    : 'text-text-tertiary hover:text-text-primary hover:bg-white'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/8 rounded-lg border border-accent-primary/15 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-accent-primary uppercase tracking-tight">En vivo</span>
                </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
                {/* Top: Temp + Condition */}
                <div className="flex items-center gap-4 sm:gap-8">
                    <div className="flex items-start">
                        <span className="text-6xl sm:text-7xl md:text-8xl font-black text-text-primary tracking-tighter tabular-nums leading-none">
                            {weatherData?.[selectedCity]?.temp || '--'}
                        </span>
                        <span className="text-accent-primary text-3xl sm:text-4xl mt-1 font-black">°</span>
                    </div>
                    <div className="w-14 h-14 sm:w-20 sm:h-20 text-accent-primary opacity-90 shrink-0">
                        <CloudSunIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-xl font-black text-text-primary tracking-tight font-display leading-tight">
                            {weatherData?.[selectedCity]?.condition || 'Cargando...'}
                        </div>
                        <p className="text-xs font-medium text-text-tertiary mt-1">
                            <span className="text-accent-primary font-bold">{selectedCity}</span>
                        </p>
                    </div>
                </div>

                {/* Forecast Row */}
                <div className="grid grid-cols-3 gap-3">
                    {weatherData?.[selectedCity]?.forecast.slice(0, 3).map((f: any, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center gap-2 hover:bg-white hover:shadow-md transition-all">
                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tight">{f.day}</span>
                            <div className="text-accent-primary w-6 h-6 sm:w-8 sm:h-8">
                                <SunSmallIcon />
                            </div>
                            <span className="text-base sm:text-lg font-black text-text-primary">{f.temp}°</span>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="relative h-44 sm:h-56 md:h-64 rounded-xl overflow-hidden border border-slate-100 shadow-inner group/map">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://embed.windy.com/embed2.html?lat=${cities[selectedCity]?.lat || -54.8019}&lon=${cities[selectedCity]?.lon || -68.303}&zoom=7&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                        frameBorder="0"
                        className="absolute inset-0 opacity-80 hover:opacity-100 transition-opacity duration-700"
                    />
                    {/* Overlay label */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-100 shadow flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Mapa en vivo</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
