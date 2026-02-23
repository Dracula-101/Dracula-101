// Simplex noise implementation for CPU-side use
// Based on Stefan Gustavson's implementation

const grad3 = new Float32Array([
  1,1,0,-1,1,0,1,-1,0,-1,-1,0,
  1,0,1,-1,0,1,1,0,-1,-1,0,-1,
  0,1,1,0,-1,1,0,1,-1,0,-1,-1
]);

const p = new Uint8Array(256);
for (let i = 0; i < 256; i++) p[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [p[i], p[j]] = [p[j], p[i]];
}
const perm = new Uint8Array(512);
const permMod12 = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  perm[i] = p[i & 255];
  permMod12[i] = perm[i] % 12;
}

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

function dot2(g: Float32Array, offset: number, x: number, y: number): number {
  return g[offset] * x + g[offset + 1] * y;
}

export function simplex2(xin: number, yin: number): number {
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  let i1: number, j1: number;
  if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  const ii = i & 255;
  const jj = j & 255;
  const gi0 = permMod12[ii + perm[jj]] * 3;
  const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
  const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;

  let t0 = 0.5 - x0*x0 - y0*y0;
  let n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * dot2(grad3, gi0, x0, y0));

  let t1 = 0.5 - x1*x1 - y1*y1;
  let n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * dot2(grad3, gi1, x1, y1));

  let t2 = 0.5 - x2*x2 - y2*y2;
  let n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * dot2(grad3, gi2, x2, y2));

  return 70.0 * (n0 + n1 + n2);
}
