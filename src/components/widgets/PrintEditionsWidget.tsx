'use client';

import React, { useState } from 'react';
import { PRINT_EDITION_SOURCES } from '@/constants';
import { NewsCategory } from '@/types';

export default function PrintEditionsWidget() {
    const [activeCategory, setActiveCategory] = useState<string>(NewsCategory.PROVINCIAL);
    const sources = PRINT_EDITION_SOURCES[activeCategory] || [];
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

    const getLogoUrl = (url: string) => {
        return url.replace('{{DATE}}', dateStr);
    };

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4.5 1.253" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display">Tapas de Diarios</h2>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Ediciones Digitales Impresas</p>
                    </div>
                </div>

                <div className="flex p-1.5 bg-surface-primary/50 rounded-2xl border border-accent-primary/10">
                    {Object.keys(PRINT_EDITION_SOURCES).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all tracking-widest ${activeCategory === cat ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary'}`}
                        >
                            {cat.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sources.map((source) => (
                    <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-4 p-4 bg-surface-primary/20 rounded-[2rem] border border-transparent hover:border-accent-primary/20 hover:bg-surface-elevated transition-all hover:-translate-y-2 group"
                    >
                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-surface-elevated/50 flex items-center justify-center border border-white/5 shadow-xl group-hover:shadow-accent-primary/10 transition-shadow">
                            <img
                                src={getLogoUrl(source.logoUrl)}
                                alt={source.name}
                                className="w-full h-full object-contain p-4 grayscale-[0.2] transition-all duration-700 scale-[1.0] group-hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x400/1e293b/94a3b8?text=No+Disponible';
                                }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter text-center group-hover:text-accent-primary transition-colors">{source.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
