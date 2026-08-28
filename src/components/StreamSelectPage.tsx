import { motion } from 'motion/react';
import { GraduationCap, School, BookOpen, FileSpreadsheet, ChevronRight } from 'lucide-react';

interface StreamSelectPageProps {
  onSelectStream: (stream: string) => void;
  userEmail?: string | null;
}

export default function StreamSelectPage({ onSelectStream }: StreamSelectPageProps) {
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
      className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-slate-100 text-slate-900 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto font-sans relative"
    >
      {/* Background Soft Atmospheric Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Center Header */}
      <div className="w-full max-w-xl mx-auto my-auto py-6 space-y-8 text-center relative z-10">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-wide">
          Select Educational Stream
        </h1>

        {/* Gold Emblem Divider */}
        <div className="flex items-center justify-center gap-4 my-2">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-teal-500/60"></div>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-teal-500/60"></div>
        </div>

        {/* Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Choose your teaching level to load tailored markbooks, registers, and syllabus tools.
        </p>

        {/* Stream Cards Grid */}
        <div className="space-y-4 pt-4 text-left">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStream(s.id)}
              className="w-full p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-teal-500/60 hover:bg-white shadow-xs transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-lg text-slate-800 group-hover:text-teal-700 transition-colors">
                  {s.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>
          ))}

          {/* Highlighted CDC Library Card */}
          <button
            onClick={() => onSelectStream('curriculum')}
            className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 border border-teal-600/50 hover:border-teal-400 transition-all flex items-center justify-between shadow-lg active:scale-[0.99] relative overflow-hidden text-left cursor-pointer text-white"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md text-teal-100 flex items-center justify-center shrink-0 border border-white/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-wide">CDC Library</h3>
                <p className="text-xs text-teal-100 font-medium">Quick CDC Plan Generator</p>
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

      <div className="text-center text-xs font-bold text-slate-500 py-4 uppercase tracking-widest relative z-10">
        MINISTRY OF EDUCATION
      </div>
    </motion.div>
  );
}
