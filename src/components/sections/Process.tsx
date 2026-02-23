import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, GitBranch, Code2, Zap } from 'lucide-react';
import { processSteps, philosophyPrinciples } from '../../data/process';
import { SectionWrapper } from '../layout/SectionWrapper';
import { TextReveal } from '../ui/TextReveal';
import { transitions } from '../../utils/spring';

const ICONS = { Search, GitBranch, Code2, Zap } as const;

/* ─── Process Step Card ─── */
function ProcessCard({ step, index }: { step: typeof processSteps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
  const [hovered, setHovered] = useState(false);
  const Icon = ICONS[step.icon as keyof typeof ICONS];

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: 'var(--color-bg)',
        padding: 'var(--space-4)',
        gap: 'var(--space-2)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: transitions.entrance.duration,
        delay: index * transitions.stagger,
        ease: transitions.entrance.ease,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent bar on hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 3, background: 'var(--color-accent)', transformOrigin: 'top' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={transitions.hoverLift}
      />

      {/* Number + Icon row */}
      <div className="flex items-center justify-between">
        <span
          className="select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--color-border)',
          }}
        >
          {step.number}
        </span>
        {Icon && (
          <motion.div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              border: '1px solid var(--color-border)',
            }}
            animate={{ color: hovered ? 'var(--color-accent)' : 'var(--color-muted)' }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={20} strokeWidth={1.5} />
          </motion.div>
        )}
      </div>

      {/* Title */}
      <h3 className="type-subheading" style={{ color: 'var(--color-fg)' }}>
        {step.title}
      </h3>

      {/* Body */}
      <p className="type-body" style={{ color: 'var(--color-muted)' }}>
        {step.body}
      </p>

      {/* Bottom accent line */}
      <motion.div
        className="mt-auto"
        style={{ height: 1, background: 'var(--color-accent)', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * transitions.stagger + 0.3 }}
      />
    </motion.div>
  );
}

/* ─── Philosophy Principle Card ─── */
function PhilosophyCard({
  principle,
  index,
}: {
  principle: typeof philosophyPrinciples[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px' });

  return (
    <motion.div
      ref={ref}
      className="relative"
      style={{
        paddingLeft: 'var(--space-3)',
        borderLeft: '2px solid var(--color-border)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: transitions.entrance.duration,
        delay: index * 0.12,
        ease: transitions.entrance.ease,
      }}
    >
      {/* Accent bar fill on scroll */}
      <motion.div
        className="absolute top-0 bottom-0"
        style={{
          left: -2,
          width: 2,
          background: 'var(--color-accent)',
          transformOrigin: 'top',
        }}
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.12 + 0.3 }}
      />

      {/* Title label */}
      <p
        className="type-label"
        style={{ color: 'var(--color-accent)', textTransform: 'uppercase' }}
      >
        {principle.title}
      </p>

      {/* Bold statement */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18px, 2vw, 24px)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: 'var(--color-fg)',
          marginTop: 'var(--space-1)',
        }}
      >
        {principle.statement}
      </p>

      {/* Supporting body */}
      <p
        className="type-body"
        style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}
      >
        {principle.body}
      </p>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export function Process() {
  return (
    <SectionWrapper id="process">
      {/* Section Header — matches Work / Experience / Research pattern */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <span className="type-label" style={{ color: 'var(--color-accent)' }}>04</span>
        <div style={{ marginTop: 'var(--space-1)' }}>
          <TextReveal delay={0.1}>
            <h2 className="type-heading" style={{ color: 'var(--color-fg)' }}>
              Process
            </h2>
          </TextReveal>
        </div>
        <p className="type-body" style={{ color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>How I build things</p>
      </div>

      {/* Process Cards Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{ gap: 1, background: 'var(--color-border)' }}
      >
        {processSteps.map((step, i) => (
          <ProcessCard key={step.number} step={step} index={i} />
        ))}
      </div>

      {/* Philosophy Section */}
      <div style={{ marginTop: 'var(--space-10)' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <span className="type-label" style={{ color: 'var(--color-accent)' }}>
            Philosophy
          </span>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 'var(--space-6)' }}
        >
          {philosophyPrinciples.map((principle, i) => (
            <PhilosophyCard key={principle.title} principle={principle} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
