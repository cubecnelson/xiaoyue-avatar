import { useEffect, useRef } from 'react';

// Wawa-lipsync viseme → mouth shape mapping
const MOUTH_SHAPES: Record<number, { height: number; width: number; y: number }> = {
  0: { height: 2, width: 28, y: 2 },    // silence/rest
  1: { height: 8, width: 16, y: 0 },    // A as in "father" 
  2: { height: 5, width: 22, y: 1 },    // B/M/P (closed)
  3: { height: 6, width: 18, y: 1 },    // CH/J/SH
  4: { height: 4, width: 24, y: 1.5 },  // D/T/L/N
  5: { height: 8, width: 14, y: 0 },    // E as in "bed"
  6: { height: 6, width: 20, y: 1 },    // F/V
  7: { height: 4, width: 24, y: 1 },    // G/K/NG
  8: { height: 8, width: 16, y: 0 },    // I as in "bit"
  9: { height: 3, width: 26, y: 1.5 },  // L/TH
  10: { height: 2, width: 28, y: 2 },   // silence
  11: { height: 8, width: 14, y: 2 },   // O as in "pot"
  12: { height: 7, width: 12, y: 0 },   // OO as in "boot"
  13: { height: 8, width: 14, y: 1 },   // R
  14: { height: 9, width: 12, y: -0.5 },// S/Z
  15: { height: 6, width: 24, y: 1 },   // TH
  16: { height: 8, width: 16, y: 0 },   // U as in "but"
  17: { height: 4, width: 26, y: 1.5 }, // W/Q
  18: { height: 6, width: 16, y: 1 },   // Y
  19: { height: 10, width: 10, y: -1 }, // big open
  20: { height: 10, width: 10, y: -1 }, // big open 2
  21: { height: 6, width: 20, y: 1 },   // ZH
};

interface AvatarProps {
  speaking: boolean;
  visemeIndex: number;
  emotion?: 'happy' | 'neutral' | 'thinking';
}

export function Avatar({ speaking, visemeIndex, emotion = 'neutral' }: AvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const time = useRef(0);
  const prevMouth = useRef(MOUTH_SHAPES[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    
    const target = MOUTH_SHAPES[visemeIndex] || MOUTH_SHAPES[0];
    
    // Smooth transition between mouth shapes
    prevMouth.current = {
      height: prevMouth.current.height + (target.height - prevMouth.current.height) * 0.3,
      width: prevMouth.current.width + (target.width - prevMouth.current.width) * 0.3,
      y: prevMouth.current.y + (target.y - prevMouth.current.y) * 0.3,
    };

    function draw() {
      time.current += 0.016;
      const w = canvas!.width;
      const h = canvas!.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = time.current;

      ctx.clearRect(0, 0, w, h);

      // ── Background glow ──
      const glowGrad = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, 200);
      glowGrad.addColorStop(0, !speaking ? 'rgba(236, 72, 153, 0.03)' : 'rgba(236, 72, 153, 0.08)');
      glowGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy - 30);

      // ── Neck ──
      ctx.fillStyle = '#FDE8E8';
      ctx.beginPath();
      ctx.moveTo(-12, 60);
      ctx.lineTo(-16, 100);
      ctx.lineTo(16, 100);
      ctx.lineTo(12, 60);
      ctx.closePath();
      ctx.fill();

      // ── Body / Dress hint ──
      ctx.fillStyle = '#DB2777';
      ctx.beginPath();
      ctx.moveTo(-50, 90);
      ctx.quadraticCurveTo(-40, 130, -70, 160);
      ctx.lineTo(70, 160);
      ctx.quadraticCurveTo(40, 130, 50, 90);
      ctx.closePath();
      ctx.fill();
      
      // Collar detail
      ctx.fillStyle = '#BE185D';
      ctx.beginPath();
      ctx.moveTo(-20, 90);
      ctx.quadraticCurveTo(0, 105, 20, 90);
      ctx.fill();

      // ── Hair (long flowing) ──
      ctx.fillStyle = '#1A1A2E';
      // Main hair
      ctx.beginPath();
      ctx.arc(0, -5, 60, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      // Hair strands left
      ctx.beginPath();
      ctx.moveTo(-55, -20);
      ctx.quadraticCurveTo(-70, 10, -65, 60);
      ctx.quadraticCurveTo(-60, 80, -52, 100);
      ctx.quadraticCurveTo(-45, 60, -50, 20);
      ctx.fill();
      // Hair strands right  
      ctx.beginPath();
      ctx.moveTo(55, -20);
      ctx.quadraticCurveTo(70, 10, 65, 60);
      ctx.quadraticCurveTo(60, 80, 52, 100);
      ctx.quadraticCurveTo(45, 60, 50, 20);
      ctx.fill();
      // Bangs
      ctx.beginPath();
      ctx.ellipse(0, -52, 50, 22, 0, Math.PI, 0);
      ctx.fill();
      // Hair shine
      ctx.fillStyle = '#2D2D44';
      ctx.beginPath();
      ctx.ellipse(-20, -30, 8, 25, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // ── Face ──
      ctx.fillStyle = '#FFF0F0';
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blush
      ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-28, 8, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(28, 8, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Eyes ──
      const eyeY = -8;
      const blinkPhase = Math.sin(t * 4) * 0.5 + 0.5;
      const isBlinking = blinkPhase > 0.92;
      
      // Left eye
      drawEye(ctx, -18, eyeY, isBlinking);
      // Right eye
      drawEye(ctx, 18, eyeY, isBlinking);

      // ── Eyebrows ──
      ctx.strokeStyle = '#1A1A2E';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      const browY = speaking ? -22 : emotion === 'happy' ? -24 : -20;
      // Left brow
      ctx.beginPath();
      ctx.moveTo(-30, browY);
      ctx.quadraticCurveTo(-18, browY - (emotion === 'happy' ? 3 : 2), -8, browY);
      ctx.stroke();
      // Right brow
      ctx.beginPath();
      ctx.moveTo(8, browY);
      ctx.quadraticCurveTo(18, browY - (emotion === 'happy' ? 3 : 2), 30, browY);
      ctx.stroke();

      // ── Nose ──
      ctx.fillStyle = '#F0D5D5';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(-4, 16, 0, 18);
      ctx.quadraticCurveTo(4, 16, 0, 8);
      ctx.fill();

      // ── Mouth (driven by viseme) ──
      const m = prevMouth.current;
      const mouthY = 28 + m.y;
      ctx.fillStyle = '#D45D79';
      ctx.beginPath();
      if (m.height < 3) {
        // Nearly closed — thin line
        ctx.moveTo(-m.width / 2, mouthY);
        ctx.quadraticCurveTo(0, mouthY + 1, m.width / 2, mouthY);
      } else {
        // Open mouth
        ctx.moveTo(-m.width / 2, mouthY - m.height / 2);
        ctx.quadraticCurveTo(0, mouthY + m.height / 2, m.width / 2, mouthY - m.height / 2);
        ctx.quadraticCurveTo(0, mouthY - m.height / 2, -m.width / 2, mouthY - m.height / 2);
      }
      ctx.fill();

      // Upper lip
      ctx.strokeStyle = '#C94D6A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-m.width / 2, mouthY - m.height / 2);
      ctx.quadraticCurveTo(-m.width / 4, mouthY - m.height / 2 - 3, 0, mouthY - m.height / 2);
      ctx.quadraticCurveTo(m.width / 4, mouthY - m.height / 2 - 3, m.width / 2, mouthY - m.height / 2);
      ctx.stroke();

      // ── Hair accessory (flower) ──
      ctx.fillStyle = '#F43F5E';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const px = -35 + Math.cos(angle) * 8;
        const py = -45 + Math.sin(angle) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(-35, -45, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animFrame.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [speaking, visemeIndex, emotion]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={400}
      className="avatar-canvas"
      style={{ width: '100%', maxWidth: 300, height: 'auto', aspectRatio: '3/4' }}
    />
  );
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isBlinking: boolean
) {
  const eyeH = isBlinking ? 1 : 10;
  
  // Eye white
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(x, y, 11, eyeH, 0, 0, Math.PI * 2);
  ctx.fill();
  
  if (!isBlinking) {
    // Iris
    const irisGrad = ctx.createRadialGradient(x, y, 1, x, y, 5);
    irisGrad.addColorStop(0, '#1A1A2E');
    irisGrad.addColorStop(0.6, '#4A2A3E');
    irisGrad.addColorStop(1, '#1A1A2E');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 2, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Eyelashes
  ctx.strokeStyle = '#1A1A2E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 11, y - eyeH);
  ctx.quadraticCurveTo(x, y - eyeH - 3, x + 11, y - eyeH);
  ctx.stroke();
}