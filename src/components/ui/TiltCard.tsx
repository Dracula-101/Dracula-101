import { useRef, useCallback, ReactNode } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { springs } from '../../utils/spring';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, api] = useSpring(() => ({
    rotateX: 0, rotateY: 0, scale: 1,
    config: springs.tiltCard,
  }));

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    api.start({ rotateY: nx * intensity, rotateX: -ny * intensity, scale: 1.02 });
  }, [api, intensity]);

  const onLeave = useCallback(() => {
    api.start({ rotateX: 0, rotateY: 0, scale: 1 });
  }, [api]);

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ perspective: 800 }}>
      <animated.div className={className} style={{ ...style, transformStyle: 'preserve-3d' }}>
        {children}
      </animated.div>
    </div>
  );
}
