import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Search, Volume2, VolumeX, Radio as RadioIcon, Activity } from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  url: string;
  city: string;
}

const RADIOS: RadioStation[] = [
  { id: 'provincia', name: 'Radio Provincia', frequency: '99.9', city: 'Ushuaia', url: 'http://158.69.225.155:8041/live' },
  { id: 'fmfuego', name: 'FM Fuego', frequency: '90.1', city: 'Río Grande', url: 'https://media.siglocero.net:8004/stream' },
  { id: 'siglo', name: 'Estación del Siglo', frequency: '105.3', city: 'Río Grande', url: 'http://streamall.alsolnet.com/estaciondelsigloaudio' },
  { id: 'airelibre', name: 'Aire Libre FM', frequency: '96.3', city: 'Río Grande', url: 'https://cdn.instream.audio:9037/stream' },
  { id: 'masters', name: "FM Master's", frequency: '107.3', city: 'Ushuaia', url: 'https://streamingradiolinks.xyz/8130' },
  { id: 'fueguina', name: 'Radio Fueguina', frequency: '97.3', city: 'Río Grande', url: 'https://streamlky.alsolnet.com/radiofueguina' },
  { id: 'lra24', name: 'LRA 24 (Nacional)', frequency: 'AM 640', city: 'Río Grande', url: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad24' },
  { id: 'cadenafm', name: 'Cadena FM', frequency: 'Online', city: 'Tierra del Fuego', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO3.mp3?dist=onlineradiobox' },
  { id: 'infinito', name: 'Infinito 911', frequency: 'Online', city: 'Tierra del Fuego', url: 'https://stream.radioinfo.ar/5752/stream/' },
  { id: 'espectaculo', name: 'Espectáculo', frequency: '93.1', city: 'Ushuaia', url: 'https://emisorasdigitales2.com:8058/stream' },
  { id: 'stylofm', name: 'Stylo FM', frequency: 'Online', city: 'Tierra del Fuego', url: 'https://cdn.instream.audio/:9272/stream' },
  
  // Pending direct streams
  { id: 'argentinaushuaia', name: 'Radio Argentina', frequency: 'Online', city: 'Ushuaia', url: '' },
  { id: 'fmushuaia', name: 'FM Ushuaia', frequency: 'Online', city: 'Ushuaia', url: '' },
  { id: 'fmcentro', name: 'Radio FM Centro', frequency: 'Online', city: 'Tierra del Fuego', url: '' },
  { id: 'latecno', name: 'La Tecno', frequency: 'Online', city: 'Tierra del Fuego', url: '' },
  { id: 'publica', name: 'Pública Fueguina', frequency: 'Online', city: 'Tierra del Fuego', url: '' },
];

export default function RadioDashboard() {
  const [search, setSearch] = useState('');
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredRadios = RADIOS.filter(radio => 
    radio.name.toLowerCase().includes(search.toLowerCase()) || 
    radio.city.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error("Audio playback error");
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handleStationClick = (station: RadioStation) => {
    if (!station.url) return; // Ignore if no stream

    if (currentStation?.id === station.id) {
      // Toggle play/pause for same station
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    } else {
      // Change station
      setCurrentStation(station);
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex flex-col h-full relative pb-24">
      {/* Header & Search */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <RadioIcon className="w-7 h-7 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Dial Fueguino</h1>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] flex items-center gap-1 mt-1">
               <Activity className="w-3 h-3" /> Transmisión en Vivo
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar emisora o ciudad..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-800 dark:text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#151515] transition-all shadow-inner"
          />
        </div>
      </motion.div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRadios.map((station, idx) => {
          const isSelected = currentStation?.id === station.id;
          const noStream = !station.url;
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={station.id}
              onClick={() => handleStationClick(station)}
              className={`relative overflow-hidden rounded-3xl p-5 flex flex-col justify-between h-40 transition-all duration-300 ${
                noStream 
                  ? 'bg-white dark:bg-[#111] border border-slate-300 dark:border-[#222] opacity-70 cursor-not-allowed' 
                  : isSelected 
                    ? 'bg-gradient-to-br from-blue-900/40 to-[#111] border border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)] cursor-pointer' 
                    : 'bg-white dark:bg-[#111] border border-slate-300 dark:border-[#222] hover:border-white/20 hover:bg-[#151515] cursor-pointer'
              }`}
            >
              {/* Background subtle decoration */}
              {isSelected && (
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              )}

              <div className="flex justify-between items-start z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  noStream ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                }`}>
                  {noStream ? 'Sin Enlace' : station.frequency}
                </span>
                
                {!noStream && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-blue-500 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                  }`}>
                    {isSelected && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </div>
                )}
              </div>

              <div className="flex flex-col z-10">
                <h3 className={`font-black text-lg tracking-tight ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-gray-200'}`}>
                  {station.name}
                </h3>
                <span className="text-[10px] uppercase text-slate-500 dark:text-gray-500 tracking-wider flex items-center gap-1 mt-1">
                  <Activity className={`w-3 h-3 ${isSelected && isPlaying ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`} />
                  {station.city}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Global Audio Player Bar */}
      {currentStation && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] bg-white dark:bg-[#0c0c0c]/90 backdrop-blur-3xl border border-slate-300 dark:border-white/10 p-4 rounded-3xl flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 relative">
              <RadioIcon className="w-5 h-5 text-blue-500" />
              {isPlaying && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                 </span>
              )}
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Transmitiendo</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{currentStation.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleStationClick(currentStation)}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            {/* Visualizer bars */}
            <div className="flex items-end gap-1 h-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                  style={{ height: isPlaying ? `${Math.random() * 100}%` : '4px' }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
