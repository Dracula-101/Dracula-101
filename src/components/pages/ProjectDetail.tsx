import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { gsap } from 'gsap';
import { projects } from '../../data/projects';
import { projectImages, projectDiagrams, projectIcons } from '../../data/projectImages';
import { TechStack } from '../ui/TechIcon';
import { MagneticButton } from '../ui/MagneticButton';
import { ImagePager } from '../ui/ImagePager';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';
import { transitions } from '../../utils/spring';

export function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const project = projects.find((p) => p.id === id);
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
            { y: 0, opacity: 1, duration: transitions.entrance.duration, ease: 'power4.out', stagger: transitions.stagger }
        );
        tl.fromTo(
            contentRef.current.querySelectorAll('[data-animate]'),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: transitions.entrance.duration, ease: 'power3.out', stagger: transitions.stagger },
            '-=0.3'
        );
    }, [reducedMotion, id]);

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ padding: 'var(--outer-margin)' }}>
                <div className="text-center">
                    <h1
                        className="type-display"
                        style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-4)' }}
                    >
                        Project not found
                    </h1>
                    <Link to="/" className="type-label" style={{ color: 'var(--color-accent)' }}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const currentIdx = projects.findIndex((p) => p.id === id);
    const nextProject = projects[(currentIdx + 1) % projects.length];

    return (
        <div className="min-h-screen">
            {/* Back navigation */}
            <div
                className="fixed top-0 left-0 right-0 flex items-center justify-between"
                style={{
                    zIndex: 'var(--z-nav)',
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
                <span className="type-label" style={{ color: 'var(--color-muted)' }}>
                    {project.index} / {String(projects.length).padStart(2, '0')}
                </span>
            </div>

            {/* Hero — split layout with giant index watermark */}
            <div ref={heroRef} className="relative overflow-hidden" style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-10)', paddingLeft: 'var(--outer-margin)', paddingRight: 'var(--outer-margin)' }}>
                {/* Giant index watermark */}
                <span
                    className="absolute top-0 right-0 select-none pointer-events-none"
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(200px, 30vw, 400px)',
                        fontWeight: 800,
                        lineHeight: 0.85,
                        color: `${project.color}06`,
                        letterSpacing: '-0.04em',
                        transform: 'translate(10%, -5%)',
                    }}
                >
                    {project.index}
                </span>

                <div data-animate className="flex items-center" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
                    <div style={{ width: 32, height: 2, background: project.color }} />
                    <span className="type-label" style={{ color: project.color }}>{project.category}</span>
                    <span className="type-label" style={{ color: 'var(--color-muted)' }}>·</span>
                    <span className="type-label" style={{ color: 'var(--color-muted)' }}>{project.period}</span>
                </div>

                {projectIcons[project.id] && (
                    <div data-animate className="flex items-center type-display" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                        <img
                            src={projectIcons[project.id]}
                            alt={`${project.title} icon`}
                            style={{
                                width: '0.85em',
                                height: '0.85em',
                                borderRadius: 'var(--radius-card)',
                                border: '1px solid var(--color-border)',
                                objectFit: 'cover',
                                flexShrink: 0,
                            }}
                            draggable={false}
                        />
                        <h1
                            className="type-display"
                            style={{ color: 'var(--color-fg)', fontSize: 'inherit' }}
                        >
                            {project.title}
                        </h1>
                    </div>
                )}

                {!projectIcons[project.id] && (
                    <h1
                        data-animate
                        className="type-display"
                        style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-3)' }}
                    >
                        {project.title}
                    </h1>
                )}

                <p
                    data-animate
                    className="type-subheading max-w-2xl"
                    style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}
                >
                    {project.descriptor}
                </p>

                {/* Action buttons */}
                <div data-animate className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
                    {project.github && (
                        <MagneticButton variant="secondary" href={project.github}>
                            <Github size={16} strokeWidth={1.5} />
                            View Source
                        </MagneticButton>
                    )}
                    {project.demo && (
                        <MagneticButton variant="primary" href={project.demo}>
                            <ExternalLink size={16} strokeWidth={1.5} />
                            Live Demo
                        </MagneticButton>
                    )}
                </div>
            </div>

            {/* Stats banner — unique to projects */}
            {project.stats.length > 0 && (
                <motion.div
                    style={{
                        margin: `0 var(--outer-margin)`,
                        marginBottom: 'var(--space-12)',
                        borderTop: `2px solid ${project.color}`,
                        borderBottom: '1px solid var(--color-border)',
                        background: `linear-gradient(180deg, ${project.color}06, transparent)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: transitions.entrance.duration }}
                >
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${project.stats.length}, 1fr)` }}>
                        {project.stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="text-center"
                                style={{
                                    padding: 'var(--space-5) var(--space-3)',
                                    borderRight: i < project.stats.length - 1 ? '1px solid var(--color-border)' : 'none',
                                }}
                            >
                                <span
                                    className="block"
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(24px, 3vw, 36px)',
                                        fontWeight: 700,
                                        letterSpacing: '-0.02em',
                                        color: project.color,
                                        marginBottom: 'var(--space-1)',
                                    }}
                                >
                                    {stat.value}
                                </span>
                                <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Image gallery + diagrams */}
            {(projectImages[project.id] || projectDiagrams[project.id]) && (
                <div style={{ padding: '0 var(--outer-margin)', marginBottom: 'var(--space-12)' }}>
                    <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>GALLERY</span>
                    <ImagePager
                        groups={projectImages[project.id] ?? []}
                        accentColor={project.color}
                        diagrams={projectDiagrams[project.id]}
                    />
                </div>
            )}

            {/* Content */}
            <div ref={contentRef} style={{ padding: '0 var(--outer-margin)', paddingBottom: 'var(--space-20)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 'var(--space-12)' }}>
                    {/* Left column — description */}
                    <div className="lg:col-span-7">
                        <div data-animate>
                            <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>OVERVIEW</span>
                            <p
                                className="type-body"
                                style={{ color: 'var(--color-muted)', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}
                            >
                                {project.description}
                            </p>
                        </div>

                        {/* Highlights — vertical with accent left border */}
                        <div data-animate>
                            <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-5)' }}>KEY HIGHLIGHTS</span>
                            <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
                                {project.highlights.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-start group"
                                        style={{
                                            gap: 'var(--space-3)',
                                            paddingLeft: 'var(--space-4)',
                                            borderLeft: `2px solid var(--color-border)`,
                                            transition: `border-color var(--duration-base) var(--ease-out)`,
                                        }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * transitions.stagger, duration: transitions.entrance.duration, ease: transitions.entrance.ease }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = project.color; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'var(--color-border)'; }}
                                    >
                                        <span className="type-caption flex-shrink-0 mt-0.5" style={{ color: project.color, minWidth: 20 }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="type-body" style={{ color: 'var(--color-muted)' }}>
                                            {h}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column — meta */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-32 flex flex-col" style={{ gap: 'var(--space-6)' }}>
                            {/* Tech stack */}
                            <div data-animate>
                                <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>TECH STACK</span>
                                <TechStack techs={project.tech} iconSize={16} showLabels />
                            </div>

                            {/* Project info */}
                            <div data-animate>
                                <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>PROJECT INFO</span>
                                <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                                    {[
                                        { label: 'Period', value: project.period },
                                        { label: 'Category', value: project.category },
                                        { label: 'Type', value: project.descriptor },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
                                            <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{item.label}</span>
                                            <span className="type-body text-right" style={{ color: 'var(--color-muted)' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Links */}
                            {(project.github || project.demo) && (
                                <div data-animate>
                                    <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>LINKS</span>
                                    <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                                        {project.github && (
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center group"
                                                style={{ gap: 'var(--space-2)', color: 'var(--color-muted)', transition: `color var(--duration-base) var(--ease-out)` }}
                                                onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.color = 'var(--color-accent)'; }}
                                                onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.color = 'var(--color-muted)'; }}
                                            >
                                                <Github size={16} strokeWidth={1.5} />
                                                <span className="type-body">Source Code</span>
                                                <ArrowUpRight size={14} strokeWidth={1.5} className="ml-auto opacity-0 group-hover:opacity-100" style={{ transition: `opacity var(--duration-fast) var(--ease-out)` }} />
                                            </a>
                                        )}
                                        {project.demo && (
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center group"
                                                style={{ gap: 'var(--space-2)', color: 'var(--color-muted)', transition: `color var(--duration-base) var(--ease-out)` }}
                                                onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.color = 'var(--color-accent)'; }}
                                                onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.color = 'var(--color-muted)'; }}
                                            >
                                                <ExternalLink size={16} strokeWidth={1.5} />
                                                <span className="type-body">Live Demo</span>
                                                <ArrowUpRight size={14} strokeWidth={1.5} className="ml-auto opacity-0 group-hover:opacity-100" style={{ transition: `opacity var(--duration-fast) var(--ease-out)` }} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Next project — with color accent */}
            <Link
                to={`/project/${nextProject.id}`}
                className="block group"
                style={{ borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={() => setVariant('link')}
                onMouseLeave={() => setVariant('default')}
            >
                <div className="flex items-center justify-between" style={{ padding: 'var(--space-12) var(--outer-margin)' }}>
                    <div>
                        <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>NEXT PROJECT</span>
                        <h2
                            className="type-heading"
                            style={{
                                color: 'var(--color-fg)',
                                transition: `color var(--duration-base) var(--ease-out)`,
                            }}
                        >
                            {nextProject.title}
                        </h2>
                        <span className="type-label block" style={{ color: nextProject.color, marginTop: 'var(--space-2)' }}>{nextProject.descriptor}</span>
                    </div>
                    <ArrowUpRight
                        size={32}
                        strokeWidth={1.5}
                        className="flex-shrink-0 group-hover:rotate-45"
                        style={{ color: 'var(--color-muted)', transition: `color var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)` }}
                    />
                </div>
            </Link>
        </div>
    );
}
