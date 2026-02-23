import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import clsx from 'clsx';
import { transitions } from '../../utils/spring';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  fullBleed?: boolean;
  /** Disable scroll-reveal entrance (e.g. Hero handles its own) */
  noReveal?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className,
  fullBleed = false,
  noReveal = false,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={clsx('relative', className)}
      style={fullBleed ? undefined : { paddingLeft: 'var(--outer-margin)', paddingRight: 'var(--outer-margin)' }}
      initial={noReveal ? undefined : { opacity: 0, y: 24 }}
      animate={noReveal ? undefined : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={noReveal ? undefined : transitions.entrance}
    >
      {children}
    </motion.section>
  );
}
