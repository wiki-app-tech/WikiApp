import { useEffect, useState } from 'react';

interface RefreshIndicatorProps {
    lastUpdate: Date;
    isRefreshing?: boolean;
}

export default function RefreshIndicator({ lastUpdate, isRefreshing = false }: RefreshIndicatorProps) {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const updateTimeAgo = () => {
            const now = new Date();
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);

            if (diffMins === 0) {
                setTimeAgo(`hace ${diffSecs}s`);
            } else if (diffMins < 60) {
                setTimeAgo(`hace ${diffMins}m`);
            } else {
                const diffHours = Math.floor(diffMins / 60);
                setTimeAgo(`hace ${diffHours}h`);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 10000); // Actualizar cada 10 segundos

        return () => clearInterval(interval);
    }, [lastUpdate]);

    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-[1.25rem] shadow-lg shadow-blue-500/5 border border-zinc-100">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight leading-none">
                    {isRefreshing ? 'Actualizando...' : 'Última actualización'}
                </span>
                {!isRefreshing && (
                    <span className="text-[11px] font-bold text-zinc-600 tracking-tight mt-0.5">
                        {timeAgo}
                    </span>
                )}
            </div>
        </div>
    );
}
