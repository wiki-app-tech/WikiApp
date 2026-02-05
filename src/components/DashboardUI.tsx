'use client';

import React from 'react';

export function NavIcon({ children, active, label, onClick }: { children: React.ReactNode, active?: boolean, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all relative group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
        >
            {children}
            <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded whitespace-nowrap z-50">{label}</span>
        </button>
    );
}

export function CategoryButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900'}`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </button>
    );
}

export function MobileTab({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[64px] transition-all transform active:scale-90 ${active ? 'text-blue-600' : 'text-zinc-400'}`}>
            <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-transparent'}`}>{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] mt-0.5">{label}</span>
        </button>
    );
}
