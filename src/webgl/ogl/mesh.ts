import { Renderer, Camera, Program, Mesh, Plane, Transform } from 'ogl';
import { raf } from '../../utils/raf';
import { lerp } from '../../utils/math';

interface OglMeshConfig {
  canvas: HTMLCanvasElement;
  segments?: number;
  accentColor?: string;
}

export class ContactMesh {
  private renderer: Renderer;
  private scene: Transform;
  private camera: Camera;
  private mesh!: Mesh;
  private program!: Program;
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private disposed = false;
  private startTime = Date.now();

  constructor(private config: OglMeshConfig) {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const segments = isMobile ? 20 : (config.segments ?? 40);

    this.renderer = new Renderer({
      canvas: config.canvas,
      alpha: true,
      antialias: false,
    });

    const gl = this.renderer.gl as any;
    gl.clearColor(0, 0, 0, 0);

    this.scene = new Transform();
    this.camera = new Camera(gl, { fov: 45 });
    this.camera.position.z = 3;

    this.buildMesh(gl, segments);
    this.bindEvents();
    this.handleResize();
    this.startLoop();
  }

  private buildMesh(gl: any, segments: number) {
    const geometry = new Plane(gl, {
      width: 5,
      height: 5,
      widthSegments: segments,
      heightSegments: segments,
    });

    this.program = new Program(gl, {
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform vec2 uMouse;

        varying vec2 vUv;
        varying float vElevation;

        // Simplex-like noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1));
          float d = hash(i + vec2(1,1));
          return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          float mouseDist = distance(pos.xy, uMouse * 2.5);
          float mouseInfluence = smoothstep(1.5, 0.0, mouseDist);

          float n = noise(pos.xy * 1.5 + uTime * 0.3);
          float n2 = noise(pos.xy * 2.5 - uTime * 0.2 + 10.0);

          pos.z = n * 0.3 + n2 * 0.15 + mouseInfluence * 0.5;
          vElevation = pos.z;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          // Accent color: F5A623 at low opacity — wireframe feel
          float alpha = 0.12 + vElevation * 0.3;
          alpha = clamp(alpha, 0.04, 0.35);
          gl_FragColor = vec4(0.961, 0.651, 0.137, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: [0, 0] as [number, number] },
      },
      transparent: true,
    } as any);

    this.mesh = new Mesh(gl, { geometry, program: this.program });
    this.mesh.setParent(this.scene);
    this.mesh.rotation.x = -0.2;
  }

  private bindEvents() {
    const handleMouse = (e: MouseEvent) => {
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize() {
    const container = this.config.canvas.parentElement;
    if (!container) return;
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || 400;
    this.renderer.setSize(w, h);
    this.camera.perspective({ aspect: w / h });
  }

  private startLoop() {
    raf.add('contact-mesh', () => {
      if (this.disposed) return;
      const elapsed = (Date.now() - this.startTime) / 1000;

      this.mouseX = lerp(this.mouseX, this.targetMouseX, 0.05);
      this.mouseY = lerp(this.mouseY, this.targetMouseY, 0.05);

      this.program.uniforms.uTime.value = elapsed;
      this.program.uniforms.uMouse.value = [this.mouseX, this.mouseY];

      this.renderer.render({ scene: this.scene, camera: this.camera });
    });
  }

  dispose() {
    this.disposed = true;
    raf.remove('contact-mesh');
    this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
