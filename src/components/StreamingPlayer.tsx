'use client';

import { useState, useRef, useEffect } from 'react';

interface StreamingSource {
    id: string;
    name: string;
    type: 'radio' | 'tv';
    url: string;
    location: string;
}

export const STREAMING_SOURCES: StreamingSource[] = [
    {
        id: 'lra10',
        name: 'LRA10 Radio Nacional Ushuaia',
        type: 'radio',
        url: 'https://itidirecto.com.ar:8000/lra10ushuaia.mp3',
        location: 'Ushuaia'
    },
    {
        id: 'lra24',
        name: 'LRA24 Radio Nacional Río Grande',
        type: 'radio',
        url: 'https://itidirecto.com.ar:8000/lra24riogrande.mp3',
        location: 'Río Grande'
    },
    {
        id: 'canal11',
        name: 'Canal 11 Ushuaia',
        type: 'tv',
        url: 'https://www.youtube.com/embed/live_stream?channel=UC_1E6T1N8r9o1V5vj6AaxWA', // Placeholder channel ID for Canal 11
        location: 'Ushuaia'
    },
    {
        id: 'canal13',
        name: 'Canal 13 Río Grande',
        type: 'tv',
        url: 'https://www.youtube.com/embed/live_stream?channel=UC_1E6T1N8r9o1V5vj6AaxWA', // Placeholder channel ID for Canal 13
        location: 'Río Grande'
    }
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`p-3 rounded-2xl ${source.type === 'radio' ? 'bg-orange-500' : 'bg-blue-600'} text-white`}>
                            {source.type === 'radio' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{source.name}</h2>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{source.location} • En Vivo</p>
                        </div>
                    </div>

                    {source.type === 'tv' ? (
                        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-lg">
                            <iframe
                                src={source.url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="bg-zinc-50 rounded-[2rem] p-12 flex flex-col items-center text-center shadow-inner">
                            <div className="w-32 h-32 bg-orange-500 text-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30 animate-pulse">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                            </div>
                            <audio ref={audioRef} src={source.url} />
                            <div className="space-y-6 w-full max-w-xs">
                                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                    <div className={`h-full bg-orange-500 transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`} />
                                </div>
                                <button
                                    onClick={togglePlay}
                                    className="w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                                >
                                    {isPlaying ? (
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <p className="text-sm font-medium text-zinc-500">Transmisión de audio en tiempo real</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
