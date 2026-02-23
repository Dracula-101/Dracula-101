import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { stats } from '../../data/stats';
import { CountUp } from '../ui/CountUp';
import { SectionWrapper } from '../layout/SectionWrapper';
import { transitions } from '../../utils/spring';

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px' });

  return (
    <SectionWrapper id="stats">
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-5)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="type-label" style={{ color: 'var(--color-accent)' }}>By The Numbers</span>
        </div>

        {/* Stats grid */}
        <div ref={ref} className="grid" style={{ gap: 'var(--space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col"
              style={{ gap: 'var(--space-2)' }}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: transitions.entrance.duration,
                delay: i * transitions.stagger,
                ease: transitions.entrance.ease,
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 4vw, 64px)',
                  fontWeight: 'var(--text-heading-weight)' as unknown as number,
                  letterSpacing: 'var(--text-heading-tracking)',
                  lineHeight: 1,
                  color: 'var(--color-fg)',
                }}
              >
                <CountUp to={stat.value} suffix={stat.suffix} />
              </span>

              {/* Label */}
              <span className="type-label" style={{ color: 'var(--color-muted)' }}>{stat.label}</span>

              {/* Underline */}
              <motion.div
                style={{ height: 1, background: 'var(--color-accent)', opacity: 0.4, transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: i * transitions.stagger + 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
