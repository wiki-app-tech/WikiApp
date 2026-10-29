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
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TdfAlertItem, TdfCity } from '@/utils/tdfIntelligence';
import { triggerSegmentedCriticalPush } from '@/utils/tdfIntelligence';

interface PharmacyItem {
  fecha?: string;
  dia?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario?: string;
}

interface TdfStickyStatusBarProps {
  selectedCity: TdfCity;
  onSelectCity: (city: TdfCity) => void;
  activeAlerts: TdfAlertItem[];
  activePharmacy: PharmacyItem | null;
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
  pharmacyCityName,
  syncTime,
  onDetectLocation,
  isLocating = false,
}: TdfStickyStatusBarProps) {
  const [expandedDetail, setExpandedDetail] = useState<'ruta' | 'alerta' | 'farmacia' | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [alertIndex, setAlertIndex] = useState<number>(0);
  const [critIndex, setCritIndex] = useState<number>(0);

  // Separar alertas críticas y todas las alertas activas para rotación cíclica automática
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const totalAlerts = activeAlerts.length;
  const currentCyclicAlert = totalAlerts > 0 ? activeAlerts[alertIndex % totalAlerts] : null;
  const currentCriticalBanner = criticalAlerts.length > 0 ? criticalAlerts[critIndex % criticalAlerts.length] : null;

  // Rotación cíclica y automática de todas las alertas de Tierra del Fuego cada 4 segundos
  useEffect(() => {
    if (totalAlerts <= 1) return;
    const timer = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % totalAlerts);
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

  // Estado de Ruta 3 según ciudad seleccionada y alertas viales vigentes
  const getRuta3Status = () => {
    const roadCut = criticalAlerts.find((a) => a.type === 'road_cut');
    if (roadCut) {
      return {
        label: 'Corte RN 3',
        segment: selectedCity === 'rio_grande' ? 'San Sebastián – R. Grande' : selectedCity === 'tolhuin' ? 'R. Grande – Tolhuin' : 'Paso Garibaldi',
        level: 'critical' as const,
        issuer: roadCut.issuer,
        detail: roadCut.title,
      };
    }

    if (selectedCity === 'rio_grande') {
      return {
        label: 'RN 3 Habilitada',
        segment: 'San Sebastián – Río Grande',
        level: 'ok' as const,
        issuer: 'Vialidad Nacional',
        detail: 'Calzada despejada y transitable. Precaución por ráfagas laterales en sectores descampados.',
      };
    }

    if (selectedCity === 'tolhuin') {
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

  const cleanPhone = activePharmacy?.telefono
    ? activePharmacy.telefono.replace(/(Tel\.|Cel\.|CEL\.)/gi, '').split(/[\/–]/)[0].trim()
    : '';
  const telHref = cleanPhone.replace(/[^\d+]/g, '');

  return (
    <div className="sticky top-[52px] sm:top-[56px] z-30 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle shadow-xs transition-colors">
      {/* BANNER FIJO ROJO COMPACTO Y CÍCLICO PARA ALERTAS CRÍTICAS (NO ROBA PANTALLA EN MÓVILES) */}
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

      {/* FRANJA HORIZONTAL ULTRA-COMPACTA EN MÓVIL Y ESCRITORIO */}
      <div className="max-w-[1440px] mx-auto px-2.5 py-1.5 sm:px-4 md:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-1.5 lg:gap-2 lg:items-center">
          {/* Fila 1 en móvil / Col 3 en desktop: Selector rápido de Ciudad */}
          <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-1 lg:border-r border-border-subtle lg:pr-2.5">
            <button
              type="button"
              onClick={onDetectLocation}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-surface-sunken hover:bg-slate-200 dark:hover:bg-slate-800 text-text-secondary transition-colors cursor-pointer shrink-0"
              title="Detectar mi ciudad por geolocalización"
            >
              <Navigation className={`w-3 h-3 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">Mi zona</span>
            </button>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {(
                [
                  { id: 'all', label: 'TDF' },
                  { id: 'ushuaia', label: 'Ushuaia' },
                  { id: 'rio_grande', label: 'Río Grande' },
                  { id: 'tolhuin', label: 'Tolhuin' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCity(c.id)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
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

          {/* En móvil: grilla compacta de tarjetas pequeñas para Ruta 3, Slider de Alerta y Farmacia sin robar pantalla */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-1.5 lg:gap-2 items-stretch">
            {/* 1. INDICADOR COMPACTO: ESTADO DE RUTA 3 */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'ruta' ? null : 'ruta')}
              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 ${
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
                    <span className="text-[11px] sm:text-[12px] font-bold text-text-primary truncate">
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
                  <span className="text-[10px] sm:text-[11px] text-text-tertiary block truncate">
                    {rutaStatus.segment}
                  </span>
                </div>
              </div>
              {expandedDetail === 'ruta' ? (
                <ChevronUp className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
              )}
            </button>

            {/* 2. INDICADOR COMPACTO: FARMACIA DE TURNO */}
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'farmacia' ? null : 'farmacia')}
              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/15 text-[#16a34a] flex items-center justify-center shrink-0">
                  <Cross className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.5]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-[12px] font-bold text-text-primary truncate">
                      {activePharmacy ? activePharmacy.nombre : 'Farmacia'}
                    </span>
                    <span className="hidden xs:inline text-[10px] font-semibold px-1 py-0.1 rounded bg-emerald-500/15 text-[#16a34a] shrink-0">
                      {pharmacyCityName}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-text-tertiary block truncate tabular-nums">
                    {activePharmacy ? activePharmacy.direccion : 'Sincronizando...'}
                  </span>
                </div>
              </div>
              {expandedDetail === 'farmacia' ? (
                <ChevronUp className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 stroke-[1.5] text-text-tertiary shrink-0" />
              )}
            </button>

            {/* 3. TARJETA PEQUEÑA CON SLIDER CÍCLICO AUTOMÁTICO DE ALERTAS TDF */}
            <div
              onClick={() => setExpandedDetail(expandedDetail === 'alerta' ? null : 'alerta')}
              className={`col-span-2 sm:col-span-1 flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors text-left cursor-pointer min-w-0 overflow-hidden ${
                currentCyclicAlert?.severity === 'critical'
                  ? 'alert-card-critical'
                  : currentCyclicAlert?.severity === 'warning'
                  ? 'alert-card-warning'
                  : 'bg-surface-sunken/70 border-border-subtle'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {currentCyclicAlert ? (
                  <AlertTriangle
                    className={`w-3.5 h-3.5 stroke-[1.5] shrink-0 ${
                      currentCyclicAlert.severity === 'critical'
                        ? 'text-[#dc2626]'
                        : 'text-[#d97706]'
                    }`}
                  />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-[#16a34a] shrink-0" />
                )}

                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentCyclicAlert ? currentCyclicAlert.id : 'no-alerts'}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="min-w-0"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-bold text-text-primary truncate">
                          {currentCyclicAlert
                            ? `${currentCyclicAlert.issuer}`
                            : 'Defensa Civil: Sin alertas'}
                        </span>
                        {totalAlerts > 1 && (
                          <span className="text-[9px] font-bold text-text-tertiary tabular-nums shrink-0">
                            {(alertIndex % totalAlerts) + 1}/{totalAlerts}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-text-secondary block truncate">
                        {currentCyclicAlert ? currentCyclicAlert.title : 'Condiciones normales en TDF'}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {totalAlerts > 1 && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAlertIndex((prev) => (prev - 1 + totalAlerts) % totalAlerts);
                    }}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-tertiary"
                    aria-label="Alerta anterior"
                  >
                    <ChevronLeft className="w-3 h-3 stroke-[1.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAlertIndex((prev) => (prev + 1) % totalAlerts);
                    }}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-text-tertiary"
                    aria-label="Siguiente alerta"
                  >
                    <ChevronRight className="w-3 h-3 stroke-[1.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE DETALLE RÁPIDO Y TRAZABILIDAD OFICIAL */}
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

            {expandedDetail === 'alerta' && (
              <>
                <div className="space-y-0.5">
                  {currentCyclicAlert ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary tabular-nums">
                        <span>Organismo: <strong className="text-text-primary">{currentCyclicAlert.issuer}</strong></span>
                        <span>·</span>
                        <span>Sincronizado: <strong>{currentCyclicAlert.syncedAt}</strong></span>
                        <span>·</span>
                        <span>Caducidad (TTL): {currentCyclicAlert.ttlHours}h</span>
                      </div>
                      <p className="text-[13px] font-semibold text-text-primary">
                        {currentCyclicAlert.title}
                      </p>
                      <p className="text-[12px] text-text-secondary">
                        {currentCyclicAlert.description}
                      </p>
                    </>
                  ) : (
                    <p className="text-[13px] text-text-secondary">
                      No se registran alertas meteorológicas ni viales críticas vigentes para {pharmacyCityName}. (Sincronizado: {formattedSync})
                    </p>
                  )}
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

            {expandedDetail === 'farmacia' && activePharmacy && (
              <>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary tabular-nums">
                    <span>Ciudad: <strong className="text-text-primary">{pharmacyCityName}</strong></span>
                    <span>·</span>
                    <span>Turno hasta las 09:00 hs</span>
                    <span>·</span>
                    <span>Sincronizado: {formattedSync}</span>
                  </div>
                  <p className="text-[13px] font-bold text-text-primary">
                    {activePharmacy.nombre} — <span className="font-normal text-text-secondary">{activePharmacy.direccion}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`Farmacia ${activePharmacy.nombre}, ${activePharmacy.direccion}, ${pharmacyCityName}, Tierra del Fuego`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-surface-sunken text-text-primary hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <MapPin className="w-3.5 h-3.5 stroke-[1.5] text-[#0f4c81] dark:text-sky-400" />
                    <span>Ubicación</span>
                  </a>
                  {telHref && (
                    <a
                      href={`tel:${telHref}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#16a34a] text-white hover:bg-emerald-700 tabular-nums"
                    >
                      <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{cleanPhone}</span>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
