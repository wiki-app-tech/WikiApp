'use client';

import React from 'react';
import { ChartIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon, UserIcon } from '../Icons';
import { EconomicIndicator, Trend } from '@/types';

const MOCK_ECONOMIC_DATA: EconomicIndicator[] = [
    {
        title: 'Empleo Industrial',
        value: '10,250',
        period: 'vs. trim. anterior',
        trend: 'up',
        description: 'Puestos de trabajo registrados en el sector industrial de la provincia.',
        isPositiveTrend: true,
    },
    {
        title: 'Ocupación Hotelera',
        value: '82%',
        period: 'Ushuaia - T. Alta',
        trend: 'up',
        description: 'Nivel de ocupación de plazas hoteleras en la capital provincial.',
        isPositiveTrend: true,
    },
    {
        title: 'Canasta Básica TDF',
        value: '$285,400',
        period: 'vs. mes anterior',
        trend: 'up',
        description: 'Costo de vida estimado para una familia tipo en Tierra del Fuego.',
        isPositiveTrend: false,
    },
    {
        title: 'Pasajeros Aéreos',
        value: '1.5M',
        period: 'Acumulado anual',
        trend: 'stable',
        description: 'Tránsito total de pasajeros en aeropuertos de la provincia.',
        isPositiveTrend: true,
    },
];

const TrendIndicator = ({ trend, isPositive }: { trend: Trend, isPositive: boolean }) => {
    const isUp = trend === 'up';
    const isDown = trend === 'down';

    const colorClass = trend === 'stable' ? 'text-text-tertiary' :
        (isUp && isPositive) || (isDown && !isPositive) ? 'text-emerald-400' : 'text-rose-400';

    const Icon = isUp ? ArrowUpIcon : isDown ? ArrowDownIcon : ArrowRightIcon;

    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
            <Icon className="w-3 h-3" />
            <span>{trend === 'up' ? 'Aumento' : trend === 'down' ? 'Descenso' : 'Estable'}</span>
        </div>
    );
};

export default function EconomicIndicatorsWidget() {
    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                    <ChartIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display uppercase">Indicadores Económicos</h2>
                    <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Reporte Estadístico Provincial</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_ECONOMIC_DATA.map((indicator) => (
                    <div key={indicator.title} className="bg-surface-primary/20 border border-accent-primary/5 rounded-[2rem] p-6 hover:bg-surface-elevated hover:shadow-xl hover:shadow-accent-primary/5 transition-all border-transparent hover:border-accent-primary/20 group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest group-hover:text-accent-primary transition-colors">{indicator.title}</span>
                            <TrendIndicator trend={indicator.trend} isPositive={indicator.isPositiveTrend} />
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-black text-text-primary tabular-nums tracking-tighter font-display">{indicator.value}</span>
                        </div>

                        <p className="text-[11px] text-text-secondary leading-relaxed font-medium mb-4 opacity-80">
                            {indicator.description}
                        </p>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-text-tertiary uppercase opacity-60">{indicator.period}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary/30" />
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-text-tertiary text-center mt-8 italic opacity-60">
                Fuente: IPI-TDF / Dirección Provincial de Estadística y Censos
            </p>
        </div>
    );
}
