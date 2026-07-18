/* ──────────────────────────────────────────────────────────
   Company logos for the Experience section.
   Imported so Vite hashes + bundles them at build time.

   Each logo declares the chip background it should sit on:
   dark/colored marks (Visa, Aim4U) read best on a white chip,
   a light monochrome wordmark (Acuradyne) needs a dark chip.
   ids without an entry fall back to the lucide type icon.
   ────────────────────────────────────────────────────────── */

import visaLogo from '../assets/experience/visa/logo.svg';
import aim4uLogo from '../assets/experience/aim4u/logo.png';
import acuradyneLogo from '../assets/experience/acuradyne/logo.png';

export interface ExperienceLogo {
    src: string;
    /** chip background behind the logo */
    bg: string;
    /** padding (px) inside the badge — wide wordmarks want less */
    pad: number;
    /** optional CSS filter — used to darken a light-only logo for a white chip */
    filter?: string;
}

export const experienceLogos: Record<string, ExperienceLogo> = {
    visa: { src: visaLogo, bg: '#FFFFFF', pad: 6 },
    aim4u: { src: aim4uLogo, bg: '#FFFFFF', pad: 5 },
    // Acuradyne's mark is a light-cyan wordmark; on a white chip it needs
    // darkening to a legible silhouette.
    acuradyne: { src: acuradyneLogo, bg: '#FFFFFF', pad: 4, filter: 'brightness(0)' },
};
