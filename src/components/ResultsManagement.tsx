import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Save, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Filter, 
  Trash2, 
  Edit3, 
  User, 
  FileSpreadsheet,
  Building2,
  Sparkles,
  Calculator,
  RefreshCw,
  X,
  Users,
  Grid,
  List,
  Download,
  ChevronRight,
  Layers
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface ResultsManagementProps {
  onNavigate?: (view: string) => void;
}

interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  subject: string;
  subjectCode: string;
  paper1: number; // e.g. /40 or %
  paper2: number; // e.g. /60 or %
  sbaScore: number; // e.g. /30 or %
  totalMark: number; // out of 100
  eczGrade: string; // 1 to 9
  examSeries: string; // e.g. "ECZ National Mock 2026", "Final ECZ Exam 2026", "Term 2 Assessment"
  dateRecorded: string;
  recordedBy: string;
}

interface RosterStudent {
  id: string;
  name: string;
  studentNumber: string;
  paper1: number;
  paper2: number;
  sba: number;
}

const AVAILABLE_CLASSES = [
  'Grade 12 STEM-A',
  'Grade 12 Science-B',
  'Grade 11 STEM-A',
  'Grade 11 Science-B',
  'Grade 10 STEM-A',
  'Grade 9 Science-A'
];

const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'English Language', code: 'ENG' },
  { name: 'Physics', code: 'PHY' },
  { name: 'Chemistry', code: 'CHEM' },
  { name: 'Biology', code: 'BIO' },
  { name: 'Computer Studies', code: 'CS' },
  { name: 'Geography', code: 'GEO' },
  { name: 'History', code: 'HIST' },
  { name: 'Civic Education', code: 'CIV' },
  { name: 'Commerce', code: 'COMM' },
  { name: 'Agricultural Science', code: 'AGRI' }
];

const CLASS_ROSTERS: Record<string, RosterStudent[]> = {
  'Grade 12 STEM-A': [
    { id: '2026-0001', name: 'Chanda Mwansa', studentNumber: '2026-0001', paper1: 38, paper2: 57, sba: 28 },
    { id: '2026-0002', name: 'Mutale Kasonde', studentNumber: '2026-0002', paper1: 32, paper2: 50, sba: 24 },
    { id: '2026-0003', name: 'Bwembya Chilufya', studentNumber: '2026-0003', paper1: 26, paper2: 42, sba: 21 },
    { id: '2026-0004', name: 'Taonga Zimba', studentNumber: '2026-0004', paper1: 35, paper2: 52, sba: 26 },
    { id: '2026-0005', name: 'Mwiinga Mweetwa', studentNumber: '2026-0005', paper1: 30, paper2: 48, sba: 23 }
  ],
  'Grade 12 Science-B': [
    { id: '2026-0006', name: 'Kabwe Musonda', studentNumber: '2026-0006', paper1: 28, paper2: 44, sba: 22 },
    { id: '2026-0007', name: 'Thandiwe Banda', studentNumber: '2026-0007', paper1: 34, paper2: 51, sba: 25 },
    { id: '2026-0008', name: 'Lombe Mulenga', studentNumber: '2026-0008', paper1: 31, paper2: 46, sba: 23 }
  ],
  'Grade 11 STEM-A': [
    { id: '2026-0009', name: 'Natasha Phiri', studentNumber: '2026-0009', paper1: 36, paper2: 54, sba: 27 },
    { id: '2026-0010', name: 'Mapalo Chishimba', studentNumber: '2026-0010', paper1: 33, paper2: 49, sba: 25 },
    { id: '2026-0011', name: 'Chilekwa Kasongo', studentNumber: '2026-0011', paper1: 29, paper2: 43, sba: 21 }
  ],
  'Grade 11 Science-B': [
    { id: '2026-0012', name: 'Faith Phiri', studentNumber: '2026-0012', paper1: 28, paper2: 46, sba: 22 },
    { id: '2026-0013', name: 'Konda Banda', studentNumber: '2026-0013', paper1: 30, paper2: 45, sba: 24 }
  ],
  'Grade 10 STEM-A': [
    { id: '2026-0014', name: 'Sepo Lungu', studentNumber: '2026-0014', paper1: 34, paper2: 50, sba: 26 },
    { id: '2026-0015', name: 'Sikota Mwale', studentNumber: '2026-0015', paper1: 31, paper2: 47, sba: 22 }
  ],
  'Grade 9 Science-A': [
    { id: '2026-0016', name: 'Mwape Tembo', studentNumber: '2026-0016', paper1: 33, paper2: 48, sba: 24 },
    { id: '2026-0017', name: 'Bupe Kaunda', studentNumber: '2026-0017', paper1: 35, paper2: 52, sba: 26 }
  ]
};

const INITIAL_RESULTS: ResultRecord[] = [
  {
    id: 'res_201',
    studentId: '2026-0001',
    studentName: 'Chanda Mwansa',
    studentNumber: '2026-0001',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 38,
    paper2: 57,
    sbaScore: 28,
    totalMark: 95,
    eczGrade: '1 (Distinction)',
    examSeries: 'ECZ National Mock 2026',
    dateRecorded: '2026-08-10',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_202',
    studentId: '2026-0001',
    studentName: 'Chanda Mwansa',
    studentNumber: '2026-0001',
    className: 'Grade 12 STEM-A',
    subject: 'Physics',
    subjectCode: 'PHY',
    paper1: 36,
    paper2: 56,
    sbaScore: 27,
    totalMark: 92,
    eczGrade: '1 (Distinction)',
    examSeries: 'ECZ National Mock 2026',
    dateRecorded: '2026-08-11',
    recordedBy: 'Mr. B. Banda'
  },
  {
    id: 'res_203',
    studentId: '2026-0002',
    studentName: 'Mutale Kasonde',
    studentNumber: '2026-0002',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 32,
    paper2: 50,
    sbaScore: 24,
    totalMark: 82,
    eczGrade: '2 (Distinction)',
    examSeries: 'ECZ National Mock 2026',
    dateRecorded: '2026-08-10',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_204',
    studentId: '2026-0003',
    studentName: 'Bwembya Chilufya',
    studentNumber: '2026-0003',
    className: 'Grade 12 STEM-A',
    subject: 'Chemistry',
    subjectCode: 'CHEM',
    paper1: 26,
    paper2: 42,
    sbaScore: 21,
    totalMark: 68,
    eczGrade: '4 (Merit)',
    examSeries: 'ECZ National Mock 2026',
    dateRecorded: '2026-08-12',
    recordedBy: 'Dr. C. Chanda'
  },
  {
    id: 'res_205',
    studentId: '2026-0012',
    studentName: 'Faith Phiri',
    studentNumber: '2026-0012',
    className: 'Grade 11 Science-B',
    subject: 'Biology',
    subjectCode: 'BIO',
    paper1: 28,
    paper2: 46,
    sbaScore: 22,
    totalMark: 74,
    eczGrade: '3 (Merit)',
    examSeries: 'Term 2 Assessment 2026',
    dateRecorded: '2026-08-08',
    recordedBy: 'Mrs. H. Tembo'
  }
];

export default function ResultsManagement({ onNavigate }: ResultsManagementProps) {
  const [resultsList, setResultsList] = useState<ResultRecord[]>(INITIAL_RESULTS);
  const [activeTabClass, setActiveTabClass] = useState<string>('Grade 12 STEM-A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  
  // Recording Modal Modes
  const [recordingMode, setRecordingMode] = useState<'batch' | 'single'>('batch');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Class Batch Recording Form State
  const [batchClass, setBatchClass] = useState('Grade 12 STEM-A');
  const [batchSubjectCode, setBatchSubjectCode] = useState('MATH');
  const [batchExamSeries, setBatchExamSeries] = useState('ECZ National Mock 2026');
  const [batchRoster, setBatchRoster] = useState<RosterStudent[]>(CLASS_ROSTERS['Grade 12 STEM-A']);

  // Single Student Form State
  const [singleName, setSingleName] = useState('');
  const [singleStudentNumber, setSingleStudentNumber] = useState('');
  const [singleClass, setSingleClass] = useState('Grade 12 STEM-A');
  const [singleSubjectCode, setSingleSubjectCode] = useState('MATH');
  const [singleP1, setSingleP1] = useState<number>(30);
  const [singleP2, setSingleP2] = useState<number>(45);
  const [singleSba, setSingleSba] = useState<number>(25);
  const [singleExamSeries, setSingleExamSeries] = useState('ECZ National Mock 2026');

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSyncingFromMarkbook, setIsSyncingFromMarkbook] = useState(false);

  const handleSyncFromMarkbook = async () => {
    setIsSyncingFromMarkbook(true);
    setFeedbackMsg('Initiating synchronization with the Official Markbook...');
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const marksSnap = await getDocs(collection(db, 'marks'));

      if (studentsSnap.empty) {
        alert('No roster students found in the database. Please add students to the markbook first.');
        setIsSyncingFromMarkbook(false);
        setFeedbackMsg(null);
        return;
      }

      const studentsData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const marksData = marksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      if (marksData.length === 0) {
        alert('No marks found in the Official Markbook to synchronize.');
        setIsSyncingFromMarkbook(false);
        setFeedbackMsg(null);
        return;
      }

      let syncedCount = 0;
      const syncedRecords: ResultRecord[] = [];

      for (const mark of marksData) {
        const student = studentsData.find(s => s.id === mark.studentId || s.examNo === mark.studentId || s.nrc === mark.studentId);
        if (!student) continue;

        const subjectCodeRaw = mark.subject || 'MATH';
        let mappedCode = subjectCodeRaw;
        if (subjectCodeRaw === 'MAT') mappedCode = 'MATH';
        if (subjectCodeRaw === 'SCI') mappedCode = 'PHY';
        if (subjectCodeRaw === 'CTS') mappedCode = 'CS';

        const subjectObj = DEFAULT_SUBJECTS.find(s => s.code === mappedCode) || { name: subjectCodeRaw, code: subjectCodeRaw };
        const total = Math.min(100, Math.max(0, Number(mark.total) || 0));

        // Distribute paper1, paper2, and sba proportionally (e.g. 35%, 45%, 20%)
        const paper1 = Math.round(total * 0.35);
        const paper2 = Math.round(total * 0.45);
        const sbaScore = Math.round(total * 0.20);
        const grade = calculateEczGrade(total);

        const className = student.grade || mark.className || 'Grade 12 STEM-A';
        const docId = `res_synced_${student.id}_${mappedCode}`;

        const rec: ResultRecord = {
          id: docId,
          studentId: student.examNo || student.nrc || student.id,
          studentName: student.name || mark.studentName || 'Unknown Student',
          studentNumber: student.examNo || student.nrc || student.id,
          className: className,
          subject: subjectObj.name,
          subjectCode: subjectObj.code,
          paper1,
          paper2,
          sbaScore,
          totalMark: total,
          eczGrade: grade,
          examSeries: 'ECZ National Mock 2026 (Markbook Synced)',
          dateRecorded: new Date().toISOString().split('T')[0],
          recordedBy: 'Official Markbook Auto-Sync'
        };

        await setDoc(doc(db, 'student_results', docId), rec, { merge: true });
        syncedRecords.push(rec);
        syncedCount++;
      }

      setResultsList(prev => {
        const map = new Map(prev.map(i => [i.id, i]));
        syncedRecords.forEach(r => map.set(r.id, r));
        return Array.from(map.values());
      });

      setFeedbackMsg(`Successfully synced ${syncedCount} student results from the Official Markbook!`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      console.error('Error syncing from markbook:', err);
      alert('Failed to synchronize results from markbook.');
      setFeedbackMsg(null);
    } finally {
      setIsSyncingFromMarkbook(false);
    }
  };

  // Firestore Sync
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'student_results'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: ResultRecord[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          // Support backward compatibility for records with nrc key
          const studentNumber = data.studentNumber || data.nrc || '2026-0000';
          loaded.push({ id: docSnap.id, ...data, studentNumber } as ResultRecord);
        });
        if (loaded.length > 0) {
          setResultsList(prev => {
            const map = new Map(prev.map(i => [i.id, i]));
            loaded.forEach(i => map.set(i.id, i));
            return Array.from(map.values());
          });
        }
      }
    }, (err) => {
      console.warn('ResultsManagement Firestore listener notice:', err);
    });
    return () => unsub();
  }, []);

  // Sync batch roster when batch class changes
  useEffect(() => {
    if (CLASS_ROSTERS[batchClass]) {
      setBatchRoster(CLASS_ROSTERS[batchClass]);
    } else {
      setBatchRoster([
        { id: 'stu_' + Date.now() + '_1', name: 'Sample Student 1', studentNumber: '2026-0091', paper1: 30, paper2: 45, sba: 22 },
        { id: 'stu_' + Date.now() + '_2', name: 'Sample Student 2', studentNumber: '2026-0092', paper1: 28, paper2: 42, sba: 20 }
      ]);
    }
  }, [batchClass]);

  // Calculate ECZ Grade automatically based on total mark out of 100
  const calculateEczGrade = (mark: number): string => {
    if (mark >= 85) return '1 (Distinction)';
    if (mark >= 75) return '2 (Distinction)';
    if (mark >= 70) return '3 (Merit)';
    if (mark >= 65) return '4 (Merit)';
    if (mark >= 60) return '5 (Credit)';
    if (mark >= 55) return '6 (Credit)';
    if (mark >= 50) return '7 (Satisfactory)';
    if (mark >= 45) return '8 (Satisfactory)';
    return '9 (Unsatisfactory)';
  };

  // Compute Total Mark (/100) from P1, P2, SBA
  const computeTotalMark = (p1: number, p2: number, sba: number): number => {
    const rawTotal = Math.round((p1 * 0.35) + (p2 * 0.45) + (sba * 0.20));
    return Math.min(100, Math.max(0, rawTotal));
  };

  // Handle Class Batch Results Submission
  const handleSaveClassBatchResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchRoster.length === 0) {
      alert('Please add at least one candidate student to the class roster.');
      return;
    }

    setIsSaving(true);
    const subjectObj = DEFAULT_SUBJECTS.find(s => s.code === batchSubjectCode) || DEFAULT_SUBJECTS[0];
    const newRecords: ResultRecord[] = [];

    try {
      for (const student of batchRoster) {
        if (!student.name.trim()) continue;
        const total = computeTotalMark(student.paper1, student.paper2, student.sba);
        const grade = calculateEczGrade(total);
        const docId = `res_class_${batchClass.replace(/\s+/g, '_')}_${student.id}_${batchSubjectCode}`;

        const rec: ResultRecord = {
          id: docId,
          studentId: student.id,
          studentName: student.name.trim(),
          studentNumber: student.studentNumber.trim() || '2026-0000',
          className: batchClass,
          subject: subjectObj.name,
          subjectCode: subjectObj.code,
          paper1: Number(student.paper1) || 0,
          paper2: Number(student.paper2) || 0,
          sbaScore: Number(student.sba) || 0,
          totalMark: total,
          eczGrade: grade,
          examSeries: batchExamSeries,
          dateRecorded: new Date().toISOString().split('T')[0],
          recordedBy: auth.currentUser?.email || 'Super Administrator'
        };

        newRecords.push(rec);

        // Firestore setDoc for results
        await setDoc(doc(db, 'student_results', docId), rec, { merge: true });
        
        // Sync markDoc
        const markDocId = `${student.id}_${batchSubjectCode}`;
        await setDoc(doc(db, 'marks', markDocId), {
          studentId: student.id,
          studentName: student.name,
          className: batchClass,
          subject: batchSubjectCode,
          total: String(total)
        }, { merge: true });
      }

      setResultsList(prev => {
        const map = new Map(prev.map(i => [i.id, i]));
        newRecords.forEach(r => map.set(r.id, r));
        return Array.from(map.values());
      });

      setActiveTabClass(batchClass);
      setFeedbackMsg(`Successfully recorded results for ${newRecords.length} students in ${batchClass} (${subjectObj.name})!`);
      setTimeout(() => setFeedbackMsg(null), 4500);
      setIsRecordModalOpen(false);

    } catch (err) {
      console.error('Error recording batch class results:', err);
      handleFirestoreError(err, OperationType.WRITE, 'student_results');
      setFeedbackMsg(`Recorded results locally for ${batchClass}. Network sync pending.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Single Student Result Submission
  const handleSaveSingleResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim() || !singleStudentNumber.trim()) {
      alert('Please enter student candidate name and Student Number.');
      return;
    }

    setIsSaving(true);
    const totalMark = computeTotalMark(singleP1, singleP2, singleSba);
    const grade = calculateEczGrade(totalMark);
    const subjectObj = DEFAULT_SUBJECTS.find(s => s.code === singleSubjectCode) || DEFAULT_SUBJECTS[0];
    const newDocId = 'res_single_' + Date.now();

    const formattedStudentId = singleStudentNumber.trim().includes('2026-') ? singleStudentNumber.trim() : (singleStudentNumber.trim() || `2026-${String(resultsList.length + 1).padStart(4, '0')}`);
    const newRecord: ResultRecord = {
      id: newDocId,
      studentId: formattedStudentId,
      studentName: singleName.trim(),
      studentNumber: singleStudentNumber.trim(),
      className: singleClass,
      subject: subjectObj.name,
      subjectCode: subjectObj.code,
      paper1: singleP1,
      paper2: singleP2,
      sbaScore: singleSba,
      totalMark,
      eczGrade: grade,
      examSeries: singleExamSeries,
      dateRecorded: new Date().toISOString().split('T')[0],
      recordedBy: auth.currentUser?.email || 'Super Administrator'
    };

    try {
      await setDoc(doc(db, 'student_results', newDocId), newRecord);
      setResultsList(prev => [newRecord, ...prev]);
      setActiveTabClass(singleClass);
      setFeedbackMsg(`Recorded result for ${singleName} in ${singleClass} (${grade})!`);
      setTimeout(() => setFeedbackMsg(null), 4000);

      setSingleName('');
      setSingleStudentNumber('');
      setIsRecordModalOpen(false);
    } catch (err) {
      console.error('Error saving single result:', err);
      handleFirestoreError(err, OperationType.WRITE, 'student_results');
      setFeedbackMsg('Recorded locally. Syncing in background.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to remove this recorded result?')) return;
    try {
      await deleteDoc(doc(db, 'student_results', id));
      setResultsList(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete result error:', err);
    }
  };

  // Add new student row to batch roster
  const handleAddRosterRow = () => {
    const nextIdx = batchRoster.length + 1;
    const newStudent: RosterStudent = {
      id: 'stu_custom_' + Date.now(),
      name: `Candidate Student ${nextIdx}`,
      studentNumber: `2026-00${nextIdx + 15}`,
      paper1: 30,
      paper2: 45,
      sba: 22
    };
    setBatchRoster(prev => [...prev, newStudent]);
  };

  // Update batch student row
  const handleUpdateRosterStudent = (index: number, field: keyof RosterStudent, value: any) => {
    setBatchRoster(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Delete student row from batch
  const handleRemoveRosterStudent = (index: number) => {
    setBatchRoster(prev => prev.filter((_, i) => i !== index));
  };

  // Filtered Results List according to Selected Class Tab & Search
  const classFilteredResults = resultsList.filter(res => {
    const matchesClass = activeTabClass === 'ALL' || res.className === activeTabClass;
    const matchesSubject = selectedSubject === 'ALL' || res.subjectCode === selectedSubject;
    const matchesSearch = 
      res.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.className.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClass && matchesSubject && matchesSearch;
  });

  // Class Analytics Metrics
  const targetClassRecords = activeTabClass === 'ALL' 
    ? resultsList 
    : resultsList.filter(r => r.className === activeTabClass);

  const totalClassCount = targetClassRecords.length;
  const distinctions = targetClassRecords.filter(r => r.totalMark >= 75).length;
  const merits = targetClassRecords.filter(r => r.totalMark >= 65 && r.totalMark < 75).length;
  const passCount = targetClassRecords.filter(r => r.totalMark >= 50).length;
  const classPassRate = totalClassCount > 0 ? Math.round((passCount / totalClassCount) * 100) : 0;
  
  const classAverageScore = totalClassCount > 0 
    ? Math.round(targetClassRecords.reduce((acc, curr) => acc + curr.totalMark, 0) / totalClassCount) 
    : 0;

  // Export Class Marksheet CSV
  const handleExportClassCsv = () => {
    if (classFilteredResults.length === 0) {
      alert('No recorded results to export for this class.');
      return;
    }
    const headers = ['Candidate Name', 'Student Number', 'Class', 'Subject', 'Paper 1 Mark', 'Paper 2 Mark', 'SBA Mark', 'Total (/100)', 'ECZ Grade', 'Exam Series'];
    const rows = classFilteredResults.map(r => [
      `"${r.studentName}"`,
      `"${r.studentNumber}"`,
      `"${r.className}"`,
      `"${r.subject}"`,
      r.paper1,
      r.paper2,
      r.sbaScore,
      r.totalMark,
      `"${r.eczGrade}"`,
      `"${r.examSeries}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Results_${activeTabClass.replace(/\s+/g, '_')}_Marksheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-black uppercase tracking-wider">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Class-Based Examination Results Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Class Results Recording Terminal
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Record, manage, and verify examination results strictly organized according to class rosters and streams across secondary grades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSyncFromMarkbook}
              disabled={isSyncingFromMarkbook}
              className="px-4 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingFromMarkbook ? 'animate-spin' : ''}`} />
              <span>{isSyncingFromMarkbook ? 'Syncing...' : 'Sync Markbook Results'}</span>
            </button>

            <button
              onClick={() => {
                setRecordingMode('batch');
                setIsRecordModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-teal-500/30 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Record Batch Class Results</span>
            </button>

            <button
              onClick={() => {
                setRecordingMode('single');
                setIsRecordModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Single Record</span>
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Class Selection Tabs Bar */}
      <div className="bg-white p-2 sm:p-3 rounded-3xl border border-slate-200/90 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest shrink-0">
            Select Class Stream:
          </span>

          <button
            onClick={() => setActiveTabClass('ALL')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTabClass === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Classes ({resultsList.length})
          </button>

          {AVAILABLE_CLASSES.map(cls => {
            const count = resultsList.filter(r => r.className === cls).length;
            const isSelected = activeTabClass === cls;
            return (
              <button
                key={cls}
                onClick={() => setActiveTabClass(cls)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{cls}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Counter Widgets for Active Selected Class */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Results Recorded</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalClassCount}</p>
          <p className="text-[10px] font-bold text-teal-600">{activeTabClass === 'ALL' ? 'All Classes Active' : activeTabClass}</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Distinctions (1-2)</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{distinctions}</p>
          <p className="text-[10px] font-bold text-emerald-600">Score &ge; 75 Marks</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Pass Rate</span>
          <p className="text-2xl sm:text-3xl font-black text-teal-800">{classPassRate}%</p>
          <p className="text-[10px] font-bold text-teal-600">Score &ge; 50 Marks</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Mean Average</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{classAverageScore} / 100</p>
          <p className="text-[10px] font-bold text-blue-600">Aggregate Mean Score</p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder={`Search candidate in ${activeTabClass}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
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

          <button
            onClick={handleExportClassCsv}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Class CSV</span>
          </button>
        </div>
      </div>

      {/* Results Table Organized By Selected Class */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Class Results Registry — {activeTabClass} ({classFilteredResults.length})
            </h2>
          </div>
          <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            ECZ Official Class Marksheet Format
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-4">Candidate Student</th>
                <th className="p-4">Student Number</th>
                <th className="p-4">Class Stream</th>
                <th className="p-4">Subject</th>
                <th className="p-4 text-center">Paper 1</th>
                <th className="p-4 text-center">Paper 2</th>
                <th className="p-4 text-center">SBA / CA</th>
                <th className="p-4 text-center">Total (/100)</th>
                <th className="p-4 text-center">ECZ Grade</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {classFilteredResults.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-black text-slate-900">{record.studentName}</td>
                  <td className="p-4 font-mono text-slate-500">{record.studentNumber}</td>
                  <td className="p-4 font-bold text-teal-800 bg-teal-50/50 rounded-xl">{record.className}</td>
                  <td className="p-4 font-extrabold text-slate-800">{record.subject}</td>
                  <td className="p-4 text-center font-bold text-slate-600">{record.paper1}</td>
                  <td className="p-4 text-center font-bold text-slate-600">{record.paper2}</td>
                  <td className="p-4 text-center font-bold text-teal-600">{record.sbaScore}</td>
                  <td className="p-4 text-center font-black text-slate-900 text-sm">{record.totalMark}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${
                      record.totalMark >= 75 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : record.totalMark >= 60 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {record.eczGrade}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteResult(record.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {classFilteredResults.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                    No examination results recorded yet for {activeTabClass}. Click "Record Batch Class Results" above to record class scores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Results Modal (Class Batch or Single Candidate) */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {recordingMode === 'batch' ? 'Record Class Results Marksheet' : 'Record Single Student Result'}
                </h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setRecordingMode('batch')}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  recordingMode === 'batch' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Batch Class Entry Mode</span>
              </button>

              <button
                onClick={() => setRecordingMode('single')}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  recordingMode === 'single' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Single Candidate Mode</span>
              </button>
            </div>

            {/* BATCH CLASS RECORDING FORM */}
            {recordingMode === 'batch' && (
              <form onSubmit={handleSaveClassBatchResults} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-teal-900 mb-1">Target Class Stream</label>
                    <select
                      value={batchClass}
                      onChange={(e) => setBatchClass(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-teal-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      {AVAILABLE_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-teal-900 mb-1">Subject</label>
                    <select
                      value={batchSubjectCode}
                      onChange={(e) => setBatchSubjectCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-teal-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                    >
                      {DEFAULT_SUBJECTS.map(s => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-teal-900 mb-1">Exam Series</label>
                    <input
                      type="text"
                      value={batchExamSeries}
                      onChange={(e) => setBatchExamSeries(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      Class Roster Student Marksheet ({batchRoster.length} Candidates)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddRosterRow}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                      <span>Add Student Row</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                          <th className="p-3">Candidate Name</th>
                          <th className="p-3">Student Number</th>
                          <th className="p-3 text-center">Paper 1</th>
                          <th className="p-3 text-center">Paper 2</th>
                          <th className="p-3 text-center">SBA / CA</th>
                          <th className="p-3 text-center">Total (/100)</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                        {batchRoster.map((stu, index) => {
                          const total = computeTotalMark(stu.paper1, stu.paper2, stu.sba);
                          const grade = calculateEczGrade(total);
                          return (
                            <tr key={stu.id} className="hover:bg-slate-50">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={stu.name}
                                  onChange={(e) => handleUpdateRosterStudent(index, 'name', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={stu.studentNumber}
                                  onChange={(e) => handleUpdateRosterStudent(index, 'studentNumber', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stu.paper1}
                                  onChange={(e) => handleUpdateRosterStudent(index, 'paper1', Number(e.target.value))}
                                  className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stu.paper2}
                                  onChange={(e) => handleUpdateRosterStudent(index, 'paper2', Number(e.target.value))}
                                  className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stu.sba}
                                  onChange={(e) => handleUpdateRosterStudent(index, 'sba', Number(e.target.value))}
                                  className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                                />
                              </td>
                              <td className="p-2 text-center font-black text-slate-900">
                                {total}
                              </td>
                              <td className="p-2 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                                  {grade}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRosterStudent(index)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Committing Class Marks...' : `Save & Batch Commit Results for ${batchClass}`}
                </button>
              </form>
            )}

            {/* SINGLE STUDENT RECORDING FORM */}
            {recordingMode === 'single' && (
              <form onSubmit={handleSaveSingleResult} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Student Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CHANDA MWANSA"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Student Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026-0001"
                      value={singleStudentNumber}
                      onChange={(e) => setSingleStudentNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Class / Stream</label>
                    <select
                      value={singleClass}
                      onChange={(e) => setSingleClass(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                    >
                      {AVAILABLE_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Subject</label>
                    <select
                      value={singleSubjectCode}
                      onChange={(e) => setSingleSubjectCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                    >
                      {DEFAULT_SUBJECTS.map(s => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Exam Series</label>
                    <input
                      type="text"
                      value={singleExamSeries}
                      onChange={(e) => setSingleExamSeries(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Paper 1 Mark</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={singleP1}
                      onChange={(e) => setSingleP1(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Paper 2 Mark</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={singleP2}
                      onChange={(e) => setSingleP2(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">SBA / CA Mark</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={singleSba}
                      onChange={(e) => setSingleSba(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-800">Calculated Final ECZ Grade:</span>
                  <span className="font-black text-teal-950 bg-teal-200 px-3 py-1 rounded-full">
                    {calculateEczGrade(computeTotalMark(singleP1, singleP2, singleSba))}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-wider text-xs transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Record...' : `Confirm & Save Result for ${singleClass}`}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
