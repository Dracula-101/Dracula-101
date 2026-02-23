import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowDown } from 'lucide-react';
import { HeroGeometry } from '../../webgl/three/heroGeometry';
import { NoiseOverlay } from '../ui/NoiseOverlay';
import { MagneticButton } from '../ui/MagneticButton';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';

/* ---------------------------------------------------------------
 * Reusable split-text helper — wraps each character in a span
 * inside an overflow-hidden wrapper for clip-up reveals.
 * --------------------------------------------------------------- */
function SplitLine({ text, refCb }: { text: string; refCb: (el: HTMLSpanElement | null) => void }) {
  return (
    <span className="inline-flex overflow-hidden">
      <span ref={refCb} className="inline-block will-change-transform">
        {text}
      </span>
    </span>
  );
}

const LABELS = ['MOBILE', 'WEB', 'SERVER'];

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroGeometry | null>(null);

  // Refs for entrance targets
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const accentBarRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  const setVariant = useCursorStore((s) => s.setVariant);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  // Carousel state
  const [activeLabel, setActiveLabel] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const handleLabelChange = useCallback((label: string, index: number) => {
    setActiveLabel(label);
    setActiveIndex(index);
  }, []);

  /* --- WebGL scene (3D foreground) --- */
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new HeroGeometry({
      canvas: canvasRef.current,
      foregroundColor: '#FFFFFF',
      accentColor: '#F5A623',
    });
    scene.onLabelChange = handleLabelChange;
    sceneRef.current = scene;

    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      sceneRef.current?.setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      sceneRef.current?.dispose();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleLabelChange]);

  /* --- Entrance GSAP timeline --- */
  useEffect(() => {
    const targets = [line1Ref, line2Ref, line3Ref, accentBarRef, subtitleRef, ctaRef, badgeRef, scrollIndRef];
    if (reducedMotion) {
      targets.forEach(r => {
        if (r.current) gsap.set(r.current, { opacity: 1, y: 0, skewX: 0, scaleX: 1, scaleY: 1 });
      });
      return;
    }

    const tl = gsap.timeline({ delay: 0.8 }); // delay to let 3D entrance play first

    // 1. Badge drops in
    tl.fromTo(badgeRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0,
    );

    // 2. Heading lines — clip-up with stagger (entrance pattern: y:24→0)
    const headingLines = [line1Ref.current, line2Ref.current, line3Ref.current];
    headingLines.forEach((el, i) => {
      tl.fromTo(el,
        { y: '110%' },
        { y: '0%', duration: 0.5, ease: 'power3.out' },
        0.1 + i * 0.06,
      );
    });

    // 3. Accent bar wipes in
    tl.fromTo(accentBarRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: 'power3.out' },
      0.4,
    );

    // 4. Subtitle fades up (entrance pattern)
    tl.fromTo(subtitleRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0.5,
    );

    // 5. CTA buttons entrance
    tl.fromTo(ctaRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0.6,
    );

    // 6. Scroll indicator appears
    tl.fromTo(scrollIndRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      0.8,
    );
  }, [reducedMotion]);

  return (
    <section id="hero" className="relative h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* 3D Canvas — FOREGROUND, not background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 'var(--z-base)' as unknown as number }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 'var(--z-raised)' as unknown as number }}>
        <NoiseOverlay />
      </div>

      {/* Gradient vignette — subtle edges to bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 'var(--z-raised)' as unknown as number,
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, var(--color-bg) 100%)`,
        }}
      />

      {/* Content — loads after 3D entrance */}
      <div
        className="relative h-full flex flex-col justify-center"
        style={{ zIndex: 'var(--z-raised)' as unknown as number, padding: `0 var(--outer-margin)` }}
      >
        <div className="max-w-none">
          {/* Top badge */}
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

          {/* Heading lines — each inside overflow-hidden */}
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

          {/* Accent bar */}
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

          {/* Subtitle */}
          <div ref={subtitleRef} className="opacity-0" style={{ marginTop: 'var(--space-4)' }}>
            <p
              className="type-body max-w-xl"
              style={{ color: 'var(--color-muted)' }}
            >
              Crafting distributed systems, mobile apps, and intelligent interfaces.
              Based in Boulder, CO — available worldwide.
            </p>
          </div>

          {/* CTA */}
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

      {/* Carousel label + pager dots — right side */}
      {activeLabel && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{
            zIndex: 'var(--z-raised)' as unknown as number,
            right: 'var(--outer-margin)',
            gap: 'var(--space-3)',
          }}
        >
          {/* Active label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeLabel}
              className="type-caption"
              style={{
                color: 'var(--color-accent)',
                letterSpacing: '0.15em',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              {activeLabel}
            </motion.span>
          </AnimatePresence>

          {/* Pager dots */}
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            {LABELS.map((label, i) => (
              <div
                key={label}
                style={{
                  width: i === activeIndex ? 8 : 4,
                  height: i === activeIndex ? 8 : 4,
                  borderRadius: '50%',
                  background: i === activeIndex ? 'var(--color-accent)' : 'var(--color-border)',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Heading typography — uses design tokens */}
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

      {/* Scroll indicator */}
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
