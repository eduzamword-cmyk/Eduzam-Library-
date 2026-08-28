import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [coverBackground, setCoverBackground] = useState<string | null>(() => localStorage.getItem('eduzam_cover_background'));
  const [showControls, setShowControls] = useState(false);

  const [userRole] = useState(() => localStorage.getItem('user_role') || '');
  const [userEmail] = useState(() => localStorage.getItem('user_email') || '');
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userEmail === 'eduzamword@gmail.com' || localStorage.getItem('user_role') === 'SUPER_ADMIN' || localStorage.getItem('user_email') === 'eduzamword@gmail.com';

  const [showEduzam, setShowEduzam] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showWindows, setShowWindows] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const backgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Continuous, orchestrated sequence timings for liquid smooth flow:
    // 1. Logo falls and bounces smoothly, landing softly at t = 2.0s
    // 2. Right as logo finishes landing (~2.0s), EDUZAM title smoothly blooms
    const timerEduzam = setTimeout(() => {
      setShowEduzam(true);
    }, 2000);

    // 3. Buttons seamlessly slide up (~2.7s)
    const timerButtons = setTimeout(() => {
      setShowButtons(true);
    }, 2700);

    // 4. Directorates, feature windows & subtitle slide in (~3.5s)
    const timerWindows = setTimeout(() => {
      setShowWindows(true);
      setShowSubtitle(true);
    }, 3500);

    // 5. Subtitle stays for 4s, then gently fades out (~7.5s = 3.5s + 4.0s)
    // Space is reserved so buttons DO NOT move upwards when words disappear.
    const timerHideSubtitle = setTimeout(() => {
      setShowSubtitle(false);
    }, 7500);

    return () => {
      clearTimeout(timerEduzam);
      clearTimeout(timerButtons);
      clearTimeout(timerWindows);
      clearTimeout(timerHideSubtitle);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setCoverLogo(localStorage.getItem('eduzam_cover_logo'));
      setCoverBackground(localStorage.getItem('eduzam_cover_background'));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('eduzam-cover-logo-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eduzam-cover-logo-updated', handleStorageChange);
    };
  }, []);

  const handleEnter = () => {
    playFrontSound('enter', soundEnabled);
    onEnter();
  };

  const handleLessonPlanner = () => {
    playFrontSound('click', soundEnabled);
    onLessonPlanner();
  };

  const handleBackgroundFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size for background (limit to 5MB since it's larger)
    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB limit. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Moderate size reduction for background to avoid localStorage quota issues
        const maxDim = 1920; 
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
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setCoverBackground(compressed);
          try {
            localStorage.setItem('eduzam_cover_background', compressed);
          } catch (err) {
            console.warn('Cover background storage quota:', err);
            alert('Image is too large to save in local storage. It will show for this session only.');
          }
        } else {
          const result = event.target?.result as string;
          setCoverBackground(result);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetBackground = () => {
    setCoverBackground(null);
    localStorage.removeItem('eduzam_cover_background');
  };

  const provinces = [
    'Lusaka', 'Copperbelt', 'Southern', 'Eastern', 
    'Central', 'Northern', 'Luapula', 'Muchinga', 
    'North-Western', 'Western'
  ];

  return (
    <div 
      className={`fixed inset-0 w-full h-full min-h-screen bg-[#2f4b7c] text-white font-sans flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto relative selection:bg-white selection:text-slate-800 z-50`}
    >
      {/* Background Image Layer */}
      {coverBackground && (
        <>
          <div 
            className="absolute inset-0 z-0 opacity-100 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverBackground})` }}
          />
          <div className="absolute inset-0 z-0 bg-slate-900/50 pointer-events-none" />
        </>
      )}

      {/* Hidden File Input for Background */}
      <input 
        ref={backgroundInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleBackgroundFileSelect}
      />

      {/* Subtle Ambient Lighting Layers (Removed for pure color visibility) */}
      
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-end z-20 gap-4 flex-wrap">
        {/* Right Controls: Audio & Super Admin Settings */}
        <div className="flex items-center gap-3">
          {/* Super Admin Background Control */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 mr-2 bg-white/20 p-1.5 rounded-xl border border-white/20 backdrop-blur-md">
               <button
                  onClick={() => backgroundInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Super Admin: Set Page Background"
               >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">Set BG</span>
               </button>
               {coverBackground && (
                  <button
                     onClick={handleResetBackground}
                     className="p-1.5 rounded-lg hover:bg-white/30 text-white transition-colors cursor-pointer"
                     title="Reset Background"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               )}
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 text-white transition-all cursor-pointer backdrop-blur-md shadow-sm"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
            aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-70" />}
          </button>
        </div>
      </header>

      {/* Main Central Stage */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 sm:py-12 z-20 flex flex-col items-center text-center">
        
        {/* Centered Logo: Falls smoothly from top, reaches half of the page (~30vh), then bounces upwards and lands perfectly in position */}
        <motion.div
          initial={{ y: "-60vh", opacity: 0, scale: 0.6 }}
          animate={{ 
            y: ["-60vh", "30vh", "-10px", "0px"], 
            opacity: [0, 1, 1, 1], 
            scale: [0.6, 1.06, 0.98, 1] 
          }}
          transition={{ 
            duration: 2.0, 
            times: [0, 0.55, 0.85, 1], 
            ease: ["easeIn", "easeOut", "easeInOut"] 
          }}
          className="mb-6 relative z-10"
          title="Institution Emblem"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-0.5 shadow-xl flex items-center justify-center overflow-hidden mx-auto border border-white">
            {coverLogo ? (
              <img 
                src={coverLogo} 
                alt="Institution Emblem" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#2f4b7c] rounded-full flex items-center justify-center">
                <Landmark className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Hero Title & Identity */}
        <div className="space-y-3 max-w-3xl flex flex-col items-center justify-center">
          {/* Smooth EDUZAM Header Bloom */}
          <motion.h1
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={showEduzam ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans drop-shadow-lg"
          >
            EDUZAM
          </motion.h1>
          
          {/* Subtitle slot with reserved height so buttons NEVER move upward when words disappear */}
          <div className="min-h-[56px] sm:min-h-[64px] flex items-center justify-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={showSubtitle ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
              className="text-base sm:text-2xl font-semibold text-white leading-relaxed max-w-2xl mx-auto drop-shadow-md py-1"
            >
              National Unified Educational Management & Examination Command System
            </motion.p>
          </div>
        </div>

        {/* Action Buttons: Seamless Slide Up */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={showButtons ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-6 sm:mt-8 w-full max-w-2xl"
        >
          {/* Main Enter EDUZAM Button - Desaturated Muted Blue */}
          <button
            onClick={handleEnter}
            className="flex-1 w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-xl bg-[#2d5292] hover:bg-[#3861a8] active:bg-[#244277] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-slate-900/40 hover:shadow-xl border border-[#4f75b8]/50 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <span>Enter EDUZAM</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Lesson Plan Button - Desaturated Muted Amber */}
          <button
            onClick={handleLessonPlanner}
            className="flex-1 w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-xl bg-[#9a6428] hover:bg-[#ad7230] active:bg-[#82531e] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-slate-900/40 hover:shadow-xl border border-[#c48e4e]/50 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Lesson Plan Workspace</span>
          </button>
        </motion.div>

        {/* Other Windows (10 Directorates & Feature Cards) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={showWindows ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full flex flex-col items-center"
        >
          {/* 10 Provinces Coverage Pills Bar */}
          <div className="mt-10 sm:mt-12 w-full max-w-4xl">
            <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>10 Provincial Education Directorates</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {provinces.map((prov) => (
                <span
                  key={prov}
                  className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white hover:border-white/50 hover:bg-white/20 transition-colors shadow-xs"
                >
                  {prov}
                </span>
              ))}
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full max-w-4xl text-left">
            {/* Card 1: Official Markbook - White */}
            <div className="p-4 rounded-[8px] bg-white border border-slate-200 flex items-start gap-3 shadow-md text-slate-900">
              <div className="p-2 rounded-[8px] bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Official Markbook</div>
                <div className="text-[11px] font-medium text-slate-600">ECZ-aligned assessment and anti-tamper grade verification.</div>
              </div>
            </div>

            {/* Card 2: CDC Schemes of Work - White */}
            <div className="p-4 rounded-[8px] bg-white border border-slate-200 flex items-start gap-3 shadow-md text-slate-900">
              <div className="p-2 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">CDC Schemes of Work</div>
                <div className="text-[11px] font-medium text-slate-600">Standardized Zambian syllabus models from Grade 1 to 12.</div>
              </div>
            </div>

            {/* Card 3: Institutional Hub - Black (Last Card) */}
            <div className="p-4 rounded-[8px] bg-slate-950 border border-slate-800 flex items-start gap-3 shadow-md text-white">
              <div className="p-2 rounded-[8px] bg-slate-900 border border-slate-700 text-teal-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Institutional Hub</div>
                <div className="text-[11px] font-medium text-slate-400">Synchronized record repository for secondary & primary schools.</div>
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-white/15 flex flex-col gap-4 z-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-200 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6">
            <a href="mailto:eduzamword@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-white shrink-0" />
              <span>eduzamword@gmail.com</span>
            </a>
            <a href="tel:0973518046" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-white shrink-0" />
              <span>0973518046</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-center md:text-right">
            <MapPin className="w-4 h-4 text-white shrink-0" />
            <span>Physical Address: 454 LCC LUSAKA WEST, ZAMBIA</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">EDUZAM Educational Portal</span>
          </div>
          <div className="text-[11px] text-slate-200">
            EDUZAM Integrated System • Super Admin Configured & Protected
          </div>
        </div>
      </footer>

    </div>
  );
}

