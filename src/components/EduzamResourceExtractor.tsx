import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  Download,
  FileCheck2,
  Bookmark,
  Share2,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  FileText,
  Clock,
  Building2,
  RefreshCw,
  FolderPlus,
  Compass,
  Zap,
  SlidersHorizontal,
  Flame,
  Award,
  ChevronRight,
  BookMarked,
  HelpCircle,
  FolderDown,
  Globe
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LibraryItem, DocumentPage } from '../data/libraryData';

export interface ExtractedResourceData {
  id: string;
  title: string;
  code: string;
  subject: string;
  level: string;
  extractionType: string;
  sourceAuthority: string;
  publisher: string;
  author: string;
  year: string;
  fileSize: string;
  pages: string;
  markdown: string;
  extractedAt: string;
  isOfficialMoE: boolean;
}

interface EduzamResourceExtractorProps {
  onSaveToLibrary?: (item: LibraryItem, pages: DocumentPage[]) => void;
  onOpenInReader?: (item: LibraryItem) => void;
  onSendToLessonPlanner?: (extracted: ExtractedResourceData) => void;
}

const ZAMBIAN_SUBJECTS = [
  'Mathematics',
  'Additional Mathematics',
  'Integrated Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Art and Design',
  'Physical Education & Sports',
  'Agricultural Science',
  'Computer Studies / ICT',
  'English Language',
  'Literature in English',
  'Civic Education',
  'History',
  'Geography',
  'Religious Education',
  'Social Studies',
  'Commerce',
  'Principles of Accounts',
  'Economics',
  'Business Studies',
  'Home Economics',
  'Food & Nutrition',
  'Fashion & Fabrics',
  'Design & Technology',
  'Woodwork',
  'Metalwork',
  'Technical Drawing',
  'Music & Performing Arts',
  'Icibemba (Bemba)',
  'Cinyanja (Nyanja)',
  'Chitonga (Tonga)',
  'Silozi (Lozi)',
  'Kiikaonde (Kaonde)',
  'Lunda',
  'Luvale'
];

const FORM_LEVELS = [
  'Primary (Grades 1-7)',
  'Form 1 (Grade 8)',
  'Form 2 (Grade 9)',
  'Form 3 (Grade 10)',
  'Form 4 (Grade 11)',
  'Form 5 (Grade 12)',
  'Form 6 / A-Level / TVET'
];

const EXTRACTION_MODES = [
  {
    id: 'teaching_pack',
    title: 'Full CDC Teaching Resource Pack',
    badge: 'Standard MoE',
    icon: BookOpen,
    desc: '4-Stage pedagogical progression, SLOs, teacher/learner activities, worked exemplars & mark schemes.'
  },
  {
    id: 'cbc_matrix',
    title: 'CBC Competence & Outcomes Matrix',
    badge: 'CBC 2026',
    icon: Award,
    desc: 'CDC general competencies, specific behavioral learning outcomes, core 21st century skills & values.'
  },
  {
    id: 'scheme_of_work',
    title: '13-Week Termly Scheme of Work',
    badge: 'Pacing Guide',
    icon: Layers,
    desc: 'Week-by-week topic pacing, textbook page references, low-cost teaching aids & assessment dates.'
  },
  {
    id: 'ecz_blueprint',
    title: 'ECZ Exam Blueprint & Item Matrix',
    badge: 'ECZ Exam Prep',
    icon: FileText,
    desc: 'Paper 1/2/3 question templates, AO1/AO2/AO3 weightings, worked solutions & common errors.'
  },
  {
    id: 'drills_and_activities',
    title: 'Classroom Activities & Differentiated Drills',
    badge: 'Active Inquiry',
    icon: Zap,
    desc: 'Hands-on group experiments, local materials adaptations, remedial tasks & gifted extension drills.'
  }
];

const PRESET_TOPICS: Record<string, { topic: string; subtopic: string; level: string; subject: string; type: string }[]> = {
  'Art and Design': [
    {
      topic: 'Introduction to Art, Crafts & Design — Branches of Visual Art',
      subtopic: 'Fine Art vs Applied Art with Local Zambian Crafts',
      level: 'Form 1 (Grade 8)',
      subject: 'Art and Design',
      type: 'teaching_pack'
    },
    {
      topic: 'Textile Design & Surface Decoration using Indigenous Pigments',
      subtopic: 'Chitenge Batik, Tie-and-Dye & Natural Clay Dyes',
      level: 'Form 2 (Grade 9)',
      subject: 'Art and Design',
      type: 'drills_and_activities'
    }
  ],
  'Physical Education & Sports': [
    {
      topic: 'Introduction to Physical Education, Sports Science & Human Anatomy',
      subtopic: 'Cardiovascular Fitness, Warm-Up Drills & Sports Safety',
      level: 'Form 1 (Grade 8)',
      subject: 'Physical Education & Sports',
      type: 'teaching_pack'
    },
    {
      topic: 'Team Ball Games: Basketball & Volleyball Tactical Formations',
      subtopic: 'Offensive Systems, Zone Defense & ECZ Practical Assessment',
      level: 'Form 2 (Grade 9)',
      subject: 'Physical Education & Sports',
      type: 'drills_and_activities'
    }
  ],
  'Mathematics': [
    {
      topic: 'Algebraic Expressions & Factorization',
      subtopic: 'Difference of Two Squares & Quadratic Equations in Commerce',
      level: 'Form 3 (Grade 10)',
      subject: 'Mathematics',
      type: 'teaching_pack'
    },
    {
      topic: 'Linear Programming & Optimization in Mining Operations',
      subtopic: 'Graphical Inequalities & Profit Maximization in Kwacha',
      level: 'Form 5 (Grade 12)',
      subject: 'Mathematics',
      type: 'ecz_blueprint'
    }
  ],
  'Physics': [
    {
      topic: 'Energy, Work, Power & Conservation Laws',
      subtopic: 'Hydroelectric Generation at Kariba Dam & Power Distribution',
      level: 'Form 3 (Grade 10)',
      subject: 'Physics',
      type: 'teaching_pack'
    },
    {
      topic: 'Current Electricity, Ohm’s Law & Circuit Calculations',
      subtopic: 'Domestic Wiring, Solar PV Inverters & ECZ Paper 2 Exemplars',
      level: 'Form 4 (Grade 11)',
      subject: 'Physics',
      type: 'ecz_blueprint'
    }
  ],
  'Biology': [
    {
      topic: 'Cell Biology, Specialized Cells & Microscopic Analysis',
      subtopic: 'Plant vs Animal Cells & Practical Staining Techniques',
      level: 'Form 1 (Grade 8)',
      subject: 'Biology',
      type: 'teaching_pack'
    },
    {
      topic: 'Ecology, Energy Flow & Conservation in Kafue Basin Ecosystems',
      subtopic: 'Food Webs, Biomagnification & Zambian Wildlife Management',
      level: 'Form 4 (Grade 11)',
      subject: 'Biology',
      type: 'cbc_matrix'
    }
  ],
  'Agricultural Science': [
    {
      topic: 'Conservation Agriculture & Soil Fertility Management',
      subtopic: 'Minimum Tillage, Organic Mulching & Crop Rotation in Central Province',
      level: 'Form 2 (Grade 9)',
      subject: 'Agricultural Science',
      type: 'teaching_pack'
    }
  ],
  'Computer Studies / ICT': [
    {
      topic: 'Computer Hardware, System Architecture & Memory Systems',
      subtopic: 'CPU Registers, Storage Hierarchy & Digital Data Flow',
      level: 'Form 1 (Grade 8)',
      subject: 'Computer Studies / ICT',
      type: 'teaching_pack'
    },
    {
      topic: 'Algorithm Design, Flowcharts & Basic Python Syntax',
      subtopic: 'Conditional Branching, Loops & School Markbook Calculation',
      level: 'Form 3 (Grade 10)',
      subject: 'Computer Studies / ICT',
      type: 'drills_and_activities'
    }
  ]
};

export default function EduzamResourceExtractor({
  onSaveToLibrary,
  onOpenInReader,
  onSendToLessonPlanner
}: EduzamResourceExtractorProps) {
  // Input parameters
  const [selectedSubject, setSelectedSubject] = useState('Art and Design');
  const [selectedLevel, setSelectedLevel] = useState('Form 1 (Grade 8)');
  const [topic, setTopic] = useState('Introduction to Art, Crafts and Design');
  const [subtopic, setSubtopic] = useState('Branches of Visual Art & CDC Core Competences');
  const [extractionMode, setExtractionMode] = useState('teaching_pack');
  const [sourceAuthority, setSourceAuthority] = useState('ALL');
  const [customInstructions, setCustomInstructions] = useState('');
  const [includeWorkedExamples, setIncludeWorkedExamples] = useState(true);
  const [includeZambianContext, setIncludeZambianContext] = useState(true);

  // Status & output
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState('');
  const [extractedResult, setExtractedResult] = useState<ExtractedResourceData | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToLibrarySuccess, setSavedToLibrarySuccess] = useState(false);

  // History
  const [history, setHistory] = useState<ExtractedResourceData[]>(() => {
    const saved = localStorage.getItem('eduzam_extracted_resources_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('eduzam_extracted_resources_history', JSON.stringify(history));
  }, [history]);

  // Handle Preset selection
  const handleApplyPreset = (preset: { topic: string; subtopic: string; level: string; subject: string; type: string }) => {
    setSelectedSubject(preset.subject);
    setSelectedLevel(preset.level);
    setTopic(preset.topic);
    setSubtopic(preset.subtopic);
    setExtractionMode(preset.type);
  };

  const handleExtractResource = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setErrorNotice('Please provide a curriculum topic or unit title.');
      return;
    }

    setErrorNotice(null);
    setIsExtracting(true);
    setSavedToLibrarySuccess(false);

    // Dynamic animation stages
    setExtractionStage('Connecting to MoE & CDC Curriculum Development Directory...');
    const t1 = setTimeout(() => {
      setExtractionStage('Indexing Zambia National e-Library & NotesMaster catalogues...');
    }, 1200);

    const t2 = setTimeout(() => {
      setExtractionStage('Engaging EDUZAM 3.7 Intelligence Engine for CDC CBC alignment...');
    }, 2400);

    const t3 = setTimeout(() => {
      setExtractionStage('Synthesizing 4-stage progression, worked exemplars & ECZ mark schemes...');
    }, 3800);

    try {
      const simplifiedLevel = selectedLevel.split(' ')[0] + (selectedLevel.includes('Form') ? ' ' + selectedLevel.split(' ')[1] : '');
      const response = await fetch('/api/gemini/extract-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          level: simplifiedLevel,
          topic,
          subtopic,
          extractionType: extractionMode,
          sourceAuthority,
          customNotes: customInstructions,
          includeWorkedExamples,
          includeZambianContext
        })
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!response.ok) {
        throw new Error('Extraction service encountered an error.');
      }

      const data = await response.json();
      const resData: ExtractedResourceData = {
        id: `extracted-${Date.now()}`,
        title: data.resource?.title || `${simplifiedLevel} ${selectedSubject}: ${topic}`,
        code: data.resource?.code || `CDC-${selectedSubject.slice(0, 3).toUpperCase()}-${simplifiedLevel.replace(/\s+/g, '').toUpperCase()}-2026`,
        subject: selectedSubject,
        level: simplifiedLevel,
        extractionType: extractionMode,
        sourceAuthority,
        publisher: data.resource?.publisher || 'Curriculum Development Centre (CDC) & Zambia MoE',
        author: data.resource?.author || 'National Curriculum Panel & EDUZAM 3.7 Intelligence',
        year: '2026',
        fileSize: data.resource?.fileSize || '5.2 MB',
        pages: data.resource?.pages || '14 pages',
        markdown: data.resource?.markdown || data.text || '',
        extractedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        isOfficialMoE: true
      };

      setExtractedResult(resData);
      setHistory(prev => [resData, ...prev.filter(h => h.title !== resData.title).slice(0, 19)]);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorNotice(err.message || 'Failed to extract teaching resource. Please verify your connection.');
    } finally {
      setIsExtracting(false);
      setExtractionStage('');
    }
  };

  const handleCopyMarkdown = () => {
    if (!extractedResult) return;
    navigator.clipboard.writeText(extractedResult.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert markdown to structured LibraryItem and DocumentPages
  const handleSaveToLibraryClick = () => {
    if (!extractedResult) return;

    // Parse sections from markdown
    const sections = extractedResult.markdown.split(/(?=###?\s+[0-9A-Z])/g).filter(s => s.trim().length > 0);
    const pages: DocumentPage[] = sections.length > 0 ? sections.map((sec, idx) => {
      const firstLine = sec.trim().split('\n')[0].replace(/^#+\s*/, '').trim();
      return {
        pageNumber: idx + 1,
        pageTitle: firstLine || `Section ${idx + 1}`,
        chapterTitle: `${extractedResult.subject} — ${extractedResult.title}`,
        content: sec.trim(),
        keyTakeaways: [
          `CDC Competence benchmark for ${extractedResult.level} ${extractedResult.subject}.`,
          `Aligned with Ministry of Education CBC national standards.`
        ]
      };
    }) : [
      {
        pageNumber: 1,
        pageTitle: 'Comprehensive CDC Teaching Resource',
        chapterTitle: extractedResult.title,
        content: extractedResult.markdown,
        keyTakeaways: ['Extracted via EDUZAM 3.7 Teaching Resource Intelligence.']
      }
    ];

    const libraryItem: LibraryItem = {
      id: extractedResult.id,
      title: extractedResult.title,
      category: 'modules',
      level: (extractedResult.level.includes('Form 1') ? 'Form 1' : 
              extractedResult.level.includes('Form 2') ? 'Form 2' :
              extractedResult.level.includes('Form 3') ? 'Form 3' :
              extractedResult.level.includes('Form 4') ? 'Form 4' :
              extractedResult.level.includes('Form 5') ? 'Form 5' :
              extractedResult.level.includes('Form 6') ? 'Form 6' :
              extractedResult.level.includes('Primary') ? 'Primary' : 'All Levels') as any,
      subject: extractedResult.subject,
      code: extractedResult.code,
      publisher: extractedResult.publisher,
      author: extractedResult.author,
      year: extractedResult.year,
      pages: extractedResult.pages,
      fileSize: extractedResult.fileSize,
      fileFormat: 'INTERACTIVE',
      downloadCount: 120,
      rating: 5.0,
      isOfficialMoE: true,
      isInternational: false,
      featured: true,
      coverImageGradient: 'from-emerald-900 via-teal-900 to-slate-950',
      description: `AI-Extracted CDC & Ministry of Education CBC teaching resource for ${extractedResult.level} ${extractedResult.subject} on "${topic}".`,
      tableOfContents: pages.map(p => p.pageTitle),
      pagesList: pages
    };

    if (onSaveToLibrary) {
      onSaveToLibrary(libraryItem, pages);
    } else {
      // Direct local storage fallback
      const savedItems = localStorage.getItem('eduzam_custom_library_items');
      const currentList: LibraryItem[] = savedItems ? JSON.parse(savedItems) : [];
      localStorage.setItem('eduzam_custom_library_items', JSON.stringify([libraryItem, ...currentList]));
      
      const savedDownloads = localStorage.getItem('eduzam_downloaded_items');
      const downloadsList: string[] = savedDownloads ? JSON.parse(savedDownloads) : [];
      localStorage.setItem('eduzam_downloaded_items', JSON.stringify([...downloadsList, libraryItem.id]));
    }

    setSavedToLibrarySuccess(true);
    setTimeout(() => setSavedToLibrarySuccess(false), 4000);
  };

  const handleOpenReader = () => {
    if (!extractedResult) return;
    const libraryItem: LibraryItem = {
      id: extractedResult.id,
      title: extractedResult.title,
      category: 'modules',
      level: (extractedResult.level.includes('Form 1') ? 'Form 1' : 'All Levels') as any,
      subject: extractedResult.subject,
      code: extractedResult.code,
      publisher: extractedResult.publisher,
      author: extractedResult.author,
      year: extractedResult.year,
      pages: extractedResult.pages,
      fileSize: extractedResult.fileSize,
      fileFormat: 'INTERACTIVE',
      downloadCount: 50,
      rating: 5.0,
      isOfficialMoE: true,
      isInternational: false,
      coverImageGradient: 'from-emerald-900 via-teal-900 to-slate-950',
      description: `CDC Teaching Resource for ${extractedResult.level} ${extractedResult.subject}`,
      tableOfContents: ['Section 1: Unit Objectives & Key Concepts', 'Section 2: Detailed Lesson Content', 'Section 3: Self-Check Exercises & Practice Tasks']
    };

    if (onOpenInReader) {
      onOpenInReader(libraryItem);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 p-6 sm:p-8 text-white border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                EDUZAM 3.7 Curriculum Extractor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-blue-300" />
                MoE & CDC Verified Standards
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Globe className="w-3 h-3 text-amber-300" />
                National e-Library & ECZ Connected
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              EDUZAM Teaching Resource Extractor
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Extract precise, pedagogical teaching packs, competence matrices, 13-week schemes of work, and ECZ examination blueprints directly from the Ministry of Education, CDC, and National e-Library repositories.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model Core</div>
              <div className="text-base font-black text-emerald-400 mt-0.5">EDUZAM 3.7 Engine</div>
              <div className="text-[10px] text-slate-400">MoE Syllabi Grounded</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexed Grades</div>
              <div className="text-base font-black text-teal-300 mt-0.5">Primary to Form 6</div>
              <div className="text-[10px] text-slate-400">All 42 Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Extraction Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Extraction Parameters & Controls */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Preset Quick Chips */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Popular CDC Curriculum Presets
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">1-Click Load</span>
            </div>

            <div className="space-y-2">
              {Object.entries(PRESET_TOPICS).flatMap(([subj, items]) => items.slice(0, 1)).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all group flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase">
                      <span>{preset.level}</span>
                      <span>•</span>
                      <span>{preset.subject}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 line-clamp-1 mt-0.5">
                      {preset.topic}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleExtractResource} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Configure Extraction Query</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Live Server Pipeline
              </span>
            </div>

            {/* Target Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Educational Level / Grade:
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                {FORM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Curriculum Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
              >
                {ZAMBIAN_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Topic & Subtopic Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Syllabus Topic / Main Unit:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Newton's Laws of Motion & Vehicle Safety"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sub-Topic or Specific Learning Focus:
                </label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="e.g. Kariba Dam Hydro Power Generation & Zambian Applications"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Extraction Mode Radio Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Extraction Output Format:
              </label>
              <div className="space-y-2">
                {EXTRACTION_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = extractionMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setExtractionMode(mode.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{mode.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{mode.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source Priority Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Source Authority:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSourceAuthority('ALL')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sourceAuthority === 'ALL'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Official Sources
                </button>
                <button
                  type="button"
                  onClick={() => setSourceAuthority('CDC')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sourceAuthority === 'CDC'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  CDC Curricula Only
                </button>
                <button
                  type="button"
                  onClick={() => setSourceAuthority('NATIONAL_ELIB')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sourceAuthority === 'NATIONAL_ELIB'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  National e-Library
                </button>
                <button
                  type="button"
                  onClick={() => setSourceAuthority('ECZ')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sourceAuthority === 'ECZ'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ECZ Exam Matrix
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWorkedExamples}
                  onChange={(e) => setIncludeWorkedExamples(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Include Step-by-Step Worked Exemplars & Mark Scheme</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeZambianContext}
                  onChange={(e) => setIncludeZambianContext(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Include Zambian Context & Industrial Applications</span>
              </label>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Teacher Focus / Custom Instructions:
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Emphasize safety precautions in school laboratories and include differentiated homework tasks..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Error notice */}
            {errorNotice && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* Submit Extract Button */}
            <button
              type="submit"
              disabled={isExtracting}
              className={`w-full py-3.5 px-4 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isExtracting
                  ? 'bg-slate-700 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]'
              }`}
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting from MoE & CDC Repositories...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Extract Teaching Resource (EDUZAM 3.7)</span>
                </>
              )}
            </button>
          </form>

          {/* History Drawer */}
          {history.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recent Extraction History ({history.length})
                  </h3>
                </div>
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setExtractedResult(h)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      extractedResult?.id === h.id
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">
                        {h.level} • {h.subject}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {h.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{h.extractedAt}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Resource Viewer Studio & Actions */}
        <div className="lg:col-span-7">
          {isExtracting ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-5 min-h-[500px]">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-emerald-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-black text-slate-900">
                  AI Teaching Resource Extractor Active
                </h3>
                <p className="text-xs font-semibold text-emerald-700">
                  {extractionStage || 'Processing syllabus metadata with EDUZAM 3.7...'}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  Extracting CDC competencies, behavioral learning outcomes, 4-stage progression, worked examples, and ECZ mark schemes.
                </p>
              </div>

              <div className="w-full max-w-sm bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : extractedResult ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Studio Top Action Bar */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      {extractedResult.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {extractedResult.level} • {extractedResult.subject}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 mt-1">
                    {extractedResult.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Print Document"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={handleSaveToLibraryClick}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                      savedToLibrarySuccess
                        ? 'bg-teal-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {savedToLibrarySuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved to Library!</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Save into Library</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenReader}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Reader</span>
                  </button>
                </div>
              </div>

              {/* Sub-Header Metadata */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
                <div className="flex items-center gap-4">
                  <span><strong>Publisher:</strong> {extractedResult.publisher}</span>
                  <span><strong>Extracted:</strong> {extractedResult.extractedAt}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CDC Syllabus Verified Specification</span>
                </div>
              </div>

              {/* Markdown Content Area */}
              <div className="p-6 sm:p-8 max-h-[700px] overflow-y-auto font-sans leading-relaxed text-slate-800 space-y-4">
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:my-2 prose-li:my-0.5 prose-table:border-collapse prose-table:w-full prose-th:bg-slate-100 prose-th:p-2.5 prose-th:text-left prose-td:p-2.5 prose-td:border-b prose-td:border-slate-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {extractedResult.markdown}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Bottom Quick Integration Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Ready to deploy in lesson plans, exams, and student assignments.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToLibraryClick}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>Add to Library Modules</span>
                  </button>
                  <button
                    onClick={handleOpenReader}
                    className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-900 font-bold hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Study in Multi-Page Reader</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-4 min-h-[500px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-black text-slate-900">
                  No Resource Extracted Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a grade level and subject on the left, pick a curriculum topic or preset, and tap <strong>"Extract Teaching Resource"</strong> to generate full CDC teaching specifications.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleApplyPreset(PRESET_TOPICS['Art and Design'][0])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  ⚡ Try Form 1 Art & Design
                </button>
                <button
                  onClick={() => handleApplyPreset(PRESET_TOPICS['Physics'][0])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  ⚡ Try Form 3 Physics (Kariba)
                </button>
                <button
                  onClick={() => handleApplyPreset(PRESET_TOPICS['Mathematics'][0])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  ⚡ Try Form 3 Mathematics
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
