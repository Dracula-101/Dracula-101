/* ──────────────────────────────────────────────────────────
   Site variant: one build, two audiences.

   /Dracula-101/swe/…      → Software Engineer site (also the bare root)
   /Dracula-101/android/…  → Android Engineer site

   The variant comes from the first path segment and becomes the router
   basename (main.tsx), so every absolute in-app link stays inside its
   variant without changes. Switching variant is a full page load.
   ────────────────────────────────────────────────────────── */

export type Variant = 'swe' | 'android';

const BASE = import.meta.env.BASE_URL; // '/Dracula-101/'
const seg = window.location.pathname.slice(BASE.length).split('/')[0];

/** Only set when the URL carries an explicit variant prefix. */
const prefix = seg === 'swe' || seg === 'android' ? seg : '';

export const VARIANT: Variant = prefix === 'android' ? 'android' : 'swe';

/** Router basename, without trailing slash. */
export const ROUTER_BASENAME = `${BASE}${prefix}`.replace(/\/$/, '');

export const SITE_ORIGIN = 'https://dracula-101.github.io';
/** Canonical URL of this variant's home, with trailing slash. */
export const SITE_URL = `${SITE_ORIGIN}${BASE}${VARIANT}/`;

export const pick = <T,>(v: Record<Variant, T>): T => v[VARIANT];

export const copy = pick({
  swe: {
    role: 'Software Engineer',
    heroLines: ['SOFTWARE', 'ENGINEER', '& BUILDER'] as const,
    heroSubtitle:
      'Building distributed systems, event-driven backends, and AI agents that ship to production. MS CS at CU Boulder, ex-Visa SWE intern.',
    aboutHeading: 'I build backends that scale and systems that hold up in production.',
    aboutParas: [
      "I'm an MS Computer Science student at the University of Colorado Boulder (GPA 3.8), graduating May 2027, with a B.Tech in Computer Engineering from Sardar Patel Institute of Technology. I work across the stack: distributed backends in Python and Go, systems work in Rust, and applied AI.",
      'At Visa I built VisionX, an AI log-triage platform on FastAPI, Kafka and PostgreSQL that handles ~1M logs/hour. On my own time I built Echo, a live chat app of 8 Go microservices, and Pivot, a Rust runtime that forks Firecracker microVMs for agentic RL. Before that: cloud backends at Aim4U and IoT backends at Acuradyne (IIT Bombay Research Park).',
    ],
    aboutStats: [
      { value: 1, suffix: 'M', label: 'Logs / Hour at Visa' },
      { value: 3, suffix: '', label: 'Internships' },
      { value: 8, suffix: '', label: 'Go Microservices' },
    ],
    metaTitle: 'Pratik Pujari — Software Engineer',
    metaDescription:
      'Software Engineer: distributed systems, microservices, Kafka, FastAPI, Go, Rust, and AI agents. MS CS at CU Boulder, ex-Visa SWE intern.',
    resumePdf: 'resume-swe.pdf',
    resumePreview: 'resume-swe-preview.png',
  },
  android: {
    role: 'Android Engineer',
    heroLines: ['ANDROID', 'ENGINEER', '& BUILDER'] as const,
    heroSubtitle:
      'Building native Android apps in Kotlin and Jetpack Compose: modular architecture, design systems, real-time networking, and release engineering.',
    aboutHeading: 'I build Android apps with clean architecture and interfaces that feel fast.',
    aboutParas: [
      "I'm an MS Computer Science student at the University of Colorado Boulder (GPA 3.8), graduating May 2027, with a B.Tech in Computer Engineering from Sardar Patel Institute of Technology. I build production-grade native Android in Kotlin and Jetpack Compose, and I've shipped Flutter apps to Google Play and the App Store.",
      "Echo's Android client is 11 Gradle modules on MVI and Hilt with a 50+ component Compose design system. JetScan is a 35K+ line open-source scanner on CameraX and OpenCV. I also bring backend depth from Visa (FastAPI, Kafka) and Go, so I know both ends of the API.",
    ],
    aboutStats: [
      { value: 11, suffix: '', label: 'Gradle Modules in Echo' },
      { value: 550, suffix: '+', label: 'Store Downloads' },
      { value: 35, suffix: 'K+', label: 'Lines of Kotlin' },
    ],
    metaTitle: 'Pratik Pujari — Android Engineer',
    metaDescription:
      'Android Engineer: Kotlin, Jetpack Compose, MVVM/MVI, Hilt, Room, CameraX, multi-module Gradle, and Play Store releases. MS CS at CU Boulder.',
    resumePdf: 'resume-android.pdf',
    resumePreview: 'resume-android-preview.png',
  },
});
