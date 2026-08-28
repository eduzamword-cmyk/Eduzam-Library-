import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Save, 
  Layers, 
  FileText, 
  CheckCircle2, 
  User, 
  Calendar, 
  Building2, 
  Sparkles,
  RefreshCw,
  Eye,
  Edit3,
  FileCheck2,
  FileDown,
  BarChart3,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Square,
  Camera,
  Upload
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import SquareLogoManagerModal, { SquarePresetIcon, isUserAdminOrSuperAdmin } from './SquareLogoManagerModal';

interface ReportFormPreviewProps {
  initialClass?: string;
  initialTerm?: string;
  initialYear?: string;
  onNavigateToSubView?: (subView: 'results' | 'performance' | 'analysis' | 'report-forms') => void;
  onClose?: () => void;
}

export interface StudentReportData {
  id: string;
  schoolName: string;
  academicYear: string;
  studentName: string;
  studentNo: string;
  gradeClass: string;
  term: string;
  dob: string;
  position: string;
  totalStudents: number;
  overallAverage: string;
  overallGrade: string;
  attendancePresent: string;
  attendanceAbsent: string;
  daysOpen: string;
  conduct: string;
  classTeacherComment: string;
  headTeacherComment: string;
  classTeacherName: string;
  classTeacherDate: string;
  headTeacherName: string;
  headTeacherDate: string;
  parentName: string;
  parentDate: string;
  schoolStamp: string;
  nextTermBegins: string;
  subjects: {
    id: number;
    name: string;
    assessment1: string;
    assessment2: string;
    assessment3: string;
    exam: string;
    total: string;
    grade: string;
    remark: string;
  }[];
}

const AVAILABLE_CLASSES = [
  'Grade 12 STEM-A',
  'Grade 12 Science-B',
  'Grade 11 STEM-A',
  'Grade 11 Science-B',
  'Grade 10 STEM-A',
  'Grade 9 Science-A'
];

const DEFAULT_SUBJECT_NAMES = [
  'English Language',
  'Mathematics',
  'Integrated Science / Physics',
  'Chemistry / Biology',
  'Social Studies / Geography',
  'History / Religious Education',
  'Civic Education',
  'Physical Education',
  'Art and Design',
  'Agricultural Science',
  'Information & Comm. Technology',
  'Additional Language / Zambian Lang.'
];

const ROSTER_BY_CLASS: Record<string, { id: string; name: string; studentNo: string; dob: string }[]> = {
  'Grade 12 STEM-A': [
    { id: '1', name: 'CHANDA MWANSA', studentNo: 'REP-2026-001', dob: '12/05/2010' },
    { id: '2', name: 'KALABA SAMUEL', studentNo: 'REP-2026-002', dob: '18/08/2009' },
    { id: '3', name: 'KANYIKA KHONDWANI', studentNo: 'REP-2026-003', dob: '04/11/2009' },
    { id: '4', name: 'MWAPE JOHN', studentNo: 'REP-2026-004', dob: '22/02/2010' },
    { id: '5', name: 'MUTALE KASONDE', studentNo: 'REP-2026-005', dob: '15/07/2010' },
    { id: '6', name: 'BWEMBYA CHILUFYA', studentNo: 'REP-2026-006', dob: '30/03/2010' },
    { id: '7', name: 'TAONGA ZIMBA', studentNo: 'REP-2026-007', dob: '14/09/2010' },
    { id: '8', name: 'MWIINGA MWEETWA', studentNo: 'REP-2026-008', dob: '09/01/2010' }
  ],
  'Grade 12 Science-B': [
    { id: '9', name: 'KABWE MUSONDA', studentNo: 'REP-2026-009', dob: '11/04/2009' },
    { id: '10', name: 'THANDIWE BANDA', studentNo: 'REP-2026-010', dob: '25/06/2010' },
    { id: '11', name: 'LOMBE MULENGA', studentNo: 'REP-2026-011', dob: '03/12/2009' }
  ],
  'Grade 11 STEM-A': [
    { id: '12', name: 'NATASHA PHIRI', studentNo: 'REP-2026-012', dob: '19/10/2010' },
    { id: '13', name: 'MAPALO CHISHIMBA', studentNo: 'REP-2026-013', dob: '08/04/2011' },
    { id: '14', name: 'CHILEKWA KASONGO', studentNo: 'REP-2026-014', dob: '27/02/2011' }
  ],
  'Grade 11 Science-B': [
    { id: '15', name: 'FAITH PHIRI', studentNo: 'REP-2026-015', dob: '14/05/2011' },
    { id: '16', name: 'KONDA BANDA', studentNo: 'REP-2026-016', dob: '30/08/2010' }
  ],
  'Grade 10 STEM-A': [
    { id: '17', name: 'SEPO LUNGU', studentNo: 'REP-2026-017', dob: '16/03/2012' },
    { id: '18', name: 'SIKOTA MWALE', studentNo: 'REP-2026-018', dob: '21/11/2011' }
  ],
  'Grade 9 Science-A': [
    { id: '19', name: 'MWAPE TEMBO', studentNo: 'REP-2026-019', dob: '05/01/2013' },
    { id: '20', name: 'BUPE KAUNDA', studentNo: 'REP-2026-020', dob: '19/07/2012' }
  ]
};

const DEFAULT_SCHOOL = 'LUSAKA NATIONAL STEM & ACADEMIC SECONDARY SCHOOL';

export default function ReportFormPreview({
  initialClass = 'Grade 12 STEM-A',
  initialTerm = '2ND TERM',
  initialYear = '2026',
  onNavigateToSubView,
  onClose
}: ReportFormPreviewProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm.includes('Term') ? initialTerm.toUpperCase() : '2ND TERM');
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('1'); // 'BLANK', 'BATCH', or student ID
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Square Report Form Logo State & Admin Permission
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('school_report_logo_url') || 'zm-coat-of-arms-sq';
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(() => isUserAdminOrSuperAdmin());

  // Listen to Firestore branding changes & Custom window events for live reactivity
  useEffect(() => {
    setIsAdminUser(isUserAdminOrSuperAdmin());

    const handleLogoUpdate = (e: any) => {
      if (e.detail?.url) {
        setLogoUrl(e.detail.url);
      } else {
        const stored = localStorage.getItem('school_report_logo_url');
        if (stored) setLogoUrl(stored);
      }
    };
    window.addEventListener('school-logo-updated', handleLogoUpdate);

    // Live subscription to Firestore school branding document
    const docRef = doc(db, 'app_settings', 'school_branding');
    const unsubscribeSnapshot = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.reportLogoUrl) {
          setLogoUrl(data.reportLogoUrl);
          localStorage.setItem('school_report_logo_url', data.reportLogoUrl);
        }
      }
    }, (err) => {
      console.warn('Firestore school_branding subscription issue:', err);
    });

    return () => {
      window.removeEventListener('school-logo-updated', handleLogoUpdate);
      unsubscribeSnapshot();
    };
  }, []);

  // Local storage cache for customized reports
  const [reportsDataMap, setReportsDataMap] = useState<Record<string, StudentReportData>>({});

  const reportContainerRef = useRef<HTMLDivElement>(null);

  // Current class roster
  const currentRoster = ROSTER_BY_CLASS[selectedClass] || ROSTER_BY_CLASS['Grade 12 STEM-A'];

  // Ensure selectedStudentId is valid when class changes
  useEffect(() => {
    if (selectedStudentId !== 'BLANK' && selectedStudentId !== 'BATCH') {
      const exists = currentRoster.some(s => s.id === selectedStudentId);
      if (!exists && currentRoster.length > 0) {
        setSelectedStudentId(currentRoster[0].id);
      }
    }
  }, [selectedClass, currentRoster, selectedStudentId]);

  // Generate initial student data or load from localStorage
  const getStudentReport = (studentId: string): StudentReportData => {
    const cacheKey = `report_${selectedClass}_${studentId}_${selectedTerm}_${selectedYear}`;
    if (reportsDataMap[cacheKey]) {
      return reportsDataMap[cacheKey];
    }

    if (studentId === 'BLANK') {
      return {
        id: 'BLANK',
        schoolName: '',
        academicYear: '',
        studentName: '',
        studentNo: '',
        gradeClass: '',
        term: '',
        dob: '',
        position: '',
        totalStudents: 45,
        overallAverage: '',
        overallGrade: '',
        attendancePresent: '',
        attendanceAbsent: '',
        daysOpen: '',
        conduct: '',
        classTeacherComment: '',
        headTeacherComment: '',
        classTeacherName: '',
        classTeacherDate: '',
        headTeacherName: '',
        headTeacherDate: '',
        parentName: '',
        parentDate: '',
        schoolStamp: '',
        nextTermBegins: '',
        subjects: Array.from({ length: 12 }).map((_, idx) => ({
          id: idx + 1,
          name: '',
          assessment1: '',
          assessment2: '',
          assessment3: '',
          exam: '',
          total: '',
          grade: '',
          remark: ''
        }))
      };
    }

    const studentInfo = currentRoster.find(s => s.id === studentId) || currentRoster[0];
    const indexInRoster = currentRoster.findIndex(s => s.id === studentId);
    const mockPos = indexInRoster >= 0 ? indexInRoster + 1 : 3;

    // Generated academic marks for realism
    const subjects = DEFAULT_SUBJECT_NAMES.map((name, idx) => {
      const baseMark = 65 + ((idx * 7 + mockPos * 3) % 28);
      const a1 = Math.min(100, Math.max(40, baseMark - 4));
      const a2 = Math.min(100, Math.max(40, baseMark + 2));
      const a3 = Math.min(100, Math.max(40, baseMark - 1));
      const exam = Math.min(100, Math.max(40, baseMark + 5));
      const total = Math.round((a1 + a2 + a3 + exam) / 4);

      let grade = '1';
      let remark = 'Distinction';
      if (total >= 75) { grade = '1'; remark = 'Distinction'; }
      else if (total >= 70) { grade = '2'; remark = 'Distinction'; }
      else if (total >= 65) { grade = '3'; remark = 'Merit'; }
      else if (total >= 60) { grade = '4'; remark = 'Merit'; }
      else if (total >= 55) { grade = '5'; remark = 'Credit'; }
      else if (total >= 50) { grade = '6'; remark = 'Credit'; }
      else if (total >= 45) { grade = '7'; remark = 'Satisfactory'; }
      else if (total >= 40) { grade = '8'; remark = 'Sufficient'; }
      else { grade = '9'; remark = 'Unsatisfactory'; }

      return {
        id: idx + 1,
        name,
        assessment1: `${a1}`,
        assessment2: `${a2}`,
        assessment3: `${a3}`,
        exam: `${exam}`,
        total: `${total}`,
        grade,
        remark
      };
    });

    const sumTotal = subjects.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    const avg = Math.round(sumTotal / subjects.length);

    let overallGrade = '1';
    if (avg >= 75) overallGrade = '1 (Distinction)';
    else if (avg >= 65) overallGrade = '2 (Merit)';
    else if (avg >= 50) overallGrade = '3 (Credit)';
    else overallGrade = '4 (Pass)';

    return {
      id: studentId,
      schoolName: DEFAULT_SCHOOL,
      academicYear: selectedYear,
      studentName: studentInfo.name,
      studentNo: studentInfo.studentNo,
      gradeClass: selectedClass.toUpperCase(),
      term: selectedTerm,
      dob: studentInfo.dob,
      position: `${mockPos}`,
      totalStudents: currentRoster.length * 5 + 5,
      overallAverage: `${avg}`,
      overallGrade,
      attendancePresent: '62',
      attendanceAbsent: '3',
      daysOpen: '65',
      conduct: 'Exemplary and disciplined learner with high commitment to academic excellence.',
      classTeacherComment: `${studentInfo.name.split(' ')[0]} displays commendable diligence, sharp problem-solving aptitudes, and steady progress in all subjects.`,
      headTeacherComment: `An impressive academic performance. Encouraged to sustain focus and strive for top national distinctions.`,
      classTeacherName: 'Mrs. G. Mulenga',
      classTeacherDate: '25/08/2026',
      headTeacherName: 'Dr. C. Mwila (Ph.D)',
      headTeacherDate: '25/08/2026',
      parentName: '',
      parentDate: '',
      schoolStamp: 'APPROVED & CERTIFIED',
      nextTermBegins: '14/09/2026',
      subjects
    };
  };

  const activeReport = getStudentReport(selectedStudentId);

  // Update field handler
  const handleUpdateActiveField = (field: keyof StudentReportData, value: any) => {
    const cacheKey = `report_${selectedClass}_${selectedStudentId}_${selectedTerm}_${selectedYear}`;
    const updated = { ...activeReport, [field]: value };
    setReportsDataMap(prev => ({
      ...prev,
      [cacheKey]: updated
    }));
  };

  // Update subject row handler
  const handleUpdateSubject = (subIndex: number, field: string, value: string) => {
    const cacheKey = `report_${selectedClass}_${selectedStudentId}_${selectedTerm}_${selectedYear}`;
    const updatedSubs = [...activeReport.subjects];
    const targetSub = { ...updatedSubs[subIndex], [field]: value };

    // Auto calculate total and grade if marks changed
    if (['assessment1', 'assessment2', 'assessment3', 'exam'].includes(field)) {
      const a1 = parseFloat(field === 'assessment1' ? value : targetSub.assessment1) || 0;
      const a2 = parseFloat(field === 'assessment2' ? value : targetSub.assessment2) || 0;
      const a3 = parseFloat(field === 'assessment3' ? value : targetSub.assessment3) || 0;
      const ex = parseFloat(field === 'exam' ? value : targetSub.exam) || 0;
      const count = [a1 > 0, a2 > 0, a3 > 0, ex > 0].filter(Boolean).length || 1;
      const total = Math.round((a1 + a2 + a3 + ex) / count);
      targetSub.total = `${total}`;

      if (total >= 75) { targetSub.grade = '1'; targetSub.remark = 'Distinction'; }
      else if (total >= 70) { targetSub.grade = '2'; targetSub.remark = 'Distinction'; }
      else if (total >= 65) { targetSub.grade = '3'; targetSub.remark = 'Merit'; }
      else if (total >= 60) { targetSub.grade = '4'; targetSub.remark = 'Merit'; }
      else if (total >= 55) { targetSub.grade = '5'; targetSub.remark = 'Credit'; }
      else if (total >= 50) { targetSub.grade = '6'; targetSub.remark = 'Credit'; }
      else if (total >= 45) { targetSub.grade = '7'; targetSub.remark = 'Satisfactory'; }
      else if (total >= 40) { targetSub.grade = '8'; targetSub.remark = 'Sufficient'; }
      else { targetSub.grade = '9'; targetSub.remark = 'Unsatisfactory'; }
    }

    updatedSubs[subIndex] = targetSub;

    // Recalculate overall average
    const validTotals = updatedSubs.map(s => parseFloat(s.total) || 0).filter(n => n > 0);
    const avg = validTotals.length > 0 ? Math.round(validTotals.reduce((a, b) => a + b, 0) / validTotals.length) : 0;

    const updated = {
      ...activeReport,
      subjects: updatedSubs,
      overallAverage: `${avg}`
    };

    setReportsDataMap(prev => ({
      ...prev,
      [cacheKey]: updated
    }));
  };

  // 1. SAVE ACTION
  const handleSave = () => {
    setIsSaving(true);
    const cacheKey = `report_${selectedClass}_${selectedStudentId}_${selectedTerm}_${selectedYear}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(activeReport));
      localStorage.setItem('school_report_forms_last_updated', new Date().toISOString());
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveToast(
          selectedStudentId === 'BLANK' 
            ? 'Blank Official Template saved successfully!' 
            : `Report Form for ${activeReport.studentName || 'Student'} saved successfully!`
        );
        setTimeout(() => setSaveToast(null), 4000);
      }, 400);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setSaveToast('Saved to session state.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // 2. PRINT SINGLE ACTION
  const handlePrint = () => {
    window.print();
  };

  // 3. PRINT CLASS (BATCH PRINT ALL STUDENTS)
  const handlePrintClass = () => {
    setSelectedStudentId('BATCH');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Safe element capture without cross-origin cssRules errors, strictly rendered at high-precision A4 proportions
  const captureElementToPng = async (element: HTMLElement): Promise<string> => {
    // Preserve original styles
    const prevWidth = element.style.width;
    const prevMaxWidth = element.style.maxWidth;
    const prevMinWidth = element.style.minWidth;
    const prevHeight = element.style.height;
    const prevMinHeight = element.style.minHeight;
    const prevMaxHeight = element.style.maxHeight;
    const prevTransform = element.style.transform;
    const prevMargin = element.style.margin;
    const prevPadding = element.style.padding;
    const prevBoxSizing = element.style.boxSizing;
    const prevBoxShadow = element.style.boxShadow;
    const prevBorder = element.style.border;
    const prevBorderRadius = element.style.borderRadius;

    // Apply strict content width (185mm = ~700px) and content height (270mm = ~1020px)
    element.style.width = '700px';
    element.style.maxWidth = '700px';
    element.style.minWidth = '700px';
    element.style.height = '1020px';
    element.style.minHeight = '1020px';
    element.style.maxHeight = '1020px';
    element.style.margin = '0 auto';
    element.style.transform = 'none';
    element.style.padding = '8px 12px 8px 12px';
    element.style.boxSizing = 'border-box';
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';

    try {
      return await toPng(element, {
        quality: 1.0,
        pixelRatio: 3, // 300 DPI equivalent for ultra-crisp typography & table borders
        width: 700,
        height: 1020,
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true,
      });
    } catch (err) {
      console.warn('html-to-image encountered cross-origin stylesheet; falling back to html2canvas:', err);
      const canvas = await html2canvas(element, {
        scale: 3,
        width: 700,
        height: 1020,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 700,
        windowHeight: 1020,
        x: 0,
        y: 0,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      return canvas.toDataURL('image/png');
    } finally {
      // Revert styles safely
      element.style.width = prevWidth;
      element.style.maxWidth = prevMaxWidth;
      element.style.minWidth = prevMinWidth;
      element.style.height = prevHeight;
      element.style.minHeight = prevMinHeight;
      element.style.maxHeight = prevMaxHeight;
      element.style.transform = prevTransform;
      element.style.margin = prevMargin;
      element.style.padding = prevPadding;
      element.style.boxSizing = prevBoxSizing;
      element.style.boxShadow = prevBoxShadow;
      element.style.border = prevBorder;
      element.style.borderRadius = prevBorderRadius;
    }
  };

  // Helper to add captured sheet to jsPDF with exact layout measurements & centered alignment:
  // Orientation: Portrait
  // Paper: A4 — 210 × 297 mm
  // Margins: 10–15 mm (exact 12.5 mm X, 13.5 mm Y)
  // Content width: 185 mm (within 180–190 mm)
  // Content height: 270 mm (within 265–275 mm)
  // Position: Centered horizontally and vertically within the printable area
  const addProportionalSheetToPdf = async (pdfDoc: jsPDF, element: HTMLElement, isFirstPage: boolean = true) => {
    const imgData = await captureElementToPng(element);

    if (!isFirstPage) {
      pdfDoc.addPage('a4', 'p');
    }

    // Load image natural dimensions to ensure exact optical aspect ratio
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    const imgWidthPx = img.naturalWidth || 700;
    const imgHeightPx = img.naturalHeight || 1020;
    const imgRatio = imgWidthPx / imgHeightPx;

    // Standard A4 Paper Size (210mm x 297mm)
    const paperWidth = 210; // mm
    const paperHeight = 297; // mm
    const maxContentWidth = 185; // mm (target within 180–190 mm)
    const maxContentHeight = 270; // mm (target within 265–275 mm)

    let renderWidth = maxContentWidth;
    let renderHeight = maxContentWidth / imgRatio;

    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = maxContentHeight * imgRatio;
    }

    // Perfect centering calculations:
    const posX = (paperWidth - renderWidth) / 2; // (210 - 185) / 2 = 12.5 mm margin
    const posY = (paperHeight - renderHeight) / 2; // (297 - 270) / 2 = 13.5 mm margin

    pdfDoc.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
  };

  // 4. DOWNLOAD PDF (PRECISION & ACCURACY FOR A4-PAGE)
  const handleDownloadPdf = async () => {
    if (!reportContainerRef.current) return;
    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.setProperties({
        title: `Academic Report Form - ${selectedClass}`,
        subject: 'Official Zambian Ministry of Education Student Report Form',
        author: 'Ministry of Education - Republic of Zambia',
        creator: 'National STEM & Academic Education Portal'
      });

      if (selectedStudentId === 'BATCH') {
        const batchContainer = document.getElementById('batch-reports-container');
        const reportSheets = batchContainer ? Array.from(batchContainer.querySelectorAll<HTMLElement>('.report-page')) : [];
        
        if (reportSheets.length > 0) {
          for (let i = 0; i < reportSheets.length; i++) {
            setDownloadProgress({ current: i + 1, total: reportSheets.length });
            const sheet = reportSheets[i];
            await addProportionalSheetToPdf(pdf, sheet, i === 0);
          }
        } else {
          const targetElement = reportContainerRef.current;
          await addProportionalSheetToPdf(pdf, targetElement, true);
        }
      } else {
        const targetElement = document.getElementById('single-report-sheet') || reportContainerRef.current;
        await addProportionalSheetToPdf(pdf, targetElement, true);
      }

      const fileName = selectedStudentId === 'BLANK'
        ? `Official_Report_Form_Blank_${selectedClass.replace(/\s+/g, '_')}_A4.pdf`
        : selectedStudentId === 'BATCH'
        ? `Class_Report_Forms_${selectedClass.replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}_${selectedYear}_A4.pdf`
        : `Report_Form_${(activeReport.studentName || 'Student').replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}_${selectedYear}_A4.pdf`;

      pdf.save(fileName);
      setIsDownloading(false);
      setDownloadProgress(null);
      setSaveToast(`A4 PDF Downloaded: ${fileName}`);
      setTimeout(() => setSaveToast(null), 4000);
    } catch (error) {
      console.error('Error generating A4 PDF:', error);
      setIsDownloading(false);
      setDownloadProgress(null);
      // Fallback to browser print to PDF
      window.print();
    }
  };

  // Single Rendered Form Sheet Component
  const renderReportSheet = (report: StudentReportData, sheetId: string = 'single-report-sheet') => {
    const isBlank = report.id === 'BLANK';

    return (
      <div 
        id={sheetId}
        style={{ 
          fontFamily: "'Times New Roman', Times, 'Liberation Serif', serif",
          transform: zoomLevel !== 100 && !isFitToScreen ? `scale(${zoomLevel / 100})` : undefined,
          transformOrigin: 'top center',
          WebkitTextSizeAdjust: '100%',
        }}
        className={`bg-white text-slate-900 space-y-1 mx-auto shadow-2xl print:shadow-none print:p-0 print:border-none print:rounded-none font-times font-serif break-after-page report-page box-border transition-all duration-200 ${
          isFitToScreen 
            ? 'w-full max-w-full p-4 sm:p-5 lg:p-6 text-[5px] rounded-none shadow-none min-h-screen' 
            : 'w-full max-w-[210mm] p-3 sm:p-4 text-[4.5px] min-h-[297mm] rounded-sm'
        }`}
      >
        {/* Official Header */}
        <div className="text-center pt-1 border-b border-black pb-1.5">
          {/* Emblem / Crest (Strict 1:1 Square - Uploadable by Admins & Super Admins) */}
          <div className="flex justify-center mb-2.5">
            <div 
              onClick={() => isAdminUser && setIsLogoModalOpen(true)}
              className={`w-8 h-8 sm:w-9 sm:h-9 border border-black p-0.5 bg-white flex items-center justify-center overflow-hidden aspect-square shadow-2xs relative group/logo ${
                isAdminUser ? 'cursor-pointer hover:border-teal-600 hover:ring-1 hover:ring-teal-500' : ''
              }`}
              title={isAdminUser ? 'Click to Upload / Change Square School Logo (Admin Authorized)' : 'Official School Logo (Square)'}
            >
              {logoUrl && logoUrl.startsWith('data:') ? (
                <img 
                  src={logoUrl} 
                  alt="School Logo" 
                  className="w-full h-full object-contain aspect-square"
                />
              ) : (
                <SquarePresetIcon type={logoUrl || 'zm-coat-of-arms-sq'} className="w-full h-full text-black" />
              )}

              {/* Admin Camera Hover Badge */}
              {isAdminUser && (
                <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center text-white print:hidden">
                  <Camera className="w-3.5 h-3.5 text-teal-300" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-0.5 mt-1.5">
            <h1 className="font-bold text-[6.5px] uppercase tracking-wider text-black leading-tight">
              Republic of Zambia
            </h1>
            <h2 className="font-bold text-[7.5px] uppercase tracking-widest text-black leading-tight">
              Ministry of Education
            </h2>
            <h3 className="font-bold text-[6px] uppercase tracking-wide text-black leading-tight">
              Student Academic Report Form
            </h3>
            <p className="font-semibold text-[4.5px] text-slate-800 tracking-normal italic">
              Academic Performance & Progress Report
            </p>
          </div>
        </div>

        {/* Student Particulars 2-Column Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 pt-0.5 text-[4.5px]">
          {/* Left Column 1: School */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">School:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold uppercase overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.schoolName}
                  onChange={(e) => handleUpdateActiveField('schoolName', e.target.value)}
                  placeholder="_________________________"
                  className="w-full h-full bg-transparent focus:outline-none uppercase font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span className="truncate">{report.schoolName}</span>
              )}
            </div>
          </div>

          {/* Right Column 1: Academic Year */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Academic Year:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.academicYear}
                  onChange={(e) => handleUpdateActiveField('academicYear', e.target.value)}
                  placeholder="_______"
                  className="w-full h-full bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span>{report.academicYear}</span>
              )}
            </div>
          </div>

          {/* Left Column 2: Student Name */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Student Name:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold uppercase overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.studentName}
                  onChange={(e) => handleUpdateActiveField('studentName', e.target.value)}
                  placeholder="_________________________"
                  className="w-full h-full bg-transparent focus:outline-none uppercase font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span className="truncate">{report.studentName}</span>
              )}
            </div>
          </div>

          {/* Right Column 2: Student No. */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Student No.:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold font-serif overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.studentNo}
                  onChange={(e) => handleUpdateActiveField('studentNo', e.target.value)}
                  placeholder="_______"
                  className="w-full h-full bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span>{report.studentNo}</span>
              )}
            </div>
          </div>

          {/* Left Column 3: Grade/Class */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Grade/Class:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold uppercase overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.gradeClass}
                  onChange={(e) => handleUpdateActiveField('gradeClass', e.target.value)}
                  placeholder="_______"
                  className="w-full h-full bg-transparent focus:outline-none uppercase font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span className="truncate">{report.gradeClass}</span>
              )}
            </div>
          </div>

          {/* Right Column 3: Term */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Term:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold uppercase overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.term}
                  onChange={(e) => handleUpdateActiveField('term', e.target.value)}
                  placeholder="_______"
                  className="w-full h-full bg-transparent focus:outline-none uppercase font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span>{report.term}</span>
              )}
            </div>
          </div>

          {/* Left Column 4: Date of Birth */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Date of Birth:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold font-serif overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.dob}
                  onChange={(e) => handleUpdateActiveField('dob', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full h-full bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-none"
                />
              ) : (
                <span>{report.dob}</span>
              )}
            </div>
          </div>

          {/* Right Column 4: Position */}
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-bold uppercase text-black">Position:</span>
            <div className="flex-1 border-b border-black h-[12px] flex items-center px-0.5 font-bold font-serif overflow-hidden">
              {isEditMode ? (
                <div className="flex items-center gap-0.5">
                  <input
                    type="text"
                    value={report.position}
                    onChange={(e) => handleUpdateActiveField('position', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-none"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={report.totalStudents}
                    onChange={(e) => handleUpdateActiveField('totalStudents', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-none"
                  />
                </div>
              ) : (
                <span>{report.position ? `${report.position} / ${report.totalStudents}` : '_____ / _____'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Performance Table */}
        <div className="pt-0.5">
          <div className="flex justify-between items-center mb-0.5">
            <h4 className="font-bold text-[5px] uppercase text-black tracking-wider">
              Academic Performance
            </h4>
            <span className="text-[4px] text-slate-600 font-sans italic print:hidden">
              Official 12-Subject Grading Schedule
            </span>
          </div>
          <table className="w-full border-collapse border border-black text-[4.5px] text-left table-fixed">
            <thead>
              <tr className="bg-slate-100 font-bold h-[12px]">
                <th className="border border-black p-0.5 w-[5%] text-center font-bold align-middle">No.</th>
                <th className="border border-black px-1 py-0.5 w-[27%] font-bold align-middle">Subject</th>
                <th className="border border-black p-0.5 text-center w-[9%] font-bold align-middle">Assess. 1</th>
                <th className="border border-black p-0.5 text-center w-[9%] font-bold align-middle">Assess. 2</th>
                <th className="border border-black p-0.5 text-center w-[9%] font-bold align-middle">Assess. 3</th>
                <th className="border border-black p-0.5 text-center w-[9%] font-bold align-middle">Exam</th>
                <th className="border border-black p-0.5 text-center w-[9%] font-bold align-middle">Total</th>
                <th className="border border-black p-0.5 text-center w-[8%] font-bold align-middle">Grade</th>
                <th className="border border-black px-1 py-0.5 w-[15%] font-bold align-middle">Remark</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, idx) => {
                const sub = report.subjects[idx] || {
                  id: idx + 1,
                  name: '',
                  assessment1: '',
                  assessment2: '',
                  assessment3: '',
                  exam: '',
                  total: '',
                  grade: '',
                  remark: ''
                };

                return (
                  <tr key={idx} className="h-[10px] hover:bg-slate-50/50">
                    <td className="border border-black p-0.5 text-center font-bold align-middle">{idx + 1}</td>
                    <td className="border border-black px-1 py-0.5 font-medium align-middle overflow-hidden">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleUpdateSubject(idx, 'name', e.target.value)}
                          placeholder=""
                          className="w-full h-full bg-transparent focus:outline-none text-[4.5px] p-0 m-0 leading-tight font-medium"
                        />
                      ) : (
                        <span className="truncate block font-medium">{sub.name}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center align-middle">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.assessment1}
                          onChange={(e) => handleUpdateSubject(idx, 'assessment1', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-serif text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.assessment1}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center align-middle">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.assessment2}
                          onChange={(e) => handleUpdateSubject(idx, 'assessment2', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-serif text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.assessment2}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center align-middle">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.assessment3}
                          onChange={(e) => handleUpdateSubject(idx, 'assessment3', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-serif text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.assessment3}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center align-middle">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.exam}
                          onChange={(e) => handleUpdateSubject(idx, 'exam', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-serif text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.exam}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center font-bold align-middle bg-slate-50/40">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.total}
                          onChange={(e) => handleUpdateSubject(idx, 'total', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-serif font-bold text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.total}</span>
                      )}
                    </td>
                    <td className="border border-black p-0.5 text-center font-bold align-middle">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.grade}
                          onChange={(e) => handleUpdateSubject(idx, 'grade', e.target.value)}
                          className="w-full h-full text-center bg-transparent focus:outline-none font-bold text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span>{sub.grade}</span>
                      )}
                    </td>
                    <td className="border border-black px-1 py-0.5 align-middle overflow-hidden">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={sub.remark}
                          onChange={(e) => handleUpdateSubject(idx, 'remark', e.target.value)}
                          className="w-full h-full bg-transparent focus:outline-none text-[4.5px] p-0 m-0 leading-tight"
                        />
                      ) : (
                        <span className="truncate block text-[4.5px]">{sub.remark}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Metrics Grid 1: Overall Average, Grade, Position */}
        <div className="grid grid-cols-3 gap-0 border border-black mt-0.5 text-[4.5px]">
          <div className="flex border-r border-black items-center">
            <span className="w-18 px-1.5 py-0.5 font-bold bg-slate-100 border-r border-black uppercase text-[4.5px] flex items-center shrink-0">
              Overall Average:
            </span>
            <div className="flex-1 px-1 py-0.5 flex items-center gap-0.5 font-bold font-serif text-[5px] overflow-hidden">
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={report.overallAverage}
                    onChange={(e) => handleUpdateActiveField('overallAverage', e.target.value)}
                    placeholder="______"
                    className="w-6 text-center bg-transparent focus:outline-none font-bold p-0 m-0 text-[5px]"
                  />
                  <span>%</span>
                </>
              ) : (
                <span className="truncate">{report.overallAverage ? `${report.overallAverage}%` : '______ %'}</span>
              )}
            </div>
          </div>

          <div className="flex border-r border-black items-center">
            <span className="w-16 px-1.5 py-0.5 font-bold bg-slate-100 border-r border-black uppercase text-[4.5px] flex items-center shrink-0">
              Overall Grade:
            </span>
            <div className="flex-1 px-1 py-0.5 flex items-center font-bold text-[5px] overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.overallGrade}
                  onChange={(e) => handleUpdateActiveField('overallGrade', e.target.value)}
                  placeholder="______"
                  className="w-full bg-transparent focus:outline-none font-bold p-0 m-0 text-[5px]"
                />
              ) : (
                <span className="truncate">{report.overallGrade || '______'}</span>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <span className="w-16 px-1.5 py-0.5 font-bold bg-slate-100 border-r border-black uppercase text-[4.5px] flex items-center shrink-0">
              Class Position:
            </span>
            <div className="flex-1 px-1 py-0.5 flex items-center justify-center gap-0.5 font-serif font-bold text-[5px] overflow-hidden">
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={report.position}
                    onChange={(e) => handleUpdateActiveField('position', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none p-0 m-0 text-[5px]"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={report.totalStudents}
                    onChange={(e) => handleUpdateActiveField('totalStudents', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none p-0 m-0 text-[5px]"
                  />
                </>
              ) : (
                <span className="truncate">{report.position ? `${report.position} / ${report.totalStudents}` : '____ / ____'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid 2: Attendance & Conduct */}
        <div className="grid grid-cols-12 gap-0 border border-black border-t-0 text-[4.5px]">
          {/* Attendance Present, Absent, Days Open in a clear 7-col span */}
          <div className="col-span-7 flex border-r border-black items-center">
            <span className="px-1.5 py-0.5 font-bold bg-slate-100 border-r border-black uppercase text-[4.5px] shrink-0">
              Attendance:
            </span>
            <div className="flex-1 px-1 py-0.5 flex items-center justify-around gap-1 text-[4.5px]">
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="font-semibold text-slate-700">Present:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={report.attendancePresent}
                    onChange={(e) => handleUpdateActiveField('attendancePresent', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none font-serif font-bold p-0 m-0 text-[4.5px]"
                  />
                ) : (
                  <span className="font-bold">{report.attendancePresent || '____'}</span>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <span className="font-semibold text-slate-700">Absent:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={report.attendanceAbsent}
                    onChange={(e) => handleUpdateActiveField('attendanceAbsent', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none font-serif font-bold p-0 m-0 text-[4.5px]"
                  />
                ) : (
                  <span className="font-bold">{report.attendanceAbsent || '____'}</span>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <span className="font-semibold text-slate-700">Days Open:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={report.daysOpen}
                    onChange={(e) => handleUpdateActiveField('daysOpen', e.target.value)}
                    placeholder="____"
                    className="w-5 text-center bg-transparent focus:outline-none font-serif font-bold p-0 m-0 text-[4.5px]"
                  />
                ) : (
                  <span className="font-bold">{report.daysOpen || '____'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Conduct */}
          <div className="col-span-5 flex items-center">
            <span className="px-1.5 py-0.5 font-bold bg-slate-100 border-r border-black uppercase text-[4.5px] shrink-0">
              Conduct:
            </span>
            <div className="flex-1 px-1.5 py-0.5 flex items-center font-medium overflow-hidden">
              {isEditMode ? (
                <input
                  type="text"
                  value={report.conduct}
                  onChange={(e) => handleUpdateActiveField('conduct', e.target.value)}
                  placeholder="________________"
                  className="w-full bg-transparent focus:outline-none text-[4.5px] p-0 m-0"
                />
              ) : (
                <span className="text-[4.5px] truncate block">{report.conduct || '________________'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress & Remarks */}
        <div className="pt-0.5">
          <h4 className="font-bold text-[5px] uppercase mb-0.5 text-black tracking-wider">
            Progress & Remarks
          </h4>
          <table className="w-full border-collapse border border-black text-[4.5px] text-left table-fixed">
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold w-24 align-top bg-slate-50">
                  Class Teacher's Comment:
                </td>
                <td className="border border-black p-1 align-top font-medium">
                  {isEditMode ? (
                    <textarea
                      rows={2}
                      value={report.classTeacherComment}
                      onChange={(e) => handleUpdateActiveField('classTeacherComment', e.target.value)}
                      placeholder="Enter class teacher observations and progress remarks..."
                      className="w-full h-full bg-transparent focus:outline-none resize-none text-[4.5px] leading-snug p-0 m-0 italic"
                    />
                  ) : (
                    <span className="leading-snug block italic">{report.classTeacherComment}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold w-24 align-top bg-slate-50">
                  Head Teacher's Comment:
                </td>
                <td className="border border-black p-1 align-top font-medium">
                  {isEditMode ? (
                    <textarea
                      rows={2}
                      value={report.headTeacherComment}
                      onChange={(e) => handleUpdateActiveField('headTeacherComment', e.target.value)}
                      placeholder="Enter official head teacher endorsement..."
                      className="w-full h-full bg-transparent focus:outline-none resize-none text-[4.5px] leading-snug p-0 m-0 italic"
                    />
                  ) : (
                    <span className="leading-snug block italic">{report.headTeacherComment}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures & Official Endorsement (Slightly dropped down with balanced spacing) */}
        <div className="mt-3.5 pt-1 border-t border-slate-300/70">
          <table className="w-full border-collapse border border-black text-[4.5px] text-left table-fixed">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-0.5 font-bold text-center w-1/3">Class Teacher</th>
                <th className="border border-black p-0.5 font-bold text-center w-1/3">Head Teacher</th>
                <th className="border border-black p-0.5 font-bold text-center w-1/3">Parent/Guardian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Name:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.classTeacherName}
                        onChange={(e) => handleUpdateActiveField('classTeacherName', e.target.value)}
                        placeholder="__________________"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black text-[4.5px] p-0 m-0 font-semibold"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-semibold truncate block">{report.classTeacherName}</span>
                    )}
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Name:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.headTeacherName}
                        onChange={(e) => handleUpdateActiveField('headTeacherName', e.target.value)}
                        placeholder="__________________"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black text-[4.5px] p-0 m-0 font-semibold"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-semibold truncate block">{report.headTeacherName}</span>
                    )}
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Name:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.parentName}
                        onChange={(e) => handleUpdateActiveField('parentName', e.target.value)}
                        placeholder="__________________"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black text-[4.5px] p-0 m-0 font-semibold"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-semibold truncate block">{report.parentName}</span>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-9 shrink-0 font-bold">Signature:</span>
                    <span className="flex-1 border-b border-dotted border-black h-[14px] min-h-[14px]"></span>
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-9 shrink-0 font-bold">Signature:</span>
                    <span className="flex-1 border-b border-dotted border-black h-[14px] min-h-[14px]"></span>
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-9 shrink-0 font-bold">Signature:</span>
                    <span className="flex-1 border-b border-dotted border-black h-[14px] min-h-[14px]"></span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Date:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.classTeacherDate}
                        onChange={(e) => handleUpdateActiveField('classTeacherDate', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black font-serif text-[4.5px] p-0 m-0"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-serif">{report.classTeacherDate}</span>
                    )}
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Date:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.headTeacherDate}
                        onChange={(e) => handleUpdateActiveField('headTeacherDate', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black font-serif text-[4.5px] p-0 m-0"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-serif">{report.headTeacherDate}</span>
                    )}
                  </div>
                </td>
                <td className="border border-black p-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-8 shrink-0 font-bold">Date:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={report.parentDate}
                        onChange={(e) => handleUpdateActiveField('parentDate', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="flex-1 bg-transparent focus:outline-none border-b border-dotted border-black font-serif text-[4.5px] p-0 m-0"
                      />
                    ) : (
                      <span className="flex-1 border-b border-dotted border-black px-0.5 font-serif">{report.parentDate}</span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Particulars */}
          <div className="grid grid-cols-2 gap-4 items-center mt-2.5 text-[4.5px] font-bold">
            <div className="flex items-center gap-1">
              <span className="w-16 shrink-0 text-black uppercase">School Stamp:</span>
              <span className="flex-1 border-b border-dotted border-black h-[15px] min-h-[15px] px-1 font-serif text-slate-800 flex items-center justify-center bg-slate-50/50 uppercase tracking-wide text-[4.5px]">
                {report.schoolStamp}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-20 shrink-0 text-black uppercase">Next Term Begins:</span>
              <div className="flex-1 border-b border-dotted border-black h-[15px] min-h-[15px] px-1 flex items-center justify-center font-bold">
                {isEditMode ? (
                  <input
                    type="text"
                    value={report.nextTermBegins}
                    onChange={(e) => handleUpdateActiveField('nextTermBegins', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-transparent focus:outline-none text-center font-bold text-[4.5px] p-0 m-0 leading-none"
                  />
                ) : (
                  <span className="font-bold">{report.nextTermBegins}</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col font-sans text-slate-900 bg-slate-100 dark:bg-slate-950">
      
      {/* ========================================================= */}
      {/* 1. INDEPENDENT TOOLBAR FOR A4 REPORT FORM & EXPORT TOOLS */}
      {/* ========================================================= */}
      <div className="print:hidden bg-slate-900 border-b border-teal-500/30 shadow-md w-full sticky top-0 z-30">
        
        {/* Top Header Banner: Context & Specifications */}
        <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-400/40 shadow-inner">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-black text-white uppercase tracking-tight">
                  Student Academic Report Forms
                </h1>
                <span className="px-1.5 py-0.5 bg-teal-500/20 border border-teal-400/40 text-[9px] font-bold text-teal-300 rounded uppercase tracking-wider">
                  A4 (210 × 297 mm) • Content 185 × 270 mm • Centered
                </span>
              </div>
              <p className="text-[10px] text-teal-200/70 font-medium">
                Active: <span className="font-bold text-white">{selectedClass}</span> • <span className="font-bold text-white">{selectedStudentId === 'BLANK' ? 'Blank Official Template' : selectedStudentId === 'BATCH' ? `Whole Class (${currentRoster.length} Students)` : activeReport.studentName || 'Student'}</span> • {selectedTerm}, {selectedYear}
              </p>
            </div>
          </div>

          {/* Subview Nav Switcher (Results, Performance, Analysis, Report Forms) */}
          {onNavigateToSubView && (
            <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80 shadow-xs">
              <button
                onClick={() => onNavigateToSubView('results')}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Results Hub
              </button>
              <button
                onClick={() => onNavigateToSubView('performance')}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Performance
              </button>
              <button
                onClick={() => onNavigateToSubView('analysis')}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Analysis
              </button>
            </div>
          )}
        </div>

        {/* Operating Control Ribbon: Scope Selection & Export Suite */}
        <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-slate-900/95">
          
          {/* Left Ribbon: Data Filters & Target Selection */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* SELECT CLASS */}
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-teal-500/30 h-8">
              <span className="text-[9px] uppercase font-bold text-teal-400/90">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer hover:text-teal-200"
              >
                {AVAILABLE_CLASSES.map(cls => (
                  <option key={cls} value={cls} className="bg-slate-900 text-white">{cls}</option>
                ))}
              </select>
            </div>

            {/* SELECT STUDENT / BATCH MODE */}
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-teal-500/30 h-8">
              <span className="text-[9px] uppercase font-bold text-teal-400/90">Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none cursor-pointer max-w-[160px] truncate hover:text-teal-200"
              >
                <optgroup label="Single Student Forms" className="bg-slate-900 text-white">
                  {currentRoster.map(student => (
                    <option key={student.id} value={student.id} className="bg-slate-900 text-white">
                      {student.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Special Modes" className="bg-slate-900 text-white">
                  <option value="BATCH" className="bg-slate-900 text-teal-300 font-bold">
                    👥 Whole Class ({currentRoster.length} Students)
                  </option>
                  <option value="BLANK" className="bg-slate-900 text-amber-300 font-bold">
                    📄 Official Blank Template (Empty)
                  </option>
                </optgroup>
              </select>
            </div>

            {/* TERM SELECTOR */}
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-none cursor-pointer h-8 hover:text-teal-200"
            >
              <option value="1ST TERM" className="bg-slate-900">1st Term</option>
              <option value="2ND TERM" className="bg-slate-900">2nd Term</option>
              <option value="3RD TERM" className="bg-slate-900">3rd Term</option>
            </select>

            {/* YEAR SELECTOR */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-teal-500/30 rounded-lg text-[11px] font-bold text-white focus:outline-none cursor-pointer h-8 hover:text-teal-200"
            >
              <option value="2026" className="bg-slate-900">2026</option>
              <option value="2025" className="bg-slate-900">2025</option>
            </select>
          </div>

          {/* Right Ribbon: High-Precision Export Tools & Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* 1. PRIMARY: DOWNLOAD A4 PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 h-8 border border-teal-400/40"
              title="Download High-Precision A4 PDF (210 × 297 mm)"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              <span>
                {isDownloading 
                  ? (downloadProgress ? `Generating ${downloadProgress.current}/${downloadProgress.total}...` : 'Generating A4 PDF...') 
                  : 'Download A4 PDF'}
              </span>
            </button>

            {/* 2. PRINT SINGLE A4 */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 border border-slate-700 hover:border-teal-400 h-8"
              title="Print Current Form on Standard A4 Paper"
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
              <span>Print A4</span>
            </button>

            {/* 3. PRINT CLASS (BATCH PRINT) */}
            <button
              onClick={handlePrintClass}
              className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 border border-indigo-500/50 h-8"
              title="Batch Print All Students in Class (One A4 Page Per Student)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-200" />
              <span>Print Class</span>
            </button>

            {/* 4. SAVE FORM DATA */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50 border border-emerald-500/50 h-8"
              title="Save Comments, Marks & Changes"
            >
              <Save className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Visual Divider */}
            <div className="h-5 w-px bg-slate-700 mx-0.5" />

            {/* 5. TOGGLE INLINE EDIT / READONLY */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 h-8 border ${
                isEditMode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isEditMode ? 'Inline Edit Mode Active (Click to Switch to Print-Ready Display)' : 'Print-Ready Mode (Click to Enable Editing)'}
            >
              {isEditMode ? <Edit3 className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5 text-slate-300" />}
              <span className="hidden md:inline">{isEditMode ? 'Editing' : 'Display'}</span>
            </button>

            {/* 6. A4 STANDARD / FIT VIEW TOGGLE */}
            <button
              onClick={() => setIsFitToScreen(!isFitToScreen)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 h-8 border ${
                isFitToScreen 
                  ? 'bg-teal-500/30 text-teal-200 border-teal-400/50 shadow-inner' 
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isFitToScreen ? 'Standard A4 Sheet Size (210 × 297 mm)' : 'Fit to Full Screen Width'}
            >
              {isFitToScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-teal-300" />
                  <span className="hidden lg:inline">A4 Standard</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
                  <span className="hidden lg:inline">Fit Screen</span>
                </>
              )}
            </button>

            {/* 7. SQUARE LOGO UPLOADER TRIGGER (ADMINS) */}
            {isAdminUser && (
              <button
                onClick={() => setIsLogoModalOpen(true)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-teal-500/40 shadow-xs active:scale-95 h-8"
                title="Format & Change Official School Logo (Strict 1:1 Square)"
              >
                <Square className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden xl:inline">Square Logo</span>
              </button>
            )}

            {/* 8. ZOOM CONTROLS */}
            {!isFitToScreen && (
              <div className="flex items-center gap-0.5 bg-slate-950 px-1 py-0.5 rounded-lg border border-slate-700 h-8">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                  className="p-1 text-slate-300 hover:text-white rounded cursor-pointer hover:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="text-[9px] font-mono text-teal-300 min-w-[32px] text-center font-bold px-1 py-0.5 hover:bg-slate-800 rounded cursor-pointer"
                  title="Reset Zoom to 100%"
                >
                  {zoomLevel}%
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="p-1 text-slate-300 hover:text-white rounded cursor-pointer hover:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Save / Feedback Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl border border-teal-400/50 shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce print:hidden">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REPORT FORM DOCUMENT CANVAS (A4 PRINTABLE VIEWPORT) */}
      {/* ========================================================= */}
      <div 
        ref={reportContainerRef}
        className={`flex-1 w-full overflow-y-auto flex flex-col items-center print:bg-white print:p-0 print:overflow-visible ${
          isFitToScreen 
            ? 'p-0 bg-white dark:bg-slate-900' 
            : 'p-2 sm:p-4 md:p-6 bg-slate-200/70 dark:bg-slate-900'
        }`}
      >
        {selectedStudentId === 'BATCH' ? (
          /* Whole Class Batch Print View */
          <div id="batch-reports-container" className="w-full space-y-6 print:space-y-0">
            <div className="text-center py-2 bg-indigo-900 text-white rounded-lg max-w-[210mm] mx-auto text-xs font-bold mb-3 print:hidden">
              📄 Batch Print Preview: Showing all {currentRoster.length} students for {selectedClass} (One Page Per Student)
            </div>
            {currentRoster.map((student) => {
              const studentReport = getStudentReport(student.id);
              return (
                <div key={student.id} className="w-full">
                  {renderReportSheet(studentReport, `report-sheet-${student.id}`)}
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Student / Blank Form Sheet */
          <div className={`w-full flex justify-center ${isFitToScreen ? 'h-full' : ''}`}>
            {renderReportSheet(activeReport, 'single-report-sheet')}
          </div>
        )}
      </div>

      {/* Admin Square Logo Manager Modal */}
      <SquareLogoManagerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogoUrl={logoUrl}
        onLogoApplied={(appliedUrl, appliedName) => {
          setLogoUrl(appliedUrl);
          setSaveToast(`Square Logo applied: ${appliedName || 'Custom School Logo'}`);
          setTimeout(() => setSaveToast(null), 3000);
        }}
      />

    </div>
  );
}
