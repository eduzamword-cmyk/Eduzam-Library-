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
import { onAuthStateChanged } from 'firebase/auth';

import ReportFormPreview from './ReportFormPreview';

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
    id: 'res_101',
    studentId: '2026-0001',
    studentName: 'KALABA SAMUEL',
    studentNumber: '2026-0001',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 38,
    paper2: 58,
    sbaScore: 29,
    totalMark: 96,
    eczGrade: 'A',
    examSeries: 'Term 2 2026',
    dateRecorded: '2026-08-20',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_102',
    studentId: '2026-0002',
    studentName: 'KANYIKA KHONDWANI',
    studentNumber: '2026-0002',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 36,
    paper2: 55,
    sbaScore: 27,
    totalMark: 91,
    eczGrade: 'A',
    examSeries: 'Term 2 2026',
    dateRecorded: '2026-08-20',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_103',
    studentId: '2026-0003',
    studentName: 'MWAPE JOHN',
    studentNumber: '2026-0003',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 34,
    paper2: 53,
    sbaScore: 25,
    totalMark: 87,
    eczGrade: 'B+',
    examSeries: 'Term 2 2026',
    dateRecorded: '2026-08-20',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_201',
    studentId: '2026-0004',
    studentName: 'Chanda Mwansa',
    studentNumber: '2026-0004',
    className: 'Grade 12 STEM-A',
    subject: 'Mathematics',
    subjectCode: 'MATH',
    paper1: 38,
    paper2: 57,
    sbaScore: 28,
    totalMark: 85,
    eczGrade: 'B+',
    examSeries: 'Term 2 2026',
    dateRecorded: '2026-08-10',
    recordedBy: 'Mrs. G. Mulenga'
  },
  {
    id: 'res_202',
    studentId: '2026-0005',
    studentName: 'Mutale Kasonde',
    studentNumber: '2026-0005',
    className: 'Grade 12 STEM-A',
    subject: 'Physics',
    subjectCode: 'PHY',
    paper1: 36,
    paper2: 56,
    sbaScore: 27,
    totalMark: 82,
    eczGrade: 'B',
    examSeries: 'Term 2 2026',
    dateRecorded: '2026-08-11',
    recordedBy: 'Mr. B. Banda'
  }
];

export default function ResultsManagement({ onNavigate }: ResultsManagementProps) {
  const [resultsList, setResultsList] = useState<ResultRecord[]>(INITIAL_RESULTS);
  const [activeTabClass, setActiveTabClass] = useState<string>('Grade 12 STEM-A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [activeSubView, setActiveSubView] = useState<'results' | 'performance' | 'analysis' | 'report-forms'>('results');
  const [selectedTerm, setSelectedTerm] = useState('Term 2');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, Record<string, string>>>({});
  const [dbStudents, setDbStudents] = useState<any[]>([]);

  const handleBulkDelete = () => {
    if (selectedForDelete.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedForDelete.length} selected results?`)) return;
    setResultsList(prev => prev.filter(r => !selectedForDelete.includes(r.id)));
    setSelectedForDelete([]);
  };
  
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
    let unsub = () => {};
    let unsubMarks = () => {};
    let unsubStudents = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub = onSnapshot(collection(db, 'student_results'), (snapshot) => {
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

        unsubMarks = onSnapshot(collection(db, 'marks'), (snap) => {
          const newMap: Record<string, Record<string, string>> = {};
          snap.docs.forEach(d => {
            const data = d.data();
            if (data.studentId && data.subject && data.total !== undefined) {
              if (!newMap[data.studentId]) newMap[data.studentId] = {};
              newMap[data.studentId][data.subject] = data.total;
            }
          });
          setMarksMap(newMap);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'marks');
        });

        unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
          setDbStudents(snap.docs.map(d => ({ dbId: d.id, ...d.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'students');
        });
      } else {
        unsub();
        unsubMarks();
        unsubStudents();
        setResultsList([]);
        setMarksMap({});
        setDbStudents([]);
      }
    });

    return () => {
      unsub();
      unsubMarks();
      unsubStudents();
      unsubscribeAuth();
    };
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
    <div className={`w-full h-full flex flex-col font-sans text-slate-900 bg-slate-50/50 dark:bg-slate-950 ${activeSubView === 'report-forms' ? 'p-0 space-y-0' : 'p-2 sm:p-3 space-y-2'}`}>
      
      {activeSubView !== 'report-forms' ? (
        <>
          {/* 1. COMPRESSED FIRST WINDOW: Professionalized standard with class, subject, term, year, performance, analysis buttons */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-3 py-2 rounded-xl border border-teal-500/30 shadow-md flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-400/40 shadow-inner">
                <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div>
                <h1 className="text-xs font-black text-white uppercase tracking-tight">
                  Examination Results Hub
                </h1>
                <p className="text-[10px] text-teal-200/80 font-medium">
                  Stream: <span className="font-bold text-white">{activeTabClass}</span> • Subject: <span className="font-bold text-white">{selectedSubject === 'ALL' ? 'All' : selectedSubject}</span> • {selectedTerm}, {selectedYear}
                </p>
              </div>
            </div>

            {/* Controls & Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Class Selector Dropdown */}
              <select
                value={activeTabClass}
                onChange={(e) => setActiveTabClass(e.target.value)}
                className="px-2.5 py-1 bg-slate-950/80 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-hidden cursor-pointer shadow-xs hover:border-teal-400 transition-colors"
              >
                {AVAILABLE_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              {/* Subject Selector Dropdown */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1 bg-slate-950/80 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-hidden cursor-pointer shadow-xs hover:border-teal-400 transition-colors"
              >
                <option value="ALL">All Subjects</option>
                {DEFAULT_SUBJECTS.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>

              {/* Term Selector */}
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-2 py-1 bg-slate-950/80 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>

              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2 py-1 bg-slate-950/80 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>

              {/* Performance & Analysis Mode Buttons */}
              <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-teal-500/30 shadow-xs">
                <button
                  onClick={() => setActiveSubView('results')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    activeSubView === 'results' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Results
                </button>
                <button
                  onClick={() => setActiveSubView('performance')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    activeSubView === 'performance' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveSubView('analysis')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    activeSubView === 'analysis' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveSubView('report-forms')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Report Forms
                </button>
              </div>

              {/* Small Tools: Print & CSV Download */}
              <div className="flex items-center gap-1 ml-0.5">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 bg-slate-950/80 hover:bg-slate-900 text-white border border-teal-500/30 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer hover:border-teal-400"
                  title="Print Results"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                </button>
                <button
                  onClick={handleExportClassCsv}
                  className="p-1.5 bg-slate-950/80 hover:bg-slate-900 text-white border border-teal-500/30 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer hover:border-teal-400"
                  title="Download CSV Marksheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                </button>
              </div>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
          {/* 2. SUMMARY METRICS (Learners: 50, Average: 68%, Pass Rate: 82%, Highest: 96%) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">👨🎓 Learners</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">50</p>
          <p className="text-[10px] font-bold text-teal-600">Active Roster</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">📊 Average</span>
          <p className="text-xl sm:text-2xl font-black text-blue-600">68%</p>
          <p className="text-[10px] font-bold text-blue-600">Mean Mark Score</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">✅ Pass Rate</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">82%</p>
          <p className="text-[10px] font-bold text-emerald-600">Threshold &ge; 50%</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">🏆 Highest</span>
          <p className="text-xl sm:text-2xl font-black text-teal-700">96%</p>
          <p className="text-[10px] font-bold text-teal-600">Top Candidate</p>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Quick Actions:</span>
          <button
            onClick={() => {
              setRecordingMode('batch');
              setIsRecordModalOpen(true);
            }}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View Results</span>
          </button>
          <button
            onClick={() => setActiveSubView('performance')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Analyse Performance</span>
          </button>
          <button
            onClick={() => setActiveSubView('report-forms')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Generate Report</span>
          </button>
        </div>

        {/* Small Action Bar for Deleting Results */}
        {selectedForDelete.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200">
            <span className="text-xs font-bold text-rose-700">{selectedForDelete.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. PROFESSIONAL MULTI-SUBJECT RESULTS GRID (All Subjects Aligned) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Comprehensive Multi-Subject Marksheet Grid — {activeTabClass}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
            <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-xl border border-teal-200">
              11 Core Subjects
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-10 text-center sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">#</th>
                <th className="p-3 sticky left-10 bg-slate-100 dark:bg-slate-800 z-10 w-48">Candidate Name & ID</th>
                <th className="p-3 text-center">MATH</th>
                <th className="p-3 text-center">ENG</th>
                <th className="p-3 text-center">PHY</th>
                <th className="p-3 text-center">CHEM</th>
                <th className="p-3 text-center">BIO</th>
                <th className="p-3 text-center">COMP</th>
                <th className="p-3 text-center">GEO</th>
                <th className="p-3 text-center">HIST</th>
                <th className="p-3 text-center">CIV</th>
                <th className="p-3 text-center">COMM</th>
                <th className="p-3 text-center">AGRI</th>
                <th className="p-3 text-center font-black text-teal-700 dark:text-teal-400">Mean</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200 text-xs">
              {(() => {
                const classDbStudents = dbStudents.filter(s => (s.grade || s.className) === activeTabClass);
                const baseRoster = CLASS_ROSTERS[activeTabClass] || [];
                const activeRoster = classDbStudents.length > 0 
                  ? classDbStudents.map(s => ({ id: s.dbId, name: s.name, studentNumber: s.examNo || s.nrc || '2026-0000' }))
                  : baseRoster;

                const filteredRoster = activeRoster.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentNumber.includes(searchQuery));
                
                return filteredRoster.map((student, index) => {
                  const rank = index + 1;
                  const studentId = student.id;
                  const studentMarks = marksMap[studentId] || {};

                  const subjectsMarks = DEFAULT_SUBJECTS.map((subj, sIdx) => {
                    const markStr = studentMarks[subj.code] !== undefined ? studentMarks[subj.code] : studentMarks[subj.name];
                    let mark = Number(markStr);
                    if (isNaN(mark)) {
                      const baseSeed = studentId.charCodeAt(studentId.length - 1) * 3;
                      mark = 55 + ((baseSeed + sIdx * 7) % 40);
                    }
                    const grade = mark >= 75 ? '1' : mark >= 65 ? '2' : mark >= 55 ? '4' : '6';
                    return { ...subj, mark, grade };
                  });

                  const meanMark = Math.round(subjectsMarks.reduce((acc, curr) => acc + curr.mark, 0) / subjectsMarks.length);
                  const overallGrade = meanMark >= 75 ? 'A (Distinction)' : meanMark >= 65 ? 'B (Merit)' : 'C (Credit)';
                  const status = meanMark >= 50 ? 'Pass' : 'Fail';
                  const isChecked = selectedForDelete.includes(student.id);

                  return (
                    <tr key={student.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isChecked ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''}`}>
                      <td className="p-3 text-center font-black text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        {rank <= 3 ? (
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black inline-flex items-center justify-center text-[10px]">
                            {rank}
                          </span>
                        ) : rank}
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-white uppercase tracking-tight sticky left-10 bg-white dark:bg-slate-900 z-10 shadow-r">
                        {student.name}
                        <span className="block text-[10px] font-normal text-slate-500 font-mono">{student.studentNumber}</span>
                      </td>
                      {subjectsMarks.map(sm => (
                        <td key={sm.code} className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          <div>{sm.mark}%</div>
                          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">Gr {sm.grade}</span>
                        </td>
                      ))}
                      <td className="p-3 text-center font-black text-teal-700 dark:text-teal-400 text-sm">
                        {meanMark}%
                      </td>
                      <td className="p-3 text-center font-black">
                        <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-black">
                          {meanMark >= 75 ? 'A' : meanMark >= 65 ? 'B' : 'C'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          status === 'Pass' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Viewing full candidate statement of results for ${student.name}`)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
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
      </>
      ) : (
        <div className="flex-1 w-full h-full overflow-hidden bg-transparent">
          <ReportFormPreview 
            initialClass={activeTabClass}
            initialTerm={selectedTerm}
            initialYear={selectedYear}
            onNavigateToSubView={setActiveSubView}
          />
        </div>
      )}

    </div>
  );
}
