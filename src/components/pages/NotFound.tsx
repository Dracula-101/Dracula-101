import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { gsap } from 'gsap';
import { MagneticButton } from '../ui/MagneticButton';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { transitions } from '../../utils/spring';

const SUGGESTIONS = [
  { label: 'Work', to: '/', hash: '#work' },
  { label: 'Research', to: '/', hash: '#research' },
  { label: 'Résumé', to: '/resume' },
];

export function NotFound() {
  const { pathname } = useLocation();
  const setVariant = useCursorStore((s) => s.setVariant);
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const rootRef = useRef<HTMLDivElement>(null);

  useDocumentMeta({
    title: '404 — Page not found',
    description: 'That page does not exist. Head back to the work, research, or résumé.',
  });

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll('[data-animate]'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: transitions.entrance.duration, ease: 'power4.out', stagger: transitions.stagger, delay: 0.1 },
    );
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col justify-center"
      style={{ padding: `var(--space-20) var(--outer-margin) var(--space-12)` }}
    >
      <span data-animate className="type-label" style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
        Error 404
      </span>

      <h1
        data-animate
        className="type-display"
        style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-3)' }}
      >
        Lost the
        <br />
        thread<span style={{ color: 'var(--color-accent)' }}>.</span>
      </h1>

      <p
        data-animate
        className="type-body prose"
        style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}
      >
        Nothing lives at this address. It may have moved, or the link may be stale.
      </p>

      <code
        data-animate
        className="type-caption"
        style={{
          color: 'var(--color-muted)',
          opacity: 0.6,
          marginBottom: 'var(--space-6)',
          wordBreak: 'break-all',
          textTransform: 'none',
        }}
      >
        {pathname}
      </code>

      <div data-animate className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        <MagneticButton onClick={() => { window.location.href = import.meta.env.BASE_URL; }}>
          <span className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back home
          </span>
        </MagneticButton>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center type-label"
          style={{
            gap: 'var(--space-1)',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-subtle)',
            padding: `var(--space-1) var(--space-2)`,
            background: 'none',
          }}
          onMouseEnter={() => setVariant('button')}
          onMouseLeave={() => setVariant('default')}
        >
          <Search size={12} strokeWidth={1.5} />
          Search the site
          <kbd className="type-caption" style={{ opacity: 0.6, marginLeft: 4 }}>⌘K</kbd>
        </button>
      </div>

      <motion.div
        data-animate
        className="flex flex-col"
        style={{ gap: 'var(--space-1)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}
      >
        <span className="type-caption" style={{ color: 'var(--color-muted)', opacity: 0.5, marginBottom: 'var(--space-1)' }}>
          Try instead
        </span>
        <div className="flex flex-wrap" style={{ gap: 'var(--space-3)' }}>
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="nav-link type-label"
              style={{ color: 'var(--color-fg)' }}
              onMouseEnter={() => setVariant('link')}
              onMouseLeave={() => setVariant('default')}
              onClick={() => {
                if (s.hash) setTimeout(() => document.querySelector(s.hash!)?.scrollIntoView({ behavior: 'smooth' }), 120);
              }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
