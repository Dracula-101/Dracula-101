import { create } from 'zustand';

export type CursorVariant =
  | 'default'
  | 'link'
  | 'button'
  | 'text'
  | 'drag'
  | 'repel'
  | 'magnetic';

interface CursorState {
  variant: CursorVariant;
  isVisible: boolean;
  setVariant: (v: CursorVariant) => void;
  hide: () => void;
  show: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  variant: 'default',
  isVisible: true,
  setVariant: (variant) => set({ variant }),
  hide: () => set({ isVisible: false }),
  show: () => set({ isVisible: true }),
}));
