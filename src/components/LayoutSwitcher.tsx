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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
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
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/50 shadow-sm">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`
                        relative p-2 rounded-lg transition-all duration-200 group
                        ${currentMode === mode.id
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                        }
                    `}
                    title={mode.label}
                >
                    {mode.icon}
                    {/* Tooltip for desktop */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {mode.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
