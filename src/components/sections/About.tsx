import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TextReveal } from '../ui/TextReveal';
import { CountUp } from '../ui/CountUp';
import { SectionWrapper } from '../layout/SectionWrapper';
import { Globe } from '../ui/Globe';
import { useCursorStore } from '../../store/cursor.store';
import { transitions } from '../../utils/spring';

const ABOUT_STATS = [
  { value: 4, suffix: '+', label: 'Projects Shipped' },
  { value: 2, suffix: '', label: 'Internships' },
  { value: 10, suffix: '+', label: 'Technologies' },
];

function TypewriterLabel({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    setShowCursor(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <span ref={ref} className="type-label" style={{ color: 'var(--color-accent)' }}>
      {displayed}
      {showCursor && <span className="inline-block animate-pulse" style={{ width: 2, height: '1em', background: 'var(--color-accent)', marginLeft: 1 }} />}
    </span>
  );
}

export function About() {
  const setVariant = useCursorStore((s) => s.setVariant);

  return (
    <SectionWrapper id="about">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-start" style={{ gap: 'var(--space-12)' }}>
        {/* Left — 3D Globe */}
        <div className="flex flex-col items-center justify-center" style={{ minHeight: 420 }}>
          <Globe className="w-full max-w-[500px]" />
        </div>

        {/* Right — Text */}
        <div className="flex flex-col" style={{ gap: 'var(--space-5)' }}>
          {/* Tier 3 Section Header */}
          <div>
            <span className="type-label" style={{ color: 'var(--color-accent)' }}>01</span>
            <TypewriterLabel text="// ABOUT ME" />
            <div className="overflow-hidden" style={{ marginTop: 'var(--space-3)' }}>
              <TextReveal delay={0.1}>
                <h2
                  className="type-heading"
                  style={{ color: 'var(--color-fg)' }}
                >
                  I build systems that scale and interfaces that matter.
                </h2>
              </TextReveal>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
            <TextReveal delay={0.2}>
              <p className="type-body" style={{ color: 'var(--color-muted)' }}>
                I'm a CS grad student at the University of Colorado Boulder (GPA 3.96), with a B.Tech from Sardar Patel Institute of Technology. I build distributed systems, real-time applications, and cross-platform mobile experiences — always from the API contract outward.
              </p>
            </TextReveal>
            <TextReveal delay={0.3}>
              <p className="type-body" style={{ color: 'var(--color-muted)' }}>
                From 9-microservice architectures in Go to ML-powered healthcare platforms in Flutter, I approach every project as a systems problem with a craft solution. Previously interned at Aim4U Software Solutions and Acuradyne Systems (IIT Bombay Research Park).
              </p>
            </TextReveal>
          </div>

          {/* Stats strip (Tier 2 card pattern) */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
            {ABOUT_STATS.map((stat, i) => (
              <div key={i} className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 3vw, 44px)',
                    fontWeight: 'var(--text-heading-weight)' as unknown as number,
                    letterSpacing: 'var(--text-heading-tracking)',
                    lineHeight: 1,
                    color: 'var(--color-fg)',
                  }}
                >
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </span>
                <span className="type-label" style={{ color: 'var(--color-muted)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
