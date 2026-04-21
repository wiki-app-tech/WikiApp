import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, User, Bell, Plus, Home } from 'lucide-react';

const GooeyMobileUI = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden">
      {/* Definición del Filtro SVG Líquido Oculto */}
      <svg width="0" height="0" className="absolute hidden">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 20 -8"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>

      {/* Header Discreto */}
      <header className="flex justify-between items-center px-6 pt-12 pb-6">
        <div>
          <h2 className="text-slate-400 text-sm font-medium">Buenos días,</h2>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-100">Alex Designer</h1>
        </div>
        <button className="relative rounded-full overflow-hidden w-12 h-12 border-2 border-slate-700 hover:border-cyan-400 transition-colors">
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=0ea5e9" 
            alt="User Avatar" 
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Área de Contenido - Tarjeta Central Soft-Edges */}
      <main className="flex-1 px-6 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="bg-cyan-500/10 p-3 rounded-2xl">
              <Compass className="text-cyan-400 w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-700 rounded-full text-slate-300">
              Próximo objetivo
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-100 mb-2">Diseñar Interacción Líquida</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            La física orgánica y fluida atrae la atención del usuario y proporciona un feedback visual extraordinario.
          </p>

          <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-right text-slate-400 font-medium">75% Completado</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <div className="flex-1 border-b border-slate-700/50 pb-2">
                  <p className="text-sm text-slate-200">Revisión de componentes</p>
                  <p className="text-xs text-slate-500">Hace {i * 2} horas</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer Navigation translúcido */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/60 backdrop-blur-xl border-t border-slate-800/60 pb-safe z-40">
        <div className="flex justify-around items-center h-full px-6 max-w-md mx-auto">
          {[
            { id: 'home', icon: Home },
            { id: 'explore', icon: Compass },
            { id: 'space', icon: null }, // Placeholder para el FAB
            { id: 'alerts', icon: Bell },
            { id: 'profile', icon: User }
          ].map((item, index) => {
            if (!item.icon) return <div key={index} className="w-16" />; // Espacio central
            
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative p-2 flex flex-col items-center gap-1 group"
              >
                <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* FAB Central con Efecto Gooey en su propio container absoluto para overlapear */}
      <div 
        className="fixed bottom-8 left-1/2 -top-10 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div 
          className="relative w-32 h-32 flex items-center justify-center"
          style={{ filter: "url(#goo)" }}
        >
          {/* Gotas palpitantes de fondo que provocan el efecto líquido al fundirse.
              Usamos `bg-cyan-400` que matchea el botón central */}
          <motion.div
            animate={{ 
              scale: [1, 1.25, 1],
              x: [0, -10, 0],
              y: [0, 5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-cyan-400 w-14 h-14 opacity-90 blur-[1px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 12, 0],
              y: [0, -8, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute rounded-full bg-cyan-400 w-12 h-12 opacity-90 blur-[1px]"
          />

          {/* El Botón Real Clickable dentro the container del Gooey (pointer-events-auto re-habilita interacciones) */}
          <motion.button
            className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.75 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <Plus className="w-8 h-8 text-white stroke-[2.5]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default GooeyMobileUI;
