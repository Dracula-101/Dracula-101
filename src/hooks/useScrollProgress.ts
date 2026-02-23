import { useRef, useEffect } from 'react';
import { useUIStore } from '../store/ui.store';

export function useScrollProgress() {
  const lastY = useRef(0);
  const setDir = useUIStore((s) => s.setScrollDirection);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setDir(y > lastY.current ? 'down' : 'up');
      lastY.current = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [setDir]);
}
