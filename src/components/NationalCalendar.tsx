import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  FileText, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  CalendarDays,
  Sparkles,
  Tag,
  Search,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  category: 'term_dates' | 'ecz_exam' | 'public_holiday' | 'moe_event' | 'inset_training';
  date: string; // YYYY-MM-DD
  endDate?: string;
  term?: 1 | 2 | 3;
  description?: string;
  location?: string;
  circularRef?: string;
  isImportant?: boolean;
}

const DEFAULT_ACADEMIC_EVENTS: CalendarEvent[] = [
  // Term 1 2026
  {
    id: 't1-open',
    title: 'Term 1 Official Opening',
    category: 'term_dates',
    date: '2026-01-12',
    term: 1,
    description: 'Schools open for Term 1 (13 Weeks). Orientation for Grade 8 and Grade 10 entrants.',
    circularRef: 'MoE/HQ/CIRC/2026/01',
    isImportant: true,
  },
  {
    id: 't1-census',
    title: 'Annual School Census & Enrolment Return',
    category: 'moe_event',
    date: '2026-02-06',
    term: 1,
    description: 'Submission of initial EMIS school statistics and learner headcounts.',
  },
  {
    id: 't1-midterm',
    title: 'Term 1 Mid-Term Break',
    category: 'term_dates',
    date: '2026-02-23',
    endDate: '2026-02-27',
    term: 1,
    description: 'Mid-term break for all primary, secondary and specialized institutions.',
  },
  {
    id: 'youth-day',
    title: 'Youth Day (Public Holiday)',
    category: 'public_holiday',
    date: '2026-03-12',
    description: 'National commemoration of Youth Day across the Republic of Zambia.',
    isImportant: true,
  },
  {
    id: 't1-sba',
    title: 'Term 1 Continuous Assessment & SBA Moderation',
    category: 'inset_training',
    date: '2026-03-27',
    term: 1,
    description: 'Cluster-level moderation of project files and SBA grade submission.',
  },
  {
    id: 'easter-fri',
    title: 'Good Friday',
    category: 'public_holiday',
    date: '2026-04-03',
    description: 'Public Holiday.',
  },
  {
    id: 'easter-mon',
    title: 'Easter Monday',
    category: 'public_holiday',
    date: '2026-04-06',
    description: 'Public Holiday.',
  },
  {
    id: 't1-close',
    title: 'Term 1 Official Closing',
    category: 'term_dates',
    date: '2026-04-10',
    term: 1,
    description: 'Schools close for Term 1 vacation (4 Weeks recess).',
    isImportant: true,
  },

  // Term 2 2026
  {
    id: 'labour-day',
    title: 'Labour Day',
    category: 'public_holiday',
    date: '2026-05-01',
    description: 'International Workers Day celebration.',
    isImportant: true,
  },
  {
    id: 't2-open',
    title: 'Term 2 Official Opening',
    category: 'term_dates',
    date: '2026-05-11',
    term: 2,
    description: 'Schools resume for Term 2 (13 Weeks). Focus on STEM Fairs and Mock Exams.',
    isImportant: true,
  },
  {
    id: 'africa-freedom',
    title: 'Africa Freedom Day',
    category: 'public_holiday',
    date: '2026-05-25',
    description: 'Continental commemoration.',
  },
  {
    id: 'jets-fair',
    title: 'National JETS (Junior Engineers, Technicians & Scientists) Fair',
    category: 'moe_event',
    date: '2026-06-15',
    endDate: '2026-06-19',
    term: 2,
    location: 'National STEM Complex, Lusaka',
    description: 'Provincial winners compete in robotics, agriculture, ICT, and mathematics.',
    isImportant: true,
  },
  {
    id: 'heroes-day',
    title: 'Heroes Day',
    category: 'public_holiday',
    date: '2026-07-06',
    description: 'National Public Holiday.',
  },
  {
    id: 'unity-day',
    title: 'Unity Day',
    category: 'public_holiday',
    date: '2026-07-07',
    description: 'National Public Holiday.',
  },
  {
    id: 't2-mock',
    title: 'ECZ Mock Examinations (Grade 9 & 12)',
    category: 'ecz_exam',
    date: '2026-07-20',
    endDate: '2026-07-31',
    term: 2,
    description: 'Provincial unified mock examinations for candidate classes.',
  },
  {
    id: 'farmers-day',
    title: 'Farmers Day',
    category: 'public_holiday',
    date: '2026-08-03',
    description: 'Public Holiday.',
  },
  {
    id: 't2-close',
    title: 'Term 2 Official Closing',
    category: 'term_dates',
    date: '2026-08-07',
    term: 2,
    description: 'Schools close for Term 2 vacation (4 Weeks recess).',
    isImportant: true,
  },

  // Term 3 2026 (Current Academic Window)
  {
    id: 't3-open',
    title: 'Term 3 Official Opening (Examination Term)',
    category: 'term_dates',
    date: '2026-09-07',
    term: 3,
    description: 'Schools open for Term 3 (13 Weeks). Candidate intensive prep and national exams.',
    circularRef: 'MoE/HQ/CIRC/2026/09',
    isImportant: true,
  },
  {
    id: 'gce-results',
    title: 'Release of GCE & External Candidate Results',
    category: 'ecz_exam',
    date: '2026-09-21',
    description: 'Examinations Council of Zambia official press briefing & SMS verification.',
  },
  {
    id: 'teachers-day',
    title: 'World Teachers Day Commemoration',
    category: 'moe_event',
    date: '2026-10-05',
    description: 'National appreciation for educators and merit awards ceremonies.',
    isImportant: true,
  },
  {
    id: 'prayer-day',
    title: 'National Day of Prayer, Fasting, & Reconciliation',
    category: 'public_holiday',
    date: '2026-10-18',
    description: 'National observance.',
  },
  {
    id: 'independence-day',
    title: 'Independence Day (62nd Anniversary)',
    category: 'public_holiday',
    date: '2026-10-24',
    description: 'National Independence celebrations across all provinces.',
    isImportant: true,
  },
  {
    id: 'ecz-g12',
    title: 'ECZ Grade 12 School Certificate Examinations Commence',
    category: 'ecz_exam',
    date: '2026-11-02',
    endDate: '2026-11-20',
    term: 3,
    description: 'National School Certificate theory and practical papers.',
    circularRef: 'ECZ/SEC/2026/G12',
    isImportant: true,
  },
  {
    id: 'ecz-g9',
    title: 'ECZ Grade 9 Junior Secondary School Leaving Exam (JSSLE)',
    category: 'ecz_exam',
    date: '2026-11-16',
    endDate: '2026-11-27',
    term: 3,
    description: 'Junior secondary national selection exams.',
    isImportant: true,
  },
  {
    id: 'ecz-g7',
    title: 'Grade 7 National Composite Examination',
    category: 'ecz_exam',
    date: '2026-11-23',
    endDate: '2026-11-27',
    term: 3,
    description: 'Primary school composite examination for Grade 8 selection.',
    isImportant: true,
  },
  {
    id: 't3-close',
    title: 'Term 3 Official Closing & Annual Speech Day',
    category: 'term_dates',
    date: '2026-12-04',
    term: 3,
    description: 'Conclusion of the 2026 Academic Year. Release of annual progress cards.',
    isImportant: true,
  },
];

const CATEGORY_META = {
  term_dates: { label: 'Term Dates', color: 'bg-blue-500 text-white border-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  ecz_exam: { label: 'ECZ Examinations', color: 'bg-purple-600 text-white border-purple-700', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  public_holiday: { label: 'Public Holidays', color: 'bg-emerald-600 text-white border-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  moe_event: { label: 'MoE National Events', color: 'bg-amber-500 text-white border-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  inset_training: { label: 'INSET & Moderation', color: 'bg-rose-500 text-white border-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function NationalCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 15)); // August 2026 (local context date)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('custom_academic_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form state for adding events
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<CalendarEvent['category']>('moe_event');
  const [newEventDate, setNewEventDate] = useState('2026-08-20');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');

  const allEvents = useMemo(() => {
    return [...DEFAULT_ACADEMIC_EVENTS, ...customEvents];
  }, [customEvents]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const created: CalendarEvent = {
      id: 'cust-' + Date.now(),
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      description: newEventDesc.trim() || undefined,
      location: newEventLocation.trim() || undefined,
      isImportant: true,
    };

    const updated = [created, ...customEvents];
    setCustomEvents(updated);
    localStorage.setItem('custom_academic_events', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventLocation('');
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
      if (selectedTerm !== 'all' && ev.term !== selectedTerm) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description?.toLowerCase().includes(q);
        const matchesLoc = ev.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [allEvents, selectedCategory, selectedTerm, searchQuery]);

  // Calendar Grid math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => {
      if (e.date === formatted) return true;
      if (e.endDate && e.date <= formatted && e.endDate >= formatted) return true;
      return false;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 2026 Academic Year
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Ministry of Education • Republic of Zambia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            National Academic Calendar
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Official gazetted terms, national examination periods (ECZ), public holidays, and in-service assessment windows for schools nationwide.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Gazette</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add School Event</span>
          </button>
        </div>
      </div>

      {/* Term Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setSelectedTerm(selectedTerm === 1 ? 'all' : 1)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedTerm === 1 ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-2 ring-blue-400/20' : 'bg-white/80 border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Term 1 (13 Weeks)</span>
            <span className="text-[11px] font-semibold text-slate-500">Jan 12 – Apr 10</span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mt-1">Foundation & Assessments</h4>
          <p className="text-xs text-slate-600 mt-0.5">Census returns, SBA moderation, Mid-Term break.</p>
        </div>

        <div 
          onClick={() => setSelectedTerm(selectedTerm === 2 ? 'all' : 2)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedTerm === 2 ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20' : 'bg-white/80 border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Term 2 (13 Weeks)</span>
            <span className="text-[11px] font-semibold text-slate-500">May 11 – Aug 7</span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mt-1">STEM Fairs & Mock Exams</h4>
          <p className="text-xs text-slate-600 mt-0.5">National JETS Fair, unified mock examinations.</p>
        </div>

        <div 
          onClick={() => setSelectedTerm(selectedTerm === 3 ? 'all' : 3)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedTerm === 3 ? 'bg-emerald-50/90 border-emerald-400 shadow-sm ring-2 ring-emerald-400/20' : 'bg-white/80 border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Term 3 (13 Weeks)</span>
            <span className="text-[11px] font-semibold text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">Current Term</span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mt-1">National ECZ Finals</h4>
          <p className="text-xs text-slate-600 mt-0.5">Sep 7 – Dec 4 (Grade 7, 9, 12 National Exams).</p>
        </div>
      </div>

      {/* Main Content Layout: Grid Calendar (Left 7 Cols) + Event Digest Feed (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Month Calendar (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Month Controller Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {monthNames[month]} {year}
                </h2>
                <p className="text-xs text-slate-500">Republic of Zambia Standard MoE Timetable</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2026, 7, 15))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] rounded-2xl bg-slate-50/50 border border-transparent" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = getEventsForDay(dayNum);
              const isToday = year === 2026 && month === 7 && dayNum === 15; // Aug 15 2026

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                  className={`min-h-[72px] p-2 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isToday 
                      ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20' 
                      : dayEvents.length > 0 
                        ? 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs cursor-pointer' 
                        : 'border-slate-100 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 1).map((ev) => (
                      <div 
                        key={ev.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                          ev.category === 'ecz_exam' 
                            ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                            : ev.category === 'public_holiday' 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-[9px] font-semibold text-slate-400 text-right">
                        +{dayEvents.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Term Dates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-slate-600">ECZ Examinations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-600">Public Holidays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">MoE National Events</span>
            </div>
          </div>
        </div>

        {/* Gazette Feed & Search Digest (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filter and Search Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gazetted dates, exams, holidays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All Events
              </button>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === key ? meta.color : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-sm">Key Gazetted Milestones</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{filteredEvents.length} items</span>
            </div>

            <div className="space-y-2.5">
              {filteredEvents.map((ev) => {
                const meta = CATEGORY_META[ev.category] || CATEGORY_META.moe_event;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-800 transition-colors">
                        {ev.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border shrink-0 ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {ev.date} {ev.endDate ? `to ${ev.endDate}` : ''}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="text-center py-10 space-y-2 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No calendar events found matching filter.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* EVENT DETAIL MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${CATEGORY_META[selectedEvent.category]?.badge}`}>
                  {CATEGORY_META[selectedEvent.category]?.label}
                </span>
                <h3 className="text-xl font-bold text-slate-900 pt-1">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Scheduled Date:</span>
                  <span className="font-bold text-slate-800">
                    {selectedEvent.date} {selectedEvent.endDate ? `to ${selectedEvent.endDate}` : ''}
                  </span>
                </div>

                {selectedEvent.term && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Academic Term:</span>
                    <span className="font-bold text-teal-700">Term {selectedEvent.term} (2026)</span>
                  </div>
                )}

                {selectedEvent.circularRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">MoE Circular Ref:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedEvent.circularRef}</span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Venue / Scope:</span>
                    <span className="font-bold text-slate-800">{selectedEvent.location}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Gazette Notes</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Event Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD SCHOOL EVENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-700" />
                  <h3 className="font-bold text-slate-900 text-lg">Add School Event / Circular</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Fair / Inter-House Sports / Parent Conference"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Category *</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="moe_event">MoE National Event</option>
                      <option value="ecz_exam">Examination / Test</option>
                      <option value="term_dates">Term Milestone</option>
                      <option value="inset_training">INSET / Teacher Training</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Date *</label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                    </input>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Assembly Hall / STEM Laboratory"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Description / Guidelines</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of requirements or instructions for staff and learners..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition-all shadow-md cursor-pointer"
                  >
                    Save to School Calendar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
