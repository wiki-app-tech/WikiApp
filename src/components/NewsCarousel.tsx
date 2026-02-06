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
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-95 z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-95 z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {articles.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {articles.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
