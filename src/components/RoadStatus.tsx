'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateRoadStatusSummary } from '@/services/geminiService';
import { ZapIcon } from './Icons';

interface RouteSegment {
    segment: string;
    status: string;
    details: string;
    severity: 'success' | 'warning' | 'error';
}

interface RoutesData {
    rn3: RouteSegment[];
    complementary: RouteSegment[];
}

export default function RoadStatus() {
    const [activeTab, setActiveTab] = useState<'rn3' | 'complementary'>('rn3');
    const [routesData, setRoutesData] = useState<RoutesData | null>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/routes.json');
                const data = await response.json();
                setRoutesData(data);
            } catch (error) {
                console.error("Error al obtener estado de rutas:", error);
            }
        };
        fetchData();
    }, []);

    const currentRoutes = routesData ? routesData[activeTab] : [];

    // Generar resumen automático del estado de rutas basado en los datos
    const roadSummary = useMemo(() => {
        if (!routesData) return null;

        const allRoutes = [...routesData.rn3, ...routesData.complementary];
        const criticalRoutes = allRoutes.filter(r => r.severity === 'error');
        const warningRoutes = allRoutes.filter(r => r.severity === 'warning');
        const normalRoutes = allRoutes.filter(r => r.severity === 'success');

        let summary = '📍 RESUMEN DEL ESTADO DE RUTAS - TIERRA DEL FUEGO\n\n';

        if (criticalRoutes.length > 0) {
            summary += '🔴 ALERTAS CRÍTICAS:\n';
            criticalRoutes.forEach(r => {
                summary += `• ${r.segment}: ${r.status}. ${r.details}\n`;
            });
            summary += '\n';
        }

        if (warningRoutes.length > 0) {
            summary += '🟡 PRECAUCIONES:\n';
            warningRoutes.forEach(r => {
                summary += `• ${r.segment}: ${r.status}. ${r.details}\n`;
            });
            summary += '\n';
        }

        if (normalRoutes.length > 0) {
            summary += '🟢 TRANSITABLES:\n';
            normalRoutes.forEach(r => {
                summary += `• ${r.segment}: ${r.details}\n`;
            });
        }

        return summary;
    }, [routesData]);

    // Versión corta del resumen para mostrar en la UI
    const shortSummary = useMemo(() => {
        if (!routesData) return 'Cargando información...';

        const allRoutes = [...routesData.rn3, ...routesData.complementary];
        const criticalCount = allRoutes.filter(r => r.severity === 'error').length;
        const warningCount = allRoutes.filter(r => r.severity === 'warning').length;
        const normalCount = allRoutes.filter(r => r.severity === 'success').length;

        if (criticalCount > 0) {
            const critical = allRoutes.find(r => r.severity === 'error');
            return `⚠️ Atención: ${critical?.segment} presenta ${critical?.status.toLowerCase()}. ${criticalCount > 1 ? `Hay ${criticalCount} alertas activas.` : ''} Se recomienda consultar las fuentes oficiales antes de viajar. ${warningCount} tramos con precaución y ${normalCount} transitables sin inconvenientes.`;
        } else if (warningCount > 0) {
            return `ℹ️ Estado general: ${warningCount} tramos requieren precaución (mayormente por condiciones climáticas). ${normalCount} tramos transitables normalmente. Condiciones favorables para circular con los cuidados habituales.`;
        } else {
            return `✅ Excelente: Todos los tramos de la red vial fueguina se encuentran transitables sin inconvenientes. Condiciones óptimas para circular.`;
        }
    }, [routesData]);

    const handleAIAnalysis = async () => {
        if (!routesData) return;
        setIsAnalyzing(true);
        try {
            const allRoutes = [...routesData.rn3, ...routesData.complementary];
            const summary = await generateRoadStatusSummary(allRoutes);
            setAiSummary(summary);
        } catch (error) {
            console.error("Error al generar análisis de IA:", error);
            setAiSummary("No se pudo conectar con el motor de IA. Por favor reintente más tarde.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display">Estado de Rutas</h2>
                    <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Información en vivo desde Tierra del Fuego</p>
                </div>
            </div>

            {/* Resumen del estado de rutas */}
            <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 rounded-[2rem] p-6 mb-10 border border-accent-primary/10 glass-card">
                <div className="flex items-center gap-2.5 text-accent-primary font-bold text-xs uppercase tracking-tight mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resumen del Estado Vial
                </div>
                <p className="text-text-secondary text-sm leading-relaxed font-bold">
                    {aiSummary || shortSummary}
                </p>
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-[10px] text-text-tertiary italic opacity-70">
                        Información extraída de Vialidad Nacional y Defensa Civil
                    </p>
                    <button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isAnalyzing ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-surface-primary shadow-glow-accent'}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-3 h-3 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <ZapIcon className="w-3 h-3" />
                                Reporte IA
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex p-1.5 bg-surface-primary/50 rounded-[var(--radius-card)] mb-10 w-fit border border-accent-primary/10">
                <button
                    onClick={() => setActiveTab('rn3')}
                    className={`px-7 py-3 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 ${activeTab === 'rn3' ? 'bg-accent-primary text-surface-primary shadow-xl shadow-accent-primary/20' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                    Ruta Nacional 3
                </button>
                <button
                    onClick={() => setActiveTab('complementary')}
                    className={`px-7 py-3 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 ${activeTab === 'complementary' ? 'bg-accent-primary text-surface-primary shadow-xl shadow-accent-primary/20' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                    Rutas Complementarias
                </button>
            </div>

            <div className="space-y-4 mb-10">
                {currentRoutes.map((route, idx) => (
                    <div key={idx} className="bg-surface-primary/30 border border-accent-primary/5 rounded-[1.5rem] p-5 transition-all hover:bg-surface-elevated hover:shadow-xl hover:shadow-accent-primary/5 group border-transparent hover:border-accent-primary/20">
                        <div className="flex justify-between items-start mb-2.5">
                            <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors text-base font-display">{route.segment}</h3>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight border ${route.severity === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                route.severity === 'warning' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {route.status}
                            </div>
                        </div>
                        <p className="text-sm text-text-tertiary leading-relaxed font-medium">
                            {route.details}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-surface-primary/50 rounded-[2rem] p-8 text-center relative overflow-hidden group border border-accent-primary/10 glass-card">
                <div className="flex flex-col items-center gap-5 relative z-10">
                    <div className="flex items-center gap-2.5 text-accent-primary font-bold text-xs uppercase tracking-tight">
                        <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse shadow-glow-accent" /> Información Oficial
                    </div>

                    <p className="text-text-secondary text-sm max-w-[280px] leading-relaxed font-bold">
                        Accedé a los reportes en tiempo real y alertas oficiales directamente desde las fuentes.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        <a
                            href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-accent-primary text-surface-primary px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-glow-accent border border-accent-primary/20"
                        >
                            Vialidad Nacional
                        </a>
                        <a
                            href="http://vialidadtdf.gob.ar/estado-de-rutas/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-accent-secondary text-surface-primary px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-glow border border-accent-secondary/20"
                        >
                            Vialidad Provincial
                        </a>
                        <a
                            href="https://www.facebook.com/SuDefensaCivil/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-surface-elevated text-text-primary px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl border border-accent-primary/10"
                        >
                            Defensa Civil (FB)
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-tight">
                    Fuentes de datos: <span className="text-text-secondary border-b border-accent-primary/20">Vialidad Nacional</span> y <span className="text-accent-primary font-bold border-b border-accent-primary/20">Defensa Civil</span>
                </p>
            </div>
        </div>
    );
}
