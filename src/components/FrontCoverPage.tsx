import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  LogIn, 
  Landmark,
  Compass,
  MapPin,
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  Sliders,
  Mail,
  Phone
} from 'lucide-react';

interface FrontCoverPageProps {
  onEnter: () => void;
  onLessonPlanner: () => void;
}

// Subtle elegant audio synthesizer for portal entry
function playFrontSound(type: 'click' | 'enter' = 'click', enabled: boolean = true) {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const t = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } else {
      // Grand chord arpeggio
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.05);
        gain.gain.setValueAtTime(0.15, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.4);
      });
    }
  } catch {
    // Audio context may be restricted before interaction
  }
}

export default function FrontCoverPage({ onEnter, onLessonPlanner }: FrontCoverPageProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [coverLogo, setCoverLogo] = useState<string | null>(() => localStorage.getItem('eduzam_cover_logo'));
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = () => {
    playFrontSound('enter', soundEnabled);
    onEnter();
  };

  const handleLessonPlanner = () => {
    playFrontSound('click', soundEnabled);
    onLessonPlanner();
  };

  // Logo Image Upload Handlers
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (dataUrl) => {
      setCoverLogo(dataUrl);
      try {
        localStorage.setItem('eduzam_cover_logo', dataUrl);
      } catch (err) {
        console.warn('Cover logo storage quota:', err);
      }
    });
    e.target.value = '';
  };

  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    // Validate file size (limit uploadable image size to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Selected image exceeds 2MB limit. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Compact image dimensions for efficient storage and fast rendering
        const maxDim = 400;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          callback(compressed);
        } else {
          callback(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCoverLogo(null);
    localStorage.removeItem('eduzam_cover_logo');
  };

  const provinces = [
    'Lusaka', 'Copperbelt', 'Southern', 'Eastern', 
    'Central', 'Northern', 'Luapula', 'Muchinga', 
    'North-Western', 'Western'
  ];

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950"
    >
      {/* Hidden File Input for Top-Left Logo */}
      <input 
        ref={logoInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleLogoFileSelect}
      />

      {/* Subtle Ambient Lighting Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-teal-950/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 gap-4 flex-wrap">
        {/* Top-Left: Institution Emblem / Custom Logo Upload */}
        <div className="flex items-center gap-3 group/logo">
          <div className="relative">
            <div className="w-12 h-12 rounded-[8px] bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center overflow-hidden">
              {coverLogo ? (
                <img 
                  src={coverLogo} 
                  alt="Institution Emblem" 
                  className="w-full h-full object-cover rounded-[6px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-slate-900/95 rounded-[6px] flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-emerald-400" />
                </div>
              )}
            </div>
            
            {/* Quick Upload Trigger on Logo */}
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="Upload Custom Top-Left Logo / Emblem (Max 2MB)"
              aria-label="Upload Top-Left Logo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-400 uppercase drop-shadow-sm">
                EDUZAM NATIONAL SYSTEM
              </span>
              {coverLogo && (
                <button
                  onClick={handleResetLogo}
                  className="text-[10px] text-slate-300 hover:text-rose-400 underline transition-colors cursor-pointer"
                  title="Reset to default emblem"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Audio */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 text-slate-200 transition-all cursor-pointer backdrop-blur-md"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
            aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Central Stage */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 sm:py-12 z-20 flex flex-col items-center text-center">
        
        {/* Hero Title & Identity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-4 max-w-3xl"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-sans drop-shadow-lg">
            EDUZAM
          </h1>
          
          <p className="text-lg sm:text-2xl font-semibold text-slate-100 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            National Unified Educational Management & Examination Command System
          </p>

          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-medium drop-shadow-sm">
            Integrating 10 Provincial Education Directorates, CDC Curriculum Schemes, Anti-Tamper ECZ Markbooks, and Real-Time School Administration across Zambia.
          </p>
        </motion.div>

        {/* Action Buttons: Blue Enter EDUZAM Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-col items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 w-full sm:w-auto"
        >
          {/* Blue Enter EDUZAM Button */}
          <button
            onClick={handleEnter}
            className="w-full sm:w-auto px-12 sm:px-16 py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:from-blue-700 active:to-indigo-800 text-white font-black text-lg sm:text-2xl tracking-wider transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-blue-900/60 border border-blue-400/40 flex items-center justify-center gap-3.5 cursor-pointer group"
          >
            <span>Enter EDUZAM</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1.5" />
          </button>

          {/* Lesson Plan Button */}
          <button
            onClick={handleLessonPlanner}
            className="w-full sm:w-auto px-10 sm:px-12 py-3.5 sm:py-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-md hover:shadow-xl border border-slate-600 hover:border-emerald-500/50 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <BookOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Lesson Plan Workspace</span>
          </button>
        </motion.div>

        {/* 10 Provinces Coverage Pills Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 sm:mt-16 w-full max-w-4xl pt-8 border-t border-white/15"
        >
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5 drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>10 Provincial Education Directorates</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {provinces.map((prov) => (
              <span
                key={prov}
                className="px-2.5 py-1 rounded-md bg-slate-900/40 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-colors shadow-xs"
              >
                {prov}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full max-w-4xl text-left"
        >
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-start gap-3 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Official Markbook</div>
              <div className="text-[11px] text-slate-300">ECZ-aligned assessment and anti-tamper grade verification.</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-start gap-3 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">CDC Schemes of Work</div>
              <div className="text-[11px] text-slate-300">Standardized Zambian syllabus models from Grade 1 to 12.</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex items-start gap-3 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Institutional Hub</div>
              <div className="text-[11px] text-slate-300">Synchronized record repository for secondary & primary schools.</div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-white/15 flex flex-col gap-4 z-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300 bg-slate-900/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6">
            <a href="mailto:eduzamword@gmail.com" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>eduzamword@gmail.com</span>
            </a>
            <a href="tel:0973518046" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>0973518046</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-center md:text-right">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Physical Address: 454 LCC LUSAKA WEST, ZAMBIA</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-200">EDUZAM Educational Portal</span>
          </div>
          <div className="text-[11px] text-slate-300">
            EDUZAM Integrated System • Super Admin Configured & Protected
          </div>
        </div>
      </footer>

    </div>
  );
}

