import { useEffect, useRef } from 'react';

// Viseme → mouth path mapping
const MOUTH_PATHS: Record<number, string> = {
  0: 'M-8,2 Q0,2.5 8,2',                                         // closed
  1: 'M-10,0 Q0,8 10,0 Q0,5 -10,0',                              // A (wide open)
  2: 'M-6,2 Q0,2 6,2',                                            // M/B/P
  3: 'M-9,0 Q0,5 9,0 Q0,3 -9,0',                                 // CH/J/SH
  4: 'M-8,1 Q0,4 8,1 Q0,2.5 -8,1',                               // D/T/L
  5: 'M-7,1 Q0,6 7,1 Q0,3 -7,1',                                 // E
  6: 'M-8,1 Q0,3 8,1 Q0,2 -8,1',                                 // F/V
  7: 'M-7,2 Q0,3 7,2',                                            // G/K
  8: 'M-6,0 Q0,7 6,0 Q0,4 -6,0',                                 // I
  9: 'M-9,1 Q0,3 9,1 Q0,2 -9,1',                                 // L/TH
  10: 'M-7,2 Q0,2.5 7,2',                                         // silence
  11: 'M-6,3 Q0,7 6,3 Q0,1 -6,3',                                // O
  12: 'M-5,2 Q0,6 5,2 Q0,1 -5,2',                                // OO
  13: 'M-6,1 Q0,5 6,1 Q0,2 -6,1',                                // R
  14: 'M-5,0 Q0,6 5,0 Q0,3 -5,0',                                // S/Z
  15: 'M-7,1 Q0,3 7,1 Q0,2 -7,1',                                // TH
  16: 'M-7,0 Q0,6 7,0 Q0,3 -7,0',                                // U
  17: 'M-4,2 Q0,4 4,2',                                           // W
  18: 'M-6,1 Q0,5 6,1 Q0,2 -6,1',                                // Y
  19: 'M-11,0 Q0,10 11,0 Q0,4 -11,0',                             // big open
};

interface Props {
  speaking: boolean;
  visemeIndex: number;
  emotion?: 'happy' | 'neutral' | 'thinking';
}

export function CharacterAvatar({ speaking, visemeIndex = 0 }: Props) {
  const mouthRef = useRef<SVGPathElement>(null);
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);
  const headRef = useRef<SVGGElement>(null);

  const mouthPath = MOUTH_PATHS[visemeIndex] || MOUTH_PATHS[0];

  // Smooth mouth transition
  useEffect(() => {
    if (mouthRef.current) {
      mouthRef.current.setAttribute('d', mouthPath);
    }
  }, [mouthPath]);

  // Blink animation
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setInterval>;
    if (leftEyeRef.current && rightEyeRef.current) {
      blinkTimer = setInterval(() => {
        const blink = () => {
          leftEyeRef.current?.setAttribute('ry', '2');
          rightEyeRef.current?.setAttribute('ry', '2');
          setTimeout(() => {
            leftEyeRef.current?.setAttribute('ry', '7');
            rightEyeRef.current?.setAttribute('ry', '7');
          }, 150);
        };
        blink();
      }, 3000 + Math.random() * 2000);
    }
    return () => clearInterval(blinkTimer);
  }, []);

  // Gentle idle animation
  useEffect(() => {
    if (headRef.current && !speaking) {
      const head = headRef.current;
      let frame: number;
      let t = 0;
      const animate = () => {
        t += 0.005;
        const y = Math.sin(t * 0.8) * 2;
        const r = Math.sin(t * 0.6) * 1.5;
        head.setAttribute('transform', `translate(0,${y}) rotate(${r}, 125, 50)`);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
  }, [speaking]);

  return (
    <svg
      viewBox="0 0 250 380"
      width="100%"
      style={{ maxWidth: 280, display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Hair gradient */}
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2D1B1B" />
          <stop offset="40%" stopColor="#3D2525" />
          <stop offset="100%" stopColor="#2D1B1B" />
        </linearGradient>
        {/* Skin gradient */}
        <radialGradient id="skinGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF0EB" />
          <stop offset="100%" stopColor="#F5D5C8" />
        </radialGradient>
        {/* Lip color */}
        <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E87D8A" />
          <stop offset="100%" stopColor="#D4606D" />
        </linearGradient>
        {/* Shirt */}
        <linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
        {/* Necklace shine */}
        <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8E8E8" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B0B0B0" />
        </linearGradient>
        {/* Shadow filter */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#00000020" />
        </filter>
      </defs>

      {/* ── Background circle ── */}
      <circle cx="125" cy="140" r="115" fill="#FDF2F5" />

      <g ref={headRef}>
        {/* ── Hair (back layer) ── */}
        <path d="M65,65 Q60,20 100,10 Q125,5 150,12 Q185,22 185,65 L185,140 Q185,155 175,165 L185,185 Q185,200 175,210 Q165,195 170,175 Q175,155 170,140 L168,130 Q170,100 165,68 Z"
          fill="url(#hairGrad)" />

        {/* ── Hair strands left side ── */}
        <path d="M68,65 Q62,40 65,20 Q68,38 72,65 Z" fill="#4A3030" opacity="0.4" />
        <path d="M70,100 Q60,120 55,150 Q58,130 68,105 Z" fill="url(#hairGrad)" />
        <path d="M70,130 Q58,160 55,195 Q62,165 73,135 Z" fill="url(#hairGrad)" />

        {/* ── Hair strands right side ── */}
        <path d="M180,100 Q190,125 195,155 Q188,130 178,105 Z" fill="url(#hairGrad)" />
        <path d="M178,130 Q192,165 195,200 Q186,170 175,138 Z" fill="url(#hairGrad)" />

        {/* ── Face ── */}
        <ellipse cx="125" cy="85" rx="52" ry="62" fill="url(#skinGrad)" />

        {/* ── Bangs ── */}
        <path d="M73,60 Q72,28 88,22 Q95,18 105,20 Q108,15 118,16 Q125,10 132,16 Q142,15 145,20 Q155,18 162,22 Q178,28 177,60 Q175,50 160,45 Q150,55 135,52 Q125,58 115,52 Q100,55 90,45 Q75,50 73,60 Z"
          fill="url(#hairGrad)" />
        {/* Bangs detail */}
        <path d="M88,22 Q90,42 95,47" stroke="#4A3030" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M108,20 Q110,42 108,50" stroke="#4A3030" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M125,14 Q125,40 125,52" stroke="#4A3030" strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M142,15 Q140,40 142,50" stroke="#4A3030" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M160,24 Q156,45 155,48" stroke="#4A3030" strokeWidth="0.5" fill="none" opacity="0.3" />

        {/* ── Blush ── */}
        <ellipse cx="95" cy="98" rx="12" ry="7" fill="#FFB6C1" opacity="0.3" />
        <ellipse cx="155" cy="98" rx="12" ry="7" fill="#FFB6C1" opacity="0.3" />

        {/* ── Eyebrows ── */}
        <path d="M88,72 Q100,68 115,72" stroke="#3D2525" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M135,72 Q150,68 162,72" stroke="#3D2525" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* ── Left eye ── */}
        <ellipse cx="107" cy="85" rx="12" ry="7" fill="white" />
        <ellipse ref={leftEyeRef} cx="107" cy="85" rx="12" ry="7" fill="white" />
        <circle cx="107" cy="85" r="6" fill="#3D2010" />
        <circle cx="107" cy="85" r="3.5" fill="#1A0A00" />
        <circle cx="109" cy="83" r="2" fill="white" />
        {/* Eyelashes */}
        <path d="M95,84 Q99,79 107,78" stroke="#2D1B1B" strokeWidth="1.2" fill="none" opacity="0.6" />
        <path d="M119,84 Q115,79 107,78" stroke="#2D1B1B" strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* ── Right eye ── */}
        <ellipse cx="143" cy="85" rx="12" ry="7" fill="white" />
        <ellipse ref={rightEyeRef} cx="143" cy="85" rx="12" ry="7" fill="white" />
        <circle cx="143" cy="85" r="6" fill="#3D2010" />
        <circle cx="143" cy="85" r="3.5" fill="#1A0A00" />
        <circle cx="145" cy="83" r="2" fill="white" />
        {/* Eyelashes */}
        <path d="M131,84 Q135,79 143,78" stroke="#2D1B1B" strokeWidth="1.2" fill="none" opacity="0.6" />
        <path d="M155,84 Q151,79 143,78" stroke="#2D1B1B" strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* ── Nose ── */}
        <path d="M125,92 Q120,102 122,108 Q125,110 128,108 Q130,102 125,92" fill="#F0C8B8" opacity="0.5" />
        {/* Nose highlight */}
        <ellipse cx="125" cy="96" rx="2" ry="3" fill="white" opacity="0.3" />

        {/* ── Mouth (animated) ── */}
        <path ref={mouthRef}
          d={mouthPath}
          fill="url(#lipGrad)"
          stroke="#D4606D"
          strokeWidth="0.8"
          transform="translate(125, 120)"
          style={{ transition: 'd 0.05s ease' }}
        />
        {/* Upper lip detail */}
        <path d="M-3,0 Q0,2 3,0" stroke="#C05060" strokeWidth="0.5" fill="none" opacity="0.4"
          transform="translate(125, 120)" />

        {/* ── Necklace chain ── */}
        <path d="M95,137 Q110,148 125,150 Q140,148 155,137"
          stroke="url(#silverGrad)" strokeWidth="1.5" fill="none" />
        {/* Heart pendant */}
        <path d="M125,153 Q125,148 128,145 Q131,142 133.5,145 Q136,148 136,153 Q136,158 125,165 Q114,158 114,153 Q114,148 116.5,145 Q119,142 122,145 Q124,148 125,153 Z"
          fill="#E8E8E8" stroke="#C0C0C0" strokeWidth="0.5" />
        <ellipse cx="122" cy="149" rx="1.5" ry="1" fill="white" opacity="0.5" />
      </g>

      {/* ── Shoulders / Body ── */}
      <g>
        {/* Neck */}
        <rect x="112" y="140" width="26" height="18" rx="8" fill="url(#skinGrad)" />

        {/* Left shoulder */}
        <path d="M78,185 Q60,195 50,240 Q48,270 55,310 L100,310 Q95,280 92,255 Q88,225 90,200 Z"
          fill="url(#shirtGrad)" stroke="#D8D8D8" strokeWidth="0.5" />
        {/* Right shoulder */}
        <path d="M172,185 Q190,195 200,240 Q202,270 195,310 L150,310 Q155,280 158,255 Q162,225 160,200 Z"
          fill="url(#shirtGrad)" stroke="#D8D8D8" strokeWidth="0.5" />

        {/* Collar */}
        <path d="M112,155 L95,185 L112,168 L125,175 L138,168 L155,185 L138,155"
          fill="url(#shirtGrad)" stroke="#D0D0D0" strokeWidth="0.8" />
        {/* Collar points */}
        <path d="M95,185 L98,195 L102,188" fill="white" stroke="#D0D0D0" strokeWidth="0.5" />
        <path d="M155,185 L152,195 L148,188" fill="white" stroke="#D0D0D0" strokeWidth="0.5" />

        {/* Shirt front buttons */}
        <circle cx="125" cy="195" r="2" fill="#D8D8D8" />
        <circle cx="125" cy="220" r="2" fill="#D8D8D8" />
        <circle cx="125" cy="245" r="2" fill="#D8D8D8" />

        {/* Tank top visible */}
        <rect x="115" y="170" width="20" height="20" rx="5" fill="#F5F5F5" opacity="0.8" />
      </g>

      {/* ── Hands holding photo ── */}
      <g>
        {/* Polaroid-style photo */}
        <rect x="95" y="270" width="60" height="72" rx="3" fill="white" stroke="#E0E0E0" strokeWidth="0.5"
          transform="rotate(-3, 125, 306)" filter="url(#softShadow)" />
        <rect x="101" y="278" width="48" height="48" rx="2" fill="#2A2A3A" transform="rotate(-3, 125, 306)" />
        {/* Photo content (people at table) */}
        <circle cx="115" cy="295" r="6" fill="#D4A574" transform="rotate(-3, 125, 306)" />
        <circle cx="125" cy="290" r="5" fill="#8B6B4A" transform="rotate(-3, 125, 306)" />
        <circle cx="135" cy="295" r="6" fill="#C49470" transform="rotate(-3, 125, 306)" />
        <rect x="118" y="300" width="14" height="10" rx="1" fill="#6B4423" transform="rotate(-3, 125, 306)" opacity="0.6" />

        {/* Left hand */}
        <rect x="82" y="285" width="22" height="16" rx="8" fill="url(#skinGrad)" transform="rotate(5, 90, 295)" />
        {/* Left fingers */}
        <ellipse cx="80" cy="282" rx="3" ry="7" fill="url(#skinGrad)" transform="rotate(-10, 80, 282)" />
        <ellipse cx="76" cy="280" rx="3" ry="7" fill="url(#skinGrad)" transform="rotate(-20, 76, 280)" />

        {/* Left wrist + bracelet */}
        <rect x="78" y="296" width="18" height="8" rx="4" fill="url(#skinGrad)" transform="rotate(5, 87, 300)" />
        <line x1="78" y1="298" x2="98" y2="298" stroke="#8B4513" strokeWidth="2.5" transform="rotate(5, 88, 298)" />
        <circle cx="83" cy="297" r="2" fill="#A0522D" transform="rotate(5, 88, 298)" />
        <circle cx="88" cy="297" r="2" fill="#8B4513" transform="rotate(5, 88, 298)" />
        <circle cx="93" cy="297" r="2" fill="#A0522D" transform="rotate(5, 88, 298)" />

        {/* Right hand */}
        <rect x="140" y="288" width="22" height="16" rx="8" fill="url(#skinGrad)" transform="rotate(-8, 155, 296)" />
        {/* Right fingers */}
        <ellipse cx="168" cy="285" rx="3" ry="7" fill="url(#skinGrad)" transform="rotate(10, 168, 285)" />
        <ellipse cx="172" cy="283" rx="3" ry="7" fill="url(#skinGrad)" transform="rotate(20, 172, 283)" />

        {/* Right wrist */}
        <rect x="142" y="300" width="18" height="8" rx="4" fill="url(#skinGrad)" transform="rotate(-8, 151, 304)" />
      </g>

      {/* ── Speaking glow ── */}
      {speaking && (
        <circle cx="125" cy="85" r="65" fill="none" stroke="#FF8FAA" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="r" values="65;72;65" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}