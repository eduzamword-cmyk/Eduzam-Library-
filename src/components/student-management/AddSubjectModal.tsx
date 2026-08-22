import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Sparkles, UserCheck, Layers, BookCheck } from 'lucide-react';
import { ALL_CBC_SUBJECTS } from '../../data/cbcSubjects';
import { SchoolSubject } from '../../types';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subjectData: Omit<SchoolSubject, 'id'>) => Promise<void>;
  currentClassName?: string;
  currentClassId?: string;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
  currentClassName,
  currentClassId
}) => {
  const [selectedCBCSubject, setSelectedCBCSubject] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(5);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [syllabusType, setSyllabusType] = useState<'ECZ Core' | 'ECZ Elective' | 'Zambia National Curriculum' | 'Practical / Vocational'>('ECZ Core');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When a CBC subject is picked from drop-down
  const handleCBCSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCBCSubject(val);
    if (!val) return;

    const matched = ALL_CBC_SUBJECTS.find(s => s.name === val);
    if (matched) {
      setSubjectName(matched.name);
      setSubjectCode(matched.code);
      if (matched.category === 'Sciences & Mathematics (STEM)' || matched.category === 'Languages & Literature') {
        setSyllabusType('ECZ Core');
        setPeriodsPerWeek(6);
      } else if (matched.category === 'Technical, Practical & Vocational') {
        setSyllabusType('Practical / Vocational');
        setPeriodsPerWeek(5);
      } else {
        setSyllabusType('Zambia National Curriculum');
        setPeriodsPerWeek(4);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSubject({
        name: subjectName.trim(),
        code: subjectCode.trim().toUpperCase(),
        periodsPerWeek: Number(periodsPerWeek) || 4,
        teacherName: teacherName.trim() || 'Assigned Department Staff',
        teacherEmail: teacherEmail.trim(),
        syllabusType,
        className: currentClassName,
        classId: currentClassId
      });

      onClose();
      // Reset
      setSubjectName('');
      setSubjectCode('');
      setSelectedCBCSubject('');
      setTeacherName('');
      setTeacherEmail('');
    } catch (err) {
      console.error('Failed to add subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Add Subject to Class Roster</h3>
                <p className="text-xs text-slate-500">
                  {currentClassName ? `Allocating syllabus to ${currentClassName}` : 'Register CBC course unit'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Quick CBC Dropdown Picker */}
            <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2">
              <label className="block text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                Select From Official School CBC Subjects List:
              </label>
              <select
                value={selectedCBCSubject}
                onChange={handleCBCSelect}
                className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="">-- Choose From National CBC Curriculum Catalog --</option>
                {ALL_CBC_SUBJECTS.map((sub) => (
                  <option key={sub.code} value={sub.name}>
                    {sub.name} ({sub.code}) • {sub.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. PHYS-10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Track</label>
                <select
                  value={syllabusType}
                  onChange={(e) => setSyllabusType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold"
                >
                  <option value="ECZ Core">ECZ Core Examination</option>
                  <option value="ECZ Elective">ECZ Elective Course</option>
                  <option value="Zambia National Curriculum">Zambia CBC National</option>
                  <option value="Practical / Vocational">TEVET / Practical Vocational</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Periods</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Subject Teacher</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. L. Phiri"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Email</label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="l.phiri@munaliboys.edu.zm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Add Subject to Class'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
