'use client';

import React, { useState } from 'react';
import { LIVE_CAMERAS } from '@/constants';

export default function LiveCamerasWidget() {
    const [activeCam, setActiveCam] = useState(LIVE_CAMERAS[0]);

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 text-center md:text-left">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display">Cámaras en Vivo</h2>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Ushuaia - Fin del Mundo</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {LIVE_CAMERAS.map((cam) => (
                        <button
                            key={cam.location}
                            onClick={() => setActiveCam(cam)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeCam.location === cam.location ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'bg-surface-elevated text-text-tertiary hover:text-text-primary'}`}
                        >
                            {cam.location}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-8 border-surface-elevated shadow-2xl group">
                <iframe
                    title={activeCam.location}
                    src={activeCam.embedUrl}
                    className="absolute inset-0 w-full h-full border-0 opacity-80 brightness-[1.05] grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                    allowFullScreen
                />

                {/* Overlay Info */}
                <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 bg-surface-primary/60 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">Signal: Active</span>
                </div>
            </div>

            <p className="text-[10px] text-text-tertiary text-center mt-8 italic opacity-60">
                Streaming provisto por SkylineWebcams
            </p>
        </div>
    );
}
