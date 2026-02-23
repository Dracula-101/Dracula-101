import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { countUpEase } from '../../utils/math';
import { useUIStore } from '../../store/ui.store';

interface CountUpProps {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({ to, suffix = '', duration = 1800, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [value, setValue] = useState(0);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    if (!isInView) return;
    if (reducedMotion) { setValue(to); return; }

    let start: number | null = null;
    let rafId: number;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(countUpEase(progress) * to));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, to, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {value}{suffix}
    </span>
  );
}
