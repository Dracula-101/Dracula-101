import { projects } from './projects';
import { experiences, education, skills } from './experience';
import { publications } from './research';

/* ──────────────────────────────────────────────────────────
   Command index for the ⌘K palette.

   Built from the same data that renders the site, so a new
   project or paper shows up in search without touching this
   file. `keywords` carries the terms that should match but
   aren't in the visible label — tech stacks, companies,
   venues — which is what makes "kafka" find Echo.
   ────────────────────────────────────────────────────────── */

export type CommandGroup =
  | 'Navigation'
  | 'Projects'
  | 'Experience'
  | 'Research'
  | 'Links';

export type CommandAction =
  | { kind: 'route'; to: string }
  | { kind: 'section'; hash: string }
  | { kind: 'external'; href: string };

export interface Command {
  id: string;
  label: string;
  hint?: string;
  group: CommandGroup;
  keywords: string[];
  action: CommandAction;
}

const SECTIONS: Command[] = [
  { id: 'nav-hero', label: 'Home', hint: 'Top of page', group: 'Navigation', keywords: ['start', 'hero', 'intro'], action: { kind: 'section', hash: '#hero' } },
  { id: 'nav-about', label: 'About', group: 'Navigation', keywords: ['bio', 'who'], action: { kind: 'section', hash: '#about' } },
  { id: 'nav-work', label: 'Work', hint: 'All projects', group: 'Navigation', keywords: ['projects', 'portfolio'], action: { kind: 'section', hash: '#work' } },
  { id: 'nav-experience', label: 'Experience', group: 'Navigation', keywords: ['jobs', 'roles', 'career'], action: { kind: 'section', hash: '#experience' } },
  { id: 'nav-research', label: 'Research', group: 'Navigation', keywords: ['papers', 'publications'], action: { kind: 'section', hash: '#research' } },
  { id: 'nav-process', label: 'Process', group: 'Navigation', keywords: ['philosophy', 'how i work'], action: { kind: 'section', hash: '#process' } },
  { id: 'nav-contact', label: 'Contact', group: 'Navigation', keywords: ['email', 'hire', 'reach out'], action: { kind: 'section', hash: '#contact' } },
  { id: 'nav-resume', label: 'Résumé', hint: 'Full CV', group: 'Navigation', keywords: ['cv', 'resume', 'download'], action: { kind: 'route', to: '/resume' } },
];

const LINKS: Command[] = [
  { id: 'link-github', label: 'GitHub', hint: 'github.com/Dracula-101', group: 'Links', keywords: ['code', 'source', 'repos'], action: { kind: 'external', href: 'https://github.com/Dracula-101' } },
  { id: 'link-linkedin', label: 'LinkedIn', hint: 'in/pratik-pujari', group: 'Links', keywords: ['social', 'connect'], action: { kind: 'external', href: 'https://linkedin.com/in/pratik-pujari' } },
  { id: 'link-email', label: 'Email', hint: 'pratikpujari1000@gmail.com', group: 'Links', keywords: ['mail', 'contact', 'hire'], action: { kind: 'external', href: 'mailto:pratikpujari1000@gmail.com' } },
  { id: 'link-resume-pdf', label: 'Download résumé (PDF)', group: 'Links', keywords: ['cv', 'pdf', 'download'], action: { kind: 'external', href: `${import.meta.env.BASE_URL}resume.pdf` } },
];

export const commands: Command[] = [
  ...SECTIONS,

  ...projects.map<Command>((p) => ({
    id: `project-${p.id}`,
    label: p.title,
    hint: p.descriptor,
    group: 'Projects',
    keywords: [p.category, p.year, ...p.tech],
    action: { kind: 'route', to: `/project/${p.id}` },
  })),

  ...experiences.map<Command>((e) => ({
    id: `exp-${e.id}`,
    label: e.role,
    hint: e.company,
    group: 'Experience',
    keywords: [e.company, e.location, e.period, e.type, ...e.tech],
    action: { kind: 'route', to: `/experience/${e.id}` },
  })),

  ...education.map<Command>((e) => ({
    id: `edu-${e.id}`,
    label: e.degree,
    hint: e.school,
    group: 'Experience',
    keywords: [e.school, e.location, e.period, 'education', 'degree', 'university'],
    action: { kind: 'section', hash: '#experience' },
  })),

  ...publications.map<Command>((p) => ({
    id: `pub-${p.id}`,
    label: p.shortTitle,
    hint: `${p.conferenceShort} · ${p.year}`,
    group: 'Research',
    keywords: [p.title, p.conference, p.venue, p.year, p.status, ...p.tech],
    action: { kind: 'route', to: `/research/${p.id}` },
  })),

  ...LINKS,
];

/** Flat list of every technology mentioned anywhere — used to hint at
    searchable terms when the palette is empty. */
export const allTech: string[] = [
  ...new Set([
    ...Object.values(skills).flat(),
    ...projects.flatMap((p) => p.tech),
    ...publications.flatMap((p) => p.tech),
  ]),
].sort();
