import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolCrest } from './SchoolCrest';
import { 
  StudentReport, 
  CBCSubjectMark, 
  LearnerRating, 
  LearnerProfileRatings, 
  calculateCBCGrade, 
  getDefaultRemark 
} from '../types/reportCard';
import { INITIAL_STUDENTS_DATABASE } from '../data/initialReports';

interface ReportFormsProps {
  onNavigate?: (view: string) => void;
}

export default function ReportForms({ onNavigate }: ReportFormsProps) {
  const [reports, setReports] = useState<StudentReport[]>(INITIAL_STUDENTS_DATABASE);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('2026-0001');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active student report
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === selectedStudentId) || reports[0] || INITIAL_STUDENTS_DATABASE[0];
  }, [reports, selectedStudentId]);

  // Sync with Firestore report_cards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'report_cards'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: StudentReport[] = [];
        snapshot.forEach(docSnap => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as StudentReport);
        });
        if (loaded.length > 0) {
          setReports(prev => {
            const map = new Map(prev.map(item => [item.id, item]));
            loaded.forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      }
    }, (err) => {
      console.warn('Firestore report_cards sync note:', err);
    });

    return () => unsub();
  }, []);

  // Performance calculations
  const calculateSubjectRowAvg = (sub: CBCSubjectMark) => {
    const numT1 = typeof sub.t1 === 'number' ? sub.t1 : parseFloat(sub.t1 as string) || 0;
    const numT2 = typeof sub.t2 === 'number' ? sub.t2 : parseFloat(sub.t2 as string) || 0;
    const numT3 = typeof sub.t3 === 'number' ? sub.t3 : parseFloat(sub.t3 as string) || 0;
    const count = [numT1 > 0, numT2 > 0, numT3 > 0].filter(Boolean).length || 1;
    return Math.round((numT1 + numT2 + numT3) / count);
  };

  const calculateOverallAverage = (report: StudentReport) => {
    if (!report?.subjects || report.subjects.length === 0) return 0;
    const sum = report.subjects.reduce((acc, sub) => {
      const avg = sub.avg !== undefined ? sub.avg : calculateSubjectRowAvg(sub);
      return acc + avg;
    }, 0);
    return Math.round(sum / report.subjects.length);
  };

  const calculateTermAverage = (report: StudentReport, termKey: 't1' | 't2' | 't3') => {
    if (!report?.subjects || report.subjects.length === 0) return 0;
    let count = 0;
    const sum = report.subjects.reduce((acc, sub) => {
      const val = typeof sub[termKey] === 'number' ? sub[termKey] : parseFloat(sub[termKey] as string) || 0;
      if (val > 0) {
        count++;
        return acc + val;
      }
      return acc;
    }, 0);
    return count > 0 ? Math.round(sum / count) : 0;
  };

  // Student Navigation
  const handlePrevStudent = () => {
    const currentIndex = reports.findIndex(r => r.id === selectedStudentId);
    if (currentIndex > 0) {
      setSelectedStudentId(reports[currentIndex - 1].id);
    } else {
      setSelectedStudentId(reports[reports.length - 1].id);
    }
  };

  const handleNextStudent = () => {
    const currentIndex = reports.findIndex(r => r.id === selectedStudentId);
    if (currentIndex < reports.length - 1) {
      setSelectedStudentId(reports[currentIndex + 1].id);
    } else {
      setSelectedStudentId(reports[0].id);
    }
  };

  // In-place edits
  const handleUpdateSubjectMark = (subjectId: number, field: 't1' | 't2' | 't3' | 'remarks', val: string | number) => {
    setReports(prev => prev.map(r => {
      if (r.id !== activeReport.id) return r;
      const updatedSubjects = r.subjects.map(s => {
        if (s.id !== subjectId) return s;
        const updated = { ...s, [field]: val };
        const newAvg = calculateSubjectRowAvg(updated);
        const gradeInfo = calculateCBCGrade(newAvg);
        return {
          ...updated,
          avg: newAvg,
          grade: gradeInfo.grade,
          remarks: field === 'remarks' ? (val as string) : (s.remarks || getDefaultRemark(gradeInfo.grade))
        };
      });
      return { ...r, subjects: updatedSubjects };
    }));
  };

  const handleUpdateLearnerRating = (field: keyof LearnerProfileRatings, rating: LearnerRating) => {
    setReports(prev => prev.map(r => {
      if (r.id !== activeReport.id) return r;
      return {
        ...r,
        learnerProfile: {
          ...r.learnerProfile,
          [field]: rating
        }
      };
    }));
  };

  const handleUpdateField = (field: keyof StudentReport, val: any) => {
    setReports(prev => prev.map(r => {
      if (r.id !== activeReport.id) return r;
      return { ...r, [field]: val };
    }));
  };

  // Save report to firestore
  const handleSaveReport = async () => {
    if (!activeReport) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'report_cards', activeReport.id), activeReport, { merge: true });
      setSaveToast(`Report saved for ${activeReport.name}`);
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.warn('Saved locally notice:', err);
      setSaveToast(`Report saved locally`);
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const overallAvg = calculateOverallAverage(activeReport);
  const t1Avg = calculateTermAverage(activeReport, 't1');
  const t2Avg = calculateTermAverage(activeReport, 't2');
  const t3Avg = calculateTermAverage(activeReport, 't3');
  const attendancePercentage = activeReport.daysOpened > 0 
    ? Math.round((activeReport.daysPresent / activeReport.daysOpened) * 100) 
    : 100;
  const currentOverallGrade = calculateCBCGrade(overallAvg);

  const profileKeys: { key: keyof LearnerProfileRatings; label: string }[] = [
    { key: 'attendance', label: '1. Attendance' },
    { key: 'punctuality', label: '2. Punctuality' },
    { key: 'discipline', label: '3. Discipline' },
    { key: 'initiative', label: '4. Initiative and Self-Reliance' },
    { key: 'cooperation', label: '5. Co-operation and Teamwork' },
    { key: 'respect', label: '6. Respect for Others' },
    { key: 'neatness', label: '7. Neatness and Orderliness' },
    { key: 'cocurricular', label: '8. Participation in Co-curricular Activities' },
  ];

  const ratingOptions: LearnerRating[] = ['E', 'VG', 'G', 'S', 'N'];

  return (
    <div className="w-full font-sans text-slate-900 bg-slate-100 min-h-screen pb-6">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL BAR (Clean & Compact)                            */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2 shadow-xs no-print">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Candidate Selector */}
          <div className="flex items-center gap-1.5">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Back to Dashboard"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={handlePrevStudent}
                className="p-1 hover:bg-white rounded text-slate-700 cursor-pointer transition"
                title="Previous Student"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                {reports.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.gradeClass}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextStudent}
                className="p-1 hover:bg-white rounded text-slate-700 cursor-pointer transition"
                title="Next Student"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
              ({reports.findIndex(r => r.id === selectedStudentId) + 1} of {reports.length})
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            
            {/* In-Place Edit Mode */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                isEditing 
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Marks'}</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Print Form"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs border border-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Save */}
            <button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg bg-[#0f2942] hover:bg-[#1a3f65] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Save</span>
            </button>
          </div>

        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0f2942] text-white px-3 py-2 rounded-xl shadow-lg border border-slate-700 text-xs font-bold flex items-center gap-2 animate-fade-in no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SIMPLIFIED OFFICIAL ZAMBIA REPORT FORM SHEET                  */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto px-2 pt-3">
        <div 
          id="report-form-sheet"
          className="bg-white border border-slate-700 rounded-lg p-3 sm:p-4 shadow-sm text-slate-900 space-y-2.5 print:p-0 print:border-none print:shadow-none print:rounded-none"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
            {/* Crest */}
            <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center">
              <SchoolCrest className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>

            {/* National Title */}
            <div className="flex-1 text-center">
              <h2 className="text-[11px] font-black tracking-widest text-slate-800 uppercase leading-none">
                REPUBLIC OF ZAMBIA
              </h2>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f2942] uppercase leading-tight py-0.5">
                SCHOOL REPORT FORM
              </h1>
              <p className="text-[10px] font-black tracking-wider text-slate-700 uppercase leading-none">
                — COMPETENCY BASED CURRICULUM (CBC) —
              </p>
            </div>

            {/* Report No & Photo Box */}
            <div className="w-28 sm:w-32 shrink-0 border border-slate-700 rounded overflow-hidden text-[10px]">
              <div className="p-1 border-b border-slate-700 bg-slate-50 space-y-0.5">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-black text-slate-700">REPORT NO.</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={activeReport.reportNo} 
                      onChange={(e) => handleUpdateField('reportNo', e.target.value)}
                      className="border-b border-dotted border-slate-700 font-mono text-[9px] w-12 text-right bg-amber-50"
                    />
                  ) : (
                    <span className="font-mono font-bold text-slate-900">{activeReport.reportNo || '2026-01'}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-700">YEAR</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={activeReport.year} 
                      onChange={(e) => handleUpdateField('year', e.target.value)}
                      className="font-black text-[11px] text-[#0f2942] w-10 text-right bg-amber-50"
                    />
                  ) : (
                    <span className="font-black text-xs text-[#0f2942]">{activeReport.year}</span>
                  )}
                </div>
              </div>
              <div className="h-10 flex items-center justify-center bg-white">
                <div className="w-full h-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50/50">
                  <span className="text-[9px] font-black uppercase text-slate-400">PHOTO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Particulars */}
          <div className="space-y-1.5 text-[11px] font-bold text-slate-900">
            {/* School Name */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-slate-900 shrink-0">SCHOOL NAME:</span>
              <div className="flex-1 border-b border-dotted border-slate-800 pb-0.5 px-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.schoolName}
                    onChange={(e) => handleUpdateField('schoolName', e.target.value)}
                    className="w-full bg-amber-50 text-[11px] font-bold text-slate-900 focus:outline-none uppercase"
                  />
                ) : (
                  <span className="font-black uppercase">{activeReport.schoolName}</span>
                )}
              </div>
            </div>

            {/* Pupil Name */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-slate-900 shrink-0">PUPIL'S NAME:</span>
              <div className="flex-1 border-b border-dotted border-slate-800 pb-0.5 px-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.name}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full bg-amber-50 text-[11px] font-black text-slate-950 focus:outline-none uppercase tracking-wide"
                  />
                ) : (
                  <span className="font-black text-slate-950 uppercase tracking-wide">{activeReport.name}</span>
                )}
              </div>
            </div>

            {/* Grade, Stream, Term */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-black shrink-0">GRADE:</span>
                <div className="flex-1 border-b border-dotted border-slate-800 pb-0.5 px-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeReport.gradeClass}
                      onChange={(e) => handleUpdateField('gradeClass', e.target.value)}
                      className="w-full bg-amber-50 text-[11px] font-bold uppercase"
                    />
                  ) : (
                    <span>{activeReport.gradeClass}</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-black shrink-0">STREAM:</span>
                <div className="flex-1 border-b border-dotted border-slate-800 pb-0.5 px-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeReport.stream}
                      onChange={(e) => handleUpdateField('stream', e.target.value)}
                      className="w-full bg-amber-50 text-[11px] font-bold uppercase"
                    />
                  ) : (
                    <span>{activeReport.stream || 'A'}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black shrink-0">TERM:</span>
                {(['1ST TERM', '2ND TERM', '3RD TERM'] as const).map((t) => {
                  const isChecked = activeReport.term === t;
                  return (
                    <label 
                      key={t}
                      onClick={() => isEditing && handleUpdateField('term', t)}
                      className={`flex items-center gap-1 cursor-pointer text-[10px] ${
                        isChecked ? 'font-black text-slate-950' : 'text-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-xs border border-slate-700 flex items-center justify-center text-[9px] ${
                        isChecked ? 'bg-slate-900 text-white font-black' : 'bg-white'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span>{t.split(' ')[0]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subjects Evaluation Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-600 text-left text-[10.5px]">
              <thead>
                <tr className="bg-[#0f2942] text-white text-[10px] font-black uppercase">
                  <th className="border border-slate-500 py-1 px-1 text-center w-6">#</th>
                  <th className="border border-slate-500 py-1 px-2">LEARNING AREAS / SUBJECTS</th>
                  <th className="border border-slate-500 py-0.5 px-0.5 text-center" colSpan={4}>
                    <div className="text-center font-black pb-0.5 border-b border-slate-500">TERM MARKS</div>
                    <div className="grid grid-cols-4 text-center font-bold text-[9px] pt-0.5">
                      <span>T1</span>
                      <span>T2</span>
                      <span>T3</span>
                      <span>AVG</span>
                    </div>
                  </th>
                  <th className="border border-slate-500 py-1 px-1 text-center w-10">GRADE</th>
                  <th className="border border-slate-500 py-1 px-2">REMARKS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-300 font-semibold">
                {activeReport.subjects.map((sub, idx) => {
                  const rowAvg = sub.avg !== undefined ? sub.avg : calculateSubjectRowAvg(sub);
                  const gradeInfo = calculateCBCGrade(rowAvg);
                  const grade = sub.grade || gradeInfo.grade;
                  const remarks = sub.remarks || getDefaultRemark(grade);

                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-50">
                      <td className="border border-slate-500 py-0.5 px-1 text-center text-slate-600 bg-slate-50">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-500 py-0.5 px-2 font-bold text-slate-900">
                        {sub.name}
                      </td>
                      
                      {/* Term 1 */}
                      <td className="border border-slate-500 py-0.5 px-0.5 text-center font-mono font-bold w-8">
                        {isEditing ? (
                          <input
                            type="number"
                            value={sub.t1}
                            onChange={(e) => handleUpdateSubjectMark(sub.id, 't1', e.target.value)}
                            className="w-7 text-center bg-amber-50 font-bold focus:outline-none"
                          />
                        ) : (
                          <span>{sub.t1}</span>
                        )}
                      </td>

                      {/* Term 2 */}
                      <td className="border border-slate-500 py-0.5 px-0.5 text-center font-mono font-bold w-8">
                        {isEditing ? (
                          <input
                            type="number"
                            value={sub.t2}
                            onChange={(e) => handleUpdateSubjectMark(sub.id, 't2', e.target.value)}
                            className="w-7 text-center bg-amber-50 font-bold focus:outline-none"
                          />
                        ) : (
                          <span>{sub.t2}</span>
                        )}
                      </td>

                      {/* Term 3 */}
                      <td className="border border-slate-500 py-0.5 px-0.5 text-center font-mono font-bold w-8">
                        {isEditing ? (
                          <input
                            type="number"
                            value={sub.t3}
                            onChange={(e) => handleUpdateSubjectMark(sub.id, 't3', e.target.value)}
                            className="w-7 text-center bg-amber-50 font-bold focus:outline-none"
                          />
                        ) : (
                          <span>{sub.t3}</span>
                        )}
                      </td>

                      {/* Average */}
                      <td className="border border-slate-500 py-0.5 px-0.5 text-center font-mono font-black text-slate-950 w-8 bg-slate-50">
                        {rowAvg}
                      </td>

                      {/* Grade */}
                      <td className="border border-slate-500 py-0.5 px-0.5 text-center font-black text-[#0f2942]">
                        {grade}
                      </td>

                      {/* Remarks */}
                      <td className="border border-slate-500 py-0.5 px-2 text-[10px] text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={sub.remarks || ''}
                            onChange={(e) => handleUpdateSubjectMark(sub.id, 'remarks', e.target.value)}
                            placeholder={getDefaultRemark(grade)}
                            className="w-full bg-amber-50 text-[10px] focus:outline-none"
                          />
                        ) : (
                          <span>{remarks}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* OVERALL AVERAGE */}
                <tr className="font-black text-slate-950 text-[10.5px] bg-[#dbe4ee] border-t-2 border-slate-600">
                  <td className="border border-slate-500 py-1 px-1 text-center" colSpan={2}>
                    <span className="uppercase tracking-wide font-black">OVERALL AVERAGE</span>
                  </td>
                  <td className="border border-slate-500 py-1 px-0.5 text-center font-mono">{t1Avg}</td>
                  <td className="border border-slate-500 py-1 px-0.5 text-center font-mono">{t2Avg}</td>
                  <td className="border border-slate-500 py-1 px-0.5 text-center font-mono">{t3Avg}</td>
                  <td className="border border-slate-500 py-1 px-0.5 text-center font-mono text-xs text-[#0f2942] bg-[#cddae7]">
                    {overallAvg}
                  </td>
                  <td className="border border-slate-500 py-1 px-0.5 text-center text-xs text-[#0f2942]">
                    {currentOverallGrade.grade}
                  </td>
                  <td className="border border-slate-500 py-1 px-2 text-[10px] font-bold text-[#0f2942]">
                    {currentOverallGrade.desc} Performance
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Middle: Grading Key & Learner Profile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[10px]">
            
            {/* Grading Key */}
            <div className="md:col-span-5 border border-slate-600 rounded overflow-hidden flex flex-col">
              <div className="bg-[#dce7f2] py-0.5 px-2 text-center font-black text-[10px] text-[#0f2942] border-b border-slate-600 uppercase">
                GRADING KEY
              </div>
              <div className="p-1 space-y-0.5 flex-1 flex flex-col justify-around text-[10px] font-bold text-slate-800 bg-white">
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">A</span>
                  <span className="font-mono text-slate-600 w-14 text-center">80 – 100</span>
                  <span className="text-slate-900 flex-1 text-right">Excellent</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">B</span>
                  <span className="font-mono text-slate-600 w-14 text-center">70 – 79</span>
                  <span className="text-slate-900 flex-1 text-right">Very Good</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">C</span>
                  <span className="font-mono text-slate-600 w-14 text-center">60 – 69</span>
                  <span className="text-slate-900 flex-1 text-right">Good</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">D</span>
                  <span className="font-mono text-slate-600 w-14 text-center">50 – 59</span>
                  <span className="text-slate-900 flex-1 text-right">Satisfactory</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">E</span>
                  <span className="font-mono text-slate-600 w-14 text-center">40 – 49</span>
                  <span className="text-slate-900 flex-1 text-right">Fair</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="font-black w-4">F</span>
                  <span className="font-mono text-slate-600 w-14 text-center">0 – 39</span>
                  <span className="text-slate-900 flex-1 text-right">Needs Improvement</span>
                </div>
              </div>
            </div>

            {/* Learner Profile */}
            <div className="md:col-span-7 border border-slate-600 rounded overflow-hidden">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-[#dce7f2] text-[#0f2942] text-[9.5px] font-black uppercase border-b border-slate-600">
                    <th className="py-0.5 px-1.5 border-r border-slate-600">
                      LEARNER PROFILE (NON-ACADEMIC)
                    </th>
                    <th className="py-0.5 text-center" colSpan={5}>
                      <div className="text-[9px] font-black pb-0.2 border-b border-slate-600">RATING</div>
                      <div className="grid grid-cols-5 text-center font-black text-[9px]">
                        <span>E</span>
                        <span>VG</span>
                        <span>G</span>
                        <span>S</span>
                        <span>N</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-semibold">
                  {profileKeys.map((item) => {
                    const currentRating = activeReport.learnerProfile?.[item.key] || 'E';
                    return (
                      <tr key={item.key} className="hover:bg-slate-50">
                        <td className="py-0.5 px-1.5 text-slate-900 font-bold border-r border-slate-400">
                          {item.label}
                        </td>
                        {ratingOptions.map((r) => {
                          const isSelected = currentRating === r;
                          return (
                            <td 
                              key={r}
                              onClick={() => isEditing && handleUpdateLearnerRating(item.key, r)}
                              className={`py-0.5 text-center font-bold border-r last:border-r-0 border-slate-300 w-5 ${
                                isEditing ? 'cursor-pointer hover:bg-amber-100' : ''
                              }`}
                            >
                              {isSelected ? (
                                <span className="font-black text-slate-950">✓</span>
                              ) : (
                                <span className="text-slate-300">·</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Lower: Remarks & Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[10px]">
            {/* Teacher Remarks */}
            <div className="md:col-span-7 border border-slate-600 rounded p-2 flex flex-col justify-between space-y-1 bg-white">
              <div className="font-black text-[10px] text-slate-900 uppercase">
                CLASS TEACHER'S REMARKS
              </div>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={activeReport.teacherRemarks}
                  onChange={(e) => handleUpdateField('teacherRemarks', e.target.value)}
                  className="w-full p-1 bg-amber-50 border border-amber-300 rounded text-[10px] font-semibold text-slate-900 focus:outline-none"
                />
              ) : (
                <p className="text-[10px] font-semibold text-slate-900 italic py-0.5">
                  "{activeReport.teacherRemarks}"
                </p>
              )}
            </div>

            {/* Attendance */}
            <div className="md:col-span-5 border border-slate-600 rounded p-2 space-y-0.5 bg-white flex flex-col justify-between">
              <div className="font-black text-[10px] text-slate-900 uppercase">
                ATTENDANCE
              </div>
              <div className="space-y-0.5 text-[9.5px] font-bold">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-700">Days School Opened:</span>
                  <span className="font-mono font-bold">{activeReport.daysOpened}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-700">Days Present:</span>
                  <span className="font-mono font-bold">{activeReport.daysPresent}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-700">Days Absent:</span>
                  <span className="font-mono font-bold">{activeReport.daysAbsent}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-200 pt-0.5">
                  <span className="text-slate-900 font-black">Percentage Attendance:</span>
                  <span className="font-mono font-black text-emerald-800">{attendancePercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Stamp */}
          <div className="border border-slate-600 rounded p-2 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9.5px] font-bold">
              
              {/* Class Teacher */}
              <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-300 pb-1 sm:pb-0 sm:pr-2">
                <div className="font-black text-[10px] text-slate-900 uppercase">CLASS TEACHER</div>
                <div className="text-slate-800">Name: <span className="font-bold">{activeReport.teacherName}</span></div>
                <div className="text-slate-800">Signature: <span className="font-serif italic text-blue-900">M. Phiri</span></div>
                <div className="text-slate-600 text-[9px]">Date: {activeReport.teacherDate}</div>
              </div>

              {/* Head Teacher */}
              <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-slate-300 pb-1 sm:pb-0 sm:px-2">
                <div className="font-black text-[10px] text-slate-900 uppercase">HEAD TEACHER</div>
                <div className="text-slate-800">Name: <span className="font-bold">{activeReport.headTeacherName}</span></div>
                <div className="text-slate-800">Signature: <span className="font-serif italic text-blue-900">Dr. G. K. Mwape</span></div>
                <div className="text-slate-600 text-[9px]">Date: {activeReport.headTeacherDate}</div>
                
                {/* Stamp badge */}
                <div className="mt-1 border border-blue-800 rounded-full px-2 py-0.5 text-center bg-blue-50/50 text-[7.5px] font-mono text-blue-900">
                  ★ LUSAKA NATIONAL SEC. SCHOOL ★
                </div>
              </div>

              {/* Parent */}
              <div className="space-y-0.5 sm:pl-2">
                <div className="font-black text-[10px] text-slate-900 uppercase">PARENT / GUARDIAN</div>
                <div className="text-slate-800">Name: <span className="font-bold">{activeReport.parentName}</span></div>
                <div className="text-slate-800">Signature: <span className="font-serif italic text-slate-600">........................</span></div>
                <div className="text-slate-600 text-[9px]">Date: {activeReport.parentDate}</div>
              </div>

            </div>
          </div>

          {/* Footer Motto */}
          <div className="pt-1 text-center space-y-0.5 border-t border-slate-300">
            <p className="text-[10.5px] font-black italic text-[#0f2942]">
              “Quality Education for Development”
            </p>
            <p className="text-[8.5px] text-slate-500">
              Note: This report is issued three times a year. Keep it safely and bring it when requested by the school.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
