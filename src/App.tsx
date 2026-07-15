import { useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar';

// Preset Chinese sentences
const SENTENCES = [
  { text: '你好，欢迎来到小悦的世界！', label: '👋 问候' },
  { text: '今天天气真好，适合去打高尔夫。', label: '⛳ 高尔夫' },
  { text: '让我为你安排一个美好的下午茶。', label: '🍵 下午茶' },
  { text: '世界上所有的美好，都值得被温柔以待。', label: '✨ 语录' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', label: '💃 励志' },
  { text: '人生就像高尔夫，重要的不是打得有多远，而是每一杆都认真对待。', label: '🏌️ 感悟' },
  { text: '谢谢你一直以来的陪伴，我很开心能成为你的助手。', label: '💕 感恩' },
  { text: '不管遇到什么困难，我都会在你身边。加油！', label: '🌟 鼓励' },
];

// Declare wawa-lipsync types
declare global {
  interface Window {
    WawaLipsync?: {
      createEngine: (config: {
        onViseme: (data: { viseme: number; confidence: number }) => void;
        sampleRate?: number;
      }) => {
        processAudio: (buffer: Float32Array) => void;
        reset: () => void;
        destroy: () => void;
      };
    };
  }
}

function App() {
  const [speaking, setSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [visemeIndex, setVisemeIndex] = useState(0);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking'>('neutral');
  const [loading, setLoading] = useState(false);
  
  const lipsyncRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    analyserRef.current.connect(audioContextRef.current.destination);

    // Initialize wawa-lipsync engine
    tryInitLipsync();

    return () => {
      if (lipsyncRef.current) lipsyncRef.current.destroy();
      audioContextRef.current?.close();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  function tryInitLipsync() {
    if (typeof window !== 'undefined' && window.WawaLipsync) {
      lipsyncRef.current = window.WawaLipsync.createEngine({
        onViseme: (data: { viseme: number; confidence: number }) => {
          if (data.confidence > 0.1) {
            setVisemeIndex(data.viseme);
          }
        },
        sampleRate: 16000,
      });
    }
  }

  // Fallback lip sync: analyze audio energy from analyser node
  function startFallbackLipSync() {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function analyze() {
      analyser!.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      
      // Map energy to viseme (simple approach: loud → open mouth)
      const v = Math.min(21, Math.floor((avg / 128) * 7));
      setVisemeIndex(v > 0 ? v + 10 : 0);
      
      if (speaking) {
        animFrameRef.current = requestAnimationFrame(analyze);
      }
    }
    
    analyze();
  }

  async function speak(text: string) {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    setCurrentText(text);
    setLoading(true);
    setEmotion('thinking');

    const ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'suspended') await ctx?.resume();

    // Wait briefly for TTS voices to be ready
    await new Promise(r => setTimeout(r, 200));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95;
    utterance.pitch = 1.15;

    // Find the best Chinese female voice
    const voices = speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh') && v.name.includes('Tingting')) || // macOS Chinese
                    voices.find(v => v.lang.startsWith('zh-CN') && v.name.includes('Female')) ||
                    voices.find(v => v.lang.startsWith('zh-CN')) ||
                    voices.find(v => v.lang.startsWith('zh'));
    
    if (zhVoice) utterance.voice = zhVoice;

    // Create a MediaStreamSource from the TTS audio
    // Since SpeechSynthesis doesn't give direct audio access, 
    // use the analyser-based fallback for lip sync
    setSpeaking(true);
    setEmotion('happy');
    setLoading(false);
    startFallbackLipSync();

    utterance.onend = () => {
      setSpeaking(false);
      setVisemeIndex(0);
      setEmotion('neutral');
      cancelAnimationFrame(animFrameRef.current);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setVisemeIndex(0);
      setEmotion('neutral');
      cancelAnimationFrame(animFrameRef.current);
    };

    speechSynthesis.speak(utterance);
  }

  function stop() {
    speechSynthesis.cancel();
    setSpeaking(false);
    setVisemeIndex(0);
    setEmotion('neutral');
    cancelAnimationFrame(animFrameRef.current);
  }

  return (
    <div className="app">
      {/* Background */}
      <div className="bg" />
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="title">小悦</h1>
          <p className="subtitle">XiaoYue · AI 语音助手</p>
        </header>

        {/* Avatar */}
        <div className="avatar-wrapper">
          <div className={`avatar-ring ${speaking ? 'speaking' : ''}`}>
            <Avatar speaking={speaking} visemeIndex={visemeIndex} emotion={emotion} />
          </div>
          {speaking && (
            <div className="speaking-badge">
              <span className="dot" />
              正在说话...
            </div>
          )}
          {currentText && (
            <div className="current-text">
              <p>{currentText}</p>
            </div>
          )}
        </div>

        {/* Sentence buttons */}
        <div className="sentences">
          <h3>💬 点击试听</h3>
          <div className="sentences-grid">
            {SENTENCES.map((s, i) => (
              <button
                key={i}
                className={`sentence-btn ${speaking && currentText === s.text ? 'active' : ''}`}
                onClick={() => speak(s.text)}
                disabled={loading}
              >
                <span className="sentence-icon">{s.label.split(' ')[0]}</span>
                <span className="sentence-label">{s.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          {speaking && (
            <button className="stop-btn" onClick={stop}>
              ⏹ 停止
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>Rive + Wawa-Lipsync · React + TypeScript</p>
        </footer>
      </div>
    </div>
  );
}

export default App;