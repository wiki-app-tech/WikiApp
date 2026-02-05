'use client';

import { useState } from 'react';
import type { Article } from '@/types';
import { ZapIcon } from './Icons';

interface ArticleReaderProps {
    article: Article;
    onClose: () => void;
    onNavigate: (dir: 'next' | 'prev') => void;
    onSummarize: () => void;
    isSummarizing: boolean;
    summary: string | null;
}

export default function ArticleReader({
    article,
    onClose,
    onNavigate,
    onSummarize,
    isSummarizing,
    summary
}: ArticleReaderProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) onNavigate('next');
        if (distance < -50) onNavigate('prev');
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-white md:relative md:flex-[2.5] md:inset-auto md:bg-white flex flex-col md:border-l md:border-zinc-100 animate-in slide-in-from-right duration-500 ease-out"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
            <header className="h-16 lg:h-20 border-b border-zinc-100 flex items-center px-6 justify-between bg-white sticky top-0 z-10">
                <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSummarize}
                        disabled={isSummarizing || !!summary}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all ${summary ? 'bg-orange-50 text-orange-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            } disabled:opacity-50`}
                    >
                        <ZapIcon className="w-3 h-3" />
                        {isSummarizing ? 'GENERANDO...' : summary ? 'RESUMEN IA' : 'SOLICITAR RESUMEN'}
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('prev')} className="p-2 text-zinc-400 hover:text-zinc-900">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => onNavigate('next')} className="p-2 text-zinc-400 hover:text-zinc-900">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="hidden md:block bg-[#1a73e8] text-white text-[11px] font-black px-8 py-3.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">VISITAR WEB</a>
                </div>
            </header>

            <article className="flex-1 overflow-y-auto p-8 md:p-16 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-12">
                    {summary && (
                        <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-8 md:p-10 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <ZapIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Inoreader Intelligence</span>
                            </div>
                            <p className="text-orange-900 text-lg md:text-xl font-bold leading-relaxed">
                                {summary}
                            </p>
                            <div className="mt-6 flex gap-4">
                                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Copiar Resumen</button>
                                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Más información</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                            <span className="text-[#1a73e8]">{article.sourceName}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-400">{new Date(article.pubDate).toLocaleString('es-AR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-zinc-900">{article.title}</h1>
                        <div className="w-16 h-1 bg-[#1a73e8] rounded-full mt-8" />
                    </div>

                    <div
                        className="text-zinc-700 text-lg md:text-xl leading-[1.7] space-y-6 font-serif antialiased prose prose-zinc max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                </div>
            </article>
        </div>
    );
}
