import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
 * Planetary System — Monochrome gold/amber palette. Central
 * star with orbiting bodies of varying brightness. Subtle
 * orbit trails, star dust, and gentle camera drift.
 * ───────────────────────────────────────────────────────── */

/* Single-hue palette — warm amber at different luminance levels */
const HUE = { h: 0.095, s: 0.85 }; // amber-gold in HSL

function shade(lightness: number): THREE.Color {
    return new THREE.Color().setHSL(HUE.h, HUE.s, lightness);
}

interface Body {
    r: number;        // radius
    orbit: number;    // orbital distance
    speed: number;    // orbital speed
    tilt: number;     // orbit plane tilt
    lum: number;      // lightness 0-1 (shade)
    moons?: { r: number; orbit: number; speed: number; lum: number }[];
    ring?: boolean;
}

const BODIES: Body[] = [
    { r: 0.055, orbit: 1.0, speed: 0.38, tilt: 0.06, lum: 0.65 },
    {
        r: 0.09, orbit: 1.55, speed: -0.24, tilt: 0.09, lum: 0.50,
        moons: [{ r: 0.02, orbit: 0.2, speed: 1.3, lum: 0.35 }]
    },
    { r: 0.13, orbit: 2.2, speed: 0.15, tilt: -0.07, lum: 0.55, ring: true },
    {
        r: 0.08, orbit: 2.85, speed: -0.10, tilt: 0.11, lum: 0.42,
        moons: [
            { r: 0.018, orbit: 0.17, speed: 1.6, lum: 0.32 },
            { r: 0.013, orbit: 0.27, speed: -1.0, lum: 0.28 },
        ]
    },
    { r: 0.05, orbit: 3.4, speed: 0.065, tilt: -0.04, lum: 0.38 },
];

/* ── Radial glow texture ── */
function makeGlow(r: number, g: number, b: number): THREE.CanvasTexture {
    const s = 128, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d')!;
    const gr = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(0.06, `rgba(${r},${g},${b},0.65)`);
    gr.addColorStop(0.18, `rgba(${r},${g},${b},0.18)`);
    gr.addColorStop(0.4, `rgba(${r},${g},${b},0.03)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
}

export function NetworkMesh({ className }: { className?: string }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canRef = useRef<HTMLCanvasElement>(null);
    const disposed = useRef(false);

    useEffect(() => {
        const wrap = wrapRef.current, canvas = canRef.current;
        if (!wrap || !canvas) return;
        disposed.current = false;

        const glowTex = makeGlow(255, 190, 70);   // warm amber glow
        const softGlow = makeGlow(255, 220, 140);  // softer for planets

        /* ── Renderer ── */
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        let w = wrap.offsetWidth, h = wrap.offsetHeight;
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 200);
        camera.position.set(0, 3.2, 7.8);
        camera.lookAt(0, 0, 0);

        /* ── Lighting — warm amber point from star ── */
        scene.add(new THREE.AmbientLight(shade(0.15).getHex(), 0.25));
        const ptLight = new THREE.PointLight(shade(0.75).getHex(), 3, 18, 1.8);
        scene.add(ptLight);

        /* ── Central star ── */
        const starGeo = new THREE.SphereGeometry(0.16, 32, 32);
        const starMat = new THREE.MeshBasicMaterial({ color: shade(0.78), transparent: true });
        const star = new THREE.Mesh(starGeo, starMat);
        scene.add(star);

        const glowPlane = new THREE.PlaneGeometry(2.6, 2.6);
        const glowMat = new THREE.MeshBasicMaterial({
            map: glowTex, transparent: true, opacity: 0.4,
            side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
        });
        const starGlowMesh = new THREE.Mesh(glowPlane, glowMat);
        scene.add(starGlowMesh);

        /* ── Star dust particles ── */
        const dustCount = 400;
        const dustPos = new Float32Array(dustCount * 3);
        const dustAlpha = new Float32Array(dustCount);
        for (let i = 0; i < dustCount; i++) {
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            const r = 12 + Math.random() * 30;
            dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
            dustPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
            dustPos[i * 3 + 2] = r * Math.cos(ph);
            dustAlpha[i] = 0.15 + Math.random() * 0.35;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            color: shade(0.6), size: 0.035, transparent: true, opacity: 0.35, sizeAttenuation: true,
        });
        scene.add(new THREE.Points(dustGeo, dustMat));

        /* ── Orbiting bodies ── */
        interface BodyObj {
            mesh: THREE.Mesh;
            glow: THREE.Mesh;
            def: Body;
            moons: { mesh: THREE.Mesh; def: NonNullable<Body['moons']>[number] }[];
            ringMesh?: THREE.Mesh;
        }
        const bodies: BodyObj[] = [];

        BODIES.forEach(b => {
            // Orbit path
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= 160; i++) {
                const a = (i / 160) * Math.PI * 2;
                pts.push(new THREE.Vector3(b.orbit * Math.cos(a), 0, b.orbit * Math.sin(a)));
            }
            const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const oMat = new THREE.LineBasicMaterial({ color: shade(0.35), transparent: true, opacity: 0.06 });
            const oLine = new THREE.LineLoop(oGeo, oMat);
            oLine.rotation.x = b.tilt;
            scene.add(oLine);

            // Body sphere
            const col = shade(b.lum);
            const emCol = shade(b.lum * 0.35);
            const geo = new THREE.SphereGeometry(b.r, 28, 28);
            const mat = new THREE.MeshStandardMaterial({
                color: col, emissive: emCol, emissiveIntensity: 0.35,
                roughness: 0.65, metalness: 0.05,
            });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            // Glow halo
            const gs = b.r * 6;
            const gGeo = new THREE.PlaneGeometry(gs, gs);
            const gMat = new THREE.MeshBasicMaterial({
                map: softGlow, color: col, transparent: true, opacity: 0.12,
                side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
            });
            const gMesh = new THREE.Mesh(gGeo, gMat);
            scene.add(gMesh);

            // Ring (for one planet)
            let ringMesh: THREE.Mesh | undefined;
            if (b.ring) {
                const rGeo = new THREE.RingGeometry(b.r * 1.6, b.r * 2.6, 64);
                const rMat = new THREE.MeshBasicMaterial({
                    color: shade(b.lum * 0.8), transparent: true, opacity: 0.1,
                    side: THREE.DoubleSide, depthWrite: false,
                });
                ringMesh = new THREE.Mesh(rGeo, rMat);
                ringMesh.rotation.x = Math.PI / 2.2;
                scene.add(ringMesh);
            }

            // Moons
            const moons: BodyObj['moons'] = [];
            b.moons?.forEach(m => {
                const mGeo = new THREE.SphereGeometry(m.r, 12, 12);
                const mMat = new THREE.MeshStandardMaterial({
                    color: shade(m.lum), roughness: 0.8, metalness: 0,
                    emissive: shade(m.lum * 0.3), emissiveIntensity: 0.2,
                });
                const mMesh = new THREE.Mesh(mGeo, mMat);
                scene.add(mMesh);
                moons.push({ mesh: mMesh, def: m });
            });

            bodies.push({ mesh, glow: gMesh, def: b, moons, ringMesh });
        });

        /* ── Camera orbit ── */
        let drag = false, prev = { x: 0, y: 0 };
        const sph = { th: 0, ph: 1.05, r: 8.5 };
        let tTh = 0, tPh = 1.05, tR = 8.5;
        let autoRot = true, idle = 0;

        const onDown = (e: PointerEvent) => { drag = true; autoRot = false; idle = 0; prev = { x: e.clientX, y: e.clientY }; canvas.style.cursor = 'grabbing'; };
        const onMove = (e: PointerEvent) => {
            if (!drag) return;
            tTh -= (e.clientX - prev.x) * 0.004;
            tPh = Math.max(0.3, Math.min(Math.PI - 0.3, tPh - (e.clientY - prev.y) * 0.004));
            prev = { x: e.clientX, y: e.clientY };
        };
        const onUp = () => { drag = false; canvas.style.cursor = 'grab'; };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); tR = Math.max(4, Math.min(14, tR + e.deltaY * 0.004)); autoRot = false; idle = 0; };

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

            // Camera
            if (!autoRot && !drag) { idle += dt; if (idle > 3) autoRot = true; }
            if (autoRot) tTh += 0.0012;
            sph.th += (tTh - sph.th) * 0.04;
            sph.ph += (tPh - sph.ph) * 0.04;
            sph.r += (tR - sph.r) * 0.04;
            camera.position.set(
                sph.r * Math.sin(sph.ph) * Math.sin(sph.th),
                sph.r * Math.cos(sph.ph),
                sph.r * Math.sin(sph.ph) * Math.cos(sph.th),
            );
            camera.lookAt(0, 0, 0);

            // Star breathe
            const breathe = Math.sin(t * 0.5) * 0.08;
            star.scale.setScalar(1 + breathe * 0.2);
            ptLight.intensity = 3 + breathe * 2.5;
            starGlowMesh.lookAt(camera.position);
            glowMat.opacity = 0.35 + breathe * 0.12;
            starGlowMesh.scale.setScalar(1 + breathe * 0.25);

            // Bodies
            bodies.forEach(bo => {
                const b = bo.def;
                const ang = t * b.speed;
                const px = b.orbit * Math.cos(ang);
                const pz = b.orbit * Math.sin(ang);
                const py = pz * Math.sin(b.tilt);
                const pzz = pz * Math.cos(b.tilt);

                bo.mesh.position.set(px, py, pzz);
                bo.mesh.rotation.y = t * 0.4;

                bo.glow.position.copy(bo.mesh.position);
                bo.glow.lookAt(camera.position);

                if (bo.ringMesh) bo.ringMesh.position.copy(bo.mesh.position);

                bo.moons.forEach(m => {
                    const ma = t * m.def.speed;
                    m.mesh.position.set(
                        bo.mesh.position.x + m.def.orbit * Math.cos(ma),
                        bo.mesh.position.y + m.def.orbit * Math.sin(ma) * 0.3,
                        bo.mesh.position.z + m.def.orbit * Math.sin(ma),
                    );
                });
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
            glowTex.dispose();
            softGlow.dispose();
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
