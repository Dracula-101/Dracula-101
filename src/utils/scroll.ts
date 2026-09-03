import type Lenis from 'lenis';

/* Shared handle on the app's Lenis instance so overlays (command palette,
   modals) can freeze the page behind them without body-position hacks. */

let instance: Lenis | null = null;

export function registerLenis(l: Lenis | null) {
  instance = l;
}

export function lockScroll() {
  instance?.stop();
}

export function unlockScroll() {
  instance?.start();
}

export function scrollToTop(immediate = true) {
  if (instance) instance.scrollTo(0, { immediate });
  else window.scrollTo(0, 0);
}
