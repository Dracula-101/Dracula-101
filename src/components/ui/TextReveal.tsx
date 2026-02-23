import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useUIStore } from '../../store/ui.store';
import { transitions } from '../../utils/spring';

interface TextRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function TextReveal({ children, delay = 0, className }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px' });
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        initial={{ y: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 0 : 1 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{
          duration: reducedMotion ? 0.3 : transitions.entrance.duration,
          delay,
          ease: transitions.entrance.ease,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
