import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Crystal3DSceneProps {
  className?: string;
  interactive?: boolean;
}

export function Crystal3DScene({ className = '', interactive = true }: Crystal3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 240;
    const height = container.clientHeight || 240;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // High performance renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x4a154b, 2.4);
    scene.add(ambientLight);

    const magentaLight = new THREE.PointLight(0xf43f5e, 5.0, 16);
    magentaLight.position.set(-3, 2, 3);
    scene.add(magentaLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4.5, 16);
    cyanLight.position.set(3, -2, 3);
    scene.add(cyanLight);

    const purpleKeyLight = new THREE.PointLight(0xa855f7, 6.0, 18);
    purpleKeyLight.position.set(0, 3, 4);
    scene.add(purpleKeyLight);

    // Master Group & Pivot
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const modelPivot = new THREE.Group();
    mainGroup.add(modelPivot);

    // Load authentic End Crystal GLB Model
    let mixer: THREE.AnimationMixer | null = null;
    const loader = new GLTFLoader();

    loader.load(
      '/models/end_crystal.glb',
      (gltf) => {
        const model = gltf.scene;

        // Compute bounding box to center & normalize scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        // Target dimension inside the hero badge (increased by 4%)
        const targetScale = 2.55 / maxDim;
        model.scale.setScalar(targetScale);

        // Center model within the pivot group
        model.position.set(
          -center.x * targetScale,
          -center.y * targetScale,
          -center.z * targetScale
        );

        // Enhance crystal textures and emissive glow
        model.traverse((child: any) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.depthWrite = true;
            if (child.material.emissive) {
              child.material.emissiveIntensity = 1.35;
            }
          }
        });

        modelPivot.add(model);

        // Play the built-in animation
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
      },
      undefined,
      (err) => {
        console.error('Error loading end_crystal.glb:', err);
      }
    );

    // Floating Magical Dust Aura
    const particleCount = 35;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.5 + Math.random() * 1.5;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(216, 180, 254, 0.9)');
      grad.addColorStop(1, 'rgba(216, 180, 254, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xf0abfc
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleSystem);

    // ==========================================
    // Drag-Only Rotation (No hover-tilt, no click jump)
    // ==========================================
    let targetRotationX = 0.15;
    let targetRotationY = 0;
    let currentRotationX = 0.15;
    let currentRotationY = 0;

    let isDragging = false;
    let hasMoved = false;
    let previousPosition = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      hasMoved = false;
      previousPosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return; // Do not move with cursor hover
      const deltaX = e.clientX - previousPosition.x;
      const deltaY = e.clientY - previousPosition.y;

      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        hasMoved = true;
      }

      dragVelocity.x = deltaX * 0.009;
      dragVelocity.y = deltaY * 0.009;
      targetRotationY += dragVelocity.x;
      // Clamp vertical pitch between -0.65 and 0.65 radians
      targetRotationX = Math.max(-0.65, Math.min(0.65, targetRotationX + dragVelocity.y));
      previousPosition = { x: e.clientX, y: e.clientY };
      setHasInteracted(true);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Mobile touch interaction (drag only, ignore taps)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        hasMoved = false;
        previousPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - previousPosition.x;
      const deltaY = touch.clientY - previousPosition.y;

      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        hasMoved = true;
      }

      dragVelocity.x = deltaX * 0.01;
      dragVelocity.y = deltaY * 0.01;
      targetRotationY += dragVelocity.x;
      targetRotationX = Math.max(-0.65, Math.min(0.65, targetRotationX + dragVelocity.y));
      previousPosition = { x: touch.clientX, y: touch.clientY };
      setHasInteracted(true);
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      container.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    // Responsive container resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Tab visibility handling
    let clock = new THREE.Clock();
    let animId: number;
    let isVisible = true;

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) clock.start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Animation loop
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update model GLTF mixer animation
      if (mixer) {
        mixer.update(delta);
      }

      // Drag inertia decay & subtle idle spin
      if (!isDragging) {
        dragVelocity.x *= 0.90;
        dragVelocity.y *= 0.90;
        targetRotationY += dragVelocity.x + 0.004; // graceful slow continuous spin
        targetRotationX += dragVelocity.y;
      }

      // Smooth cursor / drag lerp
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;

      // Gentle floating bob
      const floatY = Math.sin(elapsedTime * 2.0) * 0.1;
      mainGroup.position.y = floatY;

      // Rotate group with user tilt & spin
      mainGroup.rotation.x = currentRotationX;
      mainGroup.rotation.y = currentRotationY;

      // Particle aura gentle rotation
      particleSystem.rotation.y = -elapsedTime * 0.2;

      // Dynamic light orbit
      magentaLight.position.x = Math.sin(elapsedTime * 0.8) * 3;
      magentaLight.position.z = Math.cos(elapsedTime * 0.8) * 3;
      cyanLight.position.x = Math.cos(elapsedTime * 0.9) * 3;
      cyanLight.position.z = Math.sin(elapsedTime * 0.9) * 3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (interactive) {
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        container.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative select-none ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
        title="Interactive End Crystal: Click & drag or swipe to spin"
      />
      {!hasInteracted && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 hover:opacity-80 transition-opacity text-[9px] uppercase font-mono tracking-widest text-purple-300/80 bg-slate-950/60 px-2 py-0.5 rounded-full border border-purple-500/20 backdrop-blur-sm whitespace-nowrap">
          Drag to spin
        </div>
      )}
    </div>
  );
}
