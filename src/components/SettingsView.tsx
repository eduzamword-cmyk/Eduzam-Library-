import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { 
  User, 
  Shield, 
  Bell, 
  Building2, 
  Save, 
  CheckCircle2, 
  Key, 
  Lock,
  Globe,
  Mail,
  GraduationCap,
  Database,
  RefreshCw,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Move,
  SlidersHorizontal,
  Zap,
  Radio,
  PhoneCall,
  MapPin,
  DownloadCloud
} from 'lucide-react';
import BackgroundManagerModal from './BackgroundManagerModal';
import { backgroundService } from '../lib/backgroundService';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const DEFAULT_PORTRAIT = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

const PRESET_AVATARS = [
  { id: 'p1', name: 'Executive Officer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'p2', name: 'Senior Inspector', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'p3', name: 'Director Education', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
  { id: 'p4', name: 'Technical Specialist', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { id: 'p5', name: 'Curriculum Director', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
  { id: 'p6', name: 'Standards Lead', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
];

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number } | null
): Promise<string> {
  if (!pixelCrop) return imageSrc;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return imageSrc;

  const outputSize = 300;
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL('image/jpeg', 0.88);
}

export default function SettingsView() {
  const [fullName, setFullName] = useState('Ministry Official / Educator');
  const [email] = useState('eduzamword@gmail.com');
  const [nrcNumber, setNrcNumber] = useState('123456/78/1');
  const [institution, setInstitution] = useState('Ministry of Education HQ');
  const [province, setProvince] = useState('Lusaka');
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Portrait State
  const [portraitUrl, setPortraitUrl] = useState<string>(() => {
    return auth.currentUser?.photoURL || localStorage.getItem('user_portrait_url') || DEFAULT_PORTRAIT;
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Cropping Modal State
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineNotifications, setDeadlineNotifications] = useState(true);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);

  // Synchronize initial user info and listen to Firestore user_profiles document
  useEffect(() => {
    if (auth.currentUser) {
      if (auth.currentUser.displayName) setFullName(auth.currentUser.displayName);
      if (auth.currentUser.photoURL) setPortraitUrl(auth.currentUser.photoURL);
    }

    const profileId = auth.currentUser?.uid || 'default_user';
    const profileRef = doc(db, 'user_profiles', profileId);

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.portraitUrl) {
          setPortraitUrl(data.portraitUrl);
          localStorage.setItem('user_portrait_url', data.portraitUrl);
          window.dispatchEvent(new CustomEvent('user-portrait-updated', { detail: { url: data.portraitUrl } }));
        }
        if (data.fullName) setFullName(data.fullName);
      }
    }, (error) => {
      console.warn('Firestore user_profiles subscription issue:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRawImageToCrop(dataUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
      setIsCompressing(false);
    };
    reader.onerror = () => setIsCompressing(false);
    reader.readAsDataURL(file);

    // reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleApplyCrop = async () => {
    if (!rawImageToCrop || !croppedAreaPixels) return;
    setIsCompressing(true);
    try {
      const croppedUrl = await getCroppedImg(rawImageToCrop, croppedAreaPixels);
      setPortraitUrl(croppedUrl);
      await persistPortrait(croppedUrl);
      setRawImageToCrop(null);
    } catch (err) {
      console.error('Error applying image crop:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCropCurrentPhoto = () => {
    setRawImageToCrop(portraitUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const persistPortrait = async (url: string) => {
    localStorage.setItem('user_portrait_url', url);
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: url });
      } catch (err) {
        console.warn('Could not sync photoURL to Firebase auth user:', err);
      }
    }

    // Save permanently to Firestore user_profiles collection
    try {
      const profileId = auth.currentUser?.uid || 'default_user';
      await setDoc(doc(db, 'user_profiles', profileId), {
        portraitUrl: url,
        fullName,
        email: auth.currentUser?.email || 'officer@moe.gov.zm',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not save profile image to Firestore:', err);
    }

    window.dispatchEvent(new CustomEvent('user-portrait-updated', { detail: { url } }));
  };

  const handleSelectPreset = (url: string) => {
    setPortraitUrl(url);
    persistPortrait(url);
  };

  const handleResetPortrait = () => {
    setPortraitUrl(DEFAULT_PORTRAIT);
    persistPortrait(DEFAULT_PORTRAIT);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistPortrait(portraitUrl);
    if (auth.currentUser && fullName) {
      try {
        await updateProfile(auth.currentUser, { displayName: fullName, photoURL: portraitUrl });
      } catch (err) {
        console.warn('Failed updating auth profile:', err);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const seedSampleData = async () => {
    const isSuperAdmin = auth.currentUser?.email === 'eduzamword@gmail.com' || localStorage.getItem('user_role') === 'SUPER_ADMIN';
    if (!isSuperAdmin) {
      alert('Super Admin Authorization Required: Global system configuration and database seeding can only be performed by a verified Super Administrator.');
      return;
    }

    setSeeding(true);
    try {
      // Seed Notices
      await addDoc(collection(db, 'notices'), {
        title: 'National Examination Guidelines 2026',
        author: 'Director of Examinations',
        content: 'All regional education officers must ensure continuous assessment records are uploaded by Friday.',
        createdAt: serverTimestamp(),
        date: 'August 12, 2026'
      });

      // Seed Staff
      const staff = [
        { name: 'Dr. Joseph Mulenga', role: 'Head of Mathematics', licenseNo: 'REG/2021/04921', school: 'David Kaunda Technical', status: 'Active', province: 'Lusaka' },
        { name: 'Mary Banda', role: 'Senior Science Teacher', licenseNo: 'REG/2022/10842', school: 'Capital Girls Secondary', status: 'Active', province: 'Lusaka' }
      ];
      for (const s of staff) {
        await addDoc(collection(db, 'staff'), s);
      }

      // Seed Students
      const students = [
        { name: 'Mapalo Phiri', grade: 'Grade 12', school: 'David Kaunda National Technical', nrc: '458123/10/1', examNo: '2026-0001', status: 'Active' },
        { name: 'Kondwani Banda', grade: 'Grade 12', school: 'Kabulonga Boys Secondary', nrc: '521489/10/1', examNo: '2026-0002', status: 'Active' }
      ];
      for (const st of students) {
        await addDoc(collection(db, 'students'), st);
      }

      // Seed Institutions
      const institutions = [
        { name: 'University of Zambia (UNZA)', category: 'Higher Education', province: 'Lusaka', code: 'UNZA-HQ-01' },
        { name: 'David Kaunda National Technical High School', category: 'Secondary Schools', province: 'Lusaka', code: 'DK-SEC-01' },
        { name: 'Ministry of Education HQ', category: 'Administrative', province: 'Lusaka', code: 'MOE-HQ-LUS' }
      ];
      for (const inst of institutions) {
        await addDoc(collection(db, 'institutions'), inst);
      }

      // Seed Marks
      const marks = [
        { studentName: 'Chanda Mutale', studentId: '2026-0001', subject: 'Mathematics', grade: 'Grade 12', caScore: '38/40', examScore: '52/60', total: '90%', letter: 'A+' },
        { studentName: 'Natasha Banda', studentId: '2026-0002', subject: 'Physics', grade: 'Grade 12', caScore: '35/40', examScore: '48/60', total: '83%', letter: 'A' }
      ];
      for (const m of marks) {
        await addDoc(collection(db, 'marks'), m);
      }

      alert('Sample data seeded to Firestore successfully!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'seeding');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <User className="w-4 h-4" /> Portal Settings
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account & System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal profile, NRC credentials, official school affiliation, and notification preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={seedSampleData}
            disabled={seeding}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all border border-slate-200 flex items-center gap-2 active:scale-95"
          >
            <Database className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved Successfully!' : 'Save Changes'}
          </button>
        </div>
      </header>


      {saved && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm font-semibold"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Your settings and profile updates have been updated successfully!
        </motion.div>
      )}

      {/* Main Form Layout - 100% Full Width */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Info Form */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Official Profile Information</h2>
              <p className="text-xs text-slate-500">Ministry of Education credentials</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* OFFICIAL PROFILE PORTRAIT SECTION */}
            <div className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600" /> Official Profile Portrait
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a custom photo or select a Ministry preset avatar. Updates automatically in real time across the portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPortrait}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Reset to default portrait"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Current Avatar Circle */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 p-1 shadow-md shadow-amber-600/20">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                      <img
                        src={portraitUrl}
                        alt="Current Profile Portrait"
                        className="w-full h-full object-cover"
                      />
                      {isCompressing && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camera overlay trigger button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-transform active:scale-90 cursor-pointer border-2 border-white"
                    title="Upload new portrait photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Upload & Preset Gallery Controls */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCropCurrentPhoto}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Adjust, pan or zoom active photo"
                    >
                      <Crop className="w-3.5 h-3.5 text-teal-600" /> Crop / Zoom Photo
                    </button>

                    <span className="text-[11px] text-slate-400">Auto-fits 1:1 Circle</span>
                  </div>

                  {/* Preset Avatars Grid */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Or Choose a Preset Ministry Avatar
                    </span>
                    <div className="grid grid-cols-6 gap-2 max-w-xs">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = portraitUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.url)}
                            className={`relative rounded-full p-[1.5px] transition-all cursor-pointer group/avatar ${
                              isSelected
                                ? 'ring-2 ring-teal-600 ring-offset-2 scale-105'
                                : 'hover:scale-105 border border-slate-200'
                            }`}
                            title={preset.name}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-teal-600 text-white p-0.5 rounded-full shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">National Registration Card (NRC)</label>
                <input
                  type="text"
                  value={nrcNumber}
                  onChange={(e) => setNrcNumber(e.target.value)}
                  placeholder="123456/78/1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm font-medium text-slate-800"
                >
                  <option value="Lusaka">Lusaka Province</option>
                  <option value="Copperbelt">Copperbelt Province</option>
                  <option value="Central">Central Province</option>
                  <option value="Southern">Southern Province</option>
                  <option value="Western">Western Province</option>
                  <option value="Eastern">Eastern Province</option>
                  <option value="Luapula">Luapula Province</option>
                  <option value="Northern">Northern Province</option>
                  <option value="Muchinga">Muchinga Province</option>
                  <option value="North-Western">North-Western Province</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Select Institution / School</label>
              <div className="space-y-2">
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm font-medium text-slate-800"
                >
                  <option value="Arakan Boys Secondary School">Arakan boys Secondary School</option>
                  <option value="Munali Boys Secondary School">Munali Boys Secondary School</option>
                  <option value="Munali Girls Secondary School">Munali Girls Secondary School</option>
                  <option value="David Kaunda Technical High School">David Kaunda Technical High School</option>
                  <option value="Kabulonga Boys Secondary School">Kabulonga Boys Secondary School</option>
                  <option value="Kabulonga Girls Secondary School">Kabulonga Girls Secondary School</option>
                  <option value="Ministry of Education Headquarters (HQ)">MoE Gazetted - Ministry of Education HQ</option>
                </select>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Or type institution name manually..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500">Sets your active institutional jurisdiction and stream (MoE Gazetted)</p>
              </div>
            </div>
          </form>
        </div>

        {/* Security & Preferences Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Portal Alerts</h3>
                <p className="text-xs text-slate-500">Notifications settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-800">Exam Deadline Alerts</p>
                  <p className="text-xs text-slate-400">Receive markbook submission reminders</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={deadlineNotifications}
                  onChange={(e) => setDeadlineNotifications(e.target.checked)}
                  className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-800">Ministry Email Directives</p>
                  <p className="text-xs text-slate-400">Receive circular updates via email</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                />
              </label>
            </div>
          </div>

          {/* BACKGROUND SERVICES ENGINE CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700 shadow-md text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 rounded-xl flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Background Services Engine</h3>
                  <p className="text-xs text-indigo-200/70">5 High-Performance Background Capabilities</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  Silent Push Content Pre-Fetch
                </span>
                <span className="text-emerald-400 font-semibold">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-300">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  Background Audio / Low-Energy VoIP
                </span>
                <span className="text-cyan-400 font-semibold">Standby</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Geofence & Significant Change
                </span>
                <span className="text-emerald-400 font-semibold">Armed</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-300">
                  <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
                  URLSession Resumable Queue
                </span>
                <span className="text-amber-400 font-semibold">Resumable</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBgModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Open Background Services Console</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Security & Authentication</h3>
                <p className="text-xs text-slate-500">Google OAuth & Local Security Session</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your session is authenticated via Ministry OAuth & System Verification (`{email}`).
            </p>

            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Authenticated Session Verified
            </div>
          </div>
        </div>

      </div>

      {/* BACKGROUND MANAGER MODAL */}
      <BackgroundManagerModal 
        isOpen={isBgModalOpen} 
        onClose={() => setIsBgModalOpen(false)} 
      />

      {/* MANUAL PORTRAIT CROPPING MODAL */}
      <AnimatePresence>
        {rawImageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                    <Crop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Crop Profile Portrait</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pan and zoom to frame your portrait inside the circle</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRawImageToCrop(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cropper Container */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-950 overflow-hidden">
                <Cropper
                  image={rawImageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />

                {/* Helper hint badge overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10.5px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm pointer-events-none">
                  <Move className="w-3 h-3 text-teal-400" /> Drag image to pan • Use slider to zoom
                </div>
              </div>

              {/* Controls Section */}
              <div className="p-5 space-y-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
                {/* Zoom Slider */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-10">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <span className="text-xs font-mono text-slate-500 w-10 text-right">{Math.round(zoom * 100)}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Frame
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRawImageToCrop(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      disabled={isCompressing}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-extrabold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      {isCompressing ? 'Applying...' : 'Apply & Save Portrait'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
