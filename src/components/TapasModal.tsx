'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Globe, Flag, Map } from 'lucide-react';

interface TapasItem {
  id: string;
  name: string;
  category: 'internacionales' | 'nacionales' | 'provinciales';
  url: string;
  coverUrl: string;
  countryOrRegion: string;
  date: string;
}

interface TapasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TapasModal({ isOpen, onClose }: TapasModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    internacionales: TapasItem[];
    nacionales: TapasItem[];
    provinciales: TapasItem[];
  }>({ internacionales: [], nacionales: [], provinciales: [] });

  const [activeCategory, setActiveCategory] = useState<'internacionales' | 'nacionales' | 'provinciales'>('internacionales');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  
  // Zoom & Pan state for the detail viewer
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Fetch tapas data
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/tapas')
      .then(res => res.json())
      .then(json => {
        if (json && !json.error) {
          setData(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tapas:', err);
        setLoading(false);
      });
  }, [isOpen]);

  const currentList = data[activeCategory] || [];
  const selectedItem = selectedItemIndex !== null ? currentList[selectedItemIndex] : null;

  // Reset zoom, pan & inputs when switching selected newspaper
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHeadline('');
    setSummary('');
  }, [selectedItemIndex, activeCategory]);

  // Keyboard navigation & zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemIndex !== null) {
        if (e.key === 'ArrowRight') {
          setSelectedItemIndex(prev => (prev !== null && prev < currentList.length - 1) ? prev + 1 : 0);
        } else if (e.key === 'ArrowLeft') {
          setSelectedItemIndex(prev => (prev !== null && prev > 0) ? prev - 1 : currentList.length - 1);
        } else if (e.key === 'Escape') {
          setSelectedItemIndex(null);
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-') {
          handleZoomOut();
        }
      } else {
        if (e.key === 'Escape') {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedItemIndex, currentList]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const nextZoom = Math.max(prev - 0.25, 1);
      if (nextZoom === 1) setPan({ x: 0, y: 0 }); // Center if zoom is back to 1
      return nextZoom;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch pan logic for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double click to toggle zoom
  const handleDoubleClick = () => {
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2);
    }
  };

  // Helper to trigger direct image download
  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  // Helper to share to Telegram and WhatsApp
  const handleShare = async (platform: 'whatsapp' | 'telegram') => {
    if (!selectedItem) return;

    const categoryLabel = 
      selectedItem.category === 'provinciales' ? 'Provincial (Tierra del Fuego)' :
      selectedItem.category === 'nacionales' ? 'Nacional (Argentina)' : 'Internacional';

    const textParts = [
      `📰 *${selectedItem.name.toUpperCase()}*`,
      `📅 Fecha: ${selectedItem.date}`,
      `📍 Sección: ${categoryLabel}`,
      `\n🔥 *TITULAR:* ${headline || 'Tapa del día'}`,
    ];
    if (summary) {
      textParts.push(`📝 _${summary}_`);
    }
    
    const shareText = textParts.join('\n');

    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(selectedItem.coverUrl);
        const blob = await response.blob();
        const file = new File([blob], `${selectedItem.id}-tapa.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Tapa de ${selectedItem.name}`,
            text: shareText,
          });
          return;
        }
      } catch (err) {
        console.warn('Native share failed or aborted', err);
      }
    }

    const encodedText = encodeURIComponent(shareText + `\n\nVer portada: ${selectedItem.coverUrl}`);
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(selectedItem.coverUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // Helper to quick share directly from a carousel card
  const handleQuickShare = async (item: TapasItem, platform: 'whatsapp' | 'telegram') => {
    const userHeadline = prompt(`Ingrese el titular principal de ${item.name} para compartir (opcional):`) || '';
    const userSummary = prompt(`Ingrese una frase resumen o comentario (opcional):`) || '';

    const categoryLabel = 
      item.category === 'provinciales' ? 'Provincial (Tierra del Fuego)' :
      item.category === 'nacionales' ? 'Nacional (Argentina)' : 'Internacional';

    const textParts = [
      `📰 *${item.name.toUpperCase()}*`,
      `📅 Fecha: ${item.date}`,
      `📍 Sección: ${categoryLabel}`,
      `\n🔥 *TITULAR:* ${userHeadline || 'Tapa del día'}`,
    ];
    if (userSummary) {
      textParts.push(`📝 _${userSummary}_`);
    }
    
    const shareText = textParts.join('\n');

    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(item.coverUrl);
        const blob = await response.blob();
        const file = new File([blob], `${item.id}-tapa.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Tapa de ${item.name}`,
            text: shareText,
          });
          return;
        }
      } catch (err) {
        console.warn('Native share failed or aborted', err);
      }
    }

    const encodedText = encodeURIComponent(shareText + `\n\nVer portada: ${item.coverUrl}`);
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(item.coverUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 dark:bg-black/95 backdrop-blur-xl text-white select-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 border-b border-white/10 bg-black/40 backdrop-blur-md z-10 shrink-0 safe-top">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                <Globe className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider leading-none">Tapas de Diarios</h2>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">Portadas del Día</span>
              </div>
              {/* Close Button — mobile: top right */}
              <button
                onClick={onClose}
                className="ml-auto sm:hidden p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full border border-white/5 transition-all"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Category tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 flex-1 sm:flex-initial">
                {[
                  { id: 'internacionales', label: 'Internacional', shortLabel: 'INT', icon: Globe },
                  { id: 'nacionales', label: 'Nacional', shortLabel: 'NAC', icon: Flag },
                  { id: 'provinciales', label: 'Provincial', shortLabel: 'PROV', icon: Map }
                ].map(cat => {
                  const Icon = cat.icon;
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id as any);
                        setSelectedItemIndex(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase transition-all flex-1 sm:flex-initial ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden sm:inline">{cat.label}</span>
                      <span className="sm:hidden">{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Close Button — desktop */}
              <button
                onClick={onClose}
                className="hidden sm:flex p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full border border-white/5 transition-all"
                title="Cerrar Portadas (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-3 md:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Escaneando Kioskos y Portales...</h3>
                  <p className="text-xs text-gray-500 mt-1">Extrayendo las últimas ediciones impresas</p>
                </div>
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-gray-400 text-center py-10">
                <p className="text-sm">No se encontraron tapas disponibles.</p>
              </div>
            ) : (
              /* Covers Carousel */
              <div className="w-full h-full max-w-[1400px] flex items-center justify-center relative">
                
                {/* Arrow buttons for carousel layout (when not looking in details) */}
                {selectedItemIndex === null && (
                  <div className="hidden md:flex w-full items-center justify-between absolute z-20 pointer-events-none px-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('tapas-carousel');
                        if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                      }}
                      className="p-3 md:p-4 bg-black/60 hover:bg-blue-600 text-white rounded-full border border-white/10 hover:border-blue-500 shadow-2xl transition-all pointer-events-auto"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('tapas-carousel');
                        if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                      }}
                      className="p-3 md:p-4 bg-black/60 hover:bg-blue-600 text-white rounded-full border border-white/10 hover:border-blue-500 shadow-2xl transition-all pointer-events-auto"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                )}

                {selectedItemIndex === null ? (
                  /* Cards Carousel Container */
                  <div
                    id="tapas-carousel"
                    className="w-full flex gap-4 md:gap-6 overflow-x-auto py-6 md:py-10 px-4 md:px-8 scroll-smooth snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {currentList.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedItemIndex(idx)}
                        className="flex-shrink-0 w-52 sm:w-60 md:w-72 bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 snap-center transition-all group flex flex-col press-effect"
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-black relative">
                          <img
                            src={item.coverUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                          
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider text-blue-400">
                            {item.countryOrRegion}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-grow gap-2" onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.share-btn')) {
                            e.stopPropagation();
                          }
                        }}>
                          <div>
                            <h3 className="text-sm font-black text-white leading-tight group-hover:text-blue-400 transition-colors uppercase">
                              {item.name}
                            </h3>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 block">
                              Edición: {item.date}
                            </span>
                          </div>

                          <div className="flex gap-1.5 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickShare(item, 'whatsapp');
                              }}
                              className="share-btn flex-1 py-1.5 bg-emerald-600/90 hover:bg-emerald-550 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickShare(item, 'telegram');
                              }}
                              className="share-btn flex-1 py-1.5 bg-sky-600/90 hover:bg-sky-550 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center"
                            >
                              Telegram
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Immersive Lightbox detail view with zoom controls */
                  <div className="w-full h-full flex flex-col lg:flex-row gap-4 md:gap-6 relative overflow-y-auto lg:overflow-hidden">
                    
                    {/* Left Panel: Big Image Viewer with Pan & Zoom */}
                    <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden relative flex items-center justify-center min-h-[280px] md:min-h-[400px]">
                      
                      {/* Navigate Left */}
                      <button
                        onClick={() => setSelectedItemIndex(idx => (idx !== null && idx > 0) ? idx - 1 : currentList.length - 1)}
                        className="absolute left-4 z-20 p-3 bg-black/60 hover:bg-blue-600 text-white rounded-full border border-white/10 hover:border-blue-500 shadow-xl transition-all"
                        title="Anterior (Flechita Izquierda)"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Navigate Right */}
                      <button
                        onClick={() => setSelectedItemIndex(idx => (idx !== null && idx < currentList.length - 1) ? idx + 1 : 0)}
                        className="absolute right-4 z-20 p-3 bg-black/60 hover:bg-blue-600 text-white rounded-full border border-white/10 hover:border-blue-500 shadow-xl transition-all"
                        title="Siguiente (Flechita Derecha)"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Zoom Controls Overlay */}
                      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 md:gap-1.5 bg-black/80 backdrop-blur-xl border border-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-full shadow-2xl">
                        <button
                          onClick={handleZoomOut}
                          disabled={zoom <= 1}
                          className="p-1.5 hover:bg-white/10 text-white disabled:text-gray-600 rounded-lg transition-colors"
                          title="Zoom Menos (-)"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black font-mono w-12 text-center text-blue-400">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={handleZoomIn}
                          disabled={zoom >= 4}
                          className="p-1.5 hover:bg-white/10 text-white disabled:text-gray-600 rounded-lg transition-colors"
                          title="Zoom Mas (+)"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                          onClick={handleResetZoom}
                          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                          className="p-1.5 hover:bg-white/10 text-white disabled:text-gray-600 rounded-lg transition-colors"
                          title="Resetear Vista"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cover Viewer Window */}
                      <div 
                        className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden relative"
                        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <motion.img
                          ref={imageRef}
                          src={selectedItem?.coverUrl}
                          alt={selectedItem?.name}
                          className="max-w-full max-h-[55vh] md:max-h-[80vh] object-contain shadow-2xl select-none"
                          style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                          }}
                          onDoubleClick={handleDoubleClick}
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Right Panel: Information & Controls */}
                    <div className="w-full lg:w-72 xl:w-80 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between shrink-0 shadow-2xl">
                      <div className="space-y-6">
                        {/* Newspaper Metadata */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-blue-500/20">
                              {selectedItem?.countryOrRegion}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              {selectedItem?.category}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-black mt-2 leading-tight uppercase text-white">
                            {selectedItem?.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Edición del {selectedItem?.date}
                          </p>
                        </div>

                        {/* Compartir Portada */}
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-3">
                          <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Compartir Portada</span>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Titular Principal</label>
                            <input 
                              type="text" 
                              value={headline} 
                              onChange={(e) => setHeadline(e.target.value)} 
                              placeholder="Titular destacado..." 
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Breve Frase / Comentario</label>
                            <textarea 
                              value={summary} 
                              onChange={(e) => setSummary(e.target.value)} 
                              placeholder="Breve comentario..." 
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => handleShare('whatsapp')}
                              className="py-2 bg-emerald-600 hover:bg-emerald-550 active:scale-95 transition-all text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleShare('telegram')}
                              className="py-2 bg-sky-600 hover:bg-sky-550 active:scale-95 transition-all text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                            >
                              Telegram
                            </button>
                          </div>
                        </div>

                        {/* Reading Advice */}
                        <div className="bg-white/5 border border-white/5 p-3 md:p-4 rounded-2xl flex flex-col gap-1.5 hidden md:flex">
                          <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Modo Lectura Activo</span>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Arrastre para desplazarse cuando el zoom esté activo.
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-4 md:pt-6 border-t border-white/10">
                        <button
                          onClick={() => handleDownload(selectedItem?.coverUrl || '', `${selectedItem?.id}-tapa-${selectedItem?.date.replace(/\//g, '-')}.jpg`)}
                          className="flex-1 py-2.5 md:py-3 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </button>
                        
                        <a
                          href={selectedItem?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Sitio Web</span>
                        </a>

                        <button
                          onClick={() => setSelectedItemIndex(null)}
                          className="flex-1 py-2.5 md:py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Volver
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
