import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Briefcase,
  FlaskConical,
} from 'lucide-react';
import { experiences, education, skills } from '../../data/experience';
import { projects } from '../../data/projects';
import { MagneticButton } from '../ui/MagneticButton';
import { TechIcon } from '../ui/TechIcon';
import { CountUp } from '../ui/CountUp';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';
import { transitions } from '../../utils/spring';

const CONTACT_PILLS = [
  { icon: Mail, label: 'pratikpujari1000@gmail.com', href: 'mailto:pratikpujari1000@gmail.com' },
  { icon: Phone, label: '+1 (303) 620-6112', href: 'tel:+13036206112' },
  { icon: MapPin, label: 'Boulder, CO' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/Dracula-101' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/pratik-pujari-3472bb226' },
];

const STATS = [
  { display: '3.96', label: 'GPA AT CU BOULDER' },
  { value: 4, label: 'PROJECTS SHIPPED', suffix: '+' },
  { value: 2, label: 'INTERNSHIPS' },
  { value: 10, label: 'TECHNOLOGIES', suffix: '+' },
];

const SKILL_GROUPS = [
  { title: 'LANGUAGES', items: skills.languages },
  { title: 'DATABASES', items: skills.databases },
  { title: 'FRAMEWORKS', items: skills.frameworks },
  { title: 'TOOLS', items: skills.tools },
];

export function ResumePage() {
  const setVariant = useCursorStore((s) => s.setVariant);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !heroRef.current || !contentRef.current) return;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(
      heroRef.current.querySelectorAll('[data-animate]'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: transitions.entrance.duration, ease: 'power4.out', stagger: transitions.stagger },
    );
    tl.fromTo(
      contentRef.current.querySelectorAll('[data-animate]'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: transitions.entrance.duration, ease: 'power3.out', stagger: transitions.stagger },
      '-=0.3',
    );
  }, [reducedMotion]);

  return (
    <div className="min-h-screen">
      {/* ---- Fixed back nav ---- */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-between"
        style={{
          zIndex: 'var(--z-nav)' as unknown as number,
          padding: 'var(--space-5) var(--outer-margin)',
          background: 'linear-gradient(to bottom, var(--color-bg) 40%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Link
          to="/"
          className="flex items-center group"
          style={{ gap: 'var(--space-2)', color: 'var(--color-muted)', transition: `color var(--duration-base) var(--ease-out)` }}
          onMouseEnter={() => setVariant('button')}
          onMouseLeave={() => setVariant('default')}
        >
          <ArrowLeft size={18} strokeWidth={1.5} className="group-hover:-translate-x-1" style={{ transition: `transform var(--duration-base) var(--ease-out)` }} />
          <span className="type-label">BACK</span>
        </Link>
        <span className="type-label" style={{ color: 'var(--color-muted)' }}>RESUME</span>
      </div>

      {/* ---- Hero ---- */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-10)', paddingLeft: 'var(--outer-margin)', paddingRight: 'var(--outer-margin)' }}
      >
        {/* Watermark */}
        <span
          className="absolute top-0 right-0 select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(200px, 30vw, 400px)',
            fontWeight: 800,
            lineHeight: 0.85,
            color: 'rgba(245, 166, 35, 0.03)',
            letterSpacing: '-0.04em',
          }}
        >
          CV
        </span>

        <div className="flex flex-col lg:flex-row lg:items-start" style={{ gap: 'var(--space-8)' }}>
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            {/* Accent bar + label */}
            <div data-animate className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span style={{ width: 32, height: 2, background: 'var(--color-accent)', display: 'block' }} />
              <span className="type-label" style={{ color: 'var(--color-accent)' }}>CURRICULUM VITAE</span>
            </div>

            {/* Name */}
            <h1
              data-animate
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 8vw, 100px)',
                fontWeight: 700,
                letterSpacing: 'var(--text-display-tracking)',
                lineHeight: 0.95,
                color: 'var(--color-fg)',
                marginBottom: 'var(--space-3)',
              }}
            >
              PRATIK<br />PUJARI
            </h1>

            {/* Subtitle */}
            <p
              data-animate
              className="type-subheading"
              style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}
            >
              Full-Stack Engineer & Builder
            </p>

            {/* Contact pills */}
            <div data-animate className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              {CONTACT_PILLS.map((pill) => {
                const inner = (
                  <>
                    <pill.icon size={12} strokeWidth={1.5} />
                    <span className="type-caption">{pill.label}</span>
                  </>
                );
                const style: React.CSSProperties = {
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-1) var(--space-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  color: 'var(--color-muted)',
                  transition: `border-color var(--duration-base) var(--ease-out)`,
                };
                return pill.href ? (
                  <a
                    key={pill.label}
                    href={pill.href}
                    target={pill.href.startsWith('mailto:') || pill.href.startsWith('tel:') ? undefined : '_blank'}
                    rel={pill.href.startsWith('mailto:') || pill.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                    style={style}
                    onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    {inner}
                  </a>
                ) : (
                  <span key={pill.label} style={style}>{inner}</span>
                );
              })}
            </div>

            {/* Download button */}
            <div data-animate>
              <MagneticButton variant="primary" href={`${import.meta.env.BASE_URL}resume.pdf`} download strength={0.08}>
                Download PDF
                <Download size={16} strokeWidth={1.5} />
              </MagneticButton>
            </div>
          </div>

          {/* Right: PDF preview */}
          <motion.div
            data-animate
            className="hidden lg:block flex-shrink-0"
            style={{ width: 380 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...transitions.entrance }}
          >
            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              onMouseEnter={() => setVariant('link')}
              onMouseLeave={() => setVariant('default')}
            >
              <div
                className="relative overflow-hidden rounded-sm group-hover:shadow-2xl transition-shadow"
                style={{
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                  transitionDuration: 'var(--duration-base)',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}resume-preview.png`}
                  alt="Resume preview"
                  className="w-full h-auto block"
                  loading="eager"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(2px)',
                    transitionDuration: 'var(--duration-base)',
                  }}
                >
                  <span
                    className="type-label flex items-center"
                    style={{
                      color: '#fff',
                      gap: 'var(--space-1)',
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    VIEW FULL PDF <ArrowUpRight size={14} strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div ref={contentRef}>
        {/* Stats banner */}
        <div
          data-animate
          style={{
            borderTop: '2px solid var(--color-accent)',
            borderBottom: '1px solid var(--color-border)',
            padding: `var(--space-6) var(--outer-margin)`,
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-6)' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 5vw, 48px)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  {'display' in stat ? stat.display : <CountUp to={stat.value!} suffix={stat.suffix || ''} />}
                </span>
                <span className="type-caption" style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <ResumeSection title="EDUCATION">
          <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
            {education.map((edu, i) => (
              <motion.div
                key={edu.id}
                initial={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ delay: i * transitions.stagger, ...transitions.entrance }}
                style={{
                  borderLeft: `3px solid ${edu.current ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderLeftWidth: 3,
                  borderLeftColor: edu.current ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span
                      className="type-body"
                      style={{ fontWeight: 600, color: 'var(--color-fg)' }}
                    >
                      {edu.degree}
                    </span>
                    {edu.current && (
                      <span className="flex items-center" style={{ gap: 4 }}>
                        <span
                          className="animate-pulse"
                          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'block' }}
                        />
                        <span className="type-caption" style={{ color: 'var(--color-accent)' }}>CURRENT</span>
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 'clamp(18px, 2vw, 24px)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {edu.gpa}
                  </span>
                </div>
                <p className="type-caption" style={{ color: 'var(--color-muted)' }}>
                  {edu.school} &middot; {edu.location} &middot; {edu.period}
                </p>
              </motion.div>
            ))}
          </div>
        </ResumeSection>

        {/* Experience */}
        <ResumeSection title="EXPERIENCE">
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            {experiences.map((exp, i) => {
              const Icon = exp.type === 'research' ? FlaskConical : Briefcase;
              return (
                <motion.div
                  key={exp.id}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5%' }}
                  transition={{ delay: i * transitions.stagger, ...transitions.entrance }}
                >
                  <Link
                    to={`/experience/${exp.id}`}
                    className="group block"
                    style={{
                      border: '1px solid var(--color-border)',
                      borderLeftWidth: 3,
                      borderLeftColor: `${exp.color}60`,
                      padding: 'var(--space-4)',
                      transition: `border-color var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-out)`,
                    }}
                    onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = `${exp.color}40`; e.currentTarget.style.background = `${exp.color}06`; }}
                    onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.borderLeftColor = `${exp.color}60`; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                      <div>
                        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <Icon size={16} strokeWidth={1.5} style={{ color: exp.color }} />
                          <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{exp.period}</span>
                        </div>
                        <h3
                          className="group-hover:text-[var(--color-accent)]"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(18px, 2.5vw, 28px)',
                            fontWeight: 700,
                            color: 'var(--color-fg)',
                            lineHeight: 1.2,
                            transition: `color var(--duration-base) var(--ease-out)`,
                          }}
                        >
                          {exp.role}
                        </h3>
                        <p className="type-caption" style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
                          {exp.company} &middot; {exp.location}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.5}
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                        style={{ color: 'var(--color-accent)', transitionDuration: 'var(--duration-base)', marginTop: 'var(--space-1)' }}
                      />
                    </div>
                    <ul className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                      {exp.highlights.slice(0, 2).map((h, j) => (
                        <li
                          key={j}
                          className="type-body"
                          style={{
                            color: 'var(--color-muted)',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            paddingLeft: 'var(--space-3)',
                            borderLeft: `1px solid var(--color-border)`,
                          }}
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </ResumeSection>

        {/* Projects */}
        <ResumeSection title="SELECTED PROJECTS">
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-3)' }}>
            {projects.map((proj, i) => (
              <motion.div
                key={proj.id}
                className={i === 0 ? 'lg:col-span-2' : ''}
                initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ delay: i * transitions.stagger, ...transitions.entrance }}
              >
                <Link
                  to={`/project/${proj.id}`}
                  className="group block h-full"
                  style={{
                    border: '1px solid var(--color-border)',
                    padding: 'var(--space-4)',
                    transition: `border-color var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-out)`,
                  }}
                  onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = `${proj.color}40`; e.currentTarget.style.background = `${proj.color}06`; }}
                  onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ display: 'block', width: '100%', height: 2, background: proj.color, marginBottom: 'var(--space-3)', opacity: 0.5 }} />
                  <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <h3
                      className="group-hover:text-[var(--color-accent)]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(20px, 2.5vw, 32px)',
                        fontWeight: 700,
                        color: 'var(--color-fg)',
                        lineHeight: 1.2,
                        transition: `color var(--duration-base) var(--ease-out)`,
                      }}
                    >
                      {proj.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.5}
                      className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                      style={{ color: 'var(--color-accent)', transitionDuration: 'var(--duration-base)' }}
                    />
                  </div>
                  <p className="type-caption" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
                    {proj.descriptor} &middot; {proj.category} &middot; {proj.year}
                  </p>
                  <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
                    {proj.tech.slice(0, 4).map((t, j) => (
                      <span key={t} className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                        {j > 0 && <span style={{ color: 'var(--color-accent)', fontSize: 8 }}>&bull;</span>}
                        <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{t}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </ResumeSection>

        {/* Skills */}
        <ResumeSection title="TECHNICAL SKILLS">
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            {SKILL_GROUPS.map((group, gi) => (
              <motion.div
                key={group.title}
                initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ delay: gi * transitions.stagger, ...transitions.entrance }}
                style={{
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-4)',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="type-label" style={{ color: 'var(--color-accent)' }}>{group.title}</span>
                  <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{group.items.length}</span>
                </div>
                <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center"
                      style={{
                        gap: 'var(--space-1)',
                        border: '1px solid var(--color-border)',
                        padding: '6px var(--space-2)',
                        transition: `border-color var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-out)`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <TechIcon name={item} size={14} />
                      <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </ResumeSection>
      </div>
    </div>
  );
}

/* ---- Reusable section wrapper ---- */
function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  return (
    <motion.section
      ref={ref}
      initial={reducedMotion ? undefined : { opacity: 0 }}
      animate={reducedMotion ? undefined : isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={transitions.entrance}
      style={{ padding: `var(--space-10) var(--outer-margin)`, borderTop: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <span style={{ width: 24, height: 2, background: 'var(--color-accent)', display: 'block' }} />
        <h2 className="type-label" style={{ color: 'var(--color-muted)', letterSpacing: '0.14em' }}>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
