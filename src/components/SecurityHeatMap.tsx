'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, TrendingUp, Map as MapIcon, Sliders, RefreshCw } from 'lucide-react';

interface CrimePoint {
  id: number;
  city: string;
  type: string;
  sub: string;
  lat: number;
  lng: number;
  weight: number;
  desc: string;
}

const SecurityHeatMap = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [crimes, setCrimes] = useState<CrimePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [radiusMultiplier, setRadiusMultiplier] = useState(25);

  // Cargar datos dinámicamente desde el JSON público de la aplicación
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/tierradelfuego_crimes.json');
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setCrimes(data.crimes || []);
        } else {
          console.warn("No se pudo cargar delitos locales o respuesta no es JSON");
        }
      } catch (err) {
        console.error("Error cargando delitos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Coordenadas de las localidades para re-centrar el mapa
  const cityCoords: { [key: string]: { lat: number; lng: number; zoom: number } } = {
    'ALL': { lat: -54.3000, lng: -67.8000, zoom: 8 },
    'Ushuaia': { lat: -54.8019, lng: -68.3029, zoom: 12 },
    'Río Grande': { lat: -53.7850, lng: -67.7000, zoom: 12 },
    'Tolhuin': { lat: -54.5100, lng: -67.1900, zoom: 12 }
  };

  // Filtrar los crímenes según el estado de los controles
  const filteredCrimes = crimes.filter(c => {
    const cityMatch = selectedCity === 'ALL' || c.city === selectedCity;
    const typeMatch = selectedType === 'ALL' || c.type === selectedType;
    return cityMatch && typeMatch;
  });

  const getCrimeColor = (type: string) => {
    if (type === 'Ciberdelito') return '#3b82f6'; // Azul
    if (type === 'Robo/Hurto') return '#ef4444';  // Rojo
    return '#f97316';                             // Naranja / Orden Público
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col min-h-[500px]">
      
      {/* Barra de Filtros Superior */}
      <div className="p-4 flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 gap-3 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-orange-500" />
          <span className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-wider">Mapa de Riesgos Tácticos</span>
          {loading && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin ml-2" />}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          {/* Selector de Ciudad */}
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white dark:bg-[#161616] border border-slate-250 dark:border-white/5 text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none text-slate-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500"
            aria-label="Seleccionar localidad"
          >
            <option value="ALL">Toda la Provincia</option>
            <option value="Ushuaia">Ushuaia</option>
            <option value="Río Grande">Río Grande</option>
            <option value="Tolhuin">Tolhuin</option>
          </select>

          {/* Selector de Categoría */}
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white dark:bg-[#161616] border border-slate-250 dark:border-white/5 text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none text-slate-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500"
            aria-label="Seleccionar tipo de delito"
          >
            <option value="ALL">Todos los Delitos</option>
            <option value="Ciberdelito">Ciberdelitos</option>
            <option value="Robo/Hurto">Robo/Hurto</option>
            <option value="Orden Público">Orden Público</option>
          </select>

          <button 
            onClick={() => setShowSummary(!showSummary)}
            className="px-3 py-1.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 border border-orange-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          >
            {showSummary ? 'Ocultar Panel' : 'Info Táctica'}
          </button>
        </div>
      </div>

      {/* Info Táctica y Resumen de Filtros */}
      {showSummary && (
        <div className="bg-slate-50 dark:bg-black/90 p-5 border-b border-slate-100 dark:border-white/5 z-10 overflow-y-auto max-h-[250px] scrollbar-hide flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
               <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
               <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Resumen Analítico de Hotspots</h3>
               <span className="text-[9px] text-slate-500 dark:text-gray-500 font-bold uppercase">Base de Datos: IPIEC 2025/2026</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
             <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Total Filtro:</span>
                <span className="font-mono text-slate-900 dark:text-white font-black">{filteredCrimes.length} casos</span>
             </div>
             <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Límite Seguridad:</span>
                <span className="font-mono text-slate-500">5000 puntos max.</span>
             </div>
          </div>
          
          {/* Ajustador de Radio en el Componente */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase">
              <span>Radio de Fusión:</span>
              <span className="font-mono text-blue-500">{radiusMultiplier}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="50" 
              value={radiusMultiplier} 
              onChange={(e) => setRadiusMultiplier(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="flex-1 w-full relative z-0 h-[400px]">
        {!loading && (
          <MapContainer 
            center={[cityCoords[selectedCity === 'ALL' ? 'ALL' : selectedCity].lat, cityCoords[selectedCity === 'ALL' ? 'ALL' : selectedCity].lng]} 
            zoom={cityCoords[selectedCity === 'ALL' ? 'ALL' : selectedCity].zoom} 
            zoomControl={false}
            className="w-full h-full z-0"
            key={`${selectedCity}-${selectedType}`} // Forzar re-render para centrar
          >
            <ZoomControl position="bottomright" />
            
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Visión Táctica (Gris)">
                 <TileLayer
                   attribution='&copy; CARTO'
                   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                 />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satélite Operativo">
                 <TileLayer
                   attribution='Esri'
                   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                 />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Capa de calor emulada con círculos concéntricos translúcidos */}
            {filteredCrimes.map(spot => (
              <React.Fragment key={spot.id}>
                <Circle 
                  center={[spot.lat, spot.lng]}
                  radius={120 * radiusMultiplier * spot.weight}
                  pathOptions={{ 
                    color: getCrimeColor(spot.type),
                    fillColor: getCrimeColor(spot.type),
                    fillOpacity: 0.08,
                    weight: 0
                  }} 
                />
                
                {/* Marcadores de Foco */}
                <CircleMarker
                  center={[spot.lat, spot.lng]}
                  radius={5}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: getCrimeColor(spot.type),
                    fillOpacity: 1,
                    weight: 1.5
                  }}
                >
                  <Popup>
                    <div className="p-1 flex flex-col gap-1 min-w-[180px] font-sans">
                      <div className="flex items-center gap-1.5 border-b pb-1 border-slate-200 dark:border-white/10">
                        <ShieldAlert className="w-3.5 h-3.5" style={{ color: getCrimeColor(spot.type) }} />
                        <strong className="text-[10px] uppercase font-black text-slate-800 dark:text-white">{spot.type}</strong>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-gray-350 mt-1 leading-normal">
                        <span className="font-bold block text-slate-800 dark:text-white text-[11px] mb-0.5">{spot.sub}</span>
                        <span>{spot.desc}</span>
                        <div className="flex justify-between mt-1.5 pt-1 border-t border-slate-100 dark:border-white/5 font-mono text-[9px]">
                          <span>Ciudad: {spot.city}</span>
                          <span className="font-bold" style={{ color: getCrimeColor(spot.type) }}>{(spot.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}

          </MapContainer>
        )}
      </div>

    </div>
  );
};

export default SecurityHeatMap;
