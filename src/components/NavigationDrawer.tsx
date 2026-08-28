import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  BookOpen, 
  Building2, 
  FileText, 
  Sliders, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  ShieldAlert, 
  UserCheck, 
  LogOut, 
  User, 
  X, 
  BarChart3, 
  BookCheck, 
  FileCheck2, 
  Settings, 
  CheckCircle, 
  UserCog, 
  Zap, 
  Calendar, 
  Clock, 
  School, 
  MapPin, 
  Sparkles 
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function getInstitutionAbbreviation(name: string): string {
  if (!name || name.trim() === '') return 'ABSS';
  
  const knownAbbreviations: Record<string, string> = {
    'University of Zambia (UNZA)': 'UNZA',
    'University of Zambia': 'UNZA',
    'Copperbelt University (CBU)': 'CBU',
    'Copperbelt University': 'CBU',
    'Mulungushi University': 'MU',
    'Mukuba University': 'MKU',
    'Kwame Nkrumah University': 'KNU',
    'Levy Mwanawasa Medical University': 'LMMU',
    'Chalimbana University': 'CHAU',
    'Kapasa Makasa University': 'KMU',
    'Eden University': 'EU',
    'Cavendish University Zambia': 'CUZ',
    'National Institute of Public Administration (NIPA)': 'NIPA',
    'National Institute of Public Administration': 'NIPA',
    'Technical Vocational Teachers College (TVTC)': 'TVTC',
    'Technical Vocational Teachers College': 'TVTC',
    'Munali Boys Secondary School': 'MBSS',
    'Munali Girls Secondary School': 'MGSS',
    'David Kaunda Technical High School': 'DKTHS',
    'Kabulonga Boys Secondary School': 'KBSS',
    'Kabulonga Girls Secondary School': 'KGSS',
    'Kamwala Secondary School': 'KSS',
    'Matero Boys Secondary School': 'MTBSS',
    'Matero Girls Secondary School': 'MTGSS',
    'Roma Girls Secondary School': 'RGSS',
    'St. Marys Secondary School (Lusaka)': 'SMSS',
    'St. Marys Secondary School': 'SMSS',
    'Libala Secondary School': 'LSS',
    'Twin Palm Secondary School': 'TPSS',
    'Highland Secondary School': 'HSS',
    'Olympia Secondary School': 'OSS',
    'Lusaka Central Primary School': 'LCPS',
    'Northmead Primary School': 'NPS',
    'Mpelembe Secondary School': 'MPSS',
    'Luanshya Girls Secondary School': 'LGSS',
    'Luanshya Boys Secondary School': 'LBSS',
    'Ndola Girls Technical High School': 'NGTHS',
    'Temweni Secondary School': 'TSS',
    'Hellen Kaunda Secondary School': 'HKSS',
    'Kansenshi Secondary School': 'KSS',
    'Kitwe Boys Secondary School': 'KBSS',
    'St. Francis Secondary School': 'SFSS',
    'Chingola High School': 'CHS',
    'Mufulira Secondary School': 'MFSS',
    'Ndola Primary School': 'NDPS',
    'Canisius Secondary School (Chikuni)': 'CSS',
    'Canisius Secondary School': 'CSS',
    'Livingstone High School': 'LHS',
    'St. Marks Secondary School': 'SMSS',
    'St. Josephs Secondary School (Chivuna)': 'SJSS',
    'Choma Secondary School': 'CMSS',
    'Batoka Secondary School': 'BKSS',
    'Kalomo Secondary School': 'KMSS',
    'Mazabuka Secondary School': 'MZSS',
    'Monze Secondary School': 'MNSS',
    'Livingstone Primary School': 'LPS',
    'Chipembi Girls Secondary School': 'CGSS',
    'Serenje Boys Secondary School': 'SBSS',
    'Mukobeko Secondary School': 'MKSS',
    'Kabwe High School': 'KHS',
    'Bwacha Secondary School': 'BSS',
    'Mumbwa Secondary School': 'MBSS',
    'Malcom Moffat Secondary School': 'MMSS',
    'Kabwe Primary School': 'KPS',
    'Chizongwe Technical Secondary School': 'CTSS',
    'St. Monicas Secondary School': 'SMSS',
    'Chipata Day Secondary School': 'CDSS',
    'Petauke Secondary School': 'PSS',
    'Katete Secondary School': 'KTSS',
    'Lundazi Secondary School': 'LDSS',
    'Chipata Primary School': 'CPPS',
    'Kasama Girls Secondary School': 'KGSS',
    'Mungwi Technical Secondary School': 'MTSS',
    'St. Charles Lwanga Secondary School': 'SCLSS',
    'Malole Secondary School': 'MLSS',
    'Mbala Secondary School': 'MBSS',
    'Kasama Primary School': 'KPS',
    'Chinsali Day Secondary School': 'CDSS',
    'Kenneth Kaunda Secondary School': 'KKSS',
    'Mpika Boys Secondary School': 'MPBSS',
    'Isoka Secondary School': 'ISS',
    'Chinsali Primary School': 'CPS',
    'Mansa Secondary School': 'MSS',
    'St. Clements Secondary School': 'SCSS',
    'Mabumba Secondary School': 'MBSS',
    'Samfya Secondary School': 'SFSS',
    'Kawambwa Secondary School': 'KWSS',
    'Mansa Primary School': 'MPS',
    'Solwezi Technical High School': 'STHS',
    'Mwinilunga Secondary School': 'MWSS',
    'Kasempa Secondary School': 'KSPSS',
    'Zambezi Secondary School': 'ZBSS',
    'Solwezi Primary School': 'SPS',
    'Mongu Secondary School': 'MGSS',
    'Kambule Secondary School': 'KBSS',
    'Senanga Secondary School': 'SNSS',
    'Kaoma Secondary School': 'KMSS',
    'Holy Cross Secondary School': 'HCSS',
    'Mongu Primary School': 'MPS',
    'Ministry of Education Headquarters (HQ)': 'MoE HQ',
    'Lusaka Provincial Education Office (PEO)': 'LUS-PEO',
    'Copperbelt Provincial Education Office (PEO)': 'CB-PEO',
    'Southern Provincial Education Office (PEO)': 'S-PEO',
    'Central Provincial Education Office (PEO)': 'C-PEO',
    'Eastern Provincial Education Office (PEO)': 'E-PEO',
    'Northern Provincial Education Office (PEO)': 'N-PEO',
    'Muchinga Provincial Education Office (PEO)': 'MCH-PEO',
    'Luapula Provincial Education Office (PEO)': 'LP-PEO',
    'North-Western Provincial Education Office (PEO)': 'NW-PEO',
    'Western Provincial Education Office (PEO)': 'W-PEO'
  };

  const trimmed = name.trim();
  if (knownAbbreviations[trimmed]) return knownAbbreviations[trimmed];

  const match = trimmed.match(/\(([A-Z0-9\-_]+)\)/i);
  if (match && match[1]) return match[1].toUpperCase();

  const words = trimmed.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  const stopWords = new Set(['of', 'and', 'the', 'in', 'for', 'at', 'on', 'to']);
  const filtered = words.filter(w => !stopWords.has(w.toLowerCase()));
  
  if (filtered.length >= 2) {
    return filtered.map(w => w[0].toUpperCase()).join('');
  } else if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }

  return 'ABSS';
}

interface NavigationDrawerProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onClose: () => void;
  onSignOut?: () => void;
}

export default function NavigationDrawer({ currentView, onNavigate, onClose, onSignOut }: NavigationDrawerProps) {
  const [userPortrait, setUserPortrait] = useState<string>(() => {
    return (
      auth.currentUser?.photoURL ||
      localStorage.getItem('user_portrait_url') ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    );
  });

  const [institutionName, setInstitutionName] = useState<string>(() => {
    return localStorage.getItem('user_institution') || 'Munali Boys Secondary School';
  });

  const instAbbreviation = getInstitutionAbbreviation(institutionName);

  const userName = auth.currentUser?.displayName || localStorage.getItem('user_full_name') || 'Ministry Official / Educator';
  const userEmail = auth.currentUser?.email || 'officer@moe.gov.zm';

  useEffect(() => {
    let isMounted = true;

    const handlePortraitUpdate = (e: any) => {
      if (!isMounted) return;
      if (e.detail?.url) {
        setUserPortrait(e.detail.url);
      } else {
        setUserPortrait(
          auth.currentUser?.photoURL ||
          localStorage.getItem('user_portrait_url') ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
        );
      }
    };

    window.addEventListener('user-portrait-updated', handlePortraitUpdate);

    // Live subscription to Firestore user_profiles document
    const profileId = auth.currentUser?.uid || 'default_user';
    const profileRef = doc(db, 'user_profiles', profileId);
    const unsubscribeSnapshot = onSnapshot(profileRef, (snapshot) => {
      if (!isMounted) return;
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.portraitUrl) {
          setUserPortrait(data.portraitUrl);
          localStorage.setItem('user_portrait_url', data.portraitUrl);
        }
        if (data.institution) {
          setInstitutionName(data.institution);
          localStorage.setItem('user_institution', data.institution);
        }
      }
    }, (err) => {
      console.warn('NavigationDrawer Firestore portrait sync:', err);
    });

    return () => {
      isMounted = false;
      window.removeEventListener('user-portrait-updated', handlePortraitUpdate);
      unsubscribeSnapshot();
    };
  }, []);

  const userRole = localStorage.getItem('user_role') || 'TEACHER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const standardPortal = [
    { id: 'staff', label: 'Staffroom', icon: LayoutGrid, type: 'chevron' },
    { id: 'lesson-planner', label: 'Lesson Planner', icon: BookOpen, type: 'chevron' },
    { id: 'students', label: 'Class Rosters', icon: Users, type: 'chevron' },
    { id: 'dashboard', label: 'Dashboard', icon: Home, type: 'chevron' },
    { id: 'national-calendar', label: 'National Calendar', icon: Calendar, type: 'chevron' },
    { id: 'timetable', label: 'Timetable', icon: Clock, type: 'chevron' },
    { id: 'results', label: 'Results', icon: BarChart3, type: 'chevron' },
    { id: 'sba', label: 'SBA (School Assessments)', icon: BookCheck, type: 'chevron' },
    { id: 'curriculum', label: 'Library', icon: BookOpen, type: 'external' },
    { id: 'institutions', label: 'Institution Directory', icon: Building2, type: 'chevron' },
    { id: 'markbook', label: 'Official Markbook', icon: FileText, type: 'chevron' },
  ];

  const systemConfig = [
    { id: 'settings', label: 'App Configuration & Settings', icon: Sliders, type: 'chevron' },
    { id: 'background-services', label: 'Background Services Suite (VoIP, Push, Sync)', icon: Zap, type: 'chevron' },
  ];

  const superAdminPrivileges = [
    { 
      id: 'live-desk', 
      label: 'Live Desk Oversight', 
      sublabel: 'Real-time performance monitoring',
      icon: ShieldCheck, 
      isYellowHighlight: true 
    },
    { id: 'admin-registry', label: 'Registry', icon: Users, type: 'chevron' },
    { id: 'profile', label: 'Profile', icon: User, type: 'chevron' },
    { id: 'admin-configs', label: 'Configurations', icon: Settings, type: 'chevron' },
    { id: 'admin-approvals', label: 'Approvals', icon: CheckCircle, type: 'chevron' },
    { id: 'admin-settings', label: 'Settings', icon: Sliders, type: 'chevron' },
    { id: 'security', label: 'Security & Audits', icon: ShieldAlert, type: 'chevron' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col font-google-sans-text p-0"
    >
      {/* Top Bar with Title & Close button */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-black" strokeWidth={2.5} />
          <span className="text-sm font-black uppercase tracking-wider text-slate-900">{institutionName}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-black transition-colors cursor-pointer"
          title="Close Menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-6 font-google-sans-text px-4 sm:px-8 pt-2">
          
          {/* Section 1: PORTAL */}
          <div className="space-y-4 pt-2 font-google-sans-text">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] px-2 pb-2 flex items-center gap-3 font-google-sans-text">
              <ShieldCheck className="w-5 h-5 text-black" strokeWidth={2.5} /> OFFICIAL PORTAL
            </p>
            <div className="space-y-2 font-google-sans-text">
              {standardPortal.map((item) => (
                <button
                  key={item.id + item.label}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full px-4 py-3 rounded-xl bg-transparent hover:bg-slate-100 transition-all flex items-center justify-between group active:scale-[0.98] font-google-sans-text cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <item.icon className="w-6 h-6 text-black shrink-0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <span className="font-normal text-black text-lg tracking-tight transition-colors truncate font-google-sans-text">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: SYSTEM & APP CONFIGURATION */}
          {isSuperAdmin && (
            <div className="space-y-4 pt-8 font-google-sans-text">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] px-2 pb-2 font-google-sans-text">
                SYSTEM & APP CONFIGURATION
              </p>
              <div className="space-y-2 font-google-sans-text">
                {systemConfig.map((item) => (
                  <button
                    key={item.id + item.label}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full px-4 py-3 rounded-xl bg-transparent hover:bg-slate-100 transition-all flex items-center justify-between group active:scale-[0.98] font-google-sans-text cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <item.icon className="w-6 h-6 text-black shrink-0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      <span className="font-normal text-black text-lg tracking-tight transition-colors truncate font-google-sans-text">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: SUPER ADMIN PRIVILEGES */}
          {isSuperAdmin && (
            <div className="space-y-4 pt-8 font-google-sans-text">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] px-2 pb-2 font-google-sans-text">
                SUPER ADMIN PRIVILEGES
              </p>
              <div className="space-y-2 font-google-sans-text">
                {superAdminPrivileges.map((item) => (
                  <button
                    key={item.id + item.label}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full px-4 py-3 rounded-xl bg-transparent hover:bg-slate-100 transition-all flex items-center justify-between group active:scale-[0.98] text-left font-google-sans-text cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <item.icon className="w-6 h-6 text-black shrink-0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      <div className="font-google-sans-text min-w-0">
                        <h4 className="font-normal text-black text-lg leading-tight font-google-sans-text tracking-tight truncate">{item.label}</h4>
                        {item.sublabel && (
                          <p className="text-xs font-normal text-slate-600 mt-1 tracking-tight font-google-sans-text">{item.sublabel}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reduced-size Logout Button pinned at the very bottom */}
      <div className="w-full border-t border-slate-200 bg-slate-50/90 py-3 px-4 sm:px-8 mt-auto shrink-0 shadow-inner">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
            Signed in as <span className="font-bold text-slate-800">{userEmail}</span>
          </div>
          <button
            onClick={() => {
              onSignOut?.();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ml-auto"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
