'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShieldAlert, TrendingUp, Users, Map as MapIcon } from 'lucide-react';

// Hotspots de seguridad (Datos basados en análisis estratégico experto)
const securityHotspots = [
  // RÍO GRANDE
  { id: 1, city: 'Río Grande', name: 'Zona Industrial / Parque Ind.', lat: -53.765, lon: -67.705, intensity: 0.8, type: 'Logística/Robo', detail: 'Alta volatilidad en horarios de cambio de turno. Riesgo de robo de carga.' },
  { id: 2, city: 'Río Grande', name: 'Chacra II / IV', lat: -53.778, lon: -67.712, intensity: 0.6, type: 'Conflictividad Social', detail: 'Incidentes de vandalismo y hurtos menores en zonas comerciales.' },
  { id: 3, city: 'Río Grande', name: 'Margen Sur', lat: -53.805, lon: -67.685, intensity: 0.9, type: 'Estabilidad Social', detail: 'Zona crítica de vulnerabilidad. Necesidad de intervención preventiva integral.' },
  
  // USHUAIA
  { id: 4, city: 'Ushuaia', name: 'Zona Centro / Puerto', lat: -54.806, lon: -68.307, intensity: 0.5, type: 'Turismo/Hurto', detail: 'Riesgo de arrebatos y estafas menores durante temporada alta.' },
  { id: 5, city: 'Ushuaia', name: 'Barrio Pipo', lat: -54.825, lon: -68.358, intensity: 0.4, type: 'Propiedad', detail: 'Incremento de intrusiones en viviendas en construcción.' },
  { id: 6, city: 'Ushuaia', name: 'Calle San Martín / Nocturnidad', lat: -54.805, lon: -68.301, intensity: 0.7, type: 'Orden Público', detail: 'Conflictos en zonas de bares y locales nocturnos los fines de semana.' },

  // TOLHUIN
  { id: 7, city: 'Tolhuin', name: 'Ruta 3 - Paso Regional', lat: -54.512, lon: -67.195, intensity: 0.5, type: 'Tránsito/Logística', detail: 'Control de cargas y seguridad vial estratégica.' },
];

const SecurityHeatMap = () => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0c0c0c] border border-[#222] shadow-2xl">
      
      {/* Resumen Táctico Flotante */}
      <div className="absolute top-6 left-6 z-[400] w-80 pointer-events-none">
         <div className="bg-black/90 backdrop-blur-2xl border border-orange-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] pointer-events-auto">
            <div className="flex items-center gap-3 mb-4 border-b border-orange-500/20 pb-3">
               <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
               </div>
               <div className="flex flex-col">
                  <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Mapa de Calor</h3>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight italic text-orange-500/80 underline decoration-orange-500/40 underline-offset-4">Topografía de Riesgos 2026</span>
               </div>
            </div>
            
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Riesgo Promedio TDF</span>
                  <span className="text-xl font-black text-white">64%</span>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] uppercase font-black tracking-tight">
                     <span className="text-orange-500">Rio Grande</span>
                     <span className="text-gray-400 font-bold">Crítico</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-600 w-[78%] shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] uppercase font-black tracking-tight">
                     <span className="text-blue-500">Ushuaia</span>
                     <span className="text-gray-400 font-bold">Moderado</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 w-[45%]"></div>
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    "La prevención eficaz requiere despliegue dinámico en los puntos de calor detectados. El análisis muestra una correlación directa entre zonas industriales y vulnerabilidad periférica."
                </p>
                <div className="mt-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">— Reporte Auditor 30A-EXP</div>
            </div>
         </div>
      </div>

      <MapContainer 
        center={[-54.3, -67.8]} 
        zoom={8} 
        zoomControl={false}
        className="w-full h-full z-0"
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

        { securityHotspots.map(spot => (
          <React.Fragment key={spot.id}>
            {/* Heat Layer Emulation */}
            <Circle 
              center={[spot.lat, spot.lon]}
              radius={3000 * spot.intensity}
              pathOptions={{ 
                color: spot.intensity > 0.7 ? '#ef4444' : spot.intensity > 0.5 ? '#f97316' : '#eab308', 
                fillColor: spot.intensity > 0.7 ? '#ef4444' : spot.intensity > 0.5 ? '#f97316' : '#eab308', 
                fillOpacity: 0.15,
                weight: 0
              }} 
            />
            {/* Focal Point */}
            <CircleMarker
              center={[spot.lat, spot.lon]}
              radius={6}
              pathOptions={{
                color: 'white',
                fillColor: spot.intensity > 0.7 ? '#ef4444' : spot.intensity > 0.5 ? '#f97316' : '#eab308',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2 flex flex-col gap-1 min-w-[200px]">
                  <div className="flex items-center gap-2 border-b pb-1">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    <strong className="text-xs uppercase font-black">{spot.name}</strong>
                  </div>
                  <div className="py-1">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500 uppercase">Nivel de Riesgo:</span>
                        <span className={spot.intensity > 0.7 ? 'text-red-500' : 'text-orange-500'}>{Math.round(spot.intensity * 100)}%</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-200 mt-1 uppercase italic">{spot.type}</div>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{spot.detail}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}

      </MapContainer>

    </div>
  );
};

export default SecurityHeatMap;
