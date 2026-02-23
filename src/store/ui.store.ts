import { create } from 'zustand';

interface UIState {
  navOpen: boolean;
  activeSection: string;
  scrollDirection: 'up' | 'down';
  soundEnabled: boolean;
  reducedMotion: boolean;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
  setActiveSection: (s: string) => void;
  setScrollDirection: (d: 'up' | 'down') => void;
  toggleSound: () => void;
  setReducedMotion: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  navOpen: false,
  activeSection: 'hero',
  scrollDirection: 'down',
  soundEnabled: false,
  reducedMotion: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
  setActiveSection: (activeSection) => set({ activeSection }),
  setScrollDirection: (scrollDirection) => set({ scrollDirection }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
