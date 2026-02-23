import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { raf } from '../../utils/raf';
import { lerp } from '../../utils/math';

interface SceneConfig {
  canvas: HTMLCanvasElement;
  particleCount: number;
  accentColor: string;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private particles!: THREE.Points;
  private particleMaterial!: THREE.ShaderMaterial;
  private targetCameraX = 0;
  private targetCameraY = 0;
  private currentCameraX = 0;
  private currentCameraY = 0;
  private scrollProgress = 0;
  private clock = new THREE.Clock();
  private disposed = false;

  constructor(private config: SceneConfig) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0A0A0A, 1);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 3;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,   // strength — controlled, not a glow
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloom);

    const film = new FilmPass(0.25, false);
    this.composer.addPass(film);

    this.buildParticles();
    this.bindEvents();
    this.startLoop();
  }

  private buildParticles() {
    const count = this.config.particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 8;
      positions[i3 + 1] = (Math.random() - 0.5) * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 4;
      randoms[i3]     = Math.random();
      randoms[i3 + 1] = Math.random();
      randoms[i3 + 2] = Math.random();
      sizes[i] = Math.random() * 2.0 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform float uPixelRatio;

        attribute vec3 aRandom;
        attribute float aSize;

        varying float vOpacity;

        // Simplex noise approximation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 pos = position;
          float t = uTime * 0.15;

          float nx = snoise(vec3(aRandom.x * 2.0, aRandom.y * 2.0, t + aRandom.z));
          float ny = snoise(vec3(aRandom.y * 2.0 + 10.0, aRandom.z * 2.0, t + aRandom.x));
          float nz = snoise(vec3(aRandom.z * 2.0 + 20.0, aRandom.x * 2.0, t + aRandom.y));

          pos.x += nx * 0.3;
          pos.y += ny * 0.3;
          pos.z += nz * 0.2;

          // Scroll-based pull back
          pos.z -= uScroll * 2.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          gl_PointSize = aSize * uPixelRatio * (1.0 / -mvPosition.z) * 80.0;

          // Fade with scroll
          vOpacity = 1.0 - uScroll * 1.5;
          vOpacity = clamp(vOpacity, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying float vOpacity;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * vOpacity * 0.7;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  private bindEvents() {
    const handleMouse = (e: MouseEvent) => {
      this.targetCameraX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      this.targetCameraY = -(e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const handleResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
  }

  setScrollProgress(p: number) {
    this.scrollProgress = p;
  }

  private startLoop() {
    raf.add('hero-scene', (time) => {
      if (this.disposed) return;
      const t = this.clock.getElapsedTime();

      this.currentCameraX = lerp(this.currentCameraX, this.targetCameraX, 0.04);
      this.currentCameraY = lerp(this.currentCameraY, this.targetCameraY, 0.04);
      this.camera.position.x = this.currentCameraX;
      this.camera.position.y = this.currentCameraY;

      if (this.particleMaterial.uniforms) {
        this.particleMaterial.uniforms.uTime.value = t;
        this.particleMaterial.uniforms.uScroll.value = lerp(
          this.particleMaterial.uniforms.uScroll.value,
          this.scrollProgress,
          0.06
        );
      }

      this.composer.render();
    });
  }

  dispose() {
    this.disposed = true;
    raf.remove('hero-scene');
    this.renderer.dispose();
    this.particles.geometry.dispose();
    this.particleMaterial.dispose();
  }
}
