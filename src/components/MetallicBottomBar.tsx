import { motion } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, Bot } from 'lucide-react';

interface MetallicBottomBarProps {
  currentViewTitle?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onCenterClick?: () => void;
  centerSubtitle?: string;
}

export default function MetallicBottomBar({
  onPrev,
  onNext,
  onCenterClick,
}: MetallicBottomBarProps) {
  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-30 flex justify-center pointer-events-auto px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative group overflow-hidden rounded-full shadow-[0_12px_40px_rgba(2,12,32,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-cyan-600/50 bg-gradient-to-r from-[#030a17] via-[#08152e] to-[#030a17] p-[1px]"
      >
        {/* Animated Metallic Sweeping Highlight Beam */}
        <motion.div 
          animate={{ x: ['-120%', '240%'] }} 
          transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none blur-[2px]"
        />

        {/* Inner Metallic Pill Container - Two Circles Layout */}
        <div className="relative px-3 py-1.5 rounded-full bg-gradient-to-b from-[#050d1d] via-[#030a17] to-[#01050d] backdrop-blur-xl flex items-center gap-6 text-white">
          
          {/* Left Arrow Navigation - High Visibility */}
          <button 
            onClick={onPrev}
            aria-label="Previous View"
            className="w-8 h-8 rounded-full bg-cyan-950/70 hover:bg-cyan-500/30 border border-cyan-400/60 hover:border-cyan-300 text-cyan-200 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 shadow-sm"
          >
            <ChevronLeft className="w-4.5 h-4.5 stroke-[3]" />
          </button>

          {/* Right Arrow Navigation - High Visibility */}
          <button 
            onClick={onNext}
            aria-label="Next View"
            className="w-8 h-8 rounded-full bg-cyan-950/70 hover:bg-cyan-500/30 border border-cyan-400/60 hover:border-cyan-300 text-cyan-200 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 shadow-sm"
          >
            <ChevronRight className="w-4.5 h-4.5 stroke-[3]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
