import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProjectImage } from '../../data/projectImages';

/* ──────────────────────────────────────────────────────────
   BrowserMockup — single browser frame showing one screenshot
   at a time with thumbnail navigation strip below.
   Supports optional description sections beside the frame.
   ────────────────────────────────────────────────────────── */

interface Props {
    images: ProjectImage[];
    accentColor: string;
    onImageClick?: (index: number) => void;
}

export function BrowserMockup({ images, accentColor, onImageClick }: Props) {
    const [active, setActive] = useState(0);
    const img = images[active];
    if (!img) return null;

    const prev = () => setActive((a) => (a > 0 ? a - 1 : images.length - 1));
    const next = () => setActive((a) => (a < images.length - 1 ? a + 1 : 0));

    return (
        <div
            style={{
                display: 'block',
            }}
        >
            {/* Browser frame + thumbnails */}
            <div style={{ minWidth: 0 }}>
                {/* Browser frame */}
                <div
                    style={{
                        borderRadius: 'var(--radius-card)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        background: '#1a1a1a',
                        transition: 'border-color 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                    {/* Title bar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: '10px 16px',
                            background: '#141414',
                            borderBottom: '1px solid var(--color-border)',
                        }}
                    >
                        {/* Traffic lights */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
                            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CA41' }} />
                        </div>

                        {/* URL bar */}
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: '5px 12px',
                                borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span className="type-caption" style={{ color: 'rgba(255,255,255,0.35)', userSelect: 'none' }}>
                                {img.label.toLowerCase().replace(/\s+/g, '-')}.sync.app
                            </span>
                        </div>

                        {/* Nav arrows in title bar */}
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button
                                    type="button"
                                    onClick={prev}
                                    style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer', color: 'var(--color-muted)', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={14} strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    onClick={next}
                                    style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer', color: 'var(--color-muted)', transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={14} strokeWidth={2} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Active screenshot */}
                    <button
                        type="button"
                        onClick={() => onImageClick?.(active)}
                        style={{
                            display: 'block', width: '100%', padding: 0,
                            border: 'none', background: 'none',
                            cursor: onImageClick ? 'zoom-in' : 'default',
                        }}
                    >
                        <img
                            src={img.src}
                            alt={img.label}
                            loading="lazy"
                            draggable={false}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </button>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: 'var(--space-2)',
                            marginTop: 'var(--space-3)',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {images.map((thumb, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActive(i)}
                                style={{
                                    padding: 0,
                                    border: i === active ? `2px solid ${accentColor}` : '2px solid var(--color-border)',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: 'none',
                                    opacity: i === active ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                    width: 80,
                                    height: 50,
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => { if (i !== active) e.currentTarget.style.opacity = '0.8'; }}
                                onMouseLeave={(e) => { if (i !== active) e.currentTarget.style.opacity = '0.5'; }}
                                aria-label={thumb.label}
                            >
                                <img
                                    src={thumb.src}
                                    alt={thumb.label}
                                    loading="lazy"
                                    draggable={false}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
