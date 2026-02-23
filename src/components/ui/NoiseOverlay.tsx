import { useEffect, useRef } from 'react';
import { raf } from '../../utils/raf';

export function NoiseOverlay() {
  const svgRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    let freq = 0.65;
    raf.add('noise-overlay', () => {
      if (!svgRef.current) return;
      freq += 0.001;
      svgRef.current.setAttribute('baseFrequency', `${freq} ${freq + 0.01}`);
      if (freq > 0.75) freq = 0.65;
    });
    return () => raf.remove('noise-overlay');
  }, []);

  return (
    <>
      <svg className="noise-filter" aria-hidden="true">
        <defs>
          <filter id="noise">
            <feTurbulence
              ref={svgRef}
              type="fractalNoise"
              baseFrequency="0.65 0.66"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" result="blend" />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ filter: 'url(#noise)', zIndex: 'var(--z-raised)' }}
      />
    </>
  );
}
