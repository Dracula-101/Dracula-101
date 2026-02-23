import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Dracula-101/',
  plugins: [react()],
  optimizeDeps: {
    include: ['three', 'gsap', 'framer-motion', 'zustand', 'lenis', 'ogl'],
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-gsap': ['gsap'],
          'vendor-framer': ['framer-motion'],
          'vendor-spring': ['@react-spring/web'],
        },
      },
    },
  },
});
