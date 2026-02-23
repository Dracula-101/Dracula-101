export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const map = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutExpo = (t: number): number =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;

export const countUpEase = (t: number): number => {
  // Fast start, slow finish — ideal for CountUp
  return 1 - Math.pow(1 - t, 4);
};

export const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
