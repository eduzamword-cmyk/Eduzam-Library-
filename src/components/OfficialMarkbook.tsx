import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, 
  ClipboardPaste,
  ArrowLeft,
  Lock, 
  Unlock, 
  User, 
  Search, 
  MoreVertical,
  CheckCircle2,
  Calculator,
  Camera,
  UserPlus,
  UserMinus,
  Palette,
  RefreshCw,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  GripHorizontal,
  Maximize2,
  Minimize2,
  X,
  FileSpreadsheet,
  Download,
  BookOpen,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Check,
  Filter
} from 'lucide-react';

import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const SUBJECTS = [
  { code: 'ENG', teacher: 'Mrs. G. Mulenga', locked: true },
  { code: 'MAT', teacher: 'Mr. B. Banda', locked: true },
  { code: 'SCI', teacher: 'Dr. L. Phiri', locked: false },
  { code: 'SOS', teacher: 'Ms. C. Mwale', locked: true },
  { code: 'CTS', teacher: 'Mr. J. Mwansa', locked: false },
  { code: 'HEC', teacher: 'Mrs. R. Zulu', locked: true },
  { code: 'PED', teacher: 'Mr. S. Chama', locked: false },
  { code: 'EXA', teacher: 'Ms. K. Tembo', locked: true },
  { code: 'LOC', teacher: 'Mrs. F. Lungu', locked: true },
  { code: 'CIV', teacher: 'Mr. D. Nyirongo', locked: false }
];

export default function OfficialMarkbook({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, Record<string, string>>>({});
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadExpanded, setKeypadExpanded] = useState(false);
  const [keypadScale, setKeypadScale] = useState<number>(1);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = keypadScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartDistRef.current > 0) {
        const scaleFactor = currentDist / touchStartDistRef.current;
        const newScale = Math.min(Math.max(touchStartScaleRef.current * scaleFactor, 0.6), 2.5);
        setKeypadScale(newScale);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
    }
  };
  const [theme, setTheme] = useState<'light' | 'dark' | 'emerald' | 'navy'>('light');
  const isDarkMode = theme !== 'light';
  const [pasteData, setPasteData] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [activeModal, setActiveModal] = useState<'class' | 'record' | 'addStudent' | 'removeStudent' | 'term' | 'theme' | null>(null);
  
  // User Role & Admin / Super Admin Authorization logic
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('user_role') || 'SUPER_ADMIN';
  });

  const currentUserEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || '';
  const isAdminOrSuperAdmin = 
    userRole === 'SUPER_ADMIN' || 
    userRole === 'ADMIN' || 
    userRole === 'SCHOOL_HEAD' || 
    userRole === 'PROVINCIAL_DIRECTOR' || 
    userRole === 'INSTITUTION_ADMIN' ||
    currentUserEmail.toLowerCase().includes('admin') ||
    currentUserEmail.toLowerCase().includes('super');

  const [selectedCell, setSelectedCell] = useState<{studentId: string; subject: string} | null>(null);
  const [tempMarkValue, setTempMarkValue] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [scoreFilterMode, setScoreFilterMode] = useState<'ALL' | 'TOP' | 'SUPPORT' | 'CENTURY'>('ALL');
  const ALPHABET_STRIP = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [addStudentMode, setAddStudentMode] = useState<'single' | 'paste'>('single');
  const [bulkPasteText, setBulkPasteText] = useState('');

  // Auto-adjustment engine for quick paste and single name input (Enforces CAPITAL LETTERS & Trimmed Alignment)
  const autoAdjustName = (rawText: string, index: number): { name: string; examNo: string } => {
    let text = rawText.trim();
    if (!text) return { name: `STUDENT ${index + 1}`, examNo: `2026-${String(students.length + index + 1).padStart(4, '0')}` };

    let examNo = '';
    const idMatch = text.match(/\b(2026-\d{4}|\d{4}-\d{4}|\d{8,10}|\d{6}\/\d{2}\/\d)\b/i);
    if (idMatch) {
      examNo = idMatch[1].toUpperCase();
      text = text.replace(idMatch[0], ' ');
    }

    // Remove leading numbering, bullets, list indexes (e.g. 1. , 01) , [1] , • , - )
    text = text.replace(/^[\s\d]+[.)\-\]\:]+\s*/g, '');
    text = text.replace(/^[\s•\*\-\>\#\~\|\t]+\s*/g, '');

    // Remove trailing/enclosed metadata like "(Grade 12)", "[12 STEM-A]", "(M)", "(F)", " - Male"
    text = text.replace(/\s*\((?:Grade|Gr|Class|G\d+|Male|Female|M|F|Active|STEM|Arts|ECZ)[^\)]*\)/gi, '');
    text = text.replace(/\s*\[(?:Grade|Gr|Class|G\d+|Male|Female|M|F|Active|STEM|Arts|ECZ)[^\]]*\]/gi, '');
    text = text.replace(/\s*-\s*(?:Male|Female|Active|Candidate|Day|Boarding|STEM)\b/gi, '');

    // Handle "LASTNAME, FIRSTNAME"
    if (text.includes(',')) {
      const commaParts = text.split(',').map(p => p.trim()).filter(Boolean);
      if (commaParts.length === 2 && !/\d/.test(commaParts[0]) && !/\d/.test(commaParts[1])) {
        text = `${commaParts[1]} ${commaParts[0]}`;
      } else {
        text = text.replace(/,/g, ' ');
      }
    }

    text = text.replace(/[|"';]/g, ' ');
    const formattedName = text
      .split(/\s+/)
      .filter(Boolean)
      .join(' ')
      .toUpperCase();

    if (!examNo) {
      examNo = `2026-${String(students.length + index + 1).padStart(4, '0')}`;
    }

    return {
      name: formattedName || `STUDENT ${index + 1}`,
      examNo
    };
  };

  const previewAdjustedMarkbookNames = React.useMemo(() => {
    if (!bulkPasteText.trim()) return [];
    return bulkPasteText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map((l, idx) => autoAdjustName(l, idx));
  }, [bulkPasteText, students.length]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSuperAdmin) {
      alert("Access Denied: Only Admins and Super Admins can add new students to the markbook roster.");
      return;
    }

    if (addStudentMode === 'paste') {
      const parsed = previewAdjustedMarkbookNames;
      if (parsed.length === 0) return;
      try {
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i];
          const studentId = 'stu_' + item.examNo.replace(/[^a-zA-Z0-9]/g, '_');
          await setDoc(doc(db, 'students', studentId), {
            name: item.name.toUpperCase(),
            nrc: item.examNo,
            examNo: item.examNo,
            grade: 'Grade 12',
            school: 'National High'
          }, { merge: true });
        }
        setBulkPasteText('');
        setActiveModal(null);
      } catch (err) {
        console.error("Failed to bulk add students", err);
      }
      return;
    }

    if (!newStudentName || !newStudentId) return;
    try {
      const formattedNum = newStudentId.trim() || `2026-${String(students.length + 1).padStart(4, '0')}`;
      const studentId = 'stu_' + formattedNum.replace(/[^a-zA-Z0-9]/g, '_');
      const adjusted = autoAdjustName(newStudentName, 0);
      await setDoc(doc(db, 'students', studentId), {
        name: (adjusted.name || newStudentName).toUpperCase(),
        nrc: formattedNum,
        examNo: formattedNum,
        grade: 'Grade 12',
        school: 'National High'
      });
      setNewStudentName('');
      setNewStudentId('');
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to add student", err);
    }
  };

  const handleDeleteStudent = async (dbId: string) => {
    if (!isAdminOrSuperAdmin) {
      alert("Access Denied: Only Admins and Super Admins can remove students from the markbook roster.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'students', dbId));
    } catch (err) {
      console.error("Failed to delete student", err);
    }
  };

  useEffect(() => {
     const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
        setStudents(snap.docs.map(d => ({ dbId: d.id, ...d.data() })));
     });

     const unsubMarks = onSnapshot(collection(db, 'marks'), (snap) => {
        const newMap: Record<string, Record<string, string>> = {};
        snap.docs.forEach(d => {
           const data = d.data();
           if (data.studentId && data.subject && data.total !== undefined) {
              if (!newMap[data.studentId]) newMap[data.studentId] = {};
              newMap[data.studentId][data.subject] = data.total;
           }
        });
        setMarksMap(newMap);
     });

     return () => { unsubStudents(); unsubMarks(); };
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus('Initiating secure sync...');

    setTimeout(() => {
      setSyncProgress(30);
      setSyncStatus('Syncing marks to learners portals...');
    }, 1000);

    setTimeout(() => {
      setSyncProgress(70);
      setSyncStatus('Generating updated report forms...');
    }, 2500);

    setTimeout(() => {
      setSyncProgress(100);
      setSyncStatus('Sync Complete!');
    }, 4000);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncProgress(0);
      setSyncStatus('');
    }, 5500);
  };

  const handleLockAll = () => {
    if (!isAdminOrSuperAdmin) {
      alert("Access Denied: Only Admins and Super Admins can lock or unlock all subjects.");
      return;
    }
    const allLocked = subjects.every(s => s.locked);
    setSubjects(subjects.map(s => ({ ...s, locked: !allLocked })));
  };

  const handleToggleSubjectLock = (subjectCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdminOrSuperAdmin) {
      alert("Access Denied: Only Admins and Super Admins can change subject column locks.");
      return;
    }
    setSubjects(prev => prev.map(s => s.code === subjectCode ? { ...s, locked: !s.locked } : s));
  };

  const handleCellClick = (studentId: string, subjectCode: string, currentValue: string) => {
     const sub = subjects.find(s => s.code === subjectCode);
     // Admins and Super Admins ALWAYS have markbook results editing access!
     if (sub?.locked && !isAdminOrSuperAdmin) {
       alert("Subject Locked: This subject is currently locked for standard teachers. Only Admins have editing permissions.");
       return; 
     }

     setSelectedCell({ studentId, subject: subjectCode });
     let capped = currentValue || '';
     setTempMarkValue(capped);
     setShowKeypad(true);
  };

  // Salted Deduplication: Remove duplicate candidate names to remain with unique single entries in CAPITAL LETTERS
  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    const result: typeof students = [];

    for (const s of students) {
      const uppercaseName = (s.name || '').toUpperCase().trim();
      if (uppercaseName && !seen.has(uppercaseName)) {
        seen.add(uppercaseName);
        result.push({ ...s, name: uppercaseName });
      }
    }

    return result;
  }, [students]);

  // Extended Search Matcher (Name, ID, Scores, Letter, Thresholds)
  const isStudentMatch = useCallback((s: typeof students[0]) => {
     const letter = selectedLetter && selectedLetter !== 'ALL' ? selectedLetter.trim().toLowerCase() : '';
     const query = searchTerm.trim().toLowerCase();
     const sName = (s.name || '').toLowerCase();
     const sId = (s.examNo || s.nrc || s.dbId || '').toLowerCase();

     // 1. Initial Letter match
     if (letter) {
        const matchesLetter = sName.startsWith(letter) || sName.split(/\s+/).some(w => w.startsWith(letter));
        if (!matchesLetter) return false;
     }

     // 2. Score Filter Mode match
     const studentMarks = marksMap[s.dbId] || {};
     const markValues = Object.values(studentMarks).map(v => parseFloat(v)).filter(v => !isNaN(v));

     if (scoreFilterMode === 'TOP' && !markValues.some(v => v >= 75)) return false;
     if (scoreFilterMode === 'SUPPORT' && !markValues.some(v => v < 50)) return false;
     if (scoreFilterMode === 'CENTURY' && !markValues.some(v => v === 100)) return false;

     // 3. Search Term query match
     if (query) {
        // Name or ID match
        const nameOrIdMatch = sName.includes(query) || sId.includes(query);
        if (nameOrIdMatch) return true;

        // Numeric or comparative score query match (e.g. '85', '>75', '<50')
        if (query.startsWith('>')) {
           const threshold = parseFloat(query.slice(1));
           if (!isNaN(threshold) && markValues.some(v => v > threshold)) return true;
        } else if (query.startsWith('<')) {
           const threshold = parseFloat(query.slice(1));
           if (!isNaN(threshold) && markValues.some(v => v < threshold)) return true;
        } else if (!isNaN(Number(query))) {
           const targetNum = parseFloat(query);
           if (markValues.some(v => v === targetNum || Math.floor(v) === targetNum)) return true;
        }

        // Keywords match
        if (query === 'top' || query === 'distinction' || query === 'high') {
           if (markValues.some(v => v >= 75)) return true;
        } else if (query === 'fail' || query === 'support' || query === 'low') {
           if (markValues.some(v => v < 50)) return true;
        } else if (query === '100' || query === 'perfect') {
           if (markValues.some(v => v === 100)) return true;
        }

        return false;
     }

     return true;
  }, [selectedLetter, searchTerm, scoreFilterMode, marksMap]);

  // Display of names must show ALL names even after search (matches prioritized at top)
  const filteredStudents = useMemo(() => {
     const allSorted = [...uniqueStudents].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
     
     if (!searchTerm.trim() && (!selectedLetter || selectedLetter === 'ALL') && scoreFilterMode === 'ALL') {
        return allSorted;
     }

     return [...allSorted].sort((a, b) => {
        const aMatch = isStudentMatch(a);
        const bMatch = isStudentMatch(b);

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;

        return (a.name || '').localeCompare(b.name || '');
     });
  }, [uniqueStudents, searchTerm, selectedLetter, scoreFilterMode, isStudentMatch]);

  const matchingCount = useMemo(() => {
     if (!searchTerm.trim() && (!selectedLetter || selectedLetter === 'ALL') && scoreFilterMode === 'ALL') {
        return uniqueStudents.length;
     }
     return uniqueStudents.filter(s => isStudentMatch(s)).length;
  }, [uniqueStudents, isStudentMatch, searchTerm, selectedLetter, scoreFilterMode]);

  // Candidate Navigation Up and Down arrows
  const handleNavigateCandidate = useCallback((direction: 'up' | 'down') => {
     if (filteredStudents.length === 0) return;

     let currentIndex = -1;
     if (selectedCell) {
        currentIndex = filteredStudents.findIndex(s => s.dbId === selectedCell.studentId);
     }

     let nextIndex = 0;
     if (currentIndex !== -1) {
        if (direction === 'up') {
           nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredStudents.length - 1;
        } else {
           nextIndex = currentIndex < filteredStudents.length - 1 ? currentIndex + 1 : 0;
        }
     }

     const nextStudent = filteredStudents[nextIndex];
     if (nextStudent) {
        const currentSubject = selectedCell?.subject || subjects[0]?.code || 'ENG';
        const mark = marksMap[nextStudent.dbId]?.[currentSubject] || '';
        setSelectedCell({ studentId: nextStudent.dbId, subject: currentSubject });
        setTempMarkValue(mark);
     }
  }, [filteredStudents, selectedCell, subjects, marksMap]);

  const handleKeypadPress = async (key: string) => {
     if (key === 'Prev') {
        handleNavigateCandidate('up');
        return;
     }

     let nextVal = tempMarkValue;
     if (key === 'Del' || key === 'DEL' || key === 'del') {
        nextVal = tempMarkValue.slice(0, -1);
     } else if (key === 'Clear' || key === 'CLR' || key === 'CRL' || key === 'crl' || key === 'clr') {
        nextVal = '';
     } else {
        nextVal = tempMarkValue + key;
     }

     // All entry of results must have highest score capped at 100
     if (nextVal !== '' && !isNaN(Number(nextVal))) {
        const numVal = parseFloat(nextVal);
        if (numVal > 100) {
           nextVal = '100';
        }
     }

     setTempMarkValue(nextVal);

     if (selectedCell) {
        const student = uniqueStudents.find(s => s.dbId === selectedCell.studentId);
        const docId = selectedCell.studentId + '_' + selectedCell.subject;
        
        // Instant memory sync for zero-latency markbook grid recording
        setMarksMap(prev => ({
           ...prev,
           [selectedCell.studentId]: {
              ...(prev[selectedCell.studentId] || {}),
              [selectedCell.subject]: nextVal
           }
        }));

        const markRef = doc(collection(db, 'marks'), docId);
        await setDoc(markRef, {
           studentId: selectedCell.studentId,
           studentName: student?.name || 'Unknown',
           subject: selectedCell.subject,
           total: nextVal
        }, { merge: true });
     }
  };

  const handleSaveMarksAndAdvance = useCallback(async (overrideValue?: string | React.MouseEvent) => {
     let targetCell = selectedCell;
     if (!targetCell && filteredStudents.length > 0 && subjects.length > 0) {
        const firstStudent = filteredStudents[0].dbId;
        const firstSubject = subjects[0].code;
        targetCell = { studentId: firstStudent, subject: firstSubject };
        setSelectedCell(targetCell);
     }

     if (targetCell) {
        let finalVal = (typeof overrideValue === 'string') ? overrideValue : tempMarkValue;
        if (finalVal !== '' && !isNaN(Number(finalVal))) {
           const numVal = parseFloat(finalVal);
           if (numVal > 100) {
              finalVal = '100';
           }
        }

        const student = uniqueStudents.find(s => s.dbId === targetCell!.studentId);
        const docId = targetCell.studentId + '_' + targetCell.subject;

        // Synchronous memory sync for zero-latency recording regardless of mark length
        setMarksMap(prev => ({
           ...prev,
           [targetCell!.studentId]: {
              ...(prev[targetCell!.studentId] || {}),
              [targetCell!.subject]: finalVal
           }
        }));

        // Async Firestore persistence
        const markRef = doc(collection(db, 'marks'), docId);
        setDoc(markRef, {
           studentId: targetCell.studentId,
           studentName: student?.name || 'Unknown',
           subject: targetCell.subject,
           total: finalVal
        }, { merge: true });
     }

     // Navigate seamlessly down to the next candidate
     handleNavigateCandidate('down');
  }, [selectedCell, filteredStudents, subjects, tempMarkValue, uniqueStudents, handleNavigateCandidate]);

  // Physical Keyboard Arrow Keys, Letters, and Enter support when keypad is active
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (!showKeypad) return;

        // Don't intercept if user is typing inside an active input or textarea
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        if (e.key === 'ArrowUp') {
           e.preventDefault();
           handleNavigateCandidate('up');
        } else if (e.key === 'ArrowDown') {
           e.preventDefault();
           handleNavigateCandidate('down');
        } else if (e.key === 'Enter') {
           e.preventDefault();
           handleSaveMarksAndAdvance();
        } else if (e.key === 'Backspace') {
           if (tempMarkValue) {
              setTempMarkValue(prev => prev.slice(0, -1));
           } else if (searchTerm) {
              setSearchTerm(prev => prev.slice(0, -1));
           }
        } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
           // Direct connection: Route physical letter keypresses directly to Markbook Search Engine!
           e.preventDefault();
           setSearchTerm(prev => prev + e.key.toUpperCase());
        }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeypad, handleNavigateCandidate, handleSaveMarksAndAdvance, tempMarkValue, searchTerm]);

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-900' : theme === 'emerald' ? 'bg-emerald-950' : theme === 'navy' ? 'bg-[#0b1120]' : 'bg-transparent'}`}>
      {/* Professional Icon Toolbar with Enhanced High-Clarity Icons & Backward Navigation */}
      <div className={`border-b px-3 md:px-6 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs z-50 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : theme === 'emerald' ? 'bg-emerald-900 border-emerald-800' : theme === 'navy' ? 'bg-[#1e293b] border-blue-900' : 'bg-white border-slate-200'}`}>
        
        {/* Left Side: Backward Navigation Sign */}
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Right Side Tools */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Icons Grid - Single Continuous Stretch of Square Containers & Lines */}
          <div className={`inline-flex items-center rounded-xl border divide-x shadow-xs overflow-x-auto max-w-full ${
          theme === 'dark' 
            ? 'bg-slate-800/90 border-slate-700 divide-slate-700' 
            : theme === 'emerald' 
            ? 'bg-emerald-900 border-emerald-800 divide-emerald-800' 
            : theme === 'navy' 
            ? 'bg-[#1e293b] border-blue-900 divide-blue-900' 
            : 'bg-white border-slate-300 divide-slate-200'
        }`}>
          {/* 1. Class Selector */}
          <button 
            onClick={() => setActiveModal('class')} 
            title="Select Class (Grade 12)" 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
          </button>

          {/* 2. Numerical Keypad */}
          <button 
            onClick={() => { 
              const nextState = !showKeypad;
              setShowKeypad(nextState); 
              if (nextState && !selectedCell && filteredStudents.length > 0 && subjects.length > 0) {
                const firstStudent = filteredStudents[0].dbId;
                const firstSubject = subjects[0].code;
                setSelectedCell({ studentId: firstStudent, subject: firstSubject });
                setTempMarkValue(marksMap[firstStudent]?.[firstSubject] || '');
              }
            }} 
            title="Numerical Keypad" 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              showKeypad 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <Calculator className={`w-6 h-6 md:w-7 md:h-7 stroke-[2.25] ${showKeypad ? 'text-white dark:text-black' : 'text-black dark:text-white'}`} />
          </button>

          {/* 3. Quick Record (Scan / Paste) */}
          <button 
            onClick={() => setActiveModal('record')} 
            title="Scan & Quick Record (Camera / Paste / Upload)" 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <Camera className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
          </button>

          {/* 4. Add Student */}
          <button 
            onClick={() => setActiveModal('addStudent')} 
            title={isAdminOrSuperAdmin ? "Add Student Record (Admin / Super Admin)" : "Add Student Record (Restricted to Admins & Super Admins)"} 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer relative ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
            {!isAdminOrSuperAdmin && (
              <Lock className="w-3.5 h-3.5 text-black dark:text-white absolute top-1 right-1" />
            )}
          </button>

          {/* 5. Remove Student */}
          <button 
            onClick={() => setActiveModal('removeStudent')} 
            title={isAdminOrSuperAdmin ? "Remove Student Record (Admin / Super Admin)" : "Remove Student Record (Restricted to Admins & Super Admins)"} 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer relative ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <UserMinus className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
            {!isAdminOrSuperAdmin && (
              <Lock className="w-3.5 h-3.5 text-black dark:text-white absolute top-1 right-1" />
            )}
          </button>

          {/* 6. Theme Selector */}
          <button 
            onClick={() => setActiveModal('theme')} 
            title="Change Theme Palette" 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <Palette className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
          </button>

          {/* 8. Term Selection */}
          <button 
            onClick={() => setActiveModal('term')} 
            title="Term Selection (Term 2)" 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
          </button>

          {/* 9. Lock / Unlock All */}
          <button 
            onClick={handleLockAll} 
            title={subjects.every(s => s.locked) ? "Unlock All Subjects" : "Lock All Subjects (ECZ Official)"} 
            className={`w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center transition-colors cursor-pointer ${
              subjects.every(s => s.locked) 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : isDarkMode 
                ? 'text-white hover:bg-slate-700' 
                : 'text-black hover:bg-slate-100'
            }`}
          >
            {subjects.every(s => s.locked) ? (
              <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-black stroke-[2.25]" />
            ) : (
              <ShieldAlert className="w-6 h-6 md:w-7 md:h-7 text-black dark:text-white stroke-[2.25]" />
            )}
          </button>
        </div>

        {/* Sync Marks Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/30 cursor-pointer shrink-0 disabled:opacity-80 ml-auto"
        >
          <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Save & Sync Marks'}</span>
        </button>
      </div>
      </div>

      {/* Pronounced & Extended Search Engine Control Section */}
      <div className={`px-3 md:px-6 py-2.5 border-b shadow-2xs z-40 transition-colors ${
        theme === 'dark' 
          ? 'bg-slate-900/90 border-slate-800' 
          : theme === 'emerald' 
          ? 'bg-emerald-950/90 border-emerald-900' 
          : theme === 'navy' 
          ? 'bg-[#0f172a] border-blue-950' 
          : 'bg-slate-50/90 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          {/* Extended Search Input Field with Bold High-Contrast Text & Match Badge */}
          <div className="flex-1 flex items-center gap-2.5">
            <div className={`relative flex-1 flex items-center rounded-2xl border-2 transition-all ${
              searchTerm 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-800' 
                : isDarkMode 
                ? 'bg-slate-800/90 border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20' 
                : 'bg-white border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-2xs'
            }`}>
              <Search className="w-5 h-5 ml-3 shrink-0 text-black dark:text-white stroke-[2.25]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates by Name, ID, or Score (e.g. '85', '>70', '<50')..."
                className="w-full pl-2.5 pr-8 py-2 text-xs md:text-sm font-black text-black dark:text-white placeholder-slate-400 focus:outline-none bg-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="p-1 mr-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Matches Badge */}
            <div className={`px-3 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-2xs ${
              searchTerm
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                : isDarkMode
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-200/80 text-slate-700 border-slate-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{matchingCount} {matchingCount === 1 ? 'Match' : 'Matches'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-Scrollable Sticky Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse border-spacing-0 min-w-max">
          <thead className="sticky top-0 z-30 shadow-sm">
            <tr className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
              {/* STICKY NAME HEADER */}
              <th className={`sticky left-0 z-40 border-b border-r px-4 md:px-8 py-3 md:py-5 text-left w-[130px] sm:w-[220px] md:w-[320px] min-w-[130px] sm:min-w-[220px] md:min-w-[320px] transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Student</span>
                  <MoreVertical className={`hidden md:block w-4 h-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                </div>
              </th>
              
              {/* STUDENT NUMBER HEADER */}
              <th className={`border-b border-r px-3 md:px-8 py-3 md:py-5 text-left w-[100px] md:w-[200px] min-w-[100px] md:min-w-[200px] transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Student ID</span>
              </th>

              {/* SUBJECT HEADERS WITH TEACHERS & LOCKERS */}
              {subjects.map((sub) => (
                <th key={sub.code} className={`border-b border-r px-2 md:px-4 py-3 md:py-5 w-[100px] md:w-[140px] min-w-[100px] md:min-w-[140px] text-center group transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs md:text-sm font-black tracking-tighter ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{sub.code}</span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSubjectLock(sub.code, e)}
                        className={`p-1 rounded-md transition-colors ${isAdminOrSuperAdmin ? 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer' : 'cursor-default'}`}
                        title={isAdminOrSuperAdmin ? (sub.locked ? "Subject Locked for teachers (Admin override active). Click to unlock column." : "Subject Unlocked. Click to lock column.") : (sub.locked ? "Locked Subject" : "Open Subject")}
                      >
                        {sub.locked ? (
                          <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </button>
                    </div>
                    <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tight truncate max-w-[80px] md:max-w-[120px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {sub.teacher}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
            {filteredStudents.map((student, idx) => (
              <tr key={idx} className={`group transition-colors ${isDarkMode ? 'hover:bg-indigo-900/20' : 'hover:bg-indigo-50/30'}`}>
                {/* STICKY NAME CELL - Slightly enlarged and strictly identical uniform font size */}
                <td className={`sticky left-0 z-20 border-r px-4 md:px-8 py-3.5 md:py-5 shadow-[4px_0_12px_rgba(0,0,0,0.02)] transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:bg-indigo-900/40' : 'bg-white border-slate-100 group-hover:bg-indigo-50/30'}`}>
                  <div className="flex flex-col justify-center">
                    <span className={`font-bold text-[15px] md:text-[16px] leading-snug tracking-tight truncate max-w-[130px] sm:max-w-[220px] md:max-w-none ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{student.name}</span>
                  </div>
                </td>

                {/* STUDENT NUMBER CELL */}
                <td className={`px-3 md:px-8 py-3.5 md:py-5 border-r transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <span className={`font-bold text-[11px] md:text-sm tracking-tight md:tracking-[0.1em] font-mono truncate max-w-[90px] md:max-w-none block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {student.examNo || (student.nrc && /^\d{4}-\d{4}$/.test(student.nrc) ? student.nrc : (student.nrc?.startsWith('2026-') ? student.nrc : `2026-${String(idx + 1).padStart(4, '0')}`))}
                  </span>
                </td>

                {/* SUBJECT MARKS */}
                {subjects.map((sub) => {
                  const isEditable = !sub.locked || isAdminOrSuperAdmin;
                  return (
                    <td key={sub.code} className={`px-2 md:px-4 py-3.5 md:py-5 border-r text-center transition-colors ${isDarkMode ? 'border-slate-700/50' : 'border-slate-50'}`}>
                      <div 
                        onClick={() => handleCellClick(student.dbId, sub.code, marksMap[student.dbId]?.[sub.code] || '')}
                        title={sub.locked && isAdminOrSuperAdmin ? "Admin Override: Direct Results Editing Enabled" : (sub.locked ? "Subject Locked" : "Click to edit mark")}
                        className={`inline-flex items-center justify-center w-12 h-9 md:w-14 md:h-10 rounded-lg md:rounded-xl border transition-all ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedCell?.studentId === student.dbId && selectedCell?.subject === sub.code ? 'ring-2 ring-indigo-500 bg-indigo-50/50 text-indigo-700' : isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:border-indigo-500/50 text-slate-300' : 'bg-white border-slate-100 group-hover:border-indigo-200 group-hover:shadow-sm text-slate-700'}`}>
                        <span className={`font-black text-sm md:text-base ${selectedCell?.studentId === student.dbId && selectedCell?.subject === sub.code ? 'animate-pulse text-indigo-600' : ''}`}>
                          {selectedCell?.studentId === student.dbId && selectedCell?.subject === sub.code ? tempMarkValue : (marksMap[student.dbId]?.[sub.code] || '-')}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Draggable Numerical Keypad with Pinch-to-Zoom */}
      {showKeypad && (
        <>
          {!keypadExpanded ? (
            /* COMPACT HORIZONTAL BOTTOM KEYPAD TOOLBAR AT THE VERY BOTTOM OF MARKBOOK */
            <div className="fixed bottom-0 left-0 right-0 z-[120] bg-slate-950/95 backdrop-blur-md text-white border-t border-slate-800 px-3 py-1.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 select-none">
              
              {/* Output Score Display Badge */}
              <div className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 font-mono font-black text-sm md:text-base rounded-lg border border-indigo-500/40 shrink-0 text-center min-w-[38px]">
                {tempMarkValue || '-'}
              </div>

              {/* Middle: Horizontal Row of Numeric Keypad Buttons with Letter Strip on Top */}
              <div className="flex flex-col gap-1 overflow-x-auto custom-scrollbar py-0.5 max-w-full flex-1">
                {/* A-Z Letter Quick Search Strip connected directly to Markbook Search Engine */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                  <span className="text-[10px] md:text-xs font-black uppercase text-indigo-400 mr-1 shrink-0">Letter Search:</span>
                  {ALPHABET_STRIP.map(letter => (
                    <button
                      key={letter}
                      onClick={() => {
                        const target = letter === 'ALL' ? '' : letter;
                        setSearchTerm(searchTerm === target ? '' : target);
                        setSelectedLetter(selectedLetter === letter ? '' : (letter === 'ALL' ? '' : letter));
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] md:text-xs font-black uppercase transition-all shrink-0 cursor-pointer ${
                        (searchTerm === letter || selectedLetter === letter) || (letter === 'ALL' && !searchTerm && !selectedLetter)
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Horizontal Row of Numeric Keypad Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                  {['1','2','3','4','5','6','7','8','9','0','Del','CRL'].map(key => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className={`px-2.5 py-1.5 rounded-lg font-black text-xs md:text-sm transition-all border flex items-center justify-center shrink-0 cursor-pointer ${
                        key === 'Del'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-800 hover:text-white'
                          : key === 'CRL' || key === 'CLR'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60 hover:bg-rose-800 hover:text-white'
                          : 'bg-slate-800 text-slate-100 border-slate-700/80 hover:bg-indigo-600 active:bg-indigo-700'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Navigation Controls, Save & Advance, Maximize and Close Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNavigateCandidate('up')}
                    className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all border border-slate-700/80 cursor-pointer"
                    title="Previous Candidate (Up)"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateCandidate('down')}
                    className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-all border border-slate-700/80 cursor-pointer"
                    title="Next Candidate (Down)"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Next</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveMarksAndAdvance}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enter & Advance</span>
                </button>

                <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                  <button 
                    onClick={() => setKeypadExpanded(true)} 
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Enlarge to Full Screen Master Terminal"
                  >
                    <Maximize2 className="w-4 h-4 text-indigo-400" />
                  </button>
                  <button 
                    onClick={() => setShowKeypad(false)} 
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Close Keypad Bar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ENLARGED FULL-SCREEN MASTER TERMINAL WITH COMPACT LETTER-ONLY TOP BAR & 2-COLUMN SCROLLABLE NUMBERS */
            <div className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col p-2.5 md:p-5 overflow-hidden animate-in fade-in duration-200">
              {/* Compact Top Control Bar with Letter Search Engine & Subject Tabs */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 mb-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* A-Z First Letter Quick Search Strip (Connected directly to Markbook Search Engine) */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5 flex-1 min-w-0">
                  <span className="text-[10px] md:text-xs font-black uppercase text-indigo-400 mr-1 shrink-0">Letter Search:</span>
                  {ALPHABET_STRIP.map(letter => (
                    <button
                      key={letter}
                      onClick={() => {
                        const target = letter === 'ALL' ? '' : letter;
                        setSearchTerm(searchTerm === target ? '' : target);
                        setSelectedLetter(selectedLetter === letter ? '' : (letter === 'ALL' ? '' : letter));
                      }}
                      className={`px-2 py-1 rounded-md text-xs md:text-sm font-black uppercase transition-all shrink-0 cursor-pointer ${
                        (searchTerm === letter || selectedLetter === letter) || (letter === 'ALL' && !searchTerm && !selectedLetter)
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Subject Selector Tabs & Window Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                    {subjects.map(sub => (
                      <button
                        key={sub.code}
                        onClick={() => {
                          const currentStudent = selectedCell?.studentId || filteredStudents[0]?.dbId;
                          if (currentStudent) {
                            const mark = marksMap[currentStudent]?.[sub.code] || '';
                            setSelectedCell({ studentId: currentStudent, subject: sub.code });
                            setTempMarkValue(mark);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all shrink-0 cursor-pointer ${
                          selectedCell?.subject === sub.code
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sub.code}
                      </button>
                    ))}
                  </div>

                  {/* Window Controls (Minimize & Close) */}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-800 shrink-0">
                    <button
                      onClick={() => setKeypadExpanded(false)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Return to Compact Floating Keypad"
                    >
                      <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                    <button
                      onClick={() => setShowKeypad(false)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Close Keypad"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Area: 2-Column Split */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
                {/* Left Column: Candidates Roster Drawer (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Aligned Candidates ({filteredStudents.length})
                    </span>
                    {selectedLetter && (
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Initial: '{selectedLetter}'
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filteredStudents.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-medium">
                        No candidate names match the selected letter.
                      </div>
                    ) : (
                      filteredStudents.map((s, idx) => {
                        const activeSubject = selectedCell?.subject || subjects[0]?.code || 'ENG';
                        const score = marksMap[s.dbId]?.[activeSubject] || '';
                        const isSelected = selectedCell?.studentId === s.dbId;

                        return (
                          <div
                            key={s.dbId}
                            onClick={() => {
                              setSelectedCell({ studentId: s.dbId, subject: activeSubject });
                              setTempMarkValue(score);
                            }}
                            className={`p-2.5 md:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                                : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <div className="truncate min-w-0">
                              <p className="font-black text-sm md:text-base text-white truncate">{s.name}</p>
                              <p className="text-[10px] md:text-xs font-mono text-slate-400 truncate">{s.examNo || s.nrc || `2026-${String(idx + 1).padStart(4, '0')}`}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-3 py-1 rounded-lg font-mono font-black text-sm md:text-base border ${
                                score 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              }`}>
                                {score || '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: Keypad Entry & Direct Search Engine Connection (7 cols) */}
                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between min-h-0">
                  <div className="space-y-2.5">
                    {/* Live Search Engine Connection Bar inside Master Terminal */}
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 absolute left-3 text-indigo-400 stroke-[2.25]" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search candidates by name or ID directly from keypad..."
                        className="w-full pl-9 pr-8 py-2 text-xs md:text-sm font-black bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')} 
                          className="absolute right-2.5 p-1 text-slate-400 hover:text-white cursor-pointer"
                          title="Clear Search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* All Numbers Visible in a Compact 4-Column Grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {['1','2','3','4','5','6','7','8','9','0','Del','CRL','Prev'].map(key => (
                        <button
                          key={key}
                          onClick={() => handleKeypadPress(key)}
                          className={`py-2 md:py-2.5 rounded-xl font-black text-xs md:text-sm transition-all border flex items-center justify-center cursor-pointer ${
                            key === 'Del'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-800 hover:text-white'
                              : key === 'CRL' || key === 'CLR'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60 hover:bg-rose-800 hover:text-white'
                              : key === 'Prev'
                              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60 hover:bg-indigo-700 hover:text-white'
                              : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-indigo-600 active:bg-indigo-700'
                          }`}
                        >
                          {key === 'Prev' ? '◄ Prev' : key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Save & Advance Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveMarksAndAdvance}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Enter Mark & Advance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sync Modal */}
      {isSyncing && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6">
              {syncProgress === 100 ? (
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {syncProgress === 100 ? 'Sync Complete' : 'Syncing Marks'}
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 h-5">
              {syncStatus}
            </p>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-black tracking-tight text-lg">
                {activeModal === 'class' && 'Select Class'}
                {activeModal === 'record' && 'Quick Record'}
                {activeModal === 'addStudent' && 'Add Student'}
                {activeModal === 'removeStudent' && 'Remove Student'}
                {activeModal === 'term' && 'Select Term'}
                {activeModal === 'theme' && 'Display Theme'}
              </h3>
              <button onClick={() => setActiveModal(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeModal === 'class' && (
                <div className="space-y-2">
                  {['Grade 12 STEM-A', 'Grade 12 Arts-B', 'Grade 11 Science', 'Grade 10 General'].map(cls => (
                    <button key={cls} onClick={() => setActiveModal(null)} className={`w-full p-4 rounded-xl text-left font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700' : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-100'}`}>
                      {cls}
                    </button>
                  ))}
                </div>
              )}

              {activeModal === 'record' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                     <button className={`py-2 flex items-center justify-center gap-2 rounded-lg border font-bold text-xs uppercase tracking-widest ${isDarkMode ? 'border-indigo-500/50 bg-indigo-900/20 text-indigo-400' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                        <Camera className="w-4 h-4" /> Camera
                     </button>
                     <button className={`py-2 flex items-center justify-center gap-2 rounded-lg border font-bold text-xs uppercase tracking-widest ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}>
                        <ClipboardPaste className="w-4 h-4" /> Paste
                     </button>
                  </div>
                  <textarea 
                     value={pasteData}
                     onChange={(e) => setPasteData(e.target.value)}
                     placeholder="Paste marks data here (e.g. 'John Doe MATH 85 ENG 90'). AI will automatically extract and map to the ledger."
                     className={`w-full h-32 p-4 rounded-xl text-sm outline-none resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'} border focus:border-indigo-500 transition-colors`}
                  />
                  <button 
                     onClick={async () => {
                         setIsParsing(true);
                         try {
                           await fetch('/api/gemini/generate', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ prompt: `Parse markbook data: ${pasteData.slice(0, 500)}` })
                           });
                         } catch (err) {
                           console.error(err);
                         } finally {
                           setIsParsing(false);
                           setActiveModal(null);
                           setPasteData('');
                         }
                     }}
                     disabled={isParsing || !pasteData}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                    {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isParsing ? 'Processing via AI...' : 'Parse & Import'}
                  </button>
                </div>
              )}

              {activeModal === 'addStudent' && (
                <div>
                  {!isAdminOrSuperAdmin ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">Admin Privilege Required</p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                            Only verified Admins and Super Admins can add new student candidate records to the official markbook roster.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Role: {userRole}</span>
                        <button 
                          onClick={() => {
                            setUserRole('SUPER_ADMIN');
                            localStorage.setItem('user_role', 'SUPER_ADMIN');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Switch to Super Admin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mode Toggle: Single vs Quick Paste */}
                      <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <button
                          type="button"
                          onClick={() => setAddStudentMode('single')}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${addStudentMode === 'single' ? 'bg-indigo-600 text-white shadow-xs' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Single Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddStudentMode('paste')}
                          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${addStudentMode === 'paste' ? 'bg-indigo-600 text-white shadow-xs' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Quick Paste (Auto-Adjust)
                        </button>
                      </div>

                      {addStudentMode === 'single' ? (
                        <form onSubmit={handleAddStudent} className="space-y-4">
                          <div>
                            <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                            <input 
                              type="text" 
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900'}`} 
                              placeholder="e.g. JOHN DOE" 
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Student ID (Format: 2026-0001)</label>
                            <input 
                              type="text" 
                              value={newStudentId}
                              onChange={(e) => setNewStudentId(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 text-slate-900'}`} 
                              placeholder={`e.g. 2026-${String(students.length + 1).padStart(4, '0')}`} 
                              required
                            />
                          </div>
                          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-emerald-600/20 mt-4 cursor-pointer">
                            Register Student
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleAddStudent} className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Paste Roster Names (One per line)
                              </label>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                <Sparkles className="w-3 h-3" /> Auto-Adjustment Active
                              </span>
                            </div>
                            <textarea
                              rows={5}
                              value={bulkPasteText}
                              onChange={(e) => setBulkPasteText(e.target.value)}
                              placeholder="e.g.&#10;1. MWAMBA CHIPOYA&#10;2) BANDA, KONDWANI&#10;3 - chanda bwalya (Grade 12)&#10;4. 2026-0015 LUBINDA MUSONDA"
                              className={`w-full p-3.5 rounded-xl border focus:ring-2 outline-none text-xs font-medium resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'}`}
                            />
                            <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Names will be automatically cleaned, formatted, and assigned standard 2026-XXXX Student IDs.
                            </p>

                            {/* Live preview */}
                            {previewAdjustedMarkbookNames.length > 0 && (
                              <div className={`mt-3 p-3 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {previewAdjustedMarkbookNames.length} Students Auto-Adjusted
                                  </span>
                                  <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target: 2026-XXXX</span>
                                </div>
                                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                  {previewAdjustedMarkbookNames.map((item, idx) => (
                                    <div key={idx} className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'}`}>
                                      <span className="font-bold truncate mr-2">{item.name}</span>
                                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                                        {item.examNo}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <button 
                            type="submit" 
                            disabled={!bulkPasteText.trim()}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-emerald-600/20 mt-3 cursor-pointer"
                          >
                            Add {previewAdjustedMarkbookNames.length > 0 ? previewAdjustedMarkbookNames.length : ''} Students to Markbook
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'removeStudent' && (
                <div>
                  {!isAdminOrSuperAdmin ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
                        <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">Admin Privilege Required</p>
                          <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                            Only verified Admins and Super Admins can remove student candidate records from the official markbook roster.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Role: {userRole}</span>
                        <button 
                          onClick={() => {
                            setUserRole('SUPER_ADMIN');
                            localStorage.setItem('user_role', 'SUPER_ADMIN');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Switch to Super Admin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Admin Panel: Click delete to permanently remove student record and associated marks.</p>
                      {students.map(s => (
                        <div key={s.dbId} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <div>
                            <p className="font-bold text-sm">{s.name}</p>
                            <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.nrc || s.dbId}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteStudent(s.dbId)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                            title="Delete Student"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'theme' && (
                <div className="space-y-3">
                  <button onClick={() => { setTheme('light'); setActiveModal(null); }} className={`w-full p-4 rounded-xl text-left font-bold flex items-center justify-between border transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}`}>
                     Light (Classic) {theme === 'light' && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setTheme('dark'); setActiveModal(null); }} className={`w-full p-4 rounded-xl text-left font-bold flex items-center justify-between border transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-900/30 text-indigo-400' : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}`}>
                     Dark (Terminal) {theme === 'dark' && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setTheme('emerald'); setActiveModal(null); }} className={`w-full p-4 rounded-xl text-left font-bold flex items-center justify-between border transition-all ${theme === 'emerald' ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400' : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}`}>
                     Emerald (Focus) {theme === 'emerald' && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setTheme('navy'); setActiveModal(null); }} className={`w-full p-4 rounded-xl text-left font-bold flex items-center justify-between border transition-all ${theme === 'navy' ? 'border-blue-500 bg-blue-900/30 text-blue-400' : (isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')}`}>
                     Navy (Executive) {theme === 'navy' && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {activeModal === 'term' && (
                <div className="space-y-2">
                  {['Term 1, 2026', 'Term 2, 2026', 'Term 3, 2026', 'Term 1, 2027'].map((term, i) => (
                    <button key={term} onClick={() => setActiveModal(null)} className={`w-full p-4 rounded-xl text-left font-bold flex items-center justify-between transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700' : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-100'}`}>
                      {term}
                      {i === 1 && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
