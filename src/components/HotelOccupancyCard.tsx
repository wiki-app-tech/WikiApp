'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Calendar, 
  TrendingUp, 
  Users, 
  Bed, 
  Compass, 
  Sparkles, 
  Info, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Layers,
  MapPin,
  Clock
} from 'lucide-react';

interface HotelOccupancyCardProps {
  initialData?: any;
  onRefresh?: () => void;
}

export default function HotelOccupancyCard({ initialData, onRefresh }: HotelOccupancyCardProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [activeTab, setActiveTab] = useState<'year' | 'sixMonths' | 'threeMonths' | 'fsl'>('fsl');
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('Hoy');

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch('/api/tourism-stats?type=hotel', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setLastSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.warn('Error fetching hotel stats:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchStats(false);
    }
  }, [initialData]);

  if (isLoading || !data) {
    return (
      <div className="w-full min-h-[300px] rounded-3xl bg-slate-900/60 border border-white/10 p-6 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Building2 className="w-8 h-8 text-blue-500 animate-pulse" />
        <span className="text-xs font-mono">Cargando Estadísticas de Ocupación Hotelera Fueguina...</span>
      </div>
    );
  }

  const { ultimoAno, ultimos6Meses, ultimos3Meses, finesDeSemanaLargos, methodologyNote, metadata } = data;

  return (
    <div className="w-full bg-white dark:bg-[#0e0e11] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col gap-5">
      {/* 1. HEADER DE LA TARJETA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#121417] rounded-[14px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Ocupación Hotelera de Tierra del Fuego
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                EOH · IPIEC · INFUETUR
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Monitoreo estadístico unificado de plazas, pernoctaciones y fines de semana largos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 bg-slate-50 dark:bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all shadow-sm active:scale-95"
            title="Sincronizar con reportes oficiales"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>

          <a
            href="https://infuetur.gob.ar/estadistica/ocupacion_hotelera/eoh"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-blue-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            title="Ver informe oficial en INFUETUR"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. PESTAÑAS DE VISUALIZACIÓN SOLICITADAS POR EL USUARIO */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('fsl')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'fsl'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fines de Semana Largos</span>
        </button>

        <button
          onClick={() => setActiveTab('threeMonths')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'threeMonths'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Últimos 3 Meses</span>
        </button>

        <button
          onClick={() => setActiveTab('sixMonths')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sixMonths'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Últimos 6 Meses</span>
        </button>

        <button
          onClick={() => setActiveTab('year')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'year'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Último Año</span>
        </button>
      </div>

      {/* 3. CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
      <AnimatePresence mode="wait">
        {/* VISTA 1: FINES DE SEMANA LARGOS (FSL) */}
        {activeTab === 'fsl' && (
          <motion.div
            key="tab-fsl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4"
          >
            {/* NOTA METODOLÓGICA TEXTUAL SOLICITADA POR EL USUARIO */}
            <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Metodología Oficial de Sondeo Previo (INFUETUR & Municipios)
                </span>
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed italic">
                  &ldquo;{methodologyNote}&rdquo;
                </p>
              </div>
            </div>

            {/* TABLA Y CARDS DE COMPARACIÓN FSL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {finesDeSemanaLargos.map((fsl: any, index: number) => {
                const isLatest = index === 0;
                return (
                  <div
                    key={fsl.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isLatest
                        ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/40 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-mono">
                          {fsl.fecha}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white">
                            Más Reciente
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        {fsl.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-snug">
                        {fsl.prevision}
                      </p>
                    </div>

                    {/* BARRAS DE OCUPACIÓN POR LOCALIDAD */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-300">Ushuaia</span>
                        <span className="text-blue-600 dark:text-blue-400 tabular-nums">{fsl.ocupacionProyectada.ushuaia}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${fsl.ocupacionProyectada.ushuaia}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-300">Tolhuin</span>
                        <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">{fsl.ocupacionProyectada.tolhuin}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${fsl.ocupacionProyectada.tolhuin}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-gray-300">Río Grande</span>
                        <span className="text-slate-600 dark:text-gray-400 tabular-nums">{fsl.ocupacionProyectada.rioGrande}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full transition-all duration-500"
                          style={{ width: `${fsl.ocupacionProyectada.rioGrande}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-black uppercase pt-1 text-slate-800 dark:text-white">
                        <span>Promedio Provincial</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{fsl.ocupacionProyectada.provincial}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISTA 2: ÚLTIMOS 3 MESES (TRIMESTRE) */}
        {activeTab === 'threeMonths' && (
          <motion.div
            key="tab-3m"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Promedio Trimestral</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{ultimos3Meses.tasaPromedioTrimestre}%</span>
                <span className="text-[10px] text-slate-500">{ultimos3Meses.periodo}</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ushuaia</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ultimos3Meses.ushuaiaPromedio}%</span>
                <span className="text-[10px] text-slate-500">Temporada alta de nieve</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tolhuin</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ultimos3Meses.tolhuinPromedio}%</span>
                <span className="text-[10px] text-slate-500">Cabañas & Naturaleza</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Río Grande</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ultimos3Meses.rioGrandePromedio}%</span>
                <span className="text-[10px] text-slate-500">Corporativo & Pesca</span>
              </div>
            </div>

            {/* ORIGEN DE VIAJEROS */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Composición de la Demanda Turística (Residentes vs Extranjeros)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {ultimos3Meses.plazasOcupadasTrimestre.toLocaleString('es-AR')} plazas ocupadas
                </span>
              </div>

              <div className="space-y-2">
                {ultimos3Meses.principalesMercados.map((m: any) => (
                  <div key={m.pais} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-gray-300">{m.pais}</span>
                      <span className="font-black text-blue-600 dark:text-blue-400">{m.porcentaje}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${m.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VISTA 3: ÚLTIMOS 6 MESES (SERIE HISTÓRICA) */}
        {activeTab === 'sixMonths' && (
          <motion.div
            key="tab-6m"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase text-[10px] font-black">
                    <th className="py-2.5 px-3">Mes</th>
                    <th className="py-2.5 px-3">Provincial</th>
                    <th className="py-2.5 px-3">Ushuaia</th>
                    <th className="py-2.5 px-3">Tolhuin</th>
                    <th className="py-2.5 px-3">Río Grande</th>
                    <th className="py-2.5 px-3">Pernoctaciones</th>
                    <th className="py-2.5 px-3">Var. Interanual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                  {ultimos6Meses.map((m: any) => (
                    <tr key={m.mes} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white">
                        {m.mes}
                        <span className="block text-[10px] font-normal text-slate-400 font-sans">{m.temporada}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">{m.tasaProvincial}%</td>
                      <td className="py-3 px-3">{m.ushuaia}%</td>
                      <td className="py-3 px-3">{m.tolhuin}%</td>
                      <td className="py-3 px-3">{m.rioGrande}%</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-gray-300">{m.pernoctaciones.toLocaleString('es-AR')}</td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">{m.variacionInteranual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* VISTA 4: ÚLTIMO AÑO CONSOLIDADO */}
        {activeTab === 'year' && (
          <motion.div
            key="tab-year"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ocupación Plazas</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">{ultimoAno.tasaOcupacionProvincial}%</span>
                <span className="text-[10px] text-slate-500">{ultimoAno.periodo}</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pernoctaciones Totales</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{(ultimoAno.pernoctacionesTotales / 1000000).toFixed(2)}M</span>
                <span className="text-[10px] text-slate-500">Noches de alojamiento</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Viajeros Hospedados</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">{(ultimoAno.viajerosHospedadosTotales / 1000).toFixed(0)}K</span>
                <span className="text-[10px] text-slate-500">Turistas registrados</span>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estadía Media</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">{ultimoAno.estadiaMediaNoches}</span>
                <span className="text-[10px] text-slate-500">Noches por viajero</span>
              </div>
            </div>

            {/* DESGLOSE POR LAS 3 LOCALIDADES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(ultimoAno.desgloseLocalidad).map((loc: any) => (
                <div key={loc.nombre} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{loc.nombre}</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{loc.ocupacionPlazas}%</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Plazas disponibles:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{loc.plazasDisponibles.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pernoctaciones:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{loc.pernoctaciones.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estadía media:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{loc.estadiaMedia} noches</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FOOTER CON CITAS Y METADATOS */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 dark:text-gray-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Base unificada oficial: INFUETUR & IPIEC</span>
        </div>
        <span>Última sincronización: {lastSync}</span>
      </div>
    </div>
  );
}
