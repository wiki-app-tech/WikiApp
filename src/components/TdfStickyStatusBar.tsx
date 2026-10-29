'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Car,
  AlertTriangle,
  Cross,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Thermometer,
  TrendingUp,
  Pause,
  Play,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TdfAlertItem, TdfCity } from '@/utils/tdfIntelligence';
import { toSentenceCaseTitle } from '@/utils/tdfIntelligence';

export interface PharmacyItem {
  fecha?: string;
  dia?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario?: string;
}

export interface CityWeatherSummary {
  id: string;
  name: string;
  temp: number;
  max: number;
  min: number;
}

export interface DolarQuotesData {
  oficial: { compra: number; venta: number } | null;
  blue: { compra: number; venta: number } | null;
}

interface TdfStickyStatusBarProps {
  selectedCity: TdfCity;
  onSelectCity: (city: TdfCity) => void;
  activeAlerts: TdfAlertItem[];
  activePharmacy: PharmacyItem | null;
  pharmaciesByCity?: {
    ushuaia: PharmacyItem | null;
    rio_grande: PharmacyItem | null;
    tolhuin: PharmacyItem | null;
  };
  pharmacyCityName: string;
  syncTime: string;
  onDetectLocation: () => void;
  isLocating?: boolean;
}

interface UnifiedSlide {
  id: string;
  kind: 'alert' | 'ruta' | 'farmacia' | 'clima' | 'dolar_oficial' | 'dolar_blue';
  badgeLabel: string;
  issuer: string;
  cityLabel: string;
  title: string;
  detail?: string;
  syncedAt: string;
  severity: 'critical' | 'warning' | 'info' | 'emerald';
}

export default function TdfStickyStatusBar({
  selectedCity,
  onSelectCity,
  activeAlerts,
  activePharmacy,
  pharmaciesByCity,
  syncTime,
  onDetectLocation,
  isLocating = false,
}: TdfStickyStatusBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const [weatherByCity, setWeatherByCity] = useState<Record<'ushuaia' | 'rio_grande' | 'tolhuin', CityWeatherSummary>>({
    ushuaia: { id: 'ushuaia', name: 'Ushuaia', temp: 6, max: 9, min: 2 },
    rio_grande: { id: 'rio_grande', name: 'Río Grande', temp: 7, max: 10, min: 1 },
    tolhuin: { id: 'tolhuin', name: 'Tolhuin', temp: 5, max: 8, min: 0 },
  });

  const [dolarData, setDolarData] = useState<DolarQuotesData>({
    oficial: { compra: 985, venta: 1025 },
    blue: { compra: 1180, venta: 1200 },
  });

  // Sincronizar Clima de hoy (Máx / Mín por ciudad) y Dólar Oficial / Blue desde origen
  useEffect(() => {
    const fetchLiveStatusData = async () => {
      try {
        const [wRes, dRes] = await Promise.allSettled([
          fetch('/api/weather', { cache: 'no-store' }),
          fetch('/api/dolar', { cache: 'no-store' }),
        ]);

        if (wRes.status === 'fulfilled' && wRes.value.ok) {
          const wJson = await wRes.value.json();
          if (Array.isArray(wJson)) {
            setWeatherByCity((prev) => {
              const next = { ...prev };
              for (const item of wJson) {
                const maxVal = Array.isArray(item?.daily?.temperatureMax) ? Math.round(item.daily.temperatureMax[0]) : 8;
                const minVal = Array.isArray(item?.daily?.temperatureMin) ? Math.round(item.daily.temperatureMin[0]) : 1;
                const curVal = typeof item?.current?.temperature === 'number' ? Math.round(item.current.temperature) : maxVal;

                if (item.id === 'ushuaia') {
                  next.ushuaia = { id: 'ushuaia', name: 'Ushuaia', temp: curVal, max: maxVal, min: minVal };
                } else if (item.id === 'riogrande' || item.id === 'rio_grande') {
                  next.rio_grande = { id: 'rio_grande', name: 'Río Grande', temp: curVal, max: maxVal, min: minVal };
                } else if (item.id === 'tolhuin') {
                  next.tolhuin = { id: 'tolhuin', name: 'Tolhuin', temp: curVal, max: maxVal, min: minVal };
                }
              }
              return next;
            });
          }
        }

        if (dRes.status === 'fulfilled' && dRes.value.ok) {
          const dJson = await dRes.value.json();
          if (dJson?.oficial || dJson?.blue) {
            setDolarData((prev) => ({
              oficial: dJson.oficial || prev.oficial,
              blue: dJson.blue || prev.blue,
            }));
          }
        }
      } catch {
        // Mantiene últimos valores sincronizados
      }
    };

    fetchLiveStatusData();
    const interval = setInterval(fetchLiveStatusData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedSync = syncTime ? syncTime.slice(0, 5) + ' hs' : 'En vivo';
  const formatArs = (val?: number) => (typeof val === 'number' && !isNaN(val) ? `$${val.toLocaleString('es-AR')}` : '--');

  // Construir UN ÚNICO SLIDER CÍCLICO sin duplicar información:
  // 1) Estado de Rutas, 2) Farmacia de Turno por ciudad (solo el nombre),
  // 3) Clima de hoy (Máxima y Mínima) cada ciudad, 4) Dólar Oficial (Compra y Venta),
  // 5) Dólar Blue (Compra y Venta), y 6) Alertas de Tierra del Fuego (excluyendo las que ya son el estado base de ruta si coinciden)
  const slides: UnifiedSlide[] = useMemo(() => {
    const list: UnifiedSlide[] = [];

    // 1. Estado de Rutas TDF
    const roadCut = activeAlerts.find((a) => a.severity === 'critical' && a.type === 'road_cut');
    if (roadCut) {
      list.push({
        id: 'unified-ruta',
        kind: 'ruta',
        badgeLabel: 'Estado de Rutas',
        issuer: roadCut.issuer,
        cityLabel: 'RN 3 · TDF',
        title: roadCut.title,
        detail: roadCut.description,
        syncedAt: roadCut.syncedAt || formattedSync,
        severity: 'critical',
      });
    } else {
      list.push({
        id: 'unified-ruta',
        kind: 'ruta',
        badgeLabel: 'Estado de Rutas',
        issuer: 'Vialidad Nacional / Provincial',
        cityLabel: 'RN 3 · TDF',
        title: 'Ruta Nacional 3 transitable con precaución en Paso Garibaldi · Río Grande – Tolhuin habilitada',
        detail: 'Portación obligatoria de cubiertas de invierno en zona alta de montaña y luces bajas encendidas.',
        syncedAt: formattedSync,
        severity: 'warning',
      });
    }

    // 2. Farmacia de Turno por ciudad (SOLO EL NOMBRE)
    const uName = pharmaciesByCity?.ushuaia?.nombre || activePharmacy?.nombre || 'En sincronización';
    const rgName = pharmaciesByCity?.rio_grande?.nombre || 'En sincronización';
    const tName = pharmaciesByCity?.tolhuin?.nombre || 'En sincronización';

    const pharmacyTitle =
      selectedCity === 'ushuaia'
        ? `Ushuaia: ${uName}`
        : selectedCity === 'rio_grande'
        ? `Río Grande: ${rgName}`
        : selectedCity === 'tolhuin'
        ? `Tolhuin: ${tName}`
        : `Ushuaia: ${uName} · Río Grande: ${rgName} · Tolhuin: ${tName}`;

    list.push({
      id: 'unified-farmacia',
      kind: 'farmacia',
      badgeLabel: 'Farmacia de Turno',
      issuer: 'Turno 24 hs por ciudad',
      cityLabel: selectedCity === 'all' ? 'TDF' : selectedCity === 'ushuaia' ? 'Ushuaia' : selectedCity === 'rio_grande' ? 'Río Grande' : 'Tolhuin',
      title: pharmacyTitle,
      detail: `Ushuaia: ${uName} | Río Grande: ${rgName} | Tolhuin: ${tName} (Turno vigente hasta las 09:00 hs).`,
      syncedAt: formattedSync,
      severity: 'emerald',
    });

    // 3. Clima de hoy (Máxima y Mínima) de cada ciudad
    const uW = weatherByCity.ushuaia;
    const rgW = weatherByCity.rio_grande;
    const tW = weatherByCity.tolhuin;

    const weatherTitle =
      selectedCity === 'ushuaia'
        ? `Ushuaia: Máx ${uW.max}°C / Mín ${uW.min}°C (Actual ${uW.temp}°C)`
        : selectedCity === 'rio_grande'
        ? `Río Grande: Máx ${rgW.max}°C / Mín ${rgW.min}°C (Actual ${rgW.temp}°C)`
        : selectedCity === 'tolhuin'
        ? `Tolhuin: Máx ${tW.max}°C / Mín ${tW.min}°C (Actual ${tW.temp}°C)`
        : `Ushuaia: Máx ${uW.max}° / Mín ${uW.min}° · Río Grande: Máx ${rgW.max}° / Mín ${rgW.min}° · Tolhuin: Máx ${tW.max}° / Mín ${tW.min}°`;

    list.push({
      id: 'unified-clima',
      kind: 'clima',
      badgeLabel: 'Clima Hoy',
      issuer: 'Máxima y Mínima',
      cityLabel: selectedCity === 'all' ? 'Cada Ciudad' : selectedCity === 'ushuaia' ? 'Ushuaia' : selectedCity === 'rio_grande' ? 'Río Grande' : 'Tolhuin',
      title: weatherTitle,
      detail: `Ushuaia: Actual ${uW.temp}°C (Máx ${uW.max}°C / Mín ${uW.min}°C) · Río Grande: Actual ${rgW.temp}°C (Máx ${rgW.max}°C / Mín ${rgW.min}°C) · Tolhuin: Actual ${tW.temp}°C (Máx ${tW.max}°C / Mín ${tW.min}°C).`,
      syncedAt: formattedSync,
      severity: 'info',
    });

    // 4. Cotización Dólar Oficial (Compra y Venta)
    list.push({
      id: 'unified-dolar-oficial',
      kind: 'dolar_oficial',
      badgeLabel: 'Dólar Oficial',
      issuer: 'Cotización BNA',
      cityLabel: 'Compra / Venta',
      title: `Dólar Oficial — Compra: ${formatArs(dolarData.oficial?.compra)} · Venta: ${formatArs(dolarData.oficial?.venta)}`,
      detail: `Dólar Oficial: Compra ${formatArs(dolarData.oficial?.compra)} / Venta ${formatArs(dolarData.oficial?.venta)} · Dólar Blue: Compra ${formatArs(dolarData.blue?.compra)} / Venta ${formatArs(dolarData.blue?.venta)}.`,
      syncedAt: formattedSync,
      severity: 'info',
    });

    // 5. Cotización Dólar Blue (Compra y Venta)
    list.push({
      id: 'unified-dolar-blue',
      kind: 'dolar_blue',
      badgeLabel: 'Dólar Blue',
      issuer: 'Mercado Informal',
      cityLabel: 'Compra / Venta',
      title: `Dólar Blue — Compra: ${formatArs(dolarData.blue?.compra)} · Venta: ${formatArs(dolarData.blue?.venta)}`,
      detail: `Dólar Blue: Compra ${formatArs(dolarData.blue?.compra)} / Venta ${formatArs(dolarData.blue?.venta)} · Dólar Oficial: Compra ${formatArs(dolarData.oficial?.compra)} / Venta ${formatArs(dolarData.oficial?.venta)}.`,
      syncedAt: formattedSync,
      severity: 'emerald',
    });

    // 6. Alertas de Defensa Civil / Meteorológicas (evitando duplicar las de corte/estado de ruta ya incluidas en el slide 1)
    for (const a of activeAlerts) {
      if (a.id === 'official-garibaldi-winter' || a.id === 'official-tolhuin-road') continue;
      const cLabel =
        a.city === 'ushuaia'
          ? 'Ushuaia'
          : a.city === 'rio_grande'
          ? 'Río Grande'
          : a.city === 'tolhuin'
          ? 'Tolhuin'
          : 'TDF';

      list.push({
        id: `unified-alert-${a.id}`,
        kind: 'alert',
        badgeLabel: a.severity === 'critical' ? 'Alerta Crítica' : 'Alerta TDF',
        issuer: a.issuer,
        cityLabel: cLabel,
        title: toSentenceCaseTitle(a.title),
        detail: a.description,
        syncedAt: a.syncedAt || formattedSync,
        severity: a.severity,
      });
    }

    return list;
  }, [activeAlerts, pharmaciesByCity, activePharmacy, weatherByCity, dolarData, selectedCity, formattedSync]);

  const total = slides.length;
  const safeIndex = total > 0 ? currentIndex % total : 0;
  const currentSlide = slides[safeIndex];

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Rotación cíclica y automática cada 4.2 segundos
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4200);
    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  if (!currentSlide) return null;

  const isCritical = currentSlide.severity === 'critical';
  const isWarning = currentSlide.severity === 'warning';
  const isEmerald = currentSlide.severity === 'emerald';

  const cardClass = isCritical
    ? 'alert-card-critical'
    : isWarning
    ? 'alert-card-warning'
    : 'alert-card-info';

  const badgeBg = isCritical
    ? 'bg-[#dc2626] text-white'
    : isWarning
    ? 'bg-[#d97706] text-white'
    : isEmerald
    ? 'bg-[#16a34a] text-white'
    : 'bg-[#0f4c81] text-white';

  const renderIcon = () => {
    if (currentSlide.kind === 'ruta') return <Car className="w-3 h-3 stroke-[1.75]" />;
    if (currentSlide.kind === 'farmacia') return <Cross className="w-3 h-3 stroke-[1.75]" />;
    if (currentSlide.kind === 'clima') return <Thermometer className="w-3 h-3 stroke-[1.75]" />;
    if (currentSlide.kind === 'dolar_oficial' || currentSlide.kind === 'dolar_blue') {
      return <TrendingUp className="w-3 h-3 stroke-[1.75]" />;
    }
    if (currentSlide.severity === 'info') return <Info className="w-3 h-3 stroke-[1.75]" />;
    return <AlertTriangle className="w-3 h-3 stroke-[1.75]" />;
  };

  return (
    <div className="sticky top-[52px] sm:top-[56px] z-30 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle shadow-xs transition-colors">
      <div className="max-w-[1440px] mx-auto px-2.5 py-1.5 sm:px-4 md:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-3">
          {/* Selector compacto de Ciudad (Ushuaia / Río Grande / Tolhuin) */}
          <div className="flex items-center justify-between lg:justify-start gap-1 shrink-0 lg:border-r border-border-subtle lg:pr-3">
            <button
              type="button"
              onClick={onDetectLocation}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-sunken hover:bg-slate-200 dark:hover:bg-slate-800 text-text-secondary transition-colors cursor-pointer shrink-0"
              title="Detectar mi ciudad por geolocalización"
            >
              <Navigation className={`w-3 h-3 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">Mi zona</span>
            </button>

            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {(
                [
                  { id: 'all', label: 'TDF' },
                  { id: 'ushuaia', label: 'Ushuaia' },
                  { id: 'rio_grande', label: 'R. Grande' },
                  { id: 'tolhuin', label: 'Tolhuin' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCity(c.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCity === c.id
                      ? 'bg-[#0f4c81] text-white'
                      : 'text-text-secondary hover:bg-surface-sunken'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ÚNICO SLIDER CÍCLICO Y AUTOMÁTICO EN TARJETA PEQUEÑA (SIN DUPLICADOS) */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0]?.clientX ?? null;
              setIsPaused(true);
            }}
            onTouchEnd={(e) => {
              const startX = touchStartXRef.current;
              const endX = e.changedTouches[0]?.clientX ?? null;
              if (startX !== null && endX !== null) {
                const delta = endX - startX;
                if (Math.abs(delta) > 36) {
                  if (delta < 0) handleNext();
                  else handlePrev();
                }
              }
              touchStartXRef.current = null;
              setTimeout(() => setIsPaused(false), 2500);
            }}
            onClick={() => setIsDetailOpen((prev) => !prev)}
            className={`flex-1 min-w-0 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 ${cardClass} transition-colors cursor-pointer select-none`}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Contenido deslizable en una sola línea compacta para móviles */}
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${badgeBg}`}>
                  {renderIcon()}
                  <span>{currentSlide.badgeLabel}</span>
                </span>

                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] text-text-secondary font-semibold shrink-0 tabular-nums">
                  {currentSlide.cityLabel}
                </span>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentSlide.id}
                      initial={{ opacity: 0, x: direction * 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -20 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="min-w-0"
                    >
                      <p className="text-[12px] sm:text-[13px] font-bold text-text-primary truncate tabular-nums">
                        {currentSlide.title}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Controles compactos del único slider */}
              <div className="flex items-center gap-0.5 shrink-0 tabular-nums">
                <span className="text-[10px] font-semibold text-text-tertiary px-1">
                  {safeIndex + 1}/{total}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused((p) => !p);
                  }}
                  className="hidden sm:inline-flex p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label={isPaused ? 'Reanudar' : 'Pausar'}
                >
                  {isPaused ? (
                    <Play className="w-3 h-3 stroke-[1.5]" />
                  ) : (
                    <Pause className="w-3 h-3 stroke-[1.5]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
                <span className="text-text-tertiary pl-0.5">
                  {isDetailOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
                  )}
                </span>
              </div>
            </div>

            {/* Detalle desplegable opcional al tocar la tarjeta */}
            {isDetailOpen && (
              <div className="mt-1.5 pt-1.5 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-text-secondary tabular-nums">
                <p className="font-medium">{currentSlide.detail || currentSlide.title}</p>
                <span className="inline-flex items-center gap-1 text-text-tertiary shrink-0">
                  <Clock className="w-3 h-3 stroke-[1.5]" />
                  <span>{currentSlide.issuer} · Sinc: {currentSlide.syncedAt}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
