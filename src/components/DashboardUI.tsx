'use client';

import React from 'react';

/* ── NavIcon ─────────────────────────────────────────────────────────────── */
export function NavIcon({
    children, active, label, onClick,
}: {
    children: React.ReactNode;
    active?: boolean;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`
                relative flex flex-col items-center justify-center w-14 h-14 rounded-xl
                transition-all duration-200 group
                ${active
                    ? 'bg-accent-primary/10 text-accent-primary shadow-inner border-l-[3px] border-accent-primary'
                    : 'text-text-tertiary hover:bg-accent-primary/6 hover:text-accent-primary border-l-[3px] border-transparent'
                }
            `}
        >
            <div className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
                {children}
            </div>

            {/* Tooltip */}
            <span className="
                pointer-events-none absolute left-full ml-3 px-3 py-1.5
                bg-text-primary text-surface-primary
                text-[10px] font-bold rounded-md whitespace-nowrap z-50
                opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0
                transition-all duration-150 shadow-lg
            ">
                {label}
            </span>
        </button>
    );
}

/* ── SidebarCountBadge ───────────────────────────────────────────────────── */
export function SidebarCountBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="text-[10px] font-bold text-text-tertiary opacity-50 tabular-nums">
            {count > 999 ? '999+' : count}
        </span>
    );
}

/* ── CategoryButton ──────────────────────────────────────────────────────── */
export function CategoryButton({
    active, label, icon, onClick,
}: {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
                transition-all duration-200
                ${active
                    ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/25'
                    : 'text-text-secondary hover:bg-accent-primary/8 hover:text-accent-primary'
                }
            `}
        >
            <span className={`shrink-0 ${active ? 'text-white/90' : 'text-text-tertiary'}`}>
                {icon}
            </span>
            <span className="tracking-tight">{label}</span>
        </button>
    );
}

/* ── MobileTab ───────────────────────────────────────────────────────────── */
export function MobileTab({
    active, label, icon, onClick,
}: {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center gap-1 flex-1 min-h-[60px]
                transition-all duration-200 active:scale-95 relative
                ${active ? 'text-accent-primary' : 'text-text-tertiary'}
            `}
        >
            {/* Active indicator top bar */}
            {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-gradient-to-r from-accent-primary to-accent-secondary" />
            )}
            <div className={`
                p-2 rounded-xl transition-all duration-200
                ${active ? 'bg-accent-primary/12 text-accent-primary' : ''}
            `}>
                {icon}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-accent-primary' : 'text-text-tertiary'}`}>
                {label}
            </span>
        </button>
    );
}
