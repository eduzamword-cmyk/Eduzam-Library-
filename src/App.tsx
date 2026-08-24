import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoadingPage from './components/LoadingPage';
import FrontCoverPage from './components/FrontCoverPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashboardView from './components/DashboardView';
import CommunicationHub from './components/CommunicationHub';
import AIAssistant from './components/AIAssistant';
import InstitutionsDirectory from './components/InstitutionsDirectory';
import StudentManagement from './components/StudentManagement';
import StaffPortal from './components/StaffPortal';
import CurriculumHub from './components/CurriculumHub';
import ReportsAnalytics from './components/ReportsAnalytics';
import SettingsView from './components/SettingsView';
import NavigationDrawer from './components/NavigationDrawer';
import StreamSelectorModal from './components/StreamSelectorModal';
import LiveDeskOversight from './components/LiveDeskOversight';
import OfficialMarkbook from './components/OfficialMarkbook';
import ScholarshipsBursaries from './components/ScholarshipsBursaries';
import InspectionAudit from './components/InspectionAudit';
import StreamSelectPage from './components/StreamSelectPage';
import EClassroomResources from './components/EClassroomResources';
import StaffroomLoading from './components/StaffroomLoading';
import LessonPlanner from './components/LessonPlanner';
import ReportForms from './components/ReportForms';
import ResultsManagement from './components/ResultsManagement';
import SBAAssessment from './components/SBAAssessment';
import PendingApprovalNotice from './components/PendingApprovalNotice';
import AdminManagementHub from './components/AdminManagementHub';
import ProfileView from './components/ProfileView';
import PrivateChat from './components/PrivateChat';
import BackgroundManagerModal from './components/BackgroundManagerModal';
import FloatingVoIPWidget from './components/FloatingVoIPWidget';
import NationalCalendar from './components/NationalCalendar';
import TimetableView from './components/TimetableView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pageState, setPageState] = useState<'front' | 'login' | 'loading' | 'landing' | 'stream_select' | 'app'>('front');
  const [currentView, setCurrentView] = useState('dashboard');
  const [staffroomLoaded, setStaffroomLoaded] = useState(false);
  const [plannerLoaded, setPlannerLoaded] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string>('senior_stem');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        
        // Sync profile state
        try {
          const userDoc = await getDoc(doc(db, 'user_profiles', user.uid));
          if (isMounted) {
            if (user.email === 'eduzamword@gmail.com') {
              // Forced Super Admin Bypass
              localStorage.setItem('user_role', 'SUPER_ADMIN');
              localStorage.setItem('account_approved', 'true');
              if (userDoc.exists()) {
                localStorage.setItem('user_name', userDoc.data().fullName);
              }
            } else if (userDoc.exists()) {
              const data = userDoc.data();
              localStorage.setItem('user_role', data.role);
              localStorage.setItem('user_name', data.fullName);
              localStorage.setItem('account_approved', String(data.approved));
            }
          }
        } catch (error) {
          console.warn("Could not sync profile (client may be offline), using cached roles.", error);
          if (isMounted && user.email === 'eduzamword@gmail.com') {
            localStorage.setItem('user_role', 'SUPER_ADMIN');
            localStorage.setItem('account_approved', 'true');
          }
        }

        if (isMounted) setPageState('app');
      } else {
        if (isMounted) {
          setIsAuthenticated(false);
          setUserEmail(null);
          setPageState(prev => (prev === 'app' || prev === 'login' ? 'front' : prev));
        }
      }
      
      if (isMounted) setIsAuthInitialized(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserEmail(null);
    setPageState('front');
  };

  const handleNavigate = (view: string) => {
    if (view === 'front' || view === 'cover') {
      setPageState('front');
      return;
    }
    if (view === 'landing') {
      setPageState('landing');
      return;
    }
    if (view === 'login') {
      setPageState('login');
      return;
    }
    if (view === 'staff') {
      setStaffroomLoaded(false);
    }
    if (view === 'lesson-planner' || view === 'planner') {
      setPlannerLoaded(true);
    }
    if (view === 'background-services') {
      setIsBackgroundModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const handleLoadingComplete = useCallback(() => {
    if (isAuthenticated) {
      setPageState('app');
    } else {
      setPageState('login');
    }
  }, [isAuthenticated]);

  // 0. Render Front Cover Page (Preceding the current Landing Page)
  if (pageState === 'front') {
    return (
      <FrontCoverPage 
        onEnter={() => setPageState('landing')}
        onLessonPlanner={() => {
          setPlannerLoaded(true);
          setCurrentView('lesson-planner');
          setPageState('app');
        }}
      />
    );
  }

  // 1. Render First Intro Page (Night with Shiny Stars - 3.5 Seconds)
  if (pageState === 'loading') {
    return <LoadingPage onComplete={handleLoadingComplete} />;
  }

  // 2. Render Login Page (Direct Gateway to Dashboard)
  if (pageState === 'login') {
    return (
      <LoginPage 
        onComplete={(email) => {
          setIsAuthenticated(true);
          setUserEmail(email);
          setCurrentView('dashboard');
          setPageState('app');
        }}
        onBackToLanding={() => setPageState('landing')}
      />
    );
  }

  // 3. Render Select Educational Stream Page
  if (pageState === 'stream_select') {
    return (
      <StreamSelectPage 
        userEmail={userEmail}
        onSelectStream={(streamId) => {
          setSelectedStream(streamId);
          setPageState('login');
        }}
      />
    );
  }

  // 4. Render Public Landing Page (The current kinetic animation page)
  if (pageState === 'landing') {
    return (
      <LandingPage 
        onSignInClick={() => setPageState('login')}
        onLaunchDemo={() => setPageState('login')}
        onBack={() => setPageState('front')}
      />
    );
  }

  const renderView = () => {
    // Check if account approval is required for non-super admins (Lesson Planner is open to all members regardless of registration)
    const isLessonPlannerView = currentView === 'lesson-planner' || currentView === 'planner';
    const userRole = localStorage.getItem('user_role') || 'TEACHER';
    const isApproved = localStorage.getItem('account_approved') === 'true' || userRole === 'SUPER_ADMIN' || userEmail === 'eduzamword@gmail.com';

    if (!isApproved && !isLessonPlannerView) {
      return <PendingApprovalNotice userEmail={userEmail} onSignOut={handleSignOut} />;
    }

    if (currentView.startsWith('private-chat:')) {
      const targetUserId = currentView.split(':')[1];
      return <PrivateChat targetUserId={targetUserId} onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            onNavigate={(view) => handleNavigate(view)} 
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenStreamModal={() => setIsStreamModalOpen(true)}
          />
        );
      case 'e_classroom':
        return <EClassroomResources />;
      case 'scholarships':
        return <ScholarshipsBursaries />;
      case 'inspection':
        return <InspectionAudit />;
      case 'national-calendar':
        return <NationalCalendar />;
      case 'timetable':
        return <TimetableView />;
      case 'markbook':
        return <OfficialMarkbook onNavigate={handleNavigate} />;
      case 'lesson-planner':
      case 'planner':
        if (!plannerLoaded) {
          return <StaffroomLoading onComplete={() => setPlannerLoaded(true)} />;
        }
        return <LessonPlanner onNavigate={handleNavigate} />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'communication':
        return <CommunicationHub onNavigate={(v) => handleNavigate(v)} />;
      case 'institutions':
        return <InstitutionsDirectory />;
      case 'students':
        return <StudentManagement />;
      case 'staff':
        if (!staffroomLoaded) {
          return <StaffroomLoading onComplete={() => setStaffroomLoaded(true)} />;
        }
        return <StaffPortal onNavigate={handleNavigate} />;
      case 'curriculum':
      case 'library':
        return <CurriculumHub onNavigate={handleNavigate} />;
      case 'report-forms':
        return <ReportForms onNavigate={handleNavigate} />;
      case 'results':
        return <ResultsManagement onNavigate={handleNavigate} />;
      case 'sba':
        return <SBAAssessment onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SettingsView />;
      case 'live-desk':
        return <LiveDeskOversight />;
      case 'admin-mgmt':
      case 'admin-registry':
        return <AdminManagementHub initialTab="registry" />;
      case 'admin-approvals':
        return <AdminManagementHub initialTab="approvals" />;
      case 'admin-configs':
        return <AdminManagementHub initialTab="configs" />;
      case 'admin-settings':
        return <AdminManagementHub initialTab="settings" />;
      case 'profile':
        return <ProfileView />;
      default:
        return (
          <DashboardView 
            onNavigate={(view) => handleNavigate(view)} 
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenStreamModal={() => setIsStreamModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex w-full overflow-x-hidden font-sans relative text-slate-900 selection:bg-blue-100 selection:text-blue-950">
      {/* Background Soft Atmospheric Ambient Glows - Harmonized Executive Palette matching First Page (Lightened by 20%) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-80 h-80 bg-blue-100/8 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-slate-200/12 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Drawer Overlay Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <NavigationDrawer 
            currentView={currentView}
            onNavigate={(v) => setCurrentView(v)}
            onClose={() => setIsDrawerOpen(false)}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      {/* Stream Selector Overlay Modal */}
      <AnimatePresence>
        {isStreamModalOpen && (
          <StreamSelectorModal 
            onSelectStream={(s) => setCurrentView(s === 'curriculum' ? 'curriculum' : 'dashboard')}
            onClose={() => setIsStreamModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Global Floating VoIP / Audio Call Widget */}
      <FloatingVoIPWidget />

      {/* Background Services Suite Modal */}
      <BackgroundManagerModal 
        isOpen={isBackgroundModalOpen} 
        onClose={() => setIsBackgroundModalOpen(false)} 
      />

      {/* Main Content Area - Full Width Page Size Edge to Edge with First Page Background */}
      <main 
        className={`flex-1 flex flex-col relative w-full z-10 ${(currentView === 'markbook' || currentView === 'dashboard' || currentView === 'communication' || currentView === 'lesson-planner' || currentView === 'planner' || currentView === 'report-forms' || currentView.startsWith('private-chat:')) ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
      >
        
        {/* Backward Navigation Sign on remaining pages */}
        {currentView !== 'dashboard' && currentView !== 'markbook' && currentView !== 'communication' && currentView !== 'lesson-planner' && currentView !== 'planner' && currentView !== 'report-forms' && !currentView.startsWith('private-chat:') && (
          <div className="px-2 sm:px-3 lg:px-4 pt-2 pb-1 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 text-black hover:text-black text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        {/* Page Container - 100% Extra Wide Page Size Edge to Edge */}
        <div className={`flex-1 w-full ${(currentView === 'markbook' || currentView === 'dashboard' || currentView === 'communication' || currentView === 'lesson-planner' || currentView === 'planner' || currentView === 'report-forms' || currentView.startsWith('private-chat:')) ? 'p-0 h-full flex flex-col overflow-y-auto' : currentView === 'curriculum' ? 'px-1 sm:px-2 py-1' : 'px-4 sm:px-6 lg:px-10 py-5'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={`w-full ${(currentView === 'markbook' || currentView === 'dashboard' || currentView === 'communication' || currentView.startsWith('private-chat:')) ? 'h-full flex flex-col overflow-hidden' : ''}`}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

