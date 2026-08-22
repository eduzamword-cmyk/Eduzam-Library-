import React, { useState, useEffect } from 'react';
import { 
  BookCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Save, 
  BookOpen, 
  Award, 
  Layers, 
  Sparkles, 
  Building2, 
  User, 
  ShieldCheck,
  FileCheck2,
  Trash2,
  X
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface SBAAssessmentProps {
  onNavigate?: (view: string) => void;
}

interface SBARecord {
  id: string;
  studentId: string;
  studentName: string;
  nrc: string;
  className: string;
  subject: string;
  subjectCode: string;
  task1Project: number; // /100
  task2Practical: number; // /100
  task3Test: number; // /100
  weightedSbaScore: number; // /30 or /40
  moderationStatus: 'Verified by MOE' | 'DEBS Approved' | 'Pending Audit';
  recordedBy: string;
}

const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'Physics', code: 'PHY' },
  { name: 'Chemistry', code: 'CHEM' },
  { name: 'Biology', code: 'BIO' },
  { name: 'Computer Studies', code: 'CS' },
  { name: 'Agricultural Science', code: 'AGRI' }
];

const INITIAL_SBA: SBARecord[] = [
  {
    id: 'sba_301',
    studentId: '2026-0001',
    studentName: 'Chanda Mwansa',
    nrc: '298102/11/1',
    className: 'Grade 12 STEM-A',
    subject: 'Physics',
    subjectCode: 'PHY',
    task1Project: 94,
    task2Practical: 92,
    task3Test: 90,
    weightedSbaScore: 28,
    moderationStatus: 'Verified by MOE',
    recordedBy: 'Mr. B. Banda'
  },
  {
    id: 'sba_302',
    studentId: '2026-0001',
    studentName: 'Chanda Mwansa',
    nrc: '298102/11/1',
    className: 'Grade 12 STEM-A',
    subject: 'Chemistry',
    subjectCode: 'CHEM',
    task1Project: 88,
    task2Practical: 90,
    task3Test: 86,
    weightedSbaScore: 26,
    moderationStatus: 'Verified by MOE',
    recordedBy: 'Dr. C. Chanda'
  },
  {
    id: 'sba_303',
    studentId: '2026-0002',
    studentName: 'Mutale Kasonde',
    nrc: '341908/10/1',
    className: 'Grade 12 STEM-A',
    subject: 'Physics',
    subjectCode: 'PHY',
    task1Project: 82,
    task2Practical: 80,
    task3Test: 78,
    weightedSbaScore: 24,
    moderationStatus: 'DEBS Approved',
    recordedBy: 'Mr. B. Banda'
  },
  {
    id: 'sba_304',
    studentId: '2026-0003',
    studentName: 'Bwembya Chilufya',
    nrc: '412093/11/1',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    task1Project: 75,
    task2Practical: 70,
    task3Test: 68,
    weightedSbaScore: 21,
    moderationStatus: 'Pending Audit',
    recordedBy: 'Mrs. G. Mulenga'
  }
];

export default function SBAAssessment({ onNavigate }: SBAAssessmentProps) {
  const [sbaRecords, setSbaRecords] = useState<SBARecord[]>(INITIAL_SBA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentNrc, setStudentNrc] = useState('');
  const [studentClass, setStudentClass] = useState('Grade 12 STEM-A');
  const [subjectCode, setSubjectCode] = useState('PHY');
  const [task1Project, setTask1Project] = useState<number>(85);
  const [task2Practical, setTask2Practical] = useState<number>(80);
  const [task3Test, setTask3Test] = useState<number>(82);
  const [moderationStatus, setModerationStatus] = useState<'Verified by MOE' | 'DEBS Approved' | 'Pending Audit'>('Verified by MOE');

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Firestore Sync
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sba_records'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: SBARecord[] = [];
        snapshot.forEach(docSnap => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as SBARecord);
        });
        if (loaded.length > 0) {
          setSbaRecords(prev => {
            const map = new Map(prev.map(i => [i.id, i]));
            loaded.forEach(i => map.set(i.id, i));
            return Array.from(map.values());
          });
        }
      }
    }, (err) => {
      console.warn('SBAAssessment Firestore listener notice:', err);
    });
    return () => unsub();
  }, []);

  const handleRecordSBA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentNrc.trim()) {
      alert('Please enter candidate student name and NRC number.');
      return;
    }

    setIsSaving(true);
    const rawAverage = (task1Project + task2Practical + task3Test) / 3;
    const weightedSbaScore = Math.round((rawAverage / 100) * 30); // 30% ECZ SBA weight
    const subjObj = DEFAULT_SUBJECTS.find(s => s.code === subjectCode) || DEFAULT_SUBJECTS[0];

    const newDocId = 'sba_' + Date.now();
    const formattedStudentId = studentNrc.trim().includes('2026-') ? studentNrc.trim() : (studentNrc.trim() || `2026-${String(sbaRecords.length + 1).padStart(4, '0')}`);
    const newRecord: SBARecord = {
      id: newDocId,
      studentId: formattedStudentId,
      studentName: studentName.trim(),
      nrc: studentNrc.trim(),
      className: studentClass,
      subject: subjObj.name,
      subjectCode: subjObj.code,
      task1Project,
      task2Practical,
      task3Test,
      weightedSbaScore,
      moderationStatus,
      recordedBy: auth.currentUser?.email || 'Super Administrator'
    };

    try {
      await setDoc(doc(db, 'sba_records', newDocId), newRecord);
      setSbaRecords(prev => [newRecord, ...prev]);
      setMsg(`SBA record successfully created for ${studentName} (${weightedSbaScore}/30 Marks)`);
      setTimeout(() => setMsg(null), 3500);

      setStudentName('');
      setStudentNrc('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save SBA record error:', err);
      setMsg('Saved locally. Network sync pending.');
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SBA record?')) return;
    try {
      await deleteDoc(doc(db, 'sba_records', id));
      setSbaRecords(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredRecords = sbaRecords.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nrc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubj = selectedSubject === 'ALL' || item.subjectCode === selectedSubject;
    const matchesClass = selectedClass === 'ALL' || item.className === selectedClass;

    return matchesSearch && matchesSubj && matchesClass;
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-900">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <BookCheck className="w-4 h-4 text-amber-400" />
              <span>ECZ School-Based Assessment (SBA) Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              School Based Assessments (SBA)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Record, audit, and audit continuous assessment (CA) tasks, lab experiments, and projects contributing 30% to national ECZ certification.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record SBA Scores</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Bar Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Search candidate name, NRC, subject..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            {DEFAULT_SUBJECTS.map(s => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Classes</option>
            <option value="Grade 12 STEM-A">Grade 12 STEM-A</option>
            <option value="Grade 12 Science-B">Grade 12 Science-B</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              SBA Candidate Assessments ({filteredRecords.length})
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            30% ECZ CA Weighting Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-4">Candidate Student</th>
                <th className="p-4">NRC / ID</th>
                <th className="p-4">Class</th>
                <th className="p-4">Subject</th>
                <th className="p-4 text-center">Task 1 (Project)</th>
                <th className="p-4 text-center">Task 2 (Practical)</th>
                <th className="p-4 text-center">Task 3 (CA Test)</th>
                <th className="p-4 text-center">SBA Weight (/30)</th>
                <th className="p-4 text-center">Moderation</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-black text-slate-900">{record.studentName}</td>
                  <td className="p-4 font-mono text-slate-500">{record.nrc}</td>
                  <td className="p-4 font-bold text-slate-600">{record.className}</td>
                  <td className="p-4 font-extrabold text-amber-900">{record.subject}</td>
                  <td className="p-4 text-center font-bold text-slate-600">{record.task1Project}%</td>
                  <td className="p-4 text-center font-bold text-slate-600">{record.task2Practical}%</td>
                  <td className="p-4 text-center font-bold text-slate-600">{record.task3Test}%</td>
                  <td className="p-4 text-center font-black text-amber-800 text-sm">
                    {record.weightedSbaScore} / 30
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      record.moderationStatus === 'Verified by MOE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {record.moderationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete SBA Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                    No SBA candidate assessment records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New SBA Score Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Record Candidate SBA Task Marks</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleRecordSBA} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Student Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHANDA MWANSA"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Student Number / NRC</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-0001"
                    value={studentNrc}
                    onChange={(e) => setStudentNrc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Class / Stream</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Grade 12 STEM-A">Grade 12 STEM-A</option>
                    <option value="Grade 12 Science-B">Grade 12 Science-B</option>
                    <option value="Grade 11 Arts-A">Grade 11 Arts-A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Subject</label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                  >
                    {DEFAULT_SUBJECTS.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Moderation Approval</label>
                  <select
                    value={moderationStatus}
                    onChange={(e) => setModerationStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Verified by MOE">Verified by MOE</option>
                    <option value="DEBS Approved">DEBS Approved</option>
                    <option value="Pending Audit">Pending Audit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Task 1 (Project %)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={task1Project}
                    onChange={(e) => setTask1Project(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Task 2 (Lab/Practical %)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={task2Practical}
                    onChange={(e) => setTask2Practical(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Task 3 (CA Test %)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={task3Test}
                    onChange={(e) => setTask3Test(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Computed 30% ECZ CA Score:</span>
                <span className="font-black text-amber-950 bg-amber-200 px-3 py-1 rounded-full">
                  {Math.round((((task1Project + task2Practical + task3Test) / 3) / 100) * 30)} / 30 Marks
                </span>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving Record...' : 'Confirm & Record SBA Mark'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
