'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Wifi,
  ChevronRight,
  ArrowDown,
  Sparkles,
  MonitorSmartphone
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

type PlatformTab = 'android' | 'ios';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>('android');
  const [detectedPlatform, setDetectedPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Detect OS & standalone status + register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker for PWA installability on Android & Desktop
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('SW registration warning:', err));
    }

    // 2. Check if already running as installed standalone app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect user device platform (compatible with old and new Android & iOS versions)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);

    if (isIOSDevice) {
      setDetectedPlatform('ios');
      setSelectedPlatform('ios');
      setShowManualSteps(true);
    } else if (isAndroidDevice) {
      setDetectedPlatform('android');
      setSelectedPlatform('android');
    } else {
      setDetectedPlatform('desktop');
      setSelectedPlatform('android');
    }

    // 4. Pick up early captured beforeinstallprompt if present
    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2200);
    };

    const handleCustomOpen = () => {
      setShowManualSteps(isIOSDevice);
      setIsModalOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-pwa-install-modal', handleCustomOpen);

    // 5. Auto-open the download window after 1.5s if not dismissed in this session
    const dismissedSession = sessionStorage.getItem('wikiapp_pwa_modal_dismissed');
    const timer = setTimeout(() => {
      if (!dismissedSession && !isStandalone) {
        setIsModalOpen(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install-modal', handleCustomOpen);
    };
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    try {
      sessionStorage.setItem('wikiapp_pwa_modal_dismissed', 'true');
    } catch {
      // ignore storage errors in private mode
    }
  }, []);

  const handleDownloadClick = async () => {
    // If native install prompt is available (Android Chrome / Samsung / Edge / Desktop), trigger it immediately
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          window.__deferredPwaPrompt = null;
        } else {
          // If dismissed, show step-by-step fallback instructions just in case
          setShowManualSteps(true);
        }
      } catch {
        setShowManualSteps(true);
      }
      return;
    }

    // If on iOS or an Android browser without beforeinstallprompt, reveal universal step-by-step instructions
    setShowManualSteps(true);
  };

  if (isInstalled && !installSuccess) {
    return null;
  }

  return (
    <>
      {/* Floating Mini Trigger Pill (bottom-right) when modal is closed so user can always download */}
      <AnimatePresence>
        {!isModalOpen && !isInstalled && (
          <motion.button
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1b263b] dark:bg-[#151824] text-[#f7f7f7] border border-[#d4af37]/60 shadow-[0_8px_30px_rgba(27,38,59,0.35)] hover:border-[#d4af37] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Descargar Aplicación Web en tu dispositivo"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c5a028] flex items-center justify-center text-[#1b263b] shadow-sm">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col items-start pr-1">
              <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold leading-none">
                App Disponible
              </span>
              <span className="text-xs font-extrabold tracking-tight text-white leading-tight">
                Descargar App
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Download / Install Modal Window */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0d0f17]/75 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-[#f7f7f7] dark:bg-[#151824] text-[#1b263b] dark:text-[#f7f7f7] rounded-t-3xl sm:rounded-3xl border border-[#e5e0da] dark:border-[#d4af37]/30 shadow-[0_24px_60px_rgba(0,0,0,0.45)] overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Top Luxury Banner Header */}
              <div className="relative bg-gradient-to-br from-[#1b263b] via-[#151d2e] to-[#4a2e35] p-5 sm:p-6 text-white overflow-hidden shrink-0">
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#d4af37]/15 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#0095ff]/15 blur-2xl pointer-events-none" />

                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Cerrar ventana de descarga"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  {/* App Icon Preview */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d1522] to-[#1b263b] border-2 border-[#d4af37]/60 shadow-[0_6px_20px_rgba(212,175,55,0.25)] flex items-center justify-center shrink-0 p-2.5">
                    <svg viewBox="0 0 500 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 140 C 90 220, 200 270, 360 210 C 430 180, 480 100, 490 80 C 470 110, 410 170, 340 185 C 240 210, 140 170, 80 135 C 150 160, 240 160, 300 120 C 350 87, 430 40, 480 40 C 410 40, 320 80, 260 110 C 200 140, 110 135, 20 140 Z"
                        fill="#0095ff"
                      />
                      <path
                        d="M80 135 C 160 80, 300 30, 480 40 C 420 55, 300 110, 220 135 C 160 155, 100 150, 80 135 Z"
                        fill="#ff8c00"
                      />
                      <path
                        d="M180 135 C 230 115, 300 70, 420 50 C 350 75, 260 115, 200 132 C 160 142, 110 138, 95 133 C 120 125, 150 120, 180 135 Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#e5cf87] text-[10px] font-bold uppercase tracking-widest mb-1">
                      <Sparkles className="w-3 h-3 text-[#d4af37]" />
                      App Web Oficial
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display leading-tight">
                      WikiApp <span className="text-[#d4af37]">PRO</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                      Instala la aplicación en tu pantalla de inicio para acceso rápido en Android y iOS.
                    </p>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-medium">
                    <Zap className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span className="truncate">Carga Instantánea</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span className="truncate">Sin Tiendas</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-medium">
                    <Wifi className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span className="truncate">Peso Ligero</span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {installSuccess ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold">¡Aplicación Instalada con Éxito!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Ya puedes abrir <strong>WikiApp PRO</strong> directamente desde el ícono en la pantalla principal de tu dispositivo.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* OS Selector Tabs (Compatible with all Android and iOS versions) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Selecciona tu sistema operativo
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#4a2e35] dark:text-[#e5cf87]">
                          {detectedPlatform === 'ios'
                            ? 'iPhone / iPad detectado'
                            : detectedPlatform === 'android'
                            ? 'Android detectado'
                            : 'Compatible con Todos'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-[#0d0f17] border border-[#e5e0da] dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setSelectedPlatform('android')}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedPlatform === 'android'
                              ? 'bg-white dark:bg-[#1b263b] text-[#1b263b] dark:text-white shadow-sm border border-[#d4af37]/40'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#1b263b] dark:hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-[#d4af37]" />
                          <span>Android (Todas)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlatform('ios');
                            setShowManualSteps(true);
                          }}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedPlatform === 'ios'
                              ? 'bg-white dark:bg-[#1b263b] text-[#1b263b] dark:text-white shadow-sm border border-[#d4af37]/40'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#1b263b] dark:hover:text-white'
                          }`}
                        >
                          <MonitorSmartphone className="w-4 h-4 text-[#d4af37]" />
                          <span>iPhone / iPad (iOS)</span>
                        </button>
                      </div>
                    </div>

                    {/* ANDROID VIEW */}
                    {selectedPlatform === 'android' && (
                      <div className="space-y-3.5">
                        {/* Primary Direct Download Button */}
                        <button
                          type="button"
                          onClick={handleDownloadClick}
                          className="w-full btn-gold-luxury py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-extrabold shadow-lg cursor-pointer"
                        >
                          <Download className="w-5 h-5 stroke-[2.5]" />
                          <span>
                            {deferredPrompt
                              ? 'Descargar e Instalar App Ahora'
                              : 'Descargar App en mi Dispositivo'}
                          </span>
                        </button>

                        {/* Universal Android Step-by-Step Guide (Works on ALL Android versions & browsers) */}
                        {(showManualSteps || !deferredPrompt) && (
                          <div className="rounded-2xl bg-white dark:bg-[#0d0f17]/90 border border-[#e5e0da] dark:border-white/10 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b263b] dark:text-[#e5cf87]">
                                Instalación universal en Android
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Cualquier versión
                              </span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                                  1
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                  Toca el menú del navegador{' '}
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-semibold text-[#1b263b] dark:text-white">
                                    <MoreVertical className="w-3.5 h-3.5 mr-0.5" /> Menú
                                  </span>{' '}
                                  en la esquina superior derecha.
                                </p>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                                  2
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                  Elige la opción{' '}
                                  <strong className="text-[#1b263b] dark:text-white">
                                    &ldquo;Instalar aplicación&rdquo;
                                  </strong>{' '}
                                  o{' '}
                                  <strong className="text-[#1b263b] dark:text-white">
                                    &ldquo;Agregar a la pantalla principal&rdquo;
                                  </strong>.
                                </p>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                                  3
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                  Confirma pulsando{' '}
                                  <strong className="text-[#1b263b] dark:text-white">
                                    &ldquo;Instalar&rdquo;
                                  </strong>{' '}
                                  y el ícono aparecerá junto a tus demás apps.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* iOS (iPhone / iPad) VIEW - Compatible with all iOS versions */}
                    {selectedPlatform === 'ios' && (
                      <div className="rounded-2xl bg-white dark:bg-[#0d0f17]/90 border border-[#e5e0da] dark:border-white/10 p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b263b] dark:text-[#e5cf87]">
                            Cómo descargar en iPhone / iPad
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Todas las versiones de iOS
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                              1
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              Toca el botón{' '}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                                <Share className="w-3.5 h-3.5" /> Compartir
                              </span>{' '}
                              en la barra inferior o superior de Safari / Chrome.
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                              2
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              Desliza el menú hacia abajo y selecciona{' '}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[#1b263b] dark:text-white font-bold">
                                <PlusSquare className="w-3.5 h-3.5 text-[#d4af37]" /> Agregar a inicio
                              </span>.
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#1b263b] dark:bg-[#d4af37]/20 text-white dark:text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px]">
                              3
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              Pulsa{' '}
                              <strong className="text-[#1b263b] dark:text-white">
                                &ldquo;Agregar&rdquo;
                              </strong>{' '}
                              en la esquina superior derecha para finalizar la descarga.
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-[#4a2e35] dark:text-[#e5cf87] bg-[#d4af37]/10 rounded-xl py-2 px-3">
                          <ArrowDown className="w-4 h-4 animate-bounce text-[#d4af37]" />
                          <span>Busca el ícono de Compartir en tu navegador</span>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#e5e0da] dark:border-white/10">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white py-2 px-3 rounded-xl transition-colors cursor-pointer"
                      >
                        Ahora no, continuar en web
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedPlatform === 'android' && deferredPrompt) {
                            handleDownloadClick();
                          } else {
                            handleCloseModal();
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1b263b] dark:text-[#d4af37] hover:underline py-2 px-3 cursor-pointer"
                      >
                        <span>Entendido</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

