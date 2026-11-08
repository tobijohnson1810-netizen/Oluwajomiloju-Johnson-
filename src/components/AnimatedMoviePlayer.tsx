import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MovieData, MovieScene, ActorAnimation } from '../types';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Clapperboard, Download, Film, Sparkles } from 'lucide-react';

interface AnimatedMoviePlayerProps {
  movieData: MovieData;
  className?: string;
}

export const AnimatedMoviePlayer: React.FC<AnimatedMoviePlayerProps> = ({ movieData, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneTime, setSceneTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Start paused for stability & user control
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const scenes = movieData?.scenes && movieData.scenes.length > 0 ? movieData.scenes : [];
  const currentScene: MovieScene | undefined = scenes[currentSceneIndex] || scenes[0];
  const sceneDuration = currentScene?.duration || 7;

  // Derive active dialogue directly during render without any setState or useEffect
  const activeDialogue = currentScene?.dialogue?.find(
    (d) => sceneTime >= d.startSec && sceneTime <= d.startSec + d.durationSec
  ) || null;

  // Web Audio Context reference for cinematic generative soundscape
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize Web Audio
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Update sound mood
  useEffect(() => {
    if (isMuted || !isPlaying || !currentScene) {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
      }
      return;
    }

    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;

      if (!oscRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      }

      // Frequency map based on mood
      let targetFreq = 130.81; // C3
      if (currentScene.audioMood === 'heroic') targetFreq = 196.0; // G3
      if (currentScene.audioMood === 'energetic') targetFreq = 261.63; // C4
      if (currentScene.audioMood === 'tense') targetFreq = 110.0; // A2
      if (currentScene.audioMood === 'peaceful') targetFreq = 164.81; // E3

      if (oscRef.current && gainRef.current) {
        oscRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.3);
        gainRef.current.gain.setTargetAtTime(0.06, ctx.currentTime, 0.2);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [isMuted, isPlaying, currentSceneIndex, currentScene?.audioMood, initAudio]);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const deltaSec = Math.min(((stamp - lastStamp) / 1000) * speed, 0.1);
      lastStamp = stamp;

      let shouldAdvanceScene = false;
      setSceneTime((prev) => {
        const next = prev + deltaSec;
        if (next >= sceneDuration) {
          shouldAdvanceScene = true;
          return 0;
        }
        return next;
      });

      if (shouldAdvanceScene && scenes.length > 0) {
        setCurrentSceneIndex((prevIdx) => (prevIdx + 1) % scenes.length);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, sceneDuration, speed, scenes.length]);

  // Particle generator reference
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }>>([]);

  // Initialize particles when scene changes
  useEffect(() => {
    const pCount = currentScene?.particles?.count || 40;
    const pSpeed = currentScene?.particles?.speed || 1;
    const type = currentScene?.particles?.type || 'stars';

    const pts = [];
    for (let i = 0; i < pCount; i++) {
      pts.push({
        x: Math.random() * 800,
        y: Math.random() * 450,
        vx: (Math.random() - 0.5) * pSpeed * (type === 'lasers' ? 4 : 1),
        vy: type === 'snow' ? Math.random() * pSpeed + 0.5 : (Math.random() - 0.5) * pSpeed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    particlesRef.current = pts;
  }, [currentSceneIndex, currentScene?.particles?.count, currentScene?.particles?.type]);

  // Render Canvas Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const progress = Math.min(sceneTime / sceneDuration, 1);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // 1. SKY GRADIENT
    const sky = currentScene.background?.skyGradient || ['#020617', '#1e293b'];
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, sky[0]);
    skyGrad.addColorStop(1, sky[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. CELESTIAL BODY
    const celestial = currentScene.background?.celestialBody || 'stars';
    if (celestial === 'ringed_planet') {
      const px = 640 - progress * 40;
      const py = 110;
      // Glow
      const glow = ctx.createRadialGradient(px, py, 15, px, py, 90);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 90, 0, Math.PI * 2);
      ctx.fill();

      // Planet body
      ctx.beginPath();
      ctx.arc(px, py, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      // Ring
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 16, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (celestial === 'moon') {
      const mx = 620;
      const my = 90;
      ctx.beginPath();
      ctx.arc(mx, my, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (celestial === 'neon_grid') {
      // Synthwave / Cyberpunk neon grid horizon
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.45);
        ctx.lineTo(i * 1.5 - 200, h);
        ctx.stroke();
      }
      for (let y = h * 0.55; y <= h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // 3. BACKGROUND LANDSCAPE
    const landscape = currentScene.background?.landscapeType || 'mountains';
    if (landscape === 'mountains') {
      // Distant mountain ridge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(120, h * 0.45);
      ctx.lineTo(260, h * 0.6);
      ctx.lineTo(440, h * 0.4);
      ctx.lineTo(600, h * 0.55);
      ctx.lineTo(800, h * 0.42);
      ctx.lineTo(800, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Foreground terrain
      ctx.fillStyle = currentScene.background?.groundColor || '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.75);
      ctx.quadraticCurveTo(w * 0.35, h * 0.68, w * 0.7, h * 0.78);
      ctx.quadraticCurveTo(w * 0.85, h * 0.82, w, h * 0.74);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
    } else if (landscape === 'alien_crystals') {
      // Crystalline landscape
      ctx.fillStyle = currentScene.background?.groundColor || '#0a0f1d';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      // Glowing crystals
      const crystals = [
        { x: 140, h: 90, color: '#38bdf8' },
        { x: 175, h: 60, color: '#818cf8' },
        { x: 620, h: 110, color: '#a855f7' },
        { x: 670, h: 75, color: '#38bdf8' },
        { x: 380, h: 50, color: '#22d3ee' },
      ];
      crystals.forEach((c) => {
        ctx.save();
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(c.x, h * 0.74);
        ctx.lineTo(c.x + 12, h * 0.74 - c.h);
        ctx.lineTo(c.x + 24, h * 0.74);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    } else if (landscape === 'city_skyline') {
      // Futuristic skyline
      ctx.fillStyle = '#090d16';
      for (let bx = 0; bx < w; bx += 55) {
        const bHeight = 120 + ((bx * 37) % 150);
        ctx.fillRect(bx, h * 0.75 - bHeight, 48, bHeight);

        // Windows
        ctx.fillStyle = '#38bdf8';
        for (let wy = h * 0.75 - bHeight + 15; wy < h * 0.75 - 20; wy += 20) {
          ctx.fillRect(bx + 10, wy, 8, 8);
          ctx.fillRect(bx + 28, wy, 8, 8);
        }
        ctx.fillStyle = '#090d16';
      }
      ctx.fillStyle = currentScene.background?.groundColor || '#020617';
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
    } else {
      // Default ground
      ctx.fillStyle = currentScene.background?.groundColor || '#1e293b';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
    }

    // 4. PARTICLES
    ctx.save();
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity})`;
      ctx.fill();
    });
    ctx.restore();

    // 5. RENDER ACTORS & CHARACTER ANIMATIONS
    currentScene.actors.forEach((actor) => {
      renderActor(ctx, actor, progress, w, h);
    });

    // 6. CINEMATIC LETTERBOX BARS
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, 22);
    ctx.fillRect(0, h - 22, w, 22);

    // Watermark tag in letterbox
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${movieData.title.toUpperCase()} // SCENE ${currentSceneIndex + 1}`, 20, 15);
    ctx.fillText(`SMART X CINEMA STUDIO`, w - 150, 15);
  }, [sceneTime, currentSceneIndex, currentScene, sceneDuration, movieData.title]);

  // Actor rendering helper function
  const renderActor = (
    ctx: CanvasRenderingContext2D,
    actor: ActorAnimation,
    progress: number,
    w: number,
    h: number
  ) => {
    // Interpolate position
    const curX = ((actor.startX + (actor.endX - actor.startX) * progress) / 100) * w;
    const curY = ((actor.startY + (actor.endY - actor.startY) * progress) / 100) * h;
    const scale = actor.scale || 1.0;

    ctx.save();
    ctx.translate(curX, curY);
    ctx.scale(scale, scale);

    const bob = Math.sin(sceneTime * 6) * 4;

    if (actor.type === 'robot') {
      // Robot body
      ctx.translate(0, bob);

      // Thruster flame
      ctx.beginPath();
      ctx.moveTo(-8, 22);
      ctx.lineTo(0, 36 + Math.random() * 8);
      ctx.lineTo(8, 22);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Chassis
      ctx.fillStyle = actor.color || '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-20, -15, 40, 34, 10);
      ctx.fill();

      // Screen visor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 14, 4);
      ctx.fill();

      // Glowing eyes
      ctx.fillStyle = '#67e8f9';
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-6, -1, 3, 0, Math.PI * 2);
      ctx.arc(6, -1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Antenna
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(0, -25);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -27, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      // Scan beam action
      if (actor.action === 'scan') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(50, 40);
        ctx.lineTo(90, 20);
        ctx.closePath();
        ctx.fill();
      }
    } else if (actor.type === 'alien') {
      // Lumina / Alien ethereal entity
      const pulse = Math.sin(sceneTime * 4) * 0.15 + 1;
      ctx.scale(pulse, pulse);

      // Shifting aura
      const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
      aura.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
      aura.addColorStop(0.5, 'rgba(192, 132, 252, 0.3)');
      aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Floating tendrils
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI) / 2.5 + sceneTime * 2;
        const tx = Math.cos(angle) * 22;
        const ty = Math.sin(angle) * 22;
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (actor.type === 'astronaut') {
      // Astronaut
      ctx.translate(0, bob);
      // Spacesuit torso
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 38, 8);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(0, -22, 18, 0, Math.PI * 2);
      ctx.fill();

      // Visor gold reflection
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, -22, 12, 0, Math.PI * 2);
      ctx.fill();

      // Backpack
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-22, -8, 6, 26);
    } else {
      // Stylized character
      ctx.fillStyle = actor.color || '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, -20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-12, -4, 24, 30);
    }

    // Name label above character
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(actor.name, 0, -42);

    ctx.restore();
  };

  const handleExportScript = () => {
    const script = {
      title: movieData.title,
      logline: movieData.logline,
      artStyle: movieData.artStyle,
      scenes: movieData.scenes.map((s, idx) => ({
        sceneNumber: idx + 1,
        title: s.title,
        durationSeconds: s.duration,
        background: s.background,
        actors: s.actors.map((a) => `${a.name} (${a.type}): ${a.action}`),
        dialogue: s.dialogue,
      })),
    };

    const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${movieData.title.toLowerCase().replace(/\s+/g, '_')}_script.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full my-4 rounded-2xl border border-blue-200/90 dark:border-blue-900/60 bg-slate-950 text-white shadow-xl overflow-hidden ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {movieData.title}
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {movieData.artStyle?.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">{movieData.logline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scene selector tabs */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {scenes.map((sc, idx) => (
              <button
                key={sc.id || idx}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  setSceneTime(0);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currentSceneIndex === idx
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Scene {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportScript}
            title="Download Movie Script & Config"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Cinema Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain block"
        />

        {/* Dynamic Live Subtitle Banner */}
        {activeDialogue && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 max-w-[85%] px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-blue-500/40 text-center shadow-2xl transition-all duration-200 animate-fadeIn">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-0.5">
              {activeDialogue.speaker}
            </span>
            <p className="text-sm md:text-base text-slate-100 font-medium leading-snug">
              "{activeDialogue.text}"
            </p>
          </div>
        )}
      </div>

      {/* Playback & Director Timeline Bar */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2.5">
        {/* Scrubber slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 tabular-nums w-10 text-right">
            {sceneTime.toFixed(1)}s
          </span>
          <input
            type="range"
            min={0}
            max={sceneDuration}
            step={0.1}
            value={sceneTime}
            onChange={(e) => {
              setSceneTime(parseFloat(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs font-mono text-slate-400 tabular-nums w-10">
            {sceneDuration.toFixed(1)}s
          </span>
        </div>

        {/* Controls strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => setSceneTime(0)}
              title="Restart Scene"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                initAudio();
                setIsMuted(!isMuted);
              }}
              title={isMuted ? 'Unmute Cinematic Soundscape' : 'Mute Sound'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                !isMuted ? 'text-blue-400 bg-blue-950/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="text-xs text-slate-400 hidden sm:block">
              Scene: <span className="text-slate-200 font-medium">{currentScene?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
              className="px-2 py-1 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {speed}x
            </button>

            <button
              onClick={toggleFullscreen}
              title="Fullscreen Cinema"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
