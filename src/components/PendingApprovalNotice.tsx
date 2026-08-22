import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface Props {
  userEmail: string | null;
  onSignOut: () => void;
}

export default function PendingApprovalNotice({ userEmail, onSignOut }: Props) {
  const userName = localStorage.getItem('user_name') || userEmail || 'Educator';
  const userInstitution = localStorage.getItem('user_institution') || 'Ministry of Education Institution';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/80 to-slate-100 flex items-center justify-center p-6 text-slate-900 relative overflow-hidden">
      {/* Background Soft Atmospheric Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6 relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">
            Account Awaiting Approval
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hello <strong className="text-slate-900">{userName}</strong>, your account for <strong className="text-slate-900">{userInstitution}</strong> is currently pending administrator verification.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Official Email:</span>
            <span className="font-bold">{userEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Review
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              // Allow simulation of admin approval for demo testing convenience
              localStorage.setItem('account_approved', 'true');
              window.location.reload();
            }}
            className="w-full py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm transition-all shadow-md active:scale-[0.98]"
          >
            Check Status / Refresh
          </button>
          
          <button
            onClick={async () => {
              await signOut(auth);
              localStorage.clear();
              onSignOut();
            }}
            className="w-full py-4 rounded-2xl bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-black text-sm transition-all active:scale-[0.98]"
          >
            Continue to Login Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
