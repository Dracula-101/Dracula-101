import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProjectImageGroup, ProjectDiagram } from '../../data/projectImages';
import { MermaidDiagram } from './MermaidDiagram';
import { BrowserMockup } from './BrowserMockup';

/* ──────────────────────────────────────────────────────────
   ImagePager — horizontal scrollable image strip optimised
   for portrait mobile screenshots:
   • group tabs (App Screenshots / Store Listings)
   • side-scrollable strip showing multiple images at once
   • click any image to open lightbox
   • keyboard nav (← → Esc) in lightbox
   ────────────────────────────────────────────────────────── */

const STRIP_HEIGHT = 420;

interface Tab {
    kind: 'images' | 'diagram';
    title: string;
    /* index into the original arrays */
    sourceIndex: number;
}

interface Props {
    groups: ProjectImageGroup[];
    accentColor: string;
    diagrams?: ProjectDiagram[];
}

export function ImagePager({ groups, accentColor, diagrams = [] }: Props) {
    const [activeTab, setActiveTab] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const stripRef = useRef<HTMLDivElement>(null);

    /* Build unified tab list: image groups first, then diagrams */
    const tabs: Tab[] = [
        ...groups.map((g, i) => ({ kind: 'images' as const, title: g.title, sourceIndex: i })),
        ...diagrams.map((d, i) => ({ kind: 'diagram' as const, title: d.title, sourceIndex: i })),
    ];

    const currentTab = tabs[activeTab];
    const images = currentTab?.kind === 'images' ? groups[currentTab.sourceIndex]?.images ?? [] : [];
    const currentDiagram = currentTab?.kind === 'diagram' ? diagrams[currentTab.sourceIndex] : null;
    const currentVariant = currentTab?.kind === 'images' ? (groups[currentTab.sourceIndex]?.variant ?? 'mobile') : null;
    const currentDescription = currentTab?.kind === 'images' ? groups[currentTab.sourceIndex]?.description : undefined;

    /* Reset when tab changes */
    const handleTabChange = useCallback((idx: number) => {
        setActiveTab(idx);
        setLightboxIndex(null);
    }, []);

    /* Lightbox nav */
    const lbPrev = useCallback(() => setLightboxIndex((i) => (i !== null ? (i > 0 ? i - 1 : images.length - 1) : null)), [images.length]);
    const lbNext = useCallback(() => setLightboxIndex((i) => (i !== null ? (i < images.length - 1 ? i + 1 : 0) : null)), [images.length]);

    /* Keyboard nav in lightbox */
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft') lbPrev();
            if (e.key === 'ArrowRight') lbNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIndex, lbPrev, lbNext]);

    /* Horizontal scroll with arrow buttons */
    const scrollStrip = useCallback((dir: -1 | 1) => {
        if (!stripRef.current) return;
        stripRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }, []);

    if (tabs.length === 0) return null;

    return (
        <>
            <div data-animate>
                {/* Tabs (image groups + diagrams) */}
                {tabs.length > 1 && (
                    <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        {tabs.map((tab, i) => (
                            <button
                                key={tab.title}
                                type="button"
                                className="type-label"
                                onClick={() => handleTabChange(i)}
                                style={{
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    padding: 'var(--space-1) var(--space-3)',
                                    borderRadius: '999px',
                                    color: i === activeTab ? accentColor : 'var(--color-muted)',
                                    outline: i === activeTab ? `1.5px solid ${accentColor}` : '1.5px solid var(--color-border)',
                                    transition: 'all var(--duration-base) var(--ease-out)',
                                }}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                )}

                {/* Diagram view */}
                {currentDiagram && (
                    <MermaidDiagram chart={currentDiagram.chart} accentColor={accentColor} description={currentDiagram.description} />
                )}

                {/* Web / browser mockup view */}
                {currentVariant === 'web' && images.length > 0 && (
                    <BrowserMockup
                        images={images}
                        accentColor={accentColor}
                        onImageClick={(i) => setLightboxIndex(i)}
                    />
                )}

                {/* Static image + optional description */}
                {currentVariant === 'static' && images.length > 0 && (
                    <div
                        style={{
                            display: currentDescription?.length ? 'flex' : 'block',
                            gap: 'var(--space-6)',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ flex: currentDescription?.length ? '1 1 50%' : '1 1 100%', minWidth: 0 }}>
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(0)}
                                style={{
                                    display: 'block', width: '100%', padding: 0,
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-card)',
                                    overflow: 'hidden',
                                    background: 'none',
                                    cursor: 'zoom-in',
                                    transition: 'border-color 0.25s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                            >
                                <img
                                    src={images[0].src}
                                    alt={images[0].label}
                                    loading="lazy"
                                    draggable={false}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </button>
                        </div>

                        {currentDescription && currentDescription.length > 0 && (
                            <div
                                style={{
                                    flex: '1 1 40%',
                                    minWidth: 260,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--space-5)',
                                }}
                            >
                                {currentDescription.map((section) => (
                                    <div key={section.heading}>
                                        <span
                                            className="type-label block"
                                            style={{
                                                color: accentColor,
                                                marginBottom: 'var(--space-1)',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {section.heading.toUpperCase()}
                                        </span>
                                        <p
                                            className="type-body"
                                            style={{
                                                color: 'var(--color-muted)',
                                                lineHeight: 1.65,
                                                margin: 0,
                                            }}
                                        >
                                            {section.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Image strip container — only for mobile image tabs */}
                {currentVariant === 'mobile' && images.length > 0 && (<>
                    <div className="relative" style={{ marginBottom: 'var(--space-2)' }}>
                        {/* Scrollable strip */}
                        <div
                            ref={stripRef}
                            className="flex items-end"
                            style={{
                                gap: 'var(--space-3)',
                                overflowX: 'auto',
                                scrollSnapType: 'x mandatory',
                                scrollbarWidth: 'none',
                                padding: 'var(--space-2) var(--space-2)',
                            }}
                        >
                            {images.map((img, i) => (
                                <button
                                    key={`${activeTab}-${i}`}
                                    type="button"
                                    onClick={() => setLightboxIndex(i)}
                                    className="group"
                                    style={{
                                        cursor: 'zoom-in',
                                        flexShrink: 0,
                                        scrollSnapAlign: 'center',
                                        height: STRIP_HEIGHT,
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        position: 'relative',
                                    }}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.label}
                                        loading="lazy"
                                        style={{
                                            height: '100%',
                                            width: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: 'var(--radius-card)',
                                            border: '1px solid var(--color-border)',
                                            transition: 'transform 0.2s ease, border-color 0.2s ease',
                                        }}
                                        draggable={false}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.borderColor = accentColor;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                        }}
                                    />
                                    {/* Label overlay */}
                                    <span
                                        className="type-caption absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100"
                                        style={{
                                            padding: '2px var(--space-2)',
                                            background: 'rgba(0,0,0,0.65)',
                                            borderRadius: '999px',
                                            color: 'var(--color-fg)',
                                            transition: 'opacity 0.15s ease',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {img.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Strip scroll arrows */}
                        {images.length > 2 && (
                            <>
                                <button
                                    type="button"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.5)',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        color: 'var(--color-fg)',
                                        zIndex: 2,
                                        opacity: 0.7,
                                        transition: 'opacity 0.15s ease',
                                    }}
                                    onClick={() => scrollStrip(-1)}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft size={18} strokeWidth={1.5} />
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.5)',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        color: 'var(--color-fg)',
                                        zIndex: 2,
                                        opacity: 0.7,
                                        transition: 'opacity 0.15s ease',
                                    }}
                                    onClick={() => scrollStrip(1)}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight size={18} strokeWidth={1.5} />
                                </button>
                            </>
                        )}
                    </div>

                    <p className="type-caption text-center" style={{ color: 'var(--color-muted)' }}>
                        {images.length} screenshot{images.length !== 1 ? 's' : ''} — click to enlarge
                    </p>
                </>)}
            </div>

            {/* ── Lightbox ────────────────────────────────── */}
            <AnimatePresence>
                {lightboxIndex !== null && images[lightboxIndex] && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center"
                        style={{
                            zIndex: 'var(--z-modal)',
                            background: 'rgba(0,0,0,0.9)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close */}
                        <button
                            type="button"
                            className="absolute top-5 right-5"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg)', opacity: 0.7 }}
                            onClick={() => setLightboxIndex(null)}
                            aria-label="Close lightbox"
                        >
                            <X size={26} strokeWidth={1.5} />
                        </button>

                        {/* Image — simple opacity transition, no scale */}
                        <img
                            key={`lb-${activeTab}-${lightboxIndex}`}
                            src={images[lightboxIndex].src}
                            alt={images[lightboxIndex].label}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 'var(--radius-card)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                            draggable={false}
                        />

                        {/* Lightbox nav arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        cursor: 'pointer',
                                        color: 'var(--color-fg)',
                                        transition: 'all 0.2s ease',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                    }}
                                    onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = accentColor;
                                        e.currentTarget.style.borderColor = accentColor;
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={22} strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        cursor: 'pointer',
                                        color: 'var(--color-fg)',
                                        transition: 'all 0.2s ease',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                    }}
                                    onClick={(e) => { e.stopPropagation(); lbNext(); }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = accentColor;
                                        e.currentTarget.style.borderColor = accentColor;
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={22} strokeWidth={2} />
                                </button>
                            </>
                        )}

                        {/* Caption + counter */}
                        <div
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center"
                            style={{ gap: 'var(--space-3)' }}
                        >
                            <span className="type-caption" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {lightboxIndex + 1} / {images.length}
                            </span>
                            <span className="type-body" style={{ color: 'var(--color-fg)' }}>
                                {images[lightboxIndex].label}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
