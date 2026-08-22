import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, ShieldCheck, AlertCircle, Building2, School } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface RegistrationPageProps {
  onComplete: () => void;
}

export default function RegistrationPage({ onComplete }: RegistrationPageProps) {
  const [email, setEmail] = useState('chikwandab2@gmail.com');
  const [password, setPassword] = useState('eduzam2026pass');
  const [institution, setInstitution] = useState(() => localStorage.getItem('user_institution') || 'Munali Boys Secondary School');
  const [isManualInst, setIsManualInst] = useState(false);
  const [manualInstName, setManualInstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const zambiaSchools = [
    'University of Zambia (UNZA)',
    'Copperbelt University (CBU)',
    'Mulungushi University',
    'Munali Boys Secondary School',
    'Munali Girls Secondary School',
    'David Kaunda Technical High School',
    'Kabulonga Boys Secondary School',
    'Kabulonga Girls Secondary School',
    'Luanshya Girls Secondary School',
    'Mpelembe Secondary School',
    'Canisius Secondary School',
    'Chipembi Girls Secondary School',
    'Livingstone High School',
    'Chizongwe Technical Secondary School',
    'Kasama Girls Secondary School',
    'Solwezi Technical High School',
    'Mongu Secondary School',
    'Mansa Secondary School',
    'Chinsali Day Secondary School'
  ];

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        const userDocRef = doc(db, 'user_profiles', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        const isSuper = result.user.email === 'eduzamword@gmail.com';
        const finalInst = isManualInst ? manualInstName.trim() || 'Munali Boys Secondary School' : institution;
        
        let role = isSuper ? 'SUPER_ADMIN' : 'TEACHER';
        let name = result.user.displayName || 'Ministry Official';
        let approved = isSuper;

        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data.role;
          name = data.fullName;
          approved = data.approved;
          const userSavedInst = finalInst || data.institution || 'Munali Boys Secondary School';
          localStorage.setItem('user_institution', userSavedInst);
          await setDoc(userDocRef, {
            institution: userSavedInst,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          localStorage.setItem('user_institution', finalInst);
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            fullName: name,
            role: role,
            institution: finalInst,
            approved: approved,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        localStorage.setItem('user_email', result.user.email);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', name);
        localStorage.setItem('account_approved', String(approved));

        onComplete();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Before passing to Firebase Auth
      const cleanEmail = email?.toString().trim().toLowerCase();
      const cleanPassword = password?.toString().trim();
      const finalInst = isManualInst ? manualInstName.trim() || 'Munali Boys Secondary School' : institution;

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
        if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('invalid-login-credentials')) {
          try {
            result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            const isSuper = cleanEmail === 'eduzamword@gmail.com';
            await setDoc(doc(db, 'user_profiles', result.user.uid), {
              uid: result.user.uid,
              email: cleanEmail,
              fullName: isSuper ? 'Super Administrator' : 'Ministry Official',
              role: isSuper ? 'SUPER_ADMIN' : 'TEACHER',
              institution: finalInst,
              approved: isSuper,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (createErr: any) {
            throw new Error('Incorrect password. Please verify your credentials.');
          }
        } else {
          throw signInErr;
        }
      }

      if (result && result.user.email) {
        const userDocRef = doc(db, 'user_profiles', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          localStorage.setItem('user_role', data.role);
          localStorage.setItem('user_name', data.fullName);
          localStorage.setItem('account_approved', String(data.approved));
          const userSavedInst = finalInst || data.institution || 'Munali Boys Secondary School';
          localStorage.setItem('user_institution', userSavedInst);
          await setDoc(userDocRef, {
            institution: userSavedInst,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          const isSuper = cleanEmail === 'eduzamword@gmail.com';
          localStorage.setItem('user_role', isSuper ? 'SUPER_ADMIN' : 'TEACHER');
          localStorage.setItem('account_approved', isSuper ? 'true' : 'false');
          localStorage.setItem('user_institution', finalInst);
        }
        localStorage.setItem('user_email', result.user.email);
        onComplete();
      }
    } catch (e: any) {
      setError(e.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-10 max-w-2xl mx-auto font-sans relative">
      {/* Top Header Navigation */}
      <div className="w-full">
        <button 
          onClick={onComplete}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          RETURN TO PORTAL
        </button>
      </div>

      {/* Main Form Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8 my-auto py-8"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
          <p className="text-slate-500 text-base mt-2 font-medium">
            Access your administrative or teaching dashboard
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 px-6 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-slate-800 text-base shadow-xs active:scale-[0.99] group"
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
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-slate-200"></div>
          <span className="bg-white px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            PLATFORM CREDENTIALS
          </span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCredentialSubmit} className="space-y-5">
          {/* Select Institution / School */}
          <div className="space-y-1.5 p-3.5 bg-teal-50/50 border-2 border-teal-100 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-700" />
                SELECT INSTITUTION / SCHOOL
              </label>
              <button
                type="button"
                onClick={() => setIsManualInst(!isManualInst)}
                className="text-[11px] font-extrabold text-teal-700 hover:text-teal-950 underline cursor-pointer"
              >
                {isManualInst ? 'Select from List' : '+ Custom School'}
              </button>
            </div>

            {isManualInst ? (
              <input
                type="text"
                value={manualInstName}
                onChange={(e) => setManualInstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-teal-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-teal-600"
                placeholder="Enter school name..."
                required
              />
            ) : (
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-teal-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-teal-600 appearance-none cursor-pointer"
                required
              >
                {zambiaSchools.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors"
                placeholder="name@moe.gov.zm"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                SECRET KEY / PASSWORD
              </label>
              <a href="#" className="text-xs font-bold text-teal-700 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:border-teal-600 transition-colors"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-black uppercase tracking-wider text-sm rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'SIGN IN TO DASHBOARD'}
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="w-full pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        MINISTRY OF EDUCATION
      </div>
    </div>
  );
}
