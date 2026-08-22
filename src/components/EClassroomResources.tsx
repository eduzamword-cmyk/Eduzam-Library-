import { useState } from 'react';
import { 
  Tv, 
  Search, 
  Play, 
  BookOpen, 
  Video, 
  Download, 
  Sparkles, 
  FileText, 
  Award, 
  CheckCircle2, 
  Filter, 
  Bookmark, 
  Clock, 
  Layers
} from 'lucide-react';

export default function EClassroomResources() {
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['ALL', 'Mathematics', 'Integrated Science', 'Physics', 'Biology', 'English Language', 'Civic Education', 'Computer Studies'];
  const grades = ['ALL', 'Grade 7', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const videoLessons = [
    {
      id: 1,
      title: 'Grade 12 Pure Mathematics: Calculus & Differentiation',
      subject: 'Mathematics',
      grade: 'Grade 12',
      duration: '42 min',
      instructor: 'Dr. Chibwe Kapwepwe',
      views: '24,800',
      rating: '4.9',
      downloads: '1.2k PDF Notes',
      thumbnail: 'bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 4.2: Differential Calculus Applications'
    },
    {
      id: 2,
      title: 'CDC 2026 Physics: Electromagnetic Induction & Generators',
      subject: 'Physics',
      grade: 'Grade 11',
      duration: '38 min',
      instructor: 'Prof. Mutale Phiri',
      views: '18,500',
      rating: '4.8',
      downloads: '850 PDF Lab Sheets',
      thumbnail: 'bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 6.1: Faraday Law & AC Generators'
    },
    {
      id: 3,
      title: 'Biology: Human Physiology & Circulatory System',
      subject: 'Biology',
      grade: 'Grade 10',
      duration: '45 min',
      instructor: 'Mrs. Gertrude Mulenga',
      views: '31,200',
      rating: '5.0',
      downloads: '2.1k Diagrams',
      thumbnail: 'bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 3.4: Transport in Mammals'
    },
    {
      id: 4,
      title: 'Junior Secondary Science: Chemical Reactions & Periodic Table',
      subject: 'Integrated Science',
      grade: 'Grade 9',
      duration: '35 min',
      instructor: 'Mr. Bwalya Sampa',
      views: '15,900',
      rating: '4.7',
      downloads: '940 Exercises',
      thumbnail: 'bg-gradient-to-br from-amber-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 2.1: Atomic Structure & Bonding'
    },
    {
      id: 5,
      title: 'Grade 12 Civic Education: Constitution & Human Rights',
      subject: 'Civic Education',
      grade: 'Grade 12',
      duration: '50 min',
      instructor: 'Hon. Counsel Njobvu',
      views: '28,100',
      rating: '4.9',
      downloads: '1.8k Summary Charts',
      thumbnail: 'bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 1.3: Governance & Electoral Systems'
    },
    {
      id: 6,
      title: 'ICT & Computer Studies: Python Programming & Algorithms',
      subject: 'Computer Studies',
      grade: 'Grade 11',
      duration: '55 min',
      instructor: 'Eng. Tembo Mwamba',
      views: '22,400',
      rating: '4.9',
      downloads: '3.4k Code Files',
      thumbnail: 'bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950',
      cdcTopic: 'Unit 5.0: Software Logic & Flowcharts'
    }
  ];

  const filtered = videoLessons.filter(lesson => {
    const matchesSubject = selectedSubject === 'ALL' || lesson.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'ALL' || lesson.grade === selectedGrade;
    const matchesQuery = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lesson.cdcTopic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesGrade && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 border border-teal-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black uppercase tracking-widest">
            <Tv className="w-3.5 h-3.5 text-teal-400" />
            CDC 2026 DIGITAL E-LEARNING REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-serif">
            National E-Classroom & Video Syllabus
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Access Ministry-certified video lectures, interactive laboratory demonstrations, and downloadable exam prep guides mapped directly to the CDC 2026 curriculum across all regional centers.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, past papers, or CDC units..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Grade Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubject === subj
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(lesson => (
          <div 
            key={lesson.id}
            className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Thumbnail Header */}
              <div className={`h-40 ${lesson.thumbnail} p-4 relative flex flex-col justify-between overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 bg-slate-950/80 text-teal-300 text-[10px] font-black uppercase rounded-lg border border-teal-500/30 backdrop-blur-md">
                    {lesson.grade}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950/80 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {lesson.duration}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                    {lesson.subject}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  {lesson.cdcTopic}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                  <span>Instructor: <strong className="text-slate-800">{lesson.instructor}</strong></span>
                  <span className="text-amber-600 font-black">★ {lesson.rating}</span>
                </div>
              </div>
            </div>

            {/* Download Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {lesson.downloads}
              </span>

              <button 
                onClick={() => alert(`Downloading CDC 2026 course material for ${lesson.title}`)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3 h-3" />
                Get Notes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
