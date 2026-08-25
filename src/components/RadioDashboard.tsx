import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Radio as RadioIcon, 
  Tv, 
  Activity, 
  Plus, 
  Globe, 
  Flag, 
  MapPin, 
  Maximize2, 
  ExternalLink, 
  X, 
  Sparkles, 
  AlertCircle, 
  Edit3, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { LIVE_STREAM_CHANNELS, RADIO_STATIONS } from '../constants';
import { LiveStreamChannel, LiveStreamDivision } from '../types';

interface RadioStation {
  id?: string;
  name: string;
  frequency: string;
  url?: string;
  streamUrl?: string;
  city: string;
}

const LOCAL_STORAGE_KEY = 'wikiapp_custom_live_streams';

// Helper to convert standard video/stream links to iframe embed format
function formatEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Extract src if full iframe tag was pasted
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }

  // Parse YouTube handle channel live stream: youtube.com/@93UNO or youtube.com/@93UNO/live
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch && handleMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=@${handleMatch[1]}`;
  }

  // Parse YouTube watch / shorts / live / short URLs
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  return trimmed;
}

export default function RadioDashboard() {
  const [activeMode, setActiveMode] = useState<'radio' | 'tv'>('radio');
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<LiveStreamDivision | 'todos'>('todos');
  const [selectedCityRadio, setSelectedCityRadio] = useState<string>('todos');
  
  // Channels state (Default + Custom local streams)
  const [channels, setChannels] = useState<LiveStreamChannel[]>(() => {
    // Combine base constants with RadioStation fallback if needed
    return LIVE_STREAM_CHANNELS;
  });

  // Load custom channels from localStorage on client side
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: LiveStreamChannel[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom channels avoiding duplicate IDs
          setChannels(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newCustoms = parsed.filter(c => !existingIds.has(c.id));
            return [...prev, ...newCustoms];
          });
        }
      }
    } catch (e) {
      console.error('Error loading custom streams:', e);
    }
  }, []);

  // Modal states for Fullscreen / Cinema mode and Add Channel
  const [cinemaChannel, setCinemaChannel] = useState<LiveStreamChannel | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  // Form states for adding/editing sources
  const [formName, setFormName] = useState('');
  const [formDivision, setFormDivision] = useState<LiveStreamDivision>('provincial');
  const [formCity, setFormCity] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Handle radio station playback control (only 1 audio at a time)
  const handlePlayAudio = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      if (audios[i] !== e.target) {
        audios[i].pause();
      }
    }
  };

  // Open modal for editing existing channel source
  const openEditModal = (channel: LiveStreamChannel) => {
    setEditingChannelId(channel.id);
    setFormName(channel.name);
    setFormDivision(channel.division);
    setFormCity(channel.cityOrCountry);
    setFormUrl(channel.streamUrl);
    setFormDescription(channel.description || '');
    setShowAddModal(true);
  };

  // Save new or updated channel source
  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingChannelId) {
      // Update channel
      const updated = channels.map(ch => {
        if (ch.id === editingChannelId) {
          return {
            ...ch,
            name: formName.trim(),
            division: formDivision,
            cityOrCountry: formCity.trim() || (formDivision === 'provincial' ? 'Tierra del Fuego' : formDivision === 'nacional' ? 'Argentina' : 'Internacional'),
            streamUrl: formUrl.trim(),
            description: formDescription.trim(),
            isLive: true,
          };
        }
        return ch;
      });
      setChannels(updated);
      saveCustomsToStorage(updated);
      setFormSuccess('Fuente de transmisión actualizada correctamente.');
    } else {
      // Add new channel
      const newChan: LiveStreamChannel = {
        id: `custom-${Date.now()}`,
        name: formName.trim(),
        division: formDivision,
        cityOrCountry: formCity.trim() || (formDivision === 'provincial' ? 'Tierra del Fuego' : formDivision === 'nacional' ? 'Argentina' : 'Internacional'),
        streamUrl: formUrl.trim(),
        type: 'youtube',
        description: formDescription.trim() || 'Canal agregado por el usuario',
        isLive: true,
      };

      const updated = [newChan, ...channels];
      setChannels(updated);
      saveCustomsToStorage(updated);
      setFormSuccess('¡Nueva fuente agregada exitosamente!');
    }

    setTimeout(() => {
      setFormSuccess('');
      setShowAddModal(false);
      resetForm();
    }, 1200);
  };

  const saveCustomsToStorage = (allChannels: LiveStreamChannel[]) => {
    try {
      const customs = allChannels.filter(c => c.id.startsWith('custom-'));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customs));
    } catch (e) {
      console.error('Error saving streams:', e);
    }
  };

  const handleDeleteCustomChannel = (id: string) => {
    const updated = channels.filter(c => c.id !== id);
    setChannels(updated);
    saveCustomsToStorage(updated);
  };

  const resetForm = () => {
    setEditingChannelId(null);
    setFormName('');
    setFormDivision('provincial');
    setFormCity('');
    setFormUrl('');
    setFormDescription('');
  };

  // Filter video channels by Division and Search query
  const filteredTVChannels = channels.filter(ch => {
    const matchesDivision = selectedDivision === 'todos' || ch.division === selectedDivision;
    const matchesSearch = 
      ch.name.toLowerCase().includes(search.toLowerCase()) || 
      ch.cityOrCountry.toLowerCase().includes(search.toLowerCase()) ||
      (ch.description && ch.description.toLowerCase().includes(search.toLowerCase()));
    return matchesDivision && matchesSearch;
  });

  // Filter Radio stations by search query & city filter
  const allRadios = RADIO_STATIONS.map((r, i) => ({
    id: `radio-${i}`,
    name: r.name,
    frequency: r.frequency,
    city: r.city,
    logoUrl: r.logoUrl,
    url: r.streamUrl,
  }));

  const filteredRadios = allRadios.filter(radio => {
    const matchesCity = selectedCityRadio === 'todos' || radio.city.toLowerCase().includes(selectedCityRadio.toLowerCase());
    const matchesSearch = 
      radio.name.toLowerCase().includes(search.toLowerCase()) || 
      radio.city.toLowerCase().includes(search.toLowerCase()) ||
      radio.frequency.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full relative pb-12">
      {/* Header & Main Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center border border-blue-400/30 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              {activeMode === 'tv' ? (
                <Tv className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
              ) : (
                <RadioIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-2">
                Dial Fueguino <span className="text-blue-500 font-extrabold">&</span> Streaming en Vivo
              </h1>
              <span className="text-[10px] md:text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Transmisiones en Vivo (Radio y Video TV)
              </span>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-[#18181b] p-1.5 rounded-2xl border border-slate-300 dark:border-white/10 self-start lg:self-auto shadow-inner">
            <button
              onClick={() => setActiveMode('tv')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
                activeMode === 'tv'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5'
              }`}
            >
              <Tv className="w-4 h-4" />
              Streaming TV
            </button>

            <button
              onClick={() => setActiveMode('radio')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
                activeMode === 'radio'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/5'
              }`}
            >
              <RadioIcon className="w-4 h-4" />
              Diales de Radio
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-white/5">
          {activeMode === 'tv' ? (
            /* Divisions Filter Bar */
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedDivision('todos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedDivision === 'todos'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Todas las Fuentes
              </button>

              <button
                onClick={() => setSelectedDivision('provincial')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedDivision === 'provincial'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Provincial (TDF)
              </button>

              <button
                onClick={() => setSelectedDivision('nacional')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedDivision === 'nacional'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-sky-400" />
                Nacional (Argentina)
              </button>

              <button
                onClick={() => setSelectedDivision('internacional')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedDivision === 'internacional'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Internacional
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCityRadio('todos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedCityRadio === 'todos'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Todas las Emisoras ({allRadios.length})
              </button>

              <button
                onClick={() => setSelectedCityRadio('Ushuaia')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedCityRadio === 'Ushuaia'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Ushuaia
              </button>

              <button
                onClick={() => setSelectedCityRadio('Río Grande')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  selectedCityRadio === 'Río Grande'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-[#202020]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Río Grande
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={activeMode === 'tv' ? "Buscar canal o señal en vivo..." : "Buscar emisora de radio..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* STREAMING TV GRID VIEW */}
      {activeMode === 'tv' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTVChannels.map((channel, idx) => {
            const formattedUrl = formatEmbedUrl(channel.streamUrl);
            const hasSource = Boolean(formattedUrl);
            const isCustom = channel.id.startsWith('custom-');

            const divisionStyles = {
              provincial: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
              nacional: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
              internacional: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
            }[channel.division];

            const divisionLabels = {
              provincial: 'Provincial (TDF)',
              nacional: 'Nacional',
              internacional: 'Internacional',
            }[channel.division];

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={channel.id}
                className="group bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Channel Header Bar */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasSource ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${hasSource ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white truncate">
                      {channel.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${divisionStyles}`}>
                      {divisionLabels}
                    </span>
                  </div>
                </div>

                {/* Stream Video Player Window ("Ventanita") */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {hasSource ? (
                    <iframe
                      src={formattedUrl}
                      title={channel.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="p-6 text-center flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 w-full h-full">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                          Fuente Pendiente de Asignación
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                          Próximamente se agregará la transmisión en vivo oficial.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  {hasSource && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
                      <button
                        onClick={() => setCinemaChannel(channel)}
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-all"
                        title="Abrir en Modo Cine (Pantalla Completa)"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <a
                        href={channel.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-all"
                        title="Abrir fuente original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Channel Footer Metadata */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-[#141417] flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-white/5">
                  <span className="flex items-center gap-1 font-semibold truncate text-[11px]">
                    <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                    {channel.cityOrCountry}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {channel.isLive ? '🔴 Transmitiendo' : 'Señal HD'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AUDIO RADIO DASHBOARD VIEW */}
      {activeMode === 'radio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRadios.map((station, idx) => {
            const noStream = !station.url;
            const isYoutube = station.url?.includes('youtube.com') || station.url?.includes('youtu.be');

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                key={station.id}
                className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
                  noStream 
                    ? 'bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 opacity-70' 
                    : 'bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-[#151518] shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex justify-between items-start z-10 gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {station.logoUrl ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 p-1 flex items-center justify-center">
                        <img 
                          src={station.logoUrl} 
                          alt={station.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0 flex items-center justify-center">
                        <RadioIcon className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <h3 className="font-extrabold text-sm md:text-base tracking-tight text-slate-900 dark:text-white truncate">
                        {station.name}
                      </h3>
                      <span className="text-[10px] uppercase text-slate-500 dark:text-gray-400 tracking-wider flex items-center gap-1 font-semibold truncate">
                        <Activity className="w-3 h-3 text-blue-500 shrink-0" />
                        {station.city}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${
                    noStream ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}>
                    {noStream ? 'Offline' : station.frequency}
                  </span>
                </div>

                <div className="mt-1 z-10 flex flex-col gap-2">
                  {noStream ? (
                    <div className="w-full h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                        Transmisión no disponible
                      </span>
                    </div>
                  ) : isYoutube ? (
                    <a
                      href={station.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Transmisión en YouTube
                    </a>
                  ) : (
                    <audio 
                      controls 
                      src={station.url} 
                      preload="none"
                      onPlay={handlePlayAudio}
                      className="w-full h-10 outline-none grayscale hover:grayscale-0 transition-all opacity-90 hover:opacity-100"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN CINEMA MODAL */}
      <AnimatePresence>
        {cinemaChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="w-full max-w-5xl flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  {cinemaChannel.name}
                </h2>
                <span className="text-xs uppercase font-bold text-slate-400 px-2 py-1 bg-white/10 rounded-md">
                  {cinemaChannel.cityOrCountry}
                </span>
              </div>

              <button
                onClick={() => setCinemaChannel(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src={formatEmbedUrl(cinemaChannel.streamUrl)}
                title={cinemaChannel.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT SOURCE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#141416] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingChannelId ? 'Editar Fuente de Transmisión' : 'Agregar Fuente en Vivo'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Ingresa los datos y el enlace o YouTube del medio que deseas transmitir.
                  </p>
                </div>
              </div>

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveChannel} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre del Canal / Medio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Canal 11 Ushuaia, TN, TV Pública..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1c1c1f] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      División *
                    </label>
                    <select
                      value={formDivision}
                      onChange={(e) => setFormDivision(e.target.value as LiveStreamDivision)}
                      className="w-full bg-slate-50 dark:bg-[#1c1c1f] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="provincial">Provincial (TDF)</option>
                      <option value="nacional">Nacional (Argentina)</option>
                      <option value="internacional">Internacional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Ciudad / Ubicación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ushuaia, Río Grande, CABA..."
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1c1c1f] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    URL de Transmisión o YouTube Link
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: https://youtube.com/watch?v=... o iframe src"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1c1c1f] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 block">
                    Admite enlaces de YouTube en vivo, iFrames o reproductores web.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Descripción / Detalles (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Noticiero provincial edición central..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1c1c1f] border border-slate-300 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                  >
                    {editingChannelId ? 'Guardar Cambios' : 'Agregar Canal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
