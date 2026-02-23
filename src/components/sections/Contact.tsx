import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { animated, useSpring } from '@react-spring/web';
import { MagneticButton } from '../ui/MagneticButton';
import { useCursorStore } from '../../store/cursor.store';
import { springs, transitions } from '../../utils/spring';
import { ContactMesh } from '../../webgl/ogl/mesh';

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
  const meshRef = useRef<ContactMesh | null>(null);
  const setVariant = useCursorStore((s) => s.setVariant);
  const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
  const [meshReady, setMeshReady] = useState(false);

  // Initialize OGL mesh only when section is in view
  useEffect(() => {
    if (!canvasRef.current || !isInView || meshReady) return;
    try {
      meshRef.current = new ContactMesh({ canvas: canvasRef.current });
      setMeshReady(true);
    } catch (e) {
      console.warn('ContactMesh failed to initialize:', e);
    }
    return () => {
      try { meshRef.current?.dispose(); } catch { /* noop */ }
    };
  }, [isInView, meshReady]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {/* OGL background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Content */}
      <div
        className="relative"
        style={{
          zIndex: 'var(--z-base)',
          padding: 'var(--outer-margin)',
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
