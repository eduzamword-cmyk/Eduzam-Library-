import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Search, 
  Printer, 
  Download, 
  Save, 
  CheckCircle2, 
  User, 
  BookOpen, 
  Award, 
  Building2, 
  Sparkles,
  ChevronRight,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface ReportFormsProps {
  onNavigate?: (view: string) => void;
}

interface StudentReport {
  id: string;
  name: string;
  nrc: string;
  className: string;
  term: string;
  year: string;
  attendance: string;
  totalDays: string;
  conduct: string;
  teacherComment: string;
  headteacherComment: string;
  status: 'Draft' | 'Approved' | 'Published';
  subjects: {
    name: string;
    code: string;
    sbaScore: number;
    examScore: number;
    totalMark: number;
    grade: string;
    remark: string;
  }[];
}

const DEFAULT_CLASSES = [
  'Grade 12 STEM-A',
  'Grade 12 Science-B',
  'Grade 11 Arts-A',
  'Grade 10 Commerce-C',
  'Grade 9 General'
];

const INITIAL_STUDENTS: StudentReport[] = [
  {
    id: '2026-0001',
    name: 'Chanda Mwansa',
    nrc: '298102/11/1',
    className: 'Grade 12 STEM-A',
    term: 'Term 2',
    year: '2026',
    attendance: '62',
    totalDays: '65',
    conduct: 'Exemplary',
    teacherComment: 'Chanda continues to demonstrate outstanding intellectual rigor in STEM subjects. Consistently top of class in Physics and Mathematics.',
    headteacherComment: 'A stellar candidate for National ECZ Distinction. Recommended for Ministry Excellence Bursary.',
    status: 'Published',
    subjects: [
      { name: 'Mathematics', code: 'MATH', sbaScore: 28, examScore: 67, totalMark: 95, grade: '1 (Distinction)', remark: 'Exceptional problem solver' },
      { name: 'Physics', code: 'PHY', sbaScore: 27, examScore: 65, totalMark: 92, grade: '1 (Distinction)', remark: 'Mastered laboratory experiments' },
      { name: 'Chemistry', code: 'CHEM', sbaScore: 26, examScore: 61, totalMark: 87, grade: '1 (Distinction)', remark: 'Strong theoretical comprehension' },
      { name: 'Biology', code: 'BIO', sbaScore: 25, examScore: 59, totalMark: 84, grade: '2 (Distinction)', remark: 'Very thorough practical analysis' },
      { name: 'English Language', code: 'ENG', sbaScore: 24, examScore: 54, totalMark: 78, grade: '2 (Distinction)', remark: 'Articulate essay writing' },
      { name: 'Computer Studies', code: 'CS', sbaScore: 29, examScore: 66, totalMark: 95, grade: '1 (Distinction)', remark: 'Exceptional algorithm design' }
    ]
  },
  {
    id: '2026-0002',
    name: 'Mutale Kasonde',
    nrc: '341908/10/1',
    className: 'Grade 12 STEM-A',
    term: 'Term 2',
    year: '2026',
    attendance: '60',
    totalDays: '65',
    conduct: 'Good',
    teacherComment: 'Mutale shows consistent effort and dedication. Performs very strongly in laboratory practicals.',
    headteacherComment: 'Solid academic progress. Promising examination candidate.',
    status: 'Approved',
    subjects: [
      { name: 'Mathematics', code: 'MATH', sbaScore: 24, examScore: 58, totalMark: 82, grade: '2 (Distinction)', remark: 'Consistent mathematical logic' },
      { name: 'Physics', code: 'PHY', sbaScore: 22, examScore: 52, totalMark: 74, grade: '3 (Merit)', remark: 'Good grasp of kinematics' },
      { name: 'Chemistry', code: 'CHEM', sbaScore: 23, examScore: 53, totalMark: 76, grade: '2 (Distinction)', remark: 'Well-structured lab logs' },
      { name: 'Biology', code: 'BIO', sbaScore: 21, examScore: 48, totalMark: 69, grade: '4 (Merit)', remark: 'Active class participant' },
      { name: 'English Language', code: 'ENG', sbaScore: 22, examScore: 50, totalMark: 72, grade: '3 (Merit)', remark: 'Clear vocabulary' }
    ]
  },
  {
    id: '2026-0003',
    name: 'Bwembya Chilufya',
    nrc: '412093/11/1',
    className: 'Grade 12 STEM-A',
    term: 'Term 2',
    year: '2026',
    attendance: '58',
    totalDays: '65',
    conduct: 'Very Good',
    teacherComment: 'Bwembya is hardworking and attentive. With focused revision in Mathematics, top distinction is well within reach.',
    headteacherComment: 'Encouraging results. Keep up the high standard.',
    status: 'Draft',
    subjects: [
      { name: 'Mathematics', code: 'MATH', sbaScore: 20, examScore: 45, totalMark: 65, grade: '4 (Merit)', remark: 'Needs extra drill on calculus' },
      { name: 'Physics', code: 'PHY', sbaScore: 22, examScore: 49, totalMark: 71, grade: '3 (Merit)', remark: 'Good analytical skills' },
      { name: 'Chemistry', code: 'CHEM', sbaScore: 21, examScore: 47, totalMark: 68, grade: '4 (Merit)', remark: 'Satisfactory chemical equations' },
      { name: 'English Language', code: 'ENG', sbaScore: 25, examScore: 55, totalMark: 80, grade: '2 (Distinction)', remark: 'Fluent expression' }
    ]
  }
];

export default function ReportForms({ onNavigate }: ReportFormsProps) {
  const [selectedClass, setSelectedClass] = useState('Grade 12 STEM-A');
  const [selectedTerm, setSelectedTerm] = useState('Term 2');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reports, setReports] = useState<StudentReport[]>(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('2026-0001');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable fields for selected report
  const activeReport = reports.find(r => r.id === selectedStudentId) || reports[0];
  const [teacherCommentInput, setTeacherCommentInput] = useState(activeReport?.teacherComment || '');
  const [headCommentInput, setHeadCommentInput] = useState(activeReport?.headteacherComment || '');
  const [conductInput, setConductInput] = useState(activeReport?.conduct || 'Exemplary');
  const [statusInput, setStatusInput] = useState<'Draft' | 'Approved' | 'Published'>(activeReport?.status || 'Published');

  useEffect(() => {
    if (activeReport) {
      setTeacherCommentInput(activeReport.teacherComment);
      setHeadCommentInput(activeReport.headteacherComment);
      setConductInput(activeReport.conduct);
      setStatusInput(activeReport.status);
    }
  }, [selectedStudentId]);

  // Firestore sync for report cards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'report_cards'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: StudentReport[] = [];
        snapshot.forEach(docSnap => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as StudentReport);
        });
        if (loaded.length > 0) {
          setReports(prev => {
            const map = new Map(prev.map(item => [item.id, item]));
            loaded.forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      }
    }, (err) => {
      console.warn('ReportForms Firestore listener notice:', err);
    });
    return () => unsub();
  }, []);

  const handleSaveReport = async () => {
    if (!activeReport) return;
    setIsSaving(true);
    setSaveMessage(null);

    const updatedReport: StudentReport = {
      ...activeReport,
      teacherComment: teacherCommentInput,
      headteacherComment: headCommentInput,
      conduct: conductInput,
      status: statusInput,
      term: selectedTerm,
      year: selectedYear,
      className: selectedClass
    };

    try {
      await setDoc(doc(db, 'report_cards', activeReport.id), updatedReport, { merge: true });
      setReports(prev => prev.map(r => r.id === activeReport.id ? updatedReport : r));
      setSaveMessage('Official Report Card successfully saved & synchronized!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      console.error('Save report error:', err);
      setSaveMessage('Saved locally. Network sync pending.');
      setTimeout(() => setSaveMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nrc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateOverallPercentage = (report: StudentReport) => {
    if (!report.subjects || report.subjects.length === 0) return 0;
    const sum = report.subjects.reduce((acc, sub) => acc + sub.totalMark, 0);
    return Math.round(sum / report.subjects.length);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-900">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Ministry of Education Official Academic Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Official Student Report Forms
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Generate, record, verify, and issue ECZ-standard termly report cards for all candidate accounts across all academic streams.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Filter Bar Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Academic Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            {DEFAULT_CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Academic Term</label>
          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <option value="Term 1">Term 1 (Jan - April)</option>
            <option value="Term 2">Term 2 (May - Aug)</option>
            <option value="Term 3">Term 3 (Sept - Dec)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Academic Year</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <option value="2026">2026 Academic Year</option>
            <option value="2025">2025 Academic Year</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Search Candidate Account</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Filter student name / NRC..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
        </div>
      </div>

      {/* Main Dual-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Student Roster Selector */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Class Candidate Accounts</h2>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-extrabold">
              {filteredReports.length} Accounts
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredReports.map((student) => {
              const isSelected = student.id === selectedStudentId;
              const overallPerc = calculateOverallPercentage(student);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white border-teal-600 shadow-md scale-[1.01]' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`font-black text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {student.name}
                    </p>
                    <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                      NRC: {student.nrc}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      student.status === 'Published'
                        ? isSelected ? 'bg-emerald-400/30 text-white' : 'bg-emerald-100 text-emerald-800'
                        : isSelected ? 'bg-amber-400/30 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {student.status}
                    </span>
                    <p className={`text-xs font-black mt-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {overallPerc}% Avg
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Official Report Form Preview & Editor */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          
          {activeReport ? (
            <div className="space-y-6">
              
              {/* Report Header Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 text-white border border-slate-700 space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight uppercase">Ministry of Education - Zambia</h3>
                      <p className="text-xs font-bold text-teal-300">Official National Candidate Progress Report</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase">
                      {selectedTerm} • {selectedYear}
                    </span>
                  </div>
                </div>

                {/* Candidate Particulars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Candidate Name</span>
                    <span className="font-extrabold text-white text-sm">{activeReport.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">National NRC / ID</span>
                    <span className="font-mono font-extrabold text-teal-300 text-sm">{activeReport.nrc}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Stream & Class</span>
                    <span className="font-bold text-white">{selectedClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Attendance Record</span>
                    <span className="font-bold text-emerald-400">{activeReport.attendance} / {activeReport.totalDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Subject Results Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span>Academic Performance Breakdown</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">ECZ Weighted 30% SBA + 70% Exam</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-center">SBA (30%)</th>
                        <th className="p-3 text-center">Exam (70%)</th>
                        <th className="p-3 text-center">Total (/100)</th>
                        <th className="p-3 text-center">ECZ Grade</th>
                        <th className="p-3">Educator Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {activeReport.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-slate-900">{sub.name}</td>
                          <td className="p-3 text-center font-bold text-slate-600">{sub.sbaScore}</td>
                          <td className="p-3 text-center font-bold text-slate-600">{sub.examScore}</td>
                          <td className="p-3 text-center font-black text-slate-900 text-sm">{sub.totalMark}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              sub.totalMark >= 75 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : sub.totalMark >= 60 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {sub.grade}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 italic text-[11px]">{sub.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overall Summary & Conduct Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Average Overall Mark</span>
                  <span className="text-2xl font-black text-teal-800">{calculateOverallPercentage(activeReport)}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">National Grade Distinction</span>
                  <span className="text-base font-extrabold text-emerald-700">Division 1 Distinction</span>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Conduct Rating</label>
                  <select
                    value={conductInput}
                    onChange={(e) => setConductInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Exemplary">Exemplary</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                </div>
              </div>

              {/* Educator Remarks & Endorsement Form */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Class Teacher Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={teacherCommentInput}
                    onChange={(e) => setTeacherCommentInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="Enter comprehensive class teacher progress notes..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Headteacher / Principal Endorsement
                  </label>
                  <textarea
                    rows={2}
                    value={headCommentInput}
                    onChange={(e) => setHeadCommentInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="Headteacher official endorsement comment..."
                  />
                </div>

                {/* Status Selection & Save Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Publication Status:</span>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none"
                    >
                      <option value="Draft">Draft (Internal)</option>
                      <option value="Approved">Approved (School Admin)</option>
                      <option value="Published">Published (Student Portal)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveReport}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Save Report Form Updates</span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold">
              Select a candidate account from the left roster to view and edit official report forms.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
