'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Article } from '@/types';
import ArticleCard from './ArticleCard';

interface NewsCarouselProps {
    articles: Article[];
    viewMode: 'list' | 'card' | 'magazine';
    selectedArticleId: string | null;
    onArticleClick: (id: string) => void;
    autoPlayInterval?: number;
}

export default function NewsCarousel({
    articles,
    viewMode,
    selectedArticleId,
    onArticleClick,
    autoPlayInterval = 5000
}: NewsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, [articles.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
    }, [articles.length]);

    useEffect(() => {
        if (isHovered || !autoPlayInterval || articles.length <= 1) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [nextSlide, isHovered, autoPlayInterval, articles.length]);

    // Scroll to active item
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const cardWidth = container.offsetWidth;
            container.scrollTo({
                left: currentIndex * cardWidth,
                behavior: 'smooth'
            });
        }
    }, [currentIndex]);

    if (articles.length === 0) return null;

    return (
        <div
            className="group relative w-full overflow-hidden rounded-[2.5rem]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Carousel Container */}
            <div
                ref={scrollRef}
                className="flex transition-all duration-500 ease-out scrollbar-hide overflow-x-hidden"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {articles.map((article) => (
                    <div
                        key={article.id}
                        className="w-full flex-shrink-0 px-1"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <ArticleCard
                            article={article}
                            viewMode={viewMode}
                            isSelected={selectedArticleId === article.id}
                            onClick={() => onArticleClick(article.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {articles.length > 1 && (
                <div className="flex gap-3 absolute bottom-8 right-8 z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-xl border border-zinc-100 text-zinc-900 flex items-center justify-center shadow-xl shadow-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-xl border border-zinc-100 text-zinc-900 flex items-center justify-center shadow-xl shadow-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Pagination Dots */}
            {articles.length > 1 && (
                <div className="absolute top-8 left-8 flex gap-2.5 z-10">
                    {articles.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-blue-600' : 'w-2 bg-zinc-200 hover:bg-zinc-300'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
