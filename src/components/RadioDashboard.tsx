import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Radio as RadioIcon, Activity } from 'lucide-react';

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

  const filteredRadios = RADIOS.filter(radio => 
    radio.name.toLowerCase().includes(search.toLowerCase()) || 
    radio.city.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    // Pause all other audio elements when one starts playing
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      if (audios[i] !== e.target) {
        audios[i].pause();
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative pb-10">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRadios.map((station, idx) => {
          const noStream = !station.url;
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={station.id}
              className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 transition-all duration-300 ${
                noStream 
                  ? 'bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#222] opacity-70' 
                  : 'bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#151515] shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                    {station.name}
                  </h3>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-gray-500 tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-gray-500" />
                    {station.city}
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                  noStream ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                }`}>
                  {noStream ? 'Sin Enlace' : station.frequency}
                </span>
              </div>

              <div className="mt-2 z-10 flex flex-col gap-2">
                {!noStream ? (
                  <audio 
                    controls 
                    src={station.url} 
                    preload="none"
                    onPlay={handlePlay}
                    className="w-full h-10 outline-none grayscale hover:grayscale-0 transition-all opacity-90 hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Transmisión no disponible</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
