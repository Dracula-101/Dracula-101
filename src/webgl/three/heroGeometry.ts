import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { raf } from '../../utils/raf';
import { lerp } from '../../utils/math';

/* ------------------------------------------------------------------
 *  Hero 3D — Carousel of 3 GLB models (Phone, Laptop, Server).
 *  Auto-cycles every 5 s with scale + opacity fade transitions.
 *  Sits on the right side; auto-rotates, mouse-follow, drag, click.
 *
 *  Interactions:
 *    hover  → scale pulse + glow boost
 *    click  → 360° spin burst
 *    drag   → free orbit rotation
 *    scroll → parallax depth + canvas fade
 * ------------------------------------------------------------------ */

interface ModelEntry {
  group: THREE.Group;
  loaded: boolean;
  currentOpacity: number;
  targetOpacity: number;
  currentScale: number;
  targetScale: number;
}

interface HeroGeometryConfig {
  canvas: HTMLCanvasElement;
  foregroundColor?: string;
  accentColor?: string;
  onSlideChange?: (index: number) => void;
  onProgress?: (loaded: number, total: number) => void;
  onAllLoaded?: () => void;
}

const MODEL_FILES = [
  'low_poly_android_phone.glb',   // 0 — Mobile
  'laptop.glb',                    // 1 — Web
  'server_rack.glb',               // 2 — Server
];

/* Per-model orientation corrections [rotX, rotY, rotZ] in radians.
   Applied to the inner model so pivot rotation stays clean. */
const MODEL_ROTATIONS: [number, number, number][] = [
  [Math.PI / 2, 0, 0],              // 0 — Phone: stand upright (Z→Y)
  [0, Math.PI, 0],                   // 1 — Laptop: face towards camera
  [0, 0, 0],                        // 2 — Server
];

const CYCLE_INTERVAL = 5;          // seconds between auto-advance
const TRANSITION_SPEED = 0.05;     // lerp factor for fade/scale
const BASE_SCALE = 2.0;
const SCALE_OUT = 0.001; // scale target when fading out/in (effectively zero)

export class HeroGeometry {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pivot: THREE.Group;           // parent for all models
  private models: ModelEntry[] = [];
  private particles!: THREE.Points;
  private glowSprite!: THREE.Sprite;
  private glowAnchor!: THREE.Group;     // scene-level group for glow (no rotation)

  private activeIndex = 0;
  private lastSwitch = 0;               // clock time of last carousel change
  private allLoaded = false;
  private firstModelReady = false;      // true once the first model is loaded
  private entranceProgress = 0;         // 0→1 smooth entrance
  private loadedCount = 0;              // how many models have loaded

  // Mouse & scroll
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private scrollProgress = 0;
  private currentScroll = 0;
  private clock = new THREE.Clock();
  private disposed = false;
  private mouse = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  private orientationSupported = false;
  private targetOrientX = 0;
  private targetOrientY = 0;

  // Hover fidget rotation — mouse movement over model rotates it
  private hovered = false;
  private hoverRotX = 0;      // target from hover
  private hoverRotY = 0;
  private currentHoverRotX = 0;
  private currentHoverRotY = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Drag rotation (click+drag for free orbit)
  private dragging = false;
  private dragStart = new THREE.Vector2();
  private dragRotation = new THREE.Euler();
  private targetDragRotX = 0;
  private targetDragRotY = 0;
  private currentDragRotX = 0;
  private currentDragRotY = 0;
  private userRotOffsetX = 0;
  private userRotOffsetY = 0;
  private autoRotYAtDragStart = 0;

  // Glow hover smoothing
  private glowHoverFactor = 0;

  // Click animation
  private clickBurstActive = false;
  private clickBurstStart = 0;
  private clickBurstDuration = 1.2;
  private clickSpinStart = 0;       // Y rotation at click start
  private clickDebounce = false;    // prevent rapid re-triggers
  private accentColorObj!: THREE.Color;
  private burstParticles!: THREE.Points;
  private burstParticleVelocities: THREE.Vector3[] = [];
  private shockwaveRing!: THREE.Mesh;
  private burstLight!: THREE.PointLight;
  // Edge-line overlays (created per-model on first click)
  private edgeOverlays: Map<THREE.Mesh, { lines: THREE.LineSegments; lineMat: THREE.LineBasicMaterial }> = new Map();

  // Bound handlers
  private _onMouseMove: (e: MouseEvent) => void;
  private _onMouseDown: (e: MouseEvent) => void;
  private _onMouseUp: (e: MouseEvent) => void;
  private _onClick: (e: MouseEvent) => void;
  private _onResize: () => void;
  private _onOrientation: (e: DeviceOrientationEvent) => void;
  private _onTouchStart: (e: TouchEvent) => void;
  private _onTouchMove: (e: TouchEvent) => void;
  private _onTouchEnd: () => void;

  constructor(private config: HeroGeometryConfig) {
    const accent = config.accentColor ?? '#F5A623';
    this.accentColorObj = new THREE.Color(accent);

    /* ---- Renderer ---- */
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    /* ---- Scene ---- */
    this.scene = new THREE.Scene();
    this.pivot = new THREE.Group();
    this.pivot.position.set(2.5, 0, 0);
    this.pivot.visible = false;  // hidden until first model loads
    this.scene.add(this.pivot);

    /* ---- Camera ---- */
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this.camera.position.z = 6;

    /* ---- Setup ---- */
    this.setupLighting(accent);
    this.buildGlow(accent);
    this.buildClickEffects(accent);
    this.buildParticles(accent);
    this.loadAllModels();

    /* ---- Events ---- */
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onClick = this.onClickHandler.bind(this);
    this._onResize = this.onResize.bind(this);
    this._onOrientation = this.onOrientation.bind(this);
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    this.bindEvents();
    this.startLoop();
  }

  /* ==================================================================
   *  Lighting
   * ================================================================== */

  private setupLighting(accent: string) {
    const accentColor = new THREE.Color(accent);

    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);

    // Key — warm accent upper-right
    const key = new THREE.DirectionalLight(accentColor, 2.8);
    key.position.set(4, 3, 2);
    this.scene.add(key);

    // Fill — cool blue left
    const fill = new THREE.DirectionalLight(0x4466ff, 0.9);
    fill.position.set(-3, 1, 2);
    this.scene.add(fill);

    // Rim — behind for silhouette
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(0, 2, -4);
    this.scene.add(rim);

    // Accent point
    const point = new THREE.PointLight(accentColor, 3, 10, 2);
    point.position.set(3, 1, 2);
    this.scene.add(point);
  }

  /* ==================================================================
   *  Glow sprite behind the model
   * ================================================================== */

  private buildGlow(accent: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Radial gradient — accent color to transparent
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, accent + 'AA');   // center: semi-opaque
    grad.addColorStop(0.3, accent + '55');
    grad.addColorStop(0.7, accent + '18');
    grad.addColorStop(1, accent + '00');   // edge: transparent
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      opacity: 0.6,
    });
    this.glowSprite = new THREE.Sprite(mat);
    this.glowSprite.scale.set(5, 5, 1);
    this.glowSprite.position.set(0, 0, -1.2); // behind the models
    // Add glow to a scene-level anchor so it follows pivot position but not rotation
    this.glowAnchor = new THREE.Group();
    this.glowAnchor.position.copy(this.pivot.position);
    this.glowAnchor.add(this.glowSprite);
    this.scene.add(this.glowAnchor);
  }

  /* ==================================================================
   *  Click burst effects (particles, shockwave ring, light)
   * ================================================================== */

  private buildClickEffects(accent: string) {
    const accentColor = new THREE.Color(accent);

    // --- Burst particles (spawn from center, fly outward) ---
    const burstCount = 60;
    const bPositions = new Float32Array(burstCount * 3);
    const bColors = new Float32Array(burstCount * 3);
    this.burstParticleVelocities = [];
    const white = new THREE.Color(0xffffff);
    for (let i = 0; i < burstCount; i++) {
      bPositions[i * 3] = 0;
      bPositions[i * 3 + 1] = 0;
      bPositions[i * 3 + 2] = 0;
      // Random mix of accent and white
      const mix = Math.random();
      const c = accentColor.clone().lerp(white, mix * 0.6);
      bColors[i * 3] = c.r;
      bColors[i * 3 + 1] = c.g;
      bColors[i * 3 + 2] = c.b;
      // Random outward velocity
      this.burstParticleVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(2 + Math.random() * 4));
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPositions, 3));
    bGeo.setAttribute('color', new THREE.BufferAttribute(bColors, 3));
    const bMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
    });
    this.burstParticles = new THREE.Points(bGeo, bMat);
    this.burstParticles.visible = false;
    this.scene.add(this.burstParticles);

    // --- Shockwave ring ---
    const ringGeo = new THREE.RingGeometry(0.3, 0.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    this.shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
    this.shockwaveRing.visible = false;
    this.scene.add(this.shockwaveRing);

    // --- Burst point light ---
    this.burstLight = new THREE.PointLight(accentColor, 0, 15, 2);
    this.scene.add(this.burstLight);
  }

  /* ==================================================================
   *  Load all GLB models
   * ================================================================== */

  private loadAllModels() {
    const loader = new GLTFLoader();
    const basePath = import.meta.env.BASE_URL || '/';

    MODEL_FILES.forEach((file, i) => {
      const entry: ModelEntry = {
        group: new THREE.Group(),
        loaded: false,
        currentOpacity: i === 0 ? 1 : 0,
        targetOpacity: i === 0 ? 1 : 0,
        currentScale: BASE_SCALE,
        targetScale: BASE_SCALE,
      };
      this.pivot.add(entry.group);
      this.models.push(entry);

      loader.load(
        `${basePath}models/${file}`,
        (gltf) => {
          const model = gltf.scene;

          // Normalize size so all models look roughly the same scale
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const normScale = 1.8 / maxDim;
          model.scale.setScalar(normScale);

          // Apply per-model rotation correction
          const [rx, ry, rz] = MODEL_ROTATIONS[i];
          if (rx || ry || rz) {
            model.rotation.set(rx, ry, rz);
          }

          // Center the model AFTER scaling & rotation so origin is correct
          const scaledBox = new THREE.Box3().setFromObject(model);
          const center = scaledBox.getCenter(new THREE.Vector3());
          model.position.sub(center);

          // Enable transparency for carousel fading
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                mat.transparent = true;
                mat.depthWrite = true;
                mat.opacity = i === 0 ? 1 : 0;
                // Force double-sided for better visibility on all models
                mat.side = THREE.DoubleSide;
              });
            }
          });

          entry.group.add(model);
          entry.loaded = true;

          // Non-active models start invisible
          if (i !== 0) {
            entry.group.visible = false;
          }

          // Show pivot once the first model is ready
          if (i === 0 && !this.firstModelReady) {
            this.firstModelReady = true;
            this.pivot.visible = true;
            this.entranceProgress = 0;
          }

          // Track loading progress
          this.loadedCount++;
          this.config.onProgress?.(this.loadedCount, MODEL_FILES.length);

          // Check if all loaded
          if (this.models.every(m => m.loaded)) {
            this.allLoaded = true;
            this.lastSwitch = this.clock.getElapsedTime();
            this.config.onAllLoaded?.();
          }
        },
        undefined,
        (err) => console.warn(`Failed to load ${file}:`, err),
      );
    });
  }

  /* ==================================================================
   *  Public — go to specific slide
   * ================================================================== */

  goToSlide(index: number) {
    if (index === this.activeIndex || !this.allLoaded) return;
    this.setActiveModel(index);
  }

  private setActiveModel(index: number) {
    // Fade + scale out current
    this.models[this.activeIndex].targetOpacity = 0;
    this.models[this.activeIndex].targetScale = SCALE_OUT;

    this.activeIndex = index;

    // Fade + scale in next
    const next = this.models[this.activeIndex];
    next.group.visible = true;
    next.targetOpacity = 1;
    next.currentScale = SCALE_OUT;   // start slightly small
    next.targetScale = BASE_SCALE;   // grow to full
    this.lastSwitch = this.clock.getElapsedTime();

    this.config.onSlideChange?.(index);
  }

  /* ==================================================================
   *  Particles
   * ================================================================== */

  private buildParticles(accent: string) {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(accent),
      size: 0.018,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  /* ==================================================================
   *  Events
   * ================================================================== */

  private onMouseMove(e: MouseEvent) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (this.dragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.targetDragRotY = this.userRotOffsetY + dx * 0.008;
      this.targetDragRotX = this.userRotOffsetX + dy * 0.008;
    }

    // Hover fidget — mouse delta directly pushes rotation
    if (this.hovered && !this.dragging) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.hoverRotY += dx * 0.006;
      this.hoverRotX += dy * 0.003;
    }
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.updateHover();
  }

  private onMouseDown(e: MouseEvent) {
    if (!this.allLoaded) return;
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.pivot, true);
    if (hits.length > 0) {
      this.dragging = true;
      this.dragStart.set(e.clientX, e.clientY);
      this.autoRotYAtDragStart = this.clock.getElapsedTime() * 0.15;
      // Snapshot current user offsets so drag is relative
      this.currentDragRotX = this.userRotOffsetX;
      this.currentDragRotY = this.userRotOffsetY;
      this.targetDragRotX = this.userRotOffsetX;
      this.targetDragRotY = this.userRotOffsetY;
      this.config.canvas.style.cursor = 'grabbing';
    }
  }

  private onMouseUp(e: MouseEvent) {
    if (this.dragging) {
      // Persist the user's rotation offset
      this.userRotOffsetX = this.currentDragRotX;
      this.userRotOffsetY = this.currentDragRotY;
      this.dragging = false;
      this.config.canvas.style.cursor = this.hovered ? 'grab' : 'default';
    }
  }

  private onClickHandler(e: MouseEvent) {
    if (!this.allLoaded || this.clickDebounce) return;
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.pivot, true);
    if (hits.length > 0) {
      this.triggerClickAnimation();
    }
  }

  private triggerClickAnimation() {
    this.clickBurstActive = true;
    this.clickDebounce = true;
    this.clickBurstStart = this.clock.getElapsedTime();
    this.clickSpinStart = this.userRotOffsetY;

    // Build edge-line overlays for active model if not cached
    if (this.allLoaded) {
      const active = this.models[this.activeIndex];
      active.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!this.edgeOverlays.has(mesh)) {
            const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, 30);
            const lineMat = new THREE.LineBasicMaterial({
              color: this.accentColorObj,
              transparent: true,
              opacity: 0,
              depthTest: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
            const lines = new THREE.LineSegments(edgesGeo, lineMat);
            lines.visible = false;
            mesh.add(lines); // child of mesh so it inherits transform
            this.edgeOverlays.set(mesh, { lines, lineMat });
          }
        }
      });
    }

    // Reset burst particles to pivot center
    const pos = this.burstParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i, this.pivot.position.x, this.pivot.position.y, this.pivot.position.z);
    }
    pos.needsUpdate = true;
    this.burstParticles.visible = true;
    (this.burstParticles.material as THREE.PointsMaterial).opacity = 1;

    // Reset shockwave
    this.shockwaveRing.visible = true;
    this.shockwaveRing.scale.set(1, 1, 1);
    this.shockwaveRing.position.copy(this.pivot.position);
    this.shockwaveRing.position.z += 0.3;
    (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = 0.8;
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onOrientation(e: DeviceOrientationEvent) {
    if (e.gamma !== null && e.beta !== null) {
      this.orientationSupported = true;
      this.targetOrientY = (e.gamma / 90) * 0.8;
      this.targetOrientX = ((e.beta - 45) / 90) * 0.5;
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (!this.allLoaded || e.touches.length !== 1) return;
    const t = e.touches[0];
    this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.pivot, true);
    if (hits.length > 0) {
      this.dragging = true;
      this.dragStart.set(t.clientX, t.clientY);
      this.autoRotYAtDragStart = this.clock.getElapsedTime() * 0.15;
      this.currentDragRotX = this.userRotOffsetX;
      this.currentDragRotY = this.userRotOffsetY;
      this.targetDragRotX = this.userRotOffsetX;
      this.targetDragRotY = this.userRotOffsetY;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.dragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - this.dragStart.x;
    const dy = t.clientY - this.dragStart.y;
    this.targetDragRotY = this.userRotOffsetY + dx * 0.008;
    this.targetDragRotX = this.userRotOffsetX + dy * 0.008;
  }

  private onTouchEnd() {
    if (this.dragging) {
      // If barely moved, treat as a tap → click animation
      const dx = this.targetDragRotX - this.userRotOffsetX;
      const dy = this.targetDragRotY - this.userRotOffsetY;
      if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) {
        this.triggerClickAnimation();
      }

      this.userRotOffsetX = this.currentDragRotX;
      this.userRotOffsetY = this.currentDragRotY;
      this.dragging = false;
    }
  }

  private updateHover() {
    if (!this.allLoaded) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.pivot, true);
    this.hovered = hits.length > 0;
    if (!this.dragging) {
      this.config.canvas.style.cursor = this.hovered ? 'grab' : 'default';
    }
  }

  private bindEvents() {
    const canvas = this.config.canvas;
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('click', this._onClick);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('deviceorientation', this._onOrientation, { passive: true });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd);
  }

  setScrollProgress(p: number) {
    this.scrollProgress = p;
  }

  /* ==================================================================
   *  Render loop
   * ================================================================== */

  private startLoop() {
    raf.add('hero-geometry', () => {
      if (this.disposed) return;
      const t = this.clock.getElapsedTime();

      /* ---- Mouse smoothing ---- */
      if (this.orientationSupported) {
        this.currentMouseX = lerp(this.currentMouseX, this.targetOrientY, 0.04);
        this.currentMouseY = lerp(this.currentMouseY, this.targetOrientX, 0.04);
      } else {
        this.currentMouseX = lerp(this.currentMouseX, this.targetMouseX, 0.04);
        this.currentMouseY = lerp(this.currentMouseY, this.targetMouseY, 0.04);
      }

      /* ---- Scroll ---- */
      this.currentScroll = lerp(this.currentScroll, this.scrollProgress, 0.06);
      const scrollNorm = Math.min(this.currentScroll / 0.3, 1);
      this.camera.position.z = lerp(6, 3, scrollNorm);
      const canvasOpacity = scrollNorm < 1 ? 1 : Math.max(0, 1 - (this.currentScroll - 0.3) / 0.15);
      this.renderer.domElement.style.opacity = String(canvasOpacity);

      /* ---- Auto-cycle carousel ---- */
      if (this.allLoaded && !this.dragging) {
        if (t - this.lastSwitch >= CYCLE_INTERVAL) {
          const next = (this.activeIndex + 1) % this.models.length;
          this.setActiveModel(next);
        }
      }

      /* ---- Per-model crossfade transitions ---- */
      for (const entry of this.models) {
        if (!entry.loaded) continue;

        // Opacity transitions faster than scale for snappy fade
        entry.currentOpacity = lerp(entry.currentOpacity, entry.targetOpacity, 0.1);
        // Scale transitions smoothly
        entry.currentScale = lerp(entry.currentScale, entry.targetScale, TRANSITION_SPEED);

        // Hide fully faded-out models
        if (entry.currentOpacity < 0.01 && entry.targetOpacity === 0) {
          entry.group.visible = false;
          entry.currentOpacity = 0;
          continue;
        }

        entry.group.scale.setScalar(entry.currentScale);

        // Update material opacity
        entry.group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              mat.opacity = entry.currentOpacity;
            });
          }
        });
      }

      /* ---- Entrance animation ---- */
      if (this.firstModelReady && this.entranceProgress < 1) {
        this.entranceProgress = Math.min(this.entranceProgress + 0.018, 1);
      }
      const entrance = this.entranceProgress;

      /* ---- Hover fidget smoothing ---- */
      this.currentHoverRotX = lerp(this.currentHoverRotX, this.hoverRotX, 0.08);
      this.currentHoverRotY = lerp(this.currentHoverRotY, this.hoverRotY, 0.08);
      // Decay hover rotation slowly back to zero
      this.hoverRotX = lerp(this.hoverRotX, 0, 0.02);
      this.hoverRotY = lerp(this.hoverRotY, 0, 0.02);

      /* ---- Glow pulse (smooth hover transition) ---- */
      this.glowHoverFactor = lerp(this.glowHoverFactor, this.hovered ? 1 : 0, 0.06);
      if (this.glowSprite) {
        const glowPulse = 0.5 + Math.sin(t * 1.2) * 0.15;
        const hoverTarget = 0.85;
        const glowOpacity = lerp(glowPulse, hoverTarget, this.glowHoverFactor);
        (this.glowSprite.material as THREE.SpriteMaterial).opacity = glowOpacity * entrance;
        const baseGlowScale = 4.5 + Math.sin(t * 0.8) * 0.5;
        const glowScale = baseGlowScale + this.glowHoverFactor * 0.8;
        this.glowSprite.scale.set(glowScale, glowScale, 1);
      }

      /* ---- Sync glow anchor position to pivot (no rotation) ---- */
      if (this.glowAnchor) {
        this.glowAnchor.position.copy(this.pivot.position);
      }

      /* ---- Pivot movement ---- */
      const floatY = Math.sin(t * 0.5) * 0.15;
      const floatX = Math.sin(t * 0.35 + 1) * 0.06;

      if (!this.dragging) {
        this.pivot.position.x = 2.5 + floatX;
        this.pivot.position.y = floatY;

        // Slowly decay user drag offset back to zero
        this.userRotOffsetX = lerp(this.userRotOffsetX, 0, 0.003);
        this.userRotOffsetY = lerp(this.userRotOffsetY, 0, 0.003);

        const autoRotY = t * 0.15;
        const mouseRotY = this.currentMouseX * 0.3;
        const mouseRotX = this.currentMouseY * 0.15;

        this.pivot.rotation.x = mouseRotX + this.userRotOffsetX + this.currentHoverRotX;
        this.pivot.rotation.y = autoRotY + mouseRotY + this.userRotOffsetY + this.currentHoverRotY;
        this.pivot.rotation.z = Math.sin(t * 0.25) * 0.03;
      } else {
        // Smoothly follow drag target
        this.currentDragRotX = lerp(this.currentDragRotX, this.targetDragRotX, 0.12);
        this.currentDragRotY = lerp(this.currentDragRotY, this.targetDragRotY, 0.12);

        const autoRotY = this.autoRotYAtDragStart;
        const mouseRotY = this.currentMouseX * 0.3;
        const mouseRotX = this.currentMouseY * 0.15;

        this.pivot.rotation.x = mouseRotX + this.currentDragRotX;
        this.pivot.rotation.y = autoRotY + mouseRotY + this.currentDragRotY;
        this.pivot.rotation.z = Math.sin(t * 0.25) * 0.03;
      }

      // Hover scale boost on active model — only when fully visible (not mid-transition)
      if (this.allLoaded && !this.clickBurstActive) {
        const active = this.models[this.activeIndex];
        if (active.currentOpacity > 0.9) {
          const hoverBoost = this.hovered ? BASE_SCALE * 1.06 : BASE_SCALE;
          active.targetScale = hoverBoost;
        }
      }

      /* ---- Click animation ---- */
      if (this.clickBurstActive) {
        const elapsed = t - this.clickBurstStart;
        const bp = Math.min(elapsed / this.clickBurstDuration, 1);
        // Ease out quart
        const ease = 1 - Math.pow(1 - bp, 4);
        // Elastic ease for bounce
        const elasticEase = bp < 1
          ? 1 - Math.pow(2, -10 * bp) * Math.cos((bp * 10 - 0.75) * (2 * Math.PI / 3))
          : 1;

        if (this.allLoaded) {
          const active = this.models[this.activeIndex];

          // Bounce scale: elastic pop
          const scaleMultiplier = 1 + (elasticEase < 1 ? (1 - elasticEase) * 0.25 : 0);
          const bounceScale = bp < 0.08
            ? BASE_SCALE * (1 + (bp / 0.08) * 0.3)
            : BASE_SCALE * scaleMultiplier;
          active.currentScale = bounceScale;
          active.targetScale = bounceScale;

          // Full 360° Y spin
          this.userRotOffsetY = this.clickSpinStart + ease * Math.PI * 2;

          // Edge-line overlay: show edges, then fade out
          // Dim the model so wireframe edges pop
          const wirePhase = bp < 0.3 ? 1 : Math.max(1 - (bp - 0.3) / 0.4, 0);
          const dimOpacity = 1 - wirePhase * 0.7; // dims to 0.3 at peak
          active.group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              // Dim original material
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((mat) => {
                mat.opacity = dimOpacity;
              });
              // Show edge overlay
              const cached = this.edgeOverlays.get(mesh);
              if (cached) {
                cached.lines.visible = wirePhase > 0.01;
                cached.lineMat.opacity = wirePhase * 0.9;
              }
            }
          });
        }

        // Burst particles fly outward
        {
          const bPos = this.burstParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
          const speed = bp < 0.5 ? 1 : 0.3;
          for (let i = 0; i < bPos.count; i++) {
            const v = this.burstParticleVelocities[i];
            bPos.setX(i, bPos.getX(i) + v.x * 0.016 * speed);
            bPos.setY(i, bPos.getY(i) + v.y * 0.016 * speed);
            bPos.setZ(i, bPos.getZ(i) + v.z * 0.016 * speed);
          }
          bPos.needsUpdate = true;
          (this.burstParticles.material as THREE.PointsMaterial).opacity = Math.max(1 - ease * 1.3, 0);
          (this.burstParticles.material as THREE.PointsMaterial).size = 0.06 + ease * 0.04;
        }

        // Shockwave ring expands
        {
          const ringScale = 1 + ease * 12;
          this.shockwaveRing.scale.set(ringScale, ringScale, 1);
          (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = 0.8 * Math.max(1 - ease * 1.5, 0);
          this.shockwaveRing.position.copy(this.pivot.position);
          this.shockwaveRing.position.z += 0.3;
        }

        // Burst light flash — lightens the scene
        this.burstLight.position.copy(this.pivot.position);
        this.burstLight.position.z += 1;
        this.burstLight.intensity = bp < 0.1
          ? (bp / 0.1) * 8
          : 8 * Math.max(1 - (bp - 0.1) / 0.4, 0);

        // Glow sprite flash
        if (this.glowSprite) {
          const flash = bp < 0.1 ? bp / 0.1 : Math.max(1 - (bp - 0.1) / 0.3, 0);
          (this.glowSprite.material as THREE.SpriteMaterial).opacity = Math.min(
            (this.glowSprite.material as THREE.SpriteMaterial).opacity + flash * 0.5,
            1.0,
          );
          this.glowSprite.scale.x += flash * 4;
          this.glowSprite.scale.y += flash * 4;
        }

        // Reset when done
        if (bp >= 1) {
          this.clickBurstActive = false;
          this.burstParticles.visible = false;
          this.shockwaveRing.visible = false;
          this.burstLight.intensity = 0;
          // Debounce cooldown
          setTimeout(() => { this.clickDebounce = false; }, 200);
          if (this.allLoaded) {
            const active = this.models[this.activeIndex];
            active.targetScale = BASE_SCALE;
            active.currentScale = BASE_SCALE;
            // Hide edge overlays and restore model opacity
            active.group.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                // Restore full opacity
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                mats.forEach((mat) => { mat.opacity = 1; });
                // Hide edges
                const cached = this.edgeOverlays.get(mesh);
                if (cached) {
                  cached.lines.visible = false;
                  cached.lineMat.opacity = 0;
                }
              }
            });
          }
        }
      }

      /* ---- Particles drift ---- */
      const pPos = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < pPos.count; i++) {
        let y = pPos.getY(i);
        y += 0.003 * Math.sin(t * 0.4 + i * 0.7);
        if (y > 5) y = -5;
        pPos.setY(i, y);
      }
      pPos.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);
    });
  }

  /* ==================================================================
   *  Cleanup
   * ================================================================== */

  dispose() {
    this.disposed = true;
    raf.remove('hero-geometry');
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('click', this._onClick);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('deviceorientation', this._onOrientation);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      const mat = (obj as THREE.Mesh).material;
      if (mat) {
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else (mat as THREE.Material).dispose();
      }
    });
  }
}
