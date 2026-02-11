'use client';

import { useState, useEffect, useMemo } from 'react';

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

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-blue-500/5 transition-all duration-300">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 underline decoration-blue-500/20 underline-offset-4">Estado de Rutas</h2>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Información en vivo desde Tierra del Fuego</p>
                </div>
            </div>

            {/* Resumen del estado de rutas */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-6 mb-10 border border-blue-100">
                <div className="flex items-center gap-2.5 text-blue-700 font-bold text-xs uppercase tracking-tight mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resumen del Estado Vial
                </div>
                <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                    {shortSummary}
                </p>
                <p className="text-[10px] text-zinc-400 mt-4 italic">
                    Información extraída de Vialidad Nacional y Defensa Civil de Tierra del Fuego
                </p>
            </div>

            <div className="flex p-1.5 bg-zinc-50 rounded-[var(--radius-card)] mb-10 w-fit">
                <button
                    onClick={() => setActiveTab('rn3')}
                    className={`px-7 py-3 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 ${activeTab === 'rn3' ? 'bg-white text-blue-600 shadow-xl shadow-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    Ruta Nacional 3
                </button>
                <button
                    onClick={() => setActiveTab('complementary')}
                    className={`px-7 py-3 rounded-[var(--radius-button)] text-[11px] font-bold tracking-tight transition-all duration-300 ${activeTab === 'complementary' ? 'bg-white text-blue-600 shadow-xl shadow-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    Rutas Complementarias
                </button>
            </div>

            <div className="space-y-4 mb-10">
                {currentRoutes.map((route, idx) => (
                    <div key={idx} className="bg-zinc-50/50 border border-zinc-100 rounded-[1.5rem] p-5 transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 group border-transparent hover:border-blue-50">
                        <div className="flex justify-between items-start mb-2.5">
                            <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors text-base">{route.segment}</h3>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight border ${route.severity === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                route.severity === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                {route.status}
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                            {route.details}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-50 rounded-[2rem] p-8 text-center relative overflow-hidden group border border-zinc-100">
                <div className="flex flex-col items-center gap-5 relative z-10">
                    <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase tracking-tight">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Información Oficial
                    </div>

                    <p className="text-zinc-600 text-sm max-w-[280px] leading-relaxed font-medium">
                        Accedé a los reportes en tiempo real y alertas oficiales directamente desde las fuentes.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        <a
                            href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-zinc-100 text-blue-600 px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm border border-zinc-100"
                        >
                            Vialidad Nacional
                        </a>
                        <a
                            href="http://vialidadtdf.gob.ar/estado-de-rutas/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-zinc-100 text-blue-600 px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm border border-zinc-100"
                        >
                            Vialidad Provincial
                        </a>
                        <a
                            href="https://www.facebook.com/SuDefensaCivil/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-zinc-100 text-blue-600 px-6 py-3 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm border border-zinc-100"
                        >
                            Defensa Civil (FB)
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                    Fuentes de datos: <span className="text-zinc-600 border-b border-zinc-200">Vialidad Nacional</span> y <span className="text-blue-500 font-bold border-b border-blue-100">Defensa Civil</span>
                </p>
            </div>
        </div>
    );
}
