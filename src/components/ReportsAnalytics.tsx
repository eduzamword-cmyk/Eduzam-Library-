import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Award, 
  Users, 
  CheckCircle2, 
  PieChart, 
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function ReportsAnalytics() {
  const [selectedYear, setSelectedYear] = useState('2025');

  const subjectPassRates = [
    { subject: 'Mathematics (Syllabus D)', candidates: '138,400', pass: '72.4%', distinction: '14.2%', trend: '+3.1%' },
    { subject: 'Integrated Science', candidates: '141,200', pass: '81.8%', distinction: '18.5%', trend: '+4.0%' },
    { subject: 'English Language', candidates: '142,500', pass: '84.6%', distinction: '21.0%', trend: '+1.8%' },
    { subject: 'Biology', candidates: '98,200', pass: '76.2%', distinction: '16.8%', trend: '+2.5%' },
    { subject: 'Chemistry', candidates: '62,100', pass: '78.9%', distinction: '19.4%', trend: '+5.2%' },
    { subject: 'Civic Education', candidates: '125,000', pass: '89.1%', distinction: '26.3%', trend: '+0.9%' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Ministry Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">National Examination Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Grade 7, 9, and 12 examination pass rate summaries, subject breakdown, and regional parity indexes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 shadow-xs"
          >
            <option value="2025">2025 Exam Series</option>
            <option value="2024">2024 Exam Series</option>
            <option value="2023">2023 Exam Series</option>
          </select>

          <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-2 active:scale-95">
            <Download className="w-4 h-4" /> Export Report PDF
          </button>
        </div>
      </header>

      {/* Analytics Summary Banner */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">National Grade 12 Pass Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-slate-800">78.6%</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+2.4% vs 2024</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Grade 9 Progression Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-slate-800">82.1%</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+1.9% vs 2024</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Gender Parity Index (GPI)</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-slate-800">0.99</h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Balanced</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Distinction Ratio</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-3xl font-extrabold text-slate-800">18.2%</h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">+3.0% vs 2024</span>
          </div>
        </div>
      </div>

      {/* Full width Subject Performance Breakdown */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Subject Performance & Distinction Analysis</h2>
            <p className="text-xs text-slate-500">Senior Secondary Certificate Examination Metrics</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Subject Title</th>
                <th className="px-6 py-4 font-semibold text-center">Total Candidates</th>
                <th className="px-6 py-4 font-semibold text-center">Pass Rate (%)</th>
                <th className="px-6 py-4 font-semibold text-center">Distinction Ratio (%)</th>
                <th className="px-6 py-4 font-semibold text-right">Yearly Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjectPassRates.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{s.subject}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{s.candidates}</td>
                  <td className="px-6 py-4 text-center font-bold text-teal-700">{s.pass}</td>
                  <td className="px-6 py-4 text-center font-bold text-purple-700">{s.distinction}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <TrendingUp className="w-3 h-3" /> {s.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
