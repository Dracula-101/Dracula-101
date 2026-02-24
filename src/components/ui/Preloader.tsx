import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
    progress: number;   // 0–1
    ready: boolean;     // true once all models are loaded
}

export function Preloader({ progress, ready }: PreloaderProps) {
    const [visible, setVisible] = useState(true);
    const pctRef = useRef(0);
    const [displayPct, setDisplayPct] = useState(0);

    // Smooth the percentage counter
    useEffect(() => {
        const target = Math.round(progress * 100);
        const id = setInterval(() => {
            if (pctRef.current < target) {
                pctRef.current = Math.min(pctRef.current + 2, target);
                setDisplayPct(pctRef.current);
            }
        }, 20);
        return () => clearInterval(id);
    }, [progress]);

    // Once ready, wait a beat then dismiss
    useEffect(() => {
        if (!ready) return;
        pctRef.current = 100;
        setDisplayPct(100);
        const timer = setTimeout(() => setVisible(false), 600);
        return () => clearTimeout(timer);
    }, [ready]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
                    className="fixed inset-0 flex flex-col items-center justify-center"
                    style={{
                        zIndex: 9999,
                        background: 'var(--color-bg)',
                    }}
                >
                    {/* Logo / name */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex flex-col items-center"
                        style={{ gap: 'var(--space-4)' }}
                    >
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(20px, 3vw, 28px)',
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                color: 'var(--color-fg)',
                            }}
                        >
                            PRATIK
                        </span>

                        {/* Progress bar */}
                        <div
                            style={{
                                width: 'clamp(180px, 30vw, 280px)',
                                height: 2,
                                background: 'var(--color-border)',
                                borderRadius: 1,
                                overflow: 'hidden',
                            }}
                        >
                            <motion.div
                                style={{
                                    height: '100%',
                                    background: 'var(--color-accent)',
                                    borderRadius: 1,
                                    transformOrigin: 'left',
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: progress }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Percentage */}
                        <span
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-caption-size)',
                                letterSpacing: '0.12em',
                                color: 'var(--color-muted)',
                            }}
                        >
                            {displayPct}%
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
