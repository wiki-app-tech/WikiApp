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
        <section className="glass-card mb-12 overflow-hidden ring-4 ring-accent-primary/5 shadow-2xl shadow-accent-primary/5">
            {/* City Selector Tabs */}
            <div className="p-5 border-b border-accent-primary/10 bg-surface-primary/30 flex items-center justify-between">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {Object.keys(cities).map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-6 py-2.5 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${selectedCity === city
                                ? 'bg-accent-primary text-surface-primary shadow-xl shadow-accent-primary/20'
                                : 'text-text-tertiary hover:text-text-primary hover:bg-accent-primary/5'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent-primary/10 rounded-[var(--radius-button)] border border-accent-primary/20 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse shadow-glow-accent" />
                    <span className="text-[10px] font-bold text-accent-primary uppercase tracking-tight">Active Sensor</span>
                </div>
            </div>

            <div className="p-8 lg:p-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Hero Data Section */}
                <div className="lg:w-2/5 flex flex-col justify-center">
                    <div className="flex items-center gap-8 mb-6">
                        <div className="text-[120px] font-black text-text-primary tracking-tighter tabular-nums leading-none">
                            {weatherData?.[selectedCity]?.temp || '--'}
                            <span className="text-accent-primary text-6xl align-top ml-2">°</span>
                        </div>
                        <div className="w-24 h-24 text-accent-primary drop-shadow-glow opacity-90">
                            <CloudSunIcon />
                        </div>
                    </div>

                    <div className="space-y-3 mb-10">
                        <div className="text-3xl font-black text-text-primary tracking-tight font-display">{weatherData?.[selectedCity]?.condition || 'Loading...'}</div>
                        <p className="text-sm font-medium text-text-tertiary">Current climate conditions in <span className="text-accent-primary font-bold">{selectedCity}</span></p>
                    </div>

                    {/* Extended Forecast Tiles */}
                    <div className="grid grid-cols-3 gap-5">
                        {weatherData?.[selectedCity]?.forecast.slice(0, 3).map((f: any, i: number) => (
                            <div key={i} className="bg-surface-primary/50 rounded-3xl p-5 border border-accent-primary/10 flex flex-col items-center gap-3 hover:bg-surface-elevated hover:shadow-xl hover:shadow-accent-primary/5 transition-all hover:-translate-y-1 group">
                                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tight">{f.day}</span>
                                <div className="text-accent-primary w-9 h-9 group-hover:scale-110 transition-transform">
                                    <SunSmallIcon />
                                </div>
                                <span className="text-lg font-black text-text-primary">{f.temp}°</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map/Interactive Section */}
                <div className="flex-1">
                    <div className="relative aspect-[16/10] bg-surface-primary/50 rounded-[2.5rem] overflow-hidden border-8 border-surface-elevated shadow-2xl shadow-accent-primary/5 group/map">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://embed.windy.com/embed2.html?lat=${cities[selectedCity]?.lat || -54.8019}&lon=${cities[selectedCity]?.lon || -68.303}&zoom=7&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                            frameBorder="0"
                            className="absolute inset-0 opacity-80 brightness-[1.05] grayscale-[0.5] hover:grayscale-0 transition-all duration-1000 hue-rotate-[180deg] invert-[0.1]"
                        ></iframe>

                        {/* Control Bar Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 bg-surface-elevated/80 backdrop-blur-xl px-7 py-5 rounded-[2rem] border border-accent-primary/20 shadow-2xl flex items-center justify-between opacity-0 group-hover/map:opacity-100 transition-all duration-500 translate-y-4 group-hover/map:translate-y-0 glass-card">
                            <div className="flex items-center gap-5">
                                <button className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center text-surface-primary shadow-glow-accent active:scale-90 transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-primary tracking-tight leading-none font-display">Live Weather Map</span>
                                    <span className="text-[10px] text-text-tertiary mt-1.5 font-bold uppercase tracking-tight opacity-70">Synced: real-time data</span>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-primary/50 rounded-2xl border border-accent-primary/10">
                                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tight">Wind Intensity</span>
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-1.5 rounded-full bg-accent-primary/20" />
                                    <div className="w-2.5 h-1.5 rounded-full bg-accent-primary/50" />
                                    <div className="w-2.5 h-1.5 rounded-full bg-accent-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
