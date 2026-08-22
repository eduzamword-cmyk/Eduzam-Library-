import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  Plus, 
  Printer, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  Layers, 
  GraduationCap, 
  Sparkles, 
  Edit3, 
  Trash2, 
  X,
  Bell,
  SlidersHorizontal,
  Search
} from 'lucide-react';

interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 8
  subject: string;
  grade: string;
  teacher: string;
  room: string;
  color?: string;
}

const PERIOD_TIMES = [
  { period: 1, start: '07:30', end: '08:15', label: 'Period 1' },
  { period: 2, start: '08:15', end: '09:00', label: 'Period 2' },
  { period: 3, start: '09:00', end: '09:45', label: 'Period 3' },
  { period: 4, start: '09:45', end: '10:30', label: 'Period 4' },
  // 10:30 - 11:00 Morning Tea Break
  { period: 5, start: '11:00', end: '11:45', label: 'Period 5' },
  { period: 6, start: '11:45', end: '12:30', label: 'Period 6' },
  // 12:30 - 13:30 Lunch Break
  { period: 7, start: '13:30', end: '14:15', label: 'Period 7' },
  { period: 8, start: '14:15', end: '15:00', label: 'Period 8' },
];

const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-blue-50 text-blue-800 border-blue-200',
  'Physics': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Chemistry': 'bg-teal-50 text-teal-800 border-teal-200',
  'Biology': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Computer Studies': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  'English Language': 'bg-amber-50 text-amber-800 border-amber-200',
  'Literature in English': 'bg-orange-50 text-orange-800 border-orange-200',
  'Civic Education': 'bg-rose-50 text-rose-800 border-rose-200',
  'Geography': 'bg-stone-50 text-stone-800 border-stone-200',
  'History': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Agricultural Science': 'bg-lime-50 text-lime-800 border-lime-200',
  'Zambian Languages': 'bg-purple-50 text-purple-800 border-purple-200',
};

const DEFAULT_SLOTS: TimetableSlot[] = [
  // Monday - Grade 10 STEM
  { id: '1', day: 'Monday', period: 1, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '2', day: 'Monday', period: 2, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '3', day: 'Monday', period: 3, subject: 'Physics', grade: 'Grade 10 STEM A', teacher: 'Mr. M. Banda', room: 'Physics Lab' },
  { id: '4', day: 'Monday', period: 4, subject: 'Computer Studies', grade: 'Grade 10 STEM A', teacher: 'Mr. C. Tembo', room: 'ICT Lab 1' },
  { id: '5', day: 'Monday', period: 5, subject: 'English Language', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },
  { id: '6', day: 'Monday', period: 6, subject: 'Chemistry', grade: 'Grade 10 STEM A', teacher: 'Dr. E. Lungu', room: 'Chemistry Lab' },
  { id: '7', day: 'Monday', period: 7, subject: 'Biology', grade: 'Grade 10 STEM A', teacher: 'Mr. B. Chikwanda', room: 'Bio Lab' },
  { id: '8', day: 'Monday', period: 8, subject: 'Civic Education', grade: 'Grade 10 STEM A', teacher: 'Mrs. N. Zulu', room: 'Room 12' },

  // Tuesday - Grade 10 STEM
  { id: '9', day: 'Tuesday', period: 1, subject: 'Physics', grade: 'Grade 10 STEM A', teacher: 'Mr. M. Banda', room: 'Physics Lab' },
  { id: '10', day: 'Tuesday', period: 2, subject: 'Physics', grade: 'Grade 10 STEM A', teacher: 'Mr. M. Banda', room: 'Physics Lab' },
  { id: '11', day: 'Tuesday', period: 3, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '12', day: 'Tuesday', period: 4, subject: 'Chemistry', grade: 'Grade 10 STEM A', teacher: 'Dr. E. Lungu', room: 'Chemistry Lab' },
  { id: '13', day: 'Tuesday', period: 5, subject: 'Computer Studies', grade: 'Grade 10 STEM A', teacher: 'Mr. C. Tembo', room: 'ICT Lab 1' },
  { id: '14', day: 'Tuesday', period: 6, subject: 'English Language', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },
  { id: '15', day: 'Tuesday', period: 7, subject: 'Agricultural Science', grade: 'Grade 10 STEM A', teacher: 'Mr. P. Mulenga', room: 'Agric Unit' },
  { id: '16', day: 'Tuesday', period: 8, subject: 'Zambian Languages', grade: 'Grade 10 STEM A', teacher: 'Mrs. H. Mutale', room: 'Room 12' },

  // Wednesday - Grade 10 STEM
  { id: '17', day: 'Wednesday', period: 1, subject: 'Chemistry', grade: 'Grade 10 STEM A', teacher: 'Dr. E. Lungu', room: 'Chemistry Lab' },
  { id: '18', day: 'Wednesday', period: 2, subject: 'Chemistry', grade: 'Grade 10 STEM A', teacher: 'Dr. E. Lungu', room: 'Chemistry Lab' },
  { id: '19', day: 'Wednesday', period: 3, subject: 'Biology', grade: 'Grade 10 STEM A', teacher: 'Mr. B. Chikwanda', room: 'Bio Lab' },
  { id: '20', day: 'Wednesday', period: 4, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '21', day: 'Wednesday', period: 5, subject: 'English Language', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },
  { id: '22', day: 'Wednesday', period: 6, subject: 'Civic Education', grade: 'Grade 10 STEM A', teacher: 'Mrs. N. Zulu', room: 'Room 12' },
  { id: '23', day: 'Wednesday', period: 7, subject: 'Geography', grade: 'Grade 10 STEM A', teacher: 'Mr. T. Sakala', room: 'Room 12' },
  { id: '24', day: 'Wednesday', period: 8, subject: 'Computer Studies', grade: 'Grade 10 STEM A', teacher: 'Mr. C. Tembo', room: 'ICT Lab 1' },

  // Thursday - Grade 10 STEM
  { id: '25', day: 'Thursday', period: 1, subject: 'Biology', grade: 'Grade 10 STEM A', teacher: 'Mr. B. Chikwanda', room: 'Bio Lab' },
  { id: '26', day: 'Thursday', period: 2, subject: 'Biology', grade: 'Grade 10 STEM A', teacher: 'Mr. B. Chikwanda', room: 'Bio Lab' },
  { id: '27', day: 'Thursday', period: 3, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '28', day: 'Thursday', period: 4, subject: 'English Language', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },
  { id: '29', day: 'Thursday', period: 5, subject: 'Physics', grade: 'Grade 10 STEM A', teacher: 'Mr. M. Banda', room: 'Physics Lab' },
  { id: '30', day: 'Thursday', period: 6, subject: 'Computer Studies', grade: 'Grade 10 STEM A', teacher: 'Mr. C. Tembo', room: 'ICT Lab 1' },
  { id: '31', day: 'Thursday', period: 7, subject: 'History', grade: 'Grade 10 STEM A', teacher: 'Mr. J. Bwalya', room: 'Room 12' },
  { id: '32', day: 'Thursday', period: 8, subject: 'Literature in English', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },

  // Friday - Grade 10 STEM
  { id: '33', day: 'Friday', period: 1, subject: 'Mathematics', grade: 'Grade 10 STEM A', teacher: 'Mrs. K. Phiri', room: 'Room 12' },
  { id: '34', day: 'Friday', period: 2, subject: 'Computer Studies', grade: 'Grade 10 STEM A', teacher: 'Mr. C. Tembo', room: 'ICT Lab 1' },
  { id: '35', day: 'Friday', period: 3, subject: 'Physics', grade: 'Grade 10 STEM A', teacher: 'Mr. M. Banda', room: 'Physics Lab' },
  { id: '36', day: 'Friday', period: 4, subject: 'Chemistry', grade: 'Grade 10 STEM A', teacher: 'Dr. E. Lungu', room: 'Chemistry Lab' },
  { id: '37', day: 'Friday', period: 5, subject: 'English Language', grade: 'Grade 10 STEM A', teacher: 'Ms. G. Mwila', room: 'Room 12' },
  { id: '38', day: 'Friday', period: 6, subject: 'Biology', grade: 'Grade 10 STEM A', teacher: 'Mr. B. Chikwanda', room: 'Bio Lab' },
  { id: '39', day: 'Friday', period: 7, subject: 'Civic Education', grade: 'Grade 10 STEM A', teacher: 'Mrs. N. Zulu', room: 'Room 12' },
  { id: '40', day: 'Friday', period: 8, subject: 'Zambian Languages', grade: 'Grade 10 STEM A', teacher: 'Mrs. H. Mutale', room: 'Room 12' },
];

const GRADES_LIST = [
  'Grade 10 STEM A',
  'Grade 10 Social Sciences',
  'Grade 11 Pure Sciences',
  'Grade 11 Commerce & Arts',
  'Grade 12 ECZ Candidate STEM',
  'Grade 9 Junior Secondary A',
  'Grade 8 Foundation B'
];

export default function TimetableView() {
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 10 STEM A');
  const [selectedDayFilter, setSelectedDayFilter] = useState<'All' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'daily' | 'bell'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem('school_timetable_slots');
      return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
    } catch {
      return DEFAULT_SLOTS;
    }
  });

  // New slot form state
  const [formDay, setFormDay] = useState<TimetableSlot['day']>('Monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTeacher, setFormTeacher] = useState('Mrs. K. Phiri');
  const [formRoom, setFormRoom] = useState('Room 12');

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = slots.findIndex(
      s => s.grade === selectedGrade && s.day === formDay && s.period === formPeriod
    );

    const newSlot: TimetableSlot = {
      id: selectedSlot?.id || 'slot-' + Date.now(),
      day: formDay,
      period: formPeriod,
      subject: formSubject,
      grade: selectedGrade,
      teacher: formTeacher,
      room: formRoom,
    };

    let updated: TimetableSlot[];
    if (existingIndex >= 0) {
      updated = [...slots];
      updated[existingIndex] = newSlot;
    } else {
      updated = [...slots, newSlot];
    }

    setSlots(updated);
    localStorage.setItem('school_timetable_slots', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setSelectedSlot(null);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = slots.filter(s => s.id !== id);
    setSlots(updated);
    localStorage.setItem('school_timetable_slots', JSON.stringify(updated));
    setSelectedSlot(null);
  };

  // Grade filtered slots
  const filteredSlots = useMemo(() => {
    return slots.filter(s => {
      if (s.grade !== selectedGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubj = s.subject.toLowerCase().includes(q);
        const matchesTeacher = s.teacher.toLowerCase().includes(q);
        const matchesRoom = s.room.toLowerCase().includes(q);
        if (!matchesSubj && !matchesTeacher && !matchesRoom) return false;
      }
      return true;
    });
  }, [slots, selectedGrade, searchQuery]);

  const getSlot = (day: TimetableSlot['day'], period: number) => {
    return filteredSlots.find(s => s.day === day && s.period === period);
  };

  // Workload summary by subject
  const subjectStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSlots.forEach(s => {
      counts[s.subject] = (counts[s.subject] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredSlots]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-teal-100 text-teal-800 border border-teal-200/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Official Master Schedule
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              8-Period Standard Day (40-45 Min)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Master Timetable
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Interactive weekly curriculum roster, teacher period allocations, specialized STEM laboratories, and bell schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Timetable</span>
          </button>

          <button
            onClick={() => {
              setSelectedSlot(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Period</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Grade Selector + View Mode Switcher */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class / Stream:</span>
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {GRADES_LIST.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject, teacher, lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Daily Digest
          </button>
          <button
            onClick={() => setViewMode('bell')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'bell' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Bell Schedule
          </button>
        </div>
      </div>

      {/* VIEW 1: WEEKLY GRID MATRIX */}
      {viewMode === 'grid' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Grid Header: Days of the Week */}
            <div className="grid grid-cols-6 gap-3 pb-3 border-b border-slate-100 text-center">
              <div className="font-bold text-xs text-slate-400 uppercase tracking-wider text-left pl-2">
                Time / Period
              </div>
              {DAYS.map(day => (
                <div key={day} className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Rows: Period 1 to 8 + Breaks */}
            <div className="space-y-3 pt-3">
              {PERIOD_TIMES.map((pt) => {
                const isAfterPeriod4 = pt.period === 5;
                const isAfterPeriod6 = pt.period === 7;

                return (
                  <div key={pt.period} className="space-y-3">
                    {/* Morning Break Bar after Period 4 */}
                    {isAfterPeriod4 && (
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>10:30 – 11:00 • Morning Health & Nutrition Break (30 Mins)</span>
                      </div>
                    )}

                    {/* Lunch Break Bar after Period 6 */}
                    {isAfterPeriod6 && (
                      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>12:30 – 13:30 • Midday Lunch & Co-Curricular Recess (60 Mins)</span>
                      </div>
                    )}

                    {/* The Period Row */}
                    <div className="grid grid-cols-6 gap-3 items-stretch">
                      {/* Period Label & Time */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-center text-left">
                        <span className="font-extrabold text-slate-800 text-xs">{pt.label}</span>
                        <span className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                          {pt.start} - {pt.end}
                        </span>
                      </div>

                      {/* 5 Days Columns */}
                      {DAYS.map(day => {
                        const slot = getSlot(day, pt.period);
                        const colorClass = slot ? (SUBJECT_COLORS[slot.subject] || 'bg-slate-50 text-slate-800 border-slate-200') : '';

                        return (
                          <div
                            key={day + pt.period}
                            onClick={() => {
                              if (slot) {
                                setSelectedSlot(slot);
                              } else {
                                setFormDay(day);
                                setFormPeriod(pt.period);
                                setSelectedSlot(null);
                                setIsAddModalOpen(true);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                              slot 
                                ? `${colorClass} hover:shadow-xs hover:scale-[1.01]` 
                                : 'bg-slate-50/40 border-dashed border-slate-200 hover:bg-slate-100/60 hover:border-slate-300'
                            }`}
                          >
                            {slot ? (
                              <div className="space-y-1">
                                <span className="font-extrabold text-xs block leading-tight truncate">
                                  {slot.subject}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] opacity-80 truncate">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span>{slot.teacher}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] opacity-80 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{slot.room}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-slate-300 group-hover:text-slate-500">
                                <Plus className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY DIGEST */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map(d => (
              <button
                key={d}
                onClick={() => setSelectedDayFilter(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedDayFilter === d ? 'bg-teal-700 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.filter(d => selectedDayFilter === 'All' || selectedDayFilter === d).map(day => {
              const daySlots = filteredSlots
                .filter(s => s.day === day)
                .sort((a, b) => a.period - b.period);

              return (
                <div key={day} className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base">{day}</h3>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                      {daySlots.length} Periods
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {daySlots.map(s => {
                      const pt = PERIOD_TIMES.find(p => p.period === s.period);
                      const colorClass = SUBJECT_COLORS[s.subject] || 'bg-slate-50 text-slate-800 border-slate-200';

                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3 rounded-2xl border ${colorClass} hover:shadow-xs transition-all cursor-pointer space-y-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs">{s.subject}</span>
                            <span className="font-mono text-[10px] font-bold opacity-75">
                              {pt?.start} – {pt?.end}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] opacity-80 pt-0.5">
                            <span>{s.teacher}</span>
                            <span className="font-medium">{s.room}</span>
                          </div>
                        </div>
                      );
                    })}

                    {daySlots.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No periods assigned for {day}.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: BELL SCHEDULE */}
      {viewMode === 'bell' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Standard MoE Bell Schedule & Timings</h3>
                <p className="text-xs text-slate-500">Official synchronous school bell rings and period transitions</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Morning Assembly & Registration</h4>
                    <p className="text-[11px] text-slate-500">Learner muster, anthem, and homeroom roll call</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-slate-700">07:00 – 07:30</span>
              </div>

              {PERIOD_TIMES.map(pt => (
                <div key={pt.period} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between hover:border-teal-500 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 font-bold text-xs text-teal-800 flex items-center justify-center">
                      P{pt.period}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{pt.label}</h4>
                      <p className="text-[11px] text-slate-500">Curriculum teaching block (45 minutes)</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                    {pt.start} – {pt.end}
                  </span>
                </div>
              ))}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">After-School Remedial & Clubs</h4>
                    <p className="text-[11px] text-slate-500">JETS club, debate, sports, and library study sessions</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-slate-700">15:00 – 16:30</span>
              </div>
            </div>
          </div>

          {/* Subject Workload Summary */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">Subject Weekly Workload</h3>
            </div>

            <div className="space-y-2">
              {subjectStats.map(([subj, count]) => (
                <div key={subj} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{subj}</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {count} periods/wk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SLOT DETAIL & EDIT MODAL */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative"
            >
              <button
                onClick={() => setSelectedSlot(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Period Inspector</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedSlot.subject}</h3>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Day & Period:</span>
                  <span className="font-bold text-slate-800">{selectedSlot.day} • Period {selectedSlot.period}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Educator:</span>
                  <span className="font-bold text-slate-800">{selectedSlot.teacher}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Location / Lab:</span>
                  <span className="font-bold text-slate-800">{selectedSlot.room}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Stream Class:</span>
                  <span className="font-bold text-teal-700">{selectedSlot.grade}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(selectedSlot.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormDay(selectedSlot.day);
                    setFormPeriod(selectedSlot.period);
                    setFormSubject(selectedSlot.subject);
                    setFormTeacher(selectedSlot.teacher);
                    setFormRoom(selectedSlot.room);
                    setIsAddModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Edit Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN / EDIT PERIOD MODAL */}
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
                  <h3 className="font-bold text-slate-900 text-lg">Assign Timetable Period</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Day *</label>
                    <select
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Period Slot *</label>
                    <select
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      {PERIOD_TIMES.map(pt => (
                        <option key={pt.period} value={pt.period}>
                          {pt.label} ({pt.start} - {pt.end})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Physics, Computer Studies"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Teacher in Charge *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mrs. K. Phiri"
                      value={formTeacher}
                      onChange={(e) => setFormTeacher(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Room / Lab *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Room 12 / Physics Lab"
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
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
                    Confirm Period Allocation
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
