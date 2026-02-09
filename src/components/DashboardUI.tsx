'use client';

import React from 'react';

export function NavIcon({ children, active, label, onClick }: { children: React.ReactNode, active?: boolean, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all relative group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-zinc-500 hover:bg-white/10 hover:text-white'}`}
        >
            {children}
            <span className="hidden lg:group-hover:block absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-xl whitespace-nowrap z-50">{label}</span>
        </button>
    );
}

export function CategoryButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-[var(--radius-button)] transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold' : 'text-zinc-500 hover:bg-white hover:shadow-md hover:text-blue-600'}`}
        >
            <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-zinc-100/50'}`}>{icon}</div>
            <span className="text-sm tracking-tight">{label}</span>
        </button>
    );
}

export function MobileTab({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 flex-1 min-h-[64px] transition-all transform active:scale-95 ${active ? 'text-blue-600' : 'text-zinc-400'}`}>
            <div className={`p-2.5 rounded-[var(--radius-button)] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-transparent'}`}>{icon}</div>
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
        </button>
    );
}
