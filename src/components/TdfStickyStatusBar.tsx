'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  AlertTriangle,
  ShieldCheck,
  Cross,
  MapPin,
  Phone,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Navigation,
  ExternalLink,
  Thermometer,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TdfAlertItem, TdfCity } from '@/utils/tdfIntelligence';
import { triggerSegmentedCriticalPush } from '@/utils/tdfIntelligence';

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

export default function TdfStickyStatusBar({
  selectedCity,
  onSelectCity,
  activeAlerts,
  activePharmacy,
  pharmaciesByCity,
  pharmacyCityName,
  syncTime,
  onDetectLocation,
  isLocating = false,
}: TdfStickyStatusBarProps) {
  const [expandedDetail, setExpandedDetail] = useState<'ruta' | 'alerta' | 'farmacia' | 'clima' | 'dolar' | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [alertIndex, setAlertIndex] = useState<number>(0);
  const [critIndex, setCritIndex] = useState<number>(0);
  const [cityCycleIndex, setCityCycleIndex] = useState<number>(0);
  const [dolarCycleIndex, setDolarCycleIndex] = useState<number>(0);

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
            const nextWeather = { ...weatherByCity };
            for (const item of wJson) {
              const maxVal = Array.isArray(item?.daily?.temperatureMax) ? Math.round(item.daily.temperatureMax[0]) : 8;
              const minVal = Array.isArray(item?.daily?.temperatureMin) ? Math.round(item.daily.temperatureMin[0]) : 1;
              const curVal = typeof item?.current?.temperature === 'number' ? Math.round(item.current.temperature) : maxVal;

              if (item.id === 'ushuaia') {
                nextWeather.ushuaia = { id: 'ushuaia', name: 'Ushuaia', temp: curVal, max: maxVal, min: minVal };
              } else if (item.id === 'riogrande' || item.id === 'rio_grande') {
                nextWeather.rio_grande = { id: 'rio_grande', name: 'Río Grande', temp: curVal, max: maxVal, min: minVal };
              } else if (item.id === 'tolhuin') {
                nextWeather.tolhuin = { id: 'tolhuin', name: 'Tolhuin', temp: curVal, max: maxVal, min: minVal };
              }
            }
            setWeatherByCity(nextWeather);
          }
        }

        if (dRes.status === 'fulfilled' && dRes.value.ok) {
          const dJson = await dRes.value.json();
          if (dJson?.oficial || dJson?.blue) {
            setDolarData({
              oficial: dJson.oficial || dolarData.oficial,
              blue: dJson.blue || dolarData.blue,
            });
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

  // Separar alertas críticas y todas las alertas activas para rotación cíclica automática
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const totalAlerts = activeAlerts.length;
  const currentCyclicAlert = totalAlerts > 0 ? activeAlerts[alertIndex % totalAlerts] : null;
  const currentCriticalBanner = criticalAlerts.length > 0 ? criticalAlerts[critIndex % criticalAlerts.length] : null;

  // Rotación cíclica automática cada 4 segundos para ciudades (cuando está seleccionado 'all' = TDF) y cotizaciones
  useEffect(() => {
    const timer = setInterval(() => {
      setCityCycleIndex((prev) => (prev + 1) % 3);
      setDolarCycleIndex((prev) => (prev + 1) % 2);
      if (totalAlerts > 1) {
        setAlertIndex((prev) => (prev + 1) % totalAlerts);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [totalAlerts]);

  useEffect(() => {
    if (criticalAlerts.length <= 1) return;
    const timer = setInterval(() => {
      setCritIndex((prev) => (prev + 1) % criticalAlerts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [criticalAlerts.length]);

  const cityKeys: ('ushuaia' | 'rio_grande' | 'tolhuin')[] = ['ushuaia', 'rio_grande', 'tolhuin'];
  const activeCityKey: 'ushuaia' | 'rio_grande' | 'tolhuin' =
    selectedCity === 'all' ? cityKeys[cityCycleIndex % 3] : selectedCity;

  const cityDisplayLabel =
    activeCityKey === 'ushuaia'
      ? 'Ushuaia'
      : activeCityKey === 'rio_grande'
      ? 'Río Grande'
      : 'Tolhuin';

  // Farmacia de turno por ciudad (SOLO EL NOMBRE en la tarjeta compacta)
  const displayedPharmacy: PharmacyItem | null =
    pharmaciesByCity ? pharmaciesByCity[activeCityKey] : activePharmacy;

  const displayedWeather = weatherByCity[activeCityKey];

  // Estado de Ruta 3 según ciudad seleccionada/cíclica y alertas viales vigentes
  const getRuta3Status = () => {
    const roadCut = criticalAlerts.find((a) => a.type === 'road_cut');
    if (roadCut) {
      return {
        label: 'Corte RN 3',
        segment: activeCityKey === 'rio_grande' ? 'San Sebastián – R. Grande' : activeCityKey === 'tolhuin' ? 'R. Grande – Tolhuin' : 'Paso Garibaldi',
        level: 'critical' as const,
        issuer: roadCut.issuer,
        detail: roadCut.title,
      };
    }

    if (activeCityKey === 'rio_grande') {
      return {
        label: 'RN 3 Habilitada',
        segment: 'San Sebastián – Río Grande',
        level: 'ok' as const,
        issuer: 'Vialidad Nacional',
        detail: 'Calzada despejada y transitable. Precaución por ráfagas laterales en sectores descampados.',
      };
    }

    if (activeCityKey === 'tolhuin') {
      return {
        label: 'RN 3 Precaución',
        segment: 'Río Grande – Tolhuin – Garibaldi',
        level: 'warning' as const,
        issuer: 'Vialidad Provincial',
        detail: 'Calzada húmeda en zona alta. Circular con luces bajas encendidas y velocidad precautoria.',
      };
    }

    return {
      label: 'RN 3 Precaución',
      segment: 'Paso Garibaldi · Ushuaia',
      level: 'warning' as const,
      issuer: 'Vialidad Nacional',
      detail: 'Calzada transitable con precaución en zona de montaña (Paso Garibaldi). Portación de cubiertas de invierno.',
    };
  };

  const rutaStatus = getRuta3Status();
  const formattedSync = syncTime ? syncTime.slice(0, 5) + ' hs' : 'En vivo';

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setPushEnabled(true);
      if (criticalAlerts[0]) {
        triggerSegmentedCriticalPush(criticalAlerts[0], selectedCity);
      }
    }
  };

  const cleanPhone = displayedPharmacy?.telefono
    ? displayedPharmacy.telefono.replace(/(Tel\.|Cel\.|CEL\.)/gi, '').split(/[\/–]/)[0].trim()
    : '';
  const telHref = cleanPhone.replace(/[^\d+]/g, '');

  const formatArs = (val?: number) => {
    if (typeof val !== 'number' || isNaN(val)) return '--';
    return `$${val.toLocaleString('es-AR')}`;
  };

  return (
    <div className="sticky top-[52px] sm:top-[56px] z-30 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle shadow-xs transition-colors">
      {/* BANNER FIJO ROJO COMPACTO Y CÍCLICO PARA ALERTAS CRÍTICAS */}
      {currentCriticalBanner && (
        <div
          role="alert"
          aria-live="assertive"
          className="w-full bg-[#dc2626] text-white px-3 py-1.5 md:px-6 border-b border-red-800"
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <AlertTriangle className="w-4 h-4 stroke-[1.5] shrink-0" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentCriticalBanner.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[12px] sm:text-[13px] leading-snug truncate"
                >
                  <span className="font-bold mr-1.5">Alerta crítica ({currentCriticalBanner.issuer}):</span>
                  <span className="font-semibold">{currentCriticalBanner.title}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px] tabular-nums text-red-100">
              <span>Sinc: {currentCriticalBanner.syncedAt}</span>
              <span>·</span>
              <span>TTL {currentCriticalBanner.ttlHours}h</span>
              {criticalAlerts.length > 1 && (
                <span className="px-1.5 py-0.2 rounded bg-black/20 font-bold">
                  {(critIndex % criticalAlerts.length) + 1}/{criticalAlerts.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FRANJA HORIZONTAL COMPACTA: CIUDAD + RUTA 3 + FARMACIA (SOLO NOMBRE) + CLIMA HOY (MÁX/MÍN) + DÓLAR OFICIAL/BLUE */}
      <div className="max-w-[1440px] mx-auto px-2.5 py-1.5 sm:px-4 md:px-6">
        <div className="flex flex-col xl:grid xl:grid-cols-12 gap-1.5 xl:items-center">
          {/* Selector de Ciudad / Geolocalización (Col 2) */}
          <div className="xl:col-span-2 flex items-center justify-between xl:justify-start gap-1 xl:border-r border-border-subtle xl:pr-2">
            <button
              type="button"
              onClick={onDetectLocation}
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-sunken hover:bg-slate-200 dark:hover:bg-slate-800 text-text-secondary transition-colors cursor-pointer shrink-0"
              title="Detectar mi ciudad por geolocalización"
            >
              <Navigation className={`w-3 h-3 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
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

          {/* Tarjetas pequeñas horizontales (Deslizable sin robar pantalla en móvil) */}
          <div className="xl:col-span-10 flex xl:grid xl:grid-cols-4 gap-1.5 overflow-x-auto scrollbar-hide items-stretch">
            {/* 1. ESTADO DE RUTAS */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'ruta' ? null : 'ruta')}
              className="shrink-0 w-[180px] sm:w-[205px] xl:w-auto flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                    rutaStatus.level === 'critical'
                      ? 'bg-red-500/15 text-[#dc2626]'
                      : rutaStatus.level === 'warning'
                      ? 'bg-amber-500/15 text-[#d97706]'
                      : 'bg-emerald-500/15 text-[#16a34a]'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 stroke-[1.5]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-text-primary truncate">
                      {rutaStatus.label}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        rutaStatus.level === 'critical'
                          ? 'bg-[#dc2626]'
                          : rutaStatus.level === 'warning'
                          ? 'bg-[#d97706]'
                          : 'bg-[#16a34a]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary block truncate">
                    {rutaStatus.segment}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
            </button>

            {/* 2. FARMACIA DE TURNO POR CIUDAD (SOLO EL NOMBRE) */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'farmacia' ? null : 'farmacia')}
              className="shrink-0 w-[185px] sm:w-[210px] xl:w-auto flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-[#16a34a] flex items-center justify-center shrink-0">
                  <Cross className="w-3 h-3 stroke-[1.5]" />
                </span>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`pharm-${activeCityKey}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-[#16a34a] shrink-0">
                          Turno {cityDisplayLabel}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-text-primary block truncate">
                        {displayedPharmacy ? displayedPharmacy.nombre : 'Farmacia de Turno'}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
            </button>

            {/* 3. CLIMA DE HOY (MÁXIMA Y MÍNIMA) POR CADA CIUDAD */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'clima' ? null : 'clima')}
              className="shrink-0 w-[185px] sm:w-[210px] xl:w-auto flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-lg bg-sky-500/15 text-[#0284c7] flex items-center justify-center shrink-0">
                  <Thermometer className="w-3.5 h-3.5 stroke-[1.5]" />
                </span>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`weather-${activeCityKey}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0 tabular-nums"
                    >
                      <span className="text-[10px] font-semibold text-text-secondary block truncate">
                        Clima hoy · {cityDisplayLabel}
                      </span>
                      <span className="text-[11px] font-bold text-text-primary block truncate">
                        Máx {displayedWeather.max}°C · Mín {displayedWeather.min}°C
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
            </button>

            {/* 4. COTIZACIÓN DÓLAR OFICIAL (COMPRA Y VENTA) + DÓLAR BLUE (COMPRA Y VENTA) */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'dolar' ? null : 'dolar')}
              className="shrink-0 w-[205px] sm:w-[225px] xl:w-auto flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-lg bg-[#0f4c81]/15 text-[#0f4c81] dark:text-sky-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 stroke-[1.5]" />
                </span>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`dolar-${dolarCycleIndex % 2}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0 tabular-nums"
                    >
                      {dolarCycleIndex % 2 === 0 ? (
                        <>
                          <span className="text-[10px] font-semibold text-[#0f4c81] dark:text-sky-400 block truncate">
                            Dólar Oficial
                          </span>
                          <span className="text-[11px] font-bold text-text-primary block truncate">
                            C: {formatArs(dolarData.oficial?.compra)} · V: {formatArs(dolarData.oficial?.venta)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                            Dólar Blue
                          </span>
                          <span className="text-[11px] font-bold text-text-primary block truncate">
                            C: {formatArs(dolarData.blue?.compra)} · V: {formatArs(dolarData.blue?.venta)}
                          </span>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
            </button>
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE DETALLE RÁPIDO */}
        {expandedDetail && (
          <div className="mt-1.5 pt-2 border-t border-border-subtle text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-surface-primary/60 rounded-xl p-2.5">
            {expandedDetail === 'ruta' && (
              <>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-text-tertiary tabular-nums">
                    <span>Organismo emisor: <strong className="text-text-primary">{rutaStatus.issuer}</strong></span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 stroke-[1.5]" />
                      Sincronizado: {formattedSync}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-primary font-semibold">
                    {rutaStatus.detail}
                  </p>
                </div>
                <a
                  href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0f4c81] dark:text-sky-400 hover:underline shrink-0"
                >
                  <span>Parte oficial Vialidad</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                </a>
              </>
            )}

            {expandedDetail === 'farmacia' && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['ushuaia', 'rio_grande', 'tolhuin'] as const).map((ck) => {
                  const p = pharmaciesByCity ? pharmaciesByCity[ck] : activePharmacy;
                  const cName = ck === 'ushuaia' ? 'Ushuaia' : ck === 'rio_grande' ? 'Río Grande' : 'Tolhuin';
                  return (
                    <div key={ck} className="px-2.5 py-1.5 rounded-lg bg-surface-sunken flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-[#16a34a] block">{cName}</span>
                        <span className="text-[12px] font-bold text-text-primary block truncate">
                          {p ? p.nombre : 'Sin datos'}
                        </span>
                      </div>
                      {p && (
                        <a
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`Farmacia ${p.nombre}, ${p.direccion}, ${cName}, Tierra del Fuego`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#0f4c81] dark:text-sky-400 hover:underline shrink-0"
                        >
                          Mapa
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {expandedDetail === 'clima' && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 tabular-nums">
                {(['ushuaia', 'rio_grande', 'tolhuin'] as const).map((ck) => {
                  const w = weatherByCity[ck];
                  return (
                    <div key={ck} className="px-2.5 py-1.5 rounded-lg bg-surface-sunken flex items-center justify-between">
                      <span className="text-[12px] font-bold text-text-primary">{w.name}</span>
                      <span className="text-[12px] font-semibold text-text-secondary">
                        Actual {w.temp}°C · <strong className="text-text-primary">Máx {w.max}°C / Mín {w.min}°C</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {expandedDetail === 'dolar' && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 tabular-nums">
                <div className="px-3 py-1.5 rounded-lg bg-surface-sunken flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#0f4c81] dark:text-sky-400">Dólar Oficial</span>
                  <span className="text-[12px] font-semibold text-text-primary">
                    Compra: <strong>{formatArs(dolarData.oficial?.compra)}</strong> · Venta: <strong>{formatArs(dolarData.oficial?.venta)}</strong>
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-surface-sunken flex items-center justify-between">
                  <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">Dólar Blue</span>
                  <span className="text-[12px] font-semibold text-text-primary">
                    Compra: <strong>{formatArs(dolarData.blue?.compra)}</strong> · Venta: <strong>{formatArs(dolarData.blue?.venta)}</strong>
                  </span>
                </div>
              </div>
            )}

            {expandedDetail === 'alerta' && currentCyclicAlert && (
              <>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary tabular-nums">
                    <span>Organismo: <strong className="text-text-primary">{currentCyclicAlert.issuer}</strong></span>
                    <span>·</span>
                    <span>Sincronizado: <strong>{currentCyclicAlert.syncedAt}</strong></span>
                  </div>
                  <p className="text-[13px] font-semibold text-text-primary">
                    {currentCyclicAlert.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0f4c81] text-white hover:bg-[#0c3b66] shrink-0 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{pushEnabled ? 'Alertas Push activas' : 'Recibir alertas críticas'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
