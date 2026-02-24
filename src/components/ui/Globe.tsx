import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
 * 3D Interactive Globe
 *
 * Dotted sphere with latitude/longitude grid, glowing arcs
 * connecting random points, ambient particles.
 * Auto-rotates, drag to orbit.
 * ───────────────────────────────────────────────────────── */

const ACCENT = '#F5A623';
const DOT_COUNT = 2400;
const ARC_COUNT = 8;
const GLOBE_RADIUS = 2;

function createGlobeDots(radius: number, count: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere distribution for uniform coverage
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 0.8 + Math.random() * 1.2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(ACCENT),
    size: 0.02,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geo, mat);
}

function createGlobeWireframe(radius: number): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(ACCENT),
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  });

  // Latitude lines
  for (let i = 1; i < 8; i++) {
    const phi = (i / 8) * Math.PI;
    const r = radius * Math.sin(phi);
    const y = radius * Math.cos(phi);
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      const theta = (j / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Longitude lines
  for (let i = 0; i < 12; i++) {
    const theta = (i / 12) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      const phi = (j / 64) * Math.PI;
      pts.push(new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  return group;
}

function randomPointOnSphere(radius: number): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createArc(from: THREE.Vector3, to: THREE.Vector3, altitude: number): THREE.Line {
  const pts: THREE.Vector3[] = [];
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(GLOBE_RADIUS + altitude);

  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    // Quadratic bezier on sphere surface
    const a = from.clone().multiplyScalar((1 - t) * (1 - t));
    const b = mid.clone().multiplyScalar(2 * (1 - t) * t);
    const c = to.clone().multiplyScalar(t * t);
    pts.push(a.add(b).add(c));
  }

  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(ACCENT),
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Line(geo, mat);
}

function createAmbientParticles(count: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(ACCENT),
    size: 0.015,
    transparent: true,
    opacity: 0.15,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

export function Globe({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLCanvasElement>(null);
  const disposed = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canRef.current;
    if (!wrap || !canvas) return;
    disposed.current = false;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    let w = wrap.offsetWidth;
    let h = wrap.offsetHeight;
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);

    /* ── Scene ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0, 0);

    /* ── Globe group ── */
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Dotted sphere
    const dots = createGlobeDots(GLOBE_RADIUS, DOT_COUNT);
    globeGroup.add(dots);

    // Wireframe grid
    const wireframe = createGlobeWireframe(GLOBE_RADIUS * 1.002);
    globeGroup.add(wireframe);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ACCENT),
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
      depthWrite: false,
    });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // Outer atmosphere glow
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ACCENT),
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    globeGroup.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));

    // Connection arcs
    const arcs: THREE.Line[] = [];
    for (let i = 0; i < ARC_COUNT; i++) {
      const from = randomPointOnSphere(GLOBE_RADIUS);
      const to = randomPointOnSphere(GLOBE_RADIUS);
      const altitude = 0.3 + Math.random() * 0.6;
      const arc = createArc(from, to, altitude);
      globeGroup.add(arc);
      arcs.push(arc);
    }

    // Ambient particles
    const particles = createAmbientParticles(60);
    scene.add(particles);

    /* ── Lighting ── */
    const ambient = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(new THREE.Color(ACCENT), 1.5, 12);
    pointLight.position.set(3, 2, 4);
    scene.add(pointLight);

    /* ── Drag interaction ── */
    let drag = false;
    let prev = { x: 0, y: 0 };
    let targetRotY = 0;
    let targetRotX = 0.2;
    let currentRotY = 0;
    let currentRotX = 0.2;
    let autoRotate = true;
    let idleTime = 0;

    const onDown = (e: PointerEvent) => {
      drag = true;
      autoRotate = false;
      idleTime = 0;
      prev = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      targetRotY += (e.clientX - prev.x) * 0.005;
      targetRotX += (e.clientY - prev.y) * 0.003;
      targetRotX = Math.max(-1, Math.min(1, targetRotX));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      drag = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.style.cursor = 'grab';

    /* ── Resize ── */
    const onResize = () => {
      w = wrap.offsetWidth;
      h = wrap.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    /* ── Animate ── */
    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed.current) return;
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Auto-rotate after idle
      if (!autoRotate && !drag) {
        idleTime += dt;
        if (idleTime > 3) autoRotate = true;
      }
      if (autoRotate) {
        targetRotY += 0.003;
      }

      // Smooth rotation
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentRotX += (targetRotX - currentRotX) * 0.06;
      globeGroup.rotation.y = currentRotY;
      globeGroup.rotation.x = currentRotX;

      // Pulsing arc opacity
      arcs.forEach((arc, i) => {
        const mat = arc.material as THREE.LineBasicMaterial;
        mat.opacity = 0.15 + Math.sin(t * 0.8 + i * 1.5) * 0.2;
      });

      // Floating particles
      const pPos = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < pPos.count; i++) {
        let y = pPos.getY(i);
        y += 0.002 * Math.sin(t * 0.3 + i * 0.6);
        if (y > 6) y = -6;
        pPos.setY(i, y);
      }
      pPos.needsUpdate = true;

      // Subtle point light orbit
      pointLight.position.x = Math.sin(t * 0.3) * 4;
      pointLight.position.z = Math.cos(t * 0.3) * 4;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed.current = true;
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', aspectRatio: '1' }}>
      <canvas ref={canRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
