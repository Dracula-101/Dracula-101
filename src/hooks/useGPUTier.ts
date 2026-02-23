import { useState, useEffect } from 'react';

type GPUTier = 'high' | 'mid' | 'low';

function benchmark(): GPUTier {
  const cached = sessionStorage.getItem('gpu-tier') as GPUTier | null;
  if (cached) return cached;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return 'low';

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
      const low = /mali|adreno 3|adreno 4|sgx|powervr/i.test(renderer);
      const high = /nvidia|amd|radeon|rtx|gtx|rx\s/i.test(renderer);
      const tier: GPUTier = low ? 'low' : high ? 'high' : 'mid';
      sessionStorage.setItem('gpu-tier', tier);
      return tier;
    }
  } catch {}

  return 'mid';
}

const particleCounts: Record<GPUTier, number> = {
  high: 8000,
  mid: 4000,
  low: 1500,
};

export function useGPUTier() {
  const [tier, setTier] = useState<GPUTier>('mid');

  useEffect(() => {
    setTier(benchmark());
  }, []);

  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const particleCount = isMobile
    ? Math.floor(particleCounts[tier] * 0.3)
    : particleCounts[tier];

  return { tier, particleCount };
}
