import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  X,
  School,
  Building,
  ShieldCheck,
  Download,
  Edit2,
  Sparkles
} from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule, ValidationModule, themeQuartz } from 'ag-grid-community';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface InstitutionItem {
  id?: string;
  name: string;
  category: string;
  province: string;
  code?: string;
}

// Register all Community features and ValidationModule
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

export default function InstitutionsDirectory() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<InstitutionItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Higher Education' | 'Secondary Schools' | 'Primary Schools' | 'Administrative'>('Secondary Schools');
  const [newProvince, setNewProvince] = useState('Lusaka');
  const [newCode, setNewCode] = useState('');

  // Edit Form state
  const [editName, setEditName] = useState('');
  
  const colDefs: ColDef[] = useMemo(() => [
    { field: 'name', headerName: 'School Name', filter: true, flex: 2 },
    { field: 'category', headerName: 'Category', filter: true, flex: 1 },
    { field: 'province', headerName: 'Province', filter: true, flex: 1 },
    { field: 'code', headerName: 'Code', filter: true, flex: 1 },
  ], []);
  const [editCategory, setEditCategory] = useState<'Higher Education' | 'Secondary Schools' | 'Primary Schools' | 'Administrative'>('Secondary Schools');
  const [editProvince, setEditProvince] = useState('Lusaka');
  const [editCode, setEditCode] = useState('');

  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalsTab, setApprovalsTab] = useState<'directory' | 'approvals'>('directory');

  // Pending Approvals State for Super Admins
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'app-1',
      type: 'School Addition Request',
      title: 'Kabwe Technical High School - Phase 2 Expansion',
      submittedBy: 'Dr. K. Mulenga (School Head)',
      institution: 'Kabwe Technical High School',
      province: 'Central Province',
      status: 'PENDING',
      date: '2026-08-14'
    },
    {
      id: 'app-2',
      type: 'Class & Subject Allocation',
      title: 'Grade 12 STEM-A Computer Science Curriculum Allocation',
      submittedBy: 'Mr. B. Banda (Senior Teacher)',
      institution: 'Munali Boys Secondary School',
      province: 'Lusaka Province',
      status: 'PENDING',
      date: '2026-08-14'
    },
    {
      id: 'app-3',
      type: 'School Addition Request',
      title: 'Livingstone Tourism & Science Vocational Annex',
      submittedBy: 'Mrs. M. Phiri (Provincial Director)',
      institution: 'Livingstone High School',
      province: 'Southern Province',
      status: 'PENDING',
      date: '2026-08-13'
    }
  ]);

  const handleApproveRequest = (id: string) => {
    setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
    alert('Successfully approved request under Ministry of Education Super Admin governance.');
  };

  const handleRejectRequest = (id: string) => {
    setPendingApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED' } : item));
    alert('Request rejected and returned for revision.');
  };

  const handleSeedZambiaSchools = async () => {
    setIsSeeding(true);
    const zambiaSchools = [
      // Higher Education
      { name: 'University of Zambia (UNZA)', category: 'Higher Education', province: 'Lusaka', code: 'UNZA-01' },
      { name: 'Copperbelt University (CBU)', category: 'Higher Education', province: 'Copperbelt', code: 'CBU-01' },
      { name: 'Mulungushi University', category: 'Higher Education', province: 'Central', code: 'MUL-01' },
      { name: 'Mukuba University', category: 'Higher Education', province: 'Copperbelt', code: 'MUK-01' },
      { name: 'Kwame Nkrumah University', category: 'Higher Education', province: 'Central', code: 'KNU-01' },
      { name: 'Levy Mwanawasa Medical University', category: 'Higher Education', province: 'Lusaka', code: 'LMMU-01' },
      { name: 'Kapasa Makasa University', category: 'Higher Education', province: 'Muchinga', code: 'KMU-01' },
      { name: 'Chalimbana University', category: 'Higher Education', province: 'Lusaka', code: 'CHAL-01' },
      
      // Secondary Schools
      { name: 'Munali Boys Secondary School', category: 'Secondary Schools', province: 'Lusaka', code: 'MUN-B' },
      { name: 'Munali Girls Secondary School', category: 'Secondary Schools', province: 'Lusaka', code: 'MUN-G' },
      { name: 'Chizongwe Technical Secondary School', category: 'Secondary Schools', province: 'Eastern', code: 'CHIZ-01' },
      { name: 'David Kaunda Technical High School', category: 'Secondary Schools', province: 'Lusaka', code: 'DK-TECH' },
      { name: 'Luanshya Girls Secondary School', category: 'Secondary Schools', province: 'Copperbelt', code: 'LUA-G' },
      { name: 'Kasama Girls Secondary School', category: 'Secondary Schools', province: 'Northern', code: 'KAS-G' },
      { name: 'Mpelembe Secondary School', category: 'Secondary Schools', province: 'Copperbelt', code: 'MPEL-01' },
      { name: 'Canisius Secondary School', category: 'Secondary Schools', province: 'Southern', code: 'CAN-01' },
      { name: 'St. Marys Secondary School', category: 'Secondary Schools', province: 'Copperbelt', code: 'STM-01' },
      { name: 'Chipembi Girls Secondary School', category: 'Secondary Schools', province: 'Central', code: 'CHIP-01' },
      { name: 'Malcom Moffat Secondary School', category: 'Secondary Schools', province: 'Central', code: 'MAL-01' },
      { name: 'Mbala Secondary School', category: 'Secondary Schools', province: 'Northern', code: 'MBA-01' },
      { name: 'Livingstone High School', category: 'Secondary Schools', province: 'Southern', code: 'LIV-01' },
      { name: 'Mongu Secondary School', category: 'Secondary Schools', province: 'Western', code: 'MON-01' },
      { name: 'Solwezi Technical High School', category: 'Secondary Schools', province: 'North-Western', code: 'SOL-TECH' },
      { name: 'Mansa Secondary School', category: 'Secondary Schools', province: 'Luapula', code: 'MAN-01' },
      { name: 'Chinsali Day Secondary School', category: 'Secondary Schools', province: 'Muchinga', code: 'CHIN-01' },

      // Primary Schools
      { name: 'Lusaka Central Primary School', category: 'Primary Schools', province: 'Lusaka', code: 'LUS-PRI-01' },
      { name: 'Ndola Primary School', category: 'Primary Schools', province: 'Copperbelt', code: 'NDO-PRI-01' },
      { name: 'Livingstone Primary School', category: 'Primary Schools', province: 'Southern', code: 'LIV-PRI-01' },
      { name: 'Kabwe Primary School', category: 'Primary Schools', province: 'Central', code: 'KAB-PRI-01' },
      { name: 'Kasama Primary School', category: 'Primary Schools', province: 'Northern', code: 'KAS-PRI-01' },
      { name: 'Chipata Primary School', category: 'Primary Schools', province: 'Eastern', code: 'CHI-PRI-01' },
      { name: 'Mongu Primary School', category: 'Primary Schools', province: 'Western', code: 'MON-PRI-01' },
      { name: 'Solwezi Primary School', category: 'Primary Schools', province: 'North-Western', code: 'SOL-PRI-01' },
      { name: 'Mansa Primary School', category: 'Primary Schools', province: 'Luapula', code: 'MAN-PRI-01' },
      { name: 'Chinsali Primary School', category: 'Primary Schools', province: 'Muchinga', code: 'CHI-PRI-02' },

      // Administrative
      { name: 'Ministry of Education Headquarters', category: 'Administrative', province: 'Lusaka', code: 'MOE-HQ' },
      { name: 'Lusaka Provincial Education Office', category: 'Administrative', province: 'Lusaka', code: 'PEO-LUS' },
      { name: 'Copperbelt Provincial Education Office', category: 'Administrative', province: 'Copperbelt', code: 'PEO-CB' },
      { name: 'Southern Provincial Education Office', category: 'Administrative', province: 'Southern', code: 'PEO-STH' },
      { name: 'Eastern Provincial Education Office', category: 'Administrative', province: 'Eastern', code: 'PEO-EST' }
    ];

    try {
      for (const school of zambiaSchools) {
        await addDoc(collection(db, 'institutions'), {
          ...school,
          createdAt: serverTimestamp()
        });
      }
      alert('Successfully seeded all Zambian institutions and schools across categories!');
    } catch (e: any) {
      handleFirestoreError(e, OperationType.WRITE, 'institutions');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'institutions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InstitutionItem[];
      setInstitutions(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'institutions');
    });
    return () => unsubscribe();
  }, []);

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const docData: any = {
        name: newName,
        category: newCategory,
        province: newProvince,
        createdAt: serverTimestamp()
      };
      if (newCode.trim()) {
        docData.code = newCode.trim();
      }
      await addDoc(collection(db, 'institutions'), docData);

      setNewName('');
      setNewCode('');
      setIsAddModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'institutions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (inst: InstitutionItem) => {
    setEditingInstitution(inst);
    setEditName(inst.name);
    setEditCategory(inst.category as any);
    setEditProvince(inst.province);
    setEditCode(inst.code || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitution || !editingInstitution.id || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      const docData: any = {
        name: editName,
        category: editCategory,
        province: editProvince,
      };
      if (editCode.trim()) {
        docData.code = editCode.trim();
      } else {
        docData.code = null;
      }
      await updateDoc(doc(db, 'institutions', editingInstitution.id), docData);
      setIsEditModalOpen(false);
      setEditingInstitution(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'institutions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const provinces = ['All', 'Lusaka', 'Copperbelt', 'Central', 'Southern', 'Western', 'Eastern', 'Luapula', 'Northern', 'Muchinga', 'North-Western'];
  const categories = ['All', 'Higher Education', 'Secondary Schools', 'Primary Schools', 'Administrative'];

  const filtered = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || (inst.code && inst.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || inst.category === selectedCategory;
    const matchesProvince = selectedProvince === 'All' || inst.province === selectedProvince;
    return matchesSearch && matchesCategory && matchesProvince;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Ministry Registry
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Institutions & Schools Directory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Official database of Primary, Secondary, Higher Education Institutions, and MOE Administrative Offices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedZambiaSchools}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isSeeding ? 'Seeding Schools...' : 'Seed All Zambian Schools'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Institution
          </button>
        </div>
      </header>

      {/* Tab Switcher for Super Admin Approvals vs Directory */}
      <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setApprovalsTab('directory')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            approvalsTab === 'directory'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Institutions Directory
        </button>
        <button
          onClick={() => setApprovalsTab('approvals')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            approvalsTab === 'approvals'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Super Admin Approvals</span>
          <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
            {pendingApprovals.filter(p => p.status === 'PENDING').length}
          </span>
        </button>
      </div>

      {approvalsTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-md flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Super Admin Approval Portal</h2>
              <p className="text-teal-200 text-xs mt-1">Review and approve official school addition requests and class/subject allocation updates.</p>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
              Level 5 Governance
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">{req.type}</span>
                    <span className="text-xs text-slate-400">• {req.date}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{req.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Submitted by: <strong className="text-slate-700">{req.submittedBy}</strong> at <span className="text-teal-700">{req.institution}</span> ({req.province})</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvalsTab === 'directory' && (
      <div className="space-y-6">
      <div className="w-full bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search school name or code (e.g., UNZA, LBS-01)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-sm text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Province:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Institutions - AG Grid */}
      <div className="ag-theme-quartz w-full h-[600px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <AgGridReact
          theme={themeQuartz}
          rowData={filtered}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={10}
        />
      </div>

      {filtered.length === 0 && (
        <div className="w-full bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Institutions Found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria or register a new school.</p>
        </div>
      )}

      {/* Add Institution Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Register New Institution</h3>
                    <p className="text-xs text-slate-500">Add to national MOE education directory</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddInstitution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Kasama Technical High School"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-medium"
                    >
                      <option value="Higher Education">Higher Education</option>
                      <option value="Secondary Schools">Secondary Schools</option>
                      <option value="Primary Schools">Primary Schools</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Province</label>
                    <select
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-medium"
                    >
                      {provinces.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Code (Optional)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. KAS-01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-600/20 active:scale-95"
                  >
                    {isSubmitting ? 'Registering...' : 'Save Institution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Institution Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Edit Institution</h3>
                    <p className="text-xs text-slate-500">Update national MOE education directory record</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateInstitution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Kasama Technical High School"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-medium"
                    >
                      <option value="Higher Education">Higher Education</option>
                      <option value="Secondary Schools">Secondary Schools</option>
                      <option value="Primary Schools">Primary Schools</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Province</label>
                    <select
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-medium"
                    >
                      {provinces.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Institution Code (Optional)</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="e.g. KAS-01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-600/20 active:scale-95"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Institution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
      )}
    </div>
  );
}
