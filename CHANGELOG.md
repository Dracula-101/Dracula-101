# Changelog

Notable changes to the portfolio site. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — 2026-09-02

### Added

- **⌘K command palette** (`src/components/ui/CommandPalette.tsx`) — keyboard-first
  search across every page, project, role, publication, and technology.
  - `⌘K` / `Ctrl+K` anywhere; `/` when focus isn't already in a text field.
  - `↑` `↓` to move, `Enter` to open, `Esc` to close, click to select.
  - Matches labels, hints, and hidden keywords, so a search for a technology
    finds the work that used it — `kafka` returns Echo, `unet` returns the three
    U-Net papers. Multi-word queries are AND (`go kafka` → Echo).
  - Contiguous substring hits outrank scattered ones, and gap-limited
    subsequence matching keeps abbreviations working (`jtscn` → JetScan) without
    letting noise through (`snkt` matches nothing).
  - Results group by kind; while searching, the group holding the best match
    sorts first, so the top hit is never buried below a fixed section order.
  - Freezes the page behind it via Lenis rather than a body-position hack.
- **404 route** (`src/components/pages/NotFound.tsx`) — previously an unmatched
  URL rendered an empty page under the nav. Shows the attempted path, a way
  home, a palette shortcut, and suggested destinations.
- **Per-route metadata** (`src/hooks/useDocumentMeta.ts`) — every route now sets
  its own `<title>`, description, canonical URL, Open Graph, and Twitter card.
  Previously all routes shared one static title, so every shared link unfurled
  identically.
- **Social card** (`public/og.png`, 1200×630) plus JSON-LD `Person` structured
  data in `index.html`.
- **Command index** (`src/data/commands.ts`) — derived from the existing data
  modules, so new projects and papers become searchable without touching
  palette code.
- **Lenis handle** (`src/utils/scroll.ts`) — shared access to the scroll
  instance so overlays can lock and unlock the page.

### Fixed

- **Missing favicon.** `index.html` referenced `/favicon.svg`, which did not
  exist and returned 404 in production; `public/` only contained `vite.svg`.
  The path was also root-absolute, ignoring the `/Dracula-101/` base.
- **Type narrowing** in `ResearchDetail` when reading fields off the
  publication/project union.

### Removed

- Four components with no references anywhere in the codebase: `KnowledgeGraph`
  (302 lines of Three.js), `NetworkMesh`, `TiltCard`, `GlitchText`.

### Notes

- Deep links (`/project/echo`, `/resume`, …) render correctly for visitors — the
  deploy workflow already copies `index.html` to `404.html`. They do return a
  404 *status code*, which affects crawlers and link scrapers but not users.
  See `docs/MAINTENANCE.md`.
- `tsconfig.app.tsbuildinfo` is tracked in git but is a build artifact; it
  churns on every build and is a candidate for `.gitignore`.
