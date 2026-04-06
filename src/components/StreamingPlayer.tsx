'use client';

import { useState, useRef, useEffect } from 'react';

export interface StreamingSource {
    id: string;
    name: string;
    type: 'radio' | 'tv';
    url: string;
    location: string;
}

export const STREAMING_SOURCES: StreamingSource[] = [
    {
        id: 'lra10',
        name: 'Radio Nacional Ushuaia',
        type: 'radio',
        url: 'http://190.111.245.221:8000/stream',
        location: 'Ushuaia'
    },
    {
        id: 'radio-argentina-ushuaia',
        name: 'Radio Argentina Ushuaia',
        type: 'radio',
        url: 'https://proxy.turadioinfo.com/6334;live',
        location: 'Ushuaia'
    },
    {
        id: 'provincia',
        name: 'Radio Provincia',
        type: 'radio',
        url: 'http://200.58.105.132:8000/ushuaia2',
        location: 'Ushuaia'
    },
    {
        id: 'fm-fuego',
        name: 'FM Fuego',
        type: 'radio',
        url: 'https://v2.tustreaming.tv/8030/',
        location: 'Río Grande'
    },
    {
        id: 'radio-fueguina',
        name: 'La 97 Radio Fueguina',
        type: 'radio',
        url: 'http://streamall.alsolnet.com/radiofueguina/radiofueguina.stream',
        location: 'Río Grande'
    },
    {
        id: 'siglo',
        name: 'Estación del Siglo',
        type: 'radio',
        url: 'http://streamall.alsolnet.com/estaciondelsigloaudio',
        location: 'Río Grande'
    },
    {
        id: 'canal11',
        name: 'Canal 11 Ushuaia',
        type: 'tv',
        url: 'https://www.youtube.com/embed/live_stream?channel=UC_1E6T1N8r9o1V5vj6AaxWA',
        location: 'Ushuaia'
    },
    {
        id: 'canal13',
        name: 'Canal 13 Río Grande',
        type: 'tv',
        url: 'https://www.youtube.com/embed/live_stream?channel=UC_1E6T1N8r9o1V5vj6AaxWA',
        location: 'Río Grande'
    },
    {
        id: 'tn-todo-noticias',
        name: 'TN Todo Noticias',
        type: 'tv',
        url: 'https://www.youtube.com/embed/cb12KmMMDJA?autoplay=1',
        location: 'Nacional'
    },
];

export function StreamingPlayer({ source, onClose }: { source: StreamingSource, onClose: () => void }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (source.type === 'radio' && audioRef.current) {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    }, [source]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-surface-primary/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-surface-elevated rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl relative border border-accent-primary/20 glass-card">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-3 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-2xl transition-all border border-accent-primary/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-6 mb-10">
                        <div className={`p-4 rounded-3xl ${source.type === 'radio' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-secondary/20 text-accent-secondary'} shadow-glow-accent`}>
                            {source.type === 'radio' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-text-primary tracking-tight font-display">{source.name}</h2>
                            <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mt-1">{source.location} • Transmisión Vital</p>
                        </div>
                    </div>

                    {source.type === 'tv' ? (
                        <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 relative group">
                            <iframe
                                src={source.url}
                                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE SYNC</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-primary/30 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-inner border border-white/5">
                            <div className="w-40 h-40 bg-accent-primary/10 text-accent-primary rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-accent-primary/20 relative group">
                                <div className={`absolute inset-0 bg-accent-primary/20 rounded-full animate-ping ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                                <svg className="w-20 h-20 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                            </div>
                            <audio ref={audioRef} src={source.url} />
                            <div className="space-y-8 w-full max-w-sm">
                                <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full bg-accent-primary transition-all duration-1000 ease-out shadow-glow-accent ${isPlaying ? 'w-full' : 'w-0'}`} />
                                </div>
                                <button
                                    onClick={togglePlay}
                                    className="w-24 h-24 bg-accent-primary text-surface-primary rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-glow-accent group"
                                >
                                    {isPlaying ? (
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Señal Digital Codificada • 256kbps</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
