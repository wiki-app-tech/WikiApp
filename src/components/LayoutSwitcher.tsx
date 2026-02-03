'use client';

import React from 'react';

type ViewMode = 'list' | 'card' | 'magazine';

interface LayoutSwitcherProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

export default function LayoutSwitcher({ currentMode, onModeChange }: LayoutSwitcherProps) {
    const modes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
        {
            id: 'list',
            label: 'List View',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            )
        },
        {
            id: 'magazine',
            label: 'Magazine View',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 13h10a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1zM18 13h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6a1 1 0 011-1z" />
                </svg>
            )
        },
        {
            id: 'card',
            label: 'Card View',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            )
        }
    ];

    return (
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/50 shadow-inner">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`
                        relative p-2 rounded-lg transition-all duration-300 group
                        ${currentMode === mode.id
                            ? 'bg-white text-blue-600 shadow-md transform scale-105'
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'
                        }
                    `}
                    aria-label={mode.label}
                >
                    {mode.icon}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-y-2 group-hover:translate-y-0 z-50">
                        {mode.label}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                    </div>
                </button>
            ))}
        </div>
    );
}
