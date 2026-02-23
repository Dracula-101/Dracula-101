import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowUpRight,
    FileText,
    FlaskConical,
    Calendar,
    MapPin,
    BookOpen,
    ExternalLink,
    Download,
} from 'lucide-react';
import { gsap } from 'gsap';
import { publications, researchProjects } from '../../data/research';
import { TechStack } from '../ui/TechIcon';
import { useCursorStore } from '../../store/cursor.store';
import { useUIStore } from '../../store/ui.store';
import { transitions } from '../../utils/spring';

type ResearchItem =
    | ((typeof publications)[0] & { kind: 'publication' })
    | ((typeof researchProjects)[0] & { kind: 'project' });

function findItem(id: string): ResearchItem | null {
    const pub = publications.find((p) => p.id === id);
    if (pub) return { ...pub, kind: 'publication' };
    const proj = researchProjects.find((p) => p.id === id);
    if (proj) return { ...proj, kind: 'project' };
    return null;
}

/* All items in order for next navigation */
const allItems = [
    ...publications.map((p) => ({ id: p.id, label: p.shortTitle ?? p.title })),
    ...researchProjects.map((p) => ({ id: p.id, label: p.title })),
];

const ABSTRACT_CHAR_LIMIT = 400;

function AbstractBlock({ text, label }: { text: string; label: string }) {
    const [expanded, setExpanded] = useState(false);
    const needsTruncation = text.length > ABSTRACT_CHAR_LIMIT;
    const displayed = !needsTruncation || expanded ? text : text.slice(0, ABSTRACT_CHAR_LIMIT).replace(/\s+\S*$/, '') + '…';

    return (
        <div data-animate style={{ marginBottom: 'var(--space-10)' }}>
            <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
                {label}
            </span>
            <p className="type-body" style={{ color: 'var(--color-muted)', lineHeight: 1.8 }}>
                {displayed}
            </p>
            {needsTruncation && (
                <button
                    type="button"
                    className="type-label"
                    style={{ color: 'var(--color-accent)', marginTop: 'var(--space-2)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? '← Show less' : 'Read more →'}
                </button>
            )}
        </div>
    );
}

export function ResearchDetail() {
    const { id } = useParams<{ id: string }>();
    const item = id ? findItem(id) : null;
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

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ padding: 'var(--outer-margin)' }}>
                <div className="text-center">
                    <h1 className="type-display" style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-4)' }}>
                        Research not found
                    </h1>
                    <Link to="/" className="type-label" style={{ color: 'var(--color-accent)' }}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const currentIdx = allItems.findIndex((i) => i.id === id);
    const nextItem = allItems[(currentIdx + 1) % allItems.length];

    const isPub = item.kind === 'publication';
    const Icon = isPub ? FileText : FlaskConical;
    const hasPaper = isPub && !!item.paper;

    return (
        <div className="min-h-screen">
            {/* Top bar */}
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
                    {isPub ? 'PUBLICATION' : 'RESEARCH PROJECT'}
                </span>
            </div>

            {/* ── Main two-column layout ── */}
            <div
                ref={heroRef}
                className="lg:flex"
                style={{
                    minHeight: '100vh',
                    paddingTop: 64,
                }}
            >
                {/* ─── Left: sticky PDF (40%) ─── */}
                {hasPaper && (
                    <div
                        data-animate
                        className="hidden lg:block"
                        style={{
                            flex: '0 0 40%',
                            position: 'sticky',
                            top: 64,
                            height: 'calc(100vh - 64px)',
                            borderRight: '1px solid var(--color-border)',
                            background: '#0e0e0e',
                            overflow: 'hidden',
                            paddingLeft: 'var(--outer-margin)',
                            cursor: 'default',
                            pointerEvents: 'auto',
                        }}
                    >
                        {/* PDF header bar */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 20px',
                                background: '#141414',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                                <FileText size={14} strokeWidth={1.5} style={{ color: item.color }} />
                                <span className="type-caption" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    paper.pdf
                                </span>
                            </div>
                            <a
                                href={item.paper}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                                style={{
                                    gap: 4,
                                    padding: '4px 12px',
                                    borderRadius: 6,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-muted)',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    textDecoration: 'none',
                                }}
                                onMouseEnter={(e) => {
                                    setVariant('link');
                                    e.currentTarget.style.background = item.color;
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.borderColor = item.color;
                                }}
                                onMouseLeave={(e) => {
                                    setVariant('default');
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.color = 'var(--color-muted)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                <Download size={12} strokeWidth={2} />
                                Open PDF
                            </a>
                        </div>

                        {/* PDF embed — fills remaining height */}
                        <div style={{ position: 'relative' }}>
                            <object
                                data={`${item.paper}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                type="application/pdf"
                                style={{
                                    width: '100%',
                                    height: 'calc(100vh - 64px - 45px)',
                                    display: 'block',
                                    background: '#fff',
                                }}
                            >
                                <div
                                    className="flex flex-col items-center justify-center"
                                    style={{
                                        height: '100%',
                                        gap: 'var(--space-3)',
                                        background: 'rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <FileText size={48} strokeWidth={1} style={{ color: 'var(--color-border)' }} />
                                    <span className="type-body" style={{ color: 'var(--color-muted)' }}>
                                        PDF preview unavailable
                                    </span>
                                    <a
                                        href={item.paper}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="type-label"
                                        style={{ color: item.color }}
                                    >
                                        Open PDF →
                                    </a>
                                </div>
                            </object>
                            {/* Invisible overlay so the custom cursor can track mousemove over the PDF */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 1,
                                    cursor: 'none',
                                }}
                                onClick={() => window.open(item.paper, '_blank')}
                                onMouseEnter={() => setVariant('button')}
                                onMouseLeave={() => setVariant('default')}
                            />
                        </div>
                    </div>
                )}

                {/* ─── Right: all content (60% on lg, 100% on mobile) ─── */}
                <div
                    ref={contentRef}
                    style={{
                        minWidth: 0,
                    }}
                    className={hasPaper ? 'lg:flex-[0_0_60%]' : ''}
                >
                    {/* Hero section */}
                    <div
                        className="relative"
                        style={{
                            paddingTop: 'var(--space-12)',
                            paddingBottom: 'var(--space-10)',
                            paddingLeft: 'var(--outer-margin)',
                            paddingRight: 'var(--outer-margin)',
                        }}
                    >
                        {/* Subtle ruled-paper background */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                opacity: 0.02,
                                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 31px, ${item.color} 31px, ${item.color} 32px)`,
                            }}
                        />

                        <div className="relative" style={{ maxWidth: 720 }}>
                            {/* Type + status */}
                            <div data-animate className="flex items-center flex-wrap" style={{ marginBottom: 'var(--space-5)', gap: 'var(--space-2)' }}>
                                <Icon size={14} strokeWidth={1.5} style={{ color: item.color }} />
                                <span className="type-label" style={{ color: item.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {isPub ? 'Published Paper' : 'Research Project'}
                                </span>
                                {isPub && (
                                    <span
                                        className="type-caption"
                                        style={{
                                            padding: '2px var(--space-2)',
                                            border: `1px solid ${item.status === 'published' ? item.color + '40' : 'var(--color-border)'}`,
                                            borderRadius: '999px',
                                            color: item.status === 'published' ? item.color : 'var(--color-muted)',
                                        }}
                                    >
                                        {item.status === 'published' ? 'PUBLISHED' : 'IN REVIEW'}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1
                                data-animate
                                className="type-heading"
                                style={{
                                    color: 'var(--color-fg)',
                                    marginBottom: 'var(--space-5)',
                                    lineHeight: 1.2,
                                    fontSize: 'clamp(24px, 3vw, 40px)',
                                }}
                            >
                                {item.title}
                            </h1>

                            {/* Citation-style metadata bar */}
                            <div
                                data-animate
                                className="flex items-center flex-wrap"
                                style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}
                            >
                                {isPub && (
                                    <>
                                        <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                            <BookOpen size={13} strokeWidth={1.5} />
                                            <span className="type-caption" style={{ fontStyle: 'italic' }}>{item.conferenceShort}</span>
                                        </div>
                                        <span style={{ color: 'var(--color-border)' }}>|</span>
                                        <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                            <MapPin size={13} strokeWidth={1.5} />
                                            <span className="type-caption">{item.venue}</span>
                                        </div>
                                        <span style={{ color: 'var(--color-border)' }}>|</span>
                                        <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                            <Calendar size={13} strokeWidth={1.5} />
                                            <span className="type-caption">{item.year}</span>
                                        </div>
                                    </>
                                )}
                                {!isPub && (
                                    <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-muted)' }}>
                                        <Calendar size={13} strokeWidth={1.5} />
                                        <span className="type-caption">{item.period}</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick action links */}
                            {(item.github || (isPub && (item.doi || item.arxiv))) && (
                                <div data-animate className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
                                    {isPub && item.doi && (
                                        <a
                                            href={item.doi}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center type-caption"
                                            style={{
                                                gap: 'var(--space-1)',
                                                padding: 'var(--space-1) var(--space-3)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '999px',
                                                color: 'var(--color-muted)',
                                                transition: `all var(--duration-base) var(--ease-out)`,
                                            }}
                                            onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = item.color; e.currentTarget.style.color = item.color; }}
                                            onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                        >
                                            <ExternalLink size={11} strokeWidth={1.5} />
                                            DOI
                                        </a>
                                    )}
                                    {isPub && item.arxiv && (
                                        <a
                                            href={item.arxiv}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center type-caption"
                                            style={{
                                                gap: 'var(--space-1)',
                                                padding: 'var(--space-1) var(--space-3)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '999px',
                                                color: 'var(--color-muted)',
                                                transition: `all var(--duration-base) var(--ease-out)`,
                                            }}
                                            onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = item.color; e.currentTarget.style.color = item.color; }}
                                            onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                        >
                                            <FileText size={11} strokeWidth={1.5} />
                                            arXiv
                                        </a>
                                    )}
                                    {item.github && (
                                        <a
                                            href={item.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center type-caption"
                                            style={{
                                                gap: 'var(--space-1)',
                                                padding: 'var(--space-1) var(--space-3)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '999px',
                                                color: 'var(--color-muted)',
                                                transition: `all var(--duration-base) var(--ease-out)`,
                                            }}
                                            onMouseEnter={(e) => { setVariant('link'); e.currentTarget.style.borderColor = item.color; e.currentTarget.style.color = item.color; }}
                                            onMouseLeave={(e) => { setVariant('default'); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                        >
                                            <ExternalLink size={11} strokeWidth={1.5} />
                                            Code
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Accent rule */}
                    <div style={{ padding: '0 var(--outer-margin)' }}>
                        <motion.div
                            style={{ height: 1, maxWidth: 720, background: `linear-gradient(90deg, ${item.color}60, transparent)` }}
                            initial={{ scaleX: 0, transformOrigin: 'left' }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.3, ease: transitions.entrance.ease }}
                        />
                    </div>

                    {/* Content body */}
                    <div style={{ padding: 'var(--outer-margin)', paddingBottom: 'var(--space-20)' }}>
                        <div style={{ maxWidth: 720 }}>
                            {/* Mobile-only PDF link */}
                            {hasPaper && (
                                <div
                                    data-animate
                                    className="lg:hidden"
                                    style={{ marginBottom: 'var(--space-8)' }}
                                >
                                    <a
                                        href={item.paper}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center type-label"
                                        style={{
                                            gap: 'var(--space-2)',
                                            padding: 'var(--space-3) var(--space-5)',
                                            border: `1px solid ${item.color}40`,
                                            borderRadius: 'var(--radius-card)',
                                            color: item.color,
                                            background: `${item.color}08`,
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `${item.color}15`;
                                            e.currentTarget.style.borderColor = item.color;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = `${item.color}08`;
                                            e.currentTarget.style.borderColor = `${item.color}40`;
                                        }}
                                    >
                                        <FileText size={16} strokeWidth={1.5} />
                                        View Research Paper (PDF)
                                        <ArrowUpRight size={14} strokeWidth={1.5} />
                                    </a>
                                </div>
                            )}

                            {/* Abstract / Description */}
                            <AbstractBlock text={isPub ? item.abstract : item.description} label={isPub ? 'ABSTRACT' : 'OVERVIEW'} />

                            {/* Key contributions */}
                            <div data-animate style={{ marginBottom: 'var(--space-10)' }}>
                                <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-5)' }}>
                                    {isPub ? 'KEY CONTRIBUTIONS' : 'HIGHLIGHTS'}
                                </span>
                                <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
                                    {item.highlights.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-start"
                                            style={{
                                                gap: 'var(--space-3)',
                                                paddingBottom: 'var(--space-4)',
                                                borderBottom: i < item.highlights.length - 1 ? '1px dashed var(--color-border)' : 'none',
                                            }}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.5 + i * transitions.stagger,
                                                duration: transitions.entrance.duration,
                                                ease: transitions.entrance.ease,
                                            }}
                                        >
                                            <span
                                                className="flex-shrink-0 type-caption"
                                                style={{
                                                    color: item.color,
                                                    fontFamily: 'var(--font-mono)',
                                                    minWidth: 28,
                                                    paddingTop: 2,
                                                }}
                                            >
                                                [{i + 1}]
                                            </span>
                                            <p className="type-body" style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
                                                {h}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata panel */}
                            <div data-animate>
                                <div
                                    style={{
                                        padding: 'var(--space-5)',
                                        border: '1px solid var(--color-border)',
                                        borderTop: `2px solid ${item.color}`,
                                        borderRadius: 'var(--radius-card)',
                                        background: `linear-gradient(180deg, ${item.color}04, transparent 60%)`,
                                    }}
                                >
                                    <span className="type-label block" style={{ color: item.color, marginBottom: 'var(--space-4)' }}>
                                        {isPub ? 'PUBLICATION INFO' : 'PROJECT INFO'}
                                    </span>

                                    <div
                                        className="grid"
                                        style={{
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                            gap: 'var(--space-4)',
                                            marginBottom: 'var(--space-5)',
                                        }}
                                    >
                                        {isPub
                                            ? [
                                                { label: 'Conference', value: item.conferenceShort },
                                                { label: 'Venue', value: item.venue },
                                                { label: 'Year', value: item.year },
                                                { label: 'Status', value: item.status === 'published' ? 'Published' : 'Under Review' },
                                            ].map((d) => (
                                                <div key={d.label}>
                                                    <span className="type-caption block" style={{ color: 'var(--color-muted)', marginBottom: 2 }}>{d.label}</span>
                                                    <span className="type-body block" style={{ color: 'var(--color-fg)' }}>{d.value}</span>
                                                </div>
                                            ))
                                            : [
                                                { label: 'Period', value: item.period },
                                                { label: 'Type', value: 'Research Project' },
                                            ].map((d) => (
                                                <div key={d.label}>
                                                    <span className="type-caption block" style={{ color: 'var(--color-muted)', marginBottom: 2 }}>{d.label}</span>
                                                    <span className="type-body block" style={{ color: 'var(--color-fg)' }}>{d.value}</span>
                                                </div>
                                            ))}
                                    </div>

                                    <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 'var(--space-5)' }} />

                                    <span className="type-caption block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>Technologies</span>
                                    <TechStack techs={item.tech} iconSize={14} showLabels />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next item */}
                    {allItems.length > 1 && (
                        <Link
                            to={`/research/${nextItem.id}`}
                            className="block group"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                            onMouseEnter={() => setVariant('link')}
                            onMouseLeave={() => setVariant('default')}
                        >
                            <div className="flex items-center justify-between" style={{ padding: 'var(--space-12) var(--outer-margin)' }}>
                                <div>
                                    <span className="type-label block" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>NEXT</span>
                                    <h2 className="type-heading" style={{ color: 'var(--color-fg)', maxWidth: 700, transition: `color var(--duration-base) var(--ease-out)` }}>
                                        {nextItem.label}
                                    </h2>
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
            </div>
        </div>
    );
}
