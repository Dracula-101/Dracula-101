import { useRef, useCallback, useState, ReactNode } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useCursorStore } from '../../store/cursor.store';
import { springs } from '../../utils/spring';
import { audio } from '../../utils/audio';
import clsx from 'clsx';

/* ------------------------------------------------------------------
 * MagneticButton — interaction-rich button with:
 *   • Magnetic cursor-follow
 *   • Spring-based press & release
 *   • Long-press detection with growing glow
 *   • Ripple on click (CSS radial)
 *   • Shimmer sweep on hover
 *   • Glow ring on focus/hover
 * ------------------------------------------------------------------ */

interface Ripple { x: number; y: number; id: number }

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  variant = 'primary',
  onClick,
  href,
  disabled = false,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setVariant = useCursorStore((s) => s.setVariant);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const rippleId = useRef(0);

  /* ------ Springs ------ */
  const [posStyle, posApi] = useSpring(() => ({
    x: 0, y: 0,
    config: springs.magnetic,
  }));

  const [pressStyle, pressApi] = useSpring(() => ({
    scaleX: 1, scaleY: 1,
    config: springs.press,
  }));

  const [glowStyle, glowApi] = useSpring(() => ({
    glowOpacity: 0,
    glowScale: 1,
    config: springs.press,
  }));

  const [shimmerStyle, shimmerApi] = useSpring(() => ({
    shimmerX: -100,
    config: { tension: 80, friction: 26 },
  }));

  /* ------ Handlers ------ */
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || isTouch) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    posApi.start({ x: dx * strength, y: dy * strength });
  }, [disabled, isTouch, posApi, strength]);

  const onMouseEnter = useCallback(() => {
    if (disabled) return;
    setVariant('magnetic');
    setIsHovered(true);
    audio.hover();
    glowApi.start({ glowOpacity: 0.25, glowScale: 1.04 });
    shimmerApi.start({
      from: { shimmerX: -100 },
      to: { shimmerX: 200 },
      config: { tension: 40, friction: 26 },
    });
  }, [disabled, setVariant, glowApi, shimmerApi]);

  const onMouseLeave = useCallback(() => {
    setVariant('default');
    setIsHovered(false);
    posApi.start({ x: 0, y: 0 });
    glowApi.start({ glowOpacity: 0, glowScale: 1 });
    // Cancel long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPress.current = false;
    pressApi.start({ scaleX: 1, scaleY: 1 });
  }, [posApi, setVariant, glowApi, pressApi]);

  const spawnRipple = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    pressApi.start({ scaleX: 1.06, scaleY: 0.94 });
    audio.click();
    spawnRipple(e);

    // Long press: start growing glow after 300ms
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      glowApi.start({ glowOpacity: 0.6, glowScale: 1.12 });
      pressApi.start({ scaleX: 0.96, scaleY: 0.96 });
    }, 300);
  }, [pressApi, glowApi, spawnRipple]);

  const onMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isLongPress.current) {
      // Bounce back from long press
      pressApi.start({
        from: { scaleX: 0.96, scaleY: 0.96 },
        to: { scaleX: 1, scaleY: 1 },
        config: { tension: 600, friction: 12, mass: 0.4 },
      });
      glowApi.start({ glowOpacity: 0, glowScale: 1 });
    } else {
      pressApi.start({ scaleX: 1, scaleY: 1 });
    }
    isLongPress.current = false;
  }, [pressApi, glowApi]);

  /* ------ Styles & classes ------ */
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 select-none overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      padding: `var(--space-2) var(--space-3)`,
      background: 'var(--color-accent)',
      color: 'var(--color-bg)',
      fontWeight: 600,
      fontSize: 'var(--text-label-size)',
      letterSpacing: 'var(--text-label-tracking)',
      textTransform: 'uppercase' as const,
      transitionDuration: 'var(--duration-fast)',
    },
    secondary: {
      padding: `var(--space-2) var(--space-3)`,
      border: '1px solid var(--color-accent)',
      color: 'var(--color-fg)',
      fontWeight: 600,
      fontSize: 'var(--text-label-size)',
      letterSpacing: 'var(--text-label-tracking)',
      textTransform: 'uppercase' as const,
      transitionDuration: 'var(--duration-fast)',
    },
    ghost: {
      color: 'var(--color-fg)',
      fontWeight: 500,
      fontSize: 'var(--text-label-size)',
      letterSpacing: '0.04em',
      transitionDuration: 'var(--duration-fast)',
    },
  };

  const focusRingStyle: React.CSSProperties = {
    // 2px accent focus ring with 3px offset (Tier 1 spec)
    '--tw-ring-color': 'var(--color-accent)',
    '--tw-ring-offset-color': 'var(--color-bg)',
  } as React.CSSProperties;

  const innerContent = (
    <>
      {/* Shimmer sweep */}
      {variant !== 'ghost' && (
        <animated.span
          className="pointer-events-none absolute inset-0"
          style={{
            background: shimmerStyle.shimmerX.to(
              (v) => `linear-gradient(105deg, transparent ${v - 30}%, rgba(255,255,255,0.18) ${v}%, transparent ${v + 30}%)`
            ),
          }}
        />
      )}
      {/* Ripple container */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="mag-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
      {/* Content */}
      <span className="relative z-[1]">{children}</span>
    </>
  );

  return (
    <animated.div
      ref={ref}
      style={{
        ...posStyle,
        ...pressStyle,
        position: 'relative' as const,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Glow ring behind button */}
      {variant !== 'ghost' && (
        <animated.span
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity: glowStyle.glowOpacity,
            transform: glowStyle.glowScale.to(s => `scale(${s})`),
            boxShadow: '0 0 30px 8px color-mix(in srgb, var(--color-accent) 35%, transparent), 0 0 60px 16px color-mix(in srgb, var(--color-accent) 12%, transparent)',
            zIndex: 0,
          }}
        />
      )}
      {href ? (
        <a
          href={href}
          {...(href.startsWith('mailto:') || href.startsWith('tel:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          className={clsx(baseClasses, className, disabled && 'opacity-40 pointer-events-none')}
          style={{ ...variantStyles[variant], ...focusRingStyle }}
        >
          {innerContent}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={clsx(baseClasses, className, disabled && 'opacity-40 pointer-events-none')}
          style={{ ...variantStyles[variant], ...focusRingStyle }}
        >
          {innerContent}
        </button>
      )}
    </animated.div>
  );
}
