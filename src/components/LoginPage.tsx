import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles, KeyRound, 
  User, UserPlus, Building, Building2, BadgeCheck, CheckCircle2, AlertCircle, Globe, School, MapPin
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const ZAMBIA_INSTITUTIONS_GROUPED = [
  {
    group: 'Higher Learning & Universities',
    schools: [
      'University of Zambia (UNZA)',
      'Copperbelt University (CBU)',
      'Mulungushi University',
      'Mukuba University',
      'Kwame Nkrumah University',
      'Levy Mwanawasa Medical University',
      'Chalimbana University',
      'Kapasa Makasa University',
      'Eden University',
      'Cavendish University Zambia',
      'National Institute of Public Administration (NIPA)',
      'Technical Vocational Teachers College (TVTC)'
    ]
  },
  {
    group: 'Lusaka Province Schools',
    schools: [
      'Munali Boys Secondary School',
      'Munali Girls Secondary School',
      'Arakan Boys Secondary School',
      'Arakan Girls Secondary School',
      'Lusaka West Boarding Secondary School',
      'David Kaunda Technical High School',
      'Kabulonga Boys Secondary School',
      'Kabulonga Girls Secondary School',
      'Kamwala Secondary School',
      'Matero Boys Secondary School',
      'Matero Girls Secondary School',
      'Roma Girls Secondary School',
      'St. Marys Secondary School (Lusaka)',
      'Libala Secondary School',
      'Twin Palm Secondary School',
      'Highland Secondary School',
      'Olympia Secondary School',
      'Lusaka Central Primary School',
      'Northmead Primary School'
    ]
  },
  {
    group: 'Copperbelt Province Schools',
    schools: [
      'Mpelembe Secondary School',
      'Luanshya Girls Secondary School',
      'Luanshya Boys Secondary School',
      'Ndola Girls Technical High School',
      'Temweni Secondary School',
      'Hellen Kaunda Secondary School',
      'Kansenshi Secondary School',
      'Kitwe Boys Secondary School',
      'St. Francis Secondary School',
      'Chingola High School',
      'Mufulira Secondary School',
      'Ndola Primary School'
    ]
  },
  {
    group: 'Southern Province Schools',
    schools: [
      'Canisius Secondary School (Chikuni)',
      'Livingstone High School',
      'St. Marks Secondary School',
      'St. Josephs Secondary School (Chivuna)',
      'Choma Secondary School',
      'Batoka Secondary School',
      'Kalomo Secondary School',
      'Mazabuka Secondary School',
      'Monze Secondary School',
      'Livingstone Primary School'
    ]
  },
  {
    group: 'Central Province Schools',
    schools: [
      'Chipembi Girls Secondary School',
      'Serenje Boys Secondary School',
      'Mukobeko Secondary School',
      'Kabwe High School',
      'Bwacha Secondary School',
      'Mumbwa Secondary School',
      'Malcom Moffat Secondary School',
      'Kabwe Primary School'
    ]
  },
  {
    group: 'Eastern Province Schools',
    schools: [
      'Chizongwe Technical Secondary School',
      'St. Monicas Secondary School',
      'Chipata Day Secondary School',
      'Petauke Secondary School',
      'Katete Secondary School',
      'Lundazi Secondary School',
      'Chipata Primary School'
    ]
  },
  {
    group: 'Northern Province Schools',
    schools: [
      'Kasama Girls Secondary School',
      'Mungwi Technical Secondary School',
      'St. Charles Lwanga Secondary School',
      'Malole Secondary School',
      'Mbala Secondary School',
      'Kasama Primary School'
    ]
  },
  {
    group: 'Muchinga Province Schools',
    schools: [
      'Chinsali Day Secondary School',
      'Kenneth Kaunda Secondary School',
      'Mpika Boys Secondary School',
      'Isoka Secondary School',
      'Chinsali Primary School'
    ]
  },
  {
    group: 'Luapula Province Schools',
    schools: [
      'Mansa Secondary School',
      'St. Clements Secondary School',
      'Mabumba Secondary School',
      'Samfya Secondary School',
      'Kawambwa Secondary School',
      'Mansa Primary School'
    ]
  },
  {
    group: 'North-Western Province Schools',
    schools: [
      'Solwezi Technical High School',
      'Mwinilunga Secondary School',
      'Kasempa Secondary School',
      'Zambezi Secondary School',
      'Solwezi Primary School'
    ]
  },
  {
    group: 'Western Province Schools',
    schools: [
      'Mongu Secondary School',
      'Kambule Secondary School',
      'Senanga Secondary School',
      'Kaoma Secondary School',
      'Holy Cross Secondary School',
      'Mongu Primary School'
    ]
  },
  {
    group: 'Ministry Administration & PEO',
    schools: [
      'Ministry of Education Headquarters (HQ)',
      'Lusaka Provincial Education Office (PEO)',
      'Copperbelt Provincial Education Office (PEO)',
      'Southern Provincial Education Office (PEO)',
      'Central Provincial Education Office (PEO)',
      'Eastern Provincial Education Office (PEO)',
      'Northern Provincial Education Office (PEO)',
      'Muchinga Provincial Education Office (PEO)',
      'Luapula Provincial Education Office (PEO)',
      'North-Western Provincial Education Office (PEO)',
      'Western Provincial Education Office (PEO)'
    ]
  }
];

export const ALL_ZAMBIA_SCHOOLS = ZAMBIA_INSTITUTIONS_GROUPED.flatMap(g => g.schools);

export const findCategoryForSchool = (schoolName: string): string => {
  const group = ZAMBIA_INSTITUTIONS_GROUPED.find(g => g.schools.includes(schoolName));
  return group ? group.group : 'Lusaka Province Schools';
};

interface LoginPageProps {
  onComplete: (userEmail?: string) => void;
  onBackToLanding?: () => void;
}

export default function LoginPage({ onComplete, onBackToLanding }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  const zambiaInstitutionsGrouped = ZAMBIA_INSTITUTIONS_GROUPED;
  const zambiaSchoolsList = ALL_ZAMBIA_SCHOOLS;

  const getSchoolsForCategory = (cat: string) => {
    const group = zambiaInstitutionsGrouped.find(g => g.group === cat);
    return group ? group.schools : [];
  };

  // Determine initial saved school or fallback to Munali Boys Secondary School
  const getInitialSchool = () => {
    return localStorage.getItem('user_institution') || 'Munali Boys Secondary School';
  };
  const getInitialCategory = () => {
    const saved = localStorage.getItem('user_institution');
    if (saved) {
      return localStorage.getItem('user_category') || findCategoryForSchool(saved);
    }
    return 'Lusaka Province Schools';
  };
  const getInitialIsManual = () => {
    const saved = localStorage.getItem('user_institution');
    if (!saved) return false;
    return localStorage.getItem('is_manual_institution') === 'true' || (!ALL_ZAMBIA_SCHOOLS.includes(saved) && saved !== 'Munali Boys Secondary School');
  };

  // Sign In State
  const [email, setEmail] = useState(() => localStorage.getItem('user_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginCategory, setLoginCategory] = useState(getInitialCategory);
  const [loginInstitution, setLoginInstitution] = useState(getInitialSchool);
  const [isManualLoginInstitution, setIsManualLoginInstitution] = useState(getInitialIsManual);
  const [manualLoginInstitutionName, setManualLoginInstitutionName] = useState(() => {
    const saved = localStorage.getItem('user_institution');
    return getInitialIsManual() && saved ? saved : '';
  });

  // Sign Up / Signing State
  const [fullName, setFullName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [province, setProvince] = useState('Lusaka');
  const [designation, setDesignation] = useState('TEACHER');
  const [signUpCategory, setSignUpCategory] = useState('Lusaka Province Schools');
  const [selectedInstitution, setSelectedInstitution] = useState('Munali Boys Secondary School');
  const [isManualInstitution, setIsManualInstitution] = useState(false);
  const [manualInstitutionName, setManualInstitutionName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotSuccess('Password reset link successfully sent to your email. Please check your inbox.');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send password reset email. Please verify your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Sync login selector with localStorage whenever mode changes
  useEffect(() => {
    const saved = localStorage.getItem('user_institution');
    if (saved) {
      setLoginInstitution(saved);
      const cat = localStorage.getItem('user_category') || findCategoryForSchool(saved);
      setLoginCategory(cat);
      const isManual = localStorage.getItem('is_manual_institution') === 'true' || (!ALL_ZAMBIA_SCHOOLS.includes(saved) && saved !== 'Munali Boys Secondary School');
      setIsManualLoginInstitution(isManual);
      if (isManual) {
        setManualLoginInstitutionName(saved);
      }
    }
  }, [mode]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const zambiaProvinces = [
    'Central Province', 'Copperbelt Province', 'Eastern Province', 'Luapula Province',
    'Lusaka Province', 'Muchinga Province', 'Northern Province', 'North-Western Province',
    'Southern Province', 'Western Province'
  ];

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        // Sync with Firestore
        const userDocRef = doc(db, 'user_profiles', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let role = 'TEACHER';
        let name = result.user.displayName || 'Official Administrator';
        let approved = false;
        const chosenInstitution = isManualLoginInstitution 
          ? manualLoginInstitutionName.trim() || 'Munali Boys Secondary School'
          : loginInstitution;

        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data.role || 'TEACHER';
          name = data.fullName || result.user.displayName || 'Official Administrator';
          approved = data.approved || false;
          
          if (role !== 'SUPER_ADMIN') {
            if (data.institution && data.institution.toLowerCase() !== chosenInstitution.toLowerCase()) {
              await signOut(auth);
              throw new Error(`Institution mismatch. You are registered under "${data.institution}". Please select your correct school.`);
            }
          }
          
          const finalInst = role === 'SUPER_ADMIN' ? chosenInstitution : (data.institution || chosenInstitution);
          localStorage.setItem('user_institution', finalInst);
          
          const updates: any = { updatedAt: serverTimestamp() };
          if (!data.institution && role !== 'SUPER_ADMIN') {
             updates.institution = finalInst;
          }
          await setDoc(userDocRef, updates, { merge: true });
        } else {
          // Create new profile for Google users
          role = result.user.email === 'eduzamword@gmail.com' ? 'SUPER_ADMIN' : 'TEACHER'; 
          approved = result.user.email === 'eduzamword@gmail.com'; 
          localStorage.setItem('user_institution', chosenInstitution);
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            fullName: name,
            role: role,
            institution: chosenInstitution,
            province: 'Lusaka Province',
            approved: approved,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        localStorage.setItem('user_email', result.user.email);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', name);
        localStorage.setItem('account_approved', String(approved));
        
        onComplete(result.user.email);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Before passing to Firebase Auth
      const cleanEmail = email?.toString().trim().toLowerCase();
      const cleanPassword = password?.toString().trim();
      const chosenInstitution = isManualLoginInstitution
        ? manualLoginInstitutionName.trim() || 'Munali Boys Secondary School'
        : loginInstitution;

      if (!cleanEmail || !cleanPassword || cleanEmail === '' || cleanPassword === '') {
        throw new Error('Email and password are required');
      }

      // Validate email format
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        throw new Error('Invalid email format');
      }

      let result;
      try {
        result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } catch (signInErr: any) {
        const code = signInErr?.code || '';
        const message = (signInErr?.message || '').toLowerCase();
        
        // If user is not yet created in this Firebase instance, handle auto-provisioning
        if (
          code.includes('user-not-found') || 
          code.includes('invalid-credential') || 
          code.includes('invalid-login-credentials') ||
          message.includes('user-not-found') ||
          message.includes('invalid credential')
        ) {
          try {
            result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            const isSuperAdmin = cleanEmail === 'eduzamword@gmail.com';
            await setDoc(doc(db, 'user_profiles', result.user.uid), {
              uid: result.user.uid,
              email: cleanEmail,
              fullName: cleanEmail === 'eduzamword@gmail.com' ? 'Super Administrator' : 'Ministry Official',
              role: isSuperAdmin ? 'SUPER_ADMIN' : 'TEACHER',
              institution: chosenInstitution,
              approved: isSuperAdmin,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (createErr: any) {
            if (createErr?.code === 'auth/email-already-in-use') {
              throw new Error('Incorrect password for this account. Please verify your secret key.');
            } else if (createErr?.code === 'auth/weak-password') {
              throw new Error('Password must be at least 6 characters.');
            } else {
              throw new Error('Authentication failed. Please verify your credentials or create an account.');
            }
          }
        } else if (code.includes('wrong-password')) {
          throw new Error('Incorrect password. Please verify your secret key.');
        } else if (code.includes('too-many-requests')) {
          throw new Error('Too many failed attempts. Please wait a moment and try again.');
        } else {
          throw new Error(signInErr?.message || 'Invalid credentials. Please try again.');
        }
      }

      if (result && result.user.email) {
        // Sync with Firestore
        const userDocRef = doc(db, 'user_profiles', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role = data.role || 'TEACHER';
          
          if (role !== 'SUPER_ADMIN') {
            if (data.institution && data.institution.toLowerCase() !== chosenInstitution.toLowerCase()) {
              await signOut(auth);
              throw new Error(`Institution mismatch. You are registered under "${data.institution}". Please select your correct school.`);
            }
          }
          
          localStorage.setItem('user_role', role);
          localStorage.setItem('user_name', data.fullName);
          localStorage.setItem('account_approved', String(data.approved));
          
          const finalInst = role === 'SUPER_ADMIN' ? chosenInstitution : (data.institution || chosenInstitution);
          localStorage.setItem('user_institution', finalInst);
          
          const updates: any = { updatedAt: serverTimestamp() };
          if (!data.institution && role !== 'SUPER_ADMIN') {
             updates.institution = finalInst;
          }
          await setDoc(userDocRef, updates, { merge: true });
        } else {
          // Fallback if doc missing
          const isSuperAdmin = cleanEmail === 'eduzamword@gmail.com';
          localStorage.setItem('user_role', isSuperAdmin ? 'SUPER_ADMIN' : 'TEACHER');
          localStorage.setItem('account_approved', isSuperAdmin ? 'true' : 'false');
          localStorage.setItem('user_institution', chosenInstitution);
        }

        localStorage.setItem('user_email', result.user.email);
        onComplete(result.user.email);
      }
    } catch (e: any) {
      setError(e.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isRegistered, setIsRegistered] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Before passing to Firebase Auth
    const cleanEmail = signUpEmail?.toString().trim().toLowerCase();
    const cleanPassword = signUpPassword?.toString().trim();
    const cleanConfirm = confirmPassword?.toString().trim();
    const cleanFullName = fullName?.toString().trim();
    const cleanStaffId = staffId?.toString().trim();

    if (!cleanEmail || !cleanPassword || cleanEmail === '' || cleanPassword === '') {
      setError('Email and password are required');
      return;
    }

    // Validate email format
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Invalid email format');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreedTerms) {
      setError('You must confirm authorization under Ministry of Education guidelines.');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      
      const institutionName = isManualInstitution ? manualInstitutionName.trim() : selectedInstitution;
      const isAutoApproved = designation === 'SUPER_ADMIN' || cleanEmail === 'eduzamword@gmail.com';
      const finalRole = cleanEmail === 'eduzamword@gmail.com' ? 'SUPER_ADMIN' : designation;

      // Create Firestore Profile
      await setDoc(doc(db, 'user_profiles', result.user.uid), {
        uid: result.user.uid,
        email: cleanEmail,
        fullName: cleanFullName || 'Ministry Official',
        role: finalRole,
        institution: institutionName,
        province: province,
        staffId: cleanStaffId,
        approved: isAutoApproved,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Save to localStorage for immediate UI and persistent use
      localStorage.setItem('user_role', finalRole);
      localStorage.setItem('user_name', cleanFullName || 'Ministry Official');
      localStorage.setItem('user_staff_id', cleanStaffId);
      localStorage.setItem('user_province', province);
      localStorage.setItem('user_institution', institutionName);
      localStorage.setItem('user_category', signUpCategory);
      localStorage.setItem('is_manual_institution', isManualInstitution ? 'true' : 'false');
      localStorage.setItem('user_email', cleanEmail);
      localStorage.setItem('account_approved', String(isAutoApproved));

      // Synchronize Login Form state immediately so registered name of school always shows on login selection bar
      setLoginInstitution(institutionName);
      setLoginCategory(signUpCategory);
      setEmail(cleanEmail);
      if (isManualInstitution) {
        setIsManualLoginInstitution(true);
        setManualLoginInstitutionName(institutionName);
      } else {
        setIsManualLoginInstitution(false);
      }

      setIsRegistered(true);
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(e.message || 'Registration failed. Try a different email.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-slate-100 flex items-center justify-center p-6 text-slate-900 relative overflow-hidden">
        {/* Background Soft Atmospheric Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6 relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">
              Registration Successful
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your account for <strong className="text-slate-900">{isManualInstitution ? manualInstitutionName : selectedInstitution}</strong> has been submitted for verification.
            </p>
          </div>

          <button
            onClick={() => {
              setIsRegistered(false);
              setMode('signin');
              // Clear the temporary auth session if any, to force a clean login
              signOut(auth);
            }}
            className="w-full py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm transition-all shadow-md active:scale-[0.98]"
          >
            Continue to Login Page
          </button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-slate-100 text-slate-900 flex flex-col justify-between p-0 font-sans relative w-full overflow-x-hidden">
      {/* Background Soft Atmospheric Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Authentication Box - Full Edge to Edge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full min-h-screen bg-white/95 backdrop-blur-sm p-6 sm:p-12 md:p-16 shadow-none space-y-6 flex flex-col justify-center max-w-full relative z-10"
      >
        {/* MODE 1: SIGN IN FORM */}
        {mode === 'signin' ? (
          <div className="space-y-6">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-6 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-[8px] flex items-center justify-center gap-3 transition-all font-bold text-slate-800 text-sm shadow-2xs active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Log in with Google
            </button>

            {/* Section Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200"></div>
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                OFFICIAL CREDENTIALS
              </span>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Institution / School Selector for Sign In with Aligned Dropdowns */}
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    SELECT INSTITUTION / SCHOOL
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualLoginInstitution(!isManualLoginInstitution)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer shrink-0 border border-slate-200"
                    title={isManualLoginInstitution ? "Return to directory list" : "Enter custom school"}
                    aria-label={isManualLoginInstitution ? "Return to directory list" : "Enter custom school"}
                  >
                    {isManualLoginInstitution ? '✕' : '+'}
                  </button>
                </div>

                {isManualLoginInstitution ? (
                  <div className="relative flex items-center">
                    <School className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={manualLoginInstitutionName}
                      onChange={(e) => setManualLoginInstitutionName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors placeholder:text-slate-400"
                      placeholder="Enter school or institution name (e.g. Munali Boys Secondary School)"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. Classification / Province Dropdown */}
                    <div className="relative flex items-center">
                      <MapPin className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={loginCategory}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setLoginCategory(newCat);
                          const schools = getSchoolsForCategory(newCat);
                          if (schools.length > 0 && !schools.includes(loginInstitution)) {
                            setLoginInstitution(schools[0]);
                          }
                        }}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none transition-colors cursor-pointer truncate"
                        title="Province / Category"
                      >
                        {zambiaInstitutionsGrouped.map((grp) => (
                          <option key={grp.group} value={grp.group}>
                            {grp.group}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>

                    {/* 2. Specific Institution / School Dropdown */}
                    <div className="relative flex items-center">
                      <School className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={loginInstitution}
                        onChange={(e) => setLoginInstitution(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none transition-colors cursor-pointer truncate"
                        title="Institution / School"
                        required
                      >
                        {(getSchoolsForCategory(loginCategory).length > 0
                          ? getSchoolsForCategory(loginCategory)
                          : zambiaSchoolsList
                        ).map((sch) => (
                          <option key={sch} value={sch}>
                            {sch}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors"
                    placeholder="name@moe.gov.zm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    SECRET KEY / PASSWORD
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setForgotEmail(email); 
                      setForgotSuccess(''); 
                      setForgotError(''); 
                      setShowForgotPasswordModal(true); 
                    }} 
                    className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Forgot Key?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-[8px] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-black uppercase tracking-wider text-xs rounded-[8px] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {loading ? 'AUTHENTICATING...' : 'LOGIN'}
              </button>
            </form>
          </div>
        ) : (
          /* MODE 2: SIGN UP / SIGNING FORM */
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  FULL OFFICIAL NAME
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600"
                    placeholder="e.g. Dr. Mwamba Banda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  MOE / TEACHER STAFF ID
                </label>
                <div className="relative flex items-center">
                  <BadgeCheck className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600"
                    placeholder="MOE-2026-9482"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  PROVINCIAL JURISDICTION
                </label>
                <div className="relative flex items-center">
                  <Building className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none"
                  >
                    {zambiaProvinces.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  DESIGNATION / ROLE
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none"
                >
                  <option value="SUPER_ADMIN">Level 5 Super Administrator</option>
                  <option value="PROVINCIAL_DIRECTOR">Provincial Education Director</option>
                  <option value="SCHOOL_HEAD">Institutional School Head</option>
                  <option value="ECZ_INSPECTOR">Quality Audit Inspector</option>
                  <option value="TEACHER">Senior Class Educator</option>
                  <option value="CLASS_TEACHER">Class Teacher</option>
                </select>
              </div>
            </div>

            {designation !== 'SUPER_ADMIN' && (
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    ASSIGNED INSTITUTION / SCHOOL
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualInstitution(!isManualInstitution)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer shrink-0 border border-slate-200"
                    title={isManualInstitution ? "Return to directory list" : "Enter custom school"}
                    aria-label={isManualInstitution ? "Return to directory list" : "Enter custom school"}
                  >
                    {isManualInstitution ? '✕' : '+'}
                  </button>
                </div>

                {isManualInstitution ? (
                  <div className="relative flex items-center">
                    <School className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={manualInstitutionName}
                      onChange={(e) => setManualInstitutionName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors placeholder:text-slate-400"
                      placeholder="Enter full name of school or institution (e.g. Munali Boys Secondary School)"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. Classification / Province Dropdown */}
                    <div className="relative flex items-center">
                      <MapPin className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={signUpCategory}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setSignUpCategory(newCat);
                          const schools = getSchoolsForCategory(newCat);
                          if (schools.length > 0 && !schools.includes(selectedInstitution)) {
                            setSelectedInstitution(schools[0]);
                          }
                        }}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none transition-colors cursor-pointer truncate"
                        title="Province / Category"
                      >
                        {zambiaInstitutionsGrouped.map((grp) => (
                          <option key={grp.group} value={grp.group}>
                            {grp.group}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>

                    {/* 2. Specific Institution / School Dropdown */}
                    <div className="relative flex items-center">
                      <School className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={selectedInstitution}
                        onChange={(e) => setSelectedInstitution(e.target.value)}
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 appearance-none transition-colors cursor-pointer truncate"
                        title="Institution / School"
                        required
                      >
                        {(getSchoolsForCategory(signUpCategory).length > 0
                          ? getSchoolsForCategory(signUpCategory)
                          : zambiaSchoolsList
                        ).map((sch) => (
                          <option key={sch} value={sch}>
                            {sch}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs font-bold">
                        ▼
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                OFFICIAL MINISTRY EMAIL
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600"
                  placeholder="m.banda@moe.gov.zm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  CREATE SECRET KEY
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  CONFIRM SECRET KEY
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[8px] text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              <span className="text-xs text-slate-600 font-medium leading-tight">
                I certify that I am an authorized officer under the Ministry of Education and agree to statutory governance guidelines.
              </span>
            </label>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-[8px] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[8px] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-black uppercase tracking-wider text-xs rounded-[8px] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'REGISTERING MOE CREDENTIALS...' : 'CREATE VERIFIED MOE ACCOUNT'}
            </button>
          </form>
        )}
      </motion.div>

      {/* Bottom Action / Switcher */}
      <div className="w-full text-center py-4 flex items-center justify-center relative z-20">
        {mode === 'signin' ? (
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Don't have an account?{' '}
            <span className="font-black text-teal-700 hover:text-teal-900 underline underline-offset-4">
              Register here
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Already have an account?{' '}
            <span className="font-black text-teal-700 hover:text-teal-900 underline underline-offset-4">
              Sign in here
            </span>
          </button>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">Ministry of Education Portal Recovery</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered official email address. We will send you a secure Firebase password reset link to update your secret key.
                </p>

                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Official Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@moe.gov.zm"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {forgotLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
