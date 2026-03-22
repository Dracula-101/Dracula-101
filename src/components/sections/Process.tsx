import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, GitBranch, Code2, Zap } from 'lucide-react';
import { processSteps, philosophyPrinciples } from '../../data/process';
import { SectionWrapper } from '../layout/SectionWrapper';
import { TextReveal } from '../ui/TextReveal';
import { transitions } from '../../utils/spring';

const ICONS = { Search, GitBranch, Code2, Zap } as const;

/* ─── Process Step Card ─── */
function StepCard({ step, index }: { step: typeof processSteps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
  const [hovered, setHovered] = useState(false);
  const Icon = ICONS[step.icon as keyof typeof ICONS];

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col"
      style={{
        padding: 'var(--space-4)',
        gap: 'var(--space-2)',
        borderLeft: '1px solid var(--color-border)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: transitions.entrance.duration,
        delay: index * 0.1,
        ease: transitions.entrance.ease,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent bar on hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 1, background: 'var(--color-accent)', transformOrigin: 'top' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Number + Icon */}
      <div className="flex items-center justify-between">
        <span
          className="type-label select-none"
          style={{ color: hovered ? 'var(--color-accent)' : 'var(--color-muted)', transition: 'color 0.2s' }}
        >
          {step.number}
        </span>
        {Icon && (
          <div style={{ color: hovered ? 'var(--color-accent)' : 'var(--color-border)', transition: 'color 0.2s' }}>
            <Icon size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 2vw, 28px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: 'var(--color-fg)',
        }}
      >
        {step.title}
      </h3>

      {/* Body */}
      <p className="type-body" style={{ color: 'var(--color-muted)' }}>
        {step.body}
      </p>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export function Process() {
  const philRef = useRef<HTMLDivElement>(null);
  const philInView = useInView(philRef, { once: true, margin: '-5% 0px' });

  return (
    <SectionWrapper id="process">
      {/* Section Header */}
      <div
        style={{
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="flex items-end justify-between">
          <div>
            <span className="type-label" style={{ color: 'var(--color-accent)' }}>05</span>
            <div style={{ marginTop: 'var(--space-1)' }}>
              <TextReveal delay={0.1}>
                <h2 className="type-heading" style={{ color: 'var(--color-fg)' }}>
                  Process & Philosophy
                </h2>
              </TextReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps — 4-col horizontal row */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        {processSteps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>

      {/* Philosophy — inline row below */}
      <div
        ref={philRef}
        className="grid grid-cols-1 md:grid-cols-3"
        style={{
          marginTop: 'var(--space-6)',
          gap: 'var(--space-5)',
          paddingTop: 'var(--space-5)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {philosophyPrinciples.map((p, i) => (
          <motion.div
            key={p.title}
            className="flex flex-col"
            style={{ gap: 'var(--space-1)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={philInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: transitions.entrance.duration,
              delay: i * 0.1,
              ease: transitions.entrance.ease,
            }}
          >
            <span className="type-label" style={{ color: 'var(--color-accent)' }}>{p.title}</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
                color: 'var(--color-fg)',
              }}
            >
              {p.statement}
            </span>
            <span className="type-body" style={{ color: 'var(--color-muted)' }}>
              {p.body}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
