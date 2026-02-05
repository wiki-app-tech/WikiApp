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
        <section className="bg-[#020617] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/40 mb-12 border border-blue-500/10 transition-all duration-500 hover:shadow-blue-900/60 ring-1 ring-white/5">
            {/* Navigation Superior */}
            <div className="p-6 bg-white/5 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between overflow-x-auto no-scrollbar">
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    {Object.keys(cities).map(city => (
                        <button
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${selectedCity === city
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest leading-none">LIVE RADAR</span>
                </div>
            </div>

            <div className="p-10 lg:p-14 flex flex-col lg:flex-row gap-16">
                {/* Héroe de Datos */}
                <div className="lg:w-1/3 flex flex-col justify-center">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums leading-none">
                            {weatherData?.[selectedCity]?.temp || '--'}
                            <span className="text-yellow-400 text-6xl md:text-7xl align-top ml-2">°</span>
                        </div>
                        <div className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                            <CloudSunIcon />
                        </div>
                    </div>
                    <div className="space-y-2 mb-10">
                        <div className="text-2xl md:text-3xl font-black text-white capitalize tracking-tight">{weatherData?.[selectedCity]?.condition || 'Cargando...'}</div>
                        <div className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.2em]">Pronóstico para {selectedCity}</div>
                    </div>

                    {/* Pronóstico Extendido */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
                        {weatherData?.[selectedCity]?.forecast.slice(0, 3).map((f: any, i: number) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all hover:-translate-y-1">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{f.day}</span>
                                <div className="text-yellow-500 w-8 h-8">
                                    <SunSmallIcon />
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-white">{f.temp}°</span>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Max/Min</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sección de Mapa / Radar */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 relative aspect-video lg:aspect-auto min-h-[400px] bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/10 group/map shadow-inner shadow-black/50">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://embed.windy.com/embed2.html?lat=${cities[selectedCity]?.lat || -54.8019}&lon=${cities[selectedCity]?.lon || -68.303}&detailLat=${cities[selectedCity]?.lat || -54.8019}&detailLon=${cities[selectedCity]?.lon || -68.303}&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                            frameBorder="0"
                            className="absolute inset-0 opacity-80 contrast-[1.2] brightness-[0.8] hover:opacity-100 transition-opacity duration-700"
                        ></iframe>

                        {/* Controles de Reproducción Simplificados */}
                        <div className="absolute bottom-6 left-6 right-6 bg-[#020617]/80 backdrop-blur-2xl px-6 py-4 rounded-[1.5rem] border border-white/10 flex items-center justify-between opacity-0 group-hover/map:opacity-100 transition-all duration-500 translate-y-4 group-hover/map:translate-y-0">
                            <div className="flex items-center gap-4">
                                <button className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-xl shadow-yellow-400/40 active:scale-95 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor"><path d="M8 5v14l11-7z" /></svg>
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Radar en tiempo real</span>
                                    <span className="text-[10px] text-zinc-400 mt-1">Sincronizado: ahora</span>
                                </div>
                            </div>

                            {/* Leyenda de Intensidad */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full border border-white/10">
                                    <div className="flex gap-1">
                                        <div className="w-2.5 h-1.5 rounded-full bg-blue-500/80" />
                                        <div className="w-2.5 h-1.5 rounded-full bg-green-500/80" />
                                        <div className="w-2.5 h-1.5 rounded-full bg-yellow-500/80" />
                                        <div className="w-2.5 h-1.5 rounded-full bg-red-500/80" />
                                    </div>
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Precipitación</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
