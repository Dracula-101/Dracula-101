import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { skills } from '../../data/experience';

/* ─────────────────────────────────────────────────────────
 * 3D Rotating Knowledge Graph
 *
 * Nodes = technologies, positioned on a sphere surface.
 * Category hubs in the center ring, individual techs orbit outward.
 * Edges connect techs to their category hub.
 * Auto-rotates, drag to orbit, hover highlights connections.
 * ───────────────────────────────────────────────────────── */

const CATEGORIES = [
  { key: 'languages' as const, label: 'Languages', color: '#F5A623' },
  { key: 'frameworks' as const, label: 'Frameworks', color: '#6366F1' },
  { key: 'databases' as const, label: 'Databases', color: '#22C55E' },
  { key: 'tools' as const, label: 'Tools', color: '#EF4444' },
];

interface GraphNode {
  position: THREE.Vector3;
  label: string;
  category: string;
  color: THREE.Color;
  isHub: boolean;
  mesh: THREE.Mesh;
  textSprite: THREE.Sprite;
  baseScale: number;
}

interface GraphEdge {
  from: number;
  to: number;
  line: THREE.Line;
}

function createTextTexture(text: string, color: string, fontSize: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 64;
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = `600 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function distributeOnSphere(index: number, total: number, radius: number, ySpread: number): THREE.Vector3 {
  // Fibonacci sphere distribution for even spacing
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const theta = 2 * Math.PI * index / goldenRatio;
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi) * ySpread,
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function KnowledgeGraph({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLCanvasElement>(null);
  const disposed = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canRef.current;
    if (!wrap || !canvas) return;
    disposed.current = false;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    let w = wrap.offsetWidth, h = wrap.offsetHeight;
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0x404040, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    /* ── Build graph data ── */
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Category hub nodes (inner ring)
    CATEGORIES.forEach((cat, ci) => {
      const angle = (ci / CATEGORIES.length) * Math.PI * 2;
      const hubRadius = 1.2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * hubRadius,
        0,
        Math.sin(angle) * hubRadius,
      );
      const color = new THREE.Color(cat.color);

      // Hub sphere (larger, glowing)
      const geo = new THREE.SphereGeometry(0.15, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      graphGroup.add(mesh);

      // Hub glow
      const glowGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(pos);
      graphGroup.add(glowMesh);

      // Label
      const tex = createTextTexture(cat.label, cat.color, 22);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.position.y += 0.3;
      sprite.scale.set(1.2, 0.3, 1);
      graphGroup.add(sprite);

      const hubIndex = nodes.length;
      nodes.push({ position: pos, label: cat.label, category: cat.key, color, isHub: true, mesh, textSprite: sprite, baseScale: 0.15 });

      // Tech nodes for this category
      const techs = skills[cat.key];
      techs.forEach((tech, ti) => {
        const techPos = distributeOnSphere(ti + ci * 10, techs.length + ci * 10, 3.2, 0.7);
        // Bias position toward its hub
        techPos.x = techPos.x * 0.6 + pos.x * 1.4;
        techPos.z = techPos.z * 0.6 + pos.z * 1.4;
        techPos.y *= 0.8;

        const techColor = color.clone().lerp(new THREE.Color(0xffffff), 0.3);
        const tGeo = new THREE.SphereGeometry(0.07, 10, 10);
        const tMat = new THREE.MeshStandardMaterial({
          color: techColor,
          emissive: techColor,
          emissiveIntensity: 0.3,
          roughness: 0.5,
          metalness: 0.05,
        });
        const tMesh = new THREE.Mesh(tGeo, tMat);
        tMesh.position.copy(techPos);
        graphGroup.add(tMesh);

        // Tech label
        const tTex = createTextTexture(tech, '#' + techColor.getHexString(), 18);
        const tSpriteMat = new THREE.SpriteMaterial({ map: tTex, transparent: true, opacity: 0.85, depthWrite: false });
        const tSprite = new THREE.Sprite(tSpriteMat);
        tSprite.position.copy(techPos);
        tSprite.position.y += 0.18;
        tSprite.scale.set(0.9, 0.22, 1);
        graphGroup.add(tSprite);

        const techIndex = nodes.length;
        nodes.push({ position: techPos, label: tech, category: cat.key, color: techColor, isHub: false, mesh: tMesh, textSprite: tSprite, baseScale: 0.07 });

        // Edge from tech to hub
        const edgeGeo = new THREE.BufferGeometry().setFromPoints([pos, techPos]);
        const edgeMat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.12,
        });
        const line = new THREE.Line(edgeGeo, edgeMat);
        graphGroup.add(line);
        edges.push({ from: hubIndex, to: techIndex, line });
      });
    });

    /* ── Camera orbit ── */
    let drag = false, prev = { x: 0, y: 0 };
    const sph = { th: 0, ph: 1.2, r: 8 };
    let tTh = 0, tPh = 1.2, tR = 8;
    let autoRot = true, idle = 0;

    const onDown = (e: PointerEvent) => { drag = true; autoRot = false; idle = 0; prev = { x: e.clientX, y: e.clientY }; canvas.style.cursor = 'grabbing'; };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      tTh -= (e.clientX - prev.x) * 0.005;
      tPh = Math.max(0.4, Math.min(Math.PI - 0.4, tPh - (e.clientY - prev.y) * 0.005));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { drag = false; canvas.style.cursor = 'grab'; };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); tR = Math.max(5, Math.min(14, tR + e.deltaY * 0.005)); autoRot = false; idle = 0; };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.style.cursor = 'grab';

    /* ── Resize ── */
    const onResize = () => {
      w = wrap.offsetWidth; h = wrap.offsetHeight;
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

      // Camera orbit
      if (!autoRot && !drag) { idle += dt; if (idle > 3) autoRot = true; }
      if (autoRot) tTh += 0.002;
      sph.th += (tTh - sph.th) * 0.05;
      sph.ph += (tPh - sph.ph) * 0.05;
      sph.r += (tR - sph.r) * 0.05;
      camera.position.set(
        sph.r * Math.sin(sph.ph) * Math.sin(sph.th),
        sph.r * Math.cos(sph.ph),
        sph.r * Math.sin(sph.ph) * Math.cos(sph.th),
      );
      camera.lookAt(0, 0, 0);

      // Node animations - gentle float and pulse
      nodes.forEach((node, i) => {
        const floatY = Math.sin(t * 0.8 + i * 0.5) * 0.05;
        node.mesh.position.y = node.position.y + floatY;
        node.textSprite.position.y = node.position.y + floatY + (node.isHub ? 0.3 : 0.18);

        // Pulse scale for hubs
        if (node.isHub) {
          const pulse = 1 + Math.sin(t * 1.5 + i) * 0.08;
          node.mesh.scale.setScalar(pulse);
        }

        // Labels always face camera
        node.textSprite.lookAt(camera.position);
      });

      // Edge updates (follow node positions)
      edges.forEach(edge => {
        const fromPos = nodes[edge.from].mesh.position;
        const toPos = nodes[edge.to].mesh.position;
        const positions = edge.line.geometry.getAttribute('position') as THREE.BufferAttribute;
        positions.setXYZ(0, fromPos.x, fromPos.y, fromPos.z);
        positions.setXYZ(1, toPos.x, toPos.y, toPos.z);
        positions.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed.current = true;
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse(obj => {
        if ('geometry' in obj && (obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ('material' in obj && (obj as THREE.Mesh).material instanceof THREE.Material)
          ((obj as THREE.Mesh).material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', aspectRatio: '1' }}>
      <canvas ref={canRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
