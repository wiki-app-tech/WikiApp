'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Play, Pause, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon, Globe, Flag, AlertTriangle, Info, Newspaper, Eye, Check, Type, Download, Cpu, Trophy, Users, Briefcase, Landmark, Trees, RefreshCw } from 'lucide-react';
import { shareToTelegram, InstantViewExplainerBadge, isValidUrl } from '@/utils/telegramInstantView';
import TdfStickyStatusBar from './TdfStickyStatusBar';
import TdfThreeTierFeed from './TdfThreeTierFeed';
import { getActiveTdfAlerts, type TdfCity } from '@/utils/tdfIntelligence';
import { useTheme } from 'next-themes';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const TabLoadingSkeleton = ({ title = "Cargando..." }: { title?: string }) => (
  <div className="w-full min-h-[420px] flex flex-col items-center justify-center bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-12 text-slate-500 dark:text-gray-400">
    <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
    <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-gray-300 animate-pulse">{title}</span>
  </div>
);

const WeatherDashboard = dynamic(() => import('./WeatherDashboard'), {
  loading: () => <TabLoadingSkeleton title="Sincronizando Pronóstico y Clima..." />
});
const RadioDashboard = dynamic(() => import('./RadioDashboard'), {
  loading: () => <TabLoadingSkeleton title="Cargando Emisoras de Radio en Vivo..." />
});
const BoletinesDashboard = dynamic(() => import('./BoletinesDashboard'), {
  loading: () => <TabLoadingSkeleton title="Indexando Boletines Oficiales y Digesto..." />
});
const GuiaDashboard = dynamic(() => import('./GuiaDashboard'), {
  loading: () => <TabLoadingSkeleton title="Cargando Guía de Servicios y Senderos..." />
});
const TapasModal = dynamic(() => import('./TapasModal'), {
  ssr: false
});
const TelegramFeed = dynamic(() => import('./TelegramFeed'), {
  loading: () => <TabLoadingSkeleton title="Cargando Canales de Noticias..." />
});
const InstagramFeed = dynamic(() => import('./InstagramFeed'), {
  loading: () => <TabLoadingSkeleton title="Sincronizando Redes Sociales & Instagram..." />
});
const HomeInstagramSection = dynamic(() => import('./HomeInstagramSection'), {
  loading: () => <TabLoadingSkeleton title="Cargando Redes Sociales Fueguinas..." />
});
const LogisticsDashboard = dynamic(() => import('./LogisticsDashboard'), {
  loading: () => <TabLoadingSkeleton title="Cargando Control de Arribos Regional..." />
});

const WeatherAlertMap = dynamic(() => import('./WeatherAlertMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-xl border border-slate-300 dark:border-[#222]">
        <ShieldAlert className="w-8 h-8 mb-4 animate-pulse text-yellow-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Alertas...</span>
      </div>
    )
  });

const SecurityHeatMap = dynamic(() => import('./SecurityHeatMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-xl border border-slate-300 dark:border-[#222]">
        <ShieldAlert className="w-8 h-8 mb-4 animate-pulse text-red-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Cargando Inteligencia Crítica...</span>
      </div>
    )
  });

const MaritimeMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.MaritimeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500">
        <Anchor className="w-7 h-7 mb-3 animate-pulse text-blue-500" />
        <span className="text-xs font-bold uppercase tracking-widest">Cargando Mapa Marítimo...</span>
      </div>
    ),
  }
);

const AirMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.AirMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500">
        <Plane className="w-7 h-7 mb-3 animate-pulse text-orange-500" />
        <span className="text-xs font-bold uppercase tracking-widest">Cargando Mapa Aéreo...</span>
      </div>
    ),
  }
);

const WikiAppLogo = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="WikiApp TDF">
    <rect width="32" height="32" rx="7" fill="#0f4c81" />
    {/* Ondas de señal / alerta monolineales (1.5px) */}
    <path d="M9.5 7.5C7.8 9.2 7.8 12 9.5 13.7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.8 5.2C3.8 8.2 3.8 13 6.8 16" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    <path d="M22.5 7.5C24.2 9.2 24.2 12 22.5 13.7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M25.2 5.2C28.2 8.2 28.2 13 25.2 16" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    {/* Faro / Brújula del Fin del Mundo en trazo monolineal 1.5px */}
    <circle cx="16" cy="10.5" r="2.2" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M13.5 13L11.5 25.5H20.5L18.5 13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 18.5H19.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 25.5H23" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type ViewMode = 'list' | 'grid' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const { isRefreshing: isOriginSyncing, triggerRefresh: triggerOriginSync } = useAutoRefresh(async () => {
    try {
      // 1. Sincronización rápida prioritaria de fuentes provinciales, web, enlaces y redes desde origen
      const [provRes, igRes] = await Promise.allSettled([
        fetch('/api/articles?scope=provincial', { cache: 'no-store' }),
        fetch('/api/instagram?force=1', { cache: 'no-store' }),
      ]);

      if (provRes.status === 'fulfilled' && provRes.value.ok) {
        const provData = await provRes.value.json();
        if (provData?.articles && Array.isArray(provData.articles) && provData.articles.length > 0) {
          setArticles(provData.articles);
        }
      } else if (igRes.status === 'fulfilled' && igRes.value.ok) {
        const igData = await igRes.value.json();
        if (igData?.articles && Array.isArray(igData.articles) && igData.articles.length > 0) {
          setArticles(prev => {
            const seen = new Set(igData.articles.map((a: Article) => a.id));
            return [...igData.articles, ...prev.filter(p => !seen.has(p.id))];
          });
        }
      }

      // 2. Sincronización completa de todas las fuentes (RSS, Web, Enlaces, Redes nacionales/internacionales) en segundo plano
      fetch('/api/articles?scope=all', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(allData => {
          if (allData?.articles && Array.isArray(allData.articles) && allData.articles.length > 0) {
            setArticles(allData.articles);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Auto-refresh origin sync failed:', err);
    }
  }, { interval: 2 * 60 * 1000, enabled: true, immediate: true });

  const feedsMap = useMemo(() => new globalThis.Map<string, FeedSource>(feeds.map(f => [f.id, f])), [feeds]);

  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showTapasModal, setShowTapasModal] = useState(false);
  const [isEyeMenuOpen, setIsEyeMenuOpen] = useState(false);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = useState(false);
  const [reportSubTab, setReportSubTab] = useState<'summary' | 'global' | 'national' | 'provincial' | 'alerts_recs' | 'methodology'>('summary');
   const [blocklist, setBlocklist] = useState<string[]>(['pautas', 'anuncio', 'publicidad', 'clickbait']);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
   const [carouselSlide, setCarouselSlide] = useState<'ships' | 'flights'>('ships');
   const [isAutoCycle, setIsAutoCycle] = useState(true);
   const [secondsToUpdate, setSecondsToUpdate] = useState(15);
   const [shipsData, setShipsData] = useState([
     { 
       id: 1, 
       name: 'EZEQUIEL MB', 
       type: 'Catamarán de Pasajeros', 
       status: 'En Puerto', 
       time: 'Hoy, 17:51', 
       flag: 'AR', 
       speed: '0.0 kn', 
       destination: 'Ushuaia',
       image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=60',
       agencyName: 'Rumbo Sur S.A.',
       agencyUrl: 'https://rumbosur.com.ar',
       paxCapacity: 90,
       paxLabel: 'Pasajeros (Catamarán Beagle)'
     },
     { 
       id: 2, 
       name: 'ASTURIANO III', 
       type: 'Portacontenedores', 
       status: 'En Ruta', 
       time: 'Mañana, 06:00', 
       flag: 'AR', 
       speed: '12.4 kn', 
       destination: 'Ushuaia',
       image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=200&auto=format&fit=crop&q=60',
       agencyName: 'Agencia Marítima Robinson',
       agencyUrl: 'https://www.robinson.com.ar',
       paxCapacity: 20,
       paxLabel: 'Tripulantes (Carga)'
     },
     { 
       id: 3, 
       name: 'STELLA AUSTRALIS', 
       type: 'Crucero Expedition', 
       status: 'Arribando', 
       time: 'Hoy, 20:30', 
       flag: 'CL', 
       speed: '9.8 kn', 
       destination: 'Ushuaia',
       image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=200&auto=format&fit=crop&q=60',
       agencyName: 'Australis Cruceros',
       agencyUrl: 'https://www.australis.com',
       paxCapacity: 210,
       paxLabel: 'Pasajeros (Crucero Expedition)'
     },
     { 
       id: 4, 
       name: 'ALBATROS', 
       type: 'Pesquero Congelador', 
       status: 'En Puerto', 
       time: 'Ayer, 22:40', 
       flag: 'AR', 
       speed: '0.0 kn', 
       destination: 'Ushuaia',
       image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=200&auto=format&fit=crop&q=60',
       agencyName: 'Pesquera del Fuego S.A.',
       agencyUrl: 'https://www.interpatagonia.com/ushuaia/agencias-maritimas.html',
       paxCapacity: 18,
       paxLabel: 'Tripulantes (Pesquero)'
     },
     { 
       id: 5, 
       name: 'MAPOCHO', 
       type: 'Remolcador de Altura', 
       status: 'En Puerto', 
       time: 'Hoy, 09:15', 
       flag: 'CL', 
       speed: '0.0 kn', 
       destination: 'Río Grande',
       image: 'https://images.unsplash.com/photo-1505242859157-562219b06ad7?w=200&auto=format&fit=crop&q=60',
       agencyName: 'Agencia Marítima Ushuaia',
       agencyUrl: 'https://www.agenciamaritimaushuaia.com',
       paxCapacity: 10,
       paxLabel: 'Tripulantes (Remolcador)'
     }
   ]);
   const [flightsData, setFlightsData] = useState([
     { 
       id: 1, 
       flight: 'AR 1886', 
       airline: 'Aerolíneas Argentinas', 
       route: 'AEP ➔ USH', 
       status: 'En Pista', 
       time: 'Llegó 14:23', 
       type: 'Boeing 737-800',
       image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&auto=format&fit=crop&q=60',
       airlineUrl: 'https://www.aerolineas.com.ar',
       paxCapacity: 189
     },
     { 
       id: 2, 
       flight: 'AR 1898', 
       airline: 'Aerolíneas Argentinas', 
       route: 'FTE ➔ USH', 
       status: 'En Vuelo', 
       time: 'Previsto 15:40', 
       type: 'Embraer 190',
       image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=60',
       airlineUrl: 'https://www.aerolineas.com.ar',
       paxCapacity: 98
     },
     { 
       id: 3, 
       flight: 'AR 1866', 
       airline: 'Aerolíneas Argentinas', 
       route: 'AEP ➔ RGA', 
       status: 'Programado', 
       time: 'Mañana 02:20', 
       type: 'Boeing 737-800',
       image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&auto=format&fit=crop&q=60',
       airlineUrl: 'https://www.aerolineas.com.ar',
       paxCapacity: 189
     },
     { 
       id: 4, 
       flight: 'WJ 3462', 
       airline: 'JetSmart', 
       route: 'AEP ➔ USH', 
       status: 'En Vuelo', 
       time: 'Previsto 16:15', 
       type: 'Airbus A320',
       image: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=200&auto=format&fit=crop&q=60',
       airlineUrl: 'https://jetsmart.com',
       paxCapacity: 180
     },
     { 
       id: 5, 
       flight: 'FB 5120', 
       airline: 'Flybondi', 
       route: 'EPA ➔ USH', 
       status: 'Programado', 
       time: 'Hoy 18:10', 
       type: 'Boeing 737-800',
       image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&auto=format&fit=crop&q=60',
       airlineUrl: 'https://flybondi.com',
       paxCapacity: 189
     }
   ]);

   // Live Update Logistics Data
   useEffect(() => {
     if (activeTab !== 'logistics') return;
     const timer = setInterval(() => {
       setSecondsToUpdate((prev) => {
         if (prev <= 1) {
           setShipsData((prevShips) =>
             prevShips.map(ship => {
               if (ship.status === 'En Ruta' || ship.status === 'Arribando') {
                 const speedChange = (Math.random() * 1.2 - 0.6);
                 const currentSpeed = parseFloat(ship.speed);
                 const newSpeed = Math.max(0, currentSpeed + speedChange).toFixed(1) + ' kn';
                 return { ...ship, speed: newSpeed };
               }
               return ship;
             })
           );
           setFlightsData((prevFlights) => {
             const next = [...prevFlights];
             const flightIndex = Math.floor(Math.random() * next.length);
             const f = next[flightIndex];
             if (f.status === 'En Vuelo') {
               if (Math.random() > 0.5) {
                 next[flightIndex] = {
                   ...f,
                   status: 'En Pista',
                   time: `Llegó ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                 };
               }
             } else if (f.status === 'En Pista') {
               if (Math.random() > 0.6) {
                 const nextHour = new Date(Date.now() + 7200000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                 next[flightIndex] = {
                   ...f,
                   status: 'Programado',
                   time: `Hoy ${nextHour}`
                 };
               }
             } else if (f.status === 'Programado') {
               if (Math.random() > 0.4) {
                 next[flightIndex] = {
                   ...f,
                   status: 'En Vuelo',
                   time: 'En Vuelo (A tiempo)'
                 };
               }
             }
             return next;
           });
           return 15;
         }
         return prev - 1;
       });
     }, 1000);
     return () => clearInterval(timer);
   }, [activeTab]);

   // Auto Cycle Logistics Carousel Slides
   useEffect(() => {
     if (!isAutoCycle || activeTab !== 'logistics') return;
     const interval = setInterval(() => {
       setCarouselSlide(prev => prev === 'ships' ? 'flights' : 'ships');
     }, 8000);
     return () => clearInterval(interval);
   }, [isAutoCycle, activeTab]);

   const [showShipOverlay, setShowShipOverlay] = useState(true);
   const [showFlightOverlay, setShowFlightOverlay] = useState(true);
  
   const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [syncTime, setSyncTime] = useState('');
  const [activeShiftDay, setActiveShiftDay] = useState<number>(() => {
    const now = new Date();
    return now.getHours() < 9 ? new Date(now.getTime() - 24 * 60 * 60 * 1000).getDate() : now.getDate();
  });

  const [pharmacies, setPharmacies] = useState<{ rio_grande: any[], tolhuin: any[], ushuaia: any[] } | null>(null);
  const [selectedPharmacyCity, setSelectedPharmacyCity] = useState<'ushuaia' | 'rio_grande' | 'tolhuin'>('ushuaia');
  const [selectedTdfCity, setSelectedTdfCity] = useState<TdfCity>('all');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [activePharmacyIndex, setActivePharmacyIndex] = useState(0);

  // Persistencia de ciudad y categoría en localStorage
  const handleSelectCity = (city: TdfCity) => {
    setSelectedTdfCity(city);
    if (city !== 'all') {
      setSelectedPharmacyCity(city);
    }
    try {
      localStorage.setItem('wikiapp_tdf_city', city);
    } catch {
      // ignore storage error
    }
  };

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    try {
      localStorage.setItem('wikiapp_tdf_category', cat);
    } catch {
      // ignore storage error
    }
  };

  // Detección de ciudad fueguina por geolocalización
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude } = pos.coords;
        let detected: 'ushuaia' | 'rio_grande' | 'tolhuin' = 'ushuaia';
        if (latitude > -54.15) {
          detected = 'rio_grande';
        } else if (latitude >= -54.65 && latitude <= -54.15) {
          detected = 'tolhuin';
        } else {
          detected = 'ushuaia';
        }
        handleSelectCity(detected);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const fetchPharmacies = () => {
    fetch('/api/pharmacies')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPharmacies({
            rio_grande: data.rio_grande || [],
            tolhuin: data.tolhuin || [],
            ushuaia: data.ushuaia || []
          });
        }
      })
      .catch(err => console.error("Error fetching pharmacies:", err));
  };

  React.useEffect(() => {
    setMounted(true);
    setTheme('light');
    setSyncTime(new Date().toLocaleTimeString());

    // Restaurar última selección persistida por el usuario (Ciudad y Categoría)
    try {
      const savedCity = localStorage.getItem('wikiapp_tdf_city') as TdfCity | null;
      if (savedCity && ['all', 'ushuaia', 'rio_grande', 'tolhuin'].includes(savedCity)) {
        setSelectedTdfCity(savedCity);
        if (savedCity !== 'all') {
          setSelectedPharmacyCity(savedCity);
        }
      }
      const savedCat = localStorage.getItem('wikiapp_tdf_category');
      if (savedCat) {
        setActiveCategory(savedCat);
      }
    } catch {
      // ignore storage error
    }
    
    // Fetch inicial de farmacias
    fetchPharmacies();

    const interval = setInterval(() => {
      const now = new Date();
      setSyncTime(now.toLocaleTimeString());
      
      // El turno de las farmacias comienza a las 09:00 AM.
      // Si la hora es menor a 9, el turno activo corresponde al día anterior.
      const currentShiftDay = now.getHours() < 9 
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000).getDate() 
        : now.getDate();
        
      setActiveShiftDay(prev => {
        if (prev !== currentShiftDay) {
          fetchPharmacies();
          return currentShiftDay;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [setTheme]);

  // Rotación del carrusel cada 5 segundos
  useEffect(() => {
    if (!pharmacies) return;
    const interval = setInterval(() => {
      setActivePharmacyIndex(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [pharmacies, selectedPharmacyCity]);

  const getActiveShiftDate = () => {
    const now = new Date();
    if (now.getHours() < 9) {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    return now;
  };

  const getVisiblePharmacies = (cityKey: 'ushuaia' | 'rio_grande' | 'tolhuin') => {
    if (!pharmacies || !pharmacies[cityKey] || pharmacies[cityKey].length === 0) return [];
    const list = pharmacies[cityKey];
    const todayIndex = list.findIndex(p => parseInt(p.fecha) === activeShiftDay);
    const startIndex = todayIndex === -1 ? 0 : todayIndex;
    
    const visible = [];
    for (let i = 0; i < 4; i++) {
      const idx = (startIndex + i) % list.length;
      visible.push(list[idx]);
    }
    return visible;
  };

  // Set de íconos lineales consistentes (outline, 1.5px de trazo, sin emojis sueltos)
  const categoryTranslations: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    general: { label: 'Generales', Icon: Newspaper },
    noticias: { label: 'Locales TDF', Icon: MapPin },
    tecnologia: { label: 'Tecnología', Icon: Cpu },
    economia: { label: 'Economía', Icon: TrendingUp },
    deportes: { label: 'Deportes', Icon: Trophy },
    religion: { label: 'Sociedad', Icon: Users },
    gremial: { label: 'Gremiales', Icon: Briefcase },
    institucional: { label: 'Institucional', Icon: Landmark },
    turismo: { label: 'Turismo', Icon: Trees },
    policial: { label: 'Policiales', Icon: ShieldAlert },
    otras: { label: 'Otras', Icon: Compass }
  };

  // Alertas activas clasificadas por nivel, segmentadas por ciudad y con caducidad TTL
  const activeTdfAlerts = useMemo(
    () => getActiveTdfAlerts(articles, feedsMap, selectedTdfCity, syncTime),
    [articles, feedsMap, selectedTdfCity, syncTime]
  );

  const availableCategories = useMemo(() => {
      const matchingFeeds = activeScope === 'all' 
          ? feeds 
          : feeds.filter(f => f.scope === activeScope);
      return Array.from(new Set(matchingFeeds.map(f => f.category))).filter(Boolean);
  }, [feeds, activeScope]);

  // Enhanced Filter Logic
  const filteredArticles = useMemo(() => {
    let result = articles;
    
    // Scope filter
    if (activeScope !== 'all') {
        result = result.filter(a => {
            const feed = feedsMap.get(a.sourceId);
            return feed && feed.scope === activeScope;
        });
    }

    // Category filter
    if (activeCategory !== 'all') {
        result = result.filter(a => {
            const feed = feedsMap.get(a.sourceId);
            return feed && feed.category === activeCategory;
        });
    }

    // 1. DUPLICATE DETECTION: Keep only the first unique title (normalized)
    const seen = new Set<string>();
    result = result.filter(a => {
        const signature = a.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
    });

    // 2. CONTENT FILTER: Remove articles with blocklisted words
    if (blocklist.length > 0) {
        result = result.filter(a => {
            const content = (a.title + ' ' + (a.description || '')).toLowerCase();
            return !blocklist.some(word => word.length > 2 && content.includes(word.toLowerCase()));
        });
    }

    // 3. Keyword/Search filter
    if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(a => {
          const sourceName = feedsMap.get(a.sourceId)?.name || '';
          return (
            a.title.toLowerCase().includes(lowerSearch) ||
            (a.description && a.description.toLowerCase().includes(lowerSearch)) ||
            sourceName.toLowerCase().includes(lowerSearch)
          );
        });
    }

    // 4. Orden estricto: de lo más reciente a lo más antiguo
    return [...result].sort((a, b) => {
      const timeA = new Date(a.pubDate).getTime() || 0;
      const timeB = new Date(b.pubDate).getTime() || 0;
      return timeB - timeA;
    });
  }, [articles, search, feedsMap, activeScope, activeCategory, blocklist]);

  // Registro persistente de artículos leídos al ingresar a ver la nota completa
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wikiapp_tdf_read_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReadArticleIds(new Set(parsed));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const markArticleRead = React.useCallback((idOrLink: string) => {
    if (!idOrLink) return;
    setReadArticleIds(prev => {
      if (prev.has(idOrLink)) return prev;
      const next = new Set(prev);
      next.add(idOrLink);
      try {
        localStorage.setItem('wikiapp_tdf_read_ids', JSON.stringify(Array.from(next).slice(-500)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      markArticleRead(selectedArticle.id);
      if (selectedArticle.link) {
        markArticleRead(selectedArticle.link);
      }
    }
  }, [selectedArticle, markArticleRead]);

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Reciente';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours/24)}d`;
  };

  const isYouTube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  // Separating articles for the Top Visual Widget: 1 International, 1 National, 1 Provincial
  const topVisualArticles = useMemo(() => {
    if (search || activeTab !== 'home' || activeScope !== 'all' || activeCategory !== 'all') return [];
    
    const findByScope = (scope: string) => 
        articles.find(a => feedsMap.get(a.sourceId)?.scope === scope);

    const inter = findByScope('internacional');
    const nac = findByScope('nacional');
    const prov = findByScope('provincial');
    
    return [inter, nac, prov].filter(Boolean) as Article[];
  }, [articles, search, activeTab, activeScope, activeCategory, feedsMap]);
  
  // Logic for the main feed display: on home we show less, on explore we show more
  // Also exclude top visual articles from the main list
  const currentArticleIndex = useMemo(() => {
    if (!selectedArticle) return -1;
    return filteredArticles.findIndex(a => a.id === selectedArticle.id);
  }, [selectedArticle, filteredArticles]);

  const handlePrevArticle = () => {
    if (currentArticleIndex > 0) {
      setSelectedArticle(filteredArticles[currentArticleIndex - 1]);
      setReadingProgress(0);
    }
  };

  const handleNextArticle = () => {
    if (currentArticleIndex >= 0 && currentArticleIndex < filteredArticles.length - 1) {
      setSelectedArticle(filteredArticles[currentArticleIndex + 1]);
      setReadingProgress(0);
    }
  };

  // Enriquecimiento automático desde el sitio web de origen al abrir un enlace o artículo en el lector
  useEffect(() => {
    if (!selectedArticle || !selectedArticle.link || !selectedArticle.link.startsWith('http')) return;
    if (selectedArticle.sourceType === 'instagram' || selectedArticle.sourceType === 'telegram') return;

    const plainDesc = (selectedArticle.description || '').replace(/<[^>]*>/g, '').trim();
    const needsOriginEnrichment = plainDesc.length < 220 || !selectedArticle.thumbnail;
    if (!needsOriginEnrichment) return;

    let cancelled = false;
    fetch(`/api/articles?originUrl=${encodeURIComponent(selectedArticle.link)}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.enriched) return;
        const { contentHtml, description, thumbnail, originSyncedAt } = data.enriched;
        setSelectedArticle(prev => {
          if (!prev || prev.link !== selectedArticle.link) return prev;
          return {
            ...prev,
            description: contentHtml && contentHtml.length > (prev.description || '').length ? contentHtml : (prev.description || description || ''),
            thumbnail: prev.thumbnail || thumbnail,
            originSyncedAt: originSyncedAt || prev.originSyncedAt,
          };
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedArticle?.id, selectedArticle?.link]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          setShowSearchModal(false);
        }
      }
      // Navegación con flechas cuando el lector de noticias está abierto
      if (selectedArticle && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'ArrowLeft' && currentArticleIndex > 0) {
          e.preventDefault();
          setSelectedArticle(filteredArticles[currentArticleIndex - 1]);
          setReadingProgress(0);
        } else if (e.key === 'ArrowRight' && currentArticleIndex >= 0 && currentArticleIndex < filteredArticles.length - 1) {
          e.preventDefault();
          setSelectedArticle(filteredArticles[currentArticleIndex + 1]);
          setReadingProgress(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, currentArticleIndex, filteredArticles]);

  const feedArticlesToDisplay = useMemo(() => {
    const topIds = new Set(topVisualArticles.map(a => a.id));
    const base = filteredArticles.filter(a => !topIds.has(a.id));
    if (activeTab === 'home' && !search) return base.slice(0, 10);
    return base.slice(0, 50);
  }, [filteredArticles, topVisualArticles, activeTab, search]);

  return (
    <div className="flex h-screen max-w-[100vw] bg-surface-primary text-text-primary font-sans overflow-hidden transition-colors duration-200 relative selection:bg-accent-primary/30">
      {/* Animated Mesh Gradient Background - Subtle Luxury Gold & Plum Glows */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#D4AF37]/[0.09] dark:bg-[#D4AF37]/[0.12] rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-[#4A2E35]/[0.08] dark:bg-[#4A2E35]/[0.14] rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-[#1B263B]/[0.06] dark:bg-[#1B263B]/[0.12] rounded-full blur-[120px] animate-pulse [animation-delay:4s]"></div>
      </div>


      
      {/* 1. ULTRA SLIM DYNAMIC SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarExpanded ? 240 : 72 }}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className="bg-surface-elevated/80 backdrop-blur-2xl border-r border-border-subtle hidden lg:flex flex-col items-center shrink-0 z-50 py-4 gap-6 overflow-hidden shadow-premium transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-4 w-full px-4 mb-4">
          <div className="cursor-pointer group hover:scale-105 transition-transform shrink-0">
            <WikiAppLogo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(30,115,190,0.25)]" />
          </div>
          <AnimatePresence>
            {isSidebarExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[16px] font-bold tracking-tight text-text-primary whitespace-nowrap"
              >
                WikiApp <span className="text-[#0f4c81] dark:text-sky-400">TDF</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 w-full space-y-1 overflow-y-auto scrollbar-hide py-2 px-2">
          {[
            { id: 'home', icon: LayoutDashboard, label: 'Información al día', sub: 'Inicio TDF' },
            { id: 'explore', icon: Compass, label: 'Directorio de Medios', sub: 'Fuentes' },
            { id: 'instagram', icon: InstagramIcon, label: 'Redes Sociales', sub: 'Cuentas TDF' },
            { id: 'boletines', icon: Newspaper, label: 'Digesto y Boletines', sub: 'Oficial' },
            { id: 'weather', icon: Cloud, label: 'Clima y Alertas', sub: 'Meteorología' },
            { id: 'guia', icon: Map, label: 'Guía Fueguina', sub: 'Senderos y Servicios' },
            { id: 'reports', icon: FileText, label: 'Informes Provinciales', sub: 'Reportes' },
            { id: 'security', icon: ShieldCheck, label: 'Mapa de Seguridad', sub: 'Prevención' },
            { id: 'radio', icon: Radio, label: 'Radios en Vivo', sub: 'Emisoras' },
            { id: 'logistics', icon: Anchor, label: 'Arribos y Vuelos', sub: 'Tráfico' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`relative w-full flex items-center gap-4 px-3 py-2.5 rounded-xl group transition-all duration-200 cursor-pointer ${activeTab === item.id ? 'bg-[#0f4c81]/10 text-[#0f4c81] dark:text-sky-400' : 'text-text-secondary hover:bg-surface-sunken'}`}
            >
              <item.icon className="w-5 h-5 stroke-[1.5] shrink-0" />
              
              <AnimatePresence>
                {isSidebarExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col items-start overflow-hidden"
                  >
                    <span className="text-[14px] font-semibold whitespace-nowrap">{item.label}</span>
                    <span className="text-[12px] font-normal text-text-tertiary">{item.sub}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1 h-6 rounded-r-full bg-[#0f4c81] dark:bg-sky-400" 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="w-full px-2 space-y-1 pb-4 border-t border-border-subtle pt-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
              className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[#0f4c81] dark:text-sky-400 bg-[#0f4c81]/10 hover:bg-[#0f4c81]/20 transition-all group cursor-pointer"
              title="Descargar App Web en tu dispositivo"
            >
              <Download className="w-5 h-5 stroke-[1.5] shrink-0" />
              {isSidebarExpanded && <span className="text-[14px] font-semibold">Descargar App</span>}
            </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* CABECERA PRINCIPAL: WikiApp TDF — Información al día */}
        <div className="px-3 py-2.5 md:px-6 shrink-0 z-40 sticky top-0 bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle safe-top">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                   <div className="lg:hidden mr-1 shrink-0">
                      <WikiAppLogo className="w-9 h-9" />
                   </div>
                   <div className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-2.5">
                      <h1 className="text-[20px] md:text-[24px] font-bold text-text-primary tracking-tight">
                         WikiApp <span className="text-[#0f4c81] dark:text-sky-400">TDF</span>
                      </h1>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] md:text-[14px] font-semibold text-text-secondary">
                            — Información al día
                        </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                    {/* Modo Vistas */}
                    {(activeTab === 'home' || activeTab === 'explore') && (
                      <>

                        {/* BOTÓN ACCESO DIRECTO A REDES SOCIALES */}
                        <button
                          onClick={() => setActiveTab('instagram')}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-600/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:from-rose-500 hover:to-purple-600 hover:text-white dark:hover:text-white hover:border-transparent shadow-sm shrink-0 group"
                          title="Explorar Redes Sociales de Tierra del Fuego"
                        >
                          <InstagramIcon className="w-4 h-4 text-rose-500 group-hover:text-white transition-colors" />
                          <span className="hidden sm:inline">Redes</span>
                        </button>

                        {/* 1. BOTÓN VER TAPAS DE DIARIOS (Estilo Digesto & Boletines) */}
                        <button
                          onClick={() => setShowTapasModal(true)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:border-blue-600 shadow-sm shrink-0 group"
                          title="Ver Tapas de Diarios"
                        >
                          <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                          <span>Tapas</span>
                        </button>
                        
                        {/* 2. BOTÓN BUSCAR EN EL FLUJO DE NOTICIAS */}
                        <div className="relative flex items-center shrink-0">
                          {isSearchOpen ? (
                            <div className="relative flex items-center">
                              <Search className="absolute left-3.5 w-4 h-4 text-blue-500 pointer-events-none" />
                              <input 
                                type="text"
                                autoFocus
                                placeholder="Buscar noticias..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48 sm:w-64 bg-white dark:bg-black/60 border-2 border-blue-500 rounded-2xl py-2 pl-10 pr-8 text-xs font-bold text-slate-800 dark:text-gray-200 focus:outline-none shadow-lg shadow-blue-500/10 transition-all"
                              />
                              <button 
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setSearch('');
                                }}
                                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 text-xs font-bold cursor-pointer"
                                title="Cerrar búsqueda"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsSearchOpen(true)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm shrink-0 group ${
                                search 
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:border-blue-600'
                              }`}
                              title="Buscar en el flujo de noticias"
                            >
                              <Search className={`w-4 h-4 ${search ? 'text-white' : 'text-blue-600 dark:text-blue-400 group-hover:text-white'} transition-colors`} />
                              <span>Buscar</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* BOTÓN DESCARGAR APP WEB (Android & iOS) */}
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border bg-[#d4af37]/15 text-[#1b263b] dark:text-[#e5cf87] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#1b263b] dark:hover:bg-[#d4af37] dark:hover:text-[#1b263b] shadow-sm shrink-0 group"
                      title="Descargar aplicación web para Android o iOS"
                    >
                      <Download className="w-4 h-4 text-[#d4af37] group-hover:text-[#1b263b] transition-colors" />
                      <span className="hidden xs:inline">App</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => {
                          triggerOriginSync();
                          fetchPharmacies();
                        }}
                        className="hidden sm:flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-sm transition-colors cursor-pointer group"
                        title="Actualización automática activa desde todos los sitios de origen (Web, RSS, Enlaces y Redes). Clic para sincronizar ahora."
                    >
                        <RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 ${isOriginSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                                {isOriginSyncing ? 'Sincronizando origen...' : 'Auto-Sync Origen Activo'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 leading-tight tabular-nums">
                                Sincronizado: {syncTime || '...'}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        {/* 1. FRANJA DE ESTADO FIJA (STICKY) EN LA PARTE SUPERIOR:
            Estado de Ruta 3 + Farmacia de turno por ciudad (solo nombre) + Clima Hoy (Máx/Mín) + Dólar Oficial y Blue */}
        <TdfStickyStatusBar
          selectedCity={selectedTdfCity}
          onSelectCity={handleSelectCity}
          activeAlerts={activeTdfAlerts}
          activePharmacy={getVisiblePharmacies(selectedPharmacyCity)[0] || null}
          pharmaciesByCity={{
            ushuaia: getVisiblePharmacies('ushuaia')[0] || null,
            rio_grande: getVisiblePharmacies('rio_grande')[0] || null,
            tolhuin: getVisiblePharmacies('tolhuin')[0] || null,
          }}
          pharmacyCityName={
            selectedPharmacyCity === 'rio_grande'
              ? 'Río Grande'
              : selectedPharmacyCity === 'tolhuin'
              ? 'Tolhuin'
              : 'Ushuaia'
          }
          syncTime={syncTime}
          onDetectLocation={handleDetectLocation}
          isLocating={isLocating}
        />

        {/* 5. FILTRO PERSISTENTE POR CATEGORÍA Y CIUDAD (CHIPS COMPACTOS SIN SCROLL VERTICAL, CON ÍCONOS LINEALES 1.5PX) */}
        {(activeTab === 'home' || activeTab === 'explore') && (
          <div className="bg-surface-elevated border-b border-border-subtle px-3 py-2 md:px-6 shrink-0 z-20">
            <div className="max-w-[1440px] mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#0f4c81] text-white'
                    : 'bg-surface-sunken text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Todas las temáticas</span>
              </button>

              {availableCategories.map((cat) => {
                const trans = categoryTranslations[cat] || { label: cat, Icon: Compass };
                const CatIcon = trans.Icon;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#0f4c81] text-white'
                        : 'bg-surface-sunken text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{trans.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTENIDO SCROLL */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 lg:p-8 relative z-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-6">
            
            {(activeTab === "home" || activeTab === "explore") && (
              <div className="flex flex-col gap-8">
                  
                  {/* Búsqueda activa info */}
                  {search && (activeTab === "home" || activeTab === "explore") && (
                    <div className="w-full bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#222] rounded-xl p-4 flex items-center justify-between">
                        <input 
                            type="text"
                            placeholder="Buscar en el universo de feeds..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full text-sm font-medium"
                            autoFocus
                        />
                        <Search className="w-4 h-4 text-slate-500 dark:text-gray-500" />
                    </div>
                  )}

                  {/* FLUJO UNIFICADO DE ARTÍCULOS (DE LO MÁS RECIENTE A LO MÁS ANTIGUO: TARJETA CON IMAGEN / LISTA SIN IMAGEN) */}
                  {(activeTab === 'home' || activeTab === 'explore') && (
                    <TdfThreeTierFeed
                      articles={filteredArticles}
                      feedsMap={feedsMap}
                      selectedCity={selectedTdfCity}
                      activeCategory={activeCategory}
                      activeAlerts={activeTdfAlerts}
                      pharmaciesByCity={{
                        ushuaia: getVisiblePharmacies('ushuaia')[0] || null,
                        rio_grande: getVisiblePharmacies('rio_grande')[0] || null,
                        tolhuin: getVisiblePharmacies('tolhuin')[0] || null,
                      }}
                      onSelectArticle={setSelectedArticle}
                      syncTime={syncTime}
                      readArticleIds={readArticleIds}
                      onMarkArticleRead={markArticleRead}
                      showDailySummary={activeTab === 'home'}
                    />
                  )}

                  {/* 4. UN SOLO MÓDULO DE REDES SOCIALES CON PESTAÑAS POR CUENTA (AUTOPLAY DESACTIVADO POR DEFECTO) */}
                  {activeTab === 'home' && (
                    <HomeInstagramSection 
                      articles={articles} 
                      onViewFullFeed={() => setActiveTab('instagram')} 
                    />
                  )}
                </div>
            )}

                  {/* 4. WEATHER DASHBOARD */}
                  {activeTab === 'weather' && <WeatherDashboard />}

                  {/* GUIA DASHBOARD */}
                  {activeTab === 'guia' && <GuiaDashboard />}

                  {/* RADIO DASHBOARD */}
                  {activeTab === 'radio' && <RadioDashboard />}

                  {/* BOLETINES OFICIALES */}
                  {activeTab === 'boletines' && <BoletinesDashboard />}

                  {/* REDES SOCIALES / INSTAGRAM */}
                  {activeTab === 'instagram' && (
                    <InstagramFeed articles={articles} feeds={feeds} />
                  )}

                  {/* 5. REPORTS DASHBOARD (NEW) */}
                  {activeTab === 'reports' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8 pb-10"
                    >
                        <header className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-orange-600/20 flex items-center justify-center">
                                 <ShieldAlert className="w-5 h-5 text-orange-500" />
                              </div>
                              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Seguridad y Realidad Social</h1>
                           </div>
                           <p className="text-slate-500 dark:text-gray-500 text-sm max-w-2xl">Panorama estratégico integral desde la geopolítica internacional hasta la estabilidad social provincial.</p>
                        </header>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* CONFIGURATION COLUMN */}
                            <div className="xl:col-span-4 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">Configuración</h3>
                                        <div className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Frecuencia de Envío</label>
                                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#161616] p-1 rounded-xl">
                                                <button className="py-2 rounded-lg bg-blue-600 text-slate-900 dark:text-white text-[11px] font-black uppercase">Diario</button>
                                                <button className="py-2 rounded-lg text-slate-500 dark:text-gray-500 text-[11px] font-black uppercase hover:bg-slate-100 dark:bg-white/5 transition-colors">Semanal</button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Destino</label>
                                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-[#161616] border border-slate-300 dark:border-[#222] rounded-xl">
                                                <Bell className="w-4 h-4 text-orange-500" />
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300">Notificación en App y Email</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Ejes de Monitoreo</label>
                                            <div className="space-y-2">
                                                {['Seguridad Internacional', 'Paz Social Nacional', 'Resguardo Provincial', 'Conflictos Sociales'].map(cat => (
                                                    <div key={cat} className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg">
                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300">{cat}</span>
                                                        <div className="w-8 h-4 bg-orange-600 rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="mt-4 w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-blue-500 hover:text-slate-900 dark:text-white transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                                            Generar Reporte Ahora
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* COLUMNA DEL INFORME DE AUDITORÍA ESTRATÉGICO INTERACTIVO */}
                            <div className="xl:col-span-8 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="flex flex-col gap-1.5 z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/10">Auditoría Especializada</span>
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">Verificado</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display mt-1">
                                            Informe de Auditoría de Seguridad Pública y Ciudadana
                                        </h2>
                                        <p className="text-slate-500 dark:text-gray-500 text-xs">
                                            Sintetizado de forma estructurada e integrada con fuentes oficiales el {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                                        </p>
                                    </div>

                                    {/* NAVEGACIÓN INTERNA DEL INFORME (UX PREMIUM) */}
                                    <div className="flex overflow-x-auto bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 gap-1 scrollbar-hide">
                                        {[
                                            { id: 'summary', label: 'Resumen Ejecutivo', icon: Info },
                                            { id: 'global', label: 'I. Geopolítica Global', icon: Globe },
                                            { id: 'national', label: 'II. Panorama Nacional', icon: Flag },
                                            { id: 'provincial', label: 'III. Tierra del Fuego', icon: Map },
                                            { id: 'alerts_recs', label: 'Alertas & Recomendaciones', icon: AlertTriangle },
                                            { id: 'methodology', label: 'Anexo Metodológico', icon: BookmarkCheck }
                                        ].map(tab => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setReportSubTab(tab.id as any)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                                        reportSubTab === tab.id
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="h-px bg-slate-200 dark:bg-white/5"></div>

                                    {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={reportSubTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-slate-700 dark:text-gray-300 flex flex-col gap-5 text-[13px] leading-relaxed"
                                        >
                                            {reportSubTab === 'summary' && (
                                                <div className="flex flex-col gap-5">
                                                    <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
                                                        <div className="absolute top-3 right-3">
                                                            <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">Prioridad Estratégica</span>
                                                        </div>
                                                        <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                            🎯 Objetivo General del Informe
                                                        </h3>
                                                        <p className="text-slate-700 dark:text-gray-300 font-medium">
                                                            Realizar un análisis exhaustivo de la información contenida en la wiki oficial (<a href="https://wiki-app-swart.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-mono hover:text-blue-400">wiki-app-swart.vercel.app</a>), contrastándola y enriqueciéndola con fuentes externas oficiales y confiables (nacionales e internacionales), para elaborar un Informe de Auditoría de Seguridad Pública y Ciudadana que contemple un Panorama Internacional, un Panorama Nacional Argentino y un Panorama Provincial de Tierra del Fuego.
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center mt-2">
                                                        <div className="flex flex-col gap-3">
                                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Síntesis Analítica</h3>
                                                            <p className="text-slate-600 dark:text-gray-400">
                                                                El presente informe audita la convergencia entre la delincuencia de tipo tradicional (homicidios, robos contra la propiedad) y las amenazas delictivas emergentes asistidas por tecnologías informáticas. 
                                                            </p>
                                                            <p className="text-slate-600 dark:text-gray-400">
                                                                Tierra del Fuego mantiene su condición de "isla segura" frente al crimen violento físico, pero confronta un brote crítico y sostenido de estafas virtuales y ciberdelito de ingeniería social que afecta de forma transversal a toda la población provincial.
                                                            </p>
                                                        </div>
                                                        
                                                        {/* GRÁFICO DE BARRAS DE TENDENCIA DE ESTAFAS EN TDF */}
                                                        <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Evolución Ciberdelitos Registrados (TDF)</span>
                                                            <div className="h-28 flex items-end gap-5 pt-4 px-2 border-b border-slate-200 dark:border-white/10">
                                                                {[
                                                                    { year: '2023', val: 310, pct: 'h-[35%]', col: 'bg-blue-500/70' },
                                                                    { year: '2024', val: 550, pct: 'h-[62%]', col: 'bg-blue-600/80' },
                                                                    { year: '2025', val: 882, pct: 'h-[100%]', col: 'bg-emerald-500' }
                                                                ].map(bar => (
                                                                    <div key={bar.year} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                                                        <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-gray-300">{bar.val}</span>
                                                                        <div className={`w-full rounded-t-lg transition-all duration-550 ${bar.pct} ${bar.col} shadow-lg`} />
                                                                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 mt-1">{bar.year}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Homicidios TDF</span>
                                                            <span className="text-2xl font-black text-emerald-500 mt-1">1.1 /100k</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">El más bajo del país</span>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Homicidios AR</span>
                                                            <span className="text-2xl font-black text-sky-500 mt-1">3.7 /100k</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Mínimo de Latinoamérica</span>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">Causas Ciber TDF</span>
                                                            <span className="text-2xl font-black text-orange-500 mt-1">882 Casos</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1 font-mono">Estadística Anual 2025</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'global' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Tendencias Globales en Seguridad Ciudadana
                                                    </h3>
                                                    <p>
                                                        De acuerdo con los reportes globales de la <strong>UNODC</strong> y las evaluaciones de amenazas de <strong>INTERPOL</strong>, la delincuencia organizada se ha transformado digitalmente de forma irreversible.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Estafas con Inteligencia Artificial</span>
                                                            <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                                                Uso generalizado de modelos generativos de IA para clonación de voz (audio deepfakes), redacción masiva automatizada de correos phishing hiper-personalizados y suplantaciones faciales en tiempo real para vulneración de accesos bancarios.
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ransomware e Infraestructura</span>
                                                            <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                                                                Mutación de ataques dirigidos a sistemas gubernamentales, bases de datos de salud y puertos comerciales. Las organizaciones cibercriminales operan bajo modelos de franquicias (Ransomware-as-a-Service) cruzando fronteras soberanas.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Contexto Regional (América Latina y el Caribe)
                                                    </h3>
                                                    <p>
                                                        América Latina concentra más del 20% de los incidentes de secuestro de datos (ransomware) mundiales. El Comité Interamericano contra el Terrorismo (CICTE) de la <strong>OEA</strong> y el **BID** impulsan programas regionales para endurecer los marcos penales específicos y capacitar equipos de respuesta urgente (CSIRTs).
                                                    </p>

                                                    {/* TABLA COMPARATIVA GLOBAL ENRIQUECIDA */}
                                                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mt-3 shadow-inner">
                                                        <table className="w-full text-[11px] text-left border-collapse bg-slate-50/50 dark:bg-black/20">
                                                            <thead>
                                                                <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-black uppercase text-[9px] tracking-wider">
                                                                    <th className="p-3">Región / Indicador</th>
                                                                    <th className="p-3">Tasa Homicidios (x100k)</th>
                                                                    <th className="p-3">Nivel Amenaza Ransomware</th>
                                                                    <th className="p-3">Índice Ciberseguridad (ITU)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-gray-300 font-medium">
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">América Latina</td>
                                                                    <td className="p-3">18.5 <span className="text-red-500 font-bold">↑</span></td>
                                                                    <td className="p-3 text-red-500 font-bold">Crítico (22% global)</td>
                                                                    <td className="p-3">Nivel Medio</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">Argentina</td>
                                                                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">3.7 <span className="text-emerald-500 font-bold">↓</span></td>
                                                                    <td className="p-3 text-orange-500">Medio-Alto</td>
                                                                    <td className="p-3">Nivel T4 (En Evolución)</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="p-3 font-bold text-slate-900 dark:text-white">Tierra del Fuego</td>
                                                                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">1.1 <span className="text-emerald-500 font-bold">↓</span></td>
                                                                    <td className="p-3 text-slate-500">Bajo-Medio</td>
                                                                    <td className="p-3">Fase Inicial (En Desarrollo)</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'national' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Seguridad Pública Tradicional Argentina
                                                    </h3>
                                                    <p>
                                                        Según los datos del Sistema Nacional de Información Criminal (SNIC) del Ministerio de Seguridad de la Nación, <strong>Argentina consolidó en 2025 una tasa de homicidios dolosos de 3.7 por cada 100,000 habitantes</strong>. Este índice sitúa al país en un estándar de seguridad física óptimo en comparación con el promedio regional sudamericano. La presencia coordinada en zonas vulnerables y operativos especiales urbanos han contenido el crecimiento de las bandas violentas tradicionales.
                                                    </p>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Ciberseguridad y Delitos Informáticos en el País
                                                    </h3>
                                                    <p>
                                                        El Plan Federal de Lucha contra el Fraude Ciberasistido (2026-2027) coordina el cruce de denuncias fiscales y bloqueos financieros inmediatos.
                                                    </p>
                                                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2.5">
                                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-gray-400">
                                                            <span>PUNTUACIÓN GCI (ITU) - ARGENTINA:</span>
                                                            <span className="font-mono text-blue-500">64.5 / 100</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-blue-500 h-full w-[64.5%] rounded-full" />
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 dark:text-gray-500 leading-tight">
                                                            Nivel T4 (Etapa en Evolución). Requiere endurecer penas de código penal, robustecer leyes de protección de datos de activos de información y planes de contingencia en infraestructura crítica.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'provincial' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        1. Nodos de Seguridad Pública en Tierra del Fuego
                                                    </h3>
                                                    <p>
                                                        Las estadísticas del **IPIEC** confirman que la provincia ostenta la tasa de criminalidad violenta más baja del país (1.1 homicidios x100k). Sin embargo, el comportamiento delictivo se distribuye de forma muy dispar según el nodo municipal:
                                                    </p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2 text-xs">
                                                        <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] p-3.5 rounded-2xl border border-blue-500/10 flex flex-col gap-1">
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">Ushuaia: Foco Turístico</span>
                                                            <p className="text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">Alta vulnerabilidad estacional en temporada. Prevalecen las estafas virtuales de falsos alquileres temporarios de cabañas y robo oportunista sin violencia.</p>
                                                        </div>
                                                        <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.01] p-3.5 rounded-2xl border border-emerald-500/10 flex flex-col gap-1">
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">Río Grande: Foco Logístico</span>
                                                            <p className="text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">Concentración de ciberdelitos financieros complejos en redes industriales, phishing empresarial corporativo y fraudes de Marketplace.</p>
                                                        </div>
                                                        <div className="bg-orange-500/5 dark:bg-orange-500/[0.01] p-3.5 rounded-2xl border border-orange-500/10 flex flex-col gap-1">
                                                            <span className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-xs">Tolhuin: Foco de Enlace</span>
                                                            <p className="text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">Eje vial estratégico (Ruta Nacional N° 3). Requiere control físico-operativo de vehículos y resguardo preventivo de transporte forestal.</p>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mt-2">
                                                        2. Ciberdelitos y Capacidades de Respuesta en la Isla
                                                    </h3>
                                                    <p>
                                                        Las aproximadamente **882 causas de delitos virtuales en 2025** colapsan los recursos investigativos. Se destaca la urgencia de fortalecer la **División de Delitos Complejos** policial con licencias forenses, ampliación de peritos informáticos capacitados e interoperabilidad con bancos.
                                                    </p>
                                                </div>
                                            )}

                                            {reportSubTab === 'alerts_recs' && (
                                                <div className="flex flex-col gap-5">
                                                    <div>
                                                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                            <AlertTriangle className="w-4 h-4 text-red-500" /> Alertas Tempranas de Amenazas Críticas
                                                        </h3>
                                                        <div className="space-y-3">
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-4 rounded-r-xl relative">
                                                                <span className="absolute top-3 right-3 text-[8px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">Riesgo: Extremo</span>
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">1. Suplantación de Canales de Pago de Servicios Fueguinos</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-400 mt-1.5 block">Phishing focalizado simulando pasarelas de la Dirección Provincial de Energía (DPE) y cooperativas de agua locales para desviar los pagos de facturas hogareñas.</span>
                                                            </div>
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-4 rounded-r-xl relative">
                                                                <span className="absolute top-3 right-3 text-[8px] font-black uppercase text-orange-500 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">Riesgo: Alto</span>
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">2. Ingeniería Social con Audio Clonado por IA</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-400 mt-1.5 block">Uso de grabaciones breves extraídas de redes sociales para simular de forma realista accidentes o emergencias familiares en llamadas fraudulentas a adultos mayores.</span>
                                                            </div>
                                                            <div className="bg-red-500/5 dark:bg-red-500/[0.01] border-l-4 border-l-red-500 p-4 rounded-r-xl relative">
                                                                <span className="absolute top-3 right-3 text-[8px] font-black uppercase text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">Riesgo: Moderado</span>
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">3. Ataques a Puertos y Logística Turística</span>
                                                                <span className="text-[12px] text-slate-600 dark:text-gray-400 mt-1.5 block">Vulnerabilidades en sistemas de control de muelles y reservas de barcos en el Puerto de Ushuaia, capaces de paralizar la carga o el turismo estacional.</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                            💡 Recomendaciones Estratégicas y Mitigación
                                                        </h3>
                                                        <div className="space-y-3 text-[12px]">
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-4 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">1. Constitución Inmediata del CSIRT Provincial</span>
                                                                <span className="text-slate-600 dark:text-gray-400 mt-1.5 block">Formación del equipo de emergencias cibernéticas fueguino para centralizar notificaciones y emitir alertas inmediatas a empresas y ciudadanos.</span>
                                                            </div>
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-4 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">2. Actualización Tecnológica Forense Policial</span>
                                                                <span className="text-slate-600 dark:text-gray-400 mt-1.5 block">Adquisición de equipamiento forense de última generación y licencias (Cellebrite, Oxygen Forensic) para la extracción segura de pruebas en delitos complejos.</span>
                                                            </div>
                                                            <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] border-l-4 border-l-blue-500 p-4 rounded-r-xl">
                                                                <span className="font-bold text-slate-800 dark:text-gray-100 block">3. Red Interbancaria de Congelamiento Preventivo</span>
                                                                <span className="text-slate-600 dark:text-gray-400 mt-1.5 block">Canal de comunicación rápido con el Banco de Tierra del Fuego (BTF) y billeteras virtuales para congelar fondos robados antes de que sean dispersados en la red.</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {reportSubTab === 'methodology' && (
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                        Fuentes de Información y Fechas de Consulta
                                                    </h3>
                                                    <p>
                                                        Para elaborar esta auditoría se contrastó la información obtenida a través de la wiki de monitoreo local con datos oficiales de las siguientes plataformas:
                                                    </p>
                                                    <div className="flex flex-col gap-3 font-mono text-[11px] bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">UNODC (Global Crime Data Portal)</span>
                                                            <a href="https://www.unodc.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.unodc.org/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">INTERPOL (Global Threats Evaluation Report)</span>
                                                            <a href="https://www.interpol.int/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.interpol.int/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Ministerio de Seguridad de la Nación Argentina</span>
                                                            <a href="https://www.argentina.gob.ar/seguridad" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.argentina.gob.ar/seguridad</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Boletín Oficial de la República Argentina</span>
                                                            <a href="https://www.boletinoficial.gob.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://www.boletinoficial.gob.ar/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">IPIEC - Estadísticas Provinciales</span>
                                                            <a href="https://ipiec.tierradelfuego.gob.ar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://ipiec.tierradelfuego.gob.ar/</a>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-blue-600 dark:text-blue-400 block">Wiki de Monitoreo Local</span>
                                                            <a href="https://wiki-app-swart.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 break-all">https://wiki-app-swart.vercel.app/</a>
                                                        </div>
                                                        <div className="pt-2.5 border-t border-slate-200 dark:border-white/5 font-sans font-bold text-slate-500 dark:text-gray-500 text-[10px] uppercase">
                                                            Fecha última de sincronización y contraste: 22 de Mayo de 2026.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="mt-6 flex flex-wrap gap-4 z-10 pt-4 border-t border-slate-200 dark:border-white/5">
                                        <button 
                                            onClick={() => {
                                                const reportContent = `INFORME DE AUDITORÍA DE SEGURIDAD PÚBLICA\n🎯 Objetivo: Análisis exhaustivo de seguridad física y ciberseguridad a tres niveles.\n\nTasa homicidios TDF: 1.1 /100k\nTasa homicidios AR: 3.7 /100k\nCausas Ciber TDF: 882 casos en 2025\n\nConsulte el anexo metodológico en https://wiki-app-swart.vercel.app/`;
                                                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                                                const link = document.createElement('a');
                                                link.href = URL.createObjectURL(blob);
                                                link.download = 'Informe_Auditoria_Seguridad.txt';
                                                link.click();
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-750 dark:text-gray-400 transition-all cursor-pointer shadow-sm"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> Descargar Informe (TXT)
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const shareUrl = `https://wiki-app-swart.vercel.app/`;
                                                const shareText = `Revisa el Informe de Auditoría de Seguridad Pública y Ciudadana en Tierra del Fuego.`;
                                                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-750 dark:text-gray-400 transition-all cursor-pointer shadow-sm"
                                        >
                                            <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Compartir Informe
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                  )}

                  {/* 6. SECURITY CENTER */}
                  {activeTab === 'security' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-8 pb-10 h-full"
                    >
                        <header className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]" id="security-icon-container">
                                 <ShieldCheck className="w-6 h-6 text-red-500" />
                              </div>
                              <div className="flex flex-col">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Security Audit Center</h1>
                                <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-[0.3em] mt-1">División Estratégica Regional (30A-EXP)</span>
                              </div>
                           </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[500px] lg:min-h-[700px]">
                            {/* MAP COLUMN */}
                            <div className="lg:col-span-12 xl:col-span-8 h-[400px] sm:h-[500px] xl:h-full">
                                <SecurityHeatMap />
                            </div>

                            {/* ENTREGABLE Y AUDITORÍA DE DESPLIEGUE */}
                            <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide h-full max-h-[700px]">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Estado de Despliegue</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-550/10">Fase 1-5 Listas</span>
                                    </div>

                                    {/* LISTA DE FASES ESTATALES */}
                                    <div className="space-y-3.5 text-[11px] leading-relaxed">
                                        {[
                                            { f: 'Fase 1 – Análisis de Entorno', d: 'Conectividad verificada. Estructura creada (/public, /api, /data).', status: 'done' },
                                            { f: 'Fase 2 – Código Base', d: 'Generado index.html, style.css, app.js con Google Maps Fallback.', status: 'done' },
                                            { f: 'Fase 3 – Integración de Datos', d: 'JSON tierradelfuego_crimes.json creado y fetch dinámico configurado.', status: 'done' },
                                            { f: 'Fase 4 – Configuración Firebase', d: 'firebase.json y .firebaserc listos para hosting. (Requiere Firebase CLI local).', status: 'ready' },
                                            { f: 'Fase 5 – Documentación', d: 'README.md completo con cronograma e informe de costos mensuales.', status: 'done' }
                                        ].map((phase, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                                    phase.status === 'done' 
                                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/25' 
                                                        : 'bg-blue-500/15 text-blue-600 border border-blue-500/25'
                                                }`}>
                                                    ✓
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900 dark:text-white">{phase.f}</span>
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px]">{phase.d}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                            💻 Ejecutar Despliegue Manual:
                                        </span>
                                        <code className="text-xs font-mono p-2.5 bg-slate-900 text-slate-100 rounded-lg select-all border border-white/5">
                                            firebase deploy --only hosting
                                        </code>
                                        <span className="text-[11px] text-slate-400 dark:text-gray-400 leading-tight">
                                            Nota: Firebase CLI no detectado en el PATH local. Despliegue desde su terminal del sistema.
                                        </span>
                                    </div>
                                </section>

                                {/* CAJA DEL DESCARGABLE ZIP */}
                                <section className="bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/25 dark:border-blue-500/15 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Paquete de Entrega</span>
                                        <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase mt-0.5">Código Fuente Completo (.ZIP)</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">
                                            Contiene el frontend HTML/CSS/JS, el backend Mock en Node.js, configuraciones de Firebase y el informe técnico.
                                        </p>
                                    </div>
                                    <a 
                                        href="/security-audit-map.zip" 
                                        download="security-audit-map.zip"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-md hover:shadow-blue-500/10 text-center"
                                    >
                                        💾 Descargar Entregable (.ZIP)
                                    </a>
                                </section>

                                {/* PLAN DE COSTOS Y ACTUALIZACIÓN */}
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest">Costos & Mantenimiento</span>
                                        <div className="space-y-2 text-[11px] font-semibold text-slate-700 dark:text-gray-300">
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>OpenStreetMap (OSM):</span>
                                                <span className="text-emerald-500 font-bold">100% Gratuito</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>Firebase Hosting:</span>
                                                <span className="text-emerald-500 font-bold">Gratis (Plan Spark)</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                                                <span>Actualización de Datos:</span>
                                                <span className="font-mono text-blue-500 font-bold">Mensual (0 0 1 * *)</span>
                                            </div>
                                            <div className="flex justify-between pt-1 font-bold text-slate-900 dark:text-white">
                                                <span>Costo Estimado Mensual:</span>
                                                <span className="font-mono text-emerald-500 text-xs">USD 0.00/mes</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                  )}

                      {/* 7. LOGISTICS CENTER (SHIPS & FLIGHTS) */}
                      {activeTab === 'logistics' && (
                        <div className="xl:col-span-12">
                          <LogisticsDashboard onBackToHome={() => setActiveTab('home')} />
                        </div>
                      )}
            </div>
          </div>
        </main>

      {/* MOBILE FLOATING BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] left-3 right-3 z-50">
        <nav className="bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-premium rounded-2xl h-[58px] flex items-center justify-around px-1 overflow-hidden">
            {[
              { id: 'home', icon: LayoutDashboard, label: 'Inicio' },
              { id: 'explore', icon: Compass, label: 'Feeds' },
              { id: 'weather', icon: Cloud, label: 'Clima' },
              { id: 'radio', icon: Radio, label: 'Radio' },
            ].map((item) => {
               const Icon = item.icon;
               const isActive = activeTab === item.id;
               return (
                <button 
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMoreOpen(false);
                  }} 
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{ minWidth: '52px', minHeight: '46px' }}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : ''}`} />
                  <span className="text-[10px] font-bold mt-1 tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div layoutId="mobile-nav-indicator" className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
               );
            })}

            {/* BOTÓN MÁS... */}
            {(() => {
              const isMoreActive = ['guia', 'boletines', 'security', 'logistics', 'reports', 'instagram'].includes(activeTab) || isMobileMoreOpen;
              return (
                <button 
                  onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)} 
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                    isMoreActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{ minWidth: '52px', minHeight: '46px' }}
                >
                  <MoreHorizontal className={`w-5 h-5 transition-transform duration-200 ${isMoreActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : ''}`} />
                  <span className="text-[10px] font-bold mt-1 tracking-tight">
                    Más
                  </span>
                  {isMoreActive && (
                    <motion.div layoutId="mobile-nav-indicator" className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })()}
        </nav>
      </div>

      {/* MOBILE MORE ACTION SHEET / DRAWER */}
      <AnimatePresence>
        {isMobileMoreOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileMoreOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="bg-white dark:bg-[#101318] w-full max-w-lg rounded-t-[2.5rem] border-t border-slate-200 dark:border-white/10 p-6 pb-28 shadow-2xl flex flex-col gap-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-white/20 mx-auto -mt-1 mb-2" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <WikiAppLogo className="w-6 h-6" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                    Módulos Fueguinos
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMobileMoreOpen(false)} 
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { id: 'instagram', icon: InstagramIcon, title: 'Redes Sociales', desc: 'Instagram & Cuentas Oficiales', color: 'text-rose-500 bg-rose-500/10' },
                  { id: 'guia', icon: Map, title: 'Guía Fueguina', desc: 'Senderos & Turismo', color: 'text-emerald-500 bg-emerald-500/10' },
                  { id: 'boletines', icon: Newspaper, title: 'Digesto & Boletines', desc: 'Leyes y Decretos', color: 'text-blue-500 bg-blue-500/10' },
                  { id: 'security', icon: ShieldCheck, title: 'Seguridad', desc: 'Ruta 3 & Auditoría', color: 'text-red-500 bg-red-500/10' },
                  { id: 'logistics', icon: Anchor, title: 'Arribos & Tráfico', desc: 'Barcos y Vuelos', color: 'text-orange-500 bg-orange-500/10' },
                  { id: 'reports', icon: FileText, title: 'Informes', desc: 'Análisis Estratégico', color: 'text-indigo-500 bg-indigo-500/10' },
                  { 
                    id: 'tapas_action', 
                    icon: Newspaper, 
                    title: 'Tapas de Diarios', 
                    desc: 'Portadas Impresas', 
                    color: 'text-purple-500 bg-purple-500/10',
                    onClick: () => { setShowTapasModal(true); setIsMobileMoreOpen(false); }
                  }
                ].map(mod => {
                  const Icon = mod.icon;
                  const isCurrent = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        if (mod.onClick) {
                          mod.onClick();
                        } else {
                          setActiveTab(mod.id);
                          setIsMobileMoreOpen(false);
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        isCurrent 
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-600 dark:text-blue-400' 
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {mod.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {mod.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 4. MODAL LECTOR */}
      {/* 5. OVERLAYS & HUD */}
      
      {/* GLOBAL SEARCH MODAL (Cmd+K) */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative p-6 border-b border-slate-200 dark:border-white/5">
                <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Comando rápido: Busca cualquier noticia..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 text-xl font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 dark:bg-white/10 rounded-md text-[10px] font-black text-slate-500 uppercase">ESC</div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
                {search.length > 0 ? (
                  <div className="space-y-2">
                    {filteredArticles.slice(0, 10).map(article => (
                      <div 
                        key={article.id} 
                        onClick={() => { setSelectedArticle(article); setShowSearchModal(false); }}
                        className="p-4 hover:bg-blue-600/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-blue-500/20 group"
                      >
                        <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">{article.title}</h4>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 block">{(feedsMap.get(article.sourceId)?.name || 'Fuente')}</span>
                      </div>
                    ))}
                    {filteredArticles.length === 0 && (
                      <div className="p-12 text-center">
                        <p className="text-slate-500">No se encontraron resultados para "{search}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center opacity-40">
                    <LayoutDashboard className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-[0.3em]">Buscador de Inteligencia</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex justify-end bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="bg-white dark:bg-[#0b0e14] w-full sm:w-[92vw] sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl h-full shadow-[-20px_0_60px_rgba(0,0,0,0.45)] flex flex-col border-l border-slate-200 dark:border-white/10 overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Barra de progreso de lectura */}
              <div className="h-1 bg-slate-100 dark:bg-white/5 w-full overflow-hidden shrink-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-150 ease-out" 
                  style={{ width: `${readingProgress}%` }} 
                />
              </div>

              {/* Header ergonómico del lector */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0c0f17]/90 backdrop-blur-md shrink-0 gap-2">
                {/* Lado izquierdo: Fuente y fecha */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 px-2.5 py-1 rounded-lg truncate max-w-[130px] sm:max-w-[200px]">
                    {feedsMap.get(selectedArticle.sourceId)?.name || 'Central Fueguina'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono shrink-0 hidden sm:inline-block">
                    {new Date(selectedArticle.pubDate).toLocaleDateString()}
                  </span>
                  {isYouTube(selectedArticle.link) && (
                    <span className="bg-red-600/10 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-red-500/20 flex items-center gap-1 shrink-0">
                      <PlayCircle className="w-3 h-3" /> Video
                    </span>
                  )}
                </div>

                {/* Centro / Derecha: Controles de navegación, tamaño tipográfico y cierre */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Navegación Anterior / Siguiente */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      onClick={handlePrevArticle}
                      disabled={currentArticleIndex <= 0}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 disabled:opacity-25 disabled:pointer-events-none transition-all"
                      title="Nota anterior (Atajo: Flecha izquierda)"
                      aria-label="Nota anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-gray-300 px-1.5 font-mono whitespace-nowrap">
                      {currentArticleIndex >= 0 ? `${currentArticleIndex + 1}/${filteredArticles.length}` : 'Nota'}
                    </span>
                    <button
                      onClick={handleNextArticle}
                      disabled={currentArticleIndex < 0 || currentArticleIndex >= filteredArticles.length - 1}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 disabled:opacity-25 disabled:pointer-events-none transition-all"
                      title="Siguiente nota (Atajo: Flecha derecha)"
                      aria-label="Siguiente nota"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selector de escala de fuente */}
                  <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setReaderFontSize('normal')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        readerFontSize === 'normal' 
                          ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                      title="Tipografía normal"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setReaderFontSize('large')}
                      className={`px-2 py-1 rounded-lg text-sm font-bold transition-all ${
                        readerFontSize === 'large' 
                          ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                      title="Tipografía grande"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setReaderFontSize('xlarge')}
                      className={`px-2 py-1 rounded-lg text-base font-extrabold transition-all ${
                        readerFontSize === 'xlarge' 
                          ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                      title="Tipografía extra grande"
                    >
                      A++
                    </button>
                  </div>

                  {/* Botón enlace externo */}
                  <a 
                    href={selectedArticle.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
                    title="Abrir fuente original en nueva pestaña"
                    aria-label="Abrir fuente original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Botón cerrar */}
                  <button 
                    onClick={() => setSelectedArticle(null)} 
                    className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 transition-all"
                    title="Cerrar (Esc)"
                    aria-label="Cerrar lector"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenedor con scroll del contenido */}
              <div 
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                  if (scrollHeight <= clientHeight) {
                    setReadingProgress(100);
                  } else {
                    const pct = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
                    setReadingProgress(pct);
                  }
                }}
                className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10 md:px-14 custom-scrollbar bg-white dark:bg-[#0b0e14] pb-[calc(env(safe-area-inset-bottom)+3rem)]"
              >
                <div className="max-w-2xl mx-auto">
                  {/* Selector de fuente móvil */}
                  <div className="flex sm:hidden items-center justify-between bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-xl mb-6 border border-slate-200 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Tamaño de texto:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setReaderFontSize('normal')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${readerFontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setReaderFontSize('large')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${readerFontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                      >
                        A+
                      </button>
                      <button
                        onClick={() => setReaderFontSize('xlarge')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${readerFontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                      >
                        A++
                      </button>
                    </div>
                  </div>

                  {/* Metadatos superiores */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-600/10 px-3 py-1 rounded-lg border border-blue-500/20">
                      {feedsMap.get(selectedArticle.sourceId)?.name || 'Central'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {new Date(selectedArticle.pubDate).toLocaleDateString()} · {getRelativeTime(selectedArticle.pubDate)}
                    </span>
                  </div>
                  
                  {/* Titular de la noticia */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white mb-6 md:mb-8 font-display">
                    {selectedArticle.title}
                  </h1>
                  
                  {/* Portada / Imagen principal */}
                  {selectedArticle.thumbnail && (
                    <div className="w-full aspect-[16/10] mb-8 sm:mb-10 rounded-[1.75rem] overflow-hidden border border-slate-200 dark:border-white/10 relative group shadow-xl">
                      <img src={selectedArticle.thumbnail} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" />
                      {isYouTube(selectedArticle.link) && (
                        <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-all">
                            <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Cuerpo del artículo con tamaño dinámico */}
                  <div 
                    className={`prose prose-slate dark:prose-invert max-w-none 
                      prose-p:text-slate-700 dark:prose-p:text-gray-300
                      prose-headings:font-black prose-headings:tracking-tight prose-headings:font-display prose-headings:text-slate-900 dark:prose-headings:text-white
                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-500
                      prose-img:rounded-2xl prose-img:shadow-lg prose-strong:text-slate-900 dark:prose-strong:text-white
                      ${
                        readerFontSize === 'xlarge' 
                          ? 'prose-p:text-xl md:prose-p:2xl prose-p:leading-loose text-lg' 
                          : readerFontSize === 'large'
                          ? 'prose-p:text-lg md:prose-p:xl prose-p:leading-relaxed text-base'
                          : 'prose-p:text-base md:prose-p:lg prose-p:leading-relaxed text-base'
                      }`} 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido principal no provisto por la fuente.</p>' }} 
                  />
                  
                  {/* Tarjeta de Siguiente Nota en el feed */}
                  {currentArticleIndex >= 0 && currentArticleIndex < filteredArticles.length - 1 && (
                    <div 
                      onClick={handleNextArticle}
                      className="mt-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 dark:from-blue-950/20 dark:to-white/[0.02] border border-blue-200/60 dark:border-white/10 hover:border-blue-500/50 cursor-pointer transition-all group shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider block mb-1">
                            Siguiente Nota en el feed ➔
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {filteredArticles[currentArticleIndex + 1].title}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
                            {(feedsMap.get(filteredArticles[currentArticleIndex + 1].sourceId)?.name || 'Fuente')}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones de pie de artículo: Compartir y Sitio Oficial */}
                  <div className="mt-10 md:mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col items-center gap-5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Compartir esta noticia</p>
                    <div className="flex items-center gap-2.5 justify-center">
                      <button 
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(selectedArticle.title + ' ' + selectedArticle.link)}`, '_blank')}
                        className="p-2.5 bg-emerald-500/15 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/25 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                        title="Compartir en WhatsApp"
                        aria-label="Compartir en WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => shareToTelegram({
                          url: selectedArticle.link,
                          title: selectedArticle.title,
                          excerpt: selectedArticle.description,
                          source: selectedArticle.sourceName || selectedArticle.sourceId,
                          date: selectedArticle.pubDate ? new Date(selectedArticle.pubDate).toLocaleDateString('es-AR') : ''
                        })}
                        className="p-2.5 bg-sky-500/15 hover:bg-sky-600 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-500/25 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                        title={isValidUrl(selectedArticle.link) ? "Compartir en Telegram (Instant View)" : "Compartir en Telegram"}
                        aria-label="Compartir en Telegram"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(selectedArticle.link);
                            alert('Enlace copiado al portapapeles');
                          }
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
                        title="Copiar enlace"
                        aria-label="Copiar enlace"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mt-2">Continúa leyendo la versión completa en el sitio oficial</p>
                    <a 
                      href={selectedArticle.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[12px] md:text-[13px] font-black tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full md:w-max justify-center ${
                        isYouTube(selectedArticle.link) 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/25' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25'
                      }`}
                    >
                      {isYouTube(selectedArticle.link) ? 'VER EN YOUTUBE' : 'ACCEDER AL SITIO WEB OFICIAL'} 
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TapasModal isOpen={showTapasModal} onClose={() => setShowTapasModal(false)} />
    </div>
  );
}
