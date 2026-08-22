/**
 * EDUZAM National & International Digital Library Repository
 * Ministry of Education, Curriculum Development Centre (CDC), Zambia Library Service (ZLS),
 * Examinations Council of Zambia (ECZ), and International Open Educational Resources.
 */

export interface DocumentPage {
  pageNumber: number;
  pageTitle: string;
  chapterTitle?: string;
  content: string;
  keyTakeaways?: string[];
  calloutBox?: {
    title: string;
    type: 'tip' | 'formula' | 'activity' | 'warning' | 'ecz_exam';
    content: string;
  };
  workedExamples?: {
    title?: string;
    problemStatement?: string;
    question?: string;
    steps: string[];
    answer?: string;
    finalAnswer?: string;
    notes?: string;
  }[];
  selfCheckQuestions?: {
    question: string;
    answer: string;
    marks?: string;
    explanation?: string;
  }[];
}

export interface LibraryItem {
  id: string;
  title: string;
  category: 'modules' | 'books' | 'past_papers' | 'school_info' | 'teaching_resources';
  level: 'Primary' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Form 5' | 'Form 6' | 'All Levels' | 'Tertiary';
  subCategory?: string;
  subject: string;
  code: string;
  publisher: string;
  author: string;
  year: string;
  pages: string;
  fileSize: string;
  fileFormat: 'PDF' | 'EPUB' | 'ZIP' | 'INTERACTIVE';
  downloadCount: number;
  rating: number;
  isOfficialMoE: boolean;
  isInternational: boolean;
  featured?: boolean;
  coverImageGradient: string;
  description: string;
  tableOfContents?: string[];
  learningOutcomes?: string[];
  sampleContent?: string;
  pagesList?: DocumentPage[];
  externalLink?: string;
}

export interface ExternalPortal {
  id: string;
  name: string;
  shortName: string;
  category: 'Government' | 'E-Learning' | 'Curriculum' | 'Digital Library' | 'International OER';
  badgeText: string;
  description: string;
  features: string[];
  url: string;
  logoColor: string;
  established: string;
  status: 'ONLINE' | 'ACTIVE' | 'OFFICIAL';
}

export const OFFICIAL_PORTALS: ExternalPortal[] = [
  {
    id: 'moe-portal',
    name: 'Ministry of Education Official Portal',
    shortName: 'MoE Zambia Portal',
    category: 'Government',
    badgeText: 'Official State Portal',
    description: 'The primary Government portal providing national educational policies, administrative services, e-learning resources, teacher registration, and CBC curriculum materials.',
    features: ['CBC Framework Documents', 'Teacher Management Service', 'National Bursaries & CDF', 'Directives & Gazettes'],
    url: 'https://www.edu.gov.zm',
    logoColor: 'from-emerald-800 to-teal-950',
    established: 'Republic of Zambia',
    status: 'OFFICIAL'
  },
  {
    id: 'moe-elearning-suite',
    name: 'Zambia MoE E-Learning Portals Suite',
    shortName: 'MoE E-Learning Suite',
    category: 'E-Learning',
    badgeText: 'National E-Learning',
    description: 'Comprehensive digital learning umbrella including e-Learning Zambia, Learning Passport (UNICEF/MoE), NotesMaster Zambia, and the National STEM Center (NSC) Portal.',
    features: ['Learning Passport (Primary & Secondary)', 'NotesMaster CBC Teacher Networks', 'NSC STEM Virtual Labs', 'Interactive Video Lessons'],
    url: 'https://www.edu.gov.zm/elearning',
    logoColor: 'from-blue-800 to-indigo-950',
    established: 'MoE & UNICEF Partnership',
    status: 'ONLINE'
  },
  {
    id: 'cdc-curriculum',
    name: 'Curriculum Development Centre (CDC)',
    shortName: 'CDC Curriculum Hub',
    category: 'Curriculum',
    badgeText: 'Curriculum Standards',
    description: 'The statutory body mandated to formulate, review, and evaluate the national Competence-Based Curriculum (CBC), syllabi specifications, schemes of work, and teacher guides.',
    features: ['Approved Syllabi Grade 1-12', 'Weekly Schemes of Work', 'Competence Assessment Rubrics', 'Textbook Evaluation Lists'],
    url: 'https://www.edu.gov.zm/curriculum-development-centre',
    logoColor: 'from-amber-800 to-orange-950',
    established: 'CDC Directorate',
    status: 'OFFICIAL'
  },
  {
    id: 'zambia-national-digital-library',
    name: 'Zambia National Digital Library (ZLS)',
    shortName: 'Zambia Library Service',
    category: 'Digital Library',
    badgeText: 'National Digital Library',
    description: 'Launched by the Government under the Zambia Library Service (ZLS) / Ministry of Education, hosting thousands of e-books, open research archives, and educational collections.',
    features: ['National E-Book Repository', 'Zambian Heritage & Literature', 'Research Papers & Theses', 'Public & School E-Access'],
    url: 'https://www.zambialibraryservice.gov.zm',
    logoColor: 'from-purple-800 to-slate-950',
    established: 'National Launch 2026',
    status: 'ACTIVE'
  },
  {
    id: 'ecz-portal',
    name: 'Examinations Council of Zambia (ECZ)',
    shortName: 'ECZ Assessment Portal',
    category: 'Government',
    badgeText: 'National Examinations',
    description: 'The official national examination authority regulating G7, G9, G12, and GCE examinations, past examination series, candidate portals, and e-statement verification.',
    features: ['Official Exam Timetables', 'Candidate E-Registration', 'Syllabus Assessment Blueprints', 'Verified Results Service'],
    url: 'https://www.exams-council.org.zm',
    logoColor: 'from-cyan-800 to-slate-950',
    established: 'ECZ Act of Parliament',
    status: 'OFFICIAL'
  },
  {
    id: 'unesco-oer-africa',
    name: 'UNESCO & OER Africa Digital Hub',
    shortName: 'International OER Hub',
    category: 'International OER',
    badgeText: 'Global Open Education',
    description: 'International open educational repository offering peer-reviewed textbooks, STEM simulations, African storybooks, and university open courseware.',
    features: ['OpenStax Peer-Reviewed Textbooks', 'MIT OpenCourseWare STEM Modules', 'African Storybook Multilingual Readers', 'Global Digital Library'],
    url: 'https://www.oerafrica.org',
    logoColor: 'from-sky-800 to-blue-950',
    established: 'International UNESCO OER',
    status: 'ACTIVE'
  }
];

import { OFFICIAL_CDC_MODULES } from './officialCdcModules';
import { MASSIVE_LIBRARY_ITEMS } from './massiveLibraryPages';
import { CURRICULUM_5000_LIBRARY_ITEMS } from './massiveCurriculum5000Pages';

export const INITIAL_LIBRARY_DATABASE: LibraryItem[] = [
  // ==========================================
  // 5,000+ PAGES COMPREHENSIVE NATIONAL COMPENDIUMS & MASTER VOLUMES
  // ==========================================
  ...CURRICULUM_5000_LIBRARY_ITEMS,

  // ==========================================
  // 1,000+ PAGES COMPREHENSIVE NATIONAL COMPENDIUMS & MASTER TEXTBOOKS
  // ==========================================
  ...MASSIVE_LIBRARY_ITEMS,

  // ==========================================
  // OFFICIAL CDC TEACHING MODULES (AUTHENTIC REPOSITORY)
  // ==========================================
  ...OFFICIAL_CDC_MODULES,

  // ==========================================
  // MODULES: FORM 1 TO FORM 6 + PRIMARY
  // ==========================================
  {
    id: 'mod-f1-math-01',
    title: 'Form 1 Mathematics: Algebraic Expressions & Linear Equations',
    category: 'modules',
    level: 'Form 1',
    subject: 'Mathematics',
    code: 'CDC-MOD-F1-M01',
    publisher: 'Ministry of Education CDC & National E-Learning Directorate',
    author: 'National Mathematics Curriculum Panel',
    year: '2026',
    pages: '64 pages',
    fileSize: '4.8 MB',
    fileFormat: 'PDF',
    downloadCount: 14200,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-emerald-700 via-teal-900 to-slate-900',
    description: 'Comprehensive Form 1 (Grade 8) mastery module covering algebraic notation, simplifying terms, single-variable equations, and contextual problem-solving.',
    learningOutcomes: [
      'Represent real-world quantities using algebraic variables and expressions.',
      'Group and simplify like and unlike algebraic terms accurately.',
      'Apply balance properties to solve linear equations in one variable.',
      'Formulate and solve algebraic word problems drawn from everyday Zambian commerce.'
    ],
    tableOfContents: [
      'Unit 1: Introduction to Algebraic Variables & Constants',
      'Unit 2: Simplifying Expressions with Parentheses & Brackets',
      'Unit 3: Solving Single-Variable Linear Equations',
      'Unit 4: Fractional Coefficients & Lowest Common Denominators',
      'Unit 5: Real-World Applications & Word Problems',
      'Unit 6: Self-Assessment Mastery Check & Past ECZ Questions'
    ],
    sampleContent: `FORM 1 MATHEMATICS MODULE 1.1\n\n1. Algebraic Foundations:\nAlgebra is the universal language of mathematics where unknown quantities are represented by variables (such as x, y, z). An algebraic term consists of a coefficient, a variable, and an exponent (e.g. in 4x², 4 is the coefficient, x is the variable, and 2 is the power).\n\n2. The Golden Rule of Equation Solving:\nWhatever mathematical operation is performed on the left-hand side of an equation MUST be equally performed on the right-hand side to maintain numerical equilibrium.\nExample: 3x + 15 = 45\nStep 1: Subtract 15 from both sides: 3x = 30\nStep 2: Divide both sides by 3: x = 10.`
  },
  {
    id: 'mod-f1-sci-02',
    title: 'Form 1 Integrated Science: Cells, Matter & Living Organisms',
    category: 'modules',
    level: 'Form 1',
    subject: 'Integrated Science',
    code: 'CDC-MOD-F1-S02',
    publisher: 'Ministry of Education CDC',
    author: 'National Science Curriculum Specialist Panel',
    year: '2026',
    pages: '56 pages',
    fileSize: '6.2 MB',
    fileFormat: 'PDF',
    downloadCount: 11800,
    rating: 4.8,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-teal-700 via-emerald-900 to-slate-900',
    description: 'Foundational Form 1 science module exploring plant and animal cell ultrastructure, microscopy, states of matter, and ecological interdependence.',
    learningOutcomes: [
      'Identify plant and animal cell structures under light microscopy.',
      'Distinguish between cell walls, cell membranes, nuclei, chloroplasts, and vacuoles.',
      'Explain the kinetic particle theory of matter across solids, liquids, and gases.',
      'Construct ecological food chains and food webs in Zambian ecosystems.'
    ],
    tableOfContents: [
      'Unit 1: Microscopy & Cell Theory',
      'Unit 2: Plant vs. Animal Cells & Organelle Specialization',
      'Unit 3: The Particle Theory of Matter & Phase Changes',
      'Unit 4: Elements, Compounds and Simple Mixtures',
      'Unit 5: Ecosystems, Energy Flow & Food Security',
      'Unit 6: Laboratory Practical Skills & Safety Guidelines'
    ]
  },
  {
    id: 'mod-f2-math-01',
    title: 'Form 2 Mathematics: Coordinate Geometry & Transformation Matrices',
    category: 'modules',
    level: 'Form 2',
    subject: 'Mathematics',
    code: 'CDC-MOD-F2-M01',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'MoE Senior Secondary Panel',
    year: '2026',
    pages: '72 pages',
    fileSize: '5.5 MB',
    fileFormat: 'PDF',
    downloadCount: 16500,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-blue-700 via-indigo-900 to-slate-900',
    description: 'Form 2 (Grade 9) core module preparing students for the Junior Secondary School Leaving Examination (JSSLE). Covers gradient, straight line graphs, reflections, rotations, and translations.',
    learningOutcomes: [
      'Plot coordinates in all four quadrants and calculate line gradients.',
      'Formulate linear equations in slope-intercept form y = mx + c.',
      'Perform 2D geometric transformations: translation vectors, reflections across axes, and rotation matrices.',
      'Solve simultaneous linear equations graphically and algebraically.'
    ],
    tableOfContents: [
      'Unit 1: Cartesian Plane & Coordinate Plotting',
      'Unit 2: Gradient, Midpoint and Distance Formulas',
      'Unit 3: Equations of Straight Lines (y = mx + c)',
      'Unit 4: Geometric Transformations (Translation, Reflection, Rotation)',
      'Unit 5: Simultaneous Linear Equations',
      'Unit 6: ECZ Grade 9 Examination Review Drills'
    ]
  },
  {
    id: 'mod-f2-eng-02',
    title: 'Form 2 English Language: Functional Writing, Grammar & Comprehension',
    category: 'modules',
    level: 'Form 2',
    subject: 'English Language',
    code: 'CDC-MOD-F2-E02',
    publisher: 'Zambia Educational Publishing House (ZEPH) / MoE',
    author: 'National Language Council',
    year: '2025',
    pages: '68 pages',
    fileSize: '3.9 MB',
    fileFormat: 'PDF',
    downloadCount: 9700,
    rating: 4.7,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-indigo-700 via-blue-900 to-slate-900',
    description: 'Comprehensive Form 2 language proficiency module focusing on formal letter writing, report synthesis, active/passive voice transformations, and reading comprehension strategies.',
    learningOutcomes: [
      'Draft formal business letters, notices, and official school reports.',
      'Apply correct grammatical tenses, subject-verb agreement, and direct/indirect speech.',
      'Extract explicit and implicit inferences from continuous prose passages.'
    ]
  },
  {
    id: 'mod-f3-phy-01',
    title: 'Form 3 Physics: Newtonian Mechanics, Vectors, Dynamics & Energy',
    category: 'modules',
    level: 'Form 3',
    subject: 'Physics',
    code: 'CDC-MOD-F3-P01',
    publisher: 'National STEM Centre & CDC',
    author: 'Senior Physics Working Group',
    year: '2026',
    pages: '88 pages',
    fileSize: '8.4 MB',
    fileFormat: 'PDF',
    downloadCount: 22100,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-cyan-700 via-blue-900 to-slate-900',
    description: 'Senior Secondary Form 3 (Grade 10) physics module covering vector addition, kinematic motion graphs, Newton’s Laws of Motion, momentum, work, energy, and power.',
    learningOutcomes: [
      'Resolve coplanar vectors using trigonometric and graphical methods.',
      'Interpret displacement-time and velocity-time graphs for accelerated bodies.',
      'Apply Newton’s 1st, 2nd, and 3rd laws to calculate forces and accelerations.',
      'Demonstrate the Law of Conservation of Momentum in collision experiments.'
    ],
    tableOfContents: [
      'Unit 1: Physical Quantities, SI Units & Vernier / Micrometer Measurement',
      'Unit 2: Kinematics (Speed, Velocity, Acceleration & Equations of Motion)',
      'Unit 3: Dynamics (Forces, Mass, Weight, Friction & Newton’s Laws)',
      'Unit 4: Momentum, Impulse & Elastic / Inelastic Collisions',
      'Unit 5: Work, Energy, Power & Mechanical Efficiency of Machines',
      'Unit 6: Laboratory Practical Investigations & Error Analysis'
    ]
  },
  {
    id: 'mod-f3-chem-02',
    title: 'Form 3 Chemistry: Atomic Structure, Periodic Table & Chemical Bonding',
    category: 'modules',
    level: 'Form 3',
    subject: 'Chemistry',
    code: 'CDC-MOD-F3-C02',
    publisher: 'Ministry of Education CDC',
    author: 'National Chemistry Panel',
    year: '2026',
    pages: '80 pages',
    fileSize: '7.1 MB',
    fileFormat: 'PDF',
    downloadCount: 18400,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-amber-700 via-orange-900 to-slate-900',
    description: 'Core senior secondary chemistry module investigating electron configurations, isotopes, ionic and covalent bonding, metallic structures, and periodic trends.',
    learningOutcomes: [
      'Draw electron configurations for elements 1 to 20.',
      'Explain ionic bonding through electron transfer and covalent bonding through sharing.',
      'Relate chemical bonding types to melting points, electrical conductivity, and solubility.'
    ]
  },
  {
    id: 'mod-f4-bio-01',
    title: 'Form 4 Biology: Respiration, Human Circulatory Systems & Plant Transport',
    category: 'modules',
    level: 'Form 4',
    subject: 'Biology',
    code: 'CDC-MOD-F4-B01',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'Senior Biology Specialist Panel',
    year: '2026',
    pages: '96 pages',
    fileSize: '9.8 MB',
    fileFormat: 'PDF',
    downloadCount: 25400,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-emerald-800 via-teal-950 to-slate-950',
    description: 'Comprehensive Form 4 (Grade 11) biology textbook module exploring mammalian cardiovascular dynamics, cardiac cycles, gas exchange, transpiration, and xylem/phloem transport mechanisms.',
    learningOutcomes: [
      'Detail the structure and double circulation of the mammalian heart.',
      'Compare cellular respiration (aerobic vs. anaerobic) and ATP energy yield.',
      'Measure transpiration rates using photometers and assess environmental influences.'
    ]
  },
  {
    id: 'mod-f4-math-02',
    title: 'Form 4 Mathematics: Trigonometry, Calculus Primer & Probability',
    category: 'modules',
    level: 'Form 4',
    subject: 'Mathematics',
    code: 'CDC-MOD-F4-M02',
    publisher: 'Ministry of Education CDC',
    author: 'MoE Senior Secondary Mathematics Panel',
    year: '2026',
    pages: '104 pages',
    fileSize: '6.9 MB',
    fileFormat: 'PDF',
    downloadCount: 29800,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-blue-800 via-sky-950 to-slate-950',
    description: 'Advanced senior secondary module covering sine rule, cosine rule, three-figure bearings, 3D trigonometry, introductory differentiation rules, and probability tree diagrams.',
    learningOutcomes: [
      'Apply sine and cosine rules to calculate unknown sides and angles in non-right triangles.',
      'Calculate three-figure navigational bearings and solve 3D geometrical problems.',
      'Differentiate algebraic polynomials using the power rule dy/dx = nx^(n-1).'
    ]
  },
  {
    id: 'mod-f5-phy-01',
    title: 'Form 5 Physics: Electromagnetism, Electronics & Nuclear Physics',
    category: 'modules',
    level: 'Form 5',
    subject: 'Physics',
    code: 'CDC-MOD-F5-P01',
    publisher: 'National STEM Centre & ECZ Syllabus Division',
    author: 'Senior Physics Examination Review Board',
    year: '2026',
    pages: '112 pages',
    fileSize: '12.4 MB',
    fileFormat: 'PDF',
    downloadCount: 38200,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-violet-800 via-purple-950 to-slate-950',
    description: 'Final Year Senior Secondary Form 5 (Grade 12) national examination module. Covers Faraday’s law, transformers, cathode ray oscilloscopes, semiconductor diodes, logic gates, and radioactive decay equations.',
    learningOutcomes: [
      'Analyze electromagnetic induction and calculate transformer voltage/current ratios.',
      'Interpret CRO waveform displays to determine frequency and peak voltage.',
      'Design truth tables and logic circuits using AND, OR, NOT, NAND, and NOR gates.',
      'Balance nuclear alpha, beta, and gamma decay equations and calculate half-life intervals.'
    ]
  },
  {
    id: 'mod-f5-math-02',
    title: 'Form 5 Mathematics: Pure Mathematics & ECZ Master Exam Review',
    category: 'modules',
    level: 'Form 5',
    subject: 'Mathematics',
    code: 'CDC-MOD-F5-M02',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'National Chief Mathematics Examiners',
    year: '2026',
    pages: '128 pages',
    fileSize: '8.7 MB',
    fileFormat: 'PDF',
    downloadCount: 45100,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-rose-800 via-pink-950 to-slate-950',
    description: 'Master Grade 12 module preparing students for ECZ Paper 1 and Paper 2. Contains comprehensive theory, 200+ step-by-step worked exam questions, calculus integration, matrices, and linear programming.',
    learningOutcomes: [
      'Evaluate definite and indefinite integrals for area under curves.',
      'Perform matrix multiplication, compute 2x2 determinants, and solve inverse matrix systems.',
      'Formulate linear programming inequalities and extract optimal objective solutions from shaded graphs.'
    ]
  },
  {
    id: 'mod-f6-math-01',
    title: 'Form 6 / A-Level Mathematics: Complex Numbers, Vectors & Differential Equations',
    category: 'modules',
    level: 'Form 6',
    subject: 'Additional Mathematics',
    code: 'INT-MOD-F6-M01',
    publisher: 'Cambridge Assessment International Education / MoE Higher Education',
    author: 'International Advanced Curriculum Directorate',
    year: '2026',
    pages: '148 pages',
    fileSize: '14.2 MB',
    fileFormat: 'PDF',
    downloadCount: 12400,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: true,
    featured: true,
    coverImageGradient: 'from-amber-600 via-orange-950 to-slate-950',
    description: 'Advanced Level Form 6 (Sixth Form / Higher Secondary / Pre-University) curriculum module covering complex numbers in Argand diagrams, 3D vector scalar/cross products, and first/second order differential equations.',
    learningOutcomes: [
      'Perform algebraic operations in the complex plane using Cartesian and polar (modulus-argument) forms.',
      'Solve first-order separable differential equations and model growth/decay systems.',
      'Apply vector cross products to determine normals and perpendicular distances in 3D space.'
    ]
  },
  {
    id: 'mod-f6-chem-02',
    title: 'Form 6 / A-Level Chemistry: Thermodynamics, Chemical Kinetics & Organic Synthesis',
    category: 'modules',
    level: 'Form 6',
    subject: 'Chemistry',
    code: 'INT-MOD-F6-C02',
    publisher: 'OpenStax & MoE Tertiary Sciences Consortium',
    author: 'University Chemistry Faculty Panel',
    year: '2026',
    pages: '162 pages',
    fileSize: '16.8 MB',
    fileFormat: 'PDF',
    downloadCount: 10900,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: true,
    coverImageGradient: 'from-purple-700 via-indigo-950 to-slate-950',
    description: 'International Sixth Form module covering Born-Haber energy cycles, Gibbs free energy spontaneity, rate equations, catalysis, and spectroscopic identification (NMR, IR, Mass Spec).',
    learningOutcomes: [
      'Construct Born-Haber cycles to calculate lattice energies.',
      'Determine reaction orders from initial rates data and calculate activation energy using the Arrhenius equation.',
      'Deduce complex organic structures from combined infrared, NMR, and mass spectrometry data.'
    ]
  },
  {
    id: 'mod-ece-01',
    title: 'Early Childhood Education (ECE): Sensory Play, Motor Skills & Cognitive Development',
    category: 'modules',
    level: 'Primary',
    subject: 'Early Childhood',
    code: 'CDC-MOD-ECE-01',
    publisher: 'Ministry of Education Directorate of Early Childhood Education & CDC',
    author: 'National ECE Curriculum Panel',
    year: '2026',
    pages: '48 pages',
    fileSize: '4.2 MB',
    fileFormat: 'PDF',
    downloadCount: 15400,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-amber-600 via-orange-800 to-slate-950',
    description: 'Official Ministry of Education ECE module focusing on early childhood developmental milestones, sensory-motor coordination, play-based learning methodologies, and foundational social skills for children aged 3 to 6 years.',
    learningOutcomes: [
      'Design play-based learning activities that stimulate gross and fine motor skills.',
      'Implement sensory integration exercises for cognitive and emotional growth.',
      'Establish safe, inclusive, and stimulating early learning environments.'
    ],
    tableOfContents: [
      'Unit 1: Introduction to Early Childhood Development & Brain Architecture',
      'Unit 2: Sensory-Motor Integration & Outdoor Play Methodologies',
      'Unit 3: Early Numeracy through Counting Games & Manipulatives',
      'Unit 4: Pre-Writing, Phonics & Oral Language Development',
      'Unit 5: Social-Emotional Well-Being and Inclusive Classroom Management'
    ]
  },
  {
    id: 'mod-ece-02',
    title: 'Early Childhood Education (ECE): Numeracy, Pre-Reading & Creative Arts',
    category: 'modules',
    level: 'Primary',
    subject: 'Early Childhood',
    code: 'CDC-MOD-ECE-02',
    publisher: 'Ministry of Education ECE Directorate',
    author: 'National ECE Specialist Group',
    year: '2026',
    pages: '52 pages',
    fileSize: '5.1 MB',
    fileFormat: 'PDF',
    downloadCount: 12900,
    rating: 4.8,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-pink-600 via-rose-800 to-slate-950',
    description: 'ECE curriculum guide for introducing shapes, colors, pattern recognition, rhythm, and storytelling in Zambian local languages and English.',
    learningOutcomes: [
      'Guide children in identifying geometric shapes, basic sorting, and pattern matching.',
      'Foster listening comprehension through traditional folk tales and songs.'
    ]
  },
  {
    id: 'mod-prim-g1-01',
    title: 'Primary Grade 1: Foundational Literacy & Numeracy CBC Teacher Guide',
    category: 'modules',
    level: 'Primary',
    subject: 'Zambian Languages',
    code: 'CDC-MOD-PRI-G1',
    publisher: 'Ministry of Education CDC & National Reading Programme',
    author: 'Primary Grade 1 National Taskforce',
    year: '2026',
    pages: '60 pages',
    fileSize: '6.5 MB',
    fileFormat: 'PDF',
    downloadCount: 28400,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-emerald-700 via-teal-900 to-slate-950',
    description: 'Official Grade 1 primary teacher guide for mother tongue literacy instruction, letter formation, number recognition 1-20, and foundational arithmetic.',
    learningOutcomes: [
      'Teach phonics and sound blending in local languages.',
      'Guide learners in addition and subtraction using physical counting counters.'
    ]
  },
  {
    id: 'mod-prim-g2-02',
    title: 'Primary Grade 2: Mathematics, Literacy & Environmental Science',
    category: 'modules',
    level: 'Primary',
    subject: 'Mathematics',
    code: 'CDC-MOD-PRI-G2',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'Primary Education Panel',
    year: '2026',
    pages: '68 pages',
    fileSize: '7.0 MB',
    fileFormat: 'PDF',
    downloadCount: 21900,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-teal-700 via-cyan-900 to-slate-950',
    description: 'Comprehensive Grade 2 primary module covering addition/subtraction with regrouping, sentence construction in English and local languages, and local plant/animal studies.',
    learningOutcomes: [
      'Perform two-digit addition and subtraction with carrying and borrowing.',
      'Observe and record weather patterns and local plant ecosystems.'
    ]
  },
  {
    id: 'mod-prim-g3-03',
    title: 'Primary Grade 3: Integrated Science, Numeracy & Social Studies',
    category: 'modules',
    level: 'Primary',
    subject: 'Integrated Science',
    code: 'CDC-MOD-PRI-G3',
    publisher: 'Ministry of Education CDC',
    author: 'Primary Curriculum Specialists',
    year: '2026',
    pages: '74 pages',
    fileSize: '7.8 MB',
    fileFormat: 'PDF',
    downloadCount: 24500,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-blue-700 via-indigo-900 to-slate-950',
    description: 'Grade 3 core primary curriculum module exploring personal hygiene, community roles, multiplication tables, and basic geography of Zambia.',
    learningOutcomes: [
      'Master multiplication tables up to 10x10.',
      'Explain community health, sanitation, and safety principles.'
    ]
  },
  {
    id: 'mod-prim-g4-04',
    title: 'Primary Grade 4: English Language, Mathematics & Civic Education',
    category: 'modules',
    level: 'Primary',
    subject: 'English Language',
    code: 'CDC-MOD-PRI-G4',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'Primary Education Panel',
    year: '2026',
    pages: '82 pages',
    fileSize: '8.4 MB',
    fileFormat: 'PDF',
    downloadCount: 26100,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-indigo-700 via-purple-900 to-slate-950',
    description: 'Grade 4 middle-primary module bridging local language instruction to English medium, fractions, decimals, and Zambian cultural heritage.',
    learningOutcomes: [
      'Transition smoothly to English as the primary medium of instruction.',
      'Calculate fractions, decimals, and basic measurements.'
    ]
  },
  {
    id: 'mod-prim-g5-05',
    title: 'Primary Grade 5: Upper Primary Science, Mathematics & Agriculture',
    category: 'modules',
    level: 'Primary',
    subject: 'Agriculture',
    code: 'CDC-MOD-PRI-G5',
    publisher: 'Ministry of Education CDC',
    author: 'Upper Primary Working Group',
    year: '2026',
    pages: '88 pages',
    fileSize: '9.1 MB',
    fileFormat: 'PDF',
    downloadCount: 23800,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-green-700 via-emerald-900 to-slate-950',
    description: 'Grade 5 upper primary module focusing on crop production, soil types, animal husbandry basics, geometry, and data handling.',
    learningOutcomes: [
      'Identify soil types (clay, loam, sand) and their suitability for crop growth.',
      'Calculate perimeter, area, and volume of rectangular shapes.'
    ]
  },
  {
    id: 'mod-prim-g6-06',
    title: 'Primary Grade 6: Social Studies, Integrated Science & English',
    category: 'modules',
    level: 'Primary',
    subject: 'Social Studies',
    code: 'CDC-MOD-PRI-G6',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'Primary Specialist Panel',
    year: '2026',
    pages: '94 pages',
    fileSize: '9.9 MB',
    fileFormat: 'PDF',
    downloadCount: 27200,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-amber-700 via-orange-950 to-slate-950',
    description: 'Grade 6 upper primary curriculum module covering Zambian history, natural resources, energy transfer, and advanced composition writing.',
    learningOutcomes: [
      'Trace the history of Zambia from pre-colonial kingdoms to independence.',
      'Analyze energy transformations (solar, kinetic, electrical, thermal).'
    ]
  },
  {
    id: 'mod-prim-g7-07',
    title: 'Primary Grade 7: ECZ National Examination Preparation & Secondary Transition',
    category: 'modules',
    level: 'Primary',
    subject: 'Mathematics',
    code: 'CDC-MOD-PRI-G7',
    publisher: 'Examinations Council of Zambia (ECZ) & CDC',
    author: 'National Grade 7 Chief Examiners',
    year: '2026',
    pages: '110 pages',
    fileSize: '11.5 MB',
    fileFormat: 'PDF',
    downloadCount: 48900,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-cyan-800 via-blue-950 to-slate-950',
    description: 'Official Grade 7 composite examination preparation module covering Mathematics, English, Integrated Science, and Social Studies with past ECZ exam papers and model answers.',
    learningOutcomes: [
      'Master all Grade 7 ECZ national examination syllabus topics.',
      'Practice past examination questions under timed test conditions with answer keys.'
    ]
  },
  {
    id: 'mod-prim-stem-02',
    title: 'Primary Grade 5-7 Integrated Science & Environmental Studies Module',
    category: 'modules',
    level: 'Primary',
    subject: 'Integrated Science',
    code: 'CDC-MOD-PRI-S02',
    publisher: 'Curriculum Development Centre (CDC)',
    author: 'Primary Science Curriculum Panel',
    year: '2026',
    pages: '64 pages',
    fileSize: '7.5 MB',
    fileFormat: 'PDF',
    downloadCount: 23100,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-teal-600 via-cyan-950 to-slate-900',
    description: 'Upper Primary Grade 7 Composite preparation module covering water cycles, solar system, human body systems, electricity basics, and environmental conservation in Zambia.',
    learningOutcomes: [
      'Explain the states of matter and the atmospheric hydrological cycle.',
      'Identify key human skeletal and digestive organs.',
      'Construct a simple closed circuit with battery, switch, and bulb.'
    ]
  },

  // ==========================================
  // BOOKS & TEXTBOOKS
  // ==========================================
  {
    id: 'bk-sec-math-10',
    title: 'Zambia Senior Secondary Mathematics Pupils Book 10 (CDC Approved)',
    category: 'books',
    level: 'Form 3',
    subject: 'Mathematics',
    code: 'CDC-BK-MAT-G10',
    publisher: 'Zambia Educational Publishing House (ZEPH)',
    author: 'MoE Approved Textbook Panel',
    year: '2026 Revised Edition',
    pages: '240 pages',
    fileSize: '18.5 MB',
    fileFormat: 'PDF',
    downloadCount: 52000,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-blue-900 via-slate-900 to-slate-950',
    description: 'Official Ministry of Education approved pupil textbook for Grade 10 / Form 3. Contains syllabus coverage, progressive exercises, real-life examples, and review summaries.',
    tableOfContents: [
      'Chapter 1: Sets, Set Operations & Venn Diagrams',
      'Chapter 2: Number Bases (Binary, Octal, Denary)',
      'Chapter 3: Approximation, Significant Figures & Standard Form',
      'Chapter 4: Algebraic Expressions & Linear Equations',
      'Chapter 5: Quadratic Equations & Factorization',
      'Chapter 6: Coordinate Geometry & Graphs of Relations',
      'Chapter 7: Angles, Polygons & Geometric Constructions',
      'Chapter 8: Mensuration: Perimeter, Area & Volume',
      'Chapter 9: Statistics: Grouped Data, Mean, Median & Ogives'
    ]
  },
  {
    id: 'bk-sec-phys-11',
    title: 'Senior Secondary Physics: Principles & Laboratory Explorations (Grade 11-12)',
    category: 'books',
    level: 'Form 4',
    subject: 'Physics',
    code: 'CDC-BK-PHY-G1112',
    publisher: 'Oxford University Press / MoE CDC Co-Publication',
    author: 'Dr. M. S. Phiri & Prof. K. Mwansa',
    year: '2025 Edition',
    pages: '312 pages',
    fileSize: '24.2 MB',
    fileFormat: 'PDF',
    downloadCount: 41300,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: true,
    featured: true,
    coverImageGradient: 'from-cyan-900 via-slate-900 to-slate-950',
    description: 'Comprehensive physics reference text with detailed laboratory experiment protocols, vector analysis, thermal physics, optics, wave mechanics, and electricity networks.'
  },
  {
    id: 'bk-sec-bio-12',
    title: 'Senior Secondary Biology: A Contemporary African Perspective (Grade 10-12)',
    category: 'books',
    level: 'Form 5',
    subject: 'Biology',
    code: 'CDC-BK-BIO-G1012',
    publisher: 'Longman Zambia / MoE Approved',
    author: 'G. Mulenga & C. Banda',
    year: '2026 Edition',
    pages: '286 pages',
    fileSize: '21.0 MB',
    fileFormat: 'PDF',
    downloadCount: 38700,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-emerald-900 via-slate-900 to-slate-950',
    description: 'Flagship Senior Secondary biology textbook enriched with ecological field studies of Zambian national parks, tropical medicine, cellular biochemistry, and modern genetics.'
  },
  {
    id: 'bk-civic-12',
    title: 'Civic Education for Senior Secondary Schools: Democracy, Human Rights & Governance',
    category: 'books',
    level: 'Form 5',
    subject: 'Civic Education',
    code: 'CDC-BK-CIV-G1012',
    publisher: 'Ministry of Education CDC Directorate',
    author: 'National Civic Education Taskforce',
    year: '2025 Edition',
    pages: '194 pages',
    fileSize: '14.1 MB',
    fileFormat: 'PDF',
    downloadCount: 29500,
    rating: 4.8,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-purple-900 via-slate-900 to-slate-950',
    description: 'Authoritative text detailing the Constitution of Zambia, electoral systems, judiciary structures, international conventions (UN/AU/SADC), and anti-corruption frameworks.'
  },
  {
    id: 'bk-openstax-chem',
    title: 'OpenStax General Chemistry 2e (International Open Education Edition)',
    category: 'books',
    level: 'Form 6',
    subject: 'Chemistry',
    code: 'INT-OER-CHM-2E',
    publisher: 'OpenStax Rice University / UNESCO Global Library',
    author: 'Prof. Paul Flowers et al.',
    year: '2026 Open Edition',
    pages: '1240 pages',
    fileSize: '32.4 MB',
    fileFormat: 'PDF',
    downloadCount: 18200,
    rating: 5.0,
    isOfficialMoE: false,
    isInternational: true,
    featured: true,
    coverImageGradient: 'from-amber-900 via-slate-900 to-slate-950',
    description: 'World-renowned peer-reviewed open textbook for Advanced Level / Pre-University students. Covers stoichiometry, quantum chemistry, thermodynamics, electrochemistry, and coordination complexes.'
  },

  // ==========================================
  // PAST PAPERS & EXAMINATION KITS
  // ==========================================
  {
    id: 'pp-g12-math-2025',
    title: 'ECZ Grade 12 Mathematics Past Examination Papers (2020 - 2025 Series with Solutions)',
    category: 'past_papers',
    level: 'Form 5',
    subject: 'Mathematics',
    code: 'ECZ-PP-MAT-G12-25',
    publisher: 'Examinations Council of Zambia (ECZ)',
    author: 'Chief Examiner Panel for Mathematics',
    year: '2025 Exam Series',
    pages: '142 pages',
    fileSize: '11.8 MB',
    fileFormat: 'PDF',
    downloadCount: 78500,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-rose-900 via-slate-900 to-slate-950',
    description: 'Complete 6-year compilation of official ECZ Grade 12 Paper 1 and Paper 2 examination question papers, accompanied by official marking schemes and step-by-step scoring criteria.',
    tableOfContents: [
      'Section 1: 2025 Mathematics Paper 1 & Paper 2 (Complete with Marking Scheme)',
      'Section 2: 2024 Mathematics Paper 1 & Paper 2 (Internal & GCE Series)',
      'Section 3: 2023 Mathematics Paper 1 & Paper 2',
      'Section 4: 2022 Mathematics Paper 1 & Paper 2',
      'Section 5: 2021 & 2020 Historical Series',
      'Section 6: Chief Examiner’s Performance Report & Common Candidate Errors'
    ]
  },
  {
    id: 'pp-g12-phys-2025',
    title: 'ECZ Grade 12 Physics Theory & Practical Examination Papers (2021 - 2025)',
    category: 'past_papers',
    level: 'Form 5',
    subject: 'Physics',
    code: 'ECZ-PP-PHY-G12-25',
    publisher: 'Examinations Council of Zambia (ECZ)',
    author: 'ECZ Senior Science Moderators',
    year: '2025 Exam Series',
    pages: '118 pages',
    fileSize: '9.6 MB',
    fileFormat: 'PDF',
    downloadCount: 64200,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-cyan-900 via-slate-900 to-slate-950',
    description: 'Official examination papers for Physics Paper 1 (Multiple Choice), Paper 2 (Theory), and Paper 3 (Practical Experimental Assessment) with model specimen results and apparatus guides.'
  },
  {
    id: 'pp-g9-scie-2025',
    title: 'ECZ Grade 9 Junior Secondary Integrated Science Past Exam Papers & Marking Keys',
    category: 'past_papers',
    level: 'Form 2',
    subject: 'Integrated Science',
    code: 'ECZ-PP-SCI-G9-25',
    publisher: 'Examinations Council of Zambia (ECZ)',
    author: 'ECZ Junior Secondary Examination Panel',
    year: '2025 Exam Series',
    pages: '92 pages',
    fileSize: '6.4 MB',
    fileFormat: 'PDF',
    downloadCount: 43600,
    rating: 4.8,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-teal-900 via-slate-900 to-slate-950',
    description: '5-year bundle of official ECZ Junior Secondary Leaving Examination (JSSLE) question papers with answers and diagnostic performance rubrics.'
  },
  {
    id: 'pp-g7-comp-2025',
    title: 'ECZ Grade 7 Primary Composite Examination Master Papers (All Subjects 2022-2025)',
    category: 'past_papers',
    level: 'Primary',
    subject: 'All Subjects',
    code: 'ECZ-PP-PRI-G7-25',
    publisher: 'Examinations Council of Zambia (ECZ)',
    author: 'ECZ Primary Education Assessment Directorate',
    year: '2025 Exam Series',
    pages: '160 pages',
    fileSize: '13.2 MB',
    fileFormat: 'PDF',
    downloadCount: 58900,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-emerald-900 via-slate-900 to-slate-950',
    description: 'Comprehensive past paper compilation for Grade 7 Composite Examinations covering English Language, Mathematics, Integrated Science, Social Studies, Special Paper 1 (Aptitude), and Special Paper 2.'
  },
  {
    id: 'pp-cambridge-alevel',
    title: 'Cambridge International A-Level Mathematics (Pure 1, 2, 3 & Mechanics) Past Papers',
    category: 'past_papers',
    level: 'Form 6',
    subject: 'Additional Mathematics',
    code: 'CIE-PP-ALVL-M25',
    publisher: 'Cambridge University Press & Assessment',
    author: 'Cambridge International Examinations Board',
    year: '2025 Series',
    pages: '210 pages',
    fileSize: '17.4 MB',
    fileFormat: 'PDF',
    downloadCount: 16700,
    rating: 5.0,
    isOfficialMoE: false,
    isInternational: true,
    featured: true,
    coverImageGradient: 'from-indigo-900 via-slate-900 to-slate-950',
    description: 'International benchmark A-Level past papers for sixth form and international baccalaureate students seeking global university admissions.'
  },

  // ==========================================
  // SCHOOL INFORMATION & POLICY
  // ==========================================
  {
    id: 'info-cbc-framework-2026',
    title: 'Zambia National Competence-Based Curriculum (CBC) Policy Framework 2026-2030',
    category: 'school_info',
    level: 'All Levels',
    subject: 'Curriculum Policy',
    code: 'MOE-POL-CBC-2026',
    publisher: 'Republic of Zambia Ministry of Education',
    author: 'Directorate of Standards and Curriculum',
    year: '2026 Gazette',
    pages: '116 pages',
    fileSize: '8.9 MB',
    fileFormat: 'PDF',
    downloadCount: 31200,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    description: 'The master national curriculum policy establishing 21st-century competence-based learning, dual-pathway senior secondary streams (Academic & Vocational), continuous assessment (CA) integration, and digital literacy mandates.',
    tableOfContents: [
      'Chapter 1: Vision, Philosophy & National Educational Goals of Zambia',
      'Chapter 2: Structural Transition: 2-6-4-2 Educational Paradigm',
      'Chapter 3: Competence Standards & Pedagogical Implementation Guidelines',
      'Chapter 4: Dual Pathway System (Technical/Vocational & STEM/Humanities)',
      'Chapter 5: Continuous Assessment (CA) & School-Based Assessment (SBA) Moderation',
      'Chapter 6: Teacher Professional Standards, CPD & Quality Assurance Matrix'
    ]
  },
  {
    id: 'info-free-education-directive',
    title: 'MoE Free Education Policy Implementation Manual & Grant Disbursement Guidelines',
    category: 'school_info',
    level: 'All Levels',
    subject: 'Education Administration',
    code: 'MOE-ADM-FEP-2026',
    publisher: 'Ministry of Education Headquarters',
    author: 'Permanent Secretary & Financial Management Division',
    year: '2026 Edition',
    pages: '48 pages',
    fileSize: '3.2 MB',
    fileFormat: 'PDF',
    downloadCount: 22400,
    rating: 4.8,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-blue-900 via-slate-900 to-slate-950',
    description: 'Official Government handbook governing public school operational grants, fee abolition compliance, vulnerable learner CDF bursary access, and procurement transparency.'
  },
  {
    id: 'info-school-calendar-2026',
    title: 'Republic of Zambia National Official School Calendar & Examination Dates 2026',
    category: 'school_info',
    level: 'All Levels',
    subject: 'Academic Administration',
    code: 'MOE-CAL-2026',
    publisher: 'Ministry of Education HQ & ECZ',
    author: 'Directorate of Teacher Education & Specialized Services',
    year: '2026 Official',
    pages: '12 pages',
    fileSize: '1.8 MB',
    fileFormat: 'PDF',
    downloadCount: 65400,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-amber-900 via-slate-900 to-slate-950',
    description: 'Statutory 3-term academic calendar specifying term opening/closing dates, national public holidays, midterm breaks, CPD teacher workshops, and ECZ examination sitting schedules.'
  },
  {
    id: 'info-tcz-code-ethics',
    title: 'Teaching Council of Zambia (TCZ) Professional Code of Ethics & Licensing Handbook',
    category: 'school_info',
    level: 'All Levels',
    subject: 'Teacher Professionalism',
    code: 'TCZ-DOC-ETH-2025',
    publisher: 'Teaching Council of Zambia (TCZ)',
    author: 'TCZ Regulatory & Standards Council',
    year: '2025 Official',
    pages: '36 pages',
    fileSize: '2.4 MB',
    fileFormat: 'PDF',
    downloadCount: 18900,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    coverImageGradient: 'from-purple-900 via-slate-900 to-slate-950',
    description: 'Mandatory statutory regulations governing teacher conduct, practicing licenses, child safeguarding, anti-harassment policies, and continuous professional development requirements.'
  }
];
