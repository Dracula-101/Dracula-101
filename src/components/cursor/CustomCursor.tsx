import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursorStore } from '../../store/cursor.store';
import { raf } from '../../utils/raf';

const TRAIL_COUNT = 16;
const RING_LERP = 0.13;
const TRAIL_BASE_LERP = 0.12;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface TrailPoint { x: number; y: number }

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rawX = useRef(0);
  const rawY = useRef(0);
  const ringPos = useRef({ x: 0, y: 0 });
  const trailRef = useRef<TrailPoint[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  );
  const trailEls = useRef<HTMLDivElement[]>([]);
  const { variant, isVisible } = useCursorStore();

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      rawX.current = e.clientX;
      rawY.current = e.clientY;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });

    raf.add('cursor-main', () => {
      const x = rawX.current;
      const y = rawY.current;

      // Dot: direct position — zero lerp, zero lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      }

      // Ring: smooth trailing via lerp (0.13)
      ringPos.current.x = lerp(ringPos.current.x, x, RING_LERP);
      ringPos.current.y = lerp(ringPos.current.y, y, RING_LERP);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Trail: decreasing lerp per ghost (0.12 → 0.03)
      const trail = trailRef.current;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const factor = TRAIL_BASE_LERP - (i / TRAIL_COUNT) * 0.09;
        const target = i === 0 ? { x, y } : trail[i - 1];
        trail[i].x = lerp(trail[i].x, target.x, factor);
        trail[i].y = lerp(trail[i].y, target.y, factor);
      }

      trailEls.current.forEach((el, i) => {
        if (!el) return;
        const scale = 1 - (i / TRAIL_COUNT) * 0.85;
        const opacity = (1 - i / TRAIL_COUNT) * 0.25;
        el.style.transform = `translate3d(${trail[i].x - 3}px, ${trail[i].y - 3}px, 0) scale(${scale})`;
        el.style.opacity = String(opacity);
      });
    });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      raf.remove('cursor-main');
    };
  }, []);

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return null;

  const ringSize = variant === 'link' ? 60 : variant === 'button' ? 24 : variant === 'repel' ? 120 : 40;
  const ringBg = variant === 'button' ? 'var(--color-accent)' : 'transparent';
  const dotHidden = variant === 'button';

  return (
    <>
      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailEls.current[i] = el; }}
          className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none"
          style={{ willChange: 'transform', opacity: 0, zIndex: 'var(--z-cursor)', background: 'var(--color-fg)' }}
        />
      ))}

      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ willChange: 'transform', zIndex: 'var(--z-cursor)' }}
      >
        <AnimatePresence>
          {!dotHidden && isVisible && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-2 h-2 rounded-full"
              style={{
                background: variant === 'text' ? 'var(--color-accent)' : 'var(--color-fg)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Ring — positioned via RAF lerp, size/opacity via Framer Motion */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none flex items-center justify-center"
        style={{ willChange: 'transform', zIndex: 'var(--z-cursor)' }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            background: ringBg,
            opacity: isVisible ? 1 : 0,
            rotate: variant === 'link' ? 360 : 0,
          }}
          transition={{
            width: { type: 'spring', stiffness: 180, damping: 22, mass: 1.2 },
            height: { type: 'spring', stiffness: 180, damping: 22, mass: 1.2 },
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            background: { duration: 0.2 },
            opacity: { duration: 0.2 },
          }}
          className="rounded-full flex items-center justify-center"
          style={{ border: '1px solid var(--color-fg)' }}
        >
          <AnimatePresence>
            {variant === 'link' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="type-caption whitespace-nowrap select-none"
                style={{ color: 'var(--color-fg)', letterSpacing: '0.1em' }}
              >
                VIEW →
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
