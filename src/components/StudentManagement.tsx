import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  UserCheck, 
  Building2,
  Phone,
  Calendar,
  Award,
  X,
  School,
  UserCog,
  Layers,
  Sparkles,
  BookMarked,
  Edit2,
  Trash2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Mail,
  Clock,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  MapPin,
  MessageSquare,
  Upload,
  ClipboardPaste,
  Camera,
  FileSpreadsheet
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { SchoolClass, SchoolSubject, StudentCandidate } from '../types';
import { ALL_CBC_SUBJECTS } from '../data/cbcSubjects';
import { generateParentDetailsForStudent, getLocationForSchool } from '../data/parentsData';
import { AddClassModal } from './student-management/AddClassModal';
import { EnrolStudentModal } from './student-management/EnrolStudentModal';
import { AddSubjectModal } from './student-management/AddSubjectModal';
import { ParentsDirectory } from './student-management/ParentsDirectory';
import { BulkAddStudentsModal } from './student-management/BulkAddStudentsModal';

const INITIAL_CLASSES: Omit<SchoolClass, 'id'>[] = [
  {
    name: 'Grade 10A (Pure Sciences)',
    grade: 'Grade 10',
    stream: 'Pure Sciences',
    school: 'Munali Boys Secondary School',
    academicYear: '2026',
    term: 'Term 1',
    room: 'Science Lab 2',
    capacity: 45,
    classTeacherName: 'Mr. Mulenga Phiri',
    classTeacherEmail: 'm.phiri@munaliboys.edu.zm',
    classTeacherPhone: '+260 97 712 3456',
    subjects: ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 'Civic Education', 'Computer Studies & ICT'],
  },
  {
    name: 'Grade 10B (Social Sciences & Arts)',
    grade: 'Grade 10',
    stream: 'Arts & Humanities',
    school: 'Munali Boys Secondary School',
    academicYear: '2026',
    term: 'Term 1',
    room: 'Block C - Room 14',
    capacity: 45,
    classTeacherName: 'Mrs. Grace Mwanza',
    classTeacherEmail: 'g.mwanza@munaliboys.edu.zm',
    classTeacherPhone: '+260 96 623 4567',
    subjects: ['English Language', 'Mathematics', 'History', 'Geography', 'Civic Education', 'Religious Education (2046)', 'Icibemba Language & Culture'],
  },
  {
    name: 'Grade 11 Alpha (Commercial & Business)',
    grade: 'Grade 11',
    stream: 'Commercial & Business',
    school: 'Munali Boys Secondary School',
    academicYear: '2026',
    term: 'Term 1',
    room: 'Block A - Room 08',
    capacity: 40,
    classTeacherName: 'Dr. Leonard Banda',
    classTeacherEmail: 'l.banda@munaliboys.edu.zm',
    classTeacherPhone: '+260 95 534 5678',
    subjects: ['Mathematics', 'English Language', 'Commerce & Entrepreneurship', 'Principles of Accounts', 'Economics', 'Computer Studies & ICT', 'Civic Education'],
  },
  {
    name: 'Grade 12 Senior (ECZ Exam Candidates)',
    grade: 'Grade 12',
    stream: 'Senior STEM & Technical',
    school: 'Munali Boys Secondary School',
    academicYear: '2026',
    term: 'Term 1',
    room: 'Senior Hall West',
    capacity: 50,
    classTeacherName: 'Ms. Chileshe Tembo',
    classTeacherEmail: 'c.tembo@munaliboys.edu.zm',
    classTeacherPhone: '+260 97 845 6789',
    subjects: ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics', 'Civic Education', 'Agricultural Science', 'Design and Technology (D&T)'],
  }
];

const INITIAL_STUDENTS: Omit<StudentCandidate, 'id'>[] = [
  {
    name: 'Mwamba Chipoya',
    grade: 'Grade 10',
    className: 'Grade 10A (Pure Sciences)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0001',
    gender: 'Male',
    nrc: '458921/11/1',
    guardianName: 'Dr. Kelvin Chipoya',
    guardianRelationship: 'Father',
    guardianPhone: '+260 97 111 2233',
    guardianEmergencyPhone: '+260 96 222 3344',
    guardianEmail: 'kelvin.chipoya@gmail.com',
    guardianAddress: 'Plot 450, Munali Residential, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 98,
    caStatus: 'Up to Date',
    status: 'Active'
  },
  {
    name: 'Chanda Bwalya',
    grade: 'Grade 10',
    className: 'Grade 10A (Pure Sciences)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0002',
    gender: 'Male',
    nrc: '462319/11/1',
    guardianName: 'Mrs. Mary Bwalya',
    guardianRelationship: 'Mother',
    guardianPhone: '+260 96 222 3344',
    guardianEmergencyPhone: '+260 97 333 4455',
    guardianEmail: 'mary.bwalya@gmail.com',
    guardianAddress: 'Plot 120, Chelston Green, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 95,
    caStatus: 'Up to Date',
    status: 'Active'
  },
  {
    name: 'Kondwani Lungu',
    grade: 'Grade 10',
    className: 'Grade 10B (Social Sciences & Arts)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0003',
    gender: 'Male',
    nrc: '471203/11/1',
    guardianName: 'Mr. Peter Lungu',
    guardianRelationship: 'Father',
    guardianPhone: '+260 95 333 4455',
    guardianEmergencyPhone: '+260 97 444 5566',
    guardianEmail: 'peter.lungu@gmail.com',
    guardianAddress: 'Plot 88, Avondale Phase 2, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 92,
    caStatus: 'Pending CA2',
    status: 'Active'
  },
  {
    name: 'Lubinda Musonda',
    grade: 'Grade 11',
    className: 'Grade 11 Alpha (Commercial & Business)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0004',
    gender: 'Male',
    nrc: '482390/11/1',
    guardianName: 'Eng. Lubinda Snr',
    guardianRelationship: 'Father',
    guardianPhone: '+260 97 444 5566',
    guardianEmergencyPhone: '+260 96 555 6677',
    guardianEmail: 'lubinda.snr@gmail.com',
    guardianAddress: 'Plot 14, Rhodes Park, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 97,
    caStatus: 'Up to Date',
    status: 'Active'
  },
  {
    name: 'Taonga Zulu',
    grade: 'Grade 12',
    className: 'Grade 12 Senior (ECZ Exam Candidates)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0005',
    gender: 'Male',
    nrc: '490182/11/1',
    guardianName: 'Pastor David Zulu',
    guardianRelationship: 'Father',
    guardianPhone: '+260 96 555 6677',
    guardianEmergencyPhone: '+260 95 666 7788',
    guardianEmail: 'david.zulu@gmail.com',
    guardianAddress: 'Plot 202, Woodlands Extension, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 100,
    caStatus: 'Completed',
    status: 'Active'
  },
  {
    name: 'Musenge Chilufya',
    grade: 'Grade 12',
    className: 'Grade 12 Senior (ECZ Exam Candidates)',
    school: 'Munali Boys Secondary School',
    examNo: '2026-0006',
    gender: 'Male',
    nrc: '493412/11/1',
    guardianName: 'Mrs. Agnes Chilufya',
    guardianRelationship: 'Mother',
    guardianPhone: '+260 97 666 7788',
    guardianEmergencyPhone: '+260 96 777 8899',
    guardianEmail: 'agnes.chilufya@gmail.com',
    guardianAddress: 'Plot 310, Northmead, Lusaka',
    guardianTown: 'Lusaka',
    attendanceRate: 96,
    caStatus: 'Up to Date',
    status: 'Active'
  }
];

export default function StudentManagement() {
  const [activeTab, setActiveTab] = useState<'roster' | 'classes' | 'subjects' | 'parents' | 'teachers' | 'all_students'>('roster');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  
  // Data state
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [subjectsList, setSubjectsList] = useState<SchoolSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // Institution from local storage or default
  const institutionName = localStorage.getItem('user_institution') || 'Munali Boys Secondary School';
  const locationInfo = useMemo(() => getLocationForSchool(institutionName), [institutionName]);

  // -------------------------------------------------------------
  // 1. REAL-TIME DATA SUBSCRIPTIONS & SEEDING
  // -------------------------------------------------------------
  useEffect(() => {
    setLoading(true);

    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial classes scoped to current institution
        for (const c of INITIAL_CLASSES) {
          try {
            await addDoc(collection(db, 'classes'), {
              ...c,
              school: institutionName,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'classes');
          }
        }
      } else {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolClass));
        const filtered = loaded.filter(c => !c.school || c.school === institutionName);
        setClasses(filtered.length > 0 ? filtered : loaded);
        if (!selectedClassId && (filtered[0] || loaded[0])) {
          setSelectedClassId((filtered[0] || loaded[0]).id);
        }
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'classes');
      setLoading(false);
    });

    const qStudents = query(collection(db, 'students'));
    const unsubStudents = onSnapshot(qStudents, async (snapshot) => {
      if (snapshot.empty) {
        for (const s of INITIAL_STUDENTS) {
          try {
            await addDoc(collection(db, 'students'), {
              ...s,
              school: institutionName,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'students');
          }
        }
      } else {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentCandidate));
        const filtered = loaded.filter(s => !s.school || s.school === institutionName);
        setStudents(filtered.length > 0 ? filtered : loaded);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'students');
    });

    const qSubjects = query(collection(db, 'subjects'));
    const unsubSubjects = onSnapshot(qSubjects, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolSubject));
      setSubjectsList(loaded);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'subjects');
    });

    return () => {
      unsubClasses();
      unsubStudents();
      unsubSubjects();
    };
  }, [institutionName]);

  // Active Selected Class Object
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  // Students in Current Class
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(s => {
      if (s.classId) return s.classId === currentClass.id;
      return s.className === currentClass.name || s.grade === currentClass.grade;
    });
  }, [students, currentClass]);

  // All subjects combined (from class allocation + custom subjects collection)
  const currentClassSubjects = useMemo(() => {
    if (!currentClass) return [];
    const classAllocated = currentClass.subjects || [];
    return classAllocated.map(name => {
      const matchCustom = subjectsList.find(s => s.name === name && s.classId === currentClass.id);
      const cbcDef = ALL_CBC_SUBJECTS.find(s => s.name === name);
      return {
        name,
        code: matchCustom?.code || cbcDef?.code || 'CBC-SUB',
        periods: matchCustom?.periodsPerWeek || 5,
        teacher: matchCustom?.teacherName || currentClass.classTeacherName || 'Assigned Lead',
        category: cbcDef?.category || 'General Curriculum',
        syllabusType: matchCustom?.syllabusType || (cbcDef?.category?.includes('Vocational') ? 'Practical / Vocational' : 'ECZ Core')
      };
    });
  }, [currentClass, subjectsList]);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSaveClass = async (classData: {
    name: string;
    grade: string;
    stream: string;
    room: string;
    capacity: number;
    classTeacherName: string;
    classTeacherEmail: string;
    classTeacherPhone: string;
    subjects: string[];
  }) => {
    if (editingClass) {
      const docRef = doc(db, 'classes', editingClass.id);
      await updateDoc(docRef, {
        ...classData,
        school: institutionName
      });
      setEditingClass(null);
    } else {
      const newRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        school: institutionName,
        academicYear: '2026',
        term: 'Term 1',
        createdAt: serverTimestamp()
      });
      setSelectedClassId(newRef.id);
    }
  };

  const handleDeleteClass = async (classId: string, classNameStr: string) => {
    if (!window.confirm(`Are you sure you want to remove ${classNameStr}?`)) return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
      if (selectedClassId === classId && classes.length > 1) {
        setSelectedClassId(classes.find(c => c.id !== classId)?.id || '');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'classes');
    }
  };

  const handleEnrolStudent = async (studentData: Omit<StudentCandidate, 'id'>) => {
    await addDoc(collection(db, 'students'), {
      ...studentData,
      school: institutionName,
      createdAt: serverTimestamp()
    });
  };

  const handleBulkAddStudents = async (studentsList: Omit<StudentCandidate, 'id'>[]) => {
    for (const studentData of studentsList) {
      await addDoc(collection(db, 'students'), {
        ...studentData,
        school: institutionName,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleAddSubject = async (subjectData: Omit<SchoolSubject, 'id'>) => {
    await addDoc(collection(db, 'subjects'), {
      ...subjectData,
      school: institutionName
    });
    
    // Also append to class subjects if not present
    if (currentClass && !currentClass.subjects?.includes(subjectData.name)) {
      const updated = [...(currentClass.subjects || []), subjectData.name];
      await updateDoc(doc(db, 'classes', currentClass.id), {
        subjects: updated
      });
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from class roster?`)) return;
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'students');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & WORKSPACE BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <School className="w-4 h-4" />
              <span>{institutionName} • Academic Department Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Class Rosters, CBC Subjects & Teachers
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-3xl">
              Complete Competency-Based Curriculum (CBC) subjects integration, full-screen class allocation, and class-matched parent/guardian contact registers for {locationInfo.town}.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingClass(null);
                setIsAddClassModalOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Class (Full-Screen)
            </button>
            <button
              onClick={() => setIsEnrolModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <UserCheck className="w-4 h-4" /> Enrol Candidate
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'roster', label: 'Class Active Roster', icon: Users, count: classStudents.length },
            { id: 'classes', label: 'All School Classes', icon: School, count: classes.length },
            { id: 'subjects', label: 'CBC Subjects Matrix', icon: BookOpen, count: currentClassSubjects.length },
            { id: 'parents', label: 'Parents & Guardians', icon: ShieldCheck, count: students.length },
            { id: 'teachers', label: 'Class Teachers', icon: UserCog, count: classes.length },
            { id: 'all_students', label: 'All Students', icon: GraduationCap, count: students.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT 1: ACTIVE CLASS ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Select Class:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/40"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade}) • {c.classTeacherName || 'No Teacher'}
                  </option>
                ))}
              </select>
              {currentClass && (
                <button
                  type="button"
                  onClick={() => handleDeleteClass(currentClass.id, currentClass.name)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200"
                  title="Delete Current Class"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Class
                </button>
              )}
            </div>

            {/* Quick Class Summary Details */}
            {currentClass && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <UserCog className="w-3.5 h-3.5 text-teal-700" />
                  Teacher: {currentClass.classTeacherName || 'Unassigned'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  Room: {currentClass.room || 'General'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                  Subjects: {currentClass.subjects?.length || 0} CBC Courses
                </span>
              </div>
            )}
          </div>

          {/* Student Table with Parents Details Matched to School and Classes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enrolled Students in {currentClass?.name} ({classStudents.length} Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Parent/Guardian contact records matched to {institutionName} and student class.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkAddModalOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Quick Add Names
                </button>
                <button
                  onClick={() => setIsEnrolModalOpen(true)}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Student
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-5 py-3.5">Candidate Student</th>
                    <th className="px-5 py-3.5">Exam / NRC Number</th>
                    <th className="px-5 py-3.5">Guardian Name & Relationship</th>
                    <th className="px-5 py-3.5">Guardian Phone & Area</th>
                    <th className="px-5 py-3.5">CA Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                        No students enrolled in this class roster yet. Click "Add Student" to enrol candidates.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((s) => {
                      const fallback = generateParentDetailsForStudent(s.name, s.school || institutionName, currentClass?.name || 'Class');
                      const gName = s.guardianName && s.guardianName !== 'Parent on Record' ? s.guardianName : fallback.guardianName;
                      const gRel = s.guardianRelationship || fallback.relationship;
                      const gPhone = s.guardianPhone || fallback.phone;
                      const gAddr = s.guardianAddress || fallback.address;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.gender || 'Male'} • {s.grade}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-mono text-xs">
                            <div className="font-bold text-slate-800">{s.examNo || '2026-0001'}</div>
                            <div className="text-[10px] text-slate-400">{s.nrc || 'N/A'}</div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{gName}</div>
                            <span className={`inline-block mt-0.5 px-2 py-0.2 rounded-md text-[10px] font-bold ${
                              gRel === 'Father' ? 'bg-blue-100 text-blue-800' : gRel === 'Mother' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {gRel}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-mono font-semibold text-slate-900 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-teal-600" /> {gPhone}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                              {gAddr}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {s.caStatus || 'Up to Date'}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleDeleteStudent(s.id, s.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 2: ALL SCHOOL CLASSES */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const enrolled = students.filter(s => s.classId === cls.id || s.className === cls.name).length;
              return (
                <div 
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {cls.grade}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1.5">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Stream: <strong>{cls.stream || 'General'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setIsAddClassModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Class in Full-Screen"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Class Teacher:</span>
                        <span className="font-bold text-slate-900">{cls.classTeacherName || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Classroom:</span>
                        <span className="font-medium text-slate-800">{cls.room || 'General Hall'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Capacity & Enrolled:</span>
                        <span className="font-bold text-slate-900">{enrolled} / {cls.capacity || 45} Students</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Allocated CBC Subjects ({cls.subjects?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(cls.subjects || []).slice(0, 5).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                        {(cls.subjects?.length || 0) > 5 && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold">
                            +{(cls.subjects?.length || 0) - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveTab('roster');
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Class Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 3: CBC SUBJECTS MATRIX */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                CBC Curriculum Subjects for {currentClass?.name}
              </h3>
              <p className="text-xs text-slate-500">
                National Competency-Based Curriculum course syllabus breakdown and weekly teaching period load.
              </p>
            </div>

            <button
              onClick={() => setIsAddSubjectModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add CBC Subject to Class
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentClassSubjects.map((sub, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                      {sub.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{sub.name}</h4>
                    <p className="text-[11px] text-slate-500">{sub.category}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                    {sub.periods} Periods/Wk
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <UserCog className="w-3 h-3 text-teal-700" />
                    {sub.teacher}
                  </span>
                  <span className="font-semibold text-teal-800">{sub.syllabusType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 4: PARENTS & GUARDIANS DIRECTORY */}
      {activeTab === 'parents' && (
        <ParentsDirectory 
          students={students} 
          classes={classes} 
          institutionName={institutionName} 
        />
      )}

      {/* 2. TAB CONTENT 5: TEACHING STAFF */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center font-black text-sm">
                  {cls.classTeacherName ? cls.classTeacherName.slice(0, 2).toUpperCase() : 'TC'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{cls.classTeacherName || 'Unassigned Staff'}</h4>
                  <p className="text-xs text-teal-700 font-semibold">{cls.name} • Class Teacher</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{cls.classTeacherPhone || '+260 97 712 3456'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cls.classTeacherEmail || 'teacher@munaliboys.edu.zm'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. TAB CONTENT 6: ALL REGISTERED STUDENTS */}
      {activeTab === 'all_students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Complete Student Registry ({students.length} Enrolled)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Class / Stream</th>
                  <th className="px-5 py-3.5">Exam No.</th>
                  <th className="px-5 py-3.5">Guardian Contact</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{s.name}</td>
                    <td className="px-5 py-4 font-medium text-teal-700">{s.className}</td>
                    <td className="px-5 py-4 font-mono">{s.examNo}</td>
                    <td className="px-5 py-4">
                      {s.guardianName} ({s.guardianPhone})
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {s.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODALS */}
      {/* Modal 1: Add/Edit Class (Full-Screen Capacity with all CBC subjects drop-down) */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onSaveClass={handleSaveClass}
        editingClass={editingClass}
        institutionName={institutionName}
      />

      {/* Modal 2: Enrol Candidate Student with Class-Matched Parent Details */}
      <EnrolStudentModal
        isOpen={isEnrolModalOpen}
        onClose={() => setIsEnrolModalOpen(false)}
        classes={classes}
        defaultClassId={selectedClassId}
        institutionName={institutionName}
        onEnrolStudent={handleEnrolStudent}
      />

      {/* Modal 4: Quick Bulk Add Names (Paste, Upload, Camera Capture/OCR) */}
      <BulkAddStudentsModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        currentClass={currentClass}
        institutionName={institutionName}
        onBulkAddStudents={handleBulkAddStudents}
      />
    </div>
  );
}
