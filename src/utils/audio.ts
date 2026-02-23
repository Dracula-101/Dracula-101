let ctx: AudioContext | null = null;
let enabled = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function enableSound() {
  enabled = true;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

export function disableSound() {
  enabled = false;
}

function playTone(freq: number, duration: number, gain: number = 0.1, type: OscillatorType = 'sine') {
  if (!enabled) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gainNode = c.createGain();
  osc.connect(gainNode);
  gainNode.connect(c.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gainNode.gain.setValueAtTime(0, c.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, c.currentTime + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export const audio = {
  click: () => playTone(880, 0.035, 0.08),
  hover: () => playTone(1200, 0.015, 0.03),
  transition: () => {
    if (!enabled) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gainNode = c.createGain();
    osc.connect(gainNode);
    gainNode.connect(c.destination);
    osc.frequency.setValueAtTime(60, c.currentTime);
    osc.frequency.linearRampToValueAtTime(80, c.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.06, c.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.2);
  },
};
