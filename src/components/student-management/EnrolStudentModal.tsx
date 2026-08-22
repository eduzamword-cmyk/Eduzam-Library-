import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  X, 
  User, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Building2,
  Users
} from 'lucide-react';
import { SchoolClass, StudentCandidate } from '../../types';
import { generateParentDetailsForStudent } from '../../data/parentsData';

interface EnrolStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  defaultClassId?: string;
  institutionName: string;
  onEnrolStudent: (studentData: Omit<StudentCandidate, 'id'>) => Promise<void>;
}

export const EnrolStudentModal: React.FC<EnrolStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  defaultClassId,
  institutionName,
  onEnrolStudent
}) => {
  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || (classes[0]?.id || ''));
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [examNo, setExamNo] = useState('');
  const [nrc, setNrc] = useState('');
  
  // Guardian / Parent Details
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState<'Father' | 'Mother' | 'Guardian' | 'Sponsor' | 'Grandparent'>('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmergencyPhone, setGuardianEmergencyPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [guardianTown, setGuardianTown] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set selected class
  useEffect(() => {
    if (defaultClassId) {
      setSelectedClassId(defaultClassId);
    } else if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [defaultClassId, classes]);

  // Selected class object
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Generate suggested parent details when student name is typed or class changes
  const handleAutoSuggestParent = () => {
    if (!studentName.trim()) return;
    const details = generateParentDetailsForStudent(
      studentName,
      institutionName,
      currentClass?.name || 'Class'
    );
    setGuardianName(details.guardianName);
    setGuardianRelationship(details.relationship);
    setGuardianPhone(details.phone);
    setGuardianEmergencyPhone(details.emergencyPhone);
    setGuardianEmail(details.email);
    setGuardianAddress(details.address);
    setGuardianTown(details.town);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !selectedClassId) return;

    setIsSubmitting(true);
    try {
      const cls = classes.find(c => c.id === selectedClassId);
      const grade = cls?.grade || 'Grade 10';
      const className = cls?.name || 'General Class';

      await onEnrolStudent({
        name: studentName.trim(),
        grade,
        classId: selectedClassId,
        className,
        school: institutionName,
        examNo: examNo.trim() || `2026-${String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0')}`,
        gender,
        nrc: nrc.trim() || `${Math.floor(100000 + Math.random() * 900000)}/11/1`,
        guardianName: guardianName.trim() || 'Parent on Record',
        guardianRelationship,
        guardianPhone: guardianPhone.trim() || '+260 97 000 0000',
        guardianEmergencyPhone: guardianEmergencyPhone.trim(),
        guardianEmail: guardianEmail.trim(),
        guardianAddress: guardianAddress.trim(),
        guardianTown: guardianTown.trim(),
        attendanceRate: 98,
        caStatus: 'Up to Date',
        status: 'Active'
      });

      onClose();
      // Reset form
      setStudentName('');
      setExamNo('');
      setNrc('');
      setGuardianName('');
      setGuardianPhone('');
      setGuardianEmergencyPhone('');
      setGuardianEmail('');
      setGuardianAddress('');
    } catch (err) {
      console.error('Failed to enrol student:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Enrol Candidate Student</h3>
                <p className="text-xs text-slate-500">
                  Register student and match verified parent/guardian records to {institutionName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {/* Student Basic Information */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" /> Student Profile & Class Allocation
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    onBlur={handleAutoSuggestParent}
                    placeholder="e.g. Mwamba Chipoya"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-teal-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleAutoSuggestParent}
                    title="Auto-match parent details from student surname and school location"
                    className="px-3 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Match Parent
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-teal-500/40"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-teal-500/40"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Number (Format: 2026-0001)</label>
                  <input
                    type="text"
                    value={examNo}
                    onChange={(e) => setExamNo(e.target.value)}
                    placeholder="e.g. 2026-0001"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">National ID (NRC)</label>
                  <input
                    type="text"
                    value={nrc}
                    onChange={(e) => setNrc(e.target.value)}
                    placeholder="458921/11/1"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Parent & Guardian Contact Information Matching School Context */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-700" /> Parent / Guardian Details (Matched to School & Class)
                </h4>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  Primary Contact
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Dr. Kelvin Chipoya"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={guardianRelationship}
                    onChange={(e) => setGuardianRelationship(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Legal Guardian</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Primary Phone *</label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+260 97 111 2233"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Hotline Phone</label>
                  <input
                    type="text"
                    value={guardianEmergencyPhone}
                    onChange={(e) => setGuardianEmergencyPhone(e.target.value)}
                    placeholder="+260 96 222 3344"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Email Address</label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="kelvin.chipoya@gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address (Suburban / Area)</label>
                  <input
                    type="text"
                    value={guardianAddress}
                    onChange={(e) => setGuardianAddress(e.target.value)}
                    placeholder="Plot 450, Munali Residential, Lusaka"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Enrolling Candidate...' : 'Confirm Enrolment to Roster'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
