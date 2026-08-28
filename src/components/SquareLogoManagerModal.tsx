import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { 
  Upload, 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Lock,
  Layers,
  Square
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export interface SquareLogoPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  svgMarkup?: string;
  previewType: 'svg' | 'image';
  url?: string;
}

export const SQUARE_LOGO_PRESETS: SquareLogoPreset[] = [
  {
    id: 'zm-coat-of-arms-sq',
    name: 'Zambia National Coat of Arms (Square)',
    category: 'National Emblem',
    description: 'Official Republic of Zambia sovereign crest with Victoria Falls shield and eagle.',
    previewType: 'svg',
    svgMarkup: 'NATIONAL_CREST_SVG'
  },
  {
    id: 'ecz-official-seal-sq',
    name: 'Examinations Council of Zambia (ECZ Seal)',
    category: 'Examination Council',
    description: 'ECZ standard national assessment seal with academic torch and open book.',
    previewType: 'svg',
    svgMarkup: 'ECZ_SEAL_SVG'
  },
  {
    id: 'stem-academy-crest-sq',
    name: 'National STEM & Secondary Crest',
    category: 'Institutional Crest',
    description: 'Academic heraldic crest with laurel wreaths and excellence banner.',
    previewType: 'svg',
    svgMarkup: 'STEM_CREST_SVG'
  }
];

export function isUserAdminOrSuperAdmin(userEmail?: string | null, userRole?: string | null): boolean {
  const email = (userEmail || auth.currentUser?.email || localStorage.getItem('user_email') || '').toLowerCase();
  const role = (userRole || localStorage.getItem('user_role') || '').toUpperCase();
  
  if (email === 'eduzamword@gmail.com' || email === 'chikwandab2@gmail.com') return true;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SCHOOL_HEAD' || role === 'PROVINCIAL_DIRECTOR' || role === 'ECZ_INSPECTOR' || role === 'ADMINISTRATOR') return true;
  if (role.includes('ADMIN') || role.includes('DIRECTOR') || role.includes('HEAD') || role.includes('INSPECTOR')) return true;
  return false;
}

// Helper to crop image into exact square data URL
async function createSquareCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number } | null,
  rotation = 0
): Promise<string> {
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

  // Square output size (400x400 for high resolution print quality)
  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);

  if (pixelCrop) {
    // If rotation exists, handle canvas transform
    if (rotation !== 0) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
        tempCanvas.width = safeArea;
        tempCanvas.height = safeArea;

        tempCtx.translate(safeArea / 2, safeArea / 2);
        tempCtx.rotate((rotation * Math.PI) / 180);
        tempCtx.translate(-image.width / 2, -image.height / 2);
        tempCtx.drawImage(image, 0, 0);

        ctx.drawImage(
          tempCanvas,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          outputSize,
          outputSize
        );
      }
    } else {
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
    }
  } else {
    // Fallback square fit
    const minDim = Math.min(image.width, image.height);
    const startX = (image.width - minDim) / 2;
    const startY = (image.height - minDim) / 2;
    ctx.drawImage(image, startX, startY, minDim, minDim, 0, 0, outputSize, outputSize);
  }

  return canvas.toDataURL('image/png', 0.95);
}

// Preset Square Vector Renderers
export const SquarePresetIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-full h-full' }) => {
  if (type === 'zm-coat-of-arms-sq' || type === 'NATIONAL_CREST_SVG') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        {/* Crisp Square Border Background */}
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
        {/* National Eagle atop Pick & Hoe */}
        <path d="M50,14 C56,10 65,14 62,20 C58,24 53,24 50,22 C47,24 42,24 38,20 C35,14 44,10 50,14 Z" fill="currentColor" />
        <path d="M48,22 L52,22 L50,26 Z" fill="currentColor" />
        {/* Crossed Pick & Hoe */}
        <line x1="32" y1="28" x2="68" y2="44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="68" y1="28" x2="32" y2="44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* Shield with Victoria Falls wavy bars */}
        <path d="M35,36 L65,36 L65,58 C65,72 50,82 50,82 C50,82 35,72 35,58 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line x1="36" y1="45" x2="64" y2="45" stroke="currentColor" strokeWidth="1.5" />
        <line x1="37" y1="52" x2="63" y2="52" stroke="currentColor" strokeWidth="1.5" />
        <line x1="39" y1="59" x2="61" y2="59" stroke="currentColor" strokeWidth="1.5" />
        <line x1="42" y1="66" x2="58" y2="66" stroke="currentColor" strokeWidth="1.5" />
        {/* Supporter Figures Silhouette (Man & Woman) */}
        <circle cx="27" cy="40" r="3.5" fill="currentColor" />
        <path d="M23,45 L31,45 L29,66 L25,66 Z" fill="currentColor" />
        <circle cx="73" cy="40" r="3.5" fill="currentColor" />
        <path d="M69,45 L77,45 L75,66 L71,66 Z" fill="currentColor" />
        {/* Bottom Scroll Ribbon with Motto */}
        <path d="M18,84 L82,84 L76,92 L24,92 Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.8" />
        <text x="50" y="89.5" fontSize="4.2" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="serif" letterSpacing="0.2">
          ONE ZAMBIA • ONE NATION
        </text>
      </svg>
    );
  }

  if (type === 'ecz-official-seal-sq' || type === 'ECZ_SEAL_SVG') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        {/* Square Seal Outer Box */}
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="6" y="6" width="88" height="88" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 1.5" />
        {/* Inner Central Emblem */}
        <circle cx="50" cy="45" r="26" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Torch & Flame */}
        <path d="M50,22 C53,27 57,29 55,34 C52,34 50,34 47,34 C45,29 48,27 50,22 Z" fill="currentColor" />
        <rect x="47.5" y="34" width="5" height="12" fill="currentColor" />
        {/* Open Academic Book */}
        <path d="M50,48 C44,45 36,45 32,47 L32,60 C36,58 44,58 50,61 Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50,48 C56,45 64,45 68,47 L68,60 C64,58 56,58 50,61 Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.5" />
        <line x1="50" y1="48" x2="50" y2="61" stroke="currentColor" strokeWidth="1.8" />
        {/* ECZ Banner Box */}
        <rect x="14" y="74" width="72" height="16" fill="#ffffff" stroke="currentColor" strokeWidth="2" />
        <text x="50" y="82" fontSize="6.5" fontWeight="900" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" letterSpacing="0.8">
          ECZ OFFICIAL
        </text>
        <text x="50" y="87.5" fontSize="3.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">
          EXAMINATIONS COUNCIL
        </text>
      </svg>
    );
  }

  // STEM Secondary Crest
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="5.5" y="5.5" width="89" height="89" fill="none" stroke="currentColor" strokeWidth="0.8" />
      {/* Laurel branches */}
      <path d="M22,70 C16,55 18,35 28,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M78,70 C84,55 82,35 72,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Central Shield */}
      <path d="M30,22 L70,22 C70,22 72,55 50,75 C28,55 30,22 30,22 Z" fill="#ffffff" stroke="currentColor" strokeWidth="2.2" />
      {/* Shield Contents */}
      <circle cx="50" cy="36" r="7" fill="currentColor" />
      <path d="M42,50 C46,47 54,47 58,50 L58,60 C54,58 46,58 42,60 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Ribbon */}
      <path d="M12,82 L88,82 L82,92 L18,92 Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.8" />
      <text x="50" y="88.5" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="serif" letterSpacing="0.4">
        DISCIPLINE & EXCELLENCE
      </text>
    </svg>
  );
};

interface SquareLogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string | null;
  onLogoApplied: (logoUrl: string, logoName?: string) => void;
}

export default function SquareLogoManagerModal({
  isOpen,
  onClose,
  currentLogoUrl,
  onLogoApplied
}: SquareLogoManagerModalProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  
  // Custom upload & cropper state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('zm-coat-of-arms-sq');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin privileges
  useEffect(() => {
    const adminStatus = isUserAdminOrSuperAdmin();
    setIsAdmin(adminStatus);
  }, [isOpen]);

  // Read stored branding from Firestore or localStorage
  useEffect(() => {
    if (!isOpen) return;

    const loadBranding = async () => {
      try {
        const docRef = doc(db, 'app_settings', 'school_branding');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.reportLogoUrl) {
            if (data.reportLogoType === 'preset' && data.presetId) {
              setSelectedPresetId(data.presetId);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read school branding settings:', err);
      }
    };
    loadBranding();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB. Please choose an image under 5MB.');
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setRawImage(dataUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => setIsProcessing(false);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (_croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSaveCroppedSquareLogo = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    if (!isAdmin) {
      alert('Only Admins and Super Admins have permission to upload and modify the official report form logo.');
      return;
    }

    setIsProcessing(true);
    try {
      const squareDataUrl = await createSquareCroppedImage(rawImage, croppedAreaPixels, rotation);
      
      // Save permanently to localStorage
      localStorage.setItem('school_report_logo_url', squareDataUrl);
      localStorage.setItem('school_report_logo_type', 'custom');
      localStorage.setItem('school_report_logo_is_square', 'true');

      // Save to Firebase Firestore app_settings/school_branding
      try {
        await setDoc(doc(db, 'app_settings', 'school_branding'), {
          reportLogoUrl: squareDataUrl,
          reportLogoName: 'Custom School Logo (Square)',
          reportLogoType: 'custom',
          isSquareLogo: true,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.email || 'admin'
        }, { merge: true });
      } catch (fbErr) {
        console.warn('Firestore write warning:', fbErr);
      }

      // Dispatch event for instant multi-component reactivity
      window.dispatchEvent(new CustomEvent('school-logo-updated', { 
        detail: { url: squareDataUrl, type: 'custom', isSquare: true } 
      }));

      onLogoApplied(squareDataUrl, 'Custom School Logo (Square)');
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error generating square cropped logo:', err);
      alert('Could not process square logo. Please try a different image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPresetSquareLogo = async (preset: SquareLogoPreset) => {
    if (!isAdmin) {
      alert('Only Admins and Super Admins have permission to change the official report form logo.');
      return;
    }

    setSelectedPresetId(preset.id);
    setIsProcessing(true);

    try {
      const logoIdentifier = preset.id;
      localStorage.setItem('school_report_logo_url', logoIdentifier);
      localStorage.setItem('school_report_logo_type', 'preset');
      localStorage.setItem('school_report_logo_name', preset.name);
      localStorage.setItem('school_report_logo_is_square', 'true');

      try {
        await setDoc(doc(db, 'app_settings', 'school_branding'), {
          reportLogoUrl: logoIdentifier,
          presetId: preset.id,
          reportLogoName: preset.name,
          reportLogoType: 'preset',
          isSquareLogo: true,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.email || 'admin'
        }, { merge: true });
      } catch (fbErr) {
        console.warn('Firestore write warning:', fbErr);
      }

      window.dispatchEvent(new CustomEvent('school-logo-updated', { 
        detail: { url: logoIdentifier, type: 'preset', isSquare: true, name: preset.name } 
      }));

      onLogoApplied(logoIdentifier, preset.name);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Error saving preset square logo:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!isAdmin) return;
    const defaultPreset = SQUARE_LOGO_PRESETS[0];
    await handleApplyPresetSquareLogo(defaultPreset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-400">
              <Square className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">
                  Report Form Official Logo (1:1 Square)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Admin Authorized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official square insignia rendered on all Ministry Academic Report Forms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Non-Admin Security Warning if viewed by standard user */}
        {!isAdmin && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
            <span>
              <strong>Administrative Access Notice:</strong> Only verified <strong>Admins</strong> and <strong>Super Admins</strong> can upload and update the school report form logo. Standard teachers can view the active logo.
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Custom Square Logo
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Standard Zambian Presets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Upload Drop Zone / Cropper */}
              {!rawImage ? (
                <div 
                  onClick={() => isAdmin && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all ${
                    isAdmin 
                      ? 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50/70 dark:bg-slate-900/50 cursor-pointer group' 
                      : 'border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    disabled={!isAdmin}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Upload Official School Logo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Select PNG, JPG, or SVG. The built-in square cropper will automatically format your image to a crisp 1:1 square aspect ratio.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Browse Image File
                    </button>
                  )}
                </div>
              ) : (
                /* Interactive Square Cropper Container */
                <div className="space-y-3">
                  <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
                    <Cropper
                      image={rawImage}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1} // STRICT 1:1 SQUARE
                      cropShape="rect"
                      showGrid={true}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={handleCropComplete}
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                      <Square className="w-3 h-3 text-teal-400" />
                      Strict 1:1 Square Frame
                    </div>
                  </div>

                  {/* Crop Controls: Zoom & Rotate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-2">
                      <ZoomOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <ZoomIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-500 w-8 text-right font-bold">
                        {zoom.toFixed(1)}x
                      </span>
                    </div>

                    {/* Rotation Control */}
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-slate-500 text-[11px] font-medium">Rotation:</span>
                      <button
                        type="button"
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3 text-teal-600" />
                        Rotate 90° ({rotation}°)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRawImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Discard & Choose another photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Mock Preview of Report Header */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-950">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Report Sheet Square Logo Placement (Preview)
                </span>
                <div className="p-3 bg-white border border-slate-300 rounded-lg text-center font-serif text-slate-900 shadow-inner">
                  <div className="flex justify-center mb-2.5">
                    <div className="w-8 h-8 border border-black p-0.5 bg-white flex items-center justify-center overflow-hidden aspect-square shadow-2xs">
                      {rawImage ? (
                        <img 
                          src={rawImage} 
                          alt="Cropped Preview" 
                          className="w-full h-full object-contain aspect-square" 
                        />
                      ) : currentLogoUrl && currentLogoUrl.startsWith('data:') ? (
                        <img 
                          src={currentLogoUrl} 
                          alt="Current Logo" 
                          className="w-full h-full object-contain aspect-square" 
                        />
                      ) : (
                        <SquarePresetIcon type={currentLogoUrl || 'zm-coat-of-arms-sq'} />
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 mt-1.5">
                    <h4 className="font-bold text-[8px] uppercase tracking-wider text-black leading-tight">
                      Republic of Zambia
                    </h4>
                    <h5 className="font-bold text-[8.5px] uppercase tracking-widest text-black leading-tight">
                      Ministry of Education
                    </h5>
                    <p className="font-bold text-[7px] text-slate-800 uppercase">
                      Student Academic Report Form
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Presets Selection View */
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select one of the official gazetted Zambian square emblems as your school report form logo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SQUARE_LOGO_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => isAdmin && handleApplyPresetSquareLogo(preset)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center relative ${
                        isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                      } ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Square Emblem Container */}
                      <div className="w-14 h-14 border border-black p-1 bg-white flex items-center justify-center aspect-square shadow-sm mb-2 text-slate-900">
                        <SquarePresetIcon type={preset.id} />
                      </div>

                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1 leading-tight">
                        {preset.name}
                      </h5>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase mb-1">
                        {preset.category}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default Coat of Arms
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'upload' && rawImage && isAdmin && (
              <button
                type="button"
                onClick={handleSaveCroppedSquareLogo}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Square Logo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
