import React from 'react';
import type { MetricCard } from '../types/dashboard';
import {
  IconUsers, IconEye, IconActivity, IconThumbUp, IconLink, IconTrendUp
} from './Sidebar';

interface TopBarProps {
  title: string;
  subtitle: string;
  onOpenReport: () => void;
  onMobileMenuToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onOpenReport, onMobileMenuToggle }) => {
  return (
    <header className="main-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          style={{
            display: 'none', padding: '6px', borderRadius: 8, border: 'none',
            background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer'
          }}
          className="mobile-menu-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Emergency 101 badge */}
        <a href="tel:101" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
          borderRadius: 9999, background: 'rgba(239,68,68,0.15)', color: '#f87171',
          border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.75rem', fontWeight: 800,
          letterSpacing: '0.05em', textDecoration: 'none', fontFamily: 'var(--font-heading)',
          animation: 'pulse-red 2s infinite'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
            <path d="M11.21 3a2 2 0 0 1 1.79 1"/>
            <path d="M3.1 3.1a2 2 0 0 0-1.1 1.9v3a2 2 0 0 0 2 2h3"/>
          </svg>
          EMERGENCIAS 101
        </a>

        <button
          onClick={onOpenReport}
          className="btn-neon"
          style={{ fontSize: '0.75rem' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Generar Informe
        </button>
      </div>
    </header>
  );
};

// ── KPI CARDS ROW ─────────────────────────────────────────────────────────────
interface KpiCardsProps {
  metrics: MetricCard[];
}

function getKpiIcon(icon: string) {
  switch (icon) {
    case 'Users':       return <IconUsers />;
    case 'Eye':         return <IconEye />;
    case 'Activity':    return <IconActivity />;
    case 'ThumbsUp':    return <IconThumbUp />;
    case 'Link':        return <IconLink />;
    default:            return <IconTrendUp />;
  }
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
      {metrics.map((m, i) => (
        <div key={m.id} className="kpi-card anim-fadein" style={{ animationDelay: `${i * 60}ms` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            {/* MSN-style yellow icon badge */}
            <div style={{
              padding: 8, borderRadius: 12,
              background: 'rgba(255,208,0,0.12)',
              border: '1px solid rgba(255,208,0,0.25)',
              color: 'var(--text-neon)'
            }}>
              {getKpiIcon(m.icon)}
            </div>
            <span className={m.isPositive ? 'kpi-change-up' : 'kpi-change-neutral'}>
              {m.change}
            </span>
          </div>

          <div className="kpi-label" style={{ marginBottom: 6 }}>{m.title}</div>
          <div className="kpi-value" style={{ marginBottom: 6 }}>{m.value}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.description}</div>
        </div>
      ))}
    </div>
  );
};
