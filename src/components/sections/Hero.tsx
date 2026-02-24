import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowDown } from 'lucide-react';
import { HeroGeometry } from '../../webgl/three/heroGeometry';
import { NoiseOverlay } from '../ui/NoiseOverlay';
import { MagneticButton } from '../ui/MagneticButton';
import { Preloader } from '../ui/Preloader';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';

const LABELS = ['Mobile', 'Web', 'Server'] as const;

function SplitLine({ text, refCb }: { text: string; refCb: (el: HTMLSpanElement | null) => void }) {
  return (
    <span className="inline-flex overflow-hidden">
      <span ref={refCb} className="inline-block will-change-transform">
        {text}
      </span>
    </span>
  );
}

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroGeometry | null>(null);

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const accentBarRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [modelsReady, setModelsReady] = useState(false);
  const setVariant = useCursorStore((s) => s.setVariant);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  const onSlideChange = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  const onProgress = useCallback((loaded: number, total: number) => {
    setLoadProgress(loaded / total);
  }, []);

  const onAllLoaded = useCallback(() => {
    setModelsReady(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    sceneRef.current = new HeroGeometry({
      canvas: canvasRef.current,
      foregroundColor: '#FFFFFF',
      accentColor: '#F5A623',
      onSlideChange,
      onProgress,
      onAllLoaded,
    });

    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      sceneRef.current?.setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      sceneRef.current?.dispose();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onSlideChange, onProgress, onAllLoaded]);

  useEffect(() => {
    const targets = [line1Ref, line2Ref, line3Ref, accentBarRef, subtitleRef, ctaRef, badgeRef, scrollIndRef];
    if (reducedMotion) {
      targets.forEach(r => {
        if (r.current) gsap.set(r.current, { opacity: 1, y: 0, skewX: 0, scaleX: 1, scaleY: 1 });
      });
      return;
    }

    const tl = gsap.timeline({ delay: 0.8 });

    tl.fromTo(badgeRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0,
    );

    const headingLines = [line1Ref.current, line2Ref.current, line3Ref.current];
    headingLines.forEach((el, i) => {
      tl.fromTo(el,
        { y: '110%' },
        { y: '0%', duration: 0.5, ease: 'power3.out' },
        0.1 + i * 0.06,
      );
    });

    tl.fromTo(accentBarRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: 'power3.out' },
      0.4,
    );

    tl.fromTo(subtitleRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0.5,
    );

    tl.fromTo(ctaRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0.6,
    );

    tl.fromTo(scrollIndRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      0.8,
    );
  }, [reducedMotion]);

  return (
    <section id="hero" className="relative h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Preloader overlay */}
      <Preloader progress={loadProgress} ready={modelsReady} />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 'var(--z-base)' as unknown as number }}
      />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 'var(--z-raised)' as unknown as number }}>
        <NoiseOverlay />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 'var(--z-raised)' as unknown as number,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, var(--color-bg) 100%)`,
        }}
      />

      <div
        className="relative h-full flex flex-col justify-center"
        style={{ zIndex: 'var(--z-raised)' as unknown as number, padding: `0 var(--outer-margin)` }}
      >
        <div className="max-w-none">
          <div ref={badgeRef} className="opacity-0" style={{ marginBottom: 'var(--space-3)' }}>
            <span
              className="type-label inline-flex items-center uppercase"
              style={{
                gap: 'var(--space-1)',
                padding: `6px var(--space-2)`,
                border: `1px solid var(--color-border)`,
                color: 'var(--color-muted)',
              }}
            >
              <span
                className="rounded-full animate-pulse"
                style={{ width: 6, height: 6, background: 'var(--color-accent)' }}
              />
              Available for work
            </span>
          </div>

          <div
            className="hero-headings"
            onMouseEnter={() => setVariant('repel')}
            onMouseLeave={() => setVariant('default')}
          >
            <div className="overflow-hidden">
              <SplitLine text="FULL-STACK" refCb={(el) => { (line1Ref as React.MutableRefObject<HTMLSpanElement | null>).current = el; }} />
            </div>
            <div className="overflow-hidden hero-heading--accent">
              <SplitLine text="ENGINEER" refCb={(el) => { (line2Ref as React.MutableRefObject<HTMLSpanElement | null>).current = el; }} />
            </div>
            <div className="overflow-hidden">
              <SplitLine text="& BUILDER" refCb={(el) => { (line3Ref as React.MutableRefObject<HTMLSpanElement | null>).current = el; }} />
            </div>
          </div>

          <div
            ref={accentBarRef}
            className="origin-left"
            style={{
              marginTop: 'var(--space-3)',
              height: 2,
              width: 128,
              background: 'var(--color-accent)',
              transform: 'scaleX(0)',
            }}
          />

          <div ref={subtitleRef} className="opacity-0" style={{ marginTop: 'var(--space-4)' }}>
            <p className="type-body max-w-xl" style={{ color: 'var(--color-muted)' }}>
              Crafting distributed systems, mobile apps, and intelligent interfaces.
              Based in Boulder, CO — available worldwide.
            </p>
          </div>

          <div ref={ctaRef} className="flex items-center opacity-0" style={{ marginTop: 'var(--space-6)', gap: 'var(--space-3)' }}>
            <MagneticButton
              variant="primary"
              onClick={() => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Work
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get in Touch
              <ArrowDown size={16} strokeWidth={1.5} />
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* ---- Carousel label + dots ---- */}
      <div
        className="absolute flex items-center"
        style={{
          zIndex: 'var(--z-raised)' as unknown as number,
          bottom: 'var(--space-8)',
          right: 'var(--outer-margin)',
          gap: 'var(--space-3)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeSlide}
            className="type-caption uppercase"
            style={{ color: 'var(--color-accent)', letterSpacing: '0.14em', minWidth: 54 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {LABELS[activeSlide]}
          </motion.span>
        </AnimatePresence>

        <div className="flex items-center" style={{ gap: 6 }}>
          {LABELS.map((_, i) => (
            <button
              key={i}
              aria-label={`Show ${LABELS[i]}`}
              onClick={() => sceneRef.current?.goToSlide(i)}
              className="relative transition-all duration-300"
              style={{
                width: activeSlide === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: activeSlide === i ? 'var(--color-accent)' : 'var(--color-border)',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hero-headings > .overflow-hidden > span > span {
          font-family: var(--font-display);
          font-size: var(--text-display-size);
          font-weight: var(--text-display-weight);
          letter-spacing: var(--text-display-tracking);
          line-height: var(--text-display-leading);
          color: var(--color-fg);
          display: inline-block;
        }
        .hero-headings > .hero-heading--accent > span > span {
          color: var(--color-accent);
        }
      `}</style>

      <div
        ref={scrollIndRef}
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0"
        style={{ bottom: 'var(--space-5)', zIndex: 'var(--z-raised)' as unknown as number, gap: 'var(--space-1)' }}
      >
        <span className="type-caption" style={{ color: 'var(--color-muted)', letterSpacing: 'var(--text-caption-tracking)' }}>SCROLL</span>
        <div className="relative overflow-hidden" style={{ width: 1, height: 64, background: 'var(--color-border)' }}>
          <motion.div
            className="absolute top-0 w-full"
            style={{ height: 16, background: 'var(--color-accent)' }}
            animate={{ y: ['-100%', '400%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  );
}
