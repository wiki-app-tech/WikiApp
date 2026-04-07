'use client';

import { useState, useEffect } from 'react';

interface TDFIndicator {
    id: string;
    category: string;
    title: string;
    value: string;
    unit: string;
    period: string;
    trend: 'up' | 'down' | 'stable';
    change: string;
    description: string;
    source: string;
    sourceUrl: string;
    icon: string;
}

interface TDFStatsData {
    lastUpdated: string;
    sources: { name: string; url: string }[];
    indicators: TDFIndicator[];
}

// Icon components for each indicator type
const IndicatorIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
    switch (type) {
        case 'users':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
        case 'chart':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
        case 'hotel':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" /><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" /><path d="M8 7h.01" /><path d="M16 7h.01" /><path d="M12 7h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /><path d="M8 11h.01" /></svg>;
        case 'briefcase':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
        case 'shopping':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>;
        case 'factory':
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" /></svg>;
        default:
            return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
    }
};

const TrendBadge = ({ trend, change }: { trend: string; change: string }) => {
    const config = trend === 'up'
        ? { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', arrow: '↑' }
        : trend === 'down'
            ? { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', arrow: '↓' }
            : { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', arrow: '→' };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
            <span className="text-xs">{config.arrow}</span>
            {change}
        </span>
    );
};

export default function TDFStatsWidget() {
    const [data, setData] = useState<TDFStatsData | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/tdf-stats.json');
                const json = await response.json();
                setData(json);
            } catch (error) {
                console.error('Error fetching TDF stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="card-wotech overflow-hidden p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-100 rounded-lg w-40" />
                            <div className="h-3 bg-slate-100 rounded-lg w-56" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const formattedDate = (() => {
        try {
            return new Date(data.lastUpdated).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return data.lastUpdated;
        }
    })();

    return (
        <div className="card-wotech overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent-primary/15 to-accent-secondary/10 rounded-xl text-accent-primary border border-accent-primary/10">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        </div>
                        <div>
                            <div className="section-label mb-0.5">Indicadores</div>
                            <h2 className="text-base font-black tracking-tight text-text-primary font-display">
                                Estadísticas de <span className="text-accent-primary">TDF</span>
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Actualizado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de indicadores */}
            <div className="px-4 sm:px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.indicators.map((indicator) => (
                        <a
                            key={indicator.id}
                            href={indicator.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-surface-primary/30 border border-accent-primary/5 rounded-[1.5rem] p-5 hover:bg-surface-elevated hover:shadow-xl hover:shadow-accent-primary/5 transition-all hover:border-accent-primary/20 cursor-pointer"
                            onMouseEnter={() => setHoveredId(indicator.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Category tag */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-surface-primary transition-all">
                                        <IndicatorIcon type={indicator.icon} className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest group-hover:text-accent-primary transition-colors">
                                        {indicator.category}
                                    </span>
                                </div>
                                <TrendBadge trend={indicator.trend} change={indicator.change} />
                            </div>

                            {/* Value */}
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-3xl font-black text-text-primary tabular-nums tracking-tighter font-display group-hover:text-accent-primary transition-colors">
                                    {indicator.value}
                                </span>
                                {indicator.unit && (
                                    <span className="text-sm font-bold text-text-tertiary">{indicator.unit}</span>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-text-secondary mb-2 leading-tight">
                                {indicator.title}
                            </h3>

                            {/* Description (shown on hover) */}
                            <div className={`overflow-hidden transition-all duration-300 ${hoveredId === indicator.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-[11px] text-text-tertiary leading-relaxed pt-2 border-t border-accent-primary/10">
                                    {indicator.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-accent-primary/5">
                                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-tight opacity-60">
                                    {indicator.period}
                                </span>
                                <span className="text-[9px] font-bold text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    {indicator.source}
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 pb-4 pt-2">
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <div>
                            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Actualizado</p>
                            <p className="text-xs font-bold text-text-secondary">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {data.sources.map((source) => (
                            <a
                                key={source.name}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-white text-text-secondary rounded-lg text-[10px] font-bold border border-slate-200 hover:border-accent-primary/30 hover:text-accent-primary transition-all"
                            >
                                {source.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
