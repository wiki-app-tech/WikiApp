'use client';

import React from 'react';

export function NavIcon({ children, active, label, onClick, showLabelBelow }: { children: React.ReactNode, active?: boolean, label: string, onClick?: () => void, showLabelBelow?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center transition-all relative group ${showLabelBelow ? 'w-full h-16' : 'w-14 h-14'} ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <div className={`p-2 transition-all duration-300 ${active ? 'bg-blue-600 rounded-xl shadow-lg shadow-blue-600/40' : 'group-hover:scale-110'}`}>
                {children}
            </div>
            {showLabelBelow && (
                <span className="text-[9px] font-bold uppercase tracking-tight mt-1 opacity-70">{label}</span>
            )}
            {!showLabelBelow && (
                <span className="hidden lg:group-hover:block absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap z-50 pointer-events-none">{label}</span>
            )}
        </button>
    );
}

export function SidebarCountBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="text-[10px] font-medium text-slate-400">
            {count > 999 ? '999+' : count}
        </span>
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
