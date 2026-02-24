import { useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { animated, useSpring } from '@react-spring/web';
import { MagneticButton } from '../ui/MagneticButton';
import { useCursorStore } from '../../store/cursor.store';
import { springs, transitions } from '../../utils/spring';

const EMAIL = 'pratikpujari1000@gmail.com';

const SOCIALS = [
  { icon: Github, href: 'https://github.com/Dracula-101', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/pratik-pujari-3472bb226', label: 'LinkedIn' },
];

function SocialIcon({ icon: Icon, href, label }: { icon: LucideIcon; href: string; label: string }) {
  const setVariant = useCursorStore((s) => s.setVariant);
  const [style, api] = useSpring(() => ({
    rotate: 0,
    scale: 1,
    config: springs.iconSpin,
  }));

  return (
    <animated.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={style}
      className="flex items-center justify-center"
      onMouseEnter={() => {
        setVariant('button');
        api.start({ rotate: 360 });
      }}
      onMouseLeave={() => {
        setVariant('default');
        api.start({ rotate: 0 });
      }}
      onMouseDown={() => api.start({ scale: 0.7 })}
      onMouseUp={() => api.start({ scale: 1 })}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          border: '1px solid var(--color-border)',
          color: 'var(--color-muted)',
          transition: `border-color var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-muted)';
        }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>
    </animated.a>
  );
}

/* Stagger helper */
function stagger(isInView: boolean, index: number) {
  return {
    initial: { opacity: 0, y: 24 } as const,
    animate: isInView ? { opacity: 1, y: 0 } : ({} as any),
    transition: {
      duration: transitions.entrance.duration,
      delay: 0.1 + index * transitions.stagger,
      ease: transitions.entrance.ease,
    },
  };
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setVariant = useCursorStore((s) => s.setVariant);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
  const mouseRef = useRef({ x: 0, y: 0 });

  // Canvas 2D animated dot-grid background (no WebGL needed)
  const animateGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const parent = canvas.parentElement!;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const spacing = 40;
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const accent = [245, 166, 35]; // #F5A623

    let rafId: number;
    const start = Date.now();

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const draw = () => {
      const t = (Date.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * spacing;
          const baseY = row * spacing;

          // Subtle wave offset
          const ox = Math.sin(t * 0.5 + row * 0.3 + col * 0.2) * 3;
          const oy = Math.cos(t * 0.4 + col * 0.3 + row * 0.2) * 3;
          const x = baseX + ox;
          const y = baseY + oy;

          // Mouse proximity brightens dots
          const dx = mouseRef.current.x - x;
          const dy = mouseRef.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / 180);

          const alpha = 0.06 + proximity * 0.25 + Math.sin(t * 0.8 + row + col) * 0.02;
          const radius = 1 + proximity * 2;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`;
          ctx.fill();

          // Draw connecting lines to neighbors when mouse is near
          if (proximity > 0.05) {
            const lineAlpha = proximity * 0.12;
            ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${lineAlpha})`;
            ctx.lineWidth = 0.5;
            // Right neighbor
            if (col < cols - 1) {
              const nx = (col + 1) * spacing + Math.sin(t * 0.5 + row * 0.3 + (col + 1) * 0.2) * 3;
              const ny = baseY + Math.cos(t * 0.4 + (col + 1) * 0.3 + row * 0.2) * 3;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nx, ny);
              ctx.stroke();
            }
            // Bottom neighbor
            if (row < rows - 1) {
              const nx = baseX + Math.sin(t * 0.5 + (row + 1) * 0.3 + col * 0.2) * 3;
              const ny = (row + 1) * spacing + Math.cos(t * 0.4 + col * 0.3 + (row + 1) * 0.2) * 3;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nx, ny);
              ctx.stroke();
            }
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const cleanup = animateGrid();
    const onResize = () => { cleanup?.(); animateGrid(); };
    window.addEventListener('resize', onResize);
    return () => {
      cleanup?.();
      window.removeEventListener('resize', onResize);
    };
  }, [isInView, animateGrid]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden"
      style={{ isolation: 'isolate', backgroundColor: 'var(--color-bg)' }}
    >
      {/* Canvas 2D animated grid background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Content */}
      <div
        className="relative"
        style={{
          zIndex: 'var(--z-base)',
          padding: 'var(--section-v) var(--outer-margin)',
        }}
      >
        {/* Tier 3 Section Header */}
        <motion.div {...stagger(isInView, 0)} style={{ marginBottom: 'var(--space-3)' }}>
          <span className="type-label" style={{ color: 'var(--color-accent)' }}>06</span>
          <span className="type-label inline-flex items-center" style={{ color: 'var(--color-accent)', marginLeft: 'var(--space-2)', gap: 'var(--space-1)' }}>
            <MapPin size={12} strokeWidth={1.5} />
            Get In Touch
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="type-display"
          style={{ color: 'var(--color-fg)', marginBottom: 'var(--space-6)' }}
          {...stagger(isInView, 1)}
        >
          Let's talk.
        </motion.h2>

        {/* Email */}
        <motion.div style={{ marginBottom: 'var(--space-8)' }} {...stagger(isInView, 2)}>
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-center"
            style={{ gap: 'var(--space-2)' }}
            onMouseEnter={() => setVariant('link')}
            onMouseLeave={() => setVariant('default')}
          >
            <span
              className="type-subheading"
              style={{
                color: 'var(--color-fg)',
                transition: `color var(--duration-base) var(--ease-out)`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg)'; }}
            >
              {EMAIL}
            </span>
            <ExternalLink size={16} strokeWidth={1.5} style={{ color: 'var(--color-muted)' }} />
          </a>
        </motion.div>

        {/* Socials + CTA */}
        <motion.div
          className="flex items-center flex-wrap"
          style={{ gap: 'var(--space-4)' }}
          {...stagger(isInView, 3)}
        >
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            {SOCIALS.map((s) => (
              <SocialIcon key={s.label} {...s} />
            ))}
          </div>

          <div style={{ width: 1, height: 32, background: 'var(--color-border)' }} />

          <MagneticButton variant="primary" href={`mailto:${EMAIL}`}>
            <Mail size={16} strokeWidth={1.5} />
            Send a message
          </MagneticButton>
        </motion.div>

        {/* Location info */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            marginTop: 'var(--space-10)',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-5)',
            borderTop: '1px solid var(--color-border)',
          }}
          {...stagger(isInView, 4)}
        >
          {[
            { label: 'Based In', value: 'Boulder, CO' },
            { label: 'Currently', value: 'MS CS @ CU Boulder' },
            { label: 'Response Time', value: 'Within 24 hours' },
          ].map((item) => (
            <div key={item.label}>
              <span className="type-label" style={{ color: 'var(--color-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>{item.label}</span>
              <span className="type-body" style={{ color: 'var(--color-fg)' }}>{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
