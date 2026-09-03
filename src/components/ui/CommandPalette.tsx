import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, ArrowUpRight } from 'lucide-react';
import { commands, type Command, type CommandGroup } from '../../data/commands';
import { useUIStore } from '../../store/ui.store';
import { useCursorStore } from '../../store/cursor.store';
import { lockScroll, unlockScroll } from '../../utils/scroll';
import { audio } from '../../utils/audio';
import { transitions } from '../../utils/spring';

/* ──────────────────────────────────────────────────────────
   ⌘K command palette

   Subsequence matching over label + hint + keywords, so
   "kfk" finds Kafka and "kafka" finds Echo (via its stack).
   Score favours earlier and more contiguous matches, with a
   bonus for hits in the visible label over hidden keywords.
   ────────────────────────────────────────────────────────── */

const GROUP_ORDER: CommandGroup[] = ['Navigation', 'Projects', 'Experience', 'Research', 'Links'];

interface Scored {
  cmd: Command;
  score: number;
  /** Character indices to highlight in the label */
  hits: number[];
}

/** Contiguous substring hit — the strongest signal. */
function substringScore(h: string, n: string): number | null {
  const at = h.indexOf(n);
  if (at === -1) return null;
  let s = 60 - Math.min(at, 20);
  if (at === 0) s += 20;                                  // prefix
  else if (/[\s\-·/(]/.test(h[at - 1])) s += 12;          // word start
  if (n.length === h.length) s += 12;                     // exact
  return s;
}

/** Gap-limited subsequence, so "jtscn" still finds JetScan but
    "snkt" does not quietly match half the site. */
function subsequenceScore(h: string, n: string): number | null {
  let hi = 0, last = -1, gaps = 0, s = 0, first = true;
  for (const ch of n) {
    const at = h.indexOf(ch, hi);
    if (at === -1) return null;
    if (first) {
      s += at === 0 ? 12 : 4 - Math.min(at, 4);   // where the match starts, not a gap
      first = false;
    } else if (at === last + 1) {
      s += 10;
    } else {
      gaps++;
      s += 3 - Math.min(at - hi, 5);
    }
    last = at;
    hi = at + 1;
  }
  const allowed = n.length <= 2 ? 0 : Math.max(1, Math.floor(n.length / 2));
  if (gaps > allowed) return null;
  return s - Math.max(0, h.length - n.length) * 0.1;
}

function fieldScore(haystack: string, needle: string): number | null {
  const h = haystack.toLowerCase();
  const sub = substringScore(h, needle);
  if (sub !== null) return sub;
  return subsequenceScore(h, needle);
}

/** Every token must match some field (AND); a command's score is the sum
    of each token's best field hit, weighted by where it matched. */
function scoreCommand(cmd: Command, tokens: string[]): number | null {
  let total = 0;
  for (const t of tokens) {
    const label = fieldScore(cmd.label, t);
    const hint = cmd.hint ? fieldScore(cmd.hint, t) : null;
    let keyword: number | null = null;
    for (const k of cmd.keywords) {                        // per keyword, never joined
      const v = fieldScore(k, t);
      if (v !== null && (keyword === null || v > keyword)) keyword = v;
    }

    let best: number | null = null;
    if (label !== null) best = label + 45;
    if (hint !== null) best = Math.max(best ?? -Infinity, hint + 18);
    if (keyword !== null) best = Math.max(best ?? -Infinity, keyword);

    if (best === null) return null;
    total += best;
  }
  return total;
}

/** Highlight every token occurrence inside the label. */
function labelHits(label: string, tokens: string[]): number[] {
  const l = label.toLowerCase();
  const hits = new Set<number>();
  for (const t of tokens) {
    let from = 0;
    for (;;) {
      const at = l.indexOf(t, from);
      if (at === -1) break;
      for (let i = 0; i < t.length; i++) hits.add(at + i);
      from = at + t.length;
    }
  }
  return [...hits];
}

function rank(query: string): Scored[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return commands.map((cmd) => ({ cmd, score: 0, hits: [] }));

  const out: Scored[] = [];
  for (const cmd of commands) {
    const score = scoreCommand(cmd, tokens);
    if (score !== null) out.push({ cmd, score, hits: labelHits(cmd.label, tokens) });
  }
  return out.sort((a, b) => b.score - a.score || a.cmd.label.length - b.cmd.label.length).slice(0, 24);
}

function Highlight({ text, hits }: { text: string; hits: number[] }) {
  if (!hits.length) return <>{text}</>;
  const set = new Set(hits);
  return (
    <>
      {text.split('').map((ch, i) =>
        set.has(i) ? (
          <span key={i} style={{ color: 'var(--color-accent)' }}>{ch}</span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  );
}

/* Mounted only while open, so query/active start fresh every time —
   no reset effects, no cascading renders. */
function PaletteDialog() {
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);
  const setVariant = useCursorStore((s) => s.setVariant);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => rank(query), [query]);

  /* Group results. With no query the groups keep their canonical order so the
     palette reads as a site index; once searching, the group holding the best
     match comes first — otherwise a fixed order buries the top hit. */
  const grouped = useMemo(() => {
    const map = new Map<CommandGroup, Scored[]>();
    for (const r of results) {
      const arr = map.get(r.cmd.group) ?? [];
      arr.push(r);
      map.set(r.cmd.group, arr);
    }
    const present = GROUP_ORDER.filter((g) => map.has(g));
    const ordered = query.trim()
      ? [...present].sort((a, b) => Math.max(...map.get(b)!.map((r) => r.score)) - Math.max(...map.get(a)!.map((r) => r.score)))
      : present;
    return ordered.map((g) => ({ group: g, items: map.get(g)! }));
  }, [results, query]);

  /* Flat order matches what the eye sees, so ↑↓ tracks the rendered list */
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const run = useCallback((cmd: Command) => {
    audio.click();
    setPaletteOpen(false);

    const { action } = cmd;
    if (action.kind === 'external') {
      window.open(action.href, action.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
      return;
    }
    if (action.kind === 'route') {
      navigate(action.to);
      return;
    }
    // section — go home first if we're on a detail page
    const onHome = window.location.pathname.replace(/\/$/, '') === import.meta.env.BASE_URL.replace(/\/$/, '');
    if (onHome) {
      document.querySelector(action.hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.querySelector(action.hash)?.scrollIntoView({ behavior: 'smooth' }), 120);
    }
  }, [navigate, setPaletteOpen]);

  /* Focus the input and freeze the page behind, for as long as we're mounted */
  useEffect(() => {
    lockScroll();
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      unlockScroll();
    };
  }, []);

  /* Keep the active row in view */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  /* Selection resets with the query — set together, never via an effect */
  const onQueryChange = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); setPaletteOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (flat.length ? (i + 1) % flat.length : 0)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0)); return; }
    if (e.key === 'Enter') { e.preventDefault(); const hit = flat[active]; if (hit) run(hit.cmd); return; }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-start justify-center"
          style={{ zIndex: 'var(--z-modal)' as unknown as number, padding: 'var(--outer-margin)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Scrim */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(10,10,10,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setPaletteOpen(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: 620,
              marginTop: 'clamp(48px, 12vh, 140px)',
              maxHeight: 'min(70vh, 560px)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={transitions.entrance}
          >
            {/* Input row */}
            <div
              className="flex items-center shrink-0"
              style={{ gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}
            >
              <Search size={16} strokeWidth={1.5} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search projects, roles, papers, tech…"
                aria-label="Search"
                className="flex-1 bg-transparent outline-none type-body"
                style={{
                  color: 'var(--color-fg)',
                  border: 'none',
                  fontSize: 15,
                  cursor: 'text',
                  caretColor: 'var(--color-accent)',
                }}
              />
              <kbd
                className="type-caption shrink-0"
                style={{ color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-subtle)', padding: '2px 6px' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-1) 0' }}>
              {flat.length === 0 && (
                <div
                  className="type-body"
                  style={{ color: 'var(--color-muted)', padding: 'var(--space-4) var(--space-3)', textAlign: 'center' }}
                >
                  No matches for “{query}”
                </div>
              )}

              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <div
                    className="type-caption"
                    style={{ color: 'var(--color-muted)', opacity: 0.5, padding: `var(--space-2) var(--space-3) var(--space-1)`, letterSpacing: '0.16em' }}
                  >
                    {group}
                  </div>

                  {items.map((r) => {
                    const idx = flat.indexOf(r);
                    const isActive = idx === active;
                    return (
                      <button
                        key={r.cmd.id}
                        type="button"
                        data-index={idx}
                        onClick={() => run(r.cmd)}
                        onMouseEnter={() => { setActive(idx); setVariant('link'); }}
                        onMouseLeave={() => setVariant('default')}
                        className="w-full flex items-center text-left"
                        style={{
                          gap: 'var(--space-2)',
                          padding: `var(--space-1) var(--space-3)`,
                          minHeight: 40,
                          background: isActive ? 'rgba(245,166,35,0.10)' : 'transparent',
                          borderLeft: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                          transition: `background var(--duration-fast) var(--ease-out)`,
                        }}
                      >
                        <span
                          className="type-body truncate"
                          style={{ color: isActive ? 'var(--color-fg)' : 'rgba(255,255,255,0.82)', fontSize: 14, flexShrink: 0 }}
                        >
                          <Highlight text={r.cmd.label} hits={r.hits} />
                        </span>

                        {r.cmd.hint && (
                          <span className="type-caption truncate" style={{ color: 'var(--color-muted)', opacity: 0.7, flex: 1 }}>
                            {r.cmd.hint}
                          </span>
                        )}

                        {r.cmd.action.kind === 'external' && (
                          <ArrowUpRight size={12} strokeWidth={1.5} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer legend */}
            <div
              className="flex items-center shrink-0"
              style={{ gap: 'var(--space-3)', padding: `var(--space-1) var(--space-3)`, borderTop: '1px solid var(--color-border)' }}
            >
              <span className="type-caption flex items-center" style={{ color: 'var(--color-muted)', opacity: 0.6, gap: 4 }}>
                <ArrowUp size={10} /><ArrowDown size={10} /> navigate
              </span>
              <span className="type-caption flex items-center" style={{ color: 'var(--color-muted)', opacity: 0.6, gap: 4 }}>
                <CornerDownLeft size={10} /> open
              </span>
              <span className="type-caption" style={{ color: 'var(--color-muted)', opacity: 0.6, marginLeft: 'auto' }}>
                {flat.length} result{flat.length === 1 ? '' : 's'}
              </span>
            </div>
      </motion.div>
    </motion.div>
  );
}

export function CommandPalette() {
  const paletteOpen = useUIStore((s) => s.paletteOpen);
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);
  const togglePalette = useUIStore((s) => s.togglePalette);
  const navOpen = useUIStore((s) => s.navOpen);
  const setNavOpen = useUIStore((s) => s.setNavOpen);

  /* ⌘K / Ctrl+K anywhere; "/" when not already typing */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (navOpen) setNavOpen(false);
        togglePalette();
        return;
      }
      if (e.key === '/' && !paletteOpen) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen, paletteOpen, setNavOpen, setPaletteOpen, togglePalette]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>{paletteOpen && <PaletteDialog />}</AnimatePresence>,
    document.body,
  );
}
