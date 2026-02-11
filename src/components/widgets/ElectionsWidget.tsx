'use client';

import React, { useState, useCallback } from 'react';
import { ZapIcon } from '../Icons';
import { generateElectionsSummary } from '@/services/geminiService';

export default function ElectionsWidget() {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSummary('');
        try {
            const result = await generateElectionsSummary();
            setSummary(result);
        } catch (err) {
            setError('Ocurrió un error al contactar al servicio de IA.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="glass-card-accent overflow-hidden p-10 shadow-2xl shadow-accent-primary/10 transition-all duration-500 border border-accent-primary/20">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-lg border border-accent-primary/20 tracking-[0.2em] uppercase">Observatorio 2025</span>
                    </div>
                    <h2 className="text-3xl font-black text-text-primary tracking-tighter mb-4 font-display">Elecciones <span className="text-accent-primary">Legislativas</span></h2>
                    <p className="text-text-secondary text-base leading-relaxed max-w-lg">
                        Análisis proyectivo sobre la conformación del Congreso y el impacto político de los comicios de mitad de término.
                    </p>
                </div>

                <div className="w-20 h-20 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary shadow-glow-accent shrink-0">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h10v8H7z" /><path d="M5 15H2v6h20v-6h-3" /><path d="M12 2v8" /><path d="m9 5 3-3 3 3" /></svg>
                </div>
            </div>

            <div className="bg-surface-primary/40 rounded-[2.5rem] p-8 border border-accent-primary/10">
                <div className="flex flex-col items-center text-center">
                    <p className="text-text-tertiary text-sm mb-8 font-medium italic">
                        "Utiliza nuestro agente de IA para procesar la información estructural y normativa de las elecciones 2025."
                    </p>

                    <button
                        onClick={handleGenerateSummary}
                        disabled={isLoading}
                        className={`flex items-center gap-4 px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isLoading || summary ? 'bg-accent-primary/20 text-accent-primary shadow-glow-accent' : 'bg-accent-primary text-surface-primary shadow-xl shadow-accent-primary/30 hover:scale-105'
                            } disabled:opacity-50`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                                Procesando Inteligencia...
                            </>
                        ) : summary ? (
                            <>
                                <ZapIcon className="w-4 h-4" />
                                Actualizar Análisis
                            </>
                        ) : (
                            <>
                                <ZapIcon className="w-4 h-4" />
                                Generar Resumen Estratégico
                            </>
                        )}
                    </button>
                </div>

                {summary && (
                    <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full shadow-glow" />
                            <h4 className="text-xs font-bold text-accent-secondary uppercase tracking-widest">Reporte Gemini-Flash</h4>
                        </div>
                        <div className="text-text-primary text-lg leading-relaxed font-bold border-l-4 border-accent-primary/30 pl-8 py-2">
                            {summary}
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button className="text-[10px] font-bold text-accent-primary uppercase tracking-widest hover:underline">Exportar Informe</button>
                            <button className="text-[10px] font-bold text-accent-primary uppercase tracking-widest hover:underline">Ver Candidatos por Zona</button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
