'use client';

import {
    SettingsIcon,
    HeadphonesIcon,
    ZapIcon,
    LayoutIcon,
} from '@/components/Icons';
import { StreamingPlayer, STREAMING_SOURCES } from '@/components/StreamingPlayer';
import type { StreamingSource } from '@/components/StreamingPlayer';
import MediosWikiAppLogo from '@/components/MediosWikiAppLogo';

interface AudioViewProps {
    activeStream: StreamingSource | null;
    setActiveStream: (s: StreamingSource | null) => void;
}

export default function AudioView({ activeStream, setActiveStream }: AudioViewProps) {
    return (
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary text-text-primary">
            <div className="max-w-6xl mx-auto">
                {/* Cabecera Premium */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                            <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
                            Multimedia Center
                        </div>
                        <h1 className="text-5xl font-black text-text-primary tracking-tight mb-4 font-display">
                            Audio & <span className="text-accent-primary">Video</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-lg">
                            Transmisiones en vivo de las mejores radios y canales de televisión locales y nacionales.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex flex-col items-center justify-center w-20 h-20 bg-surface-elevated rounded-3xl shadow-lg border border-accent-primary/10 hover:border-accent-primary/40 transition-all group glass-card">
                            <SettingsIcon className="w-6 h-6 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                            <span className="text-[10px] font-bold text-text-tertiary mt-2">CONFIG</span>
                        </button>
                        <div className="w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-[2rem] shadow-glow-accent flex items-center justify-center transform hover:scale-105 transition-transform">
                            <HeadphonesIcon className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>

                {/* Sección de Radios */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1.5 bg-accent-secondary rounded-full" />
                        <h2 className="text-3xl font-bold text-text-primary tracking-tight">Radios en Vivo</h2>
                        <span className="ml-auto text-xs font-black text-text-tertiary uppercase tracking-widest">{STREAMING_SOURCES.filter(s => s.type === 'radio').length} EMISORAS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {STREAMING_SOURCES.filter(s => s.type === 'radio').map(source => (
                            <button
                                key={source.id}
                                onClick={() => setActiveStream(source)}
                                className="group relative bg-surface-elevated rounded-[2rem] p-6 border border-accent-primary/10 shadow-sm hover:shadow-glow-accent/20 hover:-translate-y-1 transition-all text-left overflow-hidden glass-card"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <ZapIcon className="w-24 h-24 text-accent-secondary transform rotate-12" />
                                </div>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-14 h-14 bg-accent-secondary/10 rounded-2xl flex items-center justify-center text-accent-secondary group-hover:bg-accent-secondary group-hover:text-white transition-all shadow-inner">
                                        <ZapIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-accent-secondary uppercase tracking-widest mb-1">{source.location}</div>
                                        <h3 className="font-bold text-text-primary group-hover:text-accent-secondary transition-colors line-clamp-1">{source.name}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-semibold text-text-tertiary">Stream HD • 128kbps</span>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-surface-primary rounded-xl text-[10px] font-bold shadow-glow-accent opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        <div className="w-1.5 h-1.5 bg-surface-primary rounded-full animate-pulse" />
                                        ESCUCHAR
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sección de TV */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-1.5 bg-accent-primary rounded-full" />
                        <h2 className="text-3xl font-bold text-text-primary tracking-tight">Canales de TV</h2>
                        <span className="ml-auto text-xs font-black text-text-tertiary uppercase tracking-widest">{STREAMING_SOURCES.filter(s => s.type === 'tv').length} CANALES</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {STREAMING_SOURCES.filter(s => s.type === 'tv').map(source => (
                            <button
                                key={source.id}
                                onClick={() => setActiveStream(source)}
                                className="group relative bg-surface-elevated rounded-[2.5rem] p-1 border border-accent-primary/10 shadow-glow-accent/20 overflow-hidden hover:scale-[1.02] transition-all glass-card"
                            >
                                <div className="aspect-video w-full rounded-[2.2rem] overflow-hidden relative border border-accent-primary/5">
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10" />
                                    <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-500">
                                        <div className="w-16 h-16 bg-surface-elevated/40 backdrop-blur-md rounded-full flex items-center justify-center border border-accent-primary/20 shadow-xl">
                                            <div className="w-12 h-12 bg-accent-primary text-surface-primary rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8 z-20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-lg shadow-glow-accent animate-pulse">EN VIVO</span>
                                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">{source.location}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-text-primary tracking-tight">{source.name}</h3>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Panel de Configuración Rápida */}
                <div className="bg-surface-elevated rounded-[3rem] p-10 border border-accent-primary/10 shadow-glow-accent/20 glass-card">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-surface-primary rounded-2xl">
                            <SettingsIcon className="w-6 h-6 text-text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary tracking-tight">Opciones de Reproducción</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Calidad de Audio</label>
                            <div className="space-y-2">
                                {['Baja (64kbps)', 'Media (128kbps)', 'Alta (320kbps)'].map((quality, idx) => (
                                    <button key={quality} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${idx === 1 ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'bg-surface-primary text-text-secondary hover:bg-accent-primary/5'}`}>
                                        {quality}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Reproducción Automática</label>
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-2xl">
                                <span className="text-sm font-bold text-text-secondary">Autoplay</span>
                                <div className="w-12 h-6 bg-accent-primary rounded-full relative flex items-center px-1 shadow-inner">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-md ml-auto" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Modo de Video</label>
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-2xl mb-2">
                                <span className="text-sm font-bold text-text-secondary">Pop-out por defecto</span>
                                <div className="w-12 h-6 bg-surface-elevated/50 rounded-full relative flex items-center px-1">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Datos del Sistema</label>
                            <div className="p-4 bg-surface-primary rounded-2xl border border-accent-primary/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-text-tertiary">VERSION</span>
                                    <span className="text-[10px] font-bold text-accent-primary">2026.1.4</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-text-tertiary">CODEC</span>
                                    <span className="text-[10px] font-bold text-accent-secondary">OPUS/H.264</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer del Media Center */}
                <div className="mt-20 py-12 border-t border-accent-primary/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-[2px] bg-accent-primary/20" />
                        <MediosWikiAppLogo className="w-8 h-8 opacity-20" />
                        <div className="w-8 h-[2px] bg-accent-primary/20" />
                    </div>
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">
                        Premium Media Experience V2
                    </span>
                </div>
            </div>
        </div>
    );
}
