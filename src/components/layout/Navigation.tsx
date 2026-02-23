import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { gsap } from 'gsap';
import { Volume2, VolumeX, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import { useCursorStore } from '../../store/cursor.store';
import { audio, enableSound, disableSound } from '../../utils/audio';
import { transitions } from '../../utils/spring';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Research', href: '#research' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/Dracula-101' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/pratik-pujari' },
  { label: 'Email', href: 'mailto:pratikpujari1000@gmail.com' },
];

export function Navigation() {
  const { navOpen, toggleNav, soundEnabled, toggleSound } = useUIStore();
  const setVariant = useCursorStore((s) => s.setVariant);
  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);
  const line3Ref = useRef<SVGLineElement>(null);
  const [hidden, setHidden] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ['rgba(10,10,10,0)', 'rgba(10,10,10,0.95)']);
  const navBorder = useTransform(scrollY, [80, 120], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']);
  const navBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

  // Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > 200 && latest > prev) setHidden(true);
    else setHidden(false);
  });

  const handleMenuToggle = useCallback(() => {
    audio.click();
    toggleNav();
  }, [toggleNav]);

  // Hamburger → X animation (3 lines)
  useEffect(() => {
    if (!line1Ref.current || !line2Ref.current || !line3Ref.current) return;
    if (navOpen) {
      gsap.to(line1Ref.current, { attr: { x1: 4, y1: 4, x2: 20, y2: 20 }, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(line2Ref.current, { attr: { x1: 2, y1: 12, x2: 22, y2: 12 }, opacity: 0, duration: 0.15 });
      gsap.to(line3Ref.current, { attr: { x1: 4, y1: 20, x2: 20, y2: 4 }, duration: 0.3, ease: 'power2.inOut' });
    } else {
      gsap.to(line1Ref.current, { attr: { x1: 2, y1: 7, x2: 22, y2: 7 }, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(line2Ref.current, { attr: { x1: 6, y1: 12, x2: 22, y2: 12 }, opacity: 1, duration: 0.3, delay: 0.1 });
      gsap.to(line3Ref.current, { attr: { x1: 2, y1: 17, x2: 22, y2: 17 }, duration: 0.3, ease: 'power2.inOut' });
    }
  }, [navOpen]);

  const handleNavClick = useCallback((href: string) => {
    toggleNav();
    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  }, [toggleNav]);

  const handleSoundToggle = () => {
    toggleSound();
    if (!soundEnabled) enableSound(); else disableSound();
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 origin-left"
        style={{ height: 2, background: 'var(--color-accent)', zIndex: 'calc(var(--z-nav) + 1)' as unknown as number, scaleX: scrollYProgress }}
      />

      {/* Main nav bar — Tier 4 */}
      <motion.nav
        className="fixed top-0 left-0 right-0 flex items-center justify-between"
        style={{
          zIndex: 'var(--z-nav)' as unknown as number,
          padding: `var(--space-2) var(--outer-margin)`,
          backgroundColor: navBg,
          borderBottom: '1px solid',
          borderColor: navBorder,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
        }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <a
          href="#hero"
          className="flex items-center select-none group"
          style={{ gap: 'var(--space-1)' }}
          onMouseEnter={() => setVariant('text')}
          onMouseLeave={() => setVariant('default')}
        >
          {/* Logo mark */}
          <span
            className="flex items-center justify-center relative overflow-hidden transition-colors"
            style={{
              width: 32,
              height: 32,
              border: `1px solid var(--color-border)`,
              transitionDuration: 'var(--duration-base)',
              transitionTimingFunction: 'var(--ease-out)',
            }}
          >
            <span className="type-label" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>P</span>
          </span>
          <span
            className="type-label hidden sm:inline"
            style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-display)', fontWeight: 700 }}
          >
            PRATIK PUJARI
          </span>
        </a>

        {/* Right side */}
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          {/* Inline nav links (desktop) — Tier 4 nav-link pattern */}
          <div className="hidden md:flex items-center" style={{ gap: 'var(--space-3)', marginRight: 'var(--space-2)' }}>
            {NAV_ITEMS.slice(0, 3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link type-label"
                style={{ color: 'var(--color-muted)', textTransform: 'uppercase' as const }}
                onMouseEnter={() => setVariant('link')}
                onMouseLeave={() => setVariant('default')}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            className="transition-colors"
            style={{
              color: 'var(--color-muted)',
              padding: 'var(--space-1)',
              transitionDuration: 'var(--duration-base)',
            }}
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
          </button>

          {/* Menu button */}
          <button
            type="button"
            onClick={handleMenuToggle}
            className="flex items-center"
            style={{ gap: 'var(--space-1)', color: 'var(--color-fg)', marginLeft: 'var(--space-1)', padding: 'var(--space-1)' }}
            onMouseEnter={() => setVariant('button')}
            onMouseLeave={() => setVariant('default')}
            aria-label="Toggle menu"
          >
            <span className="type-label hidden sm:inline" style={{ color: 'var(--color-muted)', fontSize: 11 }}>MENU</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line ref={line1Ref} x1="2" y1="7" x2="22" y2="7" />
              <line ref={line2Ref} x1="6" y1="12" x2="22" y2="12" />
              <line ref={line3Ref} x1="2" y1="17" x2="22" y2="17" />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 flex flex-col"
            style={{ zIndex: 'calc(var(--z-nav) - 1)' as unknown as number }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Background fill */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'var(--color-bg)', zIndex: 9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            />

            {/* Nav content — split layout */}
            <div className="relative flex flex-col lg:flex-row h-full" style={{ zIndex: 11 }}>
              {/* Left: navigation items */}
              <div
                className="flex-1 flex flex-col justify-center"
                style={{ padding: `var(--space-12) var(--outer-margin)` }}
              >
                <motion.span
                  className="type-label block"
                  style={{ color: 'var(--color-muted)', opacity: 0.4, marginBottom: 'var(--space-4)', letterSpacing: '0.2em', fontSize: 11 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.4, y: 0 }}
                  transition={{ delay: 0.35, ...transitions.entrance }}
                >
                  NAVIGATION
                </motion.span>

                <nav className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * transitions.stagger, ...transitions.entrance }}
                      className="group flex items-center cursor-none"
                      style={{ gap: 'var(--space-2)', paddingBlock: 'var(--space-1)' }}
                      onClick={() => handleNavClick(item.href)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavClick(item.href); } }}
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setVariant('link')}
                      onMouseLeave={() => setVariant('default')}
                    >
                      <span
                        className="type-label tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', opacity: 0.4, minWidth: '2ch' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="type-display group-hover:text-[var(--color-accent)] transition-colors"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(40px, 7vw, 88px)',
                          fontWeight: 'var(--text-display-weight)' as unknown as number,
                          letterSpacing: 'var(--text-heading-tracking)',
                          lineHeight: 1.1,
                          color: 'var(--color-fg)',
                          transitionDuration: 'var(--duration-base)',
                        }}
                      >
                        {item.label}
                      </span>
                      <ArrowRight
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-3 transition-all"
                        style={{ color: 'var(--color-accent)', transitionDuration: 'var(--duration-base)' }}
                        size={20}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Right: social & info */}
              <div
                className="lg:w-80 flex flex-col justify-end"
                style={{
                  padding: `0 var(--outer-margin) var(--space-8)`,
                  gap: 'var(--space-5)',
                  borderLeft: window.innerWidth >= 1024 ? `1px solid var(--color-border)` : 'none',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, ...transitions.entrance }}
                >
                  <span className="type-label block" style={{ color: 'var(--color-muted)', opacity: 0.4, letterSpacing: '0.2em', fontSize: 11, marginBottom: 'var(--space-2)' }}>CONNECT</span>
                  <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
                    {SOCIAL_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link type-label flex items-center group/social"
                        style={{ color: 'var(--color-muted)', gap: 'var(--space-1)' }}
                        onMouseEnter={() => setVariant('link')}
                        onMouseLeave={() => setVariant('default')}
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover/social:opacity-100 transition-opacity" style={{ transitionDuration: 'var(--duration-base)' }} />
                      </a>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, ...transitions.entrance }}
                  className="flex flex-col" style={{ gap: 'var(--space-1)' }}
                >
                  <span className="type-label" style={{ color: 'var(--color-muted)', opacity: 0.4 }}>Boulder, CO</span>
                  <span className="type-label" style={{ color: 'var(--color-muted)', opacity: 0.4 }}>MS CS @ CU Boulder</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
