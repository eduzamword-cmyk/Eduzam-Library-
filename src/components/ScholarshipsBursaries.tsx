import { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  Search, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  ArrowUpRight,
  Filter,
  Users
} from 'lucide-react';

export default function ScholarshipsBursaries() {
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const schemes = [
    {
      id: 1,
      title: 'CDF Constituency Secondary School Boarding Bursary',
      type: 'CDF Grant',
      target: 'Secondary School Students (Grades 8 – 12)',
      amount: 'Full Boarding & Tuition Covered',
      constituency: '156 Constituencies Nationwide',
      deadline: 'Rolling Intake 2026',
      beneficiaries: '142,000+ Students',
      status: 'Active Intake',
      requirements: ['Grade 7 or 9 Certificate', 'Vulnerable / Orphan Status Proof', 'Constituency Committee Form']
    },
    {
      id: 2,
      title: 'Higher Education Loans & Scholarships Board Grant',
      type: 'Higher Education',
      target: 'Public Universities',
      amount: '100% Tuition + Accommodation Allowance',
      constituency: 'National Level Selection',
      deadline: '31st August 2026',
      beneficiaries: '38,500+ Undergraduates',
      status: 'Verification Phase',
      requirements: ['Grade 12 Certificate (6 Points or better)', 'National Registration Card (NRC)', 'Admissions Acceptance Letter']
    },
    {
      id: 3,
      title: 'TEVETA Craft & Vocational Skills CDF Bursary',
      type: 'CDF Skills Grant',
      target: 'Youth Trade Apprentices (Carpentry, Electrical, Agriculture)',
      amount: 'Full Trade Tools & Examination Fees',
      constituency: '116 District TEVETA Centers',
      deadline: '15th September 2026',
      beneficiaries: '65,000+ Artisans',
      status: 'Active Intake',
      requirements: ['Grade 9 or 12 Statement of Results', 'NRC Copy', 'District Trades Application']
    },
    {
      id: 4,
      title: 'STEM Female Excellence Presidential Scholarship 2026',
      type: 'Presidential Award',
      target: 'Female Candidates in Pure Sciences & Engineering',
      amount: 'Full International / Local University Sponsorship',
      constituency: 'National Top Performers',
      deadline: '20th August 2026',
      beneficiaries: '1,500 Scholars',
      status: 'Priority Processing',
      requirements: ['Distinction 1 in Pure Mathematics & Physics', 'Recommendation from School Head', 'Statement of Purpose']
    }
  ];

  const filtered = schemes.filter(s => {
    const matchesType = selectedType === 'ALL' || s.type === selectedType;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-widest">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            NATIONAL BURSARIES & CDF YOUTH GRANTS
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-serif">
            Scholarships & Financial Support Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            Manage constituency boarding bursaries (CDF), university loans, skills grants, and Presidential STEM awards with automated verification against national exam results.
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
            placeholder="Search bursaries, HELSB loans, or CDF schemes..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'CDF Grant', 'Higher Education', 'CDF Skills Grant', 'Presidential Award'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(scheme => (
          <div 
            key={scheme.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase rounded-lg">
                  {scheme.type}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {scheme.deadline}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 font-serif leading-snug">
                {scheme.title}
              </h2>

              <p className="text-xs text-slate-600 font-medium">
                Target: <strong className="text-slate-800">{scheme.target}</strong>
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">COVERAGE VALUE</span>
                <p className="text-xs font-bold text-teal-800">{scheme.amount}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ELIGIBILITY REQUIREMENTS</span>
                {scheme.requirements.map((req, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {scheme.beneficiaries}
              </span>

              <button 
                onClick={() => alert(`Opening official Ministry application portal for: ${scheme.title}`)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                Apply Online
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
