import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Building2,
  BadgeCheck,
  FileText,
  Bell,
  MessageSquare,
  Send,
  Radio,
  Sparkles,
  ExternalLink,
  Users,
  Paperclip,
  Pin,
  Mic,
  Smile,
  Maximize2,
  Minimize2,
  Clock,
  ChevronRight,
  Share2,
  Check
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';

interface StaffPortalProps {
  onNavigate?: (view: string) => void;
}

export default function StaffPortal({ onNavigate }: StaffPortalProps) {
  const [activeTab, setActiveTab] = useState<'notices' | 'directory' | 'marks' | 'markbook' | 'communication' | 'my-classes' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Selected Channel in Full Communication View
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'stem' | 'science' | 'languages' | 'admin' | 'guidance'>('all');
  const [chatFilter, setChatFilter] = useState<'all' | 'official' | 'dispatch' | 'general'>('all');
  const [dispatchType, setDispatchType] = useState<'official' | 'dispatch' | 'general'>('general');

  // Staff Communication Center state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-1',
      sender: 'Mr. B. Banda (Head of Dept - Math)',
      role: 'Senior Teacher',
      department: 'stem',
      text: 'Grade 12 STEM-A continuous assessments for Term 2 are now 100% entered in the Official Markbook. Please review for final submission.',
      time: '08:45 AM',
      type: 'dispatch',
      reactions: { thumbsUp: 8, checked: 5 }
    },
    {
      id: 'msg-2',
      sender: 'Dr. L. Phiri (Science Lead)',
      role: 'ECZ Examiner',
      department: 'science',
      text: 'Regional science fair registrations are due this Friday. All provincial coordinators should sync their laboratory safety checklists and team rosters.',
      time: '09:12 AM',
      type: 'general',
      reactions: { thumbsUp: 12, checked: 3 }
    },
    {
      id: 'msg-3',
      sender: 'Ministry of Education Command',
      role: 'Super Admin',
      department: 'admin',
      text: 'Official notice: Verification for 2026 TCZ teacher licenses is active. All headteachers please confirm staff statuses and upload renewed accreditation certificates.',
      time: '09:30 AM',
      type: 'official',
      pinned: true,
      reactions: { thumbsUp: 24, checked: 18 }
    },
    {
      id: 'msg-4',
      sender: 'Mrs. C. Mwansa (Senior Mistress)',
      role: 'Deputy Headteacher',
      department: 'languages',
      text: 'Mid-term moderation meeting will convene today at 14:00 hrs in Main Hall B. Please bring compiled mark sheets and lesson observation forms.',
      time: '10:05 AM',
      type: 'dispatch',
      reactions: { thumbsUp: 15, checked: 9 }
    },
    {
      id: 'msg-5',
      sender: 'Mr. K. Tembo (Guidance & Careers)',
      role: 'Senior Counselor',
      department: 'guidance',
      text: 'Career guidance seminars for Grade 9 school leavers schedule finalized. STEM mentorship sessions will be held concurrently with TVET orientations.',
      time: '10:35 AM',
      type: 'general',
      reactions: { thumbsUp: 7, checked: 4 }
    }
  ]);
  const [newStaffChat, setNewStaffChat] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendStaffChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffChat.trim()) return;
    const newEntry = {
      id: 'msg-' + Date.now(),
      sender: 'Super Administrator',
      role: 'HQ Administrator',
      department: selectedChannel === 'all' ? 'admin' : selectedChannel,
      text: newStaffChat.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: dispatchType,
      pinned: dispatchType === 'official',
      reactions: { thumbsUp: 1, checked: 0 }
    };
    setChatMessages(prev => [...prev, newEntry]);
    setNewStaffChat('');
  };

  const handleToggleReaction = (id: string, type: 'thumbsUp' | 'checked') => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === id) {
        const currentVal = m.reactions?.[type] || 0;
        return {
          ...m,
          reactions: {
            ...m.reactions,
            [type]: currentVal + 1
          }
        };
      }
      return m;
    }));
  };

  useEffect(() => {
    // Real-time listener for notices
    const qNotices = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribeNotices = onSnapshot(qNotices, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
    });

    // Real-time listener for staff
    const qStaff = query(collection(db, 'staff'));
    const unsubscribeStaff = onSnapshot(qStaff, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'staff');
    });

    // Real-time listener for marks
    const qMarks = query(collection(db, 'marks'));
    const unsubscribeMarks = onSnapshot(qMarks, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentMarks(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marks');
    });

    return () => {
      unsubscribeNotices();
      unsubscribeStaff();
      unsubscribeMarks();
    };
  }, []);

  const filteredStaff = staffList.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.licenseNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedMessages = chatMessages.filter(msg => {
    if (chatFilter !== 'all' && msg.type !== chatFilter) return false;
    if (selectedChannel !== 'all' && msg.department !== selectedChannel) return false;
    return true;
  });

  const facultyDepartments = [
    { id: 'all', name: 'General Staff Broadcast', count: 32, icon: Radio },
    { id: 'stem', name: 'Mathematics & STEM', count: 9, icon: Award },
    { id: 'science', name: 'Science & Laboratories', count: 7, icon: BookOpen },
    { id: 'languages', name: 'Languages & Literature', count: 6, icon: FileText },
    { id: 'admin', name: 'Administration & TCZ', count: 5, icon: ShieldCheck },
    { id: 'guidance', name: 'Guidance & Counseling', count: 5, icon: Users },
  ];

  const onlineFacultyRoster = [
    { name: 'Mr. B. Banda', dept: 'Mathematics HOD', tcz: 'TCZ-ZM-2024-8842', status: 'active', avatar: 'BB' },
    { name: 'Dr. L. Phiri', dept: 'Science Examiner', tcz: 'TCZ-ZM-2023-1190', status: 'active', avatar: 'LP' },
    { name: 'Mrs. C. Mwansa', dept: 'Deputy Head', tcz: 'TCZ-ZM-2022-4412', status: 'active', avatar: 'CM' },
    { name: 'Mr. K. Tembo', dept: 'Guidance Lead', tcz: 'TCZ-ZM-2025-9921', status: 'active', avatar: 'KT' },
    { name: 'Ms. G. Chanda', dept: 'Commercial Studies', tcz: 'TCZ-ZM-2024-3320', status: 'away', avatar: 'GC' },
    { name: 'Mr. P. Mulenga', dept: 'Languages Dept', tcz: 'TCZ-ZM-2021-7711', status: 'active', avatar: 'PM' },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Four Small Square Windows Selection Interface + Compressed Live Communication Channel on Main Window */}
      {!activeTab ? (
        <div className="space-y-8 py-4">
          {/* Main Title Banner */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 text-xs font-extrabold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>Executive Educator Portal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Staffroom Workspace</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Four Primary Administrative Terminals</p>
          </div>
          
          {/* Four Enhanced Windows Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full max-w-5xl mx-auto px-2 sm:px-0">
            {/* Window 1: Notices */}
            <button
              onClick={() => setActiveTab('notices')}
              className="group relative w-full rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 bg-white border-2 border-slate-200/80 hover:border-purple-400 hover:-translate-y-1.5 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold tracking-wide uppercase">
                {announcements.length} Memos
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-purple-50 via-purple-100/60 to-indigo-100 group-hover:from-purple-100 group-hover:to-indigo-200 border-2 border-purple-200/80 flex items-center justify-center transition-all shadow-md shadow-purple-500/10 group-hover:scale-110">
                <Bell className="w-10 h-10 sm:w-11 sm:h-11 text-purple-600 group-hover:text-purple-700 transition-colors drop-shadow-xs" />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  Official Notices
                </span>
                <span className="block text-xs font-bold text-slate-400">
                  Circulars & Memos
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-extrabold text-purple-600 group-hover:gap-2 transition-all">
                <span>Access Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Window 2: Staff Registry */}
            <button
              onClick={() => setActiveTab('directory')}
              className="group relative w-full rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 bg-white border-2 border-slate-200/80 hover:border-emerald-400 hover:-translate-y-1.5 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tracking-wide uppercase">
                Verified TCZ
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-100/60 to-teal-100 group-hover:from-emerald-100 group-hover:to-teal-200 border-2 border-emerald-200/80 flex items-center justify-center transition-all shadow-md shadow-emerald-500/10 group-hover:scale-110">
                <GraduationCap className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-600 group-hover:text-emerald-700 transition-colors drop-shadow-xs" />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Staff Registry
                </span>
                <span className="block text-xs font-bold text-slate-400">
                  Teacher Accreditation
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-extrabold text-emerald-600 group-hover:gap-2 transition-all">
                <span>View Directory</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Window 3: Official Markbook */}
            <button
              onClick={() => onNavigate ? onNavigate('markbook') : setActiveTab('markbook')}
              className="group relative w-full rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 bg-white border-2 border-slate-200/80 hover:border-blue-400 hover:-translate-y-1.5 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold tracking-wide uppercase">
                ECZ Standards
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100/60 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 border-2 border-blue-200/80 flex items-center justify-center transition-all shadow-md shadow-blue-500/10 group-hover:scale-110">
                <BookOpen className="w-10 h-10 sm:w-11 sm:h-11 text-blue-600 group-hover:text-blue-700 transition-colors drop-shadow-xs" />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  Official Markbook
                </span>
                <span className="block text-xs font-bold text-slate-400">
                  CA & Exam Records
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-extrabold text-blue-600 group-hover:gap-2 transition-all">
                <span>Open Markbook</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Window 4: Communication Center */}
            <button
              onClick={() => onNavigate ? onNavigate('communication') : setActiveTab('communication')}
              className="group relative w-full rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 bg-white border-2 border-slate-200/80 hover:border-teal-400 hover:-translate-y-1.5 cursor-pointer text-center overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" /> Live Hub
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-teal-50 via-teal-100/60 to-emerald-100 group-hover:from-teal-100 group-hover:to-emerald-200 border-2 border-teal-200/80 flex items-center justify-center transition-all shadow-md shadow-teal-500/10 group-hover:scale-110">
                <MessageSquare className="w-10 h-10 sm:w-11 sm:h-11 text-teal-600 group-hover:text-teal-700 transition-colors drop-shadow-xs" />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                  Communication
                </span>
                <span className="block text-xs font-bold text-slate-400">
                  Faculty Channels & Chat
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-extrabold text-teal-600 group-hover:gap-2 transition-all">
                <span>Enter Live Hub</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Window 5: My Classes */}
            <button
              onClick={() => setActiveTab('my-classes')}
              className="group relative w-full rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 bg-white border-2 border-slate-200/80 hover:border-amber-400 hover:-translate-y-1.5 cursor-pointer text-center overflow-hidden sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide uppercase">
                Assigned Rosters
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/60 to-orange-100 group-hover:from-amber-100 group-hover:to-orange-200 border-2 border-amber-200/80 flex items-center justify-center transition-all shadow-md shadow-amber-500/10 group-hover:scale-110">
                <Users className="w-10 h-10 sm:w-11 sm:h-11 text-amber-600 group-hover:text-amber-700 transition-colors drop-shadow-xs" />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  My Classes
                </span>
                <span className="block text-xs font-bold text-slate-400">
                  Assigned Teaching Rosters
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-extrabold text-amber-600 group-hover:gap-2 transition-all">
                <span>View My Classes</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workspace Sub-Header with Backward Navigation Sign */}
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-700 hover:text-slate-950 font-bold text-xs border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
                title="Back to Staffroom Windows"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Staffroom Windows</span>
              </button>
              <div className="h-5 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  {activeTab === 'notices' && 'Official Notices Hub'}
                  {activeTab === 'directory' && 'National Staff Registry'}
                  {activeTab === 'marks' && 'Regional Marks Entry'}
                  {activeTab === 'markbook' && 'Official Markbook Terminal'}
                  {activeTab === 'communication' && 'Staffroom Live Channel (End-to-End Command)'}
                  {activeTab === 'my-classes' && 'My Classes & Assigned Teaching Rosters'}
                </h3>
              </div>
            </div>
            {activeTab === 'communication' && onNavigate && (
              <button
                onClick={() => onNavigate('communication')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Hub</span>
              </button>
            )}
          </div>

          {/* TAB 5: MY CLASSES FOR TEACHERS */}
          {activeTab === 'my-classes' && (
            <div className="space-y-6 w-full">
              <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    Assigned Educator Rosters
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Classes & Subject Allocations</h2>
                  <p className="text-amber-100/80 text-sm max-w-2xl leading-relaxed">
                    Official Ministry of Education assigned teaching classes, subject timetables, and student enrollment rosters.
                  </p>
                </div>
                <div className="px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-center shrink-0">
                  <span className="block text-2xl font-black text-amber-300">4 Active</span>
                  <span className="block text-[10px] font-bold text-amber-200 uppercase tracking-widest">Assigned Classes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    className: 'Grade 12 STEM-A',
                    subject: 'Advanced Mathematics & Physics',
                    studentsCount: 42,
                    room: 'Science Lab 3',
                    schedule: 'Mon, Wed, Fri (08:00 - 10:30)',
                    status: 'Active Term 2',
                    roster: ['Chanda Mwansa', 'Mutale Kasonde', 'Bwembya Chilufya', 'Taonga Zimba', 'Mwiinga Mweetwa']
                  },
                  {
                    className: 'Grade 12 Science-B',
                    subject: 'Chemistry & Biology Practical',
                    studentsCount: 38,
                    room: 'Chemistry Laboratory A',
                    schedule: 'Tue, Thu (10:45 - 12:30)',
                    status: 'Active Term 2',
                    roster: ['Kabwe Musonda', 'Thandiwe Banda', 'Lombe Mulenga', 'Natasha Phiri']
                  },
                  {
                    className: 'Grade 11 STEM-A',
                    subject: 'Pure Mathematics & Additional Math',
                    studentsCount: 45,
                    room: 'Room 204',
                    schedule: 'Mon, Wed, Thu (14:00 - 15:30)',
                    status: 'Active Term 2',
                    roster: ['Mapalo Chishimba', 'Chilekwa Kasongo', 'Kondwani Tembo']
                  },
                  {
                    className: 'Grade 10 General-C',
                    subject: 'Integrated Science & Physics',
                    studentsCount: 40,
                    room: 'Main Hall West',
                    schedule: 'Tue, Fri (11:00 - 12:30)',
                    status: 'Active Term 2',
                    roster: ['Musonda Chibuye', 'Mwila Zulu', 'Chipo Njobvu']
                  }
                ].map((cls, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
                        {cls.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{cls.room}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{cls.className}</h3>
                      <p className="text-sm font-bold text-teal-700 mt-0.5">{cls.subject}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Enrollment: <strong className="text-slate-900">{cls.studentsCount} Students</strong></span>
                      <span>Schedule: <strong className="text-slate-900">{cls.schedule}</strong></span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Enrolled Roster Sample</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cls.roster.map((stu, sIdx) => (
                          <span key={sIdx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {stu}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPANDED FULL END-TO-END STAFFROOM LIVE CHANNEL PAGE */}
          {activeTab === 'communication' && (
            <div className="space-y-6 w-full">
              
              {/* Full Width Commanding Header Banner */}
              <div className="bg-gradient-to-r from-[#071329] via-[#0f244a] to-[#071329] text-white p-5 sm:p-7 rounded-3xl shadow-lg border border-sky-400/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
                {/* Decorative Metallic Waveform/Glow */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cyan-500/10 blur-3xl pointer-events-none" />
                
                <div className="space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
                      Staff Communication Channel
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-full text-xs font-medium">
                      All Departments
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Staffroom Communication Center
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-100/80 max-w-3xl leading-relaxed">
                    Real-time inter-departmental discussions, administrative directives, and teacher coordination channel for curriculum delivery and examination integrity.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                  <button
                    onClick={() => setActiveTab(null)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Compress View</span>
                  </button>
                </div>
              </div>

              {/* Full End-to-End Multi-Panel Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Sidebar: Department Channels & Active Faculty Roster (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Faculty Channels Switcher */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-teal-600" />
                        Faculty Channels
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">6 Active</span>
                    </div>

                    <div className="space-y-2">
                      {facultyDepartments.map((dept) => {
                        const Icon = dept.icon;
                        const active = selectedChannel === dept.id;
                        return (
                          <button
                            key={dept.id}
                            onClick={() => setSelectedChannel(dept.id as any)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                              active 
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25 ring-2 ring-teal-400/40 scale-[1.01]' 
                                : 'bg-slate-50/90 text-slate-700 hover:bg-slate-100/90 border border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                active ? 'bg-white/20 text-white' : 'bg-teal-100/80 text-teal-700'
                              }`}>
                                <Icon className="w-5 h-5 shrink-0" />
                              </div>
                              <span className="truncate text-xs sm:text-sm font-extrabold">{dept.name}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                              active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                            }`}>
                              {dept.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Online Faculty Roster */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Online Faculty
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Live (32)
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {onlineFacultyRoster.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {f.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium truncate">{f.dept}</p>
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Directives & Quick Protocols */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>TCZ Staffroom Protocols</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      All broadcasts are officially logged for Ministry compliance. Maintain professional conduct and ensure continuous assessment deadlines are adhered to.
                    </p>
                  </div>
                </div>

                {/* Right / Main Center Panel: Full Height Feed & Command Console (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Chat Timeline Terminal */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
                    
                    {/* Feed Top Action Bar */}
                    <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          {facultyDepartments.find(d => d.id === selectedChannel)?.name || 'General Staff Broadcast'}
                        </span>
                      </div>

                      {/* Stream Filter Pills */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 mr-1 hidden sm:inline">Type:</span>
                        {(['all', 'official', 'dispatch', 'general'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setChatFilter(f)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              chatFilter === f 
                                ? 'bg-teal-700 text-white shadow-2xs' 
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {f === 'all' && 'All'}
                            {f === 'official' && 'Directives'}
                            {f === 'dispatch' && 'Dispatches'}
                            {f === 'general' && 'General'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
                      {displayedMessages.map((msg) => (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-2xl border transition-all ${
                            msg.type === 'official' 
                              ? 'bg-gradient-to-r from-teal-50/95 to-slate-50 border-teal-300 text-teal-950 shadow-2xs ring-1 ring-teal-200/50' 
                              : msg.type === 'dispatch'
                              ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                {msg.sender.charAt(0) + (msg.sender.split(' ')[1]?.[0] || '')}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 truncate">{msg.sender}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 uppercase tracking-wider">
                                    {msg.role}
                                  </span>
                                  {msg.pinned && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                                      <Pin className="w-2.5 h-2.5" /> PINNED
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold shrink-0">{msg.time}</span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-10.5">{msg.text}</p>

                          {/* Message Footer Reactions & Actions */}
                          <div className="mt-3 pl-10.5 flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleReaction(msg.id, 'thumbsUp')}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all active:scale-95 shadow-2xs"
                              >
                                👍 <span>{msg.reactions?.thumbsUp || 0}</span>
                              </button>
                              <button
                                onClick={() => handleToggleReaction(msg.id, 'checked')}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all active:scale-95 shadow-2xs"
                              >
                                ✅ <span>{msg.reactions?.checked || 0}</span>
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(msg.text);
                                setCopiedId(msg.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Broadcast Dispatch Controller */}
                    <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                      
                      {/* Priority Selector */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Broadcast Type:</span>
                          {(['general', 'dispatch', 'official'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDispatchType(t)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                dispatchType === t 
                                  ? t === 'official' ? 'bg-teal-700 text-white' : t === 'dispatch' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {t === 'general' && 'General Chat'}
                              {t === 'dispatch' && 'Department Memo'}
                              {t === 'official' && 'Official Directive'}
                            </button>
                          ))}
                        </div>

                        <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">Press Enter to Broadcast</span>
                      </div>

                      {/* Message Input Bar */}
                      <form onSubmit={handleSendStaffChat} className="flex items-center gap-2.5">
                        <input
                          type="text"
                          value={newStaffChat}
                          onChange={(e) => setNewStaffChat(e.target.value)}
                          placeholder={`Broadcast ${dispatchType === 'official' ? 'Administrative Directive' : 'message'} to ${facultyDepartments.find(d => d.id === selectedChannel)?.name}...`}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-medium placeholder:text-slate-400"
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <Send className="w-4 h-4" />
                          <span>Broadcast</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: STAFF DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-sm">
                    <GraduationCap className="w-9 h-9 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Active Licensed Teachers</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-0.5">54,320</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 text-teal-600 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-sm">
                    <BadgeCheck className="w-9 h-9 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Verified Accreditation</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-0.5">98.4%</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 text-purple-600 border border-purple-200/80 flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-9 h-9 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Pending License Renewals</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-0.5">412</h3>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search teacher name, license number, or school..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4 font-semibold">Teacher / Instructor</th>
                        <th className="px-6 py-4 font-semibold">License Number</th>
                        <th className="px-6 py-4 font-semibold">Role / Subject</th>
                        <th className="px-6 py-4 font-semibold">School Posting</th>
                        <th className="px-6 py-4 font-semibold text-center">Province</th>
                        <th className="px-6 py-4 font-semibold text-right">License Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredStaff.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                                {s.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{s.name}</p>
                                <p className="text-xs text-slate-400">{s.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{s.licenseNo}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{s.role}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{s.school}</td>
                          <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500">{s.province}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKS ENTRY */}
          {activeTab === 'marks' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-amber-900">Continuous Assessment & Exam Marks Entry</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    Input continuous assessments (out of 40) and terminal examinations (out of 60) for national grading.
                  </p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const batchPromises = studentMarks.map(m => {
                        return addDoc(collection(db, 'marks'), {
                          ...m,
                          updatedAt: serverTimestamp()
                        });
                      });
                      await Promise.all(batchPromises);
                      alert('Marks successfully submitted to national database and Super Admin verified!');
                    } catch (e) {
                      handleFirestoreError(e, OperationType.WRITE, 'marks');
                    }
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Submit Marks
                </button>
              </div>

              <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4 font-semibold">Student ID & Name</th>
                        <th className="px-6 py-4 font-semibold">Grade/Stream</th>
                        <th className="px-6 py-4 font-semibold">Subject</th>
                        <th className="px-6 py-4 font-semibold">CA Score (40%)</th>
                        <th className="px-6 py-4 font-semibold">Exam Score (60%)</th>
                        <th className="px-6 py-4 font-semibold text-center">Total %</th>
                        <th className="px-6 py-4 font-semibold text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {studentMarks.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{m.studentName}</p>
                            <p className="text-xs text-slate-400 font-mono">{m.studentId}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{m.grade}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{m.subject}</td>
                          <td className="px-6 py-4">
                            <input type="text" defaultValue={m.caScore} className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center" />
                          </td>
                          <td className="px-6 py-4">
                            <input type="text" defaultValue={m.examScore} className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center" />
                          </td>
                          <td className="px-6 py-4 text-center font-black text-amber-600">{m.total}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {m.letter}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL MARKBOOK */}
          {activeTab === 'markbook' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-blue-900">Official Master Markbook</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Consolidated performance records certified by the Ministry of Education.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate('markbook')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Open Full Markbook Terminal
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border-2 border-purple-200/80 p-6 sm:p-7 rounded-3xl space-y-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                    <Bell className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-purple-950 tracking-tight">Broadcast Official Notice to Staff & Teachers</h3>
                    <p className="text-xs text-purple-700 font-medium">Issue authenticated administrative circulars and faculty directives.</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <input 
                    type="text" 
                    placeholder="Notice Title (e.g., Term 2 National Staff Moderation Meeting)" 
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
                  />
                  <textarea 
                    rows={3}
                    placeholder="Notice body content and operational guidelines..."
                    value={newNoticeContent}
                    onChange={(e) => setNewNoticeContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
                  />
                  <button 
                    onClick={async () => {
                      if (newNoticeTitle) {
                        try {
                          await addDoc(collection(db, 'notices'), {
                            title: newNoticeTitle,
                            author: 'Ministry Admin',
                            content: newNoticeContent,
                            createdAt: serverTimestamp(),
                            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          });
                          setNewNoticeTitle('');
                          setNewNoticeContent('');
                          alert('Official notice broadcasted to all staff members successfully!');
                        } catch (e) {
                          handleFirestoreError(e, OperationType.WRITE, 'notices');
                        }
                      }
                    }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Circular</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">Active Staff Communications & Circulars</h4>
                </div>
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-purple-200 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5" />
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-base truncate">{ann.title}</h5>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-100 shrink-0">
                        {ann.date || (ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'N/A')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-13">Author: {ann.author}</p>
                    <p className="text-sm text-slate-700 leading-relaxed pl-13">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
