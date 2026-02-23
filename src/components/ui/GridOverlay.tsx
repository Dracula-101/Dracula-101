import { useEffect, useState } from 'react';

export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') setVisible((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!visible || !import.meta.env.DEV) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 'var(--z-toast)' }} aria-hidden="true">
      <div className="grid grid-cols-12 h-full" style={{ gap: 'var(--space-6)', padding: '0 var(--outer-margin)' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="bg-blue-400/10 border-l border-r border-blue-400/10 h-full" />
        ))}
      </div>
    </div>
  );
}
