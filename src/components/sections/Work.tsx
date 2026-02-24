import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '../../data/projects';
import { SectionWrapper } from '../layout/SectionWrapper';
import { MarqueeReel } from '../ui/MarqueeReel';
import { TextReveal } from '../ui/TextReveal';
import { useCursorStore } from '../../store/cursor.store';
import { transitions } from '../../utils/spring';

function ProjectRow({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const setVariant = useCursorStore((s) => s.setVariant);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.div
      ref={ref}
      className="relative cursor-none group"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...transitions.entrance, delay: index * transitions.stagger }}
      onMouseEnter={() => {
        setHovered(true);
        setVariant('link');
      }}
      onMouseLeave={() => {
        setHovered(false);
        setVariant('default');
      }}
      onClick={() => navigate(`/project/${project.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/project/${project.id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Hover color accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 3, backgroundColor: project.color }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={transitions.hoverLift}
      />

      <motion.div
        className="flex flex-col md:flex-row md:items-center relative"
        style={{ padding: `var(--space-4) 0`, gap: 'var(--space-4)', zIndex: 'var(--z-base)' as unknown as number }}
        animate={{
          x: hovered ? 16 : 0,
        }}
        transition={transitions.hoverLift}
      >
        {/* Index */}
        <motion.span
          className="type-label hidden md:block"
          animate={{ color: hovered ? project.color : 'var(--color-muted)' }}
          transition={{ duration: 0.15 }}
          style={{ minWidth: '2.5rem', opacity: hovered ? 1 : 0.6 }}
        >
          {project.index}
        </motion.span>

        {/* Title + descriptor */}
        <div className="flex-1 min-w-0">
          <h3
            className="type-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3vw, 42px)',
              fontWeight: 'var(--text-heading-weight)' as unknown as number,
              letterSpacing: 'var(--text-heading-tracking)',
              lineHeight: 1.1,
              color: 'var(--color-fg)',
            }}
          >
            {project.title}
          </h3>
          <motion.p
            className="type-label"
            animate={{
              opacity: hovered ? 1 : 0.4,
              y: hovered ? 0 : 4,
            }}
            transition={{ duration: 0.15 }}
            style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}
          >
            {project.descriptor}
          </motion.p>
        </div>

        {/* Tech pills — desktop (Tier 2 card pattern) */}
        <div className="hidden lg:flex items-center flex-shrink-0" style={{ gap: 'var(--space-1)' }}>
          <AnimatePresence>
            {hovered &&
              project.tech.slice(0, 3).map((t, i) => (
                <motion.span
                  key={t}
                  className="type-caption"
                  style={{
                    color: `${project.color}cc`,
                    borderColor: `${project.color}30`,
                    backgroundColor: `${project.color}08`,
                    border: '1px solid',
                    padding: `4px var(--space-1)`,
                    borderRadius: 'var(--radius-subtle)',
                  }}
                  initial={{ opacity: 0, scale: 0.8, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  {t}
                </motion.span>
              ))}
          </AnimatePresence>
          {!hovered && (
            <span className="type-label" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>{project.category}</span>
          )}
        </div>

        {/* Year */}
        <span className="type-label hidden md:block" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>{project.year}</span>

        {/* Arrow */}
        <motion.div
          animate={{ rotate: hovered ? 45 : 0 }}
          transition={transitions.hoverLift}
          className="hidden md:block flex-shrink-0"
        >
          <ArrowUpRight
            size={20}
            strokeWidth={1.5}
            style={{ color: hovered ? project.color : 'var(--color-muted)' }}
            className="transition-colors"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Work() {
  return (
    <SectionWrapper id="work" fullBleed>
      {/* Tier 3 Section Header */}
      <div style={{ padding: `0 var(--outer-margin)`, marginBottom: 'var(--space-1)' }}>
        <span className="type-label" style={{ color: 'var(--color-accent)' }}>02</span>
      </div>
      <div style={{ padding: `0 var(--outer-margin)`, marginBottom: 'var(--space-2)' }}>
        <TextReveal delay={0.1}>
          <h2
            className="type-heading"
            style={{ color: 'var(--color-fg)' }}
          >
            Work
          </h2>
        </TextReveal>
      </div>
      <div style={{ padding: `0 var(--outer-margin)`, marginBottom: 'var(--space-5)' }}>
        <p className="type-body" style={{ color: 'var(--color-muted)' }}>Selected projects</p>
      </div>

      {/* Marquee divider */}
      <div style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: `var(--space-2) 0`, marginBottom: 'var(--space-6)' }} className="overflow-hidden">
        <MarqueeReel
          text="ECHO · SYNC · JETSCAN · NESTERS"
          speed={35}
          className="type-label text-[var(--color-muted)] opacity-30"
        />
      </div>

      {/* Project list */}
      <div style={{ padding: `0 var(--outer-margin)` }}>
        {projects.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
