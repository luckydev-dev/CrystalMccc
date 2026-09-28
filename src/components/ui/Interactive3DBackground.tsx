import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  color: string;
  size: number;
  speed: number;
}

export function Interactive3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devicePixelRatio, setRatio] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setRatio(window.devicePixelRatio || 1);

    let animationFrameId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    // We'll maintain a fixed, medium particle count to avoid lag on lower-end/mobile devices
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 85; 
    let particles: Particle[] = [];

    // Mouse coordinates with smooth damping (spring physics)
    let pointerX = width / 2;
    let pointerY = height / 2;
    let targetPointerX = width / 2;
    let targetPointerY = height / 2;

    const colors = [
      'rgba(245, 158, 11, 0.45)', // Amber-500
      'rgba(99, 102, 241, 0.35)',  // Indigo-500
      'rgba(16, 185, 129, 0.3)',   // Emerald-500
    ];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(width, height) * 0.7;
        
        particles.push({
          x: Math.cos(theta) * radius,
          y: Math.sin(theta) * radius,
          z: Math.random() * 800 + 200, // Z depth
          baseX: 0,
          baseY: 0,
          color: colors[i % colors.length],
          size: Math.random() * 1.5 + 0.8,
          speed: Math.random() * 0.4 + 0.2,
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      width = canvas.width = (parent?.clientWidth || window.innerWidth) * (window.devicePixelRatio || 1);
      height = canvas.height = (parent?.clientHeight || window.innerHeight) * (window.devicePixelRatio || 1);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      initParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let x = 0;
      let y = 0;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      const rect = canvas.getBoundingClientRect();
      targetPointerX = (x - rect.left) * (window.devicePixelRatio || 1);
      targetPointerY = (y - rect.top) * (window.devicePixelRatio || 1);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    const fov = 400; // Field of view
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth pointer spring easing
      pointerX += (targetPointerX - pointerX) * 0.05;
      pointerY += (targetPointerY - pointerY) * 0.05;

      // Map pointer to yaw/pitch rotation angles
      const rotationY = ((pointerX - centerX) / width) * 0.35;
      const rotationX = -((pointerY - centerY) / height) * 0.35;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // Render 3D connected lines
      // Pre-calculate 2D projected coordinates for speed
      const projection: { px: number; py: number; scale: number; item: Particle }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle closer in Z space
        p.z -= p.speed;
        if (p.z <= 0) {
          p.z = 1000; // Loop back to the far plane
        }

        // Apply 3D Rotations based on smooth mouse/touch position
        // Rotate Y (yaw)
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X (pitch)
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const scale = fov / (fov + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        projection.push({ px, py, scale, item: p });
      }

      // Draw faint connection webs in 3D projection space
      ctx.lineWidth = 0.5 * (window.devicePixelRatio || 1);
      const maxDistance = isMobile ? 45 : 70;

      for (let i = 0; i < projection.length; i++) {
        const p1 = projection[i];
        if (p1.px < 0 || p1.px > width || p1.py < 0 || p1.py > height) continue;

        for (let j = i + 1; j < projection.length; j++) {
          const p2 = projection[j];
          
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.12 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw individual glowing stars
      for (let i = 0; i < projection.length; i++) {
        const p = projection[i];
        if (p.px < 0 || p.px > width || p.py < 0 || p.py > height) continue;

        const size = p.item.size * p.scale * 1.5;
        if (size <= 0 || isNaN(size)) continue;
        
        ctx.fillStyle = p.item.color;
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw delicate radial halo around bright center star
        if (p.scale > 0.6) {
          ctx.fillStyle = p.item.color.replace('0.', '0.04');
          ctx.beginPath();
          ctx.arc(p.px, p.py, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full mix-blend-screen opacity-[0.85] z-0"
    />
  );
}
