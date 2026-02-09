import { useEffect, useState } from 'react';

interface UseAutoRefreshOptions {
    interval?: number; // en milisegundos
    enabled?: boolean;
}

/**
 * Hook personalizado para auto-refrescar datos periódicamente
 * @param callback - Función a ejecutar en cada intervalo
 * @param options - Configuración del auto-refresh
 */
export function useAutoRefresh(
    callback: () => void | Promise<void>,
    options: UseAutoRefreshOptions = {}
) {
    const { interval = 5 * 60 * 1000, enabled = true } = options; // Default: 5 minutos
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        if (!enabled) return;

        const executeCallback = async () => {
            try {
                await callback();
                setLastUpdate(new Date());
            } catch (error) {
                console.error('Error en auto-refresh:', error);
            }
        };

        // Ejecutar inmediatamente al montar
        executeCallback();

        // Configurar intervalo
        const intervalId = setInterval(executeCallback, interval);

        return () => clearInterval(intervalId);
    }, [callback, interval, enabled]);

    return { lastUpdate };
}
