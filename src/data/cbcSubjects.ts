import { CBCSubjectDefinition } from '../types';

export const ALL_CBC_SUBJECTS: CBCSubjectDefinition[] = [
  // --- SCIENCES & MATHEMATICS (STEM) ---
  {
    name: 'Mathematics',
    code: 'MATH-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'All Levels',
    description: 'Numeracy, algebraic reasoning, geometry, statistics, and functional problem-solving.'
  },
  {
    name: 'Additional Mathematics',
    code: 'ADDMATH-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'Senior Secondary',
    description: 'Advanced calculus, coordinate geometry, trigonometry, and mathematical modeling.'
  },
  {
    name: 'Integrated Science',
    code: 'INTSCI-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'Junior Secondary',
    description: 'Foundational natural science principles spanning physical, biological, and earth systems.'
  },
  {
    name: 'Biology',
    code: 'BIO-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'Senior Secondary',
    description: 'Cell biology, genetics, ecology, plant and human physiology with lab practical investigations.'
  },
  {
    name: 'Chemistry',
    code: 'CHEM-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'Senior Secondary',
    description: 'Atomic structure, chemical reactions, organic chemistry, stoichiometry, and industrial processes.'
  },
  {
    name: 'Physics',
    code: 'PHYS-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'Senior Secondary',
    description: 'Mechanics, thermodynamics, wave optics, electricity, electromagnetism, and atomic physics.'
  },
  {
    name: 'Computer Studies & ICT',
    code: 'ICT-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'All Levels',
    description: 'Digital literacy, computer systems, algorithms, basic programming, and data security.'
  },
  {
    name: 'Agricultural Science',
    code: 'AGRI-CBC',
    category: 'Sciences & Mathematics (STEM)',
    level: 'All Levels',
    description: 'Crop production, animal husbandry, soil science, farm machinery, and agribusiness.'
  },

  // --- LANGUAGES & LITERATURE ---
  {
    name: 'English Language',
    code: 'ENG-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Comprehensive listening, reading comprehension, essay writing, grammar, and communicative skills.'
  },
  {
    name: 'Literature in English',
    code: 'LIT-CBC',
    category: 'Languages & Literature',
    level: 'Senior Secondary',
    description: 'Critical analysis of prose, drama, poetry, Zambian and African literary texts.'
  },
  {
    name: 'Icibemba Language & Culture',
    code: 'BEM-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: orthography, oral traditions, proverbs, and creative writing.'
  },
  {
    name: 'Cinyanja Language & Culture',
    code: 'NYA-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: grammar, cultural heritage, folklore, and composition.'
  },
  {
    name: 'Chitonga Language & Culture',
    code: 'TON-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: linguistic structure, idioms, culture, and literature.'
  },
  {
    name: 'Silozi Language & Culture',
    code: 'LOZ-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: vocabulary, traditional customs, poetry, and grammar.'
  },
  {
    name: 'Kiikaonde Language & Culture',
    code: 'KAO-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: phonology, syntax, historical narratives, and folklore.'
  },
  {
    name: 'Lunda Language & Culture',
    code: 'LUN-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: cultural studies, language structure, and literature.'
  },
  {
    name: 'Luvale Language & Culture',
    code: 'LUV-CBC',
    category: 'Languages & Literature',
    level: 'All Levels',
    description: 'Zambian official national language: grammar, oral art forms, and linguistic expression.'
  },
  {
    name: 'French Language Studies',
    code: 'FRE-CBC',
    category: 'Languages & Literature',
    level: 'Junior Secondary',
    description: 'Foreign language competence: conversation, reading, writing, and international culture.'
  },

  // --- SOCIAL SCIENCES & HUMANITIES ---
  {
    name: 'Civic Education',
    code: 'CIV-CBC',
    category: 'Social Sciences & Humanities',
    level: 'All Levels',
    description: 'Constitution, human rights, democratic governance, rule of law, citizenship, and global issues.'
  },
  {
    name: 'Social Studies',
    code: 'SOC-CBC',
    category: 'Social Sciences & Humanities',
    level: 'Junior Secondary',
    description: 'Integrated historical, geographic, cultural, and civic community studies.'
  },
  {
    name: 'History',
    code: 'HIST-CBC',
    category: 'Social Sciences & Humanities',
    level: 'Senior Secondary',
    description: 'Zambian pre-colonial & post-colonial history, Central African history, and World affairs.'
  },
  {
    name: 'Geography',
    code: 'GEO-CBC',
    category: 'Social Sciences & Humanities',
    level: 'Senior Secondary',
    description: 'Physical geography, cartography/map work, climate, environmental resource management.'
  },
  {
    name: 'Religious Education (2046)',
    code: 'RE2046-CBC',
    category: 'Social Sciences & Humanities',
    level: 'All Levels',
    description: 'Christian living today, ethical dilemmas, biblical teachings, and multi-faith comparative values.'
  },
  {
    name: 'Religious Education (2044)',
    code: 'RE2044-CBC',
    category: 'Social Sciences & Humanities',
    level: 'Senior Secondary',
    description: 'The gospel traditions, church history, moral education, and social justice.'
  },

  // --- BUSINESS & FINANCIAL LITERACY ---
  {
    name: 'Commerce & Entrepreneurship',
    code: 'COMM-CBC',
    category: 'Business & Financial Literacy',
    level: 'All Levels',
    description: 'Trade, banking, transport, insurance, e-commerce, business planning, and innovation.'
  },
  {
    name: 'Principles of Accounts',
    code: 'ACC-CBC',
    category: 'Business & Financial Literacy',
    level: 'Senior Secondary',
    description: 'Double-entry bookkeeping, financial statements, bank reconciliation, trial balance, and auditing.'
  },
  {
    name: 'Business Studies',
    code: 'BUS-CBC',
    category: 'Business & Financial Literacy',
    level: 'Junior Secondary',
    description: 'Foundations of business environment, financial literacy, office practice, and record keeping.'
  },
  {
    name: 'Economics',
    code: 'ECON-CBC',
    category: 'Business & Financial Literacy',
    level: 'Senior Secondary',
    description: 'Microeconomics, macroeconomics, fiscal policies, money and banking, international trade.'
  },

  // --- TECHNICAL, PRACTICAL & VOCATIONAL (TEVET PATHWAY) ---
  {
    name: 'Design and Technology (D&T)',
    code: 'DT-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'All Levels',
    description: 'Engineering design process, material testing, prototyping, CAD, and technological innovation.'
  },
  {
    name: 'Geometrical & Mechanical Drawing (GMD)',
    code: 'GMD-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'Senior Secondary',
    description: 'Orthographic projections, isometric drawing, machine components, assembly drafting.'
  },
  {
    name: 'Technical Drawing (TD)',
    code: 'TD-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'Junior Secondary',
    description: 'Drafting instruments, scales, geometric construction, dimensioning, and sectioning.'
  },
  {
    name: 'Woodwork Technology & Carpentry',
    code: 'WOOD-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'All Levels',
    description: 'Timber joints, wood machining, cabinet making, safety standards, and furniture design.'
  },
  {
    name: 'Metalwork Technology & Fabrication',
    code: 'MET-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'All Levels',
    description: 'Sheet metal, fitting, lathe turning, welding, heat treatment, and fabrication practicals.'
  },
  {
    name: 'Building Construction Technology',
    code: 'BLD-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'Senior Secondary',
    description: 'Masonry, bricklaying, concrete technology, roofing systems, foundation engineering.'
  },
  {
    name: 'Electrical & Electronics Technology',
    code: 'ELEC-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'Senior Secondary',
    description: 'Circuit analysis, domestic installation, electronic components, sensors, and renewable energy.'
  },
  {
    name: 'Automotive Mechanics',
    code: 'AUTO-CBC',
    category: 'Technical, Practical & Vocational',
    level: 'Senior Secondary',
    description: 'Internal combustion engines, braking systems, transmission, electrical diagnostics.'
  },

  // --- CREATIVE ARTS, HOSPITALITY & PHYSICAL WELL-BEING ---
  {
    name: 'Food and Nutrition',
    code: 'FOOD-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Nutritional science, food chemistry, diet planning, culinary techniques, and food hygiene.'
  },
  {
    name: 'Fashion and Fabrics',
    code: 'FASH-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Textile science, garment construction, pattern drafting, fashion design, and embroidery.'
  },
  {
    name: 'Home Management & Hospitality',
    code: 'HOME-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Family resource management, interior decoration, consumer education, and hospitality skills.'
  },
  {
    name: 'Art and Design',
    code: 'ART-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Drawing, painting, sculpture, graphic design, printmaking, and Zambian indigenous crafts.'
  },
  {
    name: 'Musical Arts & Performance',
    code: 'MUS-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Music theory, vocal training, traditional Zambian instruments (Silimba, Kalimba), audio production.'
  },
  {
    name: 'Physical Education & Sports Science (PE)',
    code: 'PE-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'All Levels',
    description: 'Sports physiology, biomechanics, athletics, team sports tactics, fitness, and first aid.'
  },
  {
    name: 'Expressive Arts & Life Skills',
    code: 'EXP-CBC',
    category: 'Creative Arts & Physical Well-being',
    level: 'Primary',
    description: 'Creative drama, movement, storytelling, emotional intelligence, and interpersonal skills.'
  }
];

export const CBC_CATEGORIES = [
  'All Categories',
  'Sciences & Mathematics (STEM)',
  'Languages & Literature',
  'Social Sciences & Humanities',
  'Business & Financial Literacy',
  'Technical, Practical & Vocational',
  'Creative Arts & Physical Well-being'
] as const;

// Helper to get subjects by grade pathway
export function getRecommendedCBCSubjects(grade: string, stream?: string): string[] {
  const gNum = parseInt(grade.replace(/\D/g, ''), 10) || 10;

  if (gNum <= 7) {
    return [
      'Mathematics',
      'English Language',
      'Integrated Science',
      'Social Studies',
      'Icibemba Language & Culture',
      'Expressive Arts & Life Skills',
      'Physical Education & Sports Science (PE)',
      'Computer Studies & ICT'
    ];
  }

  if (gNum <= 9) {
    return [
      'Mathematics',
      'English Language',
      'Integrated Science',
      'Social Studies',
      'Civic Education',
      'Computer Studies & ICT',
      'Agricultural Science',
      'Commerce & Entrepreneurship',
      'Icibemba Language & Culture',
      'Physical Education & Sports Science (PE)'
    ];
  }

  // Grade 10 - 12 by Stream
  const sLower = (stream || '').toLowerCase();
  if (sLower.includes('science') || sLower.includes('stem')) {
    return [
      'Mathematics',
      'English Language',
      'Biology',
      'Chemistry',
      'Physics',
      'Civic Education',
      'Computer Studies & ICT',
      'Additional Mathematics',
      'Agricultural Science'
    ];
  }

  if (sLower.includes('commercial') || sLower.includes('business')) {
    return [
      'Mathematics',
      'English Language',
      'Commerce & Entrepreneurship',
      'Principles of Accounts',
      'Economics',
      'Civic Education',
      'Computer Studies & ICT',
      'Geography'
    ];
  }

  if (sLower.includes('art') || sLower.includes('humanities') || sLower.includes('social')) {
    return [
      'English Language',
      'Mathematics',
      'History',
      'Geography',
      'Civic Education',
      'Religious Education (2046)',
      'Literature in English',
      'Icibemba Language & Culture',
      'Art and Design'
    ];
  }

  if (sLower.includes('tech') || sLower.includes('vocational') || sLower.includes('practical')) {
    return [
      'Mathematics',
      'English Language',
      'Physics',
      'Design and Technology (D&T)',
      'Geometrical & Mechanical Drawing (GMD)',
      'Woodwork Technology & Carpentry',
      'Computer Studies & ICT',
      'Civic Education'
    ];
  }

  // Default Senior Secondary CBC Load
  return [
    'Mathematics',
    'English Language',
    'Biology',
    'Chemistry',
    'Physics',
    'Civic Education',
    'Commerce & Entrepreneurship',
    'Computer Studies & ICT'
  ];
}
