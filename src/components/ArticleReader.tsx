'use client';

import { useState, useEffect } from 'react';
import type { Article } from '@/types';
import { ZapIcon, BookmarkIcon } from './Icons';
import ShareMenu from './ShareMenu';

interface ArticleReaderProps {
    article: Article;
    onClose: () => void;
    onNavigate: (dir: 'next' | 'prev') => void;
    onSummarize: () => void;
    isSummarizing: boolean;
    summary: string | null;
    isSaved?: boolean;
    isRead?: boolean;
    onToggleSave?: () => void;
    onMarkAsRead?: () => void;
}

export default function ArticleReader({
    article,
    onClose,
    onNavigate,
    onSummarize,
    isSummarizing,
    summary,
    isSaved = false,
    isRead = false,
    onToggleSave,
    onMarkAsRead
}: ArticleReaderProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Mark as read after 3 seconds of viewing
    useEffect(() => {
        if (onMarkAsRead && !isRead) {
            const timer = setTimeout(() => {
                onMarkAsRead();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [article.id, isRead, onMarkAsRead]);

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
            className="fixed inset-0 z-50 bg-surface-primary md:relative md:flex-[2.5] md:inset-auto flex flex-col md:border-l md:border-accent-primary/10 animate-in slide-in-from-right duration-500 ease-out h-full"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
            <header className="h-24 border-b border-accent-primary/10 flex items-center px-8 justify-between bg-surface-elevated/80 sticky top-0 z-10 glass-header">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-3 -ml-3 text-text-tertiary hover:text-accent-primary transition-colors bg-accent-primary/5 rounded-2xl border border-accent-primary/10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    {/* Read indicator */}
                    {isRead && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-secondary/10 border border-accent-secondary/20 rounded-xl animate-in fade-in duration-300">
                            <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                            <span className="text-[10px] font-bold text-accent-secondary uppercase tracking-tight">Leído</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Save Button */}
                    {onToggleSave && (
                        <button
                            onClick={onToggleSave}
                            className={`p-3 rounded-2xl transition-all border ${isSaved
                                ? 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20 shadow-glow'
                                : 'bg-accent-primary/5 text-text-tertiary border-accent-primary/10 hover:text-accent-secondary hover:bg-accent-primary/10'
                                }`}
                            aria-label={isSaved ? 'Quitar de guardados' : 'Guardar artículo'}
                        >
                            <BookmarkIcon className="w-5 h-5" filled={isSaved} />
                        </button>
                    )}

                    {/* Share Menu */}
                    <ShareMenu url={article.link} title={article.title} />

                    <button
                        onClick={onSummarize}
                        disabled={isSummarizing || !!summary}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-bold transition-all ${summary ? 'bg-accent-primary/20 text-accent-primary shadow-glow-accent' : 'bg-surface-elevated text-text-primary border border-accent-primary/20 hover:bg-surface-primary shadow-xl shadow-accent-primary/10'
                            } disabled:opacity-50`}
                    >
                        <ZapIcon className="w-3.5 h-3.5" />
                        {isSummarizing ? 'ANALYZING...' : summary ? 'AI SUMMARY' : 'GET SMART SUMMARY'}
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('prev')} className="p-3 text-text-tertiary hover:text-accent-primary bg-accent-primary/5 border border-accent-primary/10 rounded-2xl transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => onNavigate('next')} className="p-3 text-text-tertiary hover:text-accent-primary bg-accent-primary/5 border border-accent-primary/10 rounded-2xl transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="hidden lg:block bg-accent-primary text-surface-primary text-[11px] font-bold px-8 py-3.5 rounded-2xl uppercase tracking-tight shadow-xl shadow-accent-primary/30 active:scale-95 transition-all">OPEN SOURCE SITE</a>
                </div>
            </header>

            <article className="flex-1 overflow-y-auto p-10 md:p-20 scroll-smooth bg-surface-primary">
                <div className="max-w-3xl mx-auto space-y-16">
                    {summary && (
                        <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-[2.5rem] p-10 md:p-12 animate-in fade-in slide-in-from-top-4 duration-700 shadow-xl shadow-accent-primary/5 glass-card-accent">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-surface-primary shadow-lg shadow-accent-primary/30">
                                    <ZapIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-tight text-accent-primary">Smart Summary Agent</span>
                            </div>
                            <p className="text-text-primary text-xl md:text-2xl font-bold leading-relaxed tracking-tight">
                                {summary}
                            </p>
                            <div className="mt-10 flex gap-6">
                                <button className="text-[11px] font-bold text-accent-primary uppercase tracking-tight hover:underline underline-offset-4">Copy Analysis</button>
                                <button className="text-[11px] font-bold text-accent-primary uppercase tracking-tight hover:underline underline-offset-4">Learn More</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-tight">
                            <span className="text-accent-primary px-3 py-1 bg-accent-primary/10 rounded-lg">{article.sourceName}</span>
                            <span className="text-text-tertiary opacity-30">•</span>
                            <span className="text-text-tertiary font-bold">{new Date(article.pubDate).toLocaleString('es-AR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter text-text-primary font-display">{article.title}</h1>
                        <div className="w-20 h-2 bg-accent-primary rounded-full mt-10 shadow-glow-accent" />
                    </div>

                    <div
                        className="text-text-secondary text-lg md:text-xl leading-[1.8] space-y-8 antialiased prose prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-text-primary prose-a:text-accent-primary prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-accent-primary/10"
                        dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                </div>
            </article>
        </div>
    );
}
