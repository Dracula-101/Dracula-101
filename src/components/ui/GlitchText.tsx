import { useRef, useCallback, ReactNode } from 'react';
import { gsap } from 'gsap';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
}

export function GlitchText({ children, className }: GlitchTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline();
    const frames = 8;
    const xs = Array.from({ length: frames }, () => (Math.random() - 0.5) * 10);
    xs.forEach((x, i) => {
      tl.to(el, { x, duration: 0.03, ease: 'none' }, i * 0.03);
    });
    tl.to(el, { x: 0, duration: 0.05 });
  }, []);

  return (
    <span ref={ref} onMouseEnter={handleEnter} className={`inline-block ${className ?? ''}`}>
      {children}
    </span>
  );
}
