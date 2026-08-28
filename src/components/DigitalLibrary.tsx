import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Download, 
  Search, 
  FileCheck2, 
  GraduationCap, 
  FileText, 
  Zap, 
  ExternalLink,
  BookMarked,
  Layers,
  CheckCircle2,
  Bookmark,
  Clock,
  Filter,
  Globe,
  HardDriveDownload,
  Share2,
  Eye,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Building2,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
  VolumeX,
  School,
  HelpCircle,
  Flame,
  Award,
  Library as LibraryIcon,
  FolderDown,
  Trash2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
  StickyNote,
  BookCheck,
  ListOrdered,
  AlignLeft,
  Scroll,
  HelpCircle as QuestionIcon,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { 
  LibraryItem, 
  ExternalPortal, 
  DocumentPage,
  OFFICIAL_PORTALS, 
  INITIAL_LIBRARY_DATABASE 
} from '../data/libraryData';
import { getDocumentPages } from '../data/libraryPagesContent';
import EduzamResourceExtractor from './EduzamResourceExtractor';

interface DigitalLibraryProps {
  onNavigate?: (viewId: string) => void;
}

export default function DigitalLibrary({ onNavigate }: DigitalLibraryProps) {
  const handleSendToPlanner = (item: LibraryItem) => {
    localStorage.setItem('eduzam_imported_library_resource', JSON.stringify(item));
    setToastMessage(`Successfully sent "${item.title}" to Lesson Planner!`);
    setTimeout(() => setToastMessage(null), 3000);
    if (onNavigate) {
      onNavigate('lesson-planner');
    }
  };
  const [items, setItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('eduzam_custom_library_items');
    if (saved) {
      try {
        const parsed: LibraryItem[] = JSON.parse(saved);
        const existingIds = new Set(INITIAL_LIBRARY_DATABASE.map(i => i.id));
        const customOnly = parsed.filter(p => !existingIds.has(p.id));
        return [...INITIAL_LIBRARY_DATABASE, ...customOnly];
      } catch (e) {
        return INITIAL_LIBRARY_DATABASE;
      }
    }
    return INITIAL_LIBRARY_DATABASE;
  });

  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => {
    const defaultIds = [
      'cdc-mod-art-f1-t1',
      'cdc-mod-art-f1-t3',
      'cdc-mod-pes-f1-t2',
      'cdc-mod-pes-f1-t3',
      'cdc-mod-pes-f2-t12',
      'mod-f1-math-01',
      'mod-f3-phy-01',
      'pp-g12-math-2025',
      'info-cbc-framework-2026'
    ];
    const saved = localStorage.getItem('eduzam_downloaded_items');
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        return Array.from(new Set([...defaultIds, ...parsed]));
      } catch (e) {
        return defaultIds;
      }
    }
    return defaultIds;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('eduzam_bookmarked_items');
    return saved ? JSON.parse(saved) : ['cdc-mod-art-f1-t1', 'cdc-mod-pes-f1-t2', 'mod-f5-math-02', 'pp-g12-phys-2025'];
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'modules' | 'books' | 'past_papers' | 'school_info' | 'teaching_resources' | 'downloaded' | 'ai_extractor'>('all');
  const [activeLevel, setActiveLevel] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [onlyOfficialMoE, setOnlyOfficialMoE] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPortalsModal, setShowPortalsModal] = useState(false);
  const [showPortalsDropdown, setShowPortalsDropdown] = useState(false);
  const [moeConnected, setMoeConnected] = useState(true);
  const [isSyncingMoe, setIsSyncingMoe] = useState(false);
  const [moeSyncMessage, setMoeSyncMessage] = useState('MoE & CDC Portal Connected (Live Secure API)');

  const handleReconnectMoe = () => {
    setIsSyncingMoe(true);
    setMoeSyncMessage('Connecting to Ministry of Education & CDC servers (https://www.moe.gov.zm)...');
    setTimeout(() => {
      setIsSyncingMoe(false);
      setMoeConnected(true);
      setMoeSyncMessage('MoE & CDC Portal Successfully Reconnected! All curricula synchronized.');
      setToastMessage('Successfully reconnected to Official MoE & CDC Portal!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 1500);
  };
  const portalsDropdownRef = useRef<HTMLDivElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeReadingItem, setActiveReadingItem] = useState<LibraryItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close portals dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portalsDropdownRef.current && !portalsDropdownRef.current.contains(event.target as Node)) {
        setShowPortalsDropdown(false);
      }
    }
    if (showPortalsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPortalsDropdown]);

  // Reader Settings & Multi-Page Document Studio State
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingSectionIndex, setReadingSectionIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readerViewMode, setReaderViewMode] = useState<'page' | 'continuous' | 'drills'>('page');
  const [readerDocSearch, setReaderDocSearch] = useState('');
  const [showPageSidebar, setShowPageSidebar] = useState(true);
  const [showPageNotes, setShowPageNotes] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const [userPageNotes, setUserPageNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('eduzam_reader_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const [userPageBookmarks, setUserPageBookmarks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('eduzam_reader_page_bookmarks');
    return saved ? JSON.parse(saved) : {};
  });

  // Dynamic pages resolved for currently active reading item
  const currentDocumentPages = useMemo(() => {
    if (!activeReadingItem) return [];
    return getDocumentPages(activeReadingItem);
  }, [activeReadingItem]);

  // Reset reader page & search on new item
  useEffect(() => {
    if (activeReadingItem) {
      setCurrentPageIndex(0);
      setReaderDocSearch('');
      setReadingSectionIndex(0);
      setRevealedSolutions({});
    }
  }, [activeReadingItem]);

  // Persist notes and page bookmarks
  useEffect(() => {
    localStorage.setItem('eduzam_reader_notes', JSON.stringify(userPageNotes));
  }, [userPageNotes]);

  useEffect(() => {
    localStorage.setItem('eduzam_reader_page_bookmarks', JSON.stringify(userPageBookmarks));
  }, [userPageBookmarks]);

  // Keyboard navigation for reader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeReadingItem) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPageIndex(prev => Math.min(currentDocumentPages.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentPageIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentPageIndex(Math.max(0, currentDocumentPages.length - 1));
      } else if (e.key === 'Escape') {
        setActiveReadingItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReadingItem, currentDocumentPages.length]);

  // New Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'modules' | 'books' | 'past_papers' | 'school_info'>('modules');
  const [uploadLevel, setUploadLevel] = useState<'Primary' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Form 5' | 'Form 6' | 'All Levels'>('Form 1');
  const [uploadSubject, setUploadSubject] = useState('Mathematics');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadPages, setUploadPages] = useState('45 pages');
  const [uploadFileSize, setUploadFileSize] = useState('5.2 MB');
  const [uploadDescription, setUploadDescription] = useState('');

  // Persist downloads and bookmarks
  useEffect(() => {
    localStorage.setItem('eduzam_downloaded_items', JSON.stringify(downloadedIds));
  }, [downloadedIds]);

  useEffect(() => {
    localStorage.setItem('eduzam_bookmarked_items', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleDownload = (item: LibraryItem) => {
    if (downloadedIds.includes(item.id)) {
      setDownloadedIds(prev => prev.filter(id => id !== item.id));
      showToast(`Removed "${item.title.substring(0, 30)}..." from offline cache.`);
    } else {
      setDownloadingId(item.id);
      setTimeout(() => {
        setDownloadedIds(prev => [...prev, item.id]);
        setDownloadingId(null);
        showToast(`Downloaded "${item.title.substring(0, 30)}..." (${item.fileSize}) for offline access!`);
      }, 900);
    }
  };

  const handleToggleBookmark = (item: LibraryItem) => {
    if (bookmarkedIds.includes(item.id)) {
      setBookmarkedIds(prev => prev.filter(id => id !== item.id));
      showToast(`Removed from study bookmarks.`);
    } else {
      setBookmarkedIds(prev => [...prev, item.id]);
      showToast(`Saved to your study bookmarks!`);
    }
  };

  const handleCreateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newItem: LibraryItem = {
      id: `custom-${Date.now()}`,
      title: uploadTitle,
      category: uploadCategory,
      level: uploadLevel,
      subject: uploadSubject,
      code: uploadCode || `SCH-MOD-${Date.now().toString().slice(-4)}`,
      publisher: 'School Faculty / Institutional Library',
      author: 'Uploaded Resource',
      year: '2026',
      pages: uploadPages || '24 pages',
      fileSize: uploadFileSize || '4.0 MB',
      fileFormat: 'PDF',
      downloadCount: 1,
      rating: 5.0,
      isOfficialMoE: false,
      isInternational: false,
      coverImageGradient: 'from-emerald-800 via-slate-900 to-slate-950',
      description: uploadDescription || 'Locally contributed educational material and study notes.',
      tableOfContents: ['Section 1: Unit Objectives & Key Concepts', 'Section 2: Detailed Lesson Content', 'Section 3: Self-Check Exercises & Practice Tasks']
    };

    const updated = [newItem, ...items];
    setItems(updated);
    
    // Save custom items to local storage
    const customItems = updated.filter(i => i.id.startsWith('custom-'));
    localStorage.setItem('eduzam_custom_library_items', JSON.stringify(customItems));

    // Auto mark as downloaded
    setDownloadedIds(prev => [...prev, newItem.id]);

    setShowUploadModal(false);
    setUploadTitle('');
    setUploadDescription('');
    showToast(`Material "${newItem.title.substring(0, 30)}..." published and cached!`);
  };

  const handleSaveExtractedItem = (newItem: LibraryItem, newPages: DocumentPage[]) => {
    // Attach custom generated pages to item
    const itemWithPages: LibraryItem = {
      ...newItem,
      pagesList: newPages
    };

    const updated = [itemWithPages, ...items];
    setItems(updated);

    // Save custom items to local storage
    const customItems = updated.filter(i => i.id.startsWith('custom-') || i.id.startsWith('extracted-'));
    localStorage.setItem('eduzam_custom_library_items', JSON.stringify(customItems));

    // Auto mark as downloaded/cached
    setDownloadedIds(prev => Array.from(new Set([newItem.id, ...prev])));
    
    showToast(`Extracted resource "${newItem.title.substring(0, 32)}..." saved & cached in library!`);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (activeCategory === 'downloaded') {
        if (!downloadedIds.includes(item.id)) return false;
      } else if (activeCategory !== 'all' && activeCategory !== 'ai_extractor' && item.category !== activeCategory) {
        return false;
      }

      // Level filter (flexible matching across level and metadata)
      if (activeLevel !== 'All') {
        const lvlLower = activeLevel.toLowerCase();
        const itemLevelMatch = item.level && item.level.toLowerCase().includes(lvlLower);
        const itemTitleMatch = item.title && item.title.toLowerCase().includes(lvlLower);
        const itemDescMatch = item.description && item.description.toLowerCase().includes(lvlLower);
        const itemCodeMatch = item.code && item.code.toLowerCase().includes(lvlLower);
        if (!itemLevelMatch && !itemTitleMatch && !itemDescMatch && !itemCodeMatch) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) {
        return false;
      }

      // Official MoE filter
      if (onlyOfficialMoE && !item.isOfficialMoE) {
        return false;
      }

      // Search query (comprehensive multi-field search)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q) || false;
        const matchesCode = item.code?.toLowerCase().includes(q) || false;
        const matchesDesc = item.description?.toLowerCase().includes(q) || false;
        const matchesSubject = item.subject?.toLowerCase().includes(q) || false;
        const matchesAuthor = item.author?.toLowerCase().includes(q) || false;
        const matchesPublisher = item.publisher?.toLowerCase().includes(q) || false;
        const matchesLevel = item.level?.toLowerCase().includes(q) || false;
        const matchesOutcomes = item.learningOutcomes?.some(o => o.toLowerCase().includes(q)) || false;
        const matchesTOC = item.tableOfContents?.some(t => t.toLowerCase().includes(q)) || false;
        return matchesTitle || matchesCode || matchesDesc || matchesSubject || matchesAuthor || matchesPublisher || matchesLevel || matchesOutcomes || matchesTOC;
      }

      return true;
    });
  }, [items, activeCategory, activeLevel, selectedSubject, onlyOfficialMoE, searchQuery, downloadedIds]);

  const uniqueSubjects = useMemo(() => {
    const list = Array.from(new Set(items.map(i => i.subject))).sort();
    return ['All', ...list];
  }, [items]);

  const formLevels = ['All', 'Primary', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'];

  const categoryCounts = useMemo(() => {
    return {
      all: items.length,
      modules: items.filter(i => i.category === 'modules').length,
      books: items.filter(i => i.category === 'books').length,
      past_papers: items.filter(i => i.category === 'past_papers').length,
      school_info: items.filter(i => i.category === 'school_info').length,
      teaching_resources: items.filter(i => i.category === 'teaching_resources').length,
      downloaded: downloadedIds.length
    };
  }, [items, downloadedIds]);

  const totalContentPages = useMemo(() => {
    return items.reduce((acc, curr) => {
      const match = curr.pages?.match(/\d+/);
      const count = match ? parseInt(match[0], 10) : 5;
      return acc + count;
    }, 0);
  }, [items]);

  return (
    <div className="w-full space-y-1 pb-16 font-sans text-slate-900">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white rounded-lg shadow-2xl border border-emerald-500/40 flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Search Command Bar */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-4">
        
        {/* Search Engine Area */}
        <div className="flex items-center gap-3 w-full">
          {/* Lesson Plan Extractor Button */}
          <button
            onClick={() => {
              setActiveCategory('ai_extractor');
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20 text-white transition-all transform active:scale-95 cursor-pointer ring-2 ring-emerald-500/50 hover:ring-emerald-400 group"
            title="Lesson Plan Extractor"
          >
            <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library resources, books, past papers..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-full text-base sm:text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 font-medium shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-full bg-slate-100 p-1 border border-slate-200 shrink-0 h-14">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-full transition-colors cursor-pointer h-full ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-full transition-colors cursor-pointer h-full ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Structured List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0 shadow-sm h-14 cursor-pointer"
            title="Upload Material or Book"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden md:inline">Upload</span>
          </button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="w-full flex items-center gap-2 pl-2 sm:pl-16 flex-wrap text-sm">
          <span className="text-slate-500 font-semibold hidden sm:inline-block">Quick Search:</span>
          {['Form 1', 'Form 5', 'Mathematics', 'Science', 'ECZ Past Papers', 'CBC'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                setActiveCategory('all');
              }}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Main AI Resource Extractor Studio */}
      {activeCategory === 'ai_extractor' && (
        <EduzamResourceExtractor 
          onSaveToLibrary={handleSaveExtractedItem}
          onOpenInReader={(item) => setActiveReadingItem(item)}
        />
      )}

      {/* Main Repository List / Grid View (Only when not in AI extractor tab) */}
      {activeCategory !== 'ai_extractor' && (
        <>
          {/* Active Filter Chips if any */}
          {(activeCategory !== 'all' || activeLevel !== 'All' || selectedSubject !== 'All' || onlyOfficialMoE || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-slate-600 px-1 py-1">
          <span className="font-bold text-slate-800">Active Filters:</span>
          {activeCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 font-bold text-slate-800 border border-slate-200">
              Category: {activeCategory.replace('_', ' ').toUpperCase()}
              <button onClick={() => setActiveCategory('all')} className="hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {activeLevel !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
              Level: {activeLevel}
              <button onClick={() => setActiveLevel('All')} className="hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {onlyOfficialMoE && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-950 font-black border border-emerald-300">
              Source: MoE / CDC Portal Only
              <button onClick={() => setOnlyOfficialMoE(false)} className="hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {selectedSubject !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-900 font-bold border border-blue-200">
              Subject: {selectedSubject}
              <button onClick={() => setSelectedSubject('All')} className="hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-950 font-bold border border-amber-200">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveLevel('All');
              setSelectedSubject('All');
              setOnlyOfficialMoE(false);
              setSearchQuery('');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline ml-2 cursor-pointer text-xs sm:text-sm"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1 py-1">
        <span className="font-semibold">
          Showing <strong className="text-slate-900 font-black">{filteredItems.length}</strong> of {items.length} educational materials
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <HardDriveDownload className="w-4 h-4 text-teal-600" />
          <span><strong className="text-teal-900 font-black">{downloadedIds.length}</strong> stored offline in browser cache</span>
        </span>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="w-full p-10 bg-white rounded-lg border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">No matching materials found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, choosing a different level (e.g. Form 1, Form 5), or resetting the category filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveLevel('All');
              setSelectedSubject('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Main Grid View - 8px radius, tight 1-2px border and increased small word font sizes */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredItems.map((item, idx) => {
            const isDownloaded = downloadedIds.includes(item.id);
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isDownloading = downloadingId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                className={`w-full bg-white rounded-lg border transition-all flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-md ${
                  isDownloaded ? 'border-teal-300 ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                {/* Card Header & Badges */}
                <div className="p-4 pb-0">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Level Tag */}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                        item.level.startsWith('Form')
                          ? 'bg-emerald-600 text-white'
                          : item.level === 'Primary'
                          ? 'bg-amber-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {item.level}
                      </span>

                      {/* Subject Tag */}
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                        {item.subject}
                      </span>

                      {/* MoE / International Badge */}
                      {item.isOfficialMoE && (
                        <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-xs font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                          CDC
                        </span>
                      )}
                      {item.isInternational && (
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-blue-700" />
                          OER
                        </span>
                      )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleToggleBookmark(item)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark for study'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Official Code */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{item.code}</span>
                    <span>•</span>
                    <span>{item.year}</span>
                    <span>•</span>
                    <span>{item.pages}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer with Downloaded Status & Action Buttons */}
                <div className="p-4 pt-3 mt-3 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
                  
                  {/* Download Status Indication */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    {isDownloaded ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Downloaded (Offline Ready)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cloud Storage ({item.fileSize})</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-semibold">
                      {item.downloadCount.toLocaleString()} reads
                    </span>
                  </div>

                  {/* Actions: Read / Preview + Download Button */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => setActiveReadingItem(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Read Material</span>
                    </button>

                    <button
                      onClick={() => handleToggleDownload(item)}
                      disabled={isDownloading}
                      className={`flex items-center justify-center gap-1 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                        isDownloaded
                          ? 'bg-teal-100 text-teal-900 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-teal-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                      title={isDownloaded ? 'Remove from Offline Cache' : 'Download for Offline Reading'}
                    >
                      {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isDownloaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-teal-700" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Compact List View - 8px radius, tight 1-2px border and increased small word font sizes */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
          {filteredItems.map((item) => {
            const isDownloaded = downloadedIds.includes(item.id);
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isDownloaded ? 'bg-teal-50/20' : ''
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${
                      item.level.startsWith('Form')
                        ? 'bg-emerald-600 text-white'
                        : item.level === 'Primary'
                        ? 'bg-amber-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {item.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                      {item.subject}
                    </span>
                    <span className="font-mono text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    {isDownloaded && (
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-900 text-xs font-bold flex items-center gap-1 border border-teal-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        Offline Cached ({item.fileSize})
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-700 cursor-pointer" onClick={() => setActiveReadingItem(item)}>
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:inline">
                    {item.pages} • {item.fileSize}
                  </span>

                  <button
                    onClick={() => handleToggleBookmark(item)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setActiveReadingItem(item)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read</span>
                  </button>

                  <button
                    onClick={() => handleToggleDownload(item)}
                    disabled={isDownloading}
                    className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isDownloaded
                        ? 'bg-teal-100 text-teal-900 hover:bg-rose-100 hover:text-rose-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title={isDownloaded ? 'Remove from Offline Cache' : 'Download for Offline Reading'}
                  >
                    {isDownloading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isDownloaded ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* ========================================================= */}
      {/* IN-APP DOCUMENT READER & EXPLORER MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {activeReadingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${
                readerTheme === 'dark'
                  ? 'bg-slate-900 text-slate-100 border-slate-800'
                  : readerTheme === 'sepia'
                  ? 'bg-[#fbf0d9] text-[#433422] border-[#e6d5ba]'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {/* Reader Top Bar */}
              <div className={`px-3 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2.5 shrink-0 ${
                readerTheme === 'dark' ? 'border-slate-800 bg-slate-950/80' : readerTheme === 'sepia' ? 'border-[#e6d5ba] bg-[#f5e5c9]' : 'border-slate-200 bg-slate-50'
              }`}>
                {/* Left: Document Info & Subject Tag */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                    {activeReadingItem.level}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold truncate leading-tight">
                      {activeReadingItem.title}
                    </h2>
                    <div className="text-[10px] sm:text-[11px] opacity-70 font-mono flex items-center gap-1.5 truncate">
                      <span>{activeReadingItem.code}</span>
                      <span>•</span>
                      <span>{currentDocumentPages.length} Pgs</span>
                      <span className="hidden md:inline">• {activeReadingItem.publisher}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Mode Switch, Theme, Font, Notes, Download, Close */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* View Mode Toggle (Desktop segmented, Mobile compact select/tabs) */}
                  <div className="hidden sm:flex items-center rounded-lg p-0.5 bg-black/10 text-xs">
                    <button
                      onClick={() => setReaderViewMode('page')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        readerViewMode === 'page'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title="Page-by-page book layout"
                    >
                      Single Page
                    </button>
                    <button
                      onClick={() => setReaderViewMode('continuous')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        readerViewMode === 'continuous'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title="Scroll all pages continuously"
                    >
                      All Pages
                    </button>
                    <button
                      onClick={() => setReaderViewMode('drills')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        readerViewMode === 'drills'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title="Practice drills & questions only"
                    >
                      Drills
                    </button>
                  </div>

                  {/* Mobile Mode Dropdown */}
                  <div className="sm:hidden">
                    <select
                      value={readerViewMode}
                      onChange={(e: any) => setReaderViewMode(e.target.value)}
                      aria-label="Reading mode view"
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                        readerTheme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : readerTheme === 'sepia'
                          ? 'bg-[#ebd7b5] border-[#d8be93] text-[#3d2f1f]'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="page">Single Page</option>
                      <option value="continuous">All Pages</option>
                      <option value="drills">ECZ Drills</option>
                    </select>
                  </div>

                  {/* Theme Switcher */}
                  <div className="flex items-center rounded-lg p-0.5 bg-black/10 text-xs">
                    <button
                      onClick={() => setReaderTheme('light')}
                      className={`px-1.5 sm:px-2 py-1 rounded-md cursor-pointer text-[10px] sm:text-xs ${readerTheme === 'light' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'opacity-70'}`}
                      title="Light Mode"
                    >
                      L
                    </button>
                    <button
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-1.5 sm:px-2 py-1 rounded-md cursor-pointer text-[10px] sm:text-xs ${readerTheme === 'sepia' ? 'bg-[#fbf0d9] text-[#433422] font-bold shadow-2xs' : 'opacity-70'}`}
                      title="Sepia Mode"
                    >
                      S
                    </button>
                    <button
                      onClick={() => setReaderTheme('dark')}
                      className={`px-1.5 sm:px-2 py-1 rounded-md cursor-pointer text-[10px] sm:text-xs ${readerTheme === 'dark' ? 'bg-slate-800 text-white font-bold shadow-2xs' : 'opacity-70'}`}
                      title="Dark Mode"
                    >
                      D
                    </button>
                  </div>

                  {/* Font Size Adjust */}
                  <button
                    onClick={() => {
                      const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
                      const next = sizes[(sizes.indexOf(readerFontSize) + 1) % sizes.length];
                      setReaderFontSize(next);
                    }}
                    className="px-2 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-[10px] sm:text-xs font-bold cursor-pointer transition-colors"
                    title="Change font size"
                  >
                    {readerFontSize.toUpperCase()}
                  </button>

                  {/* Toggle Page Bookmark */}
                  <button
                    onClick={() => {
                      const key = `${activeReadingItem.id}-p${currentPageIndex + 1}`;
                      setUserPageBookmarks(prev => ({ ...prev, [key]: !prev[key] }));
                      showToast(userPageBookmarks[key] ? `Removed bookmark from page ${currentPageIndex + 1}` : `Bookmarked page ${currentPageIndex + 1}!`);
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors ${
                      userPageBookmarks[`${activeReadingItem.id}-p${currentPageIndex + 1}`]
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/10 hover:bg-black/20'
                    }`}
                    title="Bookmark this page"
                  >
                    <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Toggle Page Notes */}
                  <button
                    onClick={() => setShowPageNotes(!showPageNotes)}
                    className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-colors ${
                      showPageNotes ? 'bg-indigo-600 text-white' : 'bg-black/10 hover:bg-black/20'
                    }`}
                    title="Toggle Study Notes"
                  >
                    <StickyNote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Download / Cache Button */}
                  <button
                    onClick={() => handleToggleDownload(activeReadingItem)}
                    className="p-1.5 sm:p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer transition-all"
                    title="Cache for offline access"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setActiveReadingItem(null)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                    title="Close Reader (Esc)"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Reader Sub-Bar: Page Navigation & Search (Responsive layout) */}
              <div className={`px-3 sm:px-6 py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shrink-0 ${
                readerTheme === 'dark' ? 'border-slate-800/80 bg-slate-950/40' : readerTheme === 'sepia' ? 'border-[#ebd6b2] bg-[#f7ebd4]' : 'border-slate-200/80 bg-slate-100/70'
              }`}>
                {/* Left: Quick Page Jump & Flippers */}
                <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPageSidebar(!showPageSidebar)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors ${
                      showPageSidebar
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-current/20 hover:bg-black/5'
                    }`}
                    title="Toggle Pages Index Drawer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pages ({currentDocumentPages.length})</span>
                  </button>

                  <div className="h-4 w-px bg-current/15 mx-0.5 sm:mx-1 hidden sm:block" />

                  {/* Pagination Group */}
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPageIndex === 0}
                      onClick={() => setCurrentPageIndex(0)}
                      className="p-1 rounded hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="First page (Home)"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Fast -10 Jump */}
                    {currentDocumentPages.length >= 10 && (
                      <button
                        disabled={currentPageIndex === 0}
                        onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 10))}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/5 hover:bg-black/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Jump back 10 pages"
                      >
                        -10
                      </button>
                    )}

                    <button
                      disabled={currentPageIndex === 0}
                      onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                      className="px-1.5 sm:px-2 py-1 rounded-lg bg-black/10 hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 sm:gap-1 font-semibold text-[11px] sm:text-xs"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Page Indicator & Select Dropdown */}
                    <div className="flex items-center gap-1 font-medium">
                      <select
                        value={currentPageIndex}
                        onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                        aria-label="Select page number"
                        className={`px-1.5 sm:px-2 py-0.5 rounded font-bold text-[11px] sm:text-xs cursor-pointer border ${
                          readerTheme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : readerTheme === 'sepia'
                            ? 'bg-[#ebd7b5] border-[#d8be93] text-[#3d2f1f]'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        {currentDocumentPages.map((p, idx) => (
                          <option key={idx} value={idx}>
                            Pg {idx + 1} - {p.pageTitle.substring(0, 18)}...
                          </option>
                        ))}
                      </select>
                      <span className="opacity-70 text-[10px] sm:text-xs">/{currentDocumentPages.length}</span>
                    </div>

                    <button
                      disabled={currentPageIndex >= currentDocumentPages.length - 1}
                      onClick={() => setCurrentPageIndex(prev => Math.min(currentDocumentPages.length - 1, prev + 1))}
                      className="px-1.5 sm:px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 sm:gap-1 font-semibold text-[11px] sm:text-xs shadow-2xs"
                      title="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Fast +10 Jump */}
                    {currentDocumentPages.length >= 10 && (
                      <button
                        disabled={currentPageIndex >= currentDocumentPages.length - 1}
                        onClick={() => setCurrentPageIndex(prev => Math.min(currentDocumentPages.length - 1, prev + 10))}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/5 hover:bg-black/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Jump forward 10 pages"
                      >
                        +10
                      </button>
                    )}

                    <button
                      disabled={currentPageIndex >= currentDocumentPages.length - 1}
                      onClick={() => setCurrentPageIndex(currentDocumentPages.length - 1)}
                      className="p-1 rounded hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Last page (End)"
                    >
                      <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Right: In-Document Search & Reading Progress */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                  {/* Reading Progress Indicator */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] opacity-75">
                    <span>{Math.round(((currentPageIndex + 1) / Math.max(1, currentDocumentPages.length)) * 100)}% Read</span>
                    <div className="w-14 sm:w-16 h-1.5 rounded-full bg-black/15 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${((currentPageIndex + 1) / Math.max(1, currentDocumentPages.length)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Search inside Document */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search text in module..."
                      value={readerDocSearch}
                      onChange={(e) => setReaderDocSearch(e.target.value)}
                      className={`pl-8 pr-3 py-1 rounded-lg text-xs w-full sm:w-44 border transition-all focus:outline-none ${
                        readerTheme === 'dark'
                          ? 'bg-slate-800 border-slate-700 focus:border-emerald-500'
                          : readerTheme === 'sepia'
                          ? 'bg-[#ebd7b5] border-[#d8be93] focus:border-emerald-700'
                          : 'bg-white border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {readerDocSearch && (
                      <button
                        onClick={() => setReaderDocSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reader Body: Sidebar + Main Content + Notes Drawer */}
              <div className="flex-1 flex overflow-hidden relative">
                
                {/* Mobile Drawer Backdrop for Pages Index */}
                {showPageSidebar && (
                  <div 
                    onClick={() => setShowPageSidebar(false)}
                    className="md:hidden absolute inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
                  />
                )}

                {/* Left Sidebar: Pages Index List (Static on Desktop, Overlay Drawer on Mobile) */}
                <AnimatePresence initial={false}>
                  {showPageSidebar && (
                    <motion.div
                      initial={{ x: -280, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -280, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute md:static inset-y-0 left-0 z-40 md:z-auto w-72 max-w-[85vw] md:w-72 border-r p-3.5 flex flex-col overflow-y-auto shrink-0 shadow-2xl md:shadow-none ${
                        readerTheme === 'dark' ? 'border-slate-800 bg-slate-950 md:bg-slate-950/40' : readerTheme === 'sepia' ? 'border-[#e6d5ba] bg-[#f7e8ce]' : 'border-slate-200 bg-white md:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-black uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          Pages Index ({currentDocumentPages.length})
                        </h3>
                        <button
                          onClick={() => setShowPageSidebar(false)}
                          className="md:hidden p-1 rounded hover:bg-black/10 cursor-pointer opacity-70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Filter matching pages if search term is active */}
                      <div className="space-y-1.5 text-xs">
                        {currentDocumentPages.map((page, idx) => {
                          const isMatchesSearch = readerDocSearch && (
                            page.pageTitle.toLowerCase().includes(readerDocSearch.toLowerCase()) ||
                            page.chapterTitle.toLowerCase().includes(readerDocSearch.toLowerCase()) ||
                            page.content.toLowerCase().includes(readerDocSearch.toLowerCase())
                          );
                          const isBookmarked = userPageBookmarks[`${activeReadingItem.id}-p${page.pageNumber}`];
                          const hasNotes = Boolean(userPageNotes[`${activeReadingItem.id}-p${page.pageNumber}`]);

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setCurrentPageIndex(idx);
                                if (readerViewMode !== 'page') setReaderViewMode('page');
                                if (window.innerWidth < 768) setShowPageSidebar(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                                currentPageIndex === idx && readerViewMode === 'page'
                                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                                  : isMatchesSearch
                                  ? 'bg-amber-500/15 border-amber-500/40 font-semibold'
                                  : 'border-transparent hover:bg-black/5 opacity-85'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  currentPageIndex === idx && readerViewMode === 'page'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-black/10'
                                }`}>
                                  Page {page.pageNumber}
                                </span>
                                <div className="flex items-center gap-1">
                                  {isBookmarked && (
                                    <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  )}
                                  {hasNotes && (
                                    <StickyNote className="w-3 h-3 text-indigo-400" />
                                  )}
                                  {page.workedExamples && page.workedExamples.length > 0 && (
                                    <span className="text-[9px] px-1 rounded bg-indigo-500/20 font-bold">Worked Ex</span>
                                  )}
                                  {page.selfCheckQuestions && page.selfCheckQuestions.length > 0 && (
                                    <span className="text-[9px] px-1 rounded bg-amber-500/20 font-bold">ECZ Drill</span>
                                  )}
                                </div>
                              </div>
                              <div className="font-semibold text-xs leading-snug line-clamp-2">
                                {page.pageTitle}
                              </div>
                              <div className={`text-[10px] truncate ${currentPageIndex === idx && readerViewMode === 'page' ? 'text-emerald-100' : 'opacity-60'}`}>
                                {page.chapterTitle}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Reading Stage */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
                  {/* ==================================================== */}
                  {/* MODE 1: SINGLE PAGE BY PAGE BOOK LAYOUT */}
                  {/* ==================================================== */}
                  {readerViewMode === 'page' && currentDocumentPages[currentPageIndex] && (() => {
                    const page = currentDocumentPages[currentPageIndex];
                    const pageNoteKey = `${activeReadingItem.id}-p${page.pageNumber}`;
                    const isBookmarked = userPageBookmarks[pageNoteKey];

                    return (
                      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
                        {/* Page Top Header Card */}
                        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          readerTheme === 'dark'
                            ? 'bg-slate-950/60 border-slate-800'
                            : readerTheme === 'sepia'
                            ? 'bg-[#ebd7b5] border-[#d8be93]'
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                                Page {page.pageNumber} of {currentDocumentPages.length}
                              </span>
                              <span className="text-xs font-mono opacity-70">
                                {page.chapterTitle}
                              </span>
                            </div>
                            <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                              {page.pageTitle}
                            </h1>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setUserPageBookmarks(prev => ({ ...prev, [pageNoteKey]: !prev[pageNoteKey] }));
                                showToast(isBookmarked ? `Bookmark removed from Page ${page.pageNumber}` : `Page ${page.pageNumber} Bookmarked!`);
                              }}
                              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                isBookmarked
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                  : 'border-current/20 hover:bg-black/5'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Page'}</span>
                            </button>
                            <button
                              onClick={() => setShowPageNotes(true)}
                              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-current/20 hover:bg-black/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <StickyNote className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Page Notes</span>
                            </button>
                          </div>
                        </div>

                        {/* Callout Box if present */}
                        {page.calloutBox && (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${
                            page.calloutBox.type === 'tip'
                              ? readerTheme === 'dark' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : page.calloutBox.type === 'formula'
                              ? readerTheme === 'dark' ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                              : page.calloutBox.type === 'activity'
                              ? readerTheme === 'dark' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
                              : page.calloutBox.type === 'warning'
                              ? readerTheme === 'dark' ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-950'
                              : readerTheme === 'dark' ? 'bg-purple-950/30 border-purple-500/40 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-950'
                          }`}>
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider mb-2">
                              <BookOpen className="w-4 h-4 shrink-0" />
                              <span>{page.calloutBox.title}</span>
                            </div>
                            <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans opacity-90">
                              {page.calloutBox.content}
                            </div>
                          </div>
                        )}

                        {/* Main Page Content Body */}
                        <div className={`space-y-4 leading-relaxed font-serif whitespace-pre-line ${
                          readerFontSize === 'sm' ? 'text-xs sm:text-sm' : readerFontSize === 'lg' ? 'text-base sm:text-lg' : readerFontSize === 'xl' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                        }`}>
                          {page.content}
                        </div>

                        {/* Step-by-Step Worked Exemplars */}
                        {page.workedExamples && page.workedExamples.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-current/15">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                              <FileCheck2 className="w-4 h-4 shrink-0" />
                              CDC Worked Exemplar & Step-by-Step Methodology
                            </h3>
                            <div className="space-y-3">
                              {page.workedExamples.map((ex, exIdx) => {
                                const solutionKey = `ex-${page.pageNumber}-${exIdx}`;
                                const isRevealed = revealedSolutions[solutionKey];

                                return (
                                  <div
                                    key={exIdx}
                                    className={`p-4 sm:p-5 rounded-2xl border ${
                                      readerTheme === 'dark' ? 'bg-slate-950/40 border-slate-800' : readerTheme === 'sepia' ? 'bg-[#ebd7b5]/60 border-[#d8be93]' : 'bg-slate-50 border-slate-200'
                                    }`}
                                  >
                                    <div className="font-bold text-xs sm:text-sm mb-2 text-indigo-700 dark:text-indigo-300">
                                      {ex.title || ex.question || 'Worked Example'}
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium mb-3 whitespace-pre-line opacity-90">
                                      {ex.problemStatement || ex.question}
                                    </div>

                                    {/* Steps */}
                                    <div className="space-y-2 text-xs mb-3">
                                      {ex.steps.map((st, sIdx) => (
                                        <div key={sIdx} className="flex items-start gap-2 bg-black/5 p-2 rounded-lg font-mono">
                                          <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                                            {sIdx + 1}
                                          </span>
                                          <span className="leading-relaxed">{st}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Reveal Solution Button */}
                                    <button
                                      onClick={() => setRevealedSolutions(prev => ({ ...prev, [solutionKey]: !prev[solutionKey] }))}
                                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer flex items-center gap-1.5 py-1"
                                    >
                                      <span>{isRevealed ? 'Hide Final Output & Mark Scheme' : 'Reveal Final Output & Mark Scheme'}</span>
                                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRevealed ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isRevealed && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-1.5 text-emerald-800 dark:text-emerald-300"
                                      >
                                        <div className="font-bold uppercase text-[10px] tracking-wider">Official Output & Result:</div>
                                        <div className="font-bold">{ex.finalAnswer || ex.answer}</div>
                                        {ex.notes && <div className="text-[11px] opacity-80 font-sans">{ex.notes}</div>}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive Self Check & ECZ Practice Questions */}
                        {page.selfCheckQuestions && page.selfCheckQuestions.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-current/15">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 shrink-0" />
                              Examinations Council of Zambia (ECZ) Self-Check Drills
                            </h3>
                            <div className="space-y-3">
                              {page.selfCheckQuestions.map((q, qIdx) => {
                                const qKey = `q-${page.pageNumber}-${qIdx}`;
                                const isRevealed = revealedSolutions[qKey];

                                return (
                                  <div
                                    key={qIdx}
                                    className={`p-4 rounded-2xl border ${
                                      readerTheme === 'dark' ? 'bg-amber-950/20 border-amber-500/30' : readerTheme === 'sepia' ? 'bg-[#ebd7b5]/80 border-[#d8be93]' : 'bg-amber-50/70 border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="font-bold text-xs sm:text-sm">
                                        Question {qIdx + 1}: {q.question}
                                      </div>
                                      {q.marks && (
                                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] shrink-0">
                                          [{q.marks} Marks]
                                        </span>
                                      )}
                                    </div>

                                    {/* Reveal Answer Toggle */}
                                    <button
                                      onClick={() => setRevealedSolutions(prev => ({ ...prev, [qKey]: !prev[qKey] }))}
                                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1 mt-2"
                                    >
                                      <span>{isRevealed ? 'Hide Model Answer' : 'Show Answer & Explanation'}</span>
                                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRevealed ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isRevealed && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 p-3 rounded-xl bg-white/80 dark:bg-slate-900 border border-current/10 text-xs space-y-1"
                                      >
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">Model Answer:</div>
                                        <div className="font-mono text-xs">{q.answer}</div>
                                        {q.explanation && (
                                          <div className="text-[11px] opacity-75 mt-1 font-sans">
                                            <strong>Guidance:</strong> {q.explanation}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Key Takeaways Checklist */}
                        {page.keyTakeaways && page.keyTakeaways.length > 0 && (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${
                            readerTheme === 'dark' ? 'bg-slate-950/50 border-slate-800' : readerTheme === 'sepia' ? 'bg-[#ebd7b5]/50 border-[#d8be93]' : 'bg-emerald-50/50 border-emerald-200'
                          }`}>
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              Page Key Competencies & Summary
                            </h4>
                            <ul className="space-y-1.5 text-xs">
                              {page.keyTakeaways.map((kt, kIdx) => (
                                <li key={kIdx} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                  <span className="leading-snug">{kt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Page Footer Navigation Buttons */}
                        <div className="pt-5 sm:pt-6 border-t border-current/15 flex items-center justify-between gap-3">
                          <button
                            disabled={currentPageIndex === 0}
                            onClick={() => {
                              setCurrentPageIndex(prev => Math.max(0, prev - 1));
                            }}
                            className="px-3 sm:px-4 py-2.5 rounded-xl border border-current/20 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 text-xs font-bold transition-all"
                          >
                            <ChevronLeft className="w-4 h-4 shrink-0" />
                            <div className="text-left hidden xs:block">
                              <div className="text-[10px] opacity-60">Previous</div>
                              <div className="font-semibold truncate max-w-[100px] sm:max-w-[180px]">
                                {currentPageIndex > 0 ? currentDocumentPages[currentPageIndex - 1]?.pageTitle : 'Start'}
                              </div>
                            </div>
                            <span className="xs:hidden">Prev</span>
                          </button>

                          <div className="text-xs font-mono font-bold opacity-70 text-center">
                            Pg {page.pageNumber} / {currentDocumentPages.length}
                          </div>

                          <button
                            disabled={currentPageIndex >= currentDocumentPages.length - 1}
                            onClick={() => {
                              setCurrentPageIndex(prev => Math.min(currentDocumentPages.length - 1, prev + 1));
                            }}
                            className="px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 text-xs font-bold transition-all shadow-md"
                          >
                            <div className="text-right hidden xs:block">
                              <div className="text-[10px] opacity-80">Next</div>
                              <div className="font-semibold truncate max-w-[100px] sm:max-w-[180px]">
                                {currentPageIndex < currentDocumentPages.length - 1 ? currentDocumentPages[currentPageIndex + 1]?.pageTitle : 'End'}
                              </div>
                            </div>
                            <span className="xs:hidden">Next</span>
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ==================================================== */}
                  {/* MODE 2: CONTINUOUS SCROLL (ALL PAGES IN SEQUENCE) */}
                  {/* ==================================================== */}
                  {readerViewMode === 'continuous' && (
                    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
                      <div className="text-center py-4 border-b border-current/15">
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase">
                          Continuous Reading View ({currentDocumentPages.length} Pages)
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black mt-2 leading-tight">{activeReadingItem.title}</h1>
                        <p className="text-xs opacity-75 font-mono mt-1">{activeReadingItem.code} • CDC Standard Curriculum</p>
                      </div>

                      {currentDocumentPages.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          id={`page-node-${pIdx}`}
                          className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border space-y-5 sm:space-y-6 ${
                            readerTheme === 'dark'
                              ? 'bg-slate-950/40 border-slate-800'
                              : readerTheme === 'sepia'
                              ? 'bg-[#ebd7b5]/50 border-[#d8be93]'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b pb-3 border-current/10">
                            <div>
                              <span className="text-[10px] font-mono uppercase opacity-70">
                                {p.chapterTitle}
                              </span>
                              <h2 className="text-base sm:text-lg font-black">{p.pageTitle}</h2>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0">
                              Page {p.pageNumber}
                            </span>
                          </div>

                          {p.calloutBox && (
                            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                              <strong className="block mb-1">{p.calloutBox.title}:</strong>
                              <span className="whitespace-pre-line leading-relaxed">{p.calloutBox.content}</span>
                            </div>
                          )}

                          <div className={`whitespace-pre-line font-serif leading-relaxed ${
                            readerFontSize === 'sm' ? 'text-xs' : readerFontSize === 'lg' ? 'text-base' : readerFontSize === 'xl' ? 'text-lg' : 'text-sm'
                          }`}>
                            {p.content}
                          </div>

                          {p.workedExamples && p.workedExamples.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-current/10 text-xs">
                              <div className="font-bold text-indigo-600">Worked Exemplar: {p.workedExamples[0].title || p.workedExamples[0].question || 'Exemplar'}</div>
                              <div className="p-3 bg-black/5 rounded-xl font-mono text-xs leading-relaxed">
                                {p.workedExamples[0].steps.join('\n')}
                              </div>
                            </div>
                          )}

                          {p.keyTakeaways && (
                            <div className="text-xs pt-3 border-t border-current/10 space-y-1">
                              <span className="font-bold opacity-75">Key Competencies:</span>
                              {p.keyTakeaways.map((kt, i) => (
                                <div key={i} className="flex items-center gap-1.5 opacity-80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                  <span>{kt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* MODE 3: PRACTICE DRILLS & QUESTIONS CONSOLE */}
                  {/* ==================================================== */}
                  {readerViewMode === 'drills' && (
                    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
                      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/15 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wider">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                          <span>ECZ Examination Drills & Revision Hub</span>
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed">
                          This mode compiles all step-by-step worked exemplars and self-check assessment questions across all {currentDocumentPages.length} pages of <strong>{activeReadingItem.title}</strong> for intensive exam preparation.
                        </p>
                      </div>

                      {/* Consolidate all questions */}
                      <div className="space-y-3 sm:space-y-4">
                        {currentDocumentPages.flatMap((page) => 
                          (page.selfCheckQuestions || []).map((q, qIdx) => {
                            const qKey = `drill-p${page.pageNumber}-q${qIdx}`;
                            const isRevealed = revealedSolutions[qKey];

                            return (
                              <div
                                key={qKey}
                                className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                                  readerTheme === 'dark' ? 'bg-slate-950/50 border-slate-800' : readerTheme === 'sepia' ? 'bg-[#ebd7b5]/60 border-[#d8be93]' : 'bg-white border-slate-200 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs gap-2">
                                  <span className="px-2 py-0.5 rounded bg-black/10 font-mono font-bold text-[11px] truncate">
                                    Page {page.pageNumber} • {page.pageTitle}
                                  </span>
                                  {q.marks && (
                                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] shrink-0">
                                      {q.marks} Marks
                                    </span>
                                  )}
                                </div>

                                <div className="font-bold text-xs sm:text-sm leading-snug">
                                  {q.question}
                                </div>

                                <button
                                  onClick={() => setRevealedSolutions(prev => ({ ...prev, [qKey]: !prev[qKey] }))}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
                                >
                                  <span>{isRevealed ? 'Hide Model Solution' : 'Reveal Solution & ECZ Criteria'}</span>
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRevealed ? 'rotate-90' : ''}`} />
                                </button>

                                {isRevealed && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5"
                                  >
                                    <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase text-[10px]">
                                      Model Answer:
                                    </div>
                                    <div className="font-mono text-xs">{q.answer}</div>
                                    {q.explanation && (
                                      <div className="text-[11px] opacity-80 mt-1">
                                        <strong>CDC Marking Notes:</strong> {q.explanation}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Drawer Backdrop for Notes */}
                {showPageNotes && (
                  <div 
                    onClick={() => setShowPageNotes(false)}
                    className="md:hidden absolute inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
                  />
                )}

                {/* Right Drawer: Study Notes on current page (Static on Desktop, Overlay Drawer on Mobile) */}
                <AnimatePresence>
                  {showPageNotes && (
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute md:static inset-y-0 right-0 z-40 md:z-auto w-80 max-w-[90vw] border-l p-4 flex flex-col shrink-0 overflow-y-auto shadow-2xl md:shadow-none ${
                        readerTheme === 'dark' ? 'border-slate-800 bg-slate-950 md:bg-slate-950/60' : readerTheme === 'sepia' ? 'border-[#e6d5ba] bg-[#f7e8ce]' : 'border-slate-200 bg-white md:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <StickyNote className="w-4 h-4 text-indigo-500" />
                          <span>Page {currentPageIndex + 1} Notes</span>
                        </div>
                        <button
                          onClick={() => setShowPageNotes(false)}
                          className="p-1 rounded hover:bg-black/10 cursor-pointer opacity-70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] opacity-70 mb-2">
                        Write personal study observations, formula reminders, or lesson plans for this specific page. Auto-saved locally.
                      </p>

                      <textarea
                        rows={10}
                        placeholder="Type your notes here for Page ..."
                        value={userPageNotes[`${activeReadingItem.id}-p${currentPageIndex + 1}`] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUserPageNotes(prev => ({
                            ...prev,
                            [`${activeReadingItem.id}-p${currentPageIndex + 1}`]: val
                          }));
                        }}
                        className={`w-full p-3 rounded-xl text-xs border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                          readerTheme === 'dark'
                            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                            : readerTheme === 'sepia'
                            ? 'bg-[#ebd7b5] border-[#d8be93] text-[#3d2f1f]'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />

                      <div className="mt-3 flex items-center justify-between text-[11px] opacity-60">
                        <span>Auto-saved</span>
                        <button
                          onClick={() => {
                            setUserPageNotes(prev => {
                              const updated = { ...prev };
                              delete updated[`${activeReadingItem.id}-p${currentPageIndex + 1}`];
                              return updated;
                            });
                            showToast(`Cleared notes for Page ${currentPageIndex + 1}`);
                          }}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reader Footer Bar */}
              <div className={`px-3 sm:px-6 py-2.5 border-t flex items-center justify-between text-xs shrink-0 ${
                readerTheme === 'dark' ? 'border-slate-800 bg-slate-950/70' : readerTheme === 'sepia' ? 'border-[#e6d5ba] bg-[#f5e5c9]' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center gap-2 opacity-70">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">EDUZAM Multi-Page Reader • Official CDC CBC Syllabus</span>
                  <span className="sm:hidden font-mono text-[10px]">Pg {currentPageIndex + 1}/{currentDocumentPages.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast(`Exporting formatted PDF for ${activeReadingItem.title}...`);
                      window.print();
                    }}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    onClick={() => setActiveReadingItem(null)}
                    className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* OFFICIAL MOE PORTALS DETAILS MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPortalsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Globe className="w-4 h-4" />
                    National & International Portals Directory
                  </div>
                  <h2 className="text-lg sm:text-xl font-black">Official Ministry of Education E-Portals</h2>
                </div>
                <button
                  onClick={() => setShowPortalsModal(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Direct government gateways for official syllabus documents, e-learning platforms, teacher registration, digital library service archives, and open educational resources.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {OFFICIAL_PORTALS.map((portal) => (
                    <div
                      key={portal.id}
                      className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
                            {portal.category}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {portal.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800">
                          {portal.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                          {portal.description}
                        </p>

                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Portals & Features:</span>
                          <ul className="grid grid-cols-2 gap-1 text-xs text-slate-700">
                            {portal.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 truncate font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">{portal.established}</span>
                        <a
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs"
                        >
                          <span>Launch Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setShowPortalsModal(false)}
                  className="px-5 py-2 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* CONTRIBUTE / UPLOAD MATERIAL MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <PlusCircle className="w-4 h-4" />
                    Teacher & Institutional Contribution
                  </div>
                  <h2 className="text-lg sm:text-xl font-black">Publish New Educational Material</h2>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUpload} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Form 4 Physics: Wave Motion & Sound Notes"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="modules">Module (Form 1 - Form 6)</option>
                      <option value="books">Book / Reference Textbook</option>
                      <option value="past_papers">Past Paper / Examination Kit</option>
                      <option value="school_info">School Info & Guidelines</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Level *
                    </label>
                    <select
                      value={uploadLevel}
                      onChange={(e: any) => setUploadLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="Primary">Primary (Grade 1 - 7)</option>
                      <option value="Form 1">Form 1 (Grade 8)</option>
                      <option value="Form 2">Form 2 (Grade 9)</option>
                      <option value="Form 3">Form 3 (Grade 10)</option>
                      <option value="Form 4">Form 4 (Grade 11)</option>
                      <option value="Form 5">Form 5 (Grade 12)</option>
                      <option value="Form 6">Form 6 / A-Level</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      placeholder="e.g. Physics"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      value={uploadCode}
                      onChange={(e) => setUploadCode(e.target.value)}
                      placeholder="e.g. SCH-MOD-F4-01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Estimated Size
                    </label>
                    <input
                      type="text"
                      value={uploadFileSize}
                      onChange={(e) => setUploadFileSize(e.target.value)}
                      placeholder="e.g. 5.2 MB"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Summary & Learning Outcomes
                  </label>
                  <textarea
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Briefly describe what competencies or topics this resource covers..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                </div>

                <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                  <FolderDown className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs sm:text-sm text-slate-700 font-bold">
                    Upload PDF / EPUB / Document Package
                  </div>
                  <div className="text-xs text-slate-500">
                    Supports PDF, EPUB, DOCX up to 50MB (Automatically indexed and cached)
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish to Digital Library</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
