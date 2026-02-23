import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { MarqueeReel } from '../ui/MarqueeReel';
import { MagneticButton } from '../ui/MagneticButton';
import { useCursorStore } from '../../store/cursor.store';
import { transitions } from '../../utils/spring';

export function Footer() {
  const [marqueeReverse, setMarqueeReverse] = useState(false);
  const setVariant = useCursorStore((s) => s.setVariant);
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#work', label: 'Work' },
    { href: '#experience', label: 'Experience' },
    { href: '#research', label: 'Research' },
    { href: '#process', label: 'Process' },
    { href: '#contact', label: 'Contact' },
  ];

  const socialLinks = [
    { href: 'https://github.com/Dracula-101', label: 'GitHub' },
    { href: 'https://linkedin.com/in/pratik-pujari', label: 'LinkedIn' },
    { href: 'mailto:pratikpujari1000@gmail.com', label: 'Email' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative" style={{ borderTop: '1px solid var(--color-border)' }}>
      {/* Marquee strip */}
      <div
        style={{ borderBottom: '1px solid var(--color-border)', padding: 'var(--space-3) 0' }}
        className="overflow-hidden"
        onMouseEnter={() => setMarqueeReverse(true)}
        onMouseLeave={() => setMarqueeReverse(false)}
      >
        <MarqueeReel
          text="AVAILABLE FOR NEW PROJECTS — LET'S BUILD SOMETHING GREAT"
          speed={35}
          reverse={marqueeReverse}
          className="type-label"
        />
      </div>

      {/* Large CTA section */}
      <div style={{ padding: 'var(--outer-margin)' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: transitions.entrance.duration, ease: transitions.entrance.ease }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between"
          style={{ gap: 'var(--space-8)' }}
        >
          <div>
            <span
              className="type-caption block"
              style={{
                color: 'var(--color-muted)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}
            >
              LET'S CONNECT
            </span>
            <h2
              className="type-heading"
              style={{ color: 'var(--color-fg)' }}
            >
              Have a project<br />
              in mind<span style={{ color: 'var(--color-accent)' }}>?</span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: transitions.entrance.duration, ease: transitions.entrance.ease }}
          >
            <MagneticButton
              variant="primary"
              href="mailto:pratikpujari1000@gmail.com"
            >
              Get in Touch
              <ArrowUpRight size={18} strokeWidth={1.5} />
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Divider */}
      <div style={{ margin: '0 var(--outer-margin)', height: 1, background: 'var(--color-border)' }} />

      {/* Bottom bar */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between"
        style={{ padding: 'var(--space-5) var(--outer-margin)', gap: 'var(--space-5)' }}
      >
        {/* Left: logo + copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: transitions.entrance.duration }}
          className="flex items-center"
          style={{ gap: 'var(--space-2)' }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="type-caption" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>P</span>
          </span>
          <span className="type-caption" style={{ color: 'var(--color-muted)' }}>
            © {year} Pratik Pujari
          </span>
        </motion.div>

        {/* Center: nav links — Tier 4 pattern with nav-link class */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: transitions.entrance.duration }}
          className="flex items-center flex-wrap"
          style={{ gap: 'var(--space-4)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="type-label nav-link"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={() => setVariant('link')}
              onMouseLeave={() => setVariant('default')}
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Right: socials + back to top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: transitions.entrance.duration }}
          className="flex items-center"
          style={{ gap: 'var(--space-4)' }}
        >
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label"
              style={{
                color: 'var(--color-muted)',
                transition: `color var(--duration-base) var(--ease-out)`,
              }}
              onMouseEnter={(e) => {
                setVariant('link');
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                setVariant('default');
                e.currentTarget.style.color = 'var(--color-muted)';
              }}
            >
              {link.label}
            </a>
          ))}

          {/* Back to top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
              marginLeft: 'var(--space-1)',
              transition: `border-color var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out)`,
            }}
            onMouseEnter={(e) => {
              setVariant('button');
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              setVariant('default');
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
            aria-label="Back to top"
          >
            <ArrowUp size={14} strokeWidth={1.5} />
          </button>
        </motion.div>
      </div>
    </footer>
  );
}
