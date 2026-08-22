import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, Settings, CheckCircle, XCircle, 
  Search, Filter, MoreVertical, ShieldAlert,
  Save, RefreshCw, Power, AlertTriangle, UserCog
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, query, getDocs, updateDoc, doc, 
  onSnapshot, orderBy, serverTimestamp, getDoc, setDoc
} from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: string;
  institution: string;
  approved: boolean;
  staffId: string;
}

interface AppSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export default function AdminManagementHub({ initialTab = 'registry' }: { initialTab?: string }) {
  const isSuperAdmin = auth.currentUser?.email === 'eduzamword@gmail.com' || localStorage.getItem('user_role') === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md">
          Super Admin authorization is required to access the administrative Management Hub, manage user registrations, or configure system-wide settings.
        </p>
      </div>
    );
  }

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    maintenanceMode: false,
    registrationEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // Subscribe to users
    const q = query(collection(db, 'user_profiles'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setUsers(userList);
      setLoading(false);
    });

    // Subscribe to settings
    const settingsRef = doc(db, 'app_settings', 'global');
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      } else {
        // Init settings if missing
        setDoc(settingsRef, {
          maintenanceMode: false,
          registrationEnabled: true,
          updatedAt: serverTimestamp()
        });
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, []);

  const handleToggleApproval = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'user_profiles', uid), {
        approved: !currentStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  const handleChangeRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'user_profiles', uid), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleToggleSettings = async (key: keyof AppSettings) => {
    try {
      await updateDoc(doc(db, 'app_settings', 'global'), {
        [key]: !settings[key],
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Hub Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-400" />
              Management Hub
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Super Admin Control Center • Institutional Oversight & Security
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('registry')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'registry' ? 'bg-white text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Registry
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'approvals' ? 'bg-white text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Approvals ({users.filter(u => !u.approved).length})
            </button>
            <button
              onClick={() => setActiveTab('configs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'configs' ? 'bg-white text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Configurations
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-white text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto w-full">
          {(activeTab === 'registry' || activeTab === 'approvals') ? (
            <div className="space-y-6">
              {/* Search & Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email or school..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* User Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Educator</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Institution</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Designation</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Approval Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                            Synchronizing secure profiles...
                          </td>
                        </tr>
                      ) : filteredUsers.filter(u => activeTab === 'approvals' ? !u.approved : true).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                            {activeTab === 'approvals' ? "No pending approvals found." : "No users found matching your search."}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.filter(u => activeTab === 'approvals' ? !u.approved : true).map((user) => (
                          <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-teal-50/50 border border-teal-100 flex items-center justify-center text-teal-400 font-black text-xs">
                                  {user.fullName.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{user.fullName}</div>
                                  <div className="text-[11px] text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-600 font-medium">{user.institution}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.staffId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.uid, e.target.value)}
                                className="text-xs font-bold text-slate-700 bg-slate-100 border-none rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-400 outline-none"
                              >
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="PROVINCIAL_DIRECTOR">Director</option>
                                <option value="SCHOOL_HEAD">School Head</option>
                                <option value="ECZ_INSPECTOR">Inspector</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="CLASS_TEACHER">Class Teacher</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              {user.approved ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                  <CheckCircle className="w-3 h-3" /> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-100">
                                  <RefreshCw className="w-3 h-3 animate-spin-slow" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleToggleApproval(user.uid, user.approved)}
                                className={`p-2 rounded-lg transition-all ${
                                  user.approved 
                                    ? 'text-red-500 hover:bg-red-50' 
                                    : 'text-teal-400 hover:bg-teal-50/50'
                                }`}
                                title={user.approved ? "Revoke Access" : "Approve Access"}
                              >
                                {user.approved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'configs' ? (
            <div className="max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-400" />
                    System Configurations
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Maintenance Mode</div>
                      <div className="text-xs text-slate-500">Temporarily disable access for non-admins</div>
                    </div>
                    <button 
                      onClick={() => handleToggleSettings('maintenanceMode')}
                      className={`w-12 h-6 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">New Registrations</div>
                      <div className="text-xs text-slate-500">Allow new educators to create accounts</div>
                    </div>
                    <button 
                      onClick={() => handleToggleSettings('registrationEnabled')}
                      className={`w-12 h-6 rounded-full relative transition-all ${settings.registrationEnabled ? 'bg-teal-400' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.registrationEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  Security Protocols & Global Settings
                </h3>
                
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div className="text-xs text-red-800 font-medium leading-relaxed">
                      <strong>Zambian Cybersecurity Compliance:</strong> All administrative actions are logged. Misuse of Super Admin privileges in accessing restricted markbook data is a breach of Ministry standards.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <button className="py-3 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <UserCog className="w-4 h-4" /> Export Security Audit Logs
                  </button>
                  <button className="py-3 px-4 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> System Cache Flush
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
