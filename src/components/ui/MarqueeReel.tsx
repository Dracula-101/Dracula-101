import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import clsx from 'clsx';

interface MarqueeReelProps {
  text: string;
  speed?: number;
  className?: string;
  reverse?: boolean;
}

export function MarqueeReel({ text, speed = 40, className, reverse = false }: MarqueeReelProps) {
  const repeated = `${text} — `.repeat(12);

  return (
    <div className={clsx('overflow-hidden whitespace-nowrap', className)}>
      <motion.div
        className="inline-block"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          },
        }}
      >
        <span>{repeated}{repeated}</span>
      </motion.div>
    </div>
  );
}
