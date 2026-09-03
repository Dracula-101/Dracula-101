import { useEffect } from 'react';

/* ──────────────────────────────────────────────────────────
   Per-route document metadata.

   The app is a single HTML file, so without this every route
   shares one <title> and one og:image — every link shared to
   LinkedIn or Slack unfurls identically. This rewrites the
   head on navigation and restores the site defaults on unmount.
   ────────────────────────────────────────────────────────── */

const SITE_NAME = 'Pratik Pujari';
const SITE_URL = 'https://dracula-101.github.io/Dracula-101/';
const DEFAULT_TITLE = 'Pratik Pujari — Engineer & Builder';
const DEFAULT_DESCRIPTION =
  'Full-Stack Engineer & Builder. Distributed systems, mobile apps, and intelligent interfaces.';
const DEFAULT_IMAGE = `${SITE_URL}og.png`;

export interface DocumentMeta {
  /** Page-specific title; the site name is appended automatically. */
  title?: string;
  description?: string;
  /** Absolute URL. Falls back to the site-wide card. */
  image?: string;
  /** Path relative to the site root, e.g. "project/echo". */
  path?: string;
}

function setTag(selector: string, attr: 'content' | 'href', value: string) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    const m = selector.match(/\[(property|name|rel)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function apply({ title, description, image, path }: DocumentMeta) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  const url = path ? `${SITE_URL}${path.replace(/^\//, '')}` : SITE_URL;

  document.title = fullTitle;
  setTag('meta[name="description"]', 'content', desc);
  setTag('link[rel="canonical"]', 'href', url);

  setTag('meta[property="og:title"]', 'content', fullTitle);
  setTag('meta[property="og:description"]', 'content', desc);
  setTag('meta[property="og:image"]', 'content', img);
  setTag('meta[property="og:url"]', 'content', url);
  setTag('meta[property="og:type"]', 'content', path ? 'article' : 'website');
  setTag('meta[property="og:site_name"]', 'content', SITE_NAME);

  setTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setTag('meta[name="twitter:title"]', 'content', fullTitle);
  setTag('meta[name="twitter:description"]', 'content', desc);
  setTag('meta[name="twitter:image"]', 'content', img);
}

export function useDocumentMeta(meta: DocumentMeta) {
  const { title, description, image, path } = meta;

  useEffect(() => {
    apply({ title, description, image, path });
    return () => apply({});
  }, [title, description, image, path]);
}
