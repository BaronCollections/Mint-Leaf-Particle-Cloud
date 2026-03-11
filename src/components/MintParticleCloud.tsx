import React, { useEffect, useRef } from 'react';

export type CloudState = 'idle' | 'thinking' | 'alert';

interface MintParticleCloudProps {
  state: CloudState;
  size?: number;
}

const MintParticleCloud: React.FC<MintParticleCloudProps> = ({ state, size = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use a ref to store the current state so the animation loop always has the latest
  // without needing to re-initialize the particles when state changes.
  const stateRef = useRef<CloudState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    interface Particle {
      bx: number; // base x
      by: number; // base y
      x: number;  // current x
      y: number;  // current y
      size: number;
      baseColor: [number, number, number];
      currentColor: [number, number, number];
      alpha: number;
      phaseX: number;
      phaseY: number;
      isAlertNode: boolean;
      distanceToCenter: number;
      angleToCenter: number;
      randomOffset: number;
    }

    const particles: Particle[] = [];
    const numParticles = 4000;
    
    // Create leaf path for rejection sampling
    const path = new Path2D();
    // A leaf shape: bottom tip at (0, 100), top tip at (0, -100)
    path.moveTo(0, 100);
    path.bezierCurveTo(-80, 40, -80, -60, 0, -100);
    path.bezierCurveTo(80, -60, 80, 40, 0, 100);

    for (let i = 0; i < numParticles; i++) {
      let x = 0, y = 0;
      let inside = false;
      // Rejection sampling
      while (!inside) {
        x = (Math.random() - 0.5) * 200;
        y = (Math.random() - 0.5) * 200;
        if (ctx.isPointInPath(path, x, y)) {
          inside = true;
        }
      }

      const distanceToCenter = Math.sqrt(x * x + y * y);
      const angleToCenter = Math.atan2(y, x);
      
      const maxDist = 100;
      const normalizedDist = Math.min(distanceToCenter / maxDist, 1);
      // Core is more opaque, edges are more transparent
      const alpha = 0.15 + 0.85 * Math.pow(1 - normalizedDist, 2); 
      
      // Size variation (smaller at edges)
      const pSize = (Math.random() * 1.5 + 0.5) * (1 - normalizedDist * 0.5);

      // Alert nodes: concentrated on the edges or random patches
      const isAlertNode = Math.random() > 0.6 && (normalizedDist > 0.4 || x > 20);

      particles.push({
        bx: x,
        by: y,
        x: x,
        y: y,
        size: pSize,
        baseColor: [109, 181, 120], // #6DB578
        currentColor: [109, 181, 120],
        alpha: alpha,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        isAlertNode,
        distanceToCenter,
        angleToCenter,
        randomOffset: Math.random() * 100,
      });
    }

    const render = () => {
      time += 0.016;
      const currentState = stateRef.current;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      const scaleFactor = size / 250;
      ctx.scale(scaleFactor, scaleFactor);

      ctx.globalCompositeOperation = 'lighter';
      
      particles.forEach(p => {
        let targetX = p.bx;
        let targetY = p.by;
        let targetR = p.baseColor[0];
        let targetG = p.baseColor[1];
        let targetB = p.baseColor[2];
        let targetAlpha = p.alpha;

        if (currentState === 'idle') {
          // Breathing: slow expansion and contraction
          const breathingScale = 1 + 0.06 * Math.sin(time * 1.5);
          targetX *= breathingScale;
          targetY *= breathingScale;
          
          // Brownian motion
          targetX += Math.sin(time * 2 + p.phaseX) * 2;
          targetY += Math.cos(time * 2 + p.phaseY) * 2;
        } else if (currentState === 'thinking') {
          // Converge to dense core
          const convergeFactor = 0.2 + 0.1 * Math.sin(time * 4 + p.randomOffset);
          const convergeRadius = p.distanceToCenter * convergeFactor;
          
          // Accelerate rotation
          const rotationSpeed = 4;
          const currentAngle = p.angleToCenter + time * rotationSpeed + p.randomOffset * 0.01;
          
          targetX = Math.cos(currentAngle) * convergeRadius;
          targetY = Math.sin(currentAngle) * convergeRadius;
          
          // Swirling noise
          targetX += Math.sin(time * 6 + p.phaseX) * 3;
          targetY += Math.cos(time * 6 + p.phaseY) * 3;
          
          targetAlpha = Math.min(1, p.alpha * 1.8);
        } else if (currentState === 'alert') {
          // Fast breathing / heartbeat
          const breathingScale = 1 + 0.03 * Math.sin(time * 8);
          targetX *= breathingScale;
          targetY *= breathingScale;
          
          if (p.isAlertNode) {
            targetR = 255; // #FFB347
            targetG = 179;
            targetB = 71;
            // High frequency vibration
            targetX += Math.sin(time * 40 + p.phaseX) * 4;
            targetY += Math.cos(time * 40 + p.phaseY) * 4;
            targetAlpha = Math.min(1, p.alpha * 2.5);
          } else {
            // Slight vibration for rest
            targetX += Math.sin(time * 20 + p.phaseX) * 1.5;
            targetY += Math.cos(time * 20 + p.phaseY) * 1.5;
          }
        }

        // Smooth transition for position (spring-like)
        const lerpSpeed = currentState === 'thinking' ? 0.08 : 0.12;
        p.x += (targetX - p.x) * lerpSpeed;
        p.y += (targetY - p.y) * lerpSpeed;
        
        // Smooth transition for color
        p.currentColor[0] += (targetR - p.currentColor[0]) * 0.1;
        p.currentColor[1] += (targetG - p.currentColor[1]) * 0.1;
        p.currentColor[2] += (targetB - p.currentColor[2]) * 0.1;

        // Draw particle (using fillRect for performance)
        ctx.fillStyle = `rgba(${Math.round(p.currentColor[0])}, ${Math.round(p.currentColor[1])}, ${Math.round(p.currentColor[2])}, ${targetAlpha})`;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]); // Remove state from dependency array to prevent re-initialization

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer soft glow */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-700"
        style={{
          backgroundColor: state === 'alert' ? '#FFB347' : '#6DB578',
          transform: state === 'thinking' ? 'scale(0.5)' : 'scale(1)'
        }}
      />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10 max-w-full h-auto"
      />
    </div>
  );
};

export default MintParticleCloud;
