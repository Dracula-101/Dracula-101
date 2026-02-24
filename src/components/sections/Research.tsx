import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FileText, FlaskConical, BookOpen } from 'lucide-react';
import { publications, researchProjects } from '../../data/research';
import { SectionWrapper } from '../layout/SectionWrapper';
import { TextReveal } from '../ui/TextReveal';
import { useCursorStore } from '../../store/cursor.store';
import { transitions } from '../../utils/spring';

/* ---------------------------------------------------------------
 * Publication card — shows paper title, conference, year, status
 * --------------------------------------------------------------- */
function PublicationCard({
    pub,
    index,
}: {
    pub: (typeof publications)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
    const setVariant = useCursorStore((s) => s.setVariant);
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            ref={ref}
            className="group cursor-none relative"
            style={{ borderBottom: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: transitions.entrance.duration,
                delay: index * transitions.stagger,
                ease: transitions.entrance.ease,
            }}
            onClick={() => navigate(`/research/${pub.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/research/${pub.id}`);
                }
            }}
            role="button"
            tabIndex={0}
            onMouseEnter={() => {
                setHovered(true);
                setVariant('link');
            }}
            onMouseLeave={() => {
                setHovered(false);
                setVariant('default');
            }}
        >
            {/* Accent bar */}
            <motion.div
                className="absolute left-0 top-0 bottom-0"
                style={{ width: 3, backgroundColor: 'var(--color-accent)', transformOrigin: 'top' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: hovered ? 1 : 0 }}
                transition={{ duration: transitions.hoverLift.duration, ease: transitions.entrance.ease }}
            />

            <div
                className="flex flex-col md:flex-row md:items-start relative"
                style={{
                    padding: 'var(--space-4) 0',
                    gap: 'var(--space-4)',
                    transform: hovered ? 'translateX(8px)' : 'translateX(0)',
                    transition: `transform var(--duration-base) var(--ease-out)`,
                }}
            >
                {/* Icon + Year */}
                <div className="flex items-center flex-shrink-0 md:w-40" style={{ gap: 'var(--space-2)' }}>
                    <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                            width: 40,
                            height: 40,
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        <FileText
                            size={16}
                            strokeWidth={1.5}
                            style={{ color: 'var(--color-muted)' }}
                        />
                    </div>
                    <span className="type-label" style={{ color: 'var(--color-muted)' }}>{pub.year}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3
                        className="type-subheading"
                        style={{
                            color: hovered ? 'var(--color-accent)' : 'var(--color-fg)',
                            transition: `color var(--duration-base) var(--ease-out)`,
                            marginBottom: 'var(--space-1)',
                        }}
                    >
                        {pub.shortTitle}
                    </h3>
                    <p className="type-label" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>
                        {pub.conferenceShort} · {pub.venue.split(',')[0]}
                    </p>

                    {/* Tech pills on hover */}
                    <div className="hidden lg:flex items-center flex-wrap" style={{ gap: 'var(--space-1)' }}>
                        <AnimatePresence>
                            {hovered &&
                                pub.tech.slice(0, 4).map((t, i) => (
                                    <motion.span
                                        key={t}
                                        className="type-caption"
                                        style={{
                                            color: 'var(--color-accent)',
                                            border: '1px solid var(--color-border)',
                                            padding: '2px var(--space-1)',
                                            borderRadius: 'var(--radius-subtle)',
                                        }}
                                        initial={{ opacity: 0, scale: 0.8, x: -6 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2, delay: i * 0.04 }}
                                    >
                                        {t}
                                    </motion.span>
                                ))}
                        </AnimatePresence>
                        {!hovered && (
                            <span className="type-label" style={{ color: 'var(--color-border)' }}>
                                {pub.status === 'published' ? 'Published' : pub.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status badge + Arrow */}
                <div className="hidden md:flex items-center flex-shrink-0" style={{ gap: 'var(--space-2)' }}>
                    <span
                        className="type-caption"
                        style={{
                            padding: '4px var(--space-1)',
                            border: '1px solid var(--color-border)',
                            color: pub.status === 'published' ? 'var(--color-accent)' : 'var(--color-muted)',
                            borderRadius: 'var(--radius-subtle)',
                        }}
                    >
                        {pub.status === 'published' ? 'PUBLISHED' : 'IN REVIEW'}
                    </span>
                    <motion.div
                        animate={{ rotate: hovered ? 45 : 0 }}
                        transition={{ duration: transitions.hoverLift.duration, ease: transitions.entrance.ease }}
                    >
                        <ArrowUpRight
                            size={18}
                            strokeWidth={1.5}
                            style={{
                                color: hovered ? 'var(--color-accent)' : 'var(--color-muted)',
                                transition: `color var(--duration-fast) var(--ease-out)`,
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

/* ---------------------------------------------------------------
 * Research project card (Tier 2 card pattern)
 * --------------------------------------------------------------- */
function ResearchProjectCard({
    project,
    index,
}: {
    project: (typeof researchProjects)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
    const setVariant = useCursorStore((s) => s.setVariant);
    const navigate = useNavigate();

    return (
        <motion.div
            ref={ref}
            className="group cursor-none"
            style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                transition: `border-color var(--duration-base) var(--ease-out)`,
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            whileHover={{ y: -4, transition: { duration: transitions.hoverLift.duration } }}
            transition={{
                duration: transitions.entrance.duration,
                delay: index * transitions.stagger,
                ease: transitions.entrance.ease,
            }}
            onClick={() => navigate(`/research/${project.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/research/${project.id}`);
                }
            }}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setVariant('link')}
            onMouseLeave={() => setVariant('default')}
        >
            {/* Icon + period */}
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: 40,
                        height: 40,
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <FlaskConical
                        size={16}
                        strokeWidth={1.5}
                        style={{ color: 'var(--color-accent)' }}
                    />
                </div>
                <span className="type-label" style={{ color: 'var(--color-muted)' }}>{project.period}</span>
            </div>

            <h3
                className="type-subheading"
                style={{
                    color: 'var(--color-fg)',
                    marginBottom: 'var(--space-1)',
                    transition: `color var(--duration-base) var(--ease-out)`,
                }}
            >
                {project.title}
            </h3>

            <p className="type-label" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>{project.descriptor}</p>

            <p
                className="type-body line-clamp-3"
                style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}
            >
                {project.description}
            </p>

            {/* Tech pills */}
            <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-1)' }}>
                {project.tech.slice(0, 4).map((t) => (
                    <span
                        key={t}
                        className="type-caption"
                        style={{
                            color: 'var(--color-muted)',
                            border: '1px solid var(--color-border)',
                            padding: '2px var(--space-1)',
                            borderRadius: 'var(--radius-subtle)',
                        }}
                    >
                        {t}
                    </span>
                ))}
                {project.tech.length > 4 && (
                    <span className="type-caption" style={{ color: 'var(--color-muted)' }}>
                        +{project.tech.length - 4}
                    </span>
                )}
            </div>

            {/* Bottom accent */}
            <motion.div
                style={{
                    height: 1,
                    marginTop: 'var(--space-3)',
                    background: 'var(--color-accent)',
                    transformOrigin: 'left',
                }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: index * transitions.stagger + 0.4 }}
            />
        </motion.div>
    );
}

/* ---------------------------------------------------------------
 * Main Research section
 * --------------------------------------------------------------- */
export function Research() {
    return (
        <SectionWrapper id="research">
            {/* Section Header */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
                <span className="type-label" style={{ color: 'var(--color-accent)' }}>03</span>
                <div style={{ marginTop: 'var(--space-1)' }}>
                    <TextReveal delay={0.1}>
                        <h2 className="type-heading" style={{ color: 'var(--color-fg)' }}>
                            Research
                        </h2>
                    </TextReveal>
                </div>
                <p className="type-body" style={{ color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>Where I've worked</p>
            </div>

            {/* Stats strip */}
            <div
                className="grid grid-cols-3"
                style={{
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-8)',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                }}
            >
                {[
                    { value: `${publications.length}`, label: 'Publications' },
                    {
                        value: `${new Set(publications.map((p) => p.conferenceShort)).size}`,
                        label: 'Conferences',
                    },
                    { value: '4+', label: 'Research Domains' },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center text-center" style={{ gap: 'var(--space-1)' }}>
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(24px, 3vw, 40px)',
                                fontWeight: 'var(--text-heading-weight)' as unknown as number,
                                letterSpacing: 'var(--text-heading-tracking)',
                                lineHeight: 1,
                                color: 'var(--color-fg)',
                            }}
                        >
                            {stat.value}
                        </span>
                        <span className="type-label" style={{ color: 'var(--color-muted)' }}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Publications list */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
                <span className="type-caption" style={{ color: 'var(--color-muted)', letterSpacing: '0.2em' }}>
                    PUBLICATIONS
                </span>
            </div>

            <div className="relative" style={{ marginBottom: 'var(--space-10)' }}>
                {publications.map((pub, i) => (
                    <PublicationCard key={pub.id} pub={pub} index={i} />
                ))}
            </div>

            {/* Research projects */}
            {researchProjects.length > 0 && (
                <>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <span className="type-caption" style={{ color: 'var(--color-muted)', letterSpacing: '0.2em' }}>
                            RESEARCH PROJECTS
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                        {researchProjects.map((project, i) => (
                            <ResearchProjectCard key={project.id} project={project} index={i} />
                        ))}
                    </div>
                </>
            )}
        </SectionWrapper>
    );
}
