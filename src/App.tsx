import { useEffect, useLayoutEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { raf } from './utils/raf';
import { CustomCursor } from './components/cursor/CustomCursor';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { GridOverlay } from './components/ui/GridOverlay';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Work } from './components/sections/Work';
import { Stats } from './components/sections/Stats';
import { Contact } from './components/sections/Contact';
import { Experience } from './components/sections/Experience';
import { Research } from './components/sections/Research';
import { Process } from './components/sections/Process';
import { ProjectDetail } from './components/pages/ProjectDetail';
import { ExperienceDetail } from './components/pages/ExperienceDetail';
import { ResearchDetail } from './components/pages/ResearchDetail';
import { ResumePage } from './components/pages/ResumePage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useScrollProgress } from './hooks/useScrollProgress';

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Experience />
      <Research />
      <Process />
      <Stats />
      <Contact />
    </>
  );
}

/* Scroll to top on route change — uses Lenis for immediate jump */
function ScrollToTop({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenisRef]);
  return null;
}

export function App() {
  useReducedMotion();
  useScrollProgress();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Plug Lenis into GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis to the shared RAF loop
    raf.add('lenis', (time) => {
      lenis.raf(time);
    });

    return () => {
      raf.remove('lenis');
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <>
      <ScrollToTop lenisRef={lenisRef} />
      <CustomCursor />
      <GridOverlay />
      <Navigation />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/research/:id" element={<ResearchDetail />} />
          <Route path="/resume" element={<ResumePage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
