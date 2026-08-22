import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  LogIn,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';

interface LandingPageProps {
  onSignInClick: () => void;
  onLaunchDemo: () => void;
  onBack?: () => void;
}

// Audio synthesizer for physics-based roll, fall, pop, bounce and chime sounds
class AudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Heavy metallic/organic drop impact sound
  playDropImpact(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      
      // Low bass thud
      const oscThud = ctx.createOscillator();
      const gainThud = ctx.createGain();
      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(140, t);
      oscThud.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      gainThud.gain.setValueAtTime(0.2, t);
      gainThud.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      oscThud.connect(gainThud);
      gainThud.connect(ctx.destination);
      oscThud.start(t);
      oscThud.stop(t + 0.25);

      // Metallic impact click
      const oscMetal = ctx.createOscillator();
      const gainMetal = ctx.createGain();
      oscMetal.type = 'triangle';
      oscMetal.frequency.setValueAtTime(620, t);
      oscMetal.frequency.exponentialRampToValueAtTime(180, t + 0.15);
      gainMetal.gain.setValueAtTime(0.12, t);
      gainMetal.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      oscMetal.connect(gainMetal);
      gainMetal.connect(ctx.destination);
      oscMetal.start(t);
      oscMetal.stop(t + 0.15);
    } catch {
      // ignore audio context restrictions
    }
  }

  // 2. Sequential crystal letter pop sound as letters form
  playLetterPop(index: number, enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
      const freq = notes[index] || 440;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);

      // Harmonic harmonic sparkle overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, t);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.04, t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.2);
    } catch {
      // ignore
    }
  }

  // 3. Elastic bounce contact sound
  playBounce(intensity: number, enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 * intensity + 80, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.1);

      gain.gain.setValueAtTime(0.15 * intensity, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // ignore
    }
  }

  // 4. Harmonic resolution chime at rest
  playRestChime(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const chord = [
        { freq: 523.25, delay: 0.00, gain: 0.08, dur: 1.6 }, // C5
        { freq: 659.25, delay: 0.04, gain: 0.08, dur: 1.6 }, // E5
        { freq: 783.99, delay: 0.08, gain: 0.08, dur: 1.8 }, // G5
        { freq: 1046.50, delay: 0.12, gain: 0.07, dur: 2.0 }, // C6
        { freq: 1318.51, delay: 0.16, gain: 0.06, dur: 2.2 }, // E6
        { freq: 1567.98, delay: 0.20, gain: 0.05, dur: 2.4 }, // G6
      ];

      chord.forEach(({ freq, delay, gain, dur }) => {
        const startTime = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        oscGain.gain.setValueAtTime(0, startTime);
        oscGain.gain.linearRampToValueAtTime(gain, startTime + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch {
      // ignore
    }
  }

  // Simple button click chime
  playClick(enabled: boolean) {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // ignore
    }
  }
}

const audioEngine = new AudioEngine();

export default function LandingPage({ onSignInClick, onBack }: LandingPageProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<number[]>([]);
  const [showM, setShowM] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const letters = ['E', 'D', 'U', 'Z', 'A'];

  // Start sequence whenever animKey updates
  useEffect(() => {
    // Clear previous timers
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setRevealedLetters([]);
    setShowM(false);
    setIsResting(false);

    // Timeline Schedule:
    // 0.0s: Start drop from top
    // 0.45s: Land at left (Drop Impact Sound)
    const tDrop = window.setTimeout(() => {
      audioEngine.playDropImpact(soundEnabled);
    }, 450);
    timeoutsRef.current.push(tDrop);

    // Roll starts at 0.5s -> arrives past letters
    // 0.75s: Passes E
    const tE = window.setTimeout(() => {
      setRevealedLetters(prev => [...prev, 0]);
      audioEngine.playLetterPop(0, soundEnabled);
    }, 750);
    timeoutsRef.current.push(tE);

    // 0.98s: Passes D
    const tD = window.setTimeout(() => {
      setRevealedLetters(prev => [...prev, 1]);
      audioEngine.playLetterPop(1, soundEnabled);
    }, 980);
    timeoutsRef.current.push(tD);

    // 1.22s: Passes U
    const tU = window.setTimeout(() => {
      setRevealedLetters(prev => [...prev, 2]);
      audioEngine.playLetterPop(2, soundEnabled);
    }, 1220);
    timeoutsRef.current.push(tU);

    // 1.45s: Passes Z
    const tZ = window.setTimeout(() => {
      setRevealedLetters(prev => [...prev, 3]);
      audioEngine.playLetterPop(3, soundEnabled);
    }, 1450);
    timeoutsRef.current.push(tZ);

    // 1.68s: Passes A
    const tA = window.setTimeout(() => {
      setRevealedLetters(prev => [...prev, 4]);
      audioEngine.playLetterPop(4, soundEnabled);
    }, 1680);
    timeoutsRef.current.push(tA);

    // 1.90s: Circle reaches end of EDUZA -> Letter 'M' appears right before bouncing!
    const tM = window.setTimeout(() => {
      setShowM(true);
      audioEngine.playLetterPop(5, soundEnabled);
    }, 1900);
    timeoutsRef.current.push(tM);

    // 1.95s: Circle finishes rolling and starts bouncing up and down after 'A'
    // Bounce 1 impact
    const tB1 = window.setTimeout(() => {
      audioEngine.playBounce(1.0, soundEnabled);
    }, 2250);
    timeoutsRef.current.push(tB1);

    // Bounce 2 impact
    const tB2 = window.setTimeout(() => {
      audioEngine.playBounce(0.65, soundEnabled);
    }, 2550);
    timeoutsRef.current.push(tB2);

    // Bounce 3 impact
    const tB3 = window.setTimeout(() => {
      audioEngine.playBounce(0.35, soundEnabled);
    }, 2800);
    timeoutsRef.current.push(tB3);

    // Rest at 3.0s (Chime)
    const tRest = window.setTimeout(() => {
      setIsResting(true);
      audioEngine.playRestChime(soundEnabled);
    }, 3000);
    timeoutsRef.current.push(tRest);

    // 4.0s Loader Complete -> proceed to Sign In
    const tComplete = window.setTimeout(() => {
      onSignInClick();
    }, 4000);
    timeoutsRef.current.push(tComplete);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [animKey, soundEnabled, onSignInClick]);

  const handleReplay = () => {
    setAnimKey(prev => prev + 1);
  };

  const handlePortalEnter = () => {
    audioEngine.playClick(soundEnabled);
    onSignInClick();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-slate-100 text-slate-900 font-sans flex flex-col justify-between p-6 sm:p-12 overflow-x-hidden relative selection:bg-blue-100 selection:text-blue-950">
      
      {/* Background Soft Atmospheric Ambient Glows - Harmonized Executive Palette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Return to Front Cover"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Cover</span>
            </button>
          )}
          <button 
            onClick={handlePortalEnter}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
            title="Sign In"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-800">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Sign In</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Replay Animation Button */}
          <button
            onClick={handleReplay}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-full border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Replay Entrance Animation"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline text-slate-600">Replay</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) audioEngine.playRestChime(true);
            }}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-full border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline text-slate-600">{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={handlePortalEnter}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-200" />
            Sign In
          </button>
        </div>
      </header>

      {/* Main Center Stage: Animated Physics Logo Sequence */}
      <main className="w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center relative z-10 py-8">
        
        {/* Physics Stage Container */}
        <div 
          key={animKey}
          onClick={handleReplay}
          className="relative flex items-center justify-center select-none cursor-pointer px-4 pt-2 pb-1 group"
          title="Click to replay animation"
        >
          {/* Letters Track Container: 'E', 'D', 'U', 'Z', 'A' */}
          <div className="flex items-center tracking-tight">
            {letters.map((letter, idx) => {
              const isRevealed = revealedLetters.includes(idx);
              return (
                <div key={idx} className="relative inline-flex items-center justify-center min-w-[1.2ch] sm:min-w-[1.3ch]">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.3, y: 12, filter: 'blur(4px)' }}
                    animate={isRevealed ? { 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      filter: 'blur(0px)'
                    } : { 
                      opacity: 0, 
                      scale: 0.3, 
                      y: 12, 
                      filter: 'blur(4px)'
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 22,
                      mass: 0.8
                    }}
                    className="text-3xl sm:text-5xl md:text-6xl font-black font-sans bg-gradient-to-b from-stone-700 via-stone-900 to-black bg-clip-text text-transparent drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.35)] leading-none select-none"
                  >
                    {letter}
                  </motion.span>
                </div>
              );
            })}
          </div>

          {/* 3D Metallic Precision Circle with Letter M inside (Harmonized with canvas & typography) */}
          <motion.div
            initial={{ 
              x: -240, 
              y: -260, 
              rotate: -360,
              opacity: 1
            }}
            animate={{
              // Sequence:
              // 0s-0.45s: Fall down to y:0 at left (x: -240)
              // 0.45s-1.95s: Roll to the right past letters to x: 0
              // 1.95s-3.0s: Bounce up and down after 'A' until resting!
              x: [-240, -240, 0, 0, 0, 0, 0, 0],
              y: [-260, 0, 0, -45, 0, -22, 0, -9, 0],
              rotate: [-360, 0, 720, 720, 720, 720, 720, 720, 720]
            }}
            transition={{
              duration: 3.0,
              times: [0, 0.15, 0.65, 0.74, 0.82, 0.88, 0.94, 0.97, 1.0],
              ease: [
                "easeIn",    // 0 -> 0.15 (fall acceleration)
                "linear",    // 0.15 -> 0.65 (smooth roll to right)
                "easeOut",   // rise bounce 1
                "easeIn",    // fall bounce 1
                "easeOut",   // rise bounce 2
                "easeIn",    // fall bounce 2
                "easeOut",   // rise bounce 3
                "easeIn"     // settle
              ]
            }}
            className="relative inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ml-1.5 sm:ml-2.5 shadow-[0_12px_28px_rgba(29,78,216,0.3),0_4px_10px_rgba(15,23,42,0.15)]"
          >
            {/* Outer metallic sapphire-silver bevel ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200 via-blue-400 via-blue-700 to-indigo-950 p-[2.5px] sm:p-[3px] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.65)]">
              {/* Inner rich deep royal-blue brushed face */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-950 via-blue-800 via-blue-600 to-sky-400 flex items-center justify-center relative overflow-hidden">
                
                {/* Rotating light sweep sheen */}
                <motion.div 
                  animate={{ 
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.6)_0%,transparent_65%)] pointer-events-none" 
                />
                
                {/* 3D Specular Light Sheen Highlight */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/60 via-sky-100/25 to-transparent rounded-full pointer-events-none blur-[0.5px]" />
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-blue-950/60 to-transparent pointer-events-none" />
                
                {/* 3D Embossed Metallic Letter 'M' - Appears when circle reaches end of Eduza */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.2, filter: 'blur(4px)' }}
                  animate={showM ? { 
                    opacity: 1, 
                    scale: 1, 
                    filter: 'blur(0px)' 
                  } : { 
                    opacity: 0, 
                    scale: 0.2, 
                    filter: 'blur(4px)' 
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 20
                  }}
                  className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-b from-white via-slate-100 to-slate-200 bg-clip-text text-transparent leading-none tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-sans select-none"
                >
                  M
                </motion.span>
              </div>
            </div>

            {/* Resting Aura Sparkle when settled */}
            {isResting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.9, 1.3, 1.4] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 rounded-full border-2 border-blue-400/50 pointer-events-none"
              />
            )}
          </motion.div>
        </div>

        {/* Thin Orange-Amber Progress Bar (Exactly 4.0 seconds) */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center justify-center mt-2.5 sm:mt-3.5">
          <div 
            onClick={handlePortalEnter}
            className="w-48 sm:w-64 h-[3px] sm:h-[3.5px] bg-slate-200/90 rounded-full overflow-hidden relative shadow-inner cursor-pointer"
            title="Loading EDUZAM Portal..."
          >
            <motion.div
              key={animKey}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4.0, ease: "linear" }}
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.85)]"
            />
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-center py-4 border-t border-slate-200/80 text-xs text-slate-400 font-medium z-10">
        <span>© 2026 EDUZAM • All rights reserved</span>
      </footer>
    </div>
  );
}



