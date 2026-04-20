'use client';

import { YoutubeIcon } from '@/components/Icons';

export default function VideosView() {
    return (
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col gap-4">
                    <h2 className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em]">SINC. MULTIMEDIA Y VIDEO</h2>
                    <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase">Hub de <span className="text-accent-secondary">Video</span></h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-accent-secondary/10 text-accent-secondary rounded-2xl">
                                <YoutubeIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Sincronización de Suscripciones</h3>
                        </div>
                        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                            Convierte tus canales de YouTube favoritos en fuentes de noticias automáticas.
                        </p>
                        <button className="w-full py-4 bg-accent-secondary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent/20">
                            Conectar YouTube
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
