import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Floating wireframe network mesh rendered with Three.js.
 * Replaces the static SVG network in the About section.
 */
export function NetworkMesh({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const disposed = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        disposed.current = false;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const container = canvas.parentElement;
        const w = container?.offsetWidth || 480;
        const h = container?.offsetHeight || 480;
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
        camera.position.z = 5;

        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#F5A623';
        const accent = new THREE.Color(accentHex);
        const fgHex = getComputedStyle(document.documentElement).getPropertyValue('--color-fg').trim() || '#ffffff';
        const white = new THREE.Color(fgHex);

        // Create network nodes
        const nodeCount = 24;
        const nodes: THREE.Vector3[] = [];
        const nodeMeshes: THREE.Mesh[] = [];

        for (let i = 0; i < nodeCount; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2,
            );
            nodes.push(pos);

            const isAccent = i < 4;
            const geo = new THREE.SphereGeometry(isAccent ? 0.06 : 0.035, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: isAccent ? accent : white,
                transparent: true,
                opacity: isAccent ? 0.8 : 0.25,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);
            scene.add(mesh);
            nodeMeshes.push(mesh);
        }

        // Create connection lines between nearby nodes
        const lineGeo = new THREE.BufferGeometry();
        const linePositions: number[] = [];
        const lineOpacities: number[] = [];
        const connections: [number, number][] = [];

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = nodes[i].distanceTo(nodes[j]);
                if (dist < 2.0) {
                    connections.push([i, j]);
                    linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
                    linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
                    lineOpacities.push(1 - dist / 2.0);
                }
            }
        }

        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.12,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        // Central hub - wireframe icosahedron
        const hubGeo = new THREE.IcosahedronGeometry(0.5, 1);
        const hubEdges = new THREE.EdgesGeometry(hubGeo);
        const hubMat = new THREE.LineBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.3,
        });
        const hub = new THREE.LineSegments(hubEdges, hubMat);
        scene.add(hub);

        // Orbit ring
        const ringGeo = new THREE.TorusGeometry(1.8, 0.005, 3, 80);
        const ringEdges = new THREE.EdgesGeometry(ringGeo);
        const ringMat = new THREE.LineBasicMaterial({
            color: white,
            transparent: true,
            opacity: 0.06,
        });
        const ring = new THREE.LineSegments(ringEdges, ringMat);
        ring.rotation.x = Math.PI / 3;
        scene.add(ring);

        const clock = new THREE.Clock();
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        const handleMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            targetMouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        canvas.addEventListener('mousemove', handleMouse, { passive: true });

        const handleResize = () => {
            const container = canvas.parentElement;
            const w = container?.offsetWidth || 480;
            const h = container?.offsetHeight || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        const animate = () => {
            if (disposed.current) return;
            requestAnimationFrame(animate);

            const t = clock.getElapsedTime();
            mouseX += (targetMouseX - mouseX) * 0.03;
            mouseY += (targetMouseY - mouseY) * 0.03;

            // Rotate whole scene gently
            scene.rotation.y = t * 0.08 + mouseX * 0.3;
            scene.rotation.x = mouseY * 0.15;

            // Breathe nodes
            nodeMeshes.forEach((mesh, i) => {
                const n = nodes[i];
                const phase = i * 0.5 + t * 0.8;
                mesh.position.x = n.x + Math.sin(phase) * 0.05;
                mesh.position.y = n.y + Math.cos(phase * 0.7) * 0.05;
                mesh.position.z = n.z + Math.sin(phase * 0.5) * 0.03;
            });

            // Update line positions
            const posArr = lines.geometry.getAttribute('position').array as Float32Array;
            let idx = 0;
            for (const [i, j] of connections) {
                posArr[idx++] = nodeMeshes[i].position.x;
                posArr[idx++] = nodeMeshes[i].position.y;
                posArr[idx++] = nodeMeshes[i].position.z;
                posArr[idx++] = nodeMeshes[j].position.x;
                posArr[idx++] = nodeMeshes[j].position.y;
                posArr[idx++] = nodeMeshes[j].position.z;
            }
            lines.geometry.getAttribute('position').needsUpdate = true;

            // Rotate hub
            hub.rotation.y = t * 0.3;
            hub.rotation.x = t * 0.2;

            // Rotate ring
            ring.rotation.z = t * 0.05;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            disposed.current = true;
            canvas.removeEventListener('mousemove', handleMouse);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
                    obj.geometry.dispose();
                    if (obj.material instanceof THREE.Material) obj.material.dispose();
                }
            });
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
