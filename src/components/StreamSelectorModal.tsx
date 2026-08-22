import { motion } from 'motion/react';
import { ArrowLeft, GraduationCap, School, BookOpen, FileSpreadsheet, ChevronRight } from 'lucide-react';

interface StreamSelectorModalProps {
  onSelectStream: (stream: string) => void;
  onClose: () => void;
}

export default function StreamSelectorModal({ onSelectStream, onClose }: StreamSelectorModalProps) {
  const streams = [
    { id: 'higher', title: 'Higher Education', icon: GraduationCap },
    { id: 'secondary', title: 'Secondary School', icon: School },
    { id: 'primary', title: 'Primary School', icon: BookOpen },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a172a] text-white flex flex-col justify-between p-6 sm:p-10 overflow-y-auto font-sans"
    >
      {/* Top Left Navigation Back */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-start">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-slate-200 transition-colors border border-slate-700/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Center Header */}
      <div className="w-full max-w-xl mx-auto my-auto py-6 space-y-8 text-center">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wide">
          Select Educational Stream
        </h1>

        {/* Gold Graduation Cap Emblem Divider */}
        <div className="flex items-center justify-center gap-4 my-2">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-amber-400/60"></div>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-amber-300" />
          </div>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-amber-400/60"></div>
        </div>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Choose your teaching level to load tailored markbooks, registers, and syllabus tools.
        </p>

        {/* Stream Cards Grid */}
        <div className="space-y-4 pt-4 text-left">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectStream(s.id);
                onClose();
              }}
              className="w-full p-4 sm:p-5 rounded-2xl bg-[#13233d]/80 border border-slate-700/60 hover:border-amber-400/60 hover:bg-[#1a2d4d] transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg text-slate-100 group-hover:text-amber-200 transition-colors">
                  {s.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 transition-colors" />
            </button>
          ))}

          {/* Highlighted CDC Library Card (Matching Image 4) */}
          <button
            onClick={() => {
              onSelectStream('curriculum');
              onClose();
            }}
            className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 border border-amber-500/50 hover:border-amber-400 transition-all flex items-center justify-between shadow-lg active:scale-[0.99] relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md text-amber-100 flex items-center justify-center shrink-0 border border-white/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-wide">CDC Library</h3>
                <p className="text-xs text-amber-100 font-medium">Quick CDC Plan Generator</p>
              </div>
            </div>

            {/* Circular Portrait Image of Educator with Online Status Dot */}
            <div className="relative shrink-0 z-10">
              <div className="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden bg-slate-800 shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" 
                  alt="Educator" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></div>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs font-bold text-slate-500 py-4 uppercase tracking-widest">
        MINISTRY OF EDUCATION
      </div>
    </motion.div>
  );
}
