import React, { useState, useEffect } from 'react';
import type { MetricCard, CityFilter, TabId } from '../types/dashboard';
import {
  IconUsers, IconEye, IconActivity, IconThumbUp, IconLink, IconTrendUp, IconSearch, IconMapPin, IconX, IconCheck
} from './Sidebar';

interface TopBarProps {
  title: string;
  subtitle: string;
  selectedCity: CityFilter;
  onCityChange: (city: CityFilter) => void;
  onOpenReport: () => void;
  onMobileMenuToggle: () => void;
  onSelectTab: (tab: TabId) => void;
  allTabs: Record<TabId, { title: string; sub: string }>;
  showToast: (msg: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title, subtitle, selectedCity, onCityChange, onOpenReport, onMobileMenuToggle, onSelectTab, allTabs, showToast
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd/Ctrl + K to open search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cities: { id: CityFilter; label: string; temp?: string }[] = [
    { id: 'todas', label: 'TDF Completa' },
    { id: 'ushuaia', label: 'Ushuaia', temp: '8°C' },
    { id: 'rio-grande', label: 'Río Grande', temp: '6°C' },
    { id: 'tolhuin', label: 'Tolhuin', temp: '5°C' },
  ];

  const searchResults = query.trim() === '' ? [] : (Object.entries(allTabs) as [TabId, { title: string; sub: string }][])
    .filter(([_, t]) => t.title.toLowerCase().includes(query.toLowerCase()) || t.sub.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <header className="main-topbar">
        {/* Left Side: Mobile Hamburger & Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onMobileMenuToggle}
            style={{
              display: 'none', padding: '6px', borderRadius: 8, border: 'none',
              background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer'
            }}
            className="mobile-menu-btn"
            aria-label="Abrir Menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>

        {/* Center: MSN Weather-style Search Bar & Location Switcher Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="topbar-center-actions">

          {/* MSN Search Bar Pill */}
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 9999,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease',
              width: 190
            }}
            title="Buscar módulo o reporte (Ctrl + K)"
          >
            <IconSearch />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Buscar módulo...</span>
            <kbd style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '1px 5px',
              borderRadius: 4,
              fontSize: '0.62rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace'
            }}>Ctrl K</kbd>
          </div>

          {/* MSN Weather Location Switcher Pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 9999,
            padding: 3,
            gap: 2
          }}>
            {cities.map(c => {
              const active = selectedCity === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onCityChange(c.id);
                    showToast(`📍 Filtro de ubicación: ${c.label}`);
                  }}
                  style={{
                    background: active ? 'var(--neon)' : 'transparent',
                    color: active ? 'var(--text-on-neon)' : 'var(--text-secondary)',
                    fontWeight: active ? 800 : 500,
                    fontSize: '0.72rem',
                    padding: '4px 11px',
                    borderRadius: 9999,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    align-items: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.id !== 'todas' && <span style={{ fontSize: '0.65rem' }}>📍</span>}
                  {c.label}
                  {c.temp && <span style={{ opacity: active ? 0.9 : 0.6, fontSize: '0.65rem', fontWeight: 600 }}>{c.temp}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Live Indicator, Emergencias 101 & Report Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Live Status Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 9999,
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981',
            fontSize: '0.68rem', fontWeight: 700
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#10b981',
              boxShadow: '0 0 8px #10b981', animation: 'pulse-slow 2s infinite'
            }} />
            GA4 API En Vivo
          </div>

          {/* Emergency 101 badge */}
          <a href="tel:101" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px',
            borderRadius: 9999, background: 'rgba(239,68,68,0.15)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.72rem', fontWeight: 800,
            letterSpacing: '0.04em', textDecoration: 'none', fontFamily: 'var(--font-heading)',
            animation: 'pulse-red 2s infinite'
          }}>
            101
          </a>

          <button
            onClick={() => {
              onOpenReport();
              showToast('📄 Abriendo Generador de Informes Institucionales...');
            }}
            className="btn-neon"
            style={{ fontSize: '0.74rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Informe
          </button>
        </div>
      </header>

      {/* ── COMMAND PALETTE / SEARCH MODAL (UX Improvement) ── */}
      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="modal anim-fadein"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 540, padding: 20, borderRadius: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-subtle)', pb: 12, marginBottom: 12 }}>
              <IconSearch />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar módulo, informe, métrica..."
                className="input-dark"
                style={{ border: 'none', background: 'transparent', fontSize: '0.92rem', padding: 0 }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <IconX />
              </button>
            </div>

            {query.trim() === '' ? (
              <div style={{ padding: '20px 0', textOverflow: 'ellipsis', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Escribe para buscar entre los 20+ módulos analíticos e informes OCI.
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No se encontraron módulos con «{query}».
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {searchResults.map(([id, item]) => (
                  <button
                    key={id}
                    onClick={() => {
                      onSelectTab(id);
                      setSearchOpen(false);
                      setQuery('');
                      showToast(`🚀 Navegando a: ${item.title}`);
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--neon)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
