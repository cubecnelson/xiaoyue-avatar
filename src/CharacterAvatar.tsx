import { useEffect, useRef, useState } from 'react';

const MOUTH_PATHS: Record<number, string> = {
  0: 'M-8,2 Q0,2.5 8,2',
  1: 'M-10,0 Q0,8 10,0 Q0,5 -10,0',
  2: 'M-6,2 Q0,2 6,2',
  3: 'M-9,0 Q0,5 9,0 Q0,3 -9,0',
  5: 'M-7,1 Q0,6 7,1 Q0,3 -7,1',
  8: 'M-6,0 Q0,7 6,0 Q0,4 -6,0',
  11: 'M-6,3 Q0,7 6,3 Q0,1 -6,3',
  14: 'M-5,0 Q0,6 5,0 Q0,3 -5,0',
  16: 'M-7,0 Q0,6 7,0 Q0,3 -7,0',
  19: 'M-11,0 Q0,10 11,0 Q0,4 -11,0',
};

interface Props {
  speaking: boolean;
  visemeIndex: number;
}

export function CharacterAvatar({ speaking, visemeIndex = 0 }: Props) {
  const objectRef = useRef<HTMLObjectElement>(null);
  const [loaded, setLoaded] = useState(false);

  const mouthPath = MOUTH_PATHS[visemeIndex] || MOUTH_PATHS[0];

  // Apply animations to the SVG inside the object
  useEffect(() => {
    const obj = objectRef.current;
    if (!obj || !loaded) return;

    const svg = obj.contentDocument?.querySelector('svg');
    if (!svg) return;

    // Mouth
    const mouth = svg.querySelector('.mouth') as SVGPathElement;
    if (mouth) mouth.setAttribute('d', mouthPath);

    // Speaking state
    if (speaking) {
      svg.classList.add('speaking');
      svg.classList.remove('idle');
    } else {
      svg.classList.remove('speaking');
      svg.classList.add('idle');
    }
  }, [mouthPath, speaking, loaded]);

  // Blink
  useEffect(() => {
    const interval = setInterval(() => {
      const obj = objectRef.current;
      if (!obj || !loaded) return;
      const svg = obj.contentDocument?.querySelector('svg');
      if (!svg) return;

      svg.classList.add('blink');
      setTimeout(() => svg.classList.remove('blink'), 120);
    }, 3200);
    return () => clearInterval(interval);
  }, [loaded]);

  return (
    <object
      ref={objectRef}
      data="/xiaoyue-avatar/avatar.svg"
      type="image/svg+xml"
      style={{ width: '100%', maxWidth: 280, display: 'block', aspectRatio: '250/380' }}
      aria-label="XiaoYue avatar"
      onLoad={() => setLoaded(true)}
    >
      {/* Fallback */}
      <div style={{ width: 280, height: 426, background: '#FDF2F5', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48 }}>🌸</span>
      </div>
    </object>
  );
}