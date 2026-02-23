import { useEffect } from 'react';
import { useUIStore } from '../store/ui.store';

export function useReducedMotion() {
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setReducedMotion]);

  return useUIStore((s) => s.reducedMotion);
}
