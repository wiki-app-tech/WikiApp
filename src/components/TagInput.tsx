'use client';

import { useState, useRef, useEffect } from 'react';

interface TagInputProps {
    tags: string[];
    suggestions?: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    placeholder?: string;
    maxTags?: number;
}

// Colores predefinidos para tags
const TAG_COLORS = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
];

function getTagColor(tag: string) {
    // Generar un índice basado en el hash del tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function TagInput({
    tags,
    suggestions = [],
    onAddTag,
    onRemoveTag,
    placeholder = 'Agregar etiqueta...',
    maxTags = 10
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filtrar sugerencias basadas en el input
    const filteredSuggestions = suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(s)
    );

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
            onAddTag(trimmedTag);
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            onRemoveTag(tags[tags.length - 1]);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl min-h-[48px] focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-200 transition-all">
                {/* Existing Tags */}
                {tags.map((tag) => {
                    const colors = getTagColor(tag);
                    return (
                        <span
                            key={tag}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} ${colors.text} border ${colors.border} rounded-xl text-xs font-bold animate-in zoom-in-75 duration-200`}
                        >
                            <span className="w-2 h-2 rounded-full bg-current opacity-50" />
                            {tag}
                            <button
                                onClick={() => onRemoveTag(tag)}
                                className="ml-1 p-0.5 hover:bg-white/50 rounded-full transition-colors"
                                aria-label={`Eliminar etiqueta ${tag}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    );
                })}

                {/* Input */}
                {tags.length < maxTags && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-zinc-700 placeholder:text-zinc-400"
                    />
                )}
            </div>

            {/* Tag Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-zinc-200/50 border border-zinc-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden max-h-40 overflow-y-auto">
                    <div className="p-2">
                        <p className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Sugerencias</p>
                        {filteredSuggestions.slice(0, 5).map((suggestion) => {
                            const colors = getTagColor(suggestion);
                            return (
                                <button
                                    key={suggestion}
                                    onClick={() => handleAddTag(suggestion)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 rounded-lg transition-colors text-left"
                                >
                                    <span className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                                    <span className="text-sm font-medium text-zinc-700">{suggestion}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Helper text */}
            <p className="mt-2 text-[10px] text-zinc-400 font-medium">
                Presioná Enter o coma para agregar. Máximo {maxTags} etiquetas.
            </p>
        </div>
    );
}

// Export for use in saved articles display
export function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
    const colors = getTagColor(tag);
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${colors.bg} ${colors.text} border ${colors.border} rounded-lg text-[11px] font-bold`}>
            {tag}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-0.5 p-0.5 hover:bg-white/50 rounded-full transition-colors"
                    aria-label={`Eliminar ${tag}`}
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
}
