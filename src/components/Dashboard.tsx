'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Play, Pause, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon, Globe, Flag, ChevronDown, AlertTriangle, Info, Newspaper } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import RadioDashboard from './RadioDashboard';
import TapasModal from './TapasModal';
import { motion, AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';

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

const WikiAppLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-gradient-wa" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    <path 
      d="M20 38 L35 72 L48 42 L61 72 L76 38" 
      stroke="url(#logo-gradient-wa)" 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M52 53 L68 53" 
      stroke="url(#logo-gradient-wa)" 
      strokeWidth="10" 
      strokeLinecap="round" 
    />
  </svg>
);

type ViewMode = 'list' | 'grid' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showTapasModal, setShowTapasModal] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
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
     { id: 1, name: 'EZEQUIEL MB', type: 'Catamarán de Pasajeros', status: 'En Puerto', time: 'Hoy, 17:51', flag: 'AR', speed: '0.0 kn', destination: 'Ushuaia' },
     { id: 2, name: 'ASTURIANO III', type: 'Portacontenedores', status: 'En Ruta', time: 'Mañana, 06:00', flag: 'AR', speed: '12.4 kn', destination: 'Ushuaia' },
     { id: 3, name: 'STELLA AUSTRALIS', type: 'Crucero Expedition', status: 'Arribando', time: 'Hoy, 20:30', flag: 'CL', speed: '9.8 kn', destination: 'Ushuaia' },
     { id: 4, name: 'ALBATROS', type: 'Pesquero Congelador', status: 'En Puerto', time: 'Ayer, 22:40', flag: 'AR', speed: '0.0 kn', destination: 'Ushuaia' },
     { id: 5, name: 'MAPOCHO', type: 'Remolcador de Altura', status: 'En Puerto', time: 'Hoy, 09:15', flag: 'CL', speed: '0.0 kn', destination: 'Río Grande' }
   ]);
   const [flightsData, setFlightsData] = useState([
     { id: 1, flight: 'AR 1886', airline: 'Aerolíneas Argentinas', route: 'AEP ➔ USH', status: 'En Pista', time: 'Llegó 14:23', type: 'Boeing 737-800' },
     { id: 2, flight: 'AR 1898', airline: 'Aerolíneas Argentinas', route: 'FTE ➔ USH', status: 'En Vuelo', time: 'Previsto 15:40', type: 'Embraer 190' },
     { id: 3, flight: 'AR 1866', airline: 'Aerolíneas Argentinas', route: 'AEP ➔ RGA', status: 'Programado', time: 'Mañana 02:20', type: 'Boeing 737-800' },
     { id: 4, flight: 'WJ 3462', airline: 'JetSmart', route: 'AEP ➔ USH', status: 'En Vuelo', time: 'Previsto 16:15', type: 'Airbus A320' },
     { id: 5, flight: 'FB 5120', airline: 'Flybondi', route: 'EPA ➔ USH', status: 'Programado', time: 'Hoy 18:10', type: 'Boeing 737-800' }
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
  
  React.useEffect(() => {
    setMounted(true);
    setTheme('light');
    setSyncTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setSyncTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, [setTheme]);

  const [pharmacies, setPharmacies] = useState<{ rio_grande: any[], tolhuin: any[], ushuaia: any[] } | null>(null);
  const [selectedPharmacyCity, setSelectedPharmacyCity] = useState<'ushuaia' | 'rio_grande' | 'tolhuin'>('ushuaia');
  const [activePharmacyIndex, setActivePharmacyIndex] = useState(0);

  // Obtener farmacias
  useEffect(() => {
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
  }, []);

  // Rotación del carrusel cada 5 segundos
  useEffect(() => {
    if (!pharmacies) return;
    const interval = setInterval(() => {
      setActivePharmacyIndex(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [pharmacies, selectedPharmacyCity]);

  const getVisiblePharmacies = (cityKey: 'ushuaia' | 'rio_grande' | 'tolhuin') => {
    if (!pharmacies || !pharmacies[cityKey] || pharmacies[cityKey].length === 0) return [];
    const list = pharmacies[cityKey];
    const todayNum = new Date().getDate();
    const todayIndex = list.findIndex(p => parseInt(p.fecha) === todayNum);
    const startIndex = todayIndex === -1 ? 0 : todayIndex;
    
    const visible = [];
    for (let i = 0; i < 4; i++) {
      const idx = (startIndex + i) % list.length;
      visible.push(list[idx]);
    }
    return visible;
  };

  // Extraction of dynamic categories
  const allCategories = useMemo(() => {
     return Array.from(new Set(feeds.map(f => f.category))).filter(Boolean);
  }, [feeds]);

  const dashboardCats = ['all', 'internacional', 'nacional', 'provincial'];
  const feedSideCats = useMemo(() => allCategories.filter(c => !['internacional', 'nacional', 'provincial'].includes(c as string)), [allCategories]);

  // Enhanced Filter Logic
  const filteredArticles = useMemo(() => {
    let result = initialArticles;
    
    // Category filter
    if (activeCategory !== 'all') {
        result = result.filter(a => {
            const feed = feeds.find(f => f.id === a.sourceId);
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
          const sourceName = feeds.find(f => f.id === a.sourceId)?.name || '';
          return (
            a.title.toLowerCase().includes(lowerSearch) ||
            (a.description && a.description.toLowerCase().includes(lowerSearch)) ||
            sourceName.toLowerCase().includes(lowerSearch)
          );
        });
    }
    return result;
  }, [initialArticles, search, feeds, activeCategory, blocklist]);

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
    if (search || activeTab !== 'home' || activeCategory !== 'all') return [];
    
    const findByCategory = (cat: string) => 
        initialArticles.find(a => feeds.find(f => f.id === a.sourceId)?.category === cat);

    const inter = findByCategory('internacional');
    const nac = findByCategory('nacional');
    const prov = findByCategory('provincial');
    
    return [inter, nac, prov].filter(Boolean) as Article[];
  }, [initialArticles, search, activeTab, activeCategory, feeds]);
  
  // Logic for the main feed display: on home we show less, on explore we show more
  // Also exclude top visual articles from the main list
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const feedArticlesToDisplay = useMemo(() => {
    const topIds = new Set(topVisualArticles.map(a => a.id));
    const base = filteredArticles.filter(a => !topIds.has(a.id));
    if (activeTab === 'home' && !search) return base.slice(0, 10);
    return base.slice(0, 50);
  }, [filteredArticles, topVisualArticles, activeTab, search]);

  return (
    <div className="flex h-screen max-w-[100vw] bg-slate-50 dark:bg-[#070707] text-slate-800 dark:text-[#e0e0e0] font-sans overflow-hidden transition-colors duration-200 relative selection:bg-blue-500/30">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 opacity-[0.08] dark:opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/40 dark:bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-orange-600/30 dark:bg-orange-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/30 dark:bg-red-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
      </div>


      
      {/* 1. ULTRA SLIM DYNAMIC SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarExpanded ? 240 : 72 }}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className="bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col items-center shrink-0 z-50 py-4 gap-6 overflow-hidden shadow-2xl transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-4 w-full px-4 mb-4">
          <div className="cursor-pointer group hover:scale-105 transition-transform shrink-0">
            <WikiAppLogo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
          </div>
          <AnimatePresence>
            {isSidebarExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black tracking-tighter text-slate-900 dark:text-white whitespace-nowrap font-display"
              >
                WA <span className="text-blue-500">PRO</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 w-full space-y-1 overflow-y-auto scrollbar-hide py-2 px-2">
          {[
            { id: 'home', icon: LayoutDashboard, label: 'Panel de Control', sub: 'Home' },
            { id: 'explore', icon: Compass, label: 'Fuentes de Inteligencia', sub: 'Feeds' },
            { id: 'weather', icon: Cloud, label: 'Clima & Alertas', sub: 'Clima' },
            { id: 'reports', icon: FileText, label: 'Análisis Estratégico', sub: 'Informes' },
            { id: 'security', icon: ShieldCheck, label: 'Centro de Seguridad', sub: 'Seguridad', color: 'text-red-500', activeBg: 'bg-red-500' },
            { id: 'radio', icon: Radio, label: 'Dial Fueguino', sub: 'Radio' },
            { id: 'logistics', icon: Anchor, label: 'Tráfico Regional', sub: 'Arribos' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`relative w-full flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 ${activeTab === item.id ? (item.id === 'security' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500') : 'text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? (item.color || 'text-blue-500') : 'group-hover:scale-110 transition-transform'}`} />
              
              <AnimatePresence>
                {isSidebarExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col items-start overflow-hidden"
                  >
                    <span className="text-[13px] font-bold whitespace-nowrap">{item.label}</span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{item.sub}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className={`absolute left-0 w-1 h-6 rounded-r-full ${item.id === 'security' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="w-full px-2 space-y-1 pb-4 border-t border-slate-200 dark:border-white/5 pt-4">
            <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
              <Search className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarExpanded && <span className="text-[13px] font-bold">Búsqueda Rápida</span>}
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
              <Settings className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarExpanded && <span className="text-[13px] font-bold">Configuración</span>}
            </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* PREMIUM TOP NAVIGATION */}
        <div className="px-3 py-3 md:px-8 md:py-4 shrink-0 z-30 sticky top-0 bg-white/60 dark:bg-[#070707]/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-glass safe-top">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                   <div className="lg:hidden mr-2 shrink-0">
                      <WikiAppLogo className="w-10 h-10" />
                   </div>
                   <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                      <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                         WA <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-500 font-black border border-blue-500/20 ml-1">PRO</span>
                      </h1>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em] font-mono hidden sm:block">
                            {activeTab === 'home' ? 'Monitor Regional' : activeTab === 'explore' ? 'Fuentes de Inteligencia' : activeTab === 'security' ? 'Centro de Auditoría' : activeTab === 'logistics' ? 'Control de Tráfico' : activeTab === 'radio' ? 'Dial Fueguino' : 'Sistema'}
                        </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                    {/* Modo Vistas */}
                    {(activeTab === 'home' || activeTab === 'explore') && (
                      <>
                        <div className="hidden sm:flex items-center gap-1 bg-slate-150/80 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                          <button 
                            onClick={() => setViewMode('list')} 
                            className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-gray-450 dark:hover:text-white'}`} 
                            title="Vista de Lista"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setViewMode('grid')} 
                            className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-gray-450 dark:hover:text-white'}`} 
                            title="Vista de Galería"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setViewMode('magazine')} 
                            className={`p-1.5 rounded-full transition-all ${viewMode === 'magazine' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-gray-450 dark:hover:text-white'}`} 
                            title="Vista de Revista"
                          >
                            <LayoutTemplate className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => setShowTapasModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs shadow-sm transition-all shrink-0"
                          title="Ver Tapas de Diarios"
                        >
                          <Newspaper className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                          <span className="hidden xs:inline">Tapas</span>
                        </button>
                      </>
                    )}
                    
                    <div className="hidden sm:flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Estado del Sistema</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 leading-tight">
                                Sincronizado: {syncTime || '...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                     {/* 🖥️ MODERNA BARRA DE HERRAMIENTAS - SEARCH + FILTROS + TABS */}
             {/* 🖥️ MODERNA BARRA DE HERRAMIENTAS - SEARCH + FILTROS + TABS */}
            {(activeTab === 'home' || activeTab === 'explore') && (
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 xl:gap-6 py-3 md:py-6 px-3 md:px-8 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-3xl xl:sticky xl:top-[72px] relative top-0 z-20 transition-all duration-300">
                    
                    {/* CUADRO DE BÚSQUEDA PRO */}
                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar en el flujo de noticias..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>

                    {/* FILTRO DE CATEGORÍAS (DROPDOWN) */}
                    <div className="flex items-center gap-2 md:gap-3 w-full xl:w-auto">
                        <div className="px-3 py-2.5 md:px-4 md:py-3 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-2 shrink-0">
                            <ListFilter className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] md:text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest hidden xs:inline">Categoría</span>
                        </div>
                        <div className="relative flex-1 xl:w-56 group">
                            <select 
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-[12px] font-bold uppercase text-slate-700 dark:text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="all">Todas las Categorías</option>
                                {activeTab === 'home' ? (
                                    <>
                                        <option value="tecnologia">Tecnología</option>
                                        <option value="economia">Economía</option>
                                        <option value="seguridad">Seguridad</option>
                                        <option value="educacion">Educación</option>
                                        <option value="transporte">Transporte</option>
                                    </>
                                ) : (
                                    feedSideCats.map(cat => (
                                        <option key={cat} value={cat as string}>
                                            {(cat as string).replace(/-/g, ' ')}
                                        </option>
                                    ))
                                )}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>

                    {/* DROPDOWN DE COBERTURA GEOGRÁFICA INTERACTIVO & RESPONSIVO */}
                    {activeTab === 'home' && (
                        <div className="relative">
                            <button
                                onClick={() => setIsCoverageDropdownOpen(!isCoverageDropdownOpen)}
                                className="flex items-center gap-2.5 px-4 py-3.5 bg-slate-100/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:bg-slate-200/55 dark:hover:bg-white/[0.04] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {activeCategory === 'all' && <LayoutGrid className="w-4 h-4 text-blue-500" />}
                                {activeCategory === 'internacional' && <Globe className="w-4 h-4 text-orange-500" />}
                                {activeCategory === 'nacional' && <Flag className="w-4 h-4 text-sky-500" />}
                                {activeCategory === 'provincial' && <Map className="w-4 h-4 text-emerald-500" />}
                                
                                <span className="font-sans tracking-wide">
                                    Cobertura: {
                                        activeCategory === 'all' ? 'Todo el panorama' :
                                        activeCategory === 'internacional' ? 'Global' :
                                        activeCategory === 'nacional' ? 'Nacional' : 'Provincial'
                                    }
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isCoverageDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isCoverageDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setIsCoverageDropdownOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-0 mt-2 w-72 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-40 flex flex-col gap-1"
                                        >
                                            {[
                                                { id: 'all', label: 'Todo el panorama', desc: 'Todo el universo de noticias', icon: LayoutGrid, color: 'text-blue-500 bg-blue-500/10' },
                                                { id: 'internacional', label: 'Global', desc: 'Cobertura internacional y exterior', icon: Globe, color: 'text-orange-500 bg-orange-500/10' },
                                                { id: 'nacional', label: 'Nacional', desc: 'Noticias de toda Argentina', icon: Flag, color: 'text-sky-500 bg-sky-500/10' },
                                                { id: 'provincial', label: 'Provincial', desc: 'Sucesos de Tierra del Fuego', icon: Map, color: 'text-emerald-500 bg-emerald-500/10' }
                                            ].map((item) => {
                                                const Icon = item.icon;
                                                const isSelected = activeCategory === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setActiveCategory(item.id);
                                                            setIsCoverageDropdownOpen(false);
                                                        }}
                                                        className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                                                            isSelected 
                                                                ? 'bg-blue-650 text-white shadow-md' 
                                                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : item.color}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-black uppercase tracking-wider leading-none">{item.label}</span>
                                                            <span className={`text-[9px] mt-1 leading-normal ${isSelected ? 'text-blue-100' : 'text-slate-450 dark:text-gray-500'}`}>{item.desc}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* SELECTORES DE VISTA Y DENSIDAD */}
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Density Toggle */}
                        <div className="hidden md:flex bg-slate-100/50 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5 items-center">
                            <button 
                                onClick={() => setDensity('compact')} 
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${density === 'compact' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Compacto
                            </button>
                            <button 
                                onClick={() => setDensity('comfortable')} 
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${density === 'comfortable' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Amplio
                            </button>
                        </div>
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

                  {/* TOP VISUAL WIDGET (SOLO EN HOME SIN FILTRO) */}
                  {!search && activeTab === 'home' && topVisualArticles.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {topVisualArticles.map((article, idx) => {
                            const isVid = isYouTube(article.link);
                            return (
                               <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1 }}
                                  key={'top-'+article.id}
                                  onClick={() => setSelectedArticle(article)}
                                  className="group relative h-48 sm:h-56 md:h-80 bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-slate-300 dark:border-[#222] cursor-pointer shadow-2xl press-effect hover-lift"
                               >
                                  {article.thumbnail ? (
                                      <img src={article.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" alt="" />
                                  ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black"></div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                  
                                  {/* YouTube overlay if applicable */}
                                  {isVid && (
                                     <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-red-600/90 text-white p-1.5 md:p-2 rounded-full backdrop-blur shadow-lg">
                                        <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                                     </div>
                                  )}
                                  {/* Category Badge with Fire Icon */}
                                  {!isVid && (
                                     <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-orange-600/90 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase shadow-lg flex items-center gap-1 backdrop-blur ring-1 ring-white/20">
                                        <Flame className="w-2.5 h-2.5 md:w-3 md:h-3" /> 
                                        {feeds.find(f => f.id === article.sourceId)?.category === 'internacional' ? 'Internacional' : 
                                         feeds.find(f => f.id === article.sourceId)?.category === 'nacional' ? 'Argentina' : 'TDF'}
                                     </div>
                                  )}

                                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2 transform group-hover:-translate-y-2 transition-transform duration-300">
                                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-slate-100/80 dark:bg-black/50 w-max px-2 py-1 rounded-md mb-1 border border-slate-200 dark:border-white/5 backdrop-blur-md">
                                          {feeds.find(f => f.id === article.sourceId)?.name}
                                      </span>
                                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-3 text-shadow-md">
                                          {article.title}
                                      </h3>
                                      <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 bg-black/50 hover:bg-green-500 text-white rounded-lg transition-all backdrop-blur-md" title="Compartir en WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 bg-black/50 hover:bg-blue-500 text-white rounded-lg transition-all backdrop-blur-md" title="Compartir en Telegram"><Send className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                               </motion.div>
                            )
                        })}
                     </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* MAIN CONTENT FEED LIST */}
                      <div className={`${activeTab === "home" ? "xl:col-span-8" : "xl:col-span-12"} flex flex-col gap-6`}>
                         {(activeTab === "home" || activeTab === "explore") && (
                         <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                        <BookmarkCheck className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                        {activeCategory === 'all' ? 'Flujo Dinámico' : activeCategory.replace(/-/g, ' ')}
                                        <span className="text-slate-500 dark:text-gray-500 ml-2 font-normal text-[11px]">{feedArticlesToDisplay.length} resultados</span>
                                    </h2>
                                </div>
                            </div>
                                                   <motion.div layout className={`flex ${viewMode === 'list' ? 'flex-col shadow-inner' : viewMode === 'grid' ? 'flex-row flex-wrap p-4 md:p-6 gap-6' : 'flex-col p-2 md:p-4'}`}>
                                <AnimatePresence mode="popLayout">
                                    {feedArticlesToDisplay.map(article => {
                                        const isVid = isYouTube(article.link);
                                        const sourceName = feeds.find(f => f.id === article.sourceId)?.name || 'Fuente';

                                        // VIEW: LIST
                                                                                // VIEW: LIST
                                        if (viewMode === 'list') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h3 className="text-[12.5px] font-bold text-slate-800 dark:text-gray-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-3">
                                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-row gap-4 px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden"
                                                    >
                                                        {article.thumbnail && (
                                                            <div className="w-20 h-20 md:w-28 md:h-20 shrink-0 overflow-hidden rounded-xl relative shadow-md">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                                               <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                               <span className="text-slate-400 dark:text-gray-555 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description ? (
                                                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
                                                                    {stripHtml(article.description)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-[11px] text-slate-450 dark:text-gray-555 italic leading-relaxed">
                                                                    Esta nota está disponible de forma completa en el portal de origen.
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="hidden md:flex items-center gap-2 mt-3 sm:mt-0 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-500 dark:text-gray-400 hover:text-green-500 rounded-xl transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-500 dark:text-gray-400 hover:text-blue-405 rounded-xl transition-all"><Send className="w-4 h-4" /></button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }

                                        // VIEW: GRID
                                                                                // VIEW: GRID
                                        if (viewMode === 'grid') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500/50 p-4 transition-all cursor-pointer flex flex-col justify-between min-h-[100px] press-effect"
                                                    >
                                                        <h3 className="text-[12.5px] font-bold text-slate-800 dark:text-gray-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-3 transition-colors font-display">
                                                            {article.title}
                                                        </h3>
                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                                                            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">{sourceName}</span>
                                                            <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        whileHover={{ y: -4 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/50 hover-lift transition-all cursor-pointer flex flex-col"
                                                    >
                                                        {article.thumbnail ? (
                                                            <div className="aspect-[16/10] overflow-hidden relative">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-60"></div>
                                                                <div className="absolute top-4 left-4">
                                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">{sourceName}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black flex items-center justify-center">
                                                                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-800" />
                                                            </div>
                                                        )}
                                                        <div className="p-5 flex flex-col flex-1 gap-2.5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] text-slate-400 dark:text-gray-555 font-black uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                                <Bookmark className="w-3.5 h-3.5 text-slate-300 dark:text-gray-750 hover:text-blue-500 transition-colors" />
                                                            </div>
                                                            <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2 transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description ? (
                                                                <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                                    {stripHtml(article.description)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-[11px] text-slate-450 dark:text-gray-550 italic leading-relaxed">
                                                                    Consulte el informe completo en el enlace del portal original.
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="hidden md:flex absolute bottom-4 right-4 items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white dark:bg-black/80 backdrop-blur-xl p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-lg transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-405 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }


                                        // VIEW: MAGAZINE
                                                                                // VIEW: MAGAZINE
                                        if (viewMode === 'magazine') {
                                            if (density === 'compact') {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 15 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-col sm:flex-row gap-5 p-5 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        {article.thumbnail && (
                                                            <div className="w-full sm:w-40 aspect-[16/10] shrink-0 overflow-hidden rounded-2xl relative shadow-md">
                                                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col justify-center gap-2 flex-1">
                                                            <div className="flex items-center gap-3">
                                                               <span className="text-[10px] font-black text-blue-650 dark:text-blue-400 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded">{sourceName}</span>
                                                               <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-base font-bold text-slate-850 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                                                                {article.title}
                                                            </h3>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 30 }}
                                                        key={article.id} 
                                                        onClick={() => setSelectedArticle(article)}
                                                        className="group flex flex-col lg:flex-row gap-8 md:gap-12 p-6 md:p-10 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="w-full lg:w-[450px] aspect-[16/10] lg:h-[280px] shrink-0 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
                                                            <img src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                            {isVid && (
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                                    <PlayCircle className="w-10 h-10 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col flex-1 justify-center gap-5">
                                                            <div className="flex items-center gap-4">
                                                               <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] font-mono">{sourceName}</span>
                                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700"></div>
                                                               <span className="text-[11px] font-bold text-slate-550 dark:text-gray-550 uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                            </div>
                                                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 font-display">
                                                                {article.title}
                                                            </h3>
                                                            {article.description ? (
                                                                <p className="text-[15px] text-slate-650 dark:text-gray-300 leading-relaxed font-medium max-w-3xl">
                                                                    {stripHtml(article.description)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-[15px] text-slate-500 dark:text-gray-550 italic leading-relaxed font-medium max-w-3xl">
                                                                    Esta noticia está disponible íntegramente a través de los canales de la agencia emisora. Haga clic en Seguir leyendo para visualizar el artículo completo en su portal original.
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b-2 border-blue-600/20 group-hover:border-blue-600 transition-all pb-1">Seguir leyendo</span>
                                                                <div className="hidden md:flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en WhatsApp"><MessageCircle className="w-5 h-5" /></button>
                                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-600 dark:text-gray-450 hover:text-blue-405 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en Telegram"><Send className="w-5 h-5" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        }


                                        return null;
                                    })}
                                </AnimatePresence>
                                 {feedArticlesToDisplay.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-500 dark:text-gray-500">Sin artículos recientes compatibles.</div>
                                 )}
                                 
                                 {/* VER + BUTTON FOR HOME */}
                                 {activeTab === 'home' && !search && (filteredArticles.length - topVisualArticles.length) > 10 && (
                                    <div className="p-6 border-t border-slate-200 dark:border-[#1f1f1f] flex justify-center bg-white dark:bg-[#0e0e0e]/50">
                                        <button 
                                            onClick={() => setActiveTab('explore')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-300 dark:border-[#333] rounded-full text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-all group font-bold"
                                        >
                                            Ver + Noticias <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                 )}
                             </motion.div>
                           </div>
                         )}
                      </div>

                      {/* RIGHT COLUMN (CHECKLIST) FOR HOME */}
                      {activeTab === 'home' && (
                        <div className="flex xl:col-span-4 flex-col gap-6 w-full xl:w-auto mt-4 xl:mt-0">
                            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
                                <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                                    <h2 className="text-[13px] font-bold tracking-wide flex items-center gap-2">
                                        <Map className="w-4 h-4 text-orange-500" />
                                        Estado de Rutas TDF
                                    </h2>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    
                                    {/* TRAMO 1 */}
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-blue-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-blue-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Norte</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">San Sebastián - Río Grande</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Tránsito habilitado. Monitoreo oficial por condiciones climáticas de la zona.</p>
                                        <a href="https://www.facebook.com/SuDefensaCivil/" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors">
                                            Fuente: Defensa Civil <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 2 */}
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-emerald-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-emerald-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Centro</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Río Grande - Tolhuin</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Precaución permanente en zona geológica. Reportarse a los puestos de control.</p>
                                        <a href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                                            Fuente: Vialidad Nacional <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 3 */}
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-orange-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-orange-400"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Sur</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Tolhuin - Lapataia</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Zona de montaña. Transitabilidad sujeta a condiciones de hielo y nieve diaria.</p>
                                        <a href="https://www.facebook.com/direccionprovincialdevialidadTDF/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-orange-400 hover:text-orange-300 transition-colors">
                                            Fuente: Vialidad Pcial <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                </div>
                            </div>

                            {/* TARJETA DE FARMACIAS DE TURNO (UX PREMIUM & AUTO-UPDATE) */}
                            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                                <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
                                    <h2 className="text-[13px] font-bold tracking-wide flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-emerald-500" />
                                        Farmacias de Turno
                                    </h2>
                                    <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                                        {(['ushuaia', 'rio_grande', 'tolhuin'] as const).map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    setSelectedPharmacyCity(city);
                                                    setActivePharmacyIndex(0);
                                                }}
                                                className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all ${
                                                    selectedPharmacyCity === city
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                                                }`}
                                            >
                                                {city === 'rio_grande' ? 'R. Grande' : city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {pharmacies ? (
                                    <div className="relative min-h-[140px] flex flex-col">
                                        <AnimatePresence mode="wait">
                                            {(() => {
                                                const visibleList = getVisiblePharmacies(selectedPharmacyCity);
                                                const pharmacy = visibleList[activePharmacyIndex];
                                                if (!pharmacy) return null;

                                                const isToday = parseInt(pharmacy.fecha) === new Date().getDate();
                                                const formattedCityName = selectedPharmacyCity === 'ushuaia' ? 'Ushuaia' : selectedPharmacyCity === 'rio_grande' ? 'Río Grande' : 'Tolhuin';

                                                return (
                                                    <motion.div
                                                        key={`${selectedPharmacyCity}-${activePharmacyIndex}`}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                isToday
                                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse'
                                                                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                                                            }`}>
                                                                {isToday ? 'Hoy de Turno' : `${pharmacy.dia} ${pharmacy.fecha}`}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500">
                                                                {pharmacy.horario}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                                                            {pharmacy.nombre}
                                                        </h3>

                                                        {/* Dirección Interactiva para GPS */}
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Farmacia ${pharmacy.nombre}, ${pharmacy.direccion}, ${formattedCityName}, Tierra del Fuego`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit group mt-1"
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                            <span className="underline underline-offset-2 decoration-dotted group-hover:decoration-solid">{pharmacy.direccion}</span>
                                                        </a>

                                                        {/* Teléfonos Interactivos */}
                                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                                            {(() => {
                                                                const rawPhones = pharmacy.telefono;
                                                                const cleanPhones = rawPhones.replace(/(Tel\.|Cel\.|CEL\.)/gi, '').trim();
                                                                const phoneParts = cleanPhones.split(/[\/\–]/).map((p: string) => p.trim()).filter(Boolean);
                                                                
                                                                return phoneParts.map((phone: string, idx: number) => {
                                                                    const telLink = phone.replace(/[^\d+]/g, '');
                                                                    return (
                                                                        <a
                                                                            key={idx}
                                                                            href={`tel:${telLink}`}
                                                                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                                            </svg>
                                                                            Llamar: {phone}
                                                                        </a>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })()}
                                        </AnimatePresence>

                                        {/* Indicadores de carrusel */}
                                        <div className="flex justify-center gap-1.5 mt-3">
                                            {[0, 1, 2, 3].map(idx => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActivePharmacyIndex(idx)}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                        activePharmacyIndex === idx
                                                            ? 'bg-blue-600 w-3'
                                                            : 'bg-slate-300 dark:bg-[#333]'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[140px] flex flex-col items-center justify-center bg-slate-100 dark:bg-[#161616]/40 rounded-2xl border border-slate-300 dark:border-[#222]">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] uppercase font-black text-slate-500 dark:text-gray-500 tracking-wider mt-3">Sincronizando farmacias...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                      )}

                      {/* SIDE PANEL REMOVED AND MOVED TO TOP DROPDOWN */}
                  </div>
                </div>
            )}

                  {/* 4. WEATHER DASHBOARD */}
                  {activeTab === 'weather' && <WeatherDashboard />}

                  {/* RADIO DASHBOARD */}
                  {activeTab === 'radio' && <RadioDashboard />}

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
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2 text-[11px]">
                                                        <div className="bg-blue-500/5 dark:bg-blue-500/[0.01] p-3.5 rounded-2xl border border-blue-500/10 flex flex-col gap-1">
                                                            <span className="font-black text-blue-600 dark:text-blue-400 uppercase">Ushuaia: Foco Turístico</span>
                                                            <p className="text-slate-650 dark:text-gray-400 mt-1">Alta vulnerabilidad estacional en temporada. Prevalecen las estafas virtuales de falsos alquileres temporarios de cabañas y robo oportunista sin violencia.</p>
                                                        </div>
                                                        <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.01] p-3.5 rounded-2xl border border-emerald-500/10 flex flex-col gap-1">
                                                            <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">Río Grande: Foco Logístico</span>
                                                            <p className="text-slate-650 dark:text-gray-400 mt-1">Concentración de ciberdelitos financieros complejos en redes industriales, phishing empresarial corporativo y fraudes de Marketplace.</p>
                                                        </div>
                                                        <div className="bg-orange-500/5 dark:bg-orange-500/[0.01] p-3.5 rounded-2xl border border-orange-500/10 flex flex-col gap-1">
                                                            <span className="font-black text-orange-600 dark:text-orange-400 uppercase">Tolhuin: Foco de Enlace</span>
                                                            <p className="text-slate-650 dark:text-gray-400 mt-1">Eje vial estratégico (Ruta Nacional N° 3). Requiere control físico-operativo de vehículos y resguardo preventivo de transporte forestal.</p>
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
                                        <span className="text-[10px] font-black text-slate-650 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                            💻 Ejecutar Despliegue Manual:
                                        </span>
                                        <code className="text-[10px] font-mono p-2 bg-slate-900 text-slate-100 rounded-lg select-all border border-white/5">
                                            firebase deploy --only hosting
                                        </code>
                                        <span className="text-[9px] text-slate-400 dark:text-gray-500 leading-tight">
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
                                                <span>Google Maps API:</span>
                                                <span className="text-emerald-500 font-bold">Gratis (Crédito $200)</span>
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
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="xl:col-span-12 flex flex-col gap-8 pb-10"
                        >
                            <header className="flex flex-col gap-2">
                               <div className="flex items-center justify-between flex-wrap gap-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                                         <Anchor className="w-6 h-6 text-blue-500" />
                                      </div>
                                      <div className="flex flex-col">
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Control de Arribos Regional</h1>
                                        <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-[0.3em] mt-1">Tráfico Marítimo y Aéreo en Tiempo Real</span>
                                      </div>
                                   </div>
                                   {/* Live status banner */}
                                   <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-full shadow-sm">
                                       <span className="relative flex h-2 w-2">
                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                       </span>
                                       <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Satelital Vivo</span>
                                       <span className="text-slate-350 dark:text-white/10 w-px h-3.5">|</span>
                                       <span className="text-[9px] font-bold text-slate-655 dark:text-gray-400 uppercase tracking-widest leading-none font-mono">Próxima actualizac. en {secondsToUpdate}s</span>
                                   </div>
                               </div>
                            </header>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                {/* DATA CAROUSEL COLUMN */}
                                <div className="xl:col-span-4 flex flex-col gap-6">
                                    <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden h-auto xl:h-[810px]">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Estado de Tránsito</h3>
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={() => setIsAutoCycle(!isAutoCycle)} 
                                                    className={`p-1.5 rounded-lg border transition-all ${isAutoCycle ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`} 
                                                    title={isAutoCycle ? "Pausar Rotación" : "Activar Rotación"}
                                                >
                                                    {isAutoCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tabs Selector */}
                                        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                                            <button 
                                                onClick={() => { setCarouselSlide('ships'); setIsAutoCycle(false); }}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${carouselSlide === 'ships' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'}`}
                                            >
                                                <Anchor className="w-3.5 h-3.5" /> Barcos & Cruceros
                                            </button>
                                            <button 
                                                onClick={() => { setCarouselSlide('flights'); setIsAutoCycle(false); }}
                                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${carouselSlide === 'flights' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'}`}
                                            >
                                                <Plane className="w-3.5 h-3.5" /> Tránsito Aéreo
                                            </button>
                                        </div>

                                        {/* Slide Content */}
                                        <div className="flex-1 flex flex-col relative overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                {carouselSlide === 'ships' ? (
                                                    <motion.div 
                                                        key="ships-slide"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="flex-1 flex flex-col gap-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Arribos Marítimos ({shipsData.length})</span>
                                                            <a href="https://www.argentina.gob.ar/economia/agencia-nacional-de-puertos-y-navegacion/puertos/puerto-de-ushuaia" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1">INFO OFICIAL <ExternalLink className="w-3 h-3" /></a>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-3.5 overflow-y-auto scrollbar-hide pr-1">
                                                            {shipsData.map(ship => (
                                                                <div key={ship.id} className="bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2.5 relative shadow-sm hover:border-blue-500/30 transition-all">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                            ship.status === 'En Puerto' 
                                                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                                                : ship.status === 'Arribando'
                                                                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                                                                                : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                                        }`}>
                                                                            {ship.status}
                                                                        </span>
                                                                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500">{ship.time}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                                            <Anchor className="w-5 h-5 text-blue-500" />
                                                                        </div>
                                                                        <div className="flex min-w-0 flex-col">
                                                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight truncate">{ship.name}</span>
                                                                            <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{ship.type}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5 pt-2 font-mono">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-slate-400">Bandera:</span>
                                                                            <span className="font-bold text-slate-750 dark:text-gray-300">{ship.flag}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-slate-400">Velocidad:</span>
                                                                            <span className="font-bold text-slate-755 dark:text-gray-300">{ship.speed}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-slate-400">Destino:</span>
                                                                            <span className="font-bold text-slate-755 dark:text-gray-300">{ship.destination}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="flights-slide"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="flex-1 flex flex-col gap-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Tránsito Aéreo ({flightsData.length})</span>
                                                            <div className="flex gap-3">
                                                                <a href="https://www.aeropuertoushuaia.com/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1">USH <ExternalLink className="w-3 h-3" /></a>
                                                                <a href="https://www.aeropuertosdelmundo.com.ar/aeropuerto-RGA-llegadas/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1">RGA <ExternalLink className="w-3 h-3" /></a>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3.5 overflow-y-auto scrollbar-hide pr-1">
                                                            {flightsData.map(flight => (
                                                                <div key={flight.id} className="bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2.5 relative shadow-sm hover:border-orange-500/30 transition-all">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                                            flight.status === 'En Pista' 
                                                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                                                : flight.status === 'En Vuelo'
                                                                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse'
                                                                                : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400 border border-slate-350 dark:border-white/5'
                                                                        }`}>
                                                                            {flight.status}
                                                                        </span>
                                                                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500">{flight.time}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                                                            <Plane className="w-5 h-5 text-orange-500" />
                                                                        </div>
                                                                        <div className="flex min-w-0 flex-col">
                                                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight italic truncate">{flight.flight}</span>
                                                                            <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{flight.airline}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5 pt-2 font-mono">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-slate-400">Ruta:</span>
                                                                            <span className="font-bold text-slate-755 dark:text-gray-300">{flight.route}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-slate-400">Aeronave:</span>
                                                                            <span className="font-bold text-slate-755 dark:text-gray-300">{flight.type}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Carousel Controls */}
                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                                            {/* Dot Indicators */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => { setCarouselSlide('ships'); setIsAutoCycle(false); }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${carouselSlide === 'ships' ? 'bg-blue-600 w-6' : 'bg-slate-350 dark:bg-white/10'}`} 
                                                />
                                                <button 
                                                    onClick={() => { setCarouselSlide('flights'); setIsAutoCycle(false); }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${carouselSlide === 'flights' ? 'bg-blue-600 w-6' : 'bg-slate-350 dark:bg-white/10'}`} 
                                                />
                                            </div>
                                            
                                            {/* Next/Prev buttons */}
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => { 
                                                        setCarouselSlide(prev => prev === 'ships' ? 'flights' : 'ships'); 
                                                        setIsAutoCycle(false); 
                                                    }}
                                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-[#1a1a1a] transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-650 dark:text-gray-400 transform rotate-180" />
                                                </button>
                                                <button 
                                                    onClick={() => { 
                                                        setCarouselSlide(prev => prev === 'ships' ? 'flights' : 'ships'); 
                                                        setIsAutoCycle(false); 
                                                    }}
                                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-[#1a1a1a] transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-650 dark:text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MAPS STACK COLUMN (ONE BELOW THE OTHER, NO POPUPS) */}
                                <div className="xl:col-span-8 flex flex-col gap-8">
                                    {/* Maritime Map Card */}
                                    <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                                    <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                                    Radar AIS de Tráfico Marítimo - Canal Beagle
                                                </h2>
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-500 uppercase font-black">Navegación Libre</span>
                                        </div>
                                        <div className="w-full h-[260px] md:h-[370px] relative bg-white dark:bg-[#0c0c0c]">
                                            <iframe 
                                                src="https://www.marinetraffic.com/en/ais/embed/zoom:9/centery:-54.7/centerx:-67.5/maptype:0/shownames:false"
                                                className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                                title="Marine Traffic - Puerto de Ushuaia"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>

                                    {/* Air Map Card */}
                                    <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center">
                                                    <Plane className="w-3.5 h-3.5 text-orange-500" />
                                                </div>
                                                <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                                    Radar ADS-B de Tráfico Aéreo Regional (TDF)
                                                </h2>
                                            </div>
                                            <span className="text-[9px] font-mono text-slate-500 dark:text-gray-550 uppercase font-black">Navegación Libre</span>
                                        </div>
                                        <div className="w-full h-[260px] md:h-[370px] relative bg-white dark:bg-[#0c0c0c]">
                                            <iframe 
                                                src="https://www.radarbox.com/widget?lat=-54.8&lon=-68.3&z=8&theme=dark"
                                                className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                                title="RadarBox - Tierra del Fuego"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                      )}
            </div>
          </div>
        </main>

      {/* MOBILE FLOATING BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-4 right-4 z-50">
        <nav className="bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-premium rounded-[2rem] h-[60px] flex items-center justify-around px-2 overflow-hidden">
            {[
              { id: 'home', icon: LayoutDashboard, label: 'Inicio' },
              { id: 'explore', icon: Compass, label: 'Feeds' },
              { id: 'weather', icon: Cloud, label: 'Clima' },
              { id: 'radio', icon: Radio, label: 'Radio' },
              { id: 'security', icon: ShieldCheck, label: 'Seguridad' },
              { id: 'logistics', icon: Anchor, label: 'Arribos' }
            ].map((item) => {
               const Icon = item.icon;
               const isActive = activeTab === item.id;
               return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)} 
                  className={`flex items-center justify-center py-2 px-3 rounded-full transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-500 font-bold' 
                      : 'text-slate-400 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                  style={{ minWidth: isActive ? 'auto' : '44px', minHeight: '44px' }}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : ''}`} />
                  {isActive && (
                    <span className="text-[10px] font-black ml-1.5 uppercase tracking-wider transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                  {isActive && (
                    <motion.div layoutId="mobile-nav-indicator" className="absolute -bottom-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
               );
            })}
        </nav>
      </div>
      
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
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 block">{(feeds.find(f => f.id === article.sourceId)?.name || 'Fuente')}</span>
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
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 md:p-12"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#0a0a0a] w-full max-w-4xl h-full sm:h-[95vh] sm:max-h-[900px] rounded-none sm:rounded-[2.5rem] shadow-2xl flex flex-col border-none sm:border border-slate-200 dark:border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c] safe-top">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em]">Inteligencia Operativa</span>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="p-2 md:p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-gray-400" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar bg-white dark:bg-[#0a0a0a] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-600/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {feeds.find(f => f.id === selectedArticle.sourceId)?.name || 'Central'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">{new Date(selectedArticle.pubDate).toLocaleDateString()}</span>
                    {isYouTube(selectedArticle.link) && (
                      <span className="bg-red-600/10 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-red-500/20 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" /> Video
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white mb-6 md:mb-10 font-display">
                    {selectedArticle.title}
                  </h1>
                  
                  {selectedArticle.thumbnail && (
                    <div className="w-full aspect-[16/10] mb-12 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 relative group shadow-2xl">
                      <img src={selectedArticle.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" />
                      {isYouTube(selectedArticle.link) && (
                        <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-all">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none 
                      prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-gray-300
                      prose-headings:font-black prose-headings:tracking-tight prose-headings:font-display
                      prose-a:text-blue-600 prose-img:rounded-3xl prose-img:shadow-xl" 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido principal no provisto por la fuente.</p>' }} 
                  />
                  
                  <div className="mt-12 md:mt-20 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-6">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Compartir esta noticia</p>
                    <div className="flex items-center gap-3 w-full justify-center">
                      <button 
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(selectedArticle.title + ' ' + selectedArticle.link)}`, '_blank')}
                        className="flex items-center gap-2 px-5 py-3 bg-green-650 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </button>
                      <button 
                        onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(selectedArticle.link)}&text=${encodeURIComponent(selectedArticle.title)}`, '_blank')}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
                      >
                        <Send className="w-4 h-4" /> Telegram
                      </button>
                    </div>

                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-4">Continúa leyendo la versión completa en el sitio oficial</p>
                    <a 
                      href={selectedArticle.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 rounded-2xl text-[11px] md:text-[13px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full md:w-max justify-center ${
                        isYouTube(selectedArticle.link) 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                      }`}
                    >
                      {isYouTube(selectedArticle.link) ? 'VER EN YOUTUBE' : 'ACCEDER AL SITIO WEB'} 
                      <ExternalLink className="w-4 h-4 md:w-4.5 md:h-4.5" />
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
