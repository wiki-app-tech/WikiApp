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

/**
 * Ícono monolineal (1.5px) de Faro Austral + Ondas de Señal/Alerta ("Fin del Mundo")
 */
export const FaroAustralLogo = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="WikiApp TDF — Información al día"
  >
    <rect width="32" height="32" rx="7" fill="#0f4c81" />
    <path d="M9.5 7.5C7.8 9.2 7.8 12 9.5 13.7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.8 5.2C3.8 8.2 3.8 13 6.8 16" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    <path d="M22.5 7.5C24.2 9.2 24.2 12 22.5 13.7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M25.2 5.2C28.2 8.2 28.2 13 25.2 16" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    <circle cx="16" cy="10.5" r="2.2" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M13.5 13L11.5 25.5H20.5L18.5 13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 18.5H19.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 25.5H23" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>('android');
  const [detectedPlatform, setDetectedPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('SW registration warning:', err));
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

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
      // ignore storage errors
    }
  }, []);

  const handleDownloadClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          window.__deferredPwaPrompt = null;
        } else {
          setShowManualSteps(true);
        }
      } catch {
        setShowManualSteps(true);
      }
      return;
    }
    setShowManualSteps(true);
  };

  if (isInstalled && !installSuccess) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isModalOpen && !isInstalled && (
          <motion.button
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0f4c81] text-white border border-sky-400/40 shadow-lg hover:bg-[#0c3b66] active:scale-95 transition-all cursor-pointer"
            title="Instalar WikiApp TDF en tu dispositivo"
          >
            <Download className="w-4 h-4 stroke-[1.5]" />
            <span className="text-xs font-semibold">Descargar App TDF</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="relative bg-[#0f4c81] p-5 text-white shrink-0">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Cerrar ventana de descarga"
                >
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>

                <div className="flex items-center gap-3.5">
                  <FaroAustralLogo className="w-12 h-12 shrink-0 rounded-xl shadow-md border border-white/20" />
                  <div className="min-w-0">
                    <span className="text-[12px] font-semibold text-sky-200 block">
                      Acceso Público · Tierra del Fuego
                    </span>
                    <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug">
                      WikiApp TDF — Información al día
                    </h2>
                    <p className="text-[12px] text-slate-200 mt-0.5 leading-normal">
                      Estado de Ruta 3, alertas de Defensa Civil, farmacia de turno y noticias locales en tu pantalla de inicio.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-[12px]">
                  <div className="flex items-center gap-1.5 text-slate-100 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-sky-300 stroke-[1.5] shrink-0" />
                    <span className="truncate">Alertas al día</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-100 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-300 stroke-[1.5] shrink-0" />
                    <span className="truncate">Acceso directo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-100 font-semibold">
                    <Wifi className="w-3.5 h-3.5 text-sky-300 stroke-[1.5] shrink-0" />
                    <span className="truncate">Liviana y gratis</span>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                {installSuccess ? (
                  <div className="py-5 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <h3 className="text-[16px] font-bold">Aplicación instalada en tu dispositivo</h3>
                    <p className="text-[14px] text-slate-600 dark:text-slate-400">
                      Ya puedes abrir <strong>WikiApp TDF</strong> desde el ícono en tu pantalla de inicio.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                          Sistema operativo del teléfono
                        </span>
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0f4c81] dark:text-sky-300">
                          {detectedPlatform === 'ios'
                            ? 'iPhone / iPad detectado'
                            : detectedPlatform === 'android'
                            ? 'Android detectado'
                            : 'Compatible con Android e iOS'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setSelectedPlatform('android')}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                            selectedPlatform === 'android'
                              ? 'bg-white dark:bg-[#0f4c81] text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 stroke-[1.5]" />
                          <span>Android (Todas)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlatform('ios');
                            setShowManualSteps(true);
                          }}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                            selectedPlatform === 'ios'
                              ? 'bg-white dark:bg-[#0f4c81] text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <MonitorSmartphone className="w-4 h-4 stroke-[1.5]" />
                          <span>iPhone / iPad (iOS)</span>
                        </button>
                      </div>
                    </div>

                    {selectedPlatform === 'android' && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleDownloadClick}
                          className="w-full btn-brand-tdf py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold shadow-sm cursor-pointer"
                        >
                          <Download className="w-4 h-4 stroke-[1.5]" />
                          <span>
                            {deferredPrompt ? 'Descargar e instalar ahora' : 'Descargar en mi teléfono'}
                          </span>
                        </button>

                        {(showManualSteps || !deferredPrompt) && (
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5 text-[14px]">
                            <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                              Pasos universales para cualquier versión de Android:
                            </div>
                            <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-300">
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">1</span>
                                <p>
                                  Toca el botón de menú <MoreVertical className="w-3.5 h-3.5 inline stroke-[1.5]" /> en la esquina del navegador.
                                </p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">2</span>
                                <p>
                                  Selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Agregar a la pantalla principal&rdquo;</strong>.
                                </p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">3</span>
                                <p>
                                  Confirma tocando <strong>&ldquo;Instalar&rdquo;</strong> para acceder en un toque.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPlatform === 'ios' && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5">
                        <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                          Pasos para instalar en iPhone o iPad (cualquier versión de iOS):
                        </div>
                        <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">1</span>
                            <p>
                              Toca el botón <Share className="w-3.5 h-3.5 inline stroke-[1.5] text-[#0f4c81] dark:text-sky-400" /> <strong>Compartir</strong> en la barra de Safari o Chrome.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">2</span>
                            <p>
                              Desliza y elige <PlusSquare className="w-3.5 h-3.5 inline stroke-[1.5] text-[#0f4c81] dark:text-sky-400" /> <strong>Agregar a inicio</strong>.
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0f4c81] text-white font-bold flex items-center justify-center shrink-0 text-[11px] tabular-nums">3</span>
                            <p>
                              Pulsa <strong>&ldquo;Agregar&rdquo;</strong> arriba a la derecha.
                            </p>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#0f4c81] dark:text-sky-300">
                          <ArrowDown className="w-3.5 h-3.5 animate-bounce stroke-[1.5]" />
                          <span>Usa el botón Compartir de tu navegador</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white py-1.5 px-2 rounded-lg cursor-pointer"
                      >
                        Continuar en el navegador
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0f4c81] dark:text-sky-400 hover:underline py-1.5 px-2 cursor-pointer"
                      >
                        <span>Listo</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
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
