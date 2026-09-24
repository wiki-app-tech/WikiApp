'use client';

import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Compass, 
  ExternalLink, 
  Ship, 
  Users, 
  RefreshCw, 
  Info, 
  Calendar,
  Clock,
  Waves
} from 'lucide-react';

interface CruiseSeasonCardProps {
  initialData?: any;
}

export default function CruiseSeasonCard({ initialData }: CruiseSeasonCardProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchCruiseStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/tourism-stats?type=cruises', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.warn('Error fetching cruise stats:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchCruiseStats();
    }
  }, [initialData]);

  if (isLoading || !data) {
    return (
      <div className="w-full min-h-[250px] rounded-3xl bg-slate-900/60 border border-white/10 p-6 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Anchor className="w-8 h-8 text-blue-500 animate-pulse" />
        <span className="text-xs font-mono">Cargando Estadísticas Oficiales de Cruceros...</span>
      </div>
    );
  }

  const { temporada, fuente, urlOficial } = data;

  return (
    <div className="w-full bg-white dark:bg-[#0e0e11] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col gap-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-[2px] shadow-lg shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#121417] rounded-[14px] flex items-center justify-center">
              <Ship className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {temporada.nombre}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                INFUETUR & DPP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Demanda de viajes, buques polares de expedición y turismo bioceánico en el puerto de Ushuaia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchCruiseStats}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 bg-slate-50 dark:bg-white/5 hover:bg-blue-500/10 transition-all shadow-sm"
            title="Actualizar datos oficiales"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <a
            href={urlOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-blue-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            title="Ver sección oficial de Temporada de Cruceros en INFUETUR"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. KPIS GENERALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recaladas Estimadas</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">{temporada.totalRecaladasEstimadas}</span>
          <span className="text-[10px] text-slate-500">Temporada {temporada.periodo}</span>
        </div>
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pasajeros & Tripulantes</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{(temporada.totalPasajerosYTripulantes / 1000).toFixed(1)}K</span>
          <span className="text-[10px] text-slate-500">Tránsito portuario</span>
        </div>
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Perfil Antártico</span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 block mt-1">72.3%</span>
          <span className="text-[10px] text-slate-500">Península Antártica</span>
        </div>
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Muelle Comercial</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">420 m</span>
          <span className="text-[10px] text-slate-500">Doble frente de atraque</span>
        </div>
      </div>

      {/* 3. DESGLOSE DE SEGMENTOS DE CRUCEROS */}
      <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
          Distribución por Tipo de Travesía
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {temporada.distribucionSegmentos.map((seg: any) => (
            <div key={seg.tipo} className="p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#14151a] flex flex-col justify-between gap-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{seg.tipo}</span>
                  <span className="text-xs font-black" style={{ color: seg.color }}>{seg.porcentaje}%</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-snug">
                  {seg.descripcion}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Recaladas:</span>
                <span className="font-bold text-slate-800 dark:text-gray-200">{seg.recaladas}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LISTADO DE BUQUES DESTACADOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
            Embarcaciones & Buques Destacados en la Región
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            Fuente: DPP Ushuaia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {temporada.buquesDestacados.map((ship: any) => (
            <div
              key={ship.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col justify-between gap-3 hover:border-blue-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ship.status === 'En Puerto'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : ship.status === 'Arribando'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}>
                    {ship.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{ship.time}</span>
                </div>

                <h5 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 flex items-center justify-between">
                  <span>{ship.name}</span>
                  <span className="text-xs font-normal">{ship.flag}</span>
                </h5>
                <span className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold block">
                  {ship.type}
                </span>

                {ship.agencyName && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                    Operador: {ship.agencyName}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                <span>{ship.lengthMeters}m · {ship.paxCapacity} pax</span>
                <a
                  href={`https://www.vesselfinder.com/vessels?name=${encodeURIComponent(ship.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline font-bold"
                >
                  <span>Radar AIS</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
