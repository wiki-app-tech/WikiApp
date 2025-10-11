import React, { useState, useRef, useEffect } from 'react';
import { RADIO_STATIONS } from '../constants';
import { RadioStation } from '../types';
import RadioIcon from './icons/RadioIcon';

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const RadioPlayerWidget: React.FC = () => {
    const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlaying = () => {
            setIsPlaying(true);
            setIsLoading(false);
        };
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = () => {
            setIsLoading(false);
            setIsPlaying(false);
            // Consider showing an error message to the user
            console.error('Error playing audio stream.');
        };

        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const handlePlayPause = (station: RadioStation) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentStation?.streamUrl === station.streamUrl) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play().catch(e => console.error("Error on play:", e));
            }
        } else {
            setCurrentStation(station);
            setIsLoading(true);
            audio.src = station.streamUrl;
            audio.play().catch(e => console.error("Error on new source play:", e));
        }
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg">
            <audio ref={audioRef} preload="none" />
            <div className="flex items-center mb-4">
                <RadioIcon className="w-8 h-8 text-yellow-600 mr-3" />
                <h2 className="text-xl font-bold text-white">Radios de TDF en Vivo</h2>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {RADIO_STATIONS.map(station => {
                    const isActive = currentStation?.streamUrl === station.streamUrl;
                    return (
                        <div key={station.name} className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-slate-700' : 'bg-slate-900/50'}`}>
                            <img src={station.logoUrl} alt={station.name} className="w-12 h-12 rounded-md mr-4 bg-white p-1 object-contain" />
                            <div className="flex-grow">
                                <p className="font-bold text-white">{station.name}</p>
                                <p className="text-sm text-gray-400">{station.frequency} - {station.city}</p>
                            </div>
                            <button
                                onClick={() => handlePlayPause(station)}
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-600 text-slate-900 hover:bg-yellow-500 transition-colors disabled:bg-slate-600"
                                disabled={isLoading && isActive}
                                aria-label={isPlaying && isActive ? `Pausar ${station.name}` : `Reproducir ${station.name}`}
                            >
                                {isLoading && isActive ? <LoadingIcon className="w-6 h-6 animate-spin" /> : 
                                 isPlaying && isActive ? <PauseIcon className="w-6 h-6" /> : 
                                 <PlayIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {currentStation && (
                 <div className="mt-4 border-t border-slate-700 pt-3">
                    <p className="text-xs text-gray-400 text-center">
                        {isPlaying ? 'Sonando ahora:' : 'En pausa:'} <span className="font-bold text-white">{currentStation.name}</span>
                    </p>
                 </div>
            )}
        </div>
    );
};

export default RadioPlayerWidget;