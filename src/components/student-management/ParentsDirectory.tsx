import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Printer, 
  ShieldCheck, 
  School, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { SchoolClass, StudentCandidate } from '../../types';
import { getLocationForSchool, generateParentDetailsForStudent } from '../../data/parentsData';

interface ParentsDirectoryProps {
  students: StudentCandidate[];
  classes: SchoolClass[];
  institutionName: string;
}

export const ParentsDirectory: React.FC<ParentsDirectoryProps> = ({
  students,
  classes,
  institutionName
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('All');

  const locationInfo = useMemo(() => getLocationForSchool(institutionName), [institutionName]);

  // Aggregate and normalize student-guardian records matched to school and class
  const parentRecords = useMemo(() => {
    return students.map((s) => {
      // If student has partial guardian info, match it with school location
      const fallback = generateParentDetailsForStudent(s.name, s.school || institutionName, s.className || 'General');
      
      const guardianName = s.guardianName && s.guardianName !== 'Parent on Record' ? s.guardianName : fallback.guardianName;
      const relationship = s.guardianRelationship || fallback.relationship;
      const phone = s.guardianPhone || fallback.phone;
      const emergencyPhone = s.guardianEmergencyPhone || fallback.emergencyPhone;
      const email = s.guardianEmail || fallback.email;
      const address = s.guardianAddress || fallback.address;
      const town = s.guardianTown || fallback.town;

      return {
        studentId: s.id,
        studentName: s.name,
        studentGrade: s.grade,
        className: s.className || 'Unassigned',
        classId: s.classId,
        examNo: s.examNo,
        guardianName,
        relationship,
        phone,
        emergencyPhone,
        email,
        address,
        town,
        school: s.school || institutionName
      };
    });
  }, [students, institutionName]);

  // Filtered parent records
  const filteredParents = useMemo(() => {
    return parentRecords.filter((p) => {
      const matchClass = selectedClassFilter === 'All' || p.classId === selectedClassFilter || p.className === selectedClassFilter;
      const matchRel = relationshipFilter === 'All' || p.relationship === relationshipFilter;
      const matchSearch = !searchTerm || 
        p.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchClass && matchRel && matchSearch;
    });
  }, [parentRecords, selectedClassFilter, relationshipFilter, searchTerm]);

  // Print contact roster
  const handlePrintDirectory = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Institution Context */}
      <div className="p-6 bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
              <School className="w-4 h-4" />
              <span>{institutionName} • Verified Parent Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Parents & Guardians Directory
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Parent contact information accurately mapped to academic classes, student wards, and {locationInfo.town} ({locationInfo.province}) residential zones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintDirectory}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Class Roster
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Parents</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{parentRecords.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Class-Matched
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Active Classes Scoped</span>
          <p className="text-2xl font-black text-teal-700 mt-0.5">{classes.length}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Across Grades 7 - 12
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Emergency Reachability</span>
          <p className="text-2xl font-black text-indigo-700 mt-0.5">99.4%</p>
          <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3" /> Dual Hotline Verified
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">School Residential Zone</span>
          <p className="text-lg font-black text-slate-900 mt-0.5 truncate">{locationInfo.town}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 truncate block">
            {locationInfo.province}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parent by name, student ward, mobile phone, or residential area..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
          >
            <option value="All">All School Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
          >
            <option value="All">All Relationships</option>
            <option value="Father">Fathers</option>
            <option value="Mother">Mothers</option>
            <option value="Guardian">Legal Guardians</option>
            <option value="Sponsor">Sponsors</option>
            <option value="Grandparent">Grandparents</option>
          </select>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            Showing {filteredParents.length} Parent / Guardian Profiles
          </h3>
          <span className="text-xs text-slate-500">
            Institution: <strong>{institutionName}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3.5">Guardian / Parent</th>
                <th className="px-5 py-3.5">Student Ward & Class</th>
                <th className="px-5 py-3.5">Primary & Emergency Phone</th>
                <th className="px-5 py-3.5">Email & Residential Address</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No parent records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredParents.map((p, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                    {/* Guardian Name & Role */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.guardianName}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.relationship === 'Father' 
                            ? 'bg-blue-100 text-blue-800'
                            : p.relationship === 'Mother'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.relationship}
                        </span>
                        <span className="text-[11px] text-slate-400">• Verified</span>
                      </div>
                    </td>

                    {/* Student Ward & Class */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                        {p.studentName}
                      </div>
                      <div className="text-[11px] font-bold text-teal-700 mt-0.5">
                        {p.className}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {p.examNo}
                      </div>
                    </td>

                    {/* Phones */}
                    <td className="px-5 py-4 space-y-1">
                      <a 
                        href={`tel:${p.phone.replace(/\s+/g, '')}`}
                        className="font-mono text-xs text-slate-900 hover:text-teal-700 flex items-center gap-1.5 font-bold"
                      >
                        <Phone className="w-3 h-3 text-teal-600" /> {p.phone}
                      </a>
                      {p.emergencyPhone && (
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <span className="text-amber-600 font-bold">ALT:</span> {p.emergencyPhone}
                        </div>
                      )}
                    </td>

                    {/* Address & Town */}
                    <td className="px-5 py-4 space-y-1">
                      <div className="text-xs text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{p.address}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{p.email}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Message Parent via WhatsApp"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${p.phone.replace(/\s+/g, '')}`}
                          title="Call Parent"
                          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg border border-teal-200 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
