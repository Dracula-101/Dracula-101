# Maintenance notes

Operational knowledge for this repo — the things that aren't obvious from the
code, and the fixes for problems that have actually happened here.

---

## Recovering source assets from the deployed site

**When you need this:** `npm run build` or `npm run dev` fails with
`Failed to resolve import` on a file under `src/assets/`, and `git checkout` on
that file fails with `unable to read sha1 file`.

Images and PDFs under `src/assets/` are **statically imported** by
`src/data/projectImages.ts` and `src/data/research.ts`. Vite resolves those at
build time, so a missing file is a hard build failure, not a broken `<img>`.

This has happened once (Sept 2026): 33 asset files were deleted from the working
tree, and their git blobs were missing from `.git/objects` *and* from origin, so
they could not be restored with git. They were recovered from the deployed
GitHub Pages build, which still served the last-published copies.

### Procedure

1. **List what's actually missing.**

   ```bash
   git ls-files -d
   ```

2. **Public files come down directly** — anything in `public/` keeps its name in
   the build (`models/*.glb`, `resume-preview.png`, `resume.pdf`).

   ```bash
   curl -sS https://dracula-101.github.io/Dracula-101/resume-preview.png -o public/resume-preview.png
   ```

3. **Everything under `src/assets/` is content-hashed** by Vite to
   `assets/<name>-<hash>.<ext>`. Collect the URLs from the deployed JS chunks:

   ```bash
   BASE=https://dracula-101.github.io/Dracula-101
   curl -s "$BASE/" | grep -oE '/Dracula-101/assets/[^"]+\.js' | sort -u > entries.txt
   while read -r j; do curl -s "https://dracula-101.github.io$j"; echo; done < entries.txt \
     | grep -oE '/Dracula-101/assets/[A-Za-z0-9_.-]+\.(png|jpg|jpeg|pdf|glb|webp)' | sort -u
   ```

4. **Download them and strip the hash** to recover the original filename. The
   pattern is `name-XXXXXXXX.ext`, where the hash is exactly 8 characters.

5. **Disambiguate duplicate basenames by content.** Several files share a name
   across directories and cannot be mapped by filename alone:

   | Basename     | Belongs to                                              | How to tell                                   |
   | ------------ | ------------------------------------------------------- | --------------------------------------------- |
   | `home.jpg`   | `jetscan/app/` and `skycast/app/`                        | Open them — scanner UI vs. weather UI          |
   | `paper.pdf`  | `crop-weed/`, `fetal-ecg/`, `skull-stripping/`, `handwriting-ocr/` | Read the title on page 1              |
   | `icon.png`   | one per project under `<project>/icon/`                  | Usually already present; skip                  |

6. **Verify.** A clean recovery is byte-identical to what git expects, so
   `git status` should show the files as unmodified, not modified:

   ```bash
   git status --short   # no ' M' or ' D' on recovered assets
   npm run build
   ```

> Recovered assets are the *last deployed* versions. Anything changed locally
> and never deployed is not recoverable this way.

---

## Corrupted `node_modules`

**Symptoms seen here:** all at once, with no code change to explain them —

- `Error: Cannot find module './_tsc.js'` when running `tsc`
- `Cannot find module 'lucide-react' or its corresponding type declarations`
- Dozens of `Object literal may only specify known properties, and 'gap' does
  not exist in type 'MotionStyle'` errors across files nobody had edited

The last one is the confusing one. It is **not** a framer-motion version
problem. `MotionStyle` extends `MakeMotion<CSSProperties>`, and `CSSProperties`
resolves through the `csstype` package. When `csstype/index.d.ts` goes missing,
`CSSProperties` silently collapses to `{}` and every ordinary CSS property on a
`motion.*` `style` prop becomes a type error.

**Check for it:**

```bash
wc -l node_modules/csstype/index.d.ts     # should be ~22,500 lines
ls node_modules/typescript/lib/_tsc.js    # should exist
ls node_modules/lucide-react/dist/        # should contain cjs, esm, umd, *.d.ts
```

**Fix:** a partial `npm install` will report "up to date" and change nothing,
because the lockfile state looks correct. You need a full reinstall:

```bash
rm -rf node_modules && npm ci
```

---

## GitHub Pages routing

`vite.config.ts` sets `base: '/Dracula-101/'` and `main.tsx` sets a matching
router `basename`. Both must stay in sync with the repo name.

The deploy workflow copies `dist/index.html` to `dist/404.html`, which is what
makes deep links work — GitHub Pages serves `404.html` for any unknown path, the
SPA boots, and React Router reads `location.pathname`.

**The caveat:** that response still carries HTTP **404**. Visitors see the right
page; crawlers and link-preview scrapers see an error status. If that matters
later, the fix is a host that supports real SPA rewrites (Netlify `_redirects`,
Cloudflare Pages, Vercel), not a change in this repo.

Because of this, a locally served `dist/` needs the same fallback to behave like
production:

```bash
cp dist/index.html dist/404.html
```

---

## Local development

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint
```

- **Port conflicts.** `.claude/launch.json` pins port 5173. If another project is
  already using it, change the port there rather than killing the other server.
- **Baseline lint state.** `npm run lint` reports ~28 pre-existing errors,
  concentrated in `src/webgl/`, `src/utils/raf.ts`, and `src/utils/`. They are
  mostly `no-explicit-any` and unused catch bindings. New code should not add to
  the count.
- **`tsconfig.app.tsbuildinfo`** is tracked but is a build artifact. Delete it if
  `tsc -b` starts reporting stale results.

---

## Adding content

All page content is data-driven — the components read from `src/data/` and
nothing needs to be edited in the components themselves:

| File               | Drives                                            |
| ------------------ | ------------------------------------------------- |
| `projects.ts`      | Work section and `/project/:id`                   |
| `experience.ts`    | Experience section, `/experience/:id`, education, skills |
| `research.ts`      | Research section and `/research/:id`              |
| `projectImages.ts` | Galleries and architecture diagrams               |
| `stats.ts`         | Stats section                                     |
| `process.ts`       | Process section                                   |

The ⌘K palette builds its index from these same modules
(`src/data/commands.ts`), so new entries become searchable automatically. When
adding an item, put searchable-but-not-displayed terms — tech stack, company,
venue — where the index can reach them; that is what makes a technology search
find the work that used it.
