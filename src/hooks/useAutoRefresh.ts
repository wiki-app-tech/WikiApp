import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds, default 2 minutes (120000)
  enabled?: boolean;
  immediate?: boolean; // trigger background origin sync on mount
}

export function useAutoRefresh(
  onRefresh?: () => Promise<void> | void,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 2 * 60 * 1000, enabled = true, immediate = true } = options;
  const router = useRouter();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const lastRefreshMsRef = useRef<number>(0);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await fetch('/api/revalidate', { method: 'POST' });
        router.refresh();
      }
      const now = new Date();
      lastRefreshMsRef.current = now.getTime();
      setLastRefreshed(now);
    } catch (error) {
      console.error('Error auto-refreshing from origin:', error);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [onRefresh, router]);

  useEffect(() => {
    if (!enabled) return;

    let initialTimeout: ReturnType<typeof setTimeout> | null = null;
    if (immediate) {
      // Disparar primera sincronización silenciosa desde los sitios de origen tras montar la vista
      initialTimeout = setTimeout(() => {
        triggerRefresh();
      }, 1500);
    }

    const timer = setInterval(() => {
      triggerRefresh();
    }, interval);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastRefreshMsRef.current;
        if (elapsed > 45 * 1000) {
          triggerRefresh();
        }
      }
    };

    const handleOnline = () => {
      triggerRefresh();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (initialTimeout) clearTimeout(initialTimeout);
      clearInterval(timer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [enabled, immediate, interval, triggerRefresh]);

  return { lastRefreshed, isRefreshing, triggerRefresh };
}
