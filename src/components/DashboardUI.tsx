'use client';

import React from 'react';

export function NavIcon({ children, active, label, onClick, showLabelBelow }: { children: React.ReactNode, active?: boolean, label: string, onClick?: () => void, showLabelBelow?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center transition-all relative group ${showLabelBelow ? 'w-full h-16' : 'w-14 h-14'} ${active ? 'text-accent-primary' : 'text-text-tertiary hover:text-text-primary'}`}
        >
            <div className={`p-2 transition-all duration-300 ${active ? 'bg-accent-primary/10 text-accent-primary rounded-xl border border-accent-primary/20 shadow-glow-accent' : 'group-hover:scale-110'}`}>
                {children}
            </div>
            {showLabelBelow && (
                <span className="text-[9px] font-bold uppercase tracking-tight mt-1 opacity-70">{label}</span>
            )}
            {!showLabelBelow && (
                <span className="hidden lg:group-hover:block absolute left-full ml-2 px-3 py-1.5 bg-surface-elevated text-text-primary text-[10px] font-bold rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl border border-accent-primary/20 glass-card">{label}</span>
            )}
        </button>
    );
}

export function SidebarCountBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="text-[10px] font-bold text-text-tertiary opacity-60">
            {count > 999 ? '999+' : count}
        </span>
    );
}

export function CategoryButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-[var(--radius-button)] transition-all ${active ? 'bg-accent-primary text-surface-primary shadow-xl shadow-accent-primary/30 font-bold' : 'text-text-secondary hover:bg-surface-elevated hover:shadow-md hover:text-accent-primary'}`}
        >
            <div className={`p-2 rounded-xl ${active ? 'bg-surface-primary/20' : 'bg-surface-elevated/50'}`}>{icon}</div>
            <span className="text-sm font-bold tracking-tight">{label}</span>
        </button>
    );
}

export function MobileTab({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 flex-1 min-h-[64px] transition-all transform active:scale-95 ${active ? 'text-accent-primary' : 'text-text-tertiary'}`}>
            <div className={`p-2.5 rounded-[var(--radius-button)] transition-all duration-300 ${active ? 'bg-accent-primary text-surface-primary shadow-lg shadow-accent-primary/20' : 'bg-transparent'}`}>{icon}</div>
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
        </button>
    );
}
