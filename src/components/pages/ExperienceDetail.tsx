import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Briefcase, FlaskConical, Calendar, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { experiences } from '../../data/experience';
import { experienceLogos } from '../../data/experienceLogos';
import { TechStack } from '../ui/TechIcon';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';
import { transitions } from '../../utils/spring';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export function ExperienceDetail() {
    const { id } = useParams<{ id: string }>();
    const exp = experiences.find((e) => e.id === id);

    useDocumentMeta({
        title: exp ? `${exp.role} at ${exp.company}` : 'Role not found',
        description: exp?.description,
        path: exp ? `experience/${exp.id}` : undefined,
    });
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
    }, [reducedMotion, id]);

    if (!exp) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ padding: 'var(--outer-margin)' }}>
                <div className="text-center">
                    <h1 className="type-display" style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-4)' }}>
                        Experience not found
                    </h1>
                    <Link to="/" className="type-label" style={{ color: 'var(--color-accent)' }}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const currentIdx = experiences.findIndex((e) => e.id === id);
    const nextExp = experiences[(currentIdx + 1) % experiences.length];
    const Icon = exp.type === 'research' ? FlaskConical : Briefcase;
    const logo = experienceLogos[exp.id];

    return (
        <div className="min-h-screen">
            {/* Back nav */}
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
                <span className="type-label" style={{ color: 'var(--color-muted)' }}>{exp.index} / {String(experiences.length).padStart(2, '0')}</span>
            </div>

            {/* Hero — Company-focused with large icon badge */}
            <div
                ref={heroRef}
                className="relative overflow-hidden"
                style={{
                    paddingTop: 'var(--space-20)',
                    paddingBottom: 'var(--space-12)',
                    paddingLeft: 'var(--outer-margin)',
                    paddingRight: 'var(--outer-margin)',
                    borderBottom: `2px solid ${exp.color}`,
                }}
            >
                {/* Background pattern — diagonal lines */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: 0.015,
                        backgroundImage: `repeating-linear-gradient(45deg, ${exp.color}, ${exp.color} 1px, transparent 1px, transparent 40px)`,
                    }}
                />

                <div className="relative">
                    {/* Icon + type row */}
                    <div data-animate className="flex items-center" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-3)' }}>
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                border: logo ? '2px solid var(--color-border)' : `2px solid ${exp.color}40`,
                                background: logo ? logo.bg : `${exp.color}10`,
                                overflow: 'hidden',
                            }}
                        >
                            {logo ? (
                                <img
                                    src={logo.src}
                                    alt={`${exp.company} logo`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: logo.pad + 3, filter: logo.filter }}
                                    draggable={false}
                                />
                            ) : (
                                <Icon size={22} strokeWidth={1.5} style={{ color: exp.color }} />
                            )}
                        </div>
                        <div>
                            <span className="type-label block" style={{ color: exp.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                {exp.type === 'research' ? 'Research Internship' : 'Software Internship'}
                            </span>
                            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                                <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                    <Calendar size={12} strokeWidth={1.5} />
                                    <span className="type-caption">{exp.period}</span>
                                </div>
                                <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                    <MapPin size={12} strokeWidth={1.5} />
                                    <span className="type-caption">{exp.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company name — large */}
                    <h2 data-animate className="type-subheading" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>
                        {exp.company}
                    </h2>

                    {/* Role — display size */}
                    <h1 data-animate className="type-display" style={{ color: 'var(--color-fg)' }}>
                        {exp.role}
                    </h1>
                </div>
            </div>

            {/* Content — timeline layout with left accent bar */}
            <div ref={contentRef} style={{ padding: 'var(--space-12) var(--outer-margin)', paddingBottom: 'var(--space-20)' }}>
                {/* Overview — full width */}
                <div data-animate style={{ marginBottom: 'var(--space-12)', maxWidth: '72ch' }}>
                    <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>OVERVIEW</span>
                    <p className="type-body" style={{ color: 'var(--color-muted)', lineHeight: 1.8 }}>
                        {exp.description}
                    </p>
                </div>

                {/* Contributions — card grid (unique to experience) */}
                <div data-animate style={{ marginBottom: 'var(--space-12)' }}>
                    <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-5)' }}>KEY CONTRIBUTIONS</span>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-3)' }}>
                        {exp.highlights.map((h, i) => (
                            <motion.div
                                key={i}
                                className="relative group"
                                style={{
                                    padding: 'var(--space-4)',
                                    border: '1px solid var(--color-border)',
                                    borderLeft: `3px solid ${exp.color}40`,
                                    background: 'var(--color-bg)',
                                    transition: `border-color var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-out)`,
                                }}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * transitions.stagger, duration: transitions.entrance.duration, ease: transitions.entrance.ease }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderLeftColor = exp.color;
                                    e.currentTarget.style.background = `${exp.color}05`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderLeftColor = `${exp.color}40`;
                                    e.currentTarget.style.background = 'var(--color-bg)';
                                }}
                            >
                                <span
                                    className="type-caption block"
                                    style={{ color: exp.color, marginBottom: 'var(--space-2)', fontFamily: 'var(--font-mono)' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <p className="type-body" style={{ color: 'var(--color-muted)' }}>
                                    {h}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom row — tech + meta side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-8)' }}>
                    {/* Tech stack */}
                    <div data-animate>
                        <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>TECHNOLOGIES</span>
                        <TechStack techs={exp.tech} iconSize={16} showLabels />
                    </div>

                    {/* Details — horizontal key-value */}
                    <div data-animate>
                        <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>DETAILS</span>
                        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                            {[
                                { label: 'Duration', value: exp.period },
                                { label: 'Type', value: exp.type === 'research' ? 'Research Internship' : 'Software Internship' },
                                { label: 'Location', value: exp.location },
                                { label: 'Company', value: exp.company.split(',')[0] },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
                                    <span className="type-caption" style={{ color: 'var(--color-muted)' }}>{item.label}</span>
                                    <span className="type-body text-right" style={{ color: 'var(--color-muted)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Next experience — with role progression */}
            {experiences.length > 1 && (
                <Link
                    to={`/experience/${nextExp.id}`}
                    className="block group"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                    onMouseEnter={() => setVariant('link')}
                    onMouseLeave={() => setVariant('default')}
                >
                    <div className="flex items-center justify-between" style={{ padding: 'var(--space-12) var(--outer-margin)' }}>
                        <div>
                            <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>NEXT EXPERIENCE</span>
                            <h2 className="type-heading" style={{ color: 'var(--color-fg)', transition: `color var(--duration-base) var(--ease-out)` }}>
                                {nextExp.role}
                            </h2>
                            <span className="type-label block" style={{ color: nextExp.color, marginTop: 'var(--space-2)' }}>{nextExp.company.split(',')[0]}</span>
                        </div>
                        <ArrowUpRight
                            size={28}
                            strokeWidth={1.5}
                            className="flex-shrink-0 group-hover:rotate-45"
                            style={{ color: 'var(--color-muted)', transition: `color var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)` }}
                        />
                    </div>
                </Link>
            )}
        </div>
    );
}
