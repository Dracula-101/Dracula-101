import { useRef, useCallback } from 'react';
import { useSpring } from '@react-spring/web';
import { springs } from '../utils/spring';

export function useMagnetic(strength: number = 0.4) {
  const ref = useRef<HTMLElement>(null);
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: springs.magnetic,
  }));

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    api.start({ x: dx * strength, y: dy * strength });
  }, [api, strength]);

  const onMouseLeave = useCallback(() => {
    api.start({ x: 0, y: 0 });
  }, [api]);

  return { ref, style, onMouseMove, onMouseLeave };
}
