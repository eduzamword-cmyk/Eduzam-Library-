import { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileText, 
  Sparkles, 
  Award, 
  MapPin, 
  Users, 
  Layers,
  BarChart2
} from 'lucide-react';

export default function InspectionAudit() {
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const audits = [
    {
      id: 1,
      school: 'Lusaka Boys STEM Secondary School',
      district: 'Lusaka District',
      province: 'Lusaka Province',
      inspector: 'Inspector Dr. Mwamba Banda',
      rating: 'Grade A+ (96.4%)',
      auditDate: '10th August 2026',
      eczStatus: '100% Anti-Tamper Compliant',
      labs: '4 Science & 2 ICT Labs Operational',
      flags: 0,
      badge: 'Platinum Standard'
    },
    {
      id: 2,
      school: 'Ndola Technical High School',
      district: 'Ndola District',
      province: 'Copperbelt Province',
      inspector: 'Inspector Gertrude Mulenga',
      rating: 'Grade A (92.1%)',
      auditDate: '08th August 2026',
      eczStatus: 'Markbook Verified',
      labs: '3 Science & 1 ICT Lab Operational',
      flags: 0,
      badge: 'Gold Standard'
    },
    {
      id: 3,
      school: 'Choma Boarding Secondary School',
      district: 'Choma District',
      province: 'Southern Province',
      inspector: 'Inspector Bwalya Sampa',
      rating: 'Grade B+ (88.5%)',
      auditDate: '02nd August 2026',
      eczStatus: 'Awaiting Practical Audit Sync',
      labs: '2 Science Labs (1 Under Renovation)',
      flags: 1,
      badge: 'Verified'
    },
    {
      id: 4,
      school: 'Kasama Day Secondary School',
      district: 'Kasama District',
      province: 'Northern Province',
      inspector: 'Inspector Chibwe Kapwepwe',
      rating: 'Grade B (84.0%)',
      auditDate: '28th July 2026',
      eczStatus: 'Markbook Verified',
      labs: '2 Science Labs Operational',
      flags: 0,
      badge: 'Verified'
    }
  ];

  const filtered = audits.filter(a => {
    const matchesProv = selectedProvince === 'ALL' || a.province === selectedProvince;
    const matchesSearch = a.school.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProv && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 border border-teal-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            NATIONAL QUALITY ASSURANCE INSPECTORATE
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-serif">
            School Quality & Standards Audit Desk
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Real-time inspection reports, infrastructure ratings, anti-tamper markbook compliance, and teacher licensing verification across all regional education districts.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name or district..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {['ALL', 'Lusaka Province', 'Copperbelt Province', 'Southern Province', 'Northern Province'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedProvince(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedProvince === p
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Audit List Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base font-serif">
            Recent Institutional Quality Audits (2026)
          </h2>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {filtered.length} Audited Institutions Listed
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map(audit => (
            <div key={audit.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{audit.school}</h3>
                  <span className="px-2.5 py-0.5 bg-slate-900 text-emerald-300 text-[10px] font-black uppercase rounded-md">
                    {audit.rating}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {audit.district}, {audit.province}
                  </span>
                  <span>•</span>
                  <span>Inspector: <strong className="text-slate-700">{audit.inspector}</strong></span>
                  <span>•</span>
                  <span>Audited: {audit.auditDate}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 pt-1">
                  <span className="flex items-center gap-1 text-teal-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    {audit.eczStatus}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">{audit.labs}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => alert(`Generating official Ministry Quality Audit Certificate for ${audit.school}`)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Audit Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
