import * as THREE from 'three';
import { raf } from '../../utils/raf';
import { lerp } from '../../utils/math';

/* ------------------------------------------------------------------
 *  Hero 3D Carousel — Mobile, Web (Monitor), Server
 *
 *  Glowing accent-colored wireframes on dark background.
 *  One model at a time with auto-rotation every ~4s.
 *  Orbiting particle ring around the active model.
 *
 *  Interactions:
 *    hover  → glow intensifies + scale boost + particles speed up
 *    click  → explode/reassemble + advance carousel
 *    drag   → free orbit rotation
 *    scroll → parallax + fade
 * ------------------------------------------------------------------ */

interface HeroGeometryConfig {
  canvas: HTMLCanvasElement;
  foregroundColor?: string;
  accentColor?: string;
}

/* ====================== Procedural model builders ====================== */

function buildPhoneModel(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Body with rounded-ish edges (higher segment count)
  const body = new THREE.BoxGeometry(1.1, 2.0, 0.1, 6, 8, 2);
  parts.push(body);

  // Screen bezel frame
  const bezel = new THREE.BoxGeometry(0.95, 1.7, 0.02, 4, 6, 1);
  bezel.translate(0, 0.02, 0.055);
  parts.push(bezel);

  // Screen glass
  const glass = new THREE.PlaneGeometry(0.88, 1.6, 5, 8);
  glass.translate(0, 0.02, 0.065);
  parts.push(glass);

  // Camera module (square island)
  const camModule = new THREE.BoxGeometry(0.32, 0.32, 0.04, 3, 3, 1);
  camModule.translate(-0.28, 0.72, -0.07);
  parts.push(camModule);

  // Camera lenses (2 circles)
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.TorusGeometry(0.07, 0.018, 8, 16);
    ring.translate(-0.28 + (i % 2) * 0.14, 0.72 - Math.floor(i / 2) * 0.14, -0.09);
    parts.push(ring);
    const lensInner = new THREE.CircleGeometry(0.04, 10);
    lensInner.translate(-0.28 + (i % 2) * 0.14, 0.72 - Math.floor(i / 2) * 0.14, -0.09);
    parts.push(lensInner);
  }

  // Speaker slit
  const speaker = new THREE.BoxGeometry(0.2, 0.015, 0.01, 4, 1, 1);
  speaker.translate(0, 0.9, 0.06);
  parts.push(speaker);

  // Home indicator
  const homeBar = new THREE.BoxGeometry(0.35, 0.025, 0.005, 5, 1, 1);
  homeBar.translate(0, -0.88, 0.06);
  parts.push(homeBar);

  // Side buttons
  const volUp = new THREE.BoxGeometry(0.025, 0.14, 0.05, 1, 3, 1);
  volUp.translate(-0.565, 0.38, 0);
  parts.push(volUp);
  const volDn = new THREE.BoxGeometry(0.025, 0.14, 0.05, 1, 3, 1);
  volDn.translate(-0.565, 0.15, 0);
  parts.push(volDn);
  const pwr = new THREE.BoxGeometry(0.025, 0.2, 0.05, 1, 3, 1);
  pwr.translate(0.565, 0.32, 0);
  parts.push(pwr);

  // On-screen UI: header bar
  const headerBar = new THREE.PlaneGeometry(0.82, 0.06, 4, 1);
  headerBar.translate(0, 0.76, 0.07);
  parts.push(headerBar);

  // UI content cards
  for (let i = 0; i < 3; i++) {
    const card = new THREE.PlaneGeometry(0.75, 0.2, 3, 2);
    card.translate(0, 0.4 - i * 0.32, 0.07);
    parts.push(card);
    // Inner line detail
    const line = new THREE.PlaneGeometry(0.5 - i * 0.05, 0.015, 2, 1);
    line.translate(-0.05, 0.44 - i * 0.32, 0.072);
    parts.push(line);
  }

  // Floating notification
  const notif = new THREE.BoxGeometry(0.7, 0.14, 0.02, 4, 2, 1);
  notif.translate(0.08, -0.35, 0.1);
  parts.push(notif);

  // Notification icon circle
  const notifIcon = new THREE.CircleGeometry(0.03, 8);
  notifIcon.translate(-0.22, -0.35, 0.115);
  parts.push(notifIcon);

  return mergeGeometries(parts);
}

function buildMonitorModel(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Monitor housing (thicker bezel)
  const housing = new THREE.BoxGeometry(2.6, 1.6, 0.1, 8, 6, 2);
  housing.translate(0, 0.4, 0);
  parts.push(housing);

  // Screen
  const screen = new THREE.PlaneGeometry(2.35, 1.4, 6, 5);
  screen.translate(0, 0.4, 0.055);
  parts.push(screen);

  // Screen inner bezel
  const innerBezel = new THREE.BoxGeometry(2.4, 1.45, 0.02, 5, 4, 1);
  innerBezel.translate(0, 0.4, 0.05);
  parts.push(innerBezel);

  // Stand neck (tapered)
  const neck = new THREE.CylinderGeometry(0.06, 0.1, 0.5, 8);
  neck.translate(0, -0.6, 0);
  parts.push(neck);

  // Stand base (elegant curved)
  const base = new THREE.TorusGeometry(0.4, 0.03, 6, 24, Math.PI);
  base.rotateX(Math.PI / 2);
  base.translate(0, -0.86, 0.05);
  parts.push(base);
  const basePlate = new THREE.BoxGeometry(0.9, 0.025, 0.4, 4, 1, 2);
  basePlate.translate(0, -0.88, 0);
  parts.push(basePlate);

  // Webcam
  const webcam = new THREE.CircleGeometry(0.03, 10);
  webcam.translate(0, 1.15, 0.06);
  parts.push(webcam);
  const webcamRing = new THREE.TorusGeometry(0.035, 0.008, 6, 12);
  webcamRing.translate(0, 1.15, 0.06);
  parts.push(webcamRing);

  // Browser chrome
  const titleBar = new THREE.PlaneGeometry(2.3, 0.08, 6, 1);
  titleBar.translate(0, 1.04, 0.06);
  parts.push(titleBar);

  // Traffic light dots
  for (let i = 0; i < 3; i++) {
    const dot = new THREE.CircleGeometry(0.018, 8);
    dot.translate(-1.04 + i * 0.065, 1.04, 0.065);
    parts.push(dot);
  }

  // Tab bar
  for (let i = 0; i < 3; i++) {
    const tab = new THREE.PlaneGeometry(0.3, 0.04, 3, 1);
    tab.translate(-0.6 + i * 0.4, 0.95, 0.06);
    parts.push(tab);
  }

  // Address bar
  const addrBar = new THREE.BoxGeometry(1.8, 0.05, 0.01, 6, 1, 1);
  addrBar.translate(0, 0.88, 0.06);
  parts.push(addrBar);

  // Content area — code editor left
  for (let i = 0; i < 8; i++) {
    const w = 0.4 + Math.sin(i * 1.7) * 0.15;
    const codeLine = new THREE.PlaneGeometry(w, 0.018, 2, 1);
    codeLine.translate(-0.68, 0.7 - i * 0.08, 0.06);
    parts.push(codeLine);
  }

  // Content area — preview right
  const previewBox = new THREE.PlaneGeometry(0.9, 0.55, 3, 3);
  previewBox.translate(0.55, 0.38, 0.06);
  parts.push(previewBox);

  // Floating cursor
  const cursorTri = new THREE.ConeGeometry(0.05, 0.12, 3);
  cursorTri.rotateZ(Math.PI / 5);
  cursorTri.translate(0.35, 0.3, 0.12);
  parts.push(cursorTri);

  return mergeGeometries(parts);
}

function buildServerModel(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Main chassis
  const chassis = new THREE.BoxGeometry(1.6, 2.2, 0.8, 5, 8, 3);
  parts.push(chassis);

  // Front panel inset
  const frontPanel = new THREE.PlaneGeometry(1.5, 2.1, 4, 7);
  frontPanel.translate(0, 0, 0.405);
  parts.push(frontPanel);

  // Rack unit dividers
  for (let i = 0; i < 6; i++) {
    const div = new THREE.PlaneGeometry(1.55, 0.005, 4, 1);
    div.translate(0, -0.92 + i * 0.37, 0.41);
    parts.push(div);
  }

  // Drive bay arrays (3 columns x 5 rows)
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const bay = new THREE.BoxGeometry(0.18, 0.1, 0.03, 2, 2, 1);
      bay.translate(-0.38 + col * 0.28, -0.74 + row * 0.37, 0.42);
      parts.push(bay);
    }
  }

  // Status LED pairs (per rack unit)
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 3; i++) {
      const led = new THREE.CircleGeometry(0.02, 6);
      led.translate(0.52 + i * 0.07, -0.74 + row * 0.37, 0.42);
      parts.push(led);
    }
  }

  // Side ventilation (left side)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 4; c++) {
      const vent = new THREE.CircleGeometry(0.022, 5);
      vent.rotateY(Math.PI / 2);
      vent.translate(0.805, -0.85 + r * 0.28, -0.25 + c * 0.17);
      parts.push(vent);
    }
  }

  // Side ventilation (right side)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 4; c++) {
      const vent = new THREE.CircleGeometry(0.022, 5);
      vent.rotateY(-Math.PI / 2);
      vent.translate(-0.805, -0.85 + r * 0.28, -0.25 + c * 0.17);
      parts.push(vent);
    }
  }

  // Back panel ports
  for (let i = 0; i < 6; i++) {
    const port = new THREE.BoxGeometry(0.08, 0.06, 0.02, 2, 2, 1);
    port.translate(-0.4 + i * 0.15, 0.85, -0.41);
    parts.push(port);
  }

  // Power supply
  const psu = new THREE.BoxGeometry(0.4, 0.18, 0.35, 3, 2, 2);
  psu.translate(0.45, -1.0, -0.18);
  parts.push(psu);

  // Network uplink antenna
  const antBase = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 6);
  antBase.translate(0.6, 1.14, 0.25);
  parts.push(antBase);
  const antPole = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4);
  antPole.translate(0.6, 1.42, 0.25);
  parts.push(antPole);
  const antTip = new THREE.SphereGeometry(0.035, 6, 6);
  antTip.translate(0.6, 1.7, 0.25);
  parts.push(antTip);

  // Signal waves (concentric arcs near antenna)
  for (let i = 0; i < 3; i++) {
    const wave = new THREE.TorusGeometry(0.1 + i * 0.08, 0.006, 4, 12, Math.PI * 0.6);
    wave.rotateY(Math.PI / 2);
    wave.rotateZ(-Math.PI * 0.3);
    wave.translate(0.6, 1.75, 0.25 + i * 0.05);
    parts.push(wave);
  }

  // Floating data packets orbiting
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const r = 1.2;
    const packet = new THREE.OctahedronGeometry(0.06, 0);
    packet.translate(Math.cos(angle) * r, 0.2 + Math.sin(angle * 2) * 0.4, Math.sin(angle) * r * 0.5);
    parts.push(packet);
  }

  return mergeGeometries(parts);
}

/* ====================== Geometry merge ====================== */

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0;
  let totalIdx = 0;
  for (const g of geos) {
    if (!g.index) {
      const pos = g.getAttribute('position');
      const indices: number[] = [];
      for (let i = 0; i < pos.count; i++) indices.push(i);
      g.setIndex(indices);
    }
    totalVerts += g.getAttribute('position').count;
    totalIdx += g.index!.count;
  }
  const positions = new Float32Array(totalVerts * 3);
  const indices: number[] = [];
  let vertOff = 0;
  let idxOff = 0;
  for (const g of geos) {
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      positions[(vertOff + i) * 3] = pos.getX(i);
      positions[(vertOff + i) * 3 + 1] = pos.getY(i);
      positions[(vertOff + i) * 3 + 2] = pos.getZ(i);
    }
    const idx = g.index!;
    for (let i = 0; i < idx.count; i++) {
      indices[idxOff + i] = idx.array[i] + vertOff;
    }
    vertOff += pos.count;
    idxOff += idx.count;
    g.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

/* ====================== Orbiting ring ====================== */

function createOrbitRing(count: number, radius: number, color: THREE.Color): THREE.Points {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.6;
    sizes[i] = 0.8 + Math.random() * 1.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color,
    size: 0.025,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

/* ====================== Easing ====================== */

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ====================== Ambient particles ====================== */

function createParticleField(count: number, color: THREE.Color): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.012,
    transparent: true,
    opacity: 0.2,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

/* ====================== Model state ====================== */

interface ModelState {
  group: THREE.Group;
  wireframe: THREE.LineSegments;
  glowWireframe: THREE.LineSegments; // additive glow copy
  solidMesh: THREE.Mesh;
  label: string;
  hovered: boolean;
  dragging: boolean;
  dragStart: THREE.Vector2;
  dragRotation: THREE.Euler;
  targetDragRotX: number;
  targetDragRotY: number;
  currentDragRotX: number;
  currentDragRotY: number;
  exploding: boolean;
  explodeProgress: number;
  explodeTime: number;
  explodeParts: { offset: THREE.Vector3 }[];
  floatPhase: number;
  currentScale: number;
  currentOpacity: number;
}

const MODEL_LABELS = ['MOBILE', 'WEB', 'SERVER'];

/* ====================== Main class ====================== */

export class HeroGeometry {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private sceneGroup: THREE.Group;
  private models: ModelState[] = [];
  private particles!: THREE.Points;
  private orbitRing!: THREE.Points;

  // Carousel
  private activeIndex = 0;
  private carouselTimer = 0;
  private readonly CAROUSEL_INTERVAL = 4.0;
  private readonly TRANSITION_SPEED = 0.055;
  private entranceComplete = false;
  private entranceStart = 0;

  // Mouse / scroll
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private scrollProgress = 0;
  private currentScroll = 0;
  private clock = new THREE.Clock();
  private disposed = false;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private orientationSupported = false;
  private targetOrientX = 0;
  private targetOrientY = 0;
  private dragModel: ModelState | null = null;

  // Right-side position
  private readonly MODEL_POS = new THREE.Vector3(2.8, 0, 0);
  private readonly MODEL_ROT = new THREE.Euler(0.12, -0.2, 0.03);
  private readonly ACTIVE_SCALE = 1.7;

  // Bound handlers
  private _onMouseMove: (e: MouseEvent) => void;
  private _onMouseDown: (e: MouseEvent) => void;
  private _onMouseUp: () => void;
  private _onClick: (e: MouseEvent) => void;
  private _onResize: () => void;
  private _onOrientation: (e: DeviceOrientationEvent) => void;
  private _onTouchStart: (e: TouchEvent) => void;
  private _onTouchMove: (e: TouchEvent) => void;
  private _onTouchEnd: () => void;

  onLabelChange?: (label: string, index: number) => void;

  constructor(private config: HeroGeometryConfig) {
    const fg = config.foregroundColor ?? '#FFFFFF';
    const accent = config.accentColor ?? '#F5A623';

    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.sceneGroup = new THREE.Group();
    this.scene.add(this.sceneGroup);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 8;

    this.buildModels(fg, accent);
    this.buildEffects(fg, accent);

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
    this.entranceStart = this.clock.getElapsedTime();
    this.startLoop();
  }

  /* ------------------------------------------------------------------ */
  /*  Build                                                              */
  /* ------------------------------------------------------------------ */

  private buildModels(fg: string, accent: string) {
    const fgColor = new THREE.Color(fg);
    const accentColor = new THREE.Color(accent);

    const builders = [
      { build: buildPhoneModel, label: 'mobile' },
      { build: buildMonitorModel, label: 'web' },
      { build: buildServerModel, label: 'server' },
    ];

    builders.forEach((def, index) => {
      const geo = def.build();
      const group = new THREE.Group();

      // Solid mesh — dark translucent fill
      const solidMat = new THREE.MeshBasicMaterial({
        color: fgColor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const solidMesh = new THREE.Mesh(geo, solidMat);

      // Primary wireframe — accent colored
      const edgesGeo = new THREE.EdgesGeometry(geo, 12);
      const wireMat = new THREE.LineBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0,
      });
      const wireframe = new THREE.LineSegments(edgesGeo, wireMat);

      // Glow wireframe — additive blended copy for bloom effect
      const glowMat = new THREE.LineBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowWireframe = new THREE.LineSegments(edgesGeo.clone(), glowMat);
      glowWireframe.scale.setScalar(1.008); // slightly larger for glow halo

      group.add(solidMesh);
      group.add(wireframe);
      group.add(glowWireframe);
      group.position.copy(this.MODEL_POS);
      group.rotation.copy(this.MODEL_ROT);
      group.scale.setScalar(0);

      this.sceneGroup.add(group);

      // Explode offsets
      const explodeParts: { offset: THREE.Vector3 }[] = [];
      const vertCount = edgesGeo.getAttribute('position').count;
      const chunkSize = Math.max(Math.floor(vertCount / 16), 6);
      for (let i = 0; i < Math.ceil(vertCount / chunkSize); i++) {
        explodeParts.push({
          offset: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
          ),
        });
      }

      this.models.push({
        group,
        wireframe,
        glowWireframe,
        solidMesh,
        label: def.label,
        hovered: false,
        dragging: false,
        dragStart: new THREE.Vector2(),
        dragRotation: new THREE.Euler(),
        targetDragRotX: 0,
        targetDragRotY: 0,
        currentDragRotX: 0,
        currentDragRotY: 0,
        exploding: false,
        explodeProgress: 0,
        explodeTime: 0,
        explodeParts,
        floatPhase: index * 2.1,
        currentScale: 0,
        currentOpacity: 0,
      });
    });
  }

  private buildEffects(fg: string, accent: string) {
    const fgColor = new THREE.Color(fg);
    const accentColor = new THREE.Color(accent);

    this.particles = createParticleField(80, fgColor);
    this.sceneGroup.add(this.particles);

    this.orbitRing = createOrbitRing(60, 1.8, accentColor);
    this.orbitRing.position.copy(this.MODEL_POS);
    this.sceneGroup.add(this.orbitRing);
  }

  /* ------------------------------------------------------------------ */
  /*  Carousel                                                           */
  /* ------------------------------------------------------------------ */

  private advanceCarousel() {
    this.activeIndex = (this.activeIndex + 1) % this.models.length;
    this.carouselTimer = 0;
    this.onLabelChange?.(MODEL_LABELS[this.activeIndex], this.activeIndex);
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                             */
  /* ------------------------------------------------------------------ */

  private onMouseMove(e: MouseEvent) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (this.dragModel?.dragging) {
      const dx = e.clientX - this.dragModel.dragStart.x;
      const dy = e.clientY - this.dragModel.dragStart.y;
      this.dragModel.targetDragRotY = this.dragModel.dragRotation.y + dx * 0.008;
      this.dragModel.targetDragRotX = this.dragModel.dragRotation.x + dy * 0.008;
    }
    this.updateHover();
  }

  private onMouseDown(e: MouseEvent) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    const model = this.models[this.activeIndex];
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(model.solidMesh);
    if (hits.length > 0) {
      model.dragging = true;
      model.dragStart.set(e.clientX, e.clientY);
      model.dragRotation.copy(model.group.rotation);
      this.dragModel = model;
      this.config.canvas.style.cursor = 'grabbing';
      this.carouselTimer = -999;
    }
  }

  private onMouseUp() {
    if (this.dragModel?.dragging) {
      this.dragModel.dragging = false;
      this.dragModel = null;
      this.carouselTimer = 0;
      this.config.canvas.style.cursor = this.models[this.activeIndex].hovered ? 'pointer' : 'default';
    }
  }

  private onClickHandler(e: MouseEvent) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    const model = this.models[this.activeIndex];
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(model.solidMesh);
    if (hits.length > 0 && !model.exploding) {
      model.exploding = true;
      model.explodeProgress = 0;
      model.explodeTime = this.clock.getElapsedTime();
      this.carouselTimer = this.CAROUSEL_INTERVAL - 0.3;
    }
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
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
    const model = this.models[this.activeIndex];
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(model.solidMesh);
    if (hits.length > 0) {
      model.dragging = true;
      model.dragStart.set(t.clientX, t.clientY);
      model.dragRotation.copy(model.group.rotation);
      this.dragModel = model;
      this.carouselTimer = -999;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.dragModel?.dragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - this.dragModel.dragStart.x;
    const dy = t.clientY - this.dragModel.dragStart.y;
    this.dragModel.targetDragRotY = this.dragModel.dragRotation.y + dx * 0.008;
    this.dragModel.targetDragRotX = this.dragModel.dragRotation.x + dy * 0.008;
  }

  private onTouchEnd() {
    if (this.dragModel?.dragging) {
      const dist = Math.abs(this.dragModel.targetDragRotX - this.dragModel.dragRotation.x)
        + Math.abs(this.dragModel.targetDragRotY - this.dragModel.dragRotation.y);
      if (dist < 0.05 && !this.dragModel.exploding) {
        this.dragModel.exploding = true;
        this.dragModel.explodeProgress = 0;
        this.dragModel.explodeTime = this.clock.getElapsedTime();
        this.carouselTimer = this.CAROUSEL_INTERVAL - 0.3;
      }
      this.dragModel.dragging = false;
      this.dragModel = null;
      this.carouselTimer = Math.max(this.carouselTimer, 0);
    }
  }

  private updateHover() {
    const model = this.models[this.activeIndex];
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(model.solidMesh);
    const nowHovered = hits.length > 0;
    if (nowHovered !== model.hovered) {
      model.hovered = nowHovered;
      if (!this.dragModel?.dragging) {
        this.config.canvas.style.cursor = nowHovered ? 'pointer' : 'default';
      }
    }
  }

  private bindEvents() {
    const canvas = this.config.canvas;
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('click', this._onClick);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('deviceorientation', this._onOrientation, { passive: true });
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    canvas.addEventListener('touchend', this._onTouchEnd);
  }

  setScrollProgress(p: number) {
    this.scrollProgress = p;
  }

  /* ------------------------------------------------------------------ */
  /*  Render loop                                                        */
  /* ------------------------------------------------------------------ */

  private startLoop() {
    let lastTime = this.clock.getElapsedTime();

    raf.add('hero-geometry', () => {
      if (this.disposed) return;
      const t = this.clock.getElapsedTime();
      const dt = t - lastTime;
      lastTime = t;
      const elapsed = t - this.entranceStart;

      // Smooth mouse
      if (this.orientationSupported) {
        this.currentMouseX = lerp(this.currentMouseX, this.targetOrientY, 0.04);
        this.currentMouseY = lerp(this.currentMouseY, this.targetOrientX, 0.04);
      } else {
        this.currentMouseX = lerp(this.currentMouseX, this.targetMouseX, 0.04);
        this.currentMouseY = lerp(this.currentMouseY, this.targetMouseY, 0.04);
      }

      this.currentScroll = lerp(this.currentScroll, this.scrollProgress, 0.06);

      // Scene rotation
      this.sceneGroup.rotation.y = this.currentMouseX * 0.1;
      this.sceneGroup.rotation.x = this.currentMouseY * 0.05;

      // Camera + fade
      const scrollNorm = Math.min(this.currentScroll / 0.3, 1);
      this.camera.position.z = lerp(8, 3, scrollNorm);
      const canvasOpacity = scrollNorm < 1 ? 1 : Math.max(0, 1 - (this.currentScroll - 0.3) / 0.15);
      this.renderer.domElement.style.opacity = String(canvasOpacity);

      // Entrance
      if (!this.entranceComplete && elapsed > 0.6) {
        this.entranceComplete = true;
        this.onLabelChange?.(MODEL_LABELS[0], 0);
      }

      // Carousel
      if (this.entranceComplete && this.carouselTimer >= 0) {
        this.carouselTimer += dt;
        if (this.carouselTimer >= this.CAROUSEL_INTERVAL) this.advanceCarousel();
      }

      // Update models
      for (let i = 0; i < this.models.length; i++) {
        const model = this.models[i];
        const isActive = i === this.activeIndex && this.entranceComplete;

        const hoverBoost = model.hovered ? 1.08 : 1.0;
        const targetScale = isActive ? this.ACTIVE_SCALE * hoverBoost : 0;
        const targetOpacity = isActive ? 1 : 0;

        // Smooth transitions
        const speed = isActive && model.currentScale < targetScale * 0.3 ? 0.1 : this.TRANSITION_SPEED;
        model.currentScale = lerp(model.currentScale, targetScale, speed);
        model.currentOpacity = lerp(model.currentOpacity, targetOpacity, this.TRANSITION_SPEED);

        model.group.scale.setScalar(Math.max(model.currentScale, 0.001));

        // Accent wireframe opacity — brighter on hover with pulse
        const basePulse = model.hovered ? 0.5 + Math.sin(t * 4) * 0.15 : 0.35;
        const glowPulse = model.hovered ? 0.2 + Math.sin(t * 4) * 0.08 : 0.1;

        (model.wireframe.material as THREE.LineBasicMaterial).opacity = model.currentOpacity * basePulse;
        (model.glowWireframe.material as THREE.LineBasicMaterial).opacity = model.currentOpacity * glowPulse;
        (model.solidMesh.material as THREE.MeshBasicMaterial).opacity = model.currentOpacity * 0.03;

        // Floating
        const floatY = Math.sin(t * 0.5 + model.floatPhase) * 0.18;
        const floatX = Math.sin(t * 0.35 + model.floatPhase + 1) * 0.08;
        const tiltZ = Math.sin(t * 0.25 + model.floatPhase) * 0.04;

        if (!model.dragging) {
          model.group.position.x = this.MODEL_POS.x + floatX;
          model.group.position.y = this.MODEL_POS.y + floatY;
          model.group.position.z = this.MODEL_POS.z;

          model.currentDragRotX = lerp(model.currentDragRotX, 0, 0.025);
          model.currentDragRotY = lerp(model.currentDragRotY, 0, 0.025);

          model.group.rotation.x = this.MODEL_ROT.x + tiltZ + model.currentDragRotX;
          model.group.rotation.y = this.MODEL_ROT.y + Math.sin(t * 0.2 + model.floatPhase) * 0.1 + model.currentDragRotY;
          model.group.rotation.z = this.MODEL_ROT.z + tiltZ * 0.5;
        } else {
          model.currentDragRotX = lerp(model.currentDragRotX, model.targetDragRotX, 0.12);
          model.currentDragRotY = lerp(model.currentDragRotY, model.targetDragRotY, 0.12);
          model.group.rotation.x = model.currentDragRotX;
          model.group.rotation.y = model.currentDragRotY;
        }

        // Explode
        if (model.exploding) {
          const dur = 1.6;
          const since = t - model.explodeTime;
          if (since < dur / 2) {
            model.explodeProgress = easeOutElastic(Math.min(since / (dur / 2), 1));
          } else if (since < dur) {
            model.explodeProgress = 1 - easeInOutCubic(Math.min((since - dur / 2) / (dur / 2), 1));
          } else {
            model.exploding = false;
            model.explodeProgress = 0;
          }

          // Offset wireframe vertices
          for (const wf of [model.wireframe, model.glowWireframe]) {
            const posAttr = wf.geometry.getAttribute('position') as THREE.BufferAttribute;
            if (!wf.userData.origPositions) {
              wf.userData.origPositions = new Float32Array(posAttr.array);
            }
            const orig = wf.userData.origPositions as Float32Array;
            const chunkSize = Math.max(Math.floor(posAttr.count / model.explodeParts.length), 1);
            for (let v = 0; v < posAttr.count; v++) {
              const ci = Math.min(Math.floor(v / chunkSize), model.explodeParts.length - 1);
              const ep = model.explodeProgress;
              posAttr.setXYZ(
                v,
                orig[v * 3] + model.explodeParts[ci].offset.x * ep,
                orig[v * 3 + 1] + model.explodeParts[ci].offset.y * ep,
                orig[v * 3 + 2] + model.explodeParts[ci].offset.z * ep,
              );
            }
            posAttr.needsUpdate = true;
            wf.rotation.y = model.explodeProgress * Math.PI * 0.4;
            wf.rotation.x = model.explodeProgress * Math.PI * 0.2;
          }
        } else {
          model.wireframe.rotation.set(0, 0, 0);
          model.glowWireframe.rotation.set(0, 0, 0);
        }
      }

      // Orbit ring — rotate and sync with active model position
      const activeModel = this.models[this.activeIndex];
      if (activeModel) {
        this.orbitRing.position.copy(activeModel.group.position);
        this.orbitRing.rotation.y = t * 0.4;
        this.orbitRing.rotation.x = Math.sin(t * 0.15) * 0.2;
        const ringOpacity = activeModel.currentOpacity * (activeModel.hovered ? 0.8 : 0.5);
        (this.orbitRing.material as THREE.PointsMaterial).opacity = ringOpacity;
      }

      // Ambient particles
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

  /* ------------------------------------------------------------------ */
  /*  Cleanup                                                            */
  /* ------------------------------------------------------------------ */

  dispose() {
    this.disposed = true;
    raf.remove('hero-geometry');
    const canvas = this.config.canvas;
    window.removeEventListener('mousemove', this._onMouseMove);
    canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    canvas.removeEventListener('click', this._onClick);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('deviceorientation', this._onOrientation);
    canvas.removeEventListener('touchstart', this._onTouchStart);
    canvas.removeEventListener('touchmove', this._onTouchMove);
    canvas.removeEventListener('touchend', this._onTouchEnd);
    this.renderer.dispose();
    for (const m of this.models) {
      m.solidMesh.geometry.dispose();
      (m.solidMesh.material as THREE.Material).dispose();
      m.wireframe.geometry.dispose();
      (m.wireframe.material as THREE.Material).dispose();
      m.glowWireframe.geometry.dispose();
      (m.glowWireframe.material as THREE.Material).dispose();
    }
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.orbitRing.geometry.dispose();
    (this.orbitRing.material as THREE.Material).dispose();
  }
}
