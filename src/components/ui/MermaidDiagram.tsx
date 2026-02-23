import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

import type { DiagramSection } from '../../data/projectImages';

/* ──────────────────────────────────────────────────────────
   MermaidDiagram — renders a mermaid chart string into SVG.
   Dark-themed, horizontally scrollable for large diagrams.
   ────────────────────────────────────────────────────────── */

let mermaidInitialised = false;

function ensureInit() {
    if (mermaidInitialised) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        fontFamily: 'var(--font-mono, monospace)',
        themeVariables: {
            darkMode: true,
            background: '#0a0a0a',
            primaryColor: '#1a1a2e',
            primaryTextColor: '#e0e0e0',
            primaryBorderColor: '#333',
            lineColor: '#555',
            secondaryColor: '#16213e',
            tertiaryColor: '#0f3460',
        },
    });
    mermaidInitialised = true;
}

interface Props {
    chart: string;
    accentColor?: string;
    description?: DiagramSection[];
}

let idCounter = 0;

export function MermaidDiagram({ chart, accentColor, description }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        ensureInit();

        const id = `mermaid-${++idCounter}`;
        let cancelled = false;

        (async () => {
            try {
                const { svg } = await mermaid.render(id, chart);
                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;

                    /* Style the rendered SVG to fit the container */
                    const svgEl = containerRef.current.querySelector('svg');
                    if (svgEl) {
                        svgEl.style.maxWidth = '100%';
                        svgEl.style.height = 'auto';
                    }
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to render diagram');
            }
        })();

        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return (
            <div
                className="type-caption"
                style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    color: 'var(--color-muted)',
                }}
            >
                Diagram could not be rendered.
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: 'var(--space-6)',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
            }}
        >
            {/* Diagram */}
            <div
                style={{
                    flex: '1 1 400px',
                    minWidth: 0,
                    overflowX: 'auto',
                    border: '1px solid var(--color-border)',
                    borderTop: accentColor ? `2px solid ${accentColor}` : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: 'var(--space-4)',
                    background: 'rgba(0,0,0,0.3)',
                    scrollbarWidth: 'thin',
                }}
            >
                <div ref={containerRef} style={{ minWidth: 'fit-content' }} />
            </div>

            {/* Description sections */}
            {description && description.length > 0 && (
                <div
                    style={{
                        flex: '0 1 320px',
                        minWidth: 220,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-5)',
                    }}
                >
                    {description.map((section) => (
                        <div key={section.heading}>
                            <span
                                className="type-label block"
                                style={{
                                    color: accentColor || 'var(--color-fg)',
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
    );
}
