import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Building2, Shield, 
  MapPin, BadgeCheck, Calendar, Camera,
  Edit2, Save, RefreshCw
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ProfileView() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const docRef = doc(db, 'user_profiles', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFullName(data.fullName);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'user_profiles', uid), {
        fullName: fullName,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, fullName: fullName });
      localStorage.setItem('user_name', fullName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
        <p className="font-medium">Synchronizing Secure Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <User className="w-8 h-8 text-teal-600" />
          Personal Profile
        </h1>
        <p className="text-slate-500 font-medium mt-1">Manage your official educator identity and credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden mx-auto">
                {profile?.portraitUrl ? (
                  <img src={profile.portraitUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition-all border-2 border-white">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 relative">
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {profile?.fullName}
              </h2>
              <p className="text-sm font-bold text-teal-600 uppercase tracking-widest">{profile?.role.replace(/_/g, ' ')}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Status</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Identity Verified</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-bold">Ministry Official</p>
                <p className="text-[10px] text-slate-400">Verified Educator Credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                Professional Credentials
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-teal-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              )}
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <User className="w-4 h-4 text-slate-400" />
                      {profile?.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                  <div className="flex items-center gap-3 text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 opacity-60">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {profile?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution / School</label>
                  <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {profile?.institution}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Province</label>
                  <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {profile?.province}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff / TS Number</label>
                  <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Shield className="w-4 h-4 text-slate-400" />
                    {profile?.staffId}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</label>
                  <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
