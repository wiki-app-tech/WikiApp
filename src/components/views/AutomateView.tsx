'use client';

import {
    ZapIcon,
    FacebookIcon,
    YoutubeIcon,
    RedditIcon,
    TelegramIcon,
    PodcastIcon,
    Share2Icon,
} from '@/components/Icons';
import MediosWikiAppLogo from '@/components/MediosWikiAppLogo';

export default function AutomateView() {
    return (
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
            <div className="max-w-6xl mx-auto">
                {/* Cabecera Premium */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-accent-primary/10">
                            <ZapIcon className="w-3 h-3 animate-pulse" />
                            Automation Suite
                        </div>
                        <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-4 font-display">
                            Monitor <span className="text-accent-primary">& Sync</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-lg">
                            Conecta tus redes sociales, sincroniza YouTube y gestiona tus podcasts favoritos en un hub centralizado.
                        </p>
                    </div>
                    <div className="w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-[2rem] shadow-glow-accent flex items-center justify-center transform hover:scale-105 transition-all">
                        <ZapIcon className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Grid de Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Monitor Social Media */}
                    <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-accent-primary/10 text-accent-primary rounded-2xl">
                                <FacebookIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Social Monitor</h3>
                        </div>
                        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                            Monitorea páginas de Facebook, canales de Telegram, Mastodon y feeds de Reddit sin salir de la app.
                        </p>
                        <div className="space-y-3 mt-auto">
                            <div className="flex items-center justify-between p-3 bg-surface-primary rounded-xl border border-accent-primary/10">
                                <div className="flex items-center gap-2">
                                    <TelegramIcon className="w-4 h-4 text-accent-primary" />
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-tighter">Canales Activos</span>
                                </div>
                                <span className="text-xs font-black text-accent-primary">12</span>
                            </div>
                            <button className="w-full py-4 bg-accent-primary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent">
                                Añadir Monitor
                            </button>
                        </div>
                    </div>

                    {/* Sync Video Services */}
                    <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-accent-secondary/10 text-accent-secondary rounded-2xl">
                                <YoutubeIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Video Sync</h3>
                        </div>
                        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                            Sincroniza tus suscripciones de YouTube y convierte canales en feeds automatizados de noticias.
                        </p>
                        <div className="p-6 bg-surface-primary rounded-3xl border border-accent-primary/10 mb-6 flex items-center gap-4">
                            <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center shadow-inner border border-accent-primary/5">
                                <YoutubeIcon className="w-5 h-5 text-accent-secondary" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Estado Canal</div>
                                <div className="text-xs font-bold text-text-primary">Sincronizado</div>
                            </div>
                        </div>
                        <button className="w-full mt-auto py-4 bg-accent-secondary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent/20">
                            Sincronizar YouTube
                        </button>
                    </div>

                    {/* Podcasts & Audio */}
                    <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-accent-primary/10 text-accent-primary rounded-2xl">
                                <PodcastIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Podcast Hub</h3>
                        </div>
                        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                            Escucha tus podcasts favoritos. Suscríbete a feeds RSS de audio y gestiona tu biblioteca globalmente.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-surface-primary transition-all">
                                <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                                    <PodcastIcon className="w-4 h-4 text-accent-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-text-primary truncate">Hablemos de Código</div>
                                    <div className="text-[10px] text-text-tertiary">Nuevo episodio hoy</div>
                                </div>
                            </div>
                            <button className="w-full py-4 border-2 border-dashed border-accent-primary/20 text-text-tertiary rounded-2xl text-xs font-black uppercase tracking-widest hover:border-accent-primary/40 hover:text-accent-primary transition-all">
                                + Agregar Podcast
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner Mastodon / Reddit */}
                <div className="mt-12 p-12 bg-surface-elevated rounded-[3.5rem] text-text-primary shadow-glow-accent/20 relative overflow-hidden border border-accent-primary/10 glass-card">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                        <Share2Icon className="w-64 h-64 text-accent-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-lg border border-accent-primary/20 tracking-[0.2em] uppercase">Connectors</span>
                            </div>
                            <h2 className="text-4xl font-black mb-6 tracking-tight">Ecosistema <span className="text-accent-primary">Social Sync</span></h2>
                            <p className="text-text-secondary text-lg leading-relaxed mb-8">
                                Conecta con Mastodon, Reddit y nuestro canal exclusivo de Telegram. Filtra contenido específico y recíbelo directamente en tu feed personalizado.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-accent-primary/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full" />
                                    Mastodon
                                </div>
                                <div className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-accent-primary/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-accent-primary rounded-full" />
                                    r/TierraDelFuego
                                </div>
                                <a href="https://t.me/+rkKMfpVR3G0yMDBh" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-[#0088cc]/30 text-[#0088cc] flex items-center gap-2 hover:bg-[#0088cc]/10 transition-colors">
                                    <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full shadow-[0_0_8px_#0088cc]" />
                                    Canal Telegram
                                </a>
                            </div>
                        </div>
                        <button className="px-12 py-6 bg-accent-primary text-surface-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-glow-accent hover:opacity-90 hover:scale-105 transition-all">
                            Configurar Conexiones
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
