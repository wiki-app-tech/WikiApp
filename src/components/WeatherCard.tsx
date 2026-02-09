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
        <section className="glass-card mb-12 overflow-hidden ring-4 ring-white shadow-2xl shadow-blue-500/5">
            {/* City Selector Tabs */}
            <div className="p-5 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {Object.keys(cities).map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-6 py-2.5 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${selectedCity === city
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                                : 'text-zinc-400 hover:text-zinc-600 hover:bg-white'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-[var(--radius-button)] border border-blue-100 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Active Sensor</span>
                </div>
            </div>

            <div className="p-8 lg:p-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Hero Data Section */}
                <div className="lg:w-2/5 flex flex-col justify-center">
                    <div className="flex items-center gap-8 mb-6">
                        <div className="text-[120px] font-black text-zinc-900 tracking-tighter tabular-nums leading-none">
                            {weatherData?.[selectedCity]?.temp || '--'}
                            <span className="text-blue-600 text-6xl align-top ml-2">°</span>
                        </div>
                        <div className="w-24 h-24 text-blue-600 drop-shadow-2xl opacity-90">
                            <CloudSunIcon />
                        </div>
                    </div>

                    <div className="space-y-3 mb-10">
                        <div className="text-3xl font-black text-zinc-900 tracking-tight">{weatherData?.[selectedCity]?.condition || 'Loading...'}</div>
                        <p className="text-sm font-medium text-zinc-400">Current climate conditions in <span className="text-blue-600 font-bold">{selectedCity}</span></p>
                    </div>

                    {/* Extended Forecast Tiles */}
                    <div className="grid grid-cols-3 gap-5">
                        {weatherData?.[selectedCity]?.forecast.slice(0, 3).map((f: any, i: number) => (
                            <div key={i} className="bg-zinc-50/50 rounded-3xl p-5 border border-zinc-100 flex flex-col items-center gap-3 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all hover:-translate-y-1 group">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{f.day}</span>
                                <div className="text-blue-600 w-9 h-9 group-hover:scale-110 transition-transform">
                                    <SunSmallIcon />
                                </div>
                                <span className="text-lg font-black text-zinc-900">{f.temp}°</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map/Interactive Section */}
                <div className="flex-1">
                    <div className="relative aspect-[16/10] bg-zinc-50 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl shadow-zinc-200 group/map">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://embed.windy.com/embed2.html?lat=${cities[selectedCity]?.lat || -54.8019}&lon=${cities[selectedCity]?.lon || -68.303}&zoom=7&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                            frameBorder="0"
                            className="absolute inset-0 opacity-90 brightness-[1.05] grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                        ></iframe>

                        {/* Control Bar Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl px-7 py-5 rounded-[2rem] border border-white shadow-2xl flex items-center justify-between opacity-0 group-hover/map:opacity-100 transition-all duration-500 translate-y-4 group-hover/map:translate-y-0">
                            <div className="flex items-center gap-5">
                                <button className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-[0px_10px_30px_rgba(61,92,255,0.4)] active:scale-90 transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-zinc-900 tracking-tight leading-none">Live Weather Map</span>
                                    <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">Synced: real-time data</span>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Wind Intensity</span>
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-1.5 rounded-full bg-blue-200" />
                                    <div className="w-2.5 h-1.5 rounded-full bg-blue-400" />
                                    <div className="w-2.5 h-1.5 rounded-full bg-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
