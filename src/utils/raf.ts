type RAFCallback = (time: number, delta: number) => void;

class RAFManager {
  private callbacks: Map<string, RAFCallback> = new Map();
  private rafId: number | null = null;
  private lastTime: number = 0;
  private running: boolean = false;

  private tick = (time: number) => {
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.callbacks.forEach((cb) => {
      try { cb(time, delta); } catch (e) { /* silent */ }
    });

    this.rafId = requestAnimationFrame(this.tick);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.running = false;
  }

  add(key: string, cb: RAFCallback) {
    this.callbacks.set(key, cb);
    if (!this.running) this.start();
  }

  remove(key: string) {
    this.callbacks.delete(key);
    if (this.callbacks.size === 0) this.stop();
  }
}

export const raf = new RAFManager();
