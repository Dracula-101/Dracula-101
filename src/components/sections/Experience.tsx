import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Briefcase, FlaskConical } from 'lucide-react';
import { experiences, education } from '../../data/experience';
import { experienceLogos } from '../../data/experienceLogos';
import { SectionWrapper } from '../layout/SectionWrapper';
import { TextReveal } from '../ui/TextReveal';
import { useCursorStore } from '../../store/cursor.store';
import { transitions } from '../../utils/spring';

const TYPE_ICONS = {
    internship: Briefcase,
    'full-time': Briefcase,
    research: FlaskConical,
} as const;

function ExperienceCard({ exp, index }: { exp: (typeof experiences)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
    const setVariant = useCursorStore((s) => s.setVariant);
    const navigate = useNavigate();
    const Icon = TYPE_ICONS[exp.type];
    const logo = experienceLogos[exp.id];

    return (
        <motion.div
            ref={ref}
            className="group cursor-none"
            style={{ borderBottom: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...transitions.entrance, delay: index * transitions.stagger }}
            onClick={() => navigate(`/experience/${exp.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/experience/${exp.id}`);
                }
            }}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setVariant('link')}
            onMouseLeave={() => setVariant('default')}
        >
            <div
                className="flex flex-col md:flex-row md:items-center group-hover:translate-x-2 transition-transform"
                style={{
                    padding: `var(--space-4) 0`,
                    gap: 'var(--space-4)',
                    transitionDuration: 'var(--duration-base)',
                    transitionTimingFunction: 'var(--ease-out)',
                }}
            >
                {/* Big company logo */}
                <div
                    className="flex items-center justify-center shrink-0 group-hover:border-(--color-muted) transition-colors"
                    style={{
                        width: 'clamp(64px, 9vw, 104px)',
                        height: 'clamp(64px, 9vw, 104px)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-card)',
                        background: logo ? logo.bg : `${exp.color}08`,
                        transitionDuration: 'var(--duration-base)',
                        overflow: 'hidden',
                    }}
                >
                    {logo ? (
                        <img
                            src={logo.src}
                            alt={`${exp.company} logo`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: logo.pad + 8, filter: logo.filter }}
                            draggable={false}
                        />
                    ) : (
                        <Icon size={28} strokeWidth={1.5} style={{ color: 'var(--color-muted)', opacity: 0.6 }} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <span className="type-label block" style={{ color: 'var(--color-muted)', opacity: 0.6, marginBottom: 6 }}>{exp.period}</span>
                    <h3
                        className="group-hover:text-[var(--color-accent)] transition-colors"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(20px, 2.5vw, 32px)',
                            fontWeight: 'var(--text-heading-weight)' as unknown as number,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                            color: 'var(--color-fg)',
                            transitionDuration: 'var(--duration-base)',
                        }}
                    >
                        {exp.role}
                    </h3>
                    <p className="type-label" style={{ color: 'var(--color-muted)', marginTop: 6 }}>
                        {exp.company} · {exp.location}
                    </p>
                </div>

                {/* Tech pills - desktop only (Tier 2) */}
                <div className="hidden lg:flex items-center flex-shrink-0" style={{ gap: 'var(--space-1)' }}>
                    {exp.tech.slice(0, 3).map((t) => (
                        <span
                            key={t}
                            className="type-caption"
                            style={{
                                color: 'var(--color-muted)',
                                border: '1px solid var(--color-border)',
                                padding: `4px var(--space-1)`,
                                borderRadius: 'var(--radius-subtle)',
                            }}
                        >
                            {t}
                        </span>
                    ))}
                    {exp.tech.length > 3 && (
                        <span className="type-caption" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>+{exp.tech.length - 3}</span>
                    )}
                </div>

                {/* Arrow */}
                <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    className="group-hover:text-[var(--color-accent)] group-hover:rotate-45 transition-all flex-shrink-0 hidden md:block"
                    style={{ color: 'var(--color-muted)', transitionDuration: 'var(--duration-base)' }}
                />
            </div>
        </motion.div>
    );
}

function EducationCard({ edu, index }: { edu: (typeof education)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-5% 0px' });

    return (
        <motion.div
            ref={ref}
            style={{
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...transitions.entrance, delay: index * transitions.stagger }}
        >
            <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <span className="type-label" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>{edu.period}</span>
                {edu.current && (
                    <span className="type-caption" style={{
                        color: 'var(--color-accent)',
                        border: '1px solid rgba(245,166,35,0.2)',
                        padding: '2px var(--space-1)',
                        background: 'rgba(245,166,35,0.05)',
                    }}>
                        CURRENT
                    </span>
                )}
            </div>
            <h4
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(18px, 2vw, 24px)',
                    fontWeight: 'var(--text-heading-weight)' as unknown as number,
                    letterSpacing: '-0.01em',
                    color: 'var(--color-fg)',
                    marginBottom: 4,
                }}
            >
                {edu.degree}
            </h4>
            <p className="type-label" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-1)' }}>{edu.school} · {edu.location}</p>
            <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                <span className="type-caption" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>GPA</span>
                <span
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: 'var(--color-fg)',
                        opacity: 0.7,
                    }}
                >
                    {edu.gpa}
                </span>
            </div>
        </motion.div>
    );
}

export function Experience() {
    return (
        <SectionWrapper id="experience">
            {/* Tier 3 Section Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="type-label" style={{ color: 'var(--color-accent)' }}>03</span>
                <div style={{ marginTop: 'var(--space-1)' }}>
                    <TextReveal delay={0.1}>
                        <h2 className="type-heading" style={{ color: 'var(--color-fg)' }}>
                            Experience
                        </h2>
                    </TextReveal>
                </div>
                <p className="type-body" style={{ color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>Where I've worked</p>
            </div>

            {/* Experience list */}
            <div style={{ marginBottom: 'var(--space-12)' }}>
                {experiences.map((exp, i) => (
                    <ExperienceCard key={exp.id} exp={exp} index={i} />
                ))}
            </div>

            {/* Education */}
            <div>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <span className="type-label" style={{ color: 'var(--color-accent)' }}>Education</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                    {education.map((edu, i) => (
                        <EducationCard key={edu.id} edu={edu} index={i} />
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
