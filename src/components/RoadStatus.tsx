'use client';

import { useState, useEffect } from 'react';

interface RouteSegment {
    segment: string;
    status: string;
    details: string;
    severity: 'success' | 'warning' | 'error';
}

export default function RoadStatus() {
    const [activeTab, setActiveTab] = useState<'rn3' | 'complementary'>('rn3');
    const [routesData, setRoutesData] = useState<{ rn3: RouteSegment[], complementary: RouteSegment[] } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/routes.json');
                const data = await response.json();
                setRoutesData(data);
            } catch (error) {
                console.error("Error fetching road status:", error);
            }
        };
        fetchData();
    }, []);

    const currentRoutes = routesData ? routesData[activeTab] : [];

    return (
        <div className="glass-card overflow-hidden bg-slate-900/40 text-white p-6 shadow-2xl backdrop-blur-xl border-slate-700/50">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-black tracking-tight text-zinc-100">Estado de Rutas</h2>
            </div>

            <div className="flex p-1 bg-slate-800/50 rounded-2xl mb-8 w-fit mx-auto">
                <button
                    onClick={() => setActiveTab('rn3')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'rn3' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-100'}`}
                >
                    Ruta Nacional Nº3
                </button>
                <button
                    onClick={() => setActiveTab('complementary')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'complementary' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-100'}`}
                >
                    Rutas Complementarias
                </button>
            </div>

            <div className="space-y-4 mb-8">
                {currentRoutes.map((route, idx) => (
                    <div key={idx} className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4 transition-all hover:bg-slate-800/50 group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-zinc-100 group-hover:text-amber-500 transition-colors">{route.segment}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${route.severity === 'success' ? 'text-emerald-400' :
                                    route.severity === 'warning' ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                {route.status}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium line-clamp-2">
                            {route.details}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-500 font-black text-sm uppercase tracking-[0.2em]">
                        <span className="animate-pulse">✨</span> Resumen Inteligente de Seguridad Vial
                    </div>

                    <p className="text-zinc-400 text-sm max-w-sm leading-relaxed font-medium">
                        Combina el parte de Vialidad con alertas de Defensa Civil para obtener un reporte completo de seguridad.
                    </p>

                    <button
                        onClick={() => {
                            setIsGenerating(true);
                            setTimeout(() => setIsGenerating(false), 2000);
                        }}
                        disabled={isGenerating}
                        className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-3 shadow-xl shadow-amber-500/20"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <span className="text-base">✨</span> Generar Resumen con IA
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Fuentes: Vialidad Nacional y <span className="text-amber-500/70 border-b border-transparent hover:border-amber-500/50 cursor-pointer transition-colors">Defensa Civil</span> (simulado)
                </p>
            </div>
        </div>
    );
}
