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
            <header className="h-24 border-b border-zinc-50 flex items-center px-8 justify-between bg-white sticky top-0 z-10">
                <button onClick={onClose} className="p-3 -ml-3 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-2xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onSummarize}
                        disabled={isSummarizing || !!summary}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-bold transition-all ${summary ? 'bg-orange-50 text-orange-600' : 'bg-zinc-900 text-white hover:bg-black shadow-xl shadow-black/10'
                            } disabled:opacity-50`}
                    >
                        <ZapIcon className="w-3.5 h-3.5" />
                        {isSummarizing ? 'ANALYZING...' : summary ? 'AI SUMMARY' : 'GET SMART SUMMARY'}
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('prev')} className="p-3 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-2xl transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => onNavigate('next')} className="p-3 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-2xl transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="hidden lg:block bg-blue-600 text-white text-[11px] font-bold px-8 py-3.5 rounded-2xl uppercase tracking-tight shadow-xl shadow-blue-500/30 active:scale-95 transition-all">OPEN SOURCE SITE</a>
                </div>
            </header>

            <article className="flex-1 overflow-y-auto p-10 md:p-20 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-16">
                    {summary && (
                        <div className="bg-orange-50/50 border border-orange-100 rounded-[2.5rem] p-10 md:p-12 animate-in fade-in slide-in-from-top-4 duration-700 shadow-xl shadow-orange-500/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                    <ZapIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-tight text-orange-600">Smart Summary Agent</span>
                            </div>
                            <p className="text-orange-900 text-xl md:text-2xl font-bold leading-relaxed tracking-tight">
                                {summary}
                            </p>
                            <div className="mt-10 flex gap-6">
                                <button className="text-[11px] font-bold text-orange-600 uppercase tracking-tight hover:underline underline-offset-4">Copy Analysis</button>
                                <button className="text-[11px] font-bold text-orange-600 uppercase tracking-tight hover:underline underline-offset-4">Learn More</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-tight">
                            <span className="text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">{article.sourceName}</span>
                            <span className="text-zinc-200">•</span>
                            <span className="text-zinc-400 font-medium">{new Date(article.pubDate).toLocaleString('es-AR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter text-zinc-900">{article.title}</h1>
                        <div className="w-20 h-2 bg-blue-600 rounded-full mt-10" />
                    </div>

                    <div
                        className="text-zinc-700 text-lg md:text-xl leading-[1.8] space-y-8 font-serif antialiased prose prose-zinc max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-blue-600 prose-img:rounded-[2rem] prose-img:shadow-2xl"
                        dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                </div>
            </article>
        </div>
    );
}
