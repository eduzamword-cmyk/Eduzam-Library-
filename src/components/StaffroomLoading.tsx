import { useEffect } from 'react';
import { motion } from 'motion/react';

interface StaffroomLoadingProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
}

// Harmonious chime synthesizer for the loading screen
function playChimeSound(type: 'step' | 'complete' = 'step', stepIndex: number = 0) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'step') {
      const chimes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const freq = chimes[Math.min(stepIndex, chimes.length - 1)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'complete') {
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + idx * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.9);
      });
    }
  } catch {
    // Audio Context uninitialized or restricted by browser
  }
}

export default function StaffroomLoading({ onComplete, title, subtitle }: StaffroomLoadingProps) {
  useEffect(() => {
    // 2.8s smooth duration
    const duration = 2800;
    const startTime = Date.now();
    let lastStep = -1;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const step = Math.floor((elapsed / duration) * 5);
      if (step !== lastStep && step < 5) {
        lastStep = step;
        playChimeSound('step', step);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        playChimeSound('complete');
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  // 12 dots arranged radially in a circle
  const dotCount = 12;
  const radius = 38; // Radius of the dot circle in px

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-white/70 flex flex-col justify-center items-center p-0 m-0 overflow-hidden select-none backdrop-blur-md font-google-sans">
      
      {/* Soft Ambient Radial Background Glow */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(241, 245, 249, 0.9) 0%, rgba(255, 255, 255, 0.4) 100%)'
        }}
      />
      
      {/* Center Stage: Circle of Dots */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex flex-col items-center justify-center space-y-6"
      >
        {/* Circle of Dots Spinner */}
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Subtle central glow */}
          <div className="absolute inset-0 rounded-full bg-slate-300/30 blur-xl" />

          {/* Dots arranged around circle perimeter */}
          {Array.from({ length: dotCount }).map((_, idx) => {
            const angle = (idx / dotCount) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            return (
              <motion.div
                key={idx}
                animate={{
                  scale: [0.65, 1.35, 0.65],
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.1,
                  delay: (idx / dotCount) * 1.1,
                  ease: "easeInOut"
                }}
                className="absolute w-2.5 h-2.5 rounded-full bg-slate-900 shadow-2xs"
                style={{
                  left: `calc(50% + ${x}px - 5px)`,
                  top: `calc(50% + ${y}px - 5px)`
                }}
              />
            );
          })}
        </div>

        {/* Optional Title / Subtitle if provided */}
        {(title || subtitle) && (
          <div className="text-center space-y-1">
            {title && (
              <p className="text-xs sm:text-sm font-black text-slate-800 tracking-wider uppercase">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
