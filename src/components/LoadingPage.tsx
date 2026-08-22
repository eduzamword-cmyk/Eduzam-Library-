import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Sparkles, ShieldCheck, Volume2, VolumeX } from 'lucide-react';

interface LoadingPageProps {
  onComplete?: () => void;
  message?: string;
}

// Web Audio API Sound Synthesizer with ascending pitches
function playLoadingSound(type: 'step' | 'complete' = 'step', soundEnabled: boolean = true, stepIndex: number = 0) {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'step') {
      // Ascending pitch scale based on step index
      const baseFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      const freq = baseFreqs[Math.min(stepIndex, baseFreqs.length - 1)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.12); // Ascending glissando
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === 'complete') {
      // Ascending grand major arpeggio cascade
      const freqs = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // E4 -> E6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.6);
      });
    }
  } catch {
    // Web audio API not available or user hasn't interacted
  }
}

export default function LoadingPage({ onComplete, message = "Initializing EDUZAM Portal..." }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const loadingSteps = [
    "Establishing secure connection to Ministry servers...",
    "Synchronizing 10 Provincial Repositories...",
    "Loading Official National Markbook anti-tamper schemas...",
    "Indexing CDC Curriculum & Scheme models...",
    "Authenticating Level 5 Super Admin privileges...",
    "System Ready. Welcome to EDUZAM Portal."
  ];

  useEffect(() => {
    const startTime = Date.now();
    const DURATION = 4000; // Exactly 4.0 seconds
    let lastStep = 0;
    let completed = false;

    const timer = setInterval(() => {
      if (completed) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(pct);

      const stepIdx = Math.min(
        loadingSteps.length - 1,
        Math.floor((elapsed / DURATION) * loadingSteps.length)
      );
      
      if (stepIdx !== lastStep) {
        lastStep = stepIdx;
        setCurrentStep(stepIdx);
        playLoadingSound('step', soundEnabled, stepIdx);
      }

      if (elapsed >= DURATION) {
        completed = true;
        clearInterval(timer);
        playLoadingSound('complete', soundEnabled);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, 40);

    return () => clearInterval(timer);
  }, [soundEnabled]); // Remove onComplete from dependencies to prevent restarts

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans select-none overflow-hidden">
      
      {/* Background Soft Blue Ambient Blended Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/30 via-blue-600/30 to-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Label */}
      <div className="w-full flex items-center justify-between z-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-300">
            MINISTRY OF EDUCATION COMMAND CENTER
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-blue-900/60 hover:bg-blue-800 text-cyan-300 rounded-full border border-cyan-500/30 text-xs font-bold transition-all"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
          <span className="text-xs font-mono text-cyan-200 font-bold bg-blue-900/80 px-3 py-1 rounded-full border border-cyan-500/30">
            EDUZAM v2026
          </span>
        </div>
      </div>

      {/* Center Stage: Big Circular Loader in Blended Blue Colours */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center space-y-8 relative z-10">
        
        {/* Big Circular Loader Container */}
        <div 
          onClick={() => {
            playLoadingSound('complete', soundEnabled);
            onComplete && onComplete();
          }}
          className="relative flex items-center justify-center cursor-pointer group scale-100 hover:scale-105 transition-transform duration-300"
          title="Click to enter portal immediately"
        >
          {/* Outer Blended Blue Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 via-indigo-500 to-sky-400 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity animate-pulse" />

          {/* Rotating Outer Conic Gradient Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            className="w-48 h-48 sm:w-60 sm:h-60 rounded-full p-[6px] bg-gradient-to-tr from-cyan-400 via-blue-500 via-indigo-500 via-sky-400 to-blue-600 shadow-[0_10px_40px_rgba(14,165,233,0.4)] relative"
          >
            {/* Inner Dark Cutout Mask */}
            <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-full flex items-center justify-center p-3">
              {/* Secondary Counter-Rotating Dash Circle */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
                className="w-full h-full rounded-full border-4 border-dashed border-cyan-400/60 flex items-center justify-center"
              />
            </div>
          </motion.div>

          {/* Center Centerpiece Content inside Circular Loader */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 mb-1">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
              {progress}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              LOADING
            </span>
          </div>
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-serif">
            EDUZAM PORTAL
          </h1>
          <p className="text-xs sm:text-sm font-bold text-cyan-300/90 uppercase tracking-widest max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Step Indicator & Progress Bar */}
        <div className="w-full space-y-3 px-4">
          <div className="h-6 flex items-center justify-center">
            <p className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              {loadingSteps[currentStep]}
            </p>
          </div>

          {/* Blue Progress Bar */}
          <div className="w-full h-2.5 bg-blue-950/80 rounded-full border border-blue-800/80 overflow-hidden p-0.5 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-sm"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 pt-4 border-t border-blue-900/60 z-10 max-w-5xl mx-auto">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        MINISTRY OF EDUCATION COMMAND CENTER
      </div>
    </div>
  );
}

