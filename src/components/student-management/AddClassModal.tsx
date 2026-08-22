import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  X, 
  UserCog, 
  BookOpen, 
  Search, 
  Check, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Layers, 
  CheckCircle2, 
  Filter,
  Plus,
  HelpCircle
} from 'lucide-react';
import { ALL_CBC_SUBJECTS, CBC_CATEGORIES, getRecommendedCBCSubjects } from '../../data/cbcSubjects';
import { SchoolClass } from '../../types';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (classData: {
    name: string;
    grade: string;
    stream: string;
    room: string;
    capacity: number;
    classTeacherName: string;
    classTeacherEmail: string;
    classTeacherPhone: string;
    subjects: string[];
  }) => Promise<void>;
  editingClass: SchoolClass | null;
  institutionName: string;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  onSaveClass,
  editingClass,
  institutionName
}) => {
  const [className, setClassName] = useState(editingClass?.name || 'Grade 10A (Pure Sciences)');
  const [classGrade, setClassGrade] = useState(editingClass?.grade || 'Grade 10');
  const [classStream, setClassStream] = useState(editingClass?.stream || 'Pure Sciences');
  const [classRoom, setClassRoom] = useState(editingClass?.room || 'Science Lab 2');
  const [classCapacity, setClassCapacity] = useState<number>(editingClass?.capacity || 45);
  const [classTeacherName, setClassTeacherName] = useState(editingClass?.classTeacherName || 'Mr. Mulenga Phiri');
  const [classTeacherEmail, setClassTeacherEmail] = useState(editingClass?.classTeacherEmail || 'm.phiri@munaliboys.edu.zm');
  const [classTeacherPhone, setClassTeacherPhone] = useState(editingClass?.classTeacherPhone || '+260 97 712 3456');
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    editingClass?.subjects && editingClass.subjects.length > 0 
      ? editingClass.subjects 
      : getRecommendedCBCSubjects('Grade 10', 'Pure Sciences')
  );

  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownSubjectSelect, setDropdownSubjectSelect] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Sync state when editingClass changes
  React.useEffect(() => {
    if (editingClass) {
      setClassName(editingClass.name);
      setClassGrade(editingClass.grade);
      setClassStream(editingClass.stream || '');
      setClassRoom(editingClass.room || '');
      setClassCapacity(editingClass.capacity || 45);
      setClassTeacherName(editingClass.classTeacherName || '');
      setClassTeacherEmail(editingClass.classTeacherEmail || '');
      setClassTeacherPhone(editingClass.classTeacherPhone || '');
      setSelectedSubjects(editingClass.subjects || []);
    } else {
      setClassName('Grade 10A (Pure Sciences)');
      setClassGrade('Grade 10');
      setClassStream('Pure Sciences');
      setClassRoom('Science Lab 2');
      setClassCapacity(45);
      setClassTeacherName('Mr. Mulenga Phiri');
      setClassTeacherEmail('m.phiri@munaliboys.edu.zm');
      setClassTeacherPhone('+260 97 712 3456');
      setSelectedSubjects(getRecommendedCBCSubjects('Grade 10', 'Pure Sciences'));
    }
  }, [editingClass, isOpen]);

  // Filter CBC subjects based on category & search
  const filteredCBCSubjects = useMemo(() => {
    return ALL_CBC_SUBJECTS.filter((sub) => {
      const matchCat = selectedCategory === 'All Categories' || sub.category === selectedCategory;
      const matchSearch = !subjectSearch || 
        sub.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        sub.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(subjectSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, subjectSearch]);

  const toggleSubject = (name: string) => {
    if (selectedSubjects.includes(name)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== name));
    } else {
      setSelectedSubjects([...selectedSubjects, name]);
    }
  };

  const handleApplyPreset = (streamType: string) => {
    const recommended = getRecommendedCBCSubjects(classGrade, streamType);
    setSelectedSubjects(recommended);
    setClassStream(streamType);
    if (!editingClass) {
      setClassName(`${classGrade} (${streamType})`);
    }
  };

  const handleSelectFromDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedSubjects.includes(val)) {
      setSelectedSubjects([...selectedSubjects, val]);
      setDropdownSubjectSelect('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveClass({
        name: className.trim(),
        grade: classGrade,
        stream: classStream.trim() || 'General',
        room: classRoom.trim() || 'Main Block',
        capacity: Number(classCapacity) || 45,
        classTeacherName: classTeacherName.trim() || 'Unassigned',
        classTeacherEmail: classTeacherEmail.trim(),
        classTeacherPhone: classTeacherPhone.trim(),
        subjects: selectedSubjects
      });
      onClose();
    } catch (err) {
      console.error('Failed to save class:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${
            isFullScreen 
              ? 'w-full h-full max-w-[98vw] max-h-[96vh]' 
              : 'w-full max-w-5xl max-h-[88vh]'
          }`}
        >
          {/* Top Fullscreen Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl sm:rounded-t-3xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-xs">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
                  <span>{institutionName}</span>
                  <span>•</span>
                  <span>National CBC Curriculum Registry</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {editingClass ? `Edit Class: ${editingClass.name}` : 'Register New Class / Stream (Full-Screen Workspace)'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Capacity'}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body - Responsive 2-Column Split */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (5 Cols): Class Basics & Designated Class Teacher */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* 1. Class Structure Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-700" />
                    Class Structure & Classroom Details
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Class Title / Designation *</label>
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g. Grade 10A (Pure Sciences)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Academic Grade *</label>
                      <select
                        value={classGrade}
                        onChange={(e) => {
                          setClassGrade(e.target.value);
                          if (!editingClass) {
                            setClassName(`${e.target.value} (${classStream || 'Standard'})`);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-teal-500/40"
                      >
                        <option value="Grade 7">Grade 7 (Junior)</option>
                        <option value="Grade 8">Grade 8 (Junior)</option>
                        <option value="Grade 9">Grade 9 (Junior ECZ)</option>
                        <option value="Grade 10">Grade 10 (Senior)</option>
                        <option value="Grade 11">Grade 11 (Senior)</option>
                        <option value="Grade 12">Grade 12 (Senior ECZ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Stream / Pathway *</label>
                      <input
                        type="text"
                        value={classStream}
                        onChange={(e) => setClassStream(e.target.value)}
                        placeholder="e.g. Pure Sciences, Commercial"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Room / Lab</label>
                      <input
                        type="text"
                        value={classRoom}
                        onChange={(e) => setClassRoom(e.target.value)}
                        placeholder="e.g. Science Lab 2"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Max Enrolment Capacity</label>
                      <input
                        type="number"
                        min={10}
                        max={200}
                        value={classCapacity}
                        onChange={(e) => setClassCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Designated Class Teacher Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-teal-700" />
                      Designated Class Teacher In-Charge
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Pastoral Lead
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name & Title *</label>
                    <input
                      type="text"
                      required
                      value={classTeacherName}
                      onChange={(e) => setClassTeacherName(e.target.value)}
                      placeholder="e.g. Mr. Mulenga Phiri"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Teacher Email</label>
                      <input
                        type="email"
                        value={classTeacherEmail}
                        onChange={(e) => setClassTeacherEmail(e.target.value)}
                        placeholder="m.phiri@munaliboys.edu.zm"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone Contact</label>
                      <input
                        type="text"
                        value={classTeacherPhone}
                        onChange={(e) => setClassTeacherPhone(e.target.value)}
                        placeholder="+260 97 712 3456"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (7 Cols): ALL School CBC Subjects & Drop-Down Selector */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Header & Preset Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-700" />
                        CBC Curriculum Allocation ({selectedSubjects.length} subjects selected)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose from standard Competency-Based Curriculum subjects across all academic pathways.
                      </p>
                    </div>
                    
                    {/* Clear / Select All */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubjects([])}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Quick Pathway Bundles */}
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Quick Load CBC Pathway Bundles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Pure Sciences')}
                        className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        🔬 STEM Sciences
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Commercial & Business')}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        💼 Commercial
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Social Sciences & Arts')}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        🎨 Arts & Humanities
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('Technical & Vocational')}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        🛠️ TEVET Vocational
                      </button>
                    </div>
                  </div>

                  {/* Drop-Down Selector for ALL School CBC Subjects */}
                  <div className="pt-2 border-t border-slate-200/70">
                    <label className="block text-xs font-black text-teal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                      Add Individual CBC Subject From All School Drop-Down:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={dropdownSubjectSelect}
                        onChange={handleSelectFromDropdown}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-teal-300 bg-teal-50/50 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-teal-500/40"
                      >
                        <option value="">-- Choose Any School CBC Subject to Add --</option>
                        {ALL_CBC_SUBJECTS.map((sub) => {
                          const isAlreadySelected = selectedSubjects.includes(sub.name);
                          return (
                            <option key={sub.code} value={sub.name} disabled={isAlreadySelected}>
                              {isAlreadySelected ? `✓ ${sub.name} (Already Added)` : `${sub.name} [${sub.category}]`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar for Subject Catalog */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      placeholder="Search CBC subjects by name or code..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                  >
                    {CBC_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-2 bg-slate-50/60 rounded-2xl border border-slate-200/90">
                  {filteredCBCSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <div
                        key={sub.code}
                        onClick={() => toggleSubject(sub.name)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-white text-teal-800 border-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs font-bold truncate leading-tight ${
                              isSelected ? 'text-white' : 'text-slate-900'
                            }`}>
                              {sub.name}
                            </h4>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                              isSelected ? 'bg-white/20 text-teal-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {sub.code}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 truncate ${
                            isSelected ? 'text-teal-100' : 'text-slate-500'
                          }`}>
                            {sub.category}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Ready to assign: <strong className="text-slate-900">{selectedSubjects.length} CBC subjects</strong> to {className}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Class...' : editingClass ? 'Update Class Details' : 'Register Class & Allocations'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
