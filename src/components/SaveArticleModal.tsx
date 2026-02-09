'use client';

import { useState, useEffect } from 'react';
import type { Article } from '@/types';
import TagInput from './TagInput';
import { BookmarkIcon } from './Icons';

interface SaveArticleModalProps {
    article: Article;
    isOpen: boolean;
    onClose: () => void;
    onSave: (tags: string[]) => void;
    existingTags: string[];
}

export default function SaveArticleModal({
    article,
    isOpen,
    onClose,
    onSave,
    existingTags
}: SaveArticleModalProps) {
    const [tags, setTags] = useState<string[]>([]);

    // Reset tags when modal opens
    useEffect(() => {
        if (isOpen) {
            setTags([]);
        }
    }, [isOpen]);

    const handleSave = () => {
        onSave(tags);
        onClose();
    };

    const handleAddTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleQuickSave = () => {
        onSave([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                            <BookmarkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Guardar artículo</h2>
                            <p className="text-sm text-zinc-500">Agregá etiquetas para organizarlo mejor</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Article Preview */}
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex gap-4">
                        {article.thumbnail && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                <img
                                    src={article.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="font-bold text-zinc-900 line-clamp-2 mb-1">{article.title}</h3>
                            <p className="text-xs text-zinc-500">{article.sourceName}</p>
                        </div>
                    </div>
                </div>

                {/* Tags Input */}
                <div className="p-6 space-y-4">
                    <label className="block text-sm font-bold text-zinc-700">
                        Etiquetas (opcional)
                    </label>
                    <TagInput
                        tags={tags}
                        suggestions={existingTags}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        placeholder="Ej: leer-despues, importante..."
                    />

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-400 font-medium">Sugerencias rápidas:</span>
                        {['importante', 'leer-despues', 'investigar', 'compartir'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleAddTag(tag)}
                                disabled={tags.includes(tag)}
                                className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleQuickSave}
                        className="flex-1 px-6 py-3 bg-zinc-200 text-zinc-700 rounded-2xl font-bold text-sm hover:bg-zinc-300 transition-colors"
                    >
                        Guardar sin etiquetas
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-sm hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                    >
                        Guardar con etiquetas
                    </button>
                </div>
            </div>
        </div>
    );
}
