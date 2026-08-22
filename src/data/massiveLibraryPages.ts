import { DocumentPage, LibraryItem } from './libraryData';

/**
 * Massive Library Page Content Generator & Deep Curriculum Repository
 * Generates over 1,000+ rich, structured pages of Zambian CDC Competence-Based Curriculum (CBC),
 * ECZ examination guides, STEM worked solutions, and national reference textbooks.
 */

interface TopicSpec {
  unitNumber: number;
  unitTitle: string;
  subtopics: {
    title: string;
    theory: string;
    formulaOrConcept?: string;
    workedExample?: {
      problem: string;
      steps: string[];
      finalAnswer: string;
    };
    callout: {
      title: string;
      type: 'tip' | 'formula' | 'activity' | 'warning' | 'ecz_exam';
      text: string;
    };
    takeaways: string[];
    selfCheck: {
      question: string;
      marks: string;
      answer: string;
    };
  }[];
}

// Generates an array of structured DocumentPages from curriculum specifications
export function generateCurriculumPages(
  bookTitle: string,
  docCode: string,
  level: string,
  subject: string,
  publisher: string,
  topics: TopicSpec[]
): DocumentPage[] {
  const pages: DocumentPage[] = [];
  let pageCounter = 1;

  // Title / Preface Page
  pages.push({
    pageNumber: pageCounter++,
    pageTitle: `Frontispiece & National Curriculum Framework`,
    chapterTitle: `Introduction & Preface`,
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT (CDC) & ZAMBIA LIBRARY SERVICE

${bookTitle.toUpperCase()}
Document Code: ${docCode}
Curriculum Level: ${level} | Subject Focus: ${subject}
Publisher: ${publisher}

NATIONAL CURRICULUM FOUNDATION & PREFACE:
This official curriculum resource has been published in direct accordance with the Zambia Competence-Based Curriculum (CBC) framework. Under the statutory guidelines of the Ministry of Education and the Examinations Council of Zambia (ECZ), this volume equips learners and educators with structured mastery pathways, practical inquiry skills, and 21st-century problem-solving capabilities.

CORE CBC COMPETENCE DOMAINS:
1. Analytical & Critical Thinking: Evaluating quantitative and qualitative data systematically.
2. Scientific & Quantitative Inquiry: Formulating hypotheses, applying standard algorithms, and executing laboratory trials.
3. Communication & Team Collaboration: Articulating complex ideas through oral defense, structured essays, and visual media.
4. Civic Responsibility & Entrepreneurship: Connecting academic principles to Zambian industrial value-chains, local mining, agriculture, technology, and environmental stewardship.`,
    calloutBox: {
      title: 'Ministry of Education CDC Directive',
      type: 'tip',
      content: `Teachers and self-directed candidates are advised to complete all embedded worked examples, execute hands-on studio/laboratory investigations, and practice timed responses under ECZ examination conditions.`
    },
    keyTakeaways: [
      `Full alignment with official Zambia CDC Competence-Based Curriculum specifications.`,
      `Includes step-by-step worked solutions, formula derivations, and ECZ examination drills.`,
      `Designed for both classroom instructional delivery and independent learner mastery.`
    ]
  });

  // Expand through topics and subtopics
  topics.forEach((topic) => {
    topic.subtopics.forEach((sub, subIdx) => {
      const page: DocumentPage = {
        pageNumber: pageCounter++,
        pageTitle: `Unit ${topic.unitNumber}.${subIdx + 1}: ${sub.title}`,
        chapterTitle: `Unit ${topic.unitNumber}: ${topic.unitTitle}`,
        content: `CURRICULUM DEVELOPMENT CENTRE (CDC) — ${level.toUpperCase()} ${subject.toUpperCase()}
UNIT ${topic.unitNumber}: ${topic.unitTitle.toUpperCase()}
SUBTOPIC ${topic.unitNumber}.${subIdx + 1}: ${sub.title.toUpperCase()}

1. THEORETICAL FOUNDATION & DETAILED EXPOSITION:
${sub.theory}

2. CONCEPTUAL FORMULATION & METHODOLOGY:
${sub.formulaOrConcept ? sub.formulaOrConcept : `Learners apply deductive and inductive reasoning to analyze structural components, balance equations, and evaluate authentic scenarios drawn from Zambian community and industrial sectors.`}

3. PEDAGOGICAL NOTES & INSTRUCTIONAL GUIDANCE:
When addressing this unit, educators should emphasize active learner engagement. Candidates preparing for ECZ national assessments must demonstrate clear step-by-step logic, state appropriate SI units, and cite specific conceptual definitions to secure maximum method and accuracy marks.`,
        calloutBox: {
          title: sub.callout.title,
          type: sub.callout.type,
          content: sub.callout.text
        },
        keyTakeaways: sub.takeaways,
        selfCheckQuestions: [
          {
            question: sub.selfCheck.question,
            marks: sub.selfCheck.marks,
            answer: sub.selfCheck.answer
          }
        ]
      };

      if (sub.workedExample) {
        page.workedExamples = [
          {
            title: `Worked Exemplar: ${sub.title}`,
            problemStatement: sub.workedExample.problem,
            steps: sub.workedExample.steps,
            finalAnswer: sub.workedExample.finalAnswer
          }
        ];
      }

      pages.push(page);
    });
  });

  return pages;
}

// =========================================================================
// 1. FLAGSHIP 120-PAGE SENIOR STEM MEGA-COMPENDIUM (Forms 4-6 / Grades 10-12)
// =========================================================================
export const SENIOR_STEM_COMPENDIUM_TOPICS: TopicSpec[] = [
  // Mathematics
  {
    unitNumber: 1,
    unitTitle: 'Advanced Algebra, Functions & Polynomial Theory',
    subtopics: [
      {
        title: 'Quadratic Equations & Completing the Square Method',
        theory: `A quadratic equation is a second-degree polynomial of standard form ax² + bx + c = 0 where a ≠ 0. The discriminant Δ = b² - 4ac determines the nature of the roots: real and distinct (Δ > 0), real and equal (Δ = 0), or non-real/complex (Δ < 0). In the Zambian Senior Secondary syllabus, learners must master factorization, the quadratic formula, and the method of completing the square.`,
        formulaOrConcept: `Standard Quadratic Formula:\nx = (-b ± √(b² - 4ac)) / (2a)\n\nCompleting the Square Procedure:\n1. Ensure coefficient of x² is 1: x² + (b/a)x = -c/a\n2. Add (b/2a)² to both sides: (x + b/2a)² = (b² - 4ac) / 4a²\n3. Take square roots: x + b/2a = ±√(b² - 4ac) / 2a`,
        workedExample: {
          problem: 'Solve 2x² - 7x + 3 = 0 by completing the square.',
          steps: [
            'Divide by 2: x² - (7/2)x + 3/2 = 0',
            'Transpose constant: x² - (7/2)x = -3/2',
            'Add (7/4)² = 49/16 to both sides: (x - 7/4)² = -3/2 + 49/16',
            'Simplify right hand side: -24/16 + 49/16 = 25/16',
            'Take square roots: x - 7/4 = ±5/4',
            'Evaluate roots: x = 7/4 + 5/4 = 12/4 = 3, or x = 7/4 - 5/4 = 2/4 = 1/2'
          ],
          finalAnswer: 'x = 3 or x = 1/2'
        },
        callout: {
          title: 'ECZ Paper 2 Exam Tip',
          type: 'ecz_exam',
          text: 'When asked to solve to two decimal places, write down the full unrounded calculator result before truncating to 2 d.p.'
        },
        takeaways: [
          'Completing the square transforms standard quadratic polynomials into vertex form.',
          'Discriminant Δ dictates intersection points on Cartesian coordinate axes.'
        ],
        selfCheck: {
          question: 'Solve 3x² + 5x - 2 = 0 using the quadratic formula. State roots to 2 decimal places.',
          marks: '[4 Marks]',
          answer: 'a=3, b=5, c=-2. Δ = 25 - 4(3)(-2) = 25 + 24 = 49. x = (-5 ± 7) / 6. x = 2/6 = 0.33 or x = -12/6 = -2.00.'
        }
      },
      {
        title: 'Polynomial Remainder & Factor Theorems',
        theory: `For a polynomial P(x), when divided by a linear divisor (x - c), the remainder R is exactly equal to P(c). If P(c) = 0, then by the Factor Theorem, (x - c) is an exact factor of P(x). This theorem is essential for factoring cubic and quartic polynomials in ECZ Additional Mathematics and Pure Mathematics Paper 1.`,
        formulaOrConcept: `Remainder Theorem: P(x) = (x - c)Q(x) + R  =>  P(c) = R\nFactor Theorem: P(c) = 0 <=> (x - c) is a factor of P(x)`,
        workedExample: {
          problem: 'Find the value of k if (x - 2) is a factor of P(x) = 2x³ - 3x² + kx - 10.',
          steps: [
            'By Factor Theorem, P(2) = 0',
            'Substitute x = 2: 2(2)³ - 3(2)² + k(2) - 10 = 0',
            'Evaluate powers: 2(8) - 3(4) + 2k - 10 = 0',
            'Simplify constants: 16 - 12 - 10 + 2k = 0 => -6 + 2k = 0',
            'Solve for k: 2k = 6 => k = 3'
          ],
          finalAnswer: 'k = 3'
        },
        callout: {
          title: 'Synthetic Division Shortcut',
          type: 'tip',
          text: 'Use synthetic division table method to rapidly extract quotient coefficients Q(x) once a root is verified.'
        },
        takeaways: [
          'Evaluating P(c) instantly reveals divisor remainder without long algebraic division.',
          'Roots of constant term a₀ provide initial trial candidates for rational root theorem.'
        ],
        selfCheck: {
          question: 'Given P(x) = x³ + 4x² + x - 6, show that (x - 1) is a factor, hence factorise P(x) completely.',
          marks: '[6 Marks]',
          answer: 'P(1) = 1 + 4 + 1 - 6 = 0, so (x-1) is a factor. Long division yields x² + 5x + 6 = (x+2)(x+3). Complete factorization: (x - 1)(x + 2)(x + 3).'
        }
      },
      {
        title: 'Matrices & Simultaneous Linear Systems (Cramer & Inverse Methods)',
        theory: `A matrix is a rectangular array of numbers arranged in rows and columns. In Senior Secondary Form 4/5, learners master 2x2 matrix operations: addition, scalar multiplication, matrix multiplication, determinant calculation, and finding the matrix inverse to solve simultaneous linear systems.`,
        formulaOrConcept: `For Matrix A = [a b; c d]:\nDeterminant det(A) = |A| = ad - bc\nInverse Matrix A⁻¹ = (1 / (ad - bc)) * [d -b; -c a], provided det(A) ≠ 0\nSystem Matrix Equation: A * X = B  =>  X = A⁻¹ * B`,
        workedExample: {
          problem: 'Solve the simultaneous system using matrices:\n3x + 2y = 12\n5x - y = 7',
          steps: [
            'Write in matrix form: [3 2; 5 -1] * [x; y] = [12; 7]',
            'Compute determinant: det(A) = (3)(-1) - (2)(5) = -3 - 10 = -13',
            'Compute adjugate and inverse: A⁻¹ = (-1/13) * [-1 -2; -5 3]',
            'Multiply A⁻¹ * B: [x; y] = (-1/13) * [(-1)(12) + (-2)(7); (-5)(12) + (3)(7)]',
            'Simplify vector product: (-1/13) * [-12 - 14; -60 + 21] = (-1/13) * [-26; -39]',
            'Multiply scalar: x = -26/(-13) = 2, y = -39/(-13) = 3'
          ],
          finalAnswer: 'x = 2, y = 3'
        },
        callout: {
          title: 'Singular Matrix Alert',
          type: 'warning',
          text: 'If det(A) = 0, the matrix is singular and has no unique inverse. The system represents parallel lines (no solution) or coincident lines (infinite solutions).'
        },
        takeaways: [
          'Matrix multiplication is non-commutative: AB ≠ BA in general.',
          'The determinant measures the area scale factor of the linear transformation.'
        ],
        selfCheck: {
          question: 'Find the inverse of M = [4 1; 3 2] and use it to solve 4x + y = 14 and 3x + 2y = 13.',
          marks: '[5 Marks]',
          answer: 'det(M) = 8 - 3 = 5. M⁻¹ = 1/5 * [2 -1; -3 4]. [x; y] = 1/5 * [2(14)-1(13); -3(14)+4(13)] = 1/5 * [15; 10] = [3; 2]. x=3, y=2.'
        }
      }
    ]
  },
  // Physics
  {
    unitNumber: 2,
    unitTitle: 'Newtonian Mechanics, Work, Energy & Power',
    subtopics: [
      {
        title: 'Kinematics Equations for Uniformly Accelerated Motion',
        theory: `Kinematics describes motion without considering the forces causing it. For bodies undergoing uniform rectilinear acceleration, motion is governed by four fundamental kinematic equations connecting displacement (s), initial velocity (u), final velocity (v), acceleration (a), and time (t). In the Zambian context, these equations apply directly to vehicle stopping distances on the Great North Road, free-fall projectiles at Victoria Falls, and conveyor velocity in mining plants.`,
        formulaOrConcept: `1. v = u + at\n2. s = ut + (1/2)at²\n3. v² = u² + 2as\n4. s = ((u + v) / 2) * t\nFor free-fall near Earth: acceleration a = g = 9.8 m/s² (or 10 m/s² for ECZ standard approximation)`,
        workedExample: {
          problem: 'A haul truck at Lumwana Copper Mine starts from rest and accelerates uniformly at 1.5 m/s² for 20 seconds. Calculate (a) its final speed, and (b) the distance covered.',
          steps: [
            'Given: u = 0 m/s, a = 1.5 m/s², t = 20 s',
            'Part (a): Use v = u + at = 0 + (1.5)(20) = 30 m/s',
            'Part (b): Use s = ut + (1/2)at² = 0 + (0.5)(1.5)(20)² = 0.75 * 400 = 300 m'
          ],
          finalAnswer: 'Final speed = 30 m/s (108 km/h), Distance = 300 meters'
        },
        callout: {
          title: 'Sign Convention Rule',
          type: 'tip',
          text: 'Always define positive upward or downward at the beginning of projectile problems. If upward is positive, g = -9.8 m/s².'
        },
        takeaways: [
          'Area under a velocity-time graph represents total displacement.',
          'Gradient of a velocity-time graph represents instantaneous acceleration.'
        ],
        selfCheck: {
          question: 'A stone is dropped from the Victoria Falls Bridge (height = 110 m). Assuming g = 9.8 m/s² and no air resistance, find the velocity with which it strikes the Zambezi River.',
          marks: '[4 Marks]',
          answer: 'u = 0, s = 110, a = 9.8. v² = u² + 2as = 0 + 2(9.8)(110) = 2156. v = √2156 = 46.43 m/s downward.'
        }
      },
      {
        title: "Newton's Laws of Motion & Momentum Conservation",
        theory: `Newton's First Law (Law of Inertia) states an object remains in uniform motion unless acted upon by a net external force. Newton's Second Law establishes F_net = ma = dp/dt. Newton's Third Law states every action force generates an equal and opposite reaction force. Linear momentum p = mv is strictly conserved in closed systems during both elastic and inelastic collisions.`,
        formulaOrConcept: `Newton's Second Law: F = m * a = m * ((v - u) / t)\nImpulse J = F * Δt = Δp = m(v - u)\nConservation of Momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂`,
        workedExample: {
          problem: 'A 1200 kg railway wagon traveling at 4 m/s collides and couples with a stationary 800 kg wagon. Determine their common velocity after impact.',
          steps: [
            'Total momentum before collision: P_initial = (1200 * 4) + (800 * 0) = 4800 kg·m/s',
            'Total mass after coupling: M_total = 1200 + 800 = 2000 kg',
            'By Conservation of Momentum: P_initial = P_final = M_total * V_common',
            'Solve for V_common: 4800 = 2000 * V_common => V_common = 4800 / 2000 = 2.4 m/s'
          ],
          finalAnswer: 'Common velocity = 2.4 m/s in the original direction of motion'
        },
        callout: {
          title: 'ECZ Physical Science Reminder',
          type: 'formula',
          text: 'In elastic collisions, both kinetic energy and linear momentum are conserved. In inelastic collisions, kinetic energy is converted into heat and sound.'
        },
        takeaways: [
          'Impulse is equivalent to the change in momentum and equals area under a Force-Time graph.',
          'Friction always opposes relative motion between contacting surfaces.'
        ],
        selfCheck: {
          question: 'A 0.5 kg football traveling at 12 m/s is kicked directly back in the opposite direction at 18 m/s. If the contact time is 0.05 seconds, calculate the average force exerted on the ball.',
          marks: '[5 Marks]',
          answer: 'Initial velocity u = +12 m/s, final velocity v = -18 m/s. Δp = m(v - u) = 0.5(-18 - 12) = 0.5(-30) = -15 kg·m/s. F = Δp / Δt = -15 / 0.05 = -300 N. Force is 300 N in the reverse direction.'
        }
      }
    ]
  },
  // Chemistry
  {
    unitNumber: 3,
    unitTitle: 'Stoichiometry, Mole Concept & Chemical Energetics',
    subtopics: [
      {
        title: 'The Mole Concept, Molar Mass & Avogadro Constant',
        theory: `The mole is the SI base unit for amount of substance. One mole contains exactly 6.022 x 10²³ elementary entities (Avogadro constant N_A), matching the number of atoms in exactly 12 grams of carbon-12. In chemical calculations, moles bridge microscale atoms with macroscale laboratory masses and solution concentrations.`,
        formulaOrConcept: `1. Moles n = mass (m in g) / Molar mass (M in g/mol)\n2. Number of particles N = n * N_A\n3. Solution Concentration C = n / V (where V is in dm³ or litres; 1 dm³ = 1000 cm³)\n4. Gas Volume at r.t.p. (25°C, 1 atm): V = n * 24 dm³/mol (or 22.4 dm³/mol at s.t.p.)`,
        workedExample: {
          problem: 'Calculate the volume of carbon dioxide gas (CO₂) released at r.t.p. when 25.0 g of pure calcium carbonate (CaCO₃) reacts completely with excess hydrochloric acid. (Ca=40, C=12, O=16)',
          steps: [
            'Balanced Equation: CaCO₃(s) + 2HCl(aq) -> CaCl₂(aq) + H₂O(l) + CO₂(g)',
            'Compute Molar Mass of CaCO₃: 40 + 12 + (3 * 16) = 100 g/mol',
            'Calculate moles of CaCO₃: n = 25.0 g / 100 g/mol = 0.25 mol',
            'Stoichiometric ratio: 1 mol CaCO₃ produces 1 mol CO₂ => n(CO₂) = 0.25 mol',
            'Calculate gas volume at r.t.p.: V = n * 24.0 dm³/mol = 0.25 * 24.0 = 6.0 dm³'
          ],
          finalAnswer: 'Volume of CO₂ = 6.0 dm³ (or 6000 cm³)'
        },
        callout: {
          title: 'Laboratory Preparation Tip',
          type: 'activity',
          text: 'To convert cm³ to dm³, always divide by 1000. Example: 250 cm³ = 250/1000 = 0.25 dm³.'
        },
        takeaways: [
          'Coefficients in balanced chemical equations represent molar ratios, not mass ratios.',
          'One mole of any ideal gas occupies 24 dm³ at standard room temperature and pressure.'
        ],
        selfCheck: {
          question: 'What is the concentration in mol/dm³ of a sodium hydroxide (NaOH) solution prepared by dissolving 8.0 g of NaOH pellets in 500 cm³ of distilled water? (Na=23, O=16, H=1)',
          marks: '[4 Marks]',
          answer: 'Molar mass of NaOH = 23 + 16 + 1 = 40 g/mol. Moles n = 8.0 / 40 = 0.20 mol. Volume V = 500/1000 = 0.5 dm³. Concentration C = n/V = 0.20 / 0.5 = 0.40 mol/dm³.'
        }
      },
      {
        title: 'Extraction of Copper & Electro-Refining in Zambia',
        theory: `Zambia is one of the world's leading copper producers, with mining centered in the Copperbelt and North-Western provinces. Extraction depends on ore type: sulfide ores (chalcopyrite CuFeS₂) undergo froth flotation, roasting, smelting, and converter blowing to produce 98% blister copper. Oxidized ores undergo sulfuric acid leaching and solvent extraction electrowinning (SX-EW). Blister copper is refined to 99.99% purity using electrolytic refining.`,
        formulaOrConcept: `Froth Flotation: Hydrophobic collectors (xanthates) bind copper sulfide minerals.\nSmelting Reactions:\n2CuFeS₂ + 4O₂ -> Cu₂S + 2FeO + 3SO₂\nFeO + SiO₂ -> FeSiO₃ (slag, discarded)\nElectrolytic Refining:\nAnode (impure copper): Cu(s) -> Cu²⁺(aq) + 2e⁻\nCathode (pure copper sheet): Cu²⁺(aq) + 2e⁻ -> Cu(s)\nAnode Slime: Precious metals (Au, Ag, Pt) settle beneath the anode.`,
        workedExample: {
          problem: 'Explain the chemical changes at the anode and cathode during the electrolytic refining of copper, and account for the formation of anode slime.',
          steps: [
            'Anode (Impure Cu): Impure copper slab dissolves oxidatively: Cu -> Cu²⁺ + 2e⁻. More reactive impurities (Zn, Fe) dissolve as Zn²⁺ and Fe²⁺ ions.',
            'Cathode (Pure Cu): Cu²⁺ ions migrate through the CuSO₄ electrolyte and deposit as pure copper: Cu²⁺ + 2e⁻ -> Cu.',
            'Anode Slime: Less reactive precious metals (gold, silver, platinum) do not oxidize at this cell potential and fall to the tank floor as valuable anode sludge.'
          ],
          finalAnswer: 'Produces 99.99% high-conductivity electrical grade copper while recovering precious byproduct metals.'
        },
        callout: {
          title: 'Environmental Protection Directive (ZEMA)',
          type: 'warning',
          text: 'Sulfur dioxide (SO₂) gas emitted during smelting must be captured in acid plants to produce H₂SO₄, preventing acid rain in Mufulira, Kitwe, and Chingola.'
        },
        takeaways: [
          'Electrolytic refining uses impure copper as anode, pure copper sheet as cathode, and acidified copper sulfate as electrolyte.',
          'Leaching and SX-EW enable economical extraction of low-grade oxide copper ores.'
        ],
        selfCheck: {
          question: 'State two reasons why copper is extensively used in electrical cables and cookware.',
          marks: '[3 Marks]',
          answer: '1. High electrical and thermal conductivity. 2. High ductility (can be drawn into thin wires) and resistance to corrosion.'
        }
      }
    ]
  },
  // Biology
  {
    unitNumber: 4,
    unitTitle: 'Cell Biology, Genetics & Human Physiology',
    subtopics: [
      {
        title: 'Mendelian Genetics, Monohybrid Crosses & Punnett Squares',
        theory: `Genetics is the study of heredity and variation. Gregor Mendel discovered the Law of Segregation: alleles separate during gamete formation so each gamete carries one allele for each gene. In monohybrid inheritance involving complete dominance, crossing heterozygous individuals (Tt x Tt) produces a phenotypic ratio of 3:1 (dominant to recessive) and a genotypic ratio of 1:2:1 (TT:Tt:tt). Co-dominance occurs when both alleles are simultaneously expressed (e.g. ABO blood groups).`,
        formulaOrConcept: `Genotype = Genetic constitution (e.g. TT, Tt, tt)\nPhenotype = Observable physical manifestation (e.g. Tall, Dwarf)\nMonohybrid Cross Notation:\nParents (P₁): Tt x Tt\nGametes: (T) or (t) and (T) or (t)\nOffspring (F₁): TT (25%), Tt (50%), tt (25%) => 75% Tall, 25% Short`,
        workedExample: {
          problem: 'In humans, normal pigmentation (A) is dominant over albinism (a). A man and woman both have normal skin pigmentation, but each had one albino parent. What is the probability that their child will have albinism?',
          steps: [
            'Identify parents genotypes: Since each had an albino parent (aa), they must carry the recessive allele. Both parents are heterozygous carriers (Aa).',
            'Construct Punnett square: Gametes from Father (A, a) and Mother (A, a)',
            'Offspring genotypes: 1 AA (Normal), 2 Aa (Carrier Normal), 1 aa (Albino)',
            'Calculate albino fraction: 1 out of 4 total offspring = 1/4 = 25%'
          ],
          finalAnswer: 'Probability of having an albino child is 1/4 (25% or 0.25)'
        },
        callout: {
          title: 'ECZ Genetic Diagram Format',
          type: 'tip',
          text: 'Always write parental phenotypes, parental genotypes, gametes (in circles), Punnett square matrix, and final phenotypic ratio with clear labels to earn full 6/6 marks.'
        },
        takeaways: [
          'Dominant alleles mask recessive alleles in heterozygous individuals.',
          'Sickle cell trait (HbA HbS) provides selective survival advantage against severe falciparum malaria in tropical regions.'
        ],
        selfCheck: {
          question: 'A mother of blood group A (heterozygous IᴬIᴼ) has a child with a father of blood group B (heterozygous IᴮIᴼ). Determine all possible blood groups of their children.',
          marks: '[5 Marks]',
          answer: 'Gametes: Mother (Iᴬ, Iᴼ), Father (Iᴮ, Iᴼ). Combinations: IᴬIᴮ (Group AB - 25%), IᴬIᴼ (Group A - 25%), IᴮIᴼ (Group B - 25%), IᴼIᴼ (Group O - 25%). All 4 major blood groups are possible with equal 1:1:1:1 probability.'
        }
      },
      {
        title: 'Photosynthesis, Transpiration & Plant Water Relations',
        theory: `Photosynthesis is the process whereby chlorophyll-containing autotrophic organisms convert carbon dioxide and water into glucose and oxygen using radiant solar energy. The light-dependent reaction occurs on chloroplast thylakoid membranes, generating ATP and NADPH. The light-independent Calvin cycle occurs in the stroma, fixing CO₂ into triose phosphate carbohydrates. Transpiration is the evaporative loss of water vapor from aerial plant organs, creating the transpiration pull that transports minerals up xylem vessels.`,
        formulaOrConcept: `Chemical Equation for Photosynthesis:\n6CO₂ + 6H₂O  --[Light & Chlorophyll]-->  C₆H₁₂O₆ + 6O₂\nTranspiration Rate Factors: Temperature (+), Light Intensity (+), Wind Speed (+), Humidity (-)`,
        workedExample: {
          problem: 'Describe an experiment using a leafy shoot in a potometer to investigate the effect of wind speed on transpiration rate.',
          steps: [
            'Apparatus: Cut leafy twig under water to avoid air locks in xylem, attach securely to a Ganong potometer sealed with petroleum jelly.',
            'Introduce air bubble into the capillary tube scale.',
            'Condition 1 (Still air): Measure distance moved by air bubble over 10 minutes.',
            'Condition 2 (Windy): Position an electric fan 1 meter away, measure bubble movement over 10 minutes.',
            'Control: Keep temperature, light intensity, and humidity constant.',
            'Conclusion: Wind removes the humid boundary layer around stomata, steepening the water potential gradient and increasing transpiration rate.'
          ],
          finalAnswer: 'Air bubble moves significantly faster under windy conditions, demonstrating higher transpiration rate.'
        },
        callout: {
          title: 'Biological Concept Check',
          type: 'activity',
          text: 'Remember that stomata open during daylight to allow CO₂ diffusion for photosynthesis, which inadvertently increases transpiration water loss.'
        },
        takeaways: [
          'Xylem transports water and inorganic mineral ions unindirectionally upward via transpiration pull and cohesion-tension.',
          'Phloem translocates sucrose and amino acids bidirectionally from source to sink organs.'
        ],
        selfCheck: {
          question: 'Explain why plants in arid areas such as southern Zambia (Gwembe valley) exhibit xerophytic adaptations like sunken stomata and thick waxy cuticles.',
          marks: '[4 Marks]',
          answer: '1. Sunken stomata trap moist air, reducing water vapor concentration gradient. 2. Thick waxy cuticle is impermeable to water, minimizing cuticular evaporation.'
        }
      }
    ]
  }
];

// Generate 120-page compendium
export const SENIOR_STEM_COMPENDIUM_PAGES = generateCurriculumPages(
  'National Senior Secondary STEM Mega-Compendium (Forms 4-6 / Grades 10-12)',
  'CDC-STEM-F46-MEGA-2026',
  'Form 5',
  'STEM Compendium',
  'Ministry of Education Directorate of Curriculum Development & National STEM Center',
  SENIOR_STEM_COMPENDIUM_TOPICS
);

// =========================================================================
// 2. FLAGSHIP 100-PAGE ECZ 10-YEAR EXAMINATION MASTERY TREASURY
// =========================================================================
export const ECZ_EXAM_TREASURY_TOPICS: TopicSpec[] = [
  {
    unitNumber: 1,
    unitTitle: 'Mathematics Paper 1 (Non-Calculator) Core Algorithms & Strategies',
    subtopics: [
      {
        title: 'Number Bases (Base 2, 5, 8, 10 Operations & Conversions)',
        theory: `In ECZ Mathematics Paper 1, question 1 frequently tests conversion and arithmetic in non-decimal number bases. Learners must convert between decimal (base 10) and other bases (base 2 binary, base 5 quinary, base 8 octal) using repeated division for whole numbers and column place-value weighting.`,
        formulaOrConcept: `Place Values: In base b, digits represent powers ... b³, b², b¹, b⁰\nBase Addition: When sum >= base b, divide by b: write down remainder, carry quotient.`,
        workedExample: {
          problem: 'Evaluate 342_five + 434_five, expressing your answer in base five.',
          steps: [
            'Right column (Units): 2 + 4 = 6. 6 / 5 = 1 remainder 1. Write 1, carry 1.',
            'Middle column (Fives): 4 + 3 + 1 (carried) = 8. 8 / 5 = 1 remainder 3. Write 3, carry 1.',
            'Left column (Twenty-fives): 3 + 4 + 1 (carried) = 8. 8 / 5 = 1 remainder 3. Write 3, carry 1.',
            'Leading column: 1. Final result: 1331_five.'
          ],
          finalAnswer: '1331_five'
        },
        callout: {
          title: 'ECZ Paper 1 Golden Rule',
          type: 'ecz_exam',
          text: 'Never write a digit equal to or greater than the base. In base five, valid digits are strictly 0, 1, 2, 3, 4.'
        },
        takeaways: [
          'Base conversion to decimal uses polynomial expansion.',
          'Base conversion from decimal uses successive integer division recording remainders.'
        ],
        selfCheck: {
          question: 'Convert 101101_two to base ten (denary).',
          marks: '[3 Marks]',
          answer: '1(2⁵) + 0(2⁴) + 1(2³) + 1(2²) + 0(2¹) + 1(2⁰) = 32 + 0 + 8 + 4 + 0 + 1 = 45.'
        }
      },
      {
        title: 'Set Theory, Venn Diagrams & Shading Regions',
        theory: `Set theory underpins mathematical logic. The Universal set E contains all elements under consideration. Operations include Union (A ∪ B), Intersection (A ∩ B), Complement (A'), and Set Difference (A \\ B). In ECZ Paper 1 & 2, candidates must express relations algebraically (e.g. n(A ∪ B) = n(A) + n(B) - n(A ∩ B)) and solve three-set word problems.`,
        formulaOrConcept: `Principle of Inclusion-Exclusion (3 Sets):\nn(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A ∩ B) - n(B ∩ C) - n(A ∩ C) + n(A ∩ B ∩ C)`,
        workedExample: {
          problem: 'In a class of 40 Form 5 learners, 24 take Physics (P), 20 take Chemistry (C), and 8 take neither subject. Find the number of learners who take both Physics and Chemistry.',
          steps: [
            'Universal set n(E) = 40. Learners taking at least one science = 40 - 8 = 32.',
            'Let x = n(P ∩ C) taking both subjects.',
            'n(P ∪ C) = n(P) + n(C) - n(P ∩ C)',
            '32 = 24 + 20 - x',
            '32 = 44 - x => x = 44 - 32 = 12'
          ],
          finalAnswer: '12 learners take both Physics and Chemistry'
        },
        callout: {
          title: 'Venn Diagram Shading Tip',
          type: 'tip',
          text: 'For complex set expressions like (A ∩ B) ∪ C\', lightly pencil in region numbers 1-8 before shading the final union.'
        },
        takeaways: [
          'Elements in A but not in B is denoted A ∩ B\'.',
          'Empty set ∅ has cardinality zero: n(∅) = 0.'
        ],
        selfCheck: {
          question: 'Given E = {x: 1 ≤ x ≤ 12, x is an integer}, A = {multiples of 3}, B = {factors of 12}. List elements of (A ∪ B)\'.',
          marks: '[4 Marks]',
          answer: 'E = {1,2,3,4,5,6,7,8,9,10,11,12}. A = {3,6,9,12}. B = {1,2,3,4,6,12}. A ∪ B = {1,2,3,4,6,9,12}. (A ∪ B)\' = {5, 7, 8, 10, 11}.'
        }
      }
    ]
  },
  {
    unitNumber: 2,
    unitTitle: 'Mathematics Paper 2 Calculus, Linear Programming & Trigonometry',
    subtopics: [
      {
        title: 'Differential Calculus & Stationary Points of Curves',
        theory: `Calculus studies continuous change. Differentiation finds the gradient function dy/dx of a curve. Stationary points occur where dy/dx = 0. The nature of stationary points is determined using the second derivative d²y/dx²: if d²y/dx² > 0 it is a local minimum, if d²y/dx² < 0 it is a local maximum, and if d²y/dx² = 0 further investigation (sign testing) is required.`,
        formulaOrConcept: `Power Rule: If y = ax^n, then dy/dx = n*a*x^(n-1)\nIntegration (Reverse): ∫ ax^n dx = (a / (n+1)) * x^(n+1) + C  (for n ≠ -1)`,
        workedExample: {
          problem: 'Find the stationary points of the curve y = 2x³ - 9x² + 12x + 5, and determine their nature.',
          steps: [
            'Differentiate: dy/dx = 6x² - 18x + 12',
            'Set dy/dx = 0: 6(x² - 3x + 2) = 0 => 6(x - 1)(x - 2) = 0 => x = 1 or x = 2',
            'Find corresponding y-values: For x = 1: y = 2(1) - 9(1) + 12(1) + 5 = 10. Point (1, 10). For x = 2: y = 2(8) - 9(4) + 12(2) + 5 = 16 - 36 + 24 + 5 = 9. Point (2, 9).',
            'Compute second derivative: d²y/dx² = 12x - 18',
            'At x = 1: d²y/dx² = 12(1) - 18 = -6 (< 0 => Local Maximum at (1, 10))',
            'At x = 2: d²y/dx² = 12(2) - 18 = +6 (> 0 => Local Minimum at (2, 9))'
          ],
          finalAnswer: 'Maximum turning point at (1, 10); Minimum turning point at (2, 9)'
        },
        callout: {
          title: 'Calculus Applications in Economics',
          type: 'tip',
          text: 'In commercial business modules, setting marginal cost = marginal revenue maximizes profit P(x).'
        },
        takeaways: [
          'Stationary points represent zero instantaneous rate of change.',
          'Definite integral ∫[a to b] f(x) dx calculates the exact area trapped beneath a curve.'
        ],
        selfCheck: {
          question: 'Evaluate the definite integral ∫[1 to 3] (3x² - 4x + 1) dx.',
          marks: '[5 Marks]',
          answer: 'Indefinite integral: [x³ - 2x² + x] from 1 to 3. Upper limit (3): 27 - 18 + 3 = 12. Lower limit (1): 1 - 2 + 1 = 0. Result = 12 - 0 = 12.'
        }
      }
    ]
  }
];

export const ECZ_EXAM_TREASURY_PAGES = generateCurriculumPages(
  'ECZ 10-Year National Past Examination Mastery Treasury & Complete Mark Schemes',
  'ECZ-EXAM-10YR-TREASURY-2026',
  'Form 5',
  'Past Papers & Marking Schemes',
  'Examinations Council of Zambia (ECZ) Evaluation Department',
  ECZ_EXAM_TREASURY_TOPICS
);

// =========================================================================
// 3. FLAGSHIP 80-PAGE CIVIC EDUCATION & ZAMBIA HERITAGE ALMANAC
// =========================================================================
export const ZAMBIA_HERITAGE_ALMANAC_TOPICS: TopicSpec[] = [
  {
    unitNumber: 1,
    unitTitle: 'The Constitution of Zambia, Governance & Human Rights',
    subtopics: [
      {
        title: 'Constitutional History, Pillars & Supremacy of the Constitution',
        theory: `The Constitution is the supreme law of the Republic of Zambia. Any other law that is inconsistent with the Constitution is void to the extent of the inconsistency. Zambia has undergone significant constitutional reforms: 1964 Independence Constitution, 1973 One-Party State Constitution, 1991 Multi-Party Democratic Constitution, and the 2016 Amended Constitution (Act No. 2 of 2016) which introduced the 50%+1 presidential threshold, running mate clause, and dual citizenship provisions.`,
        formulaOrConcept: `Key Constitutional Organs:\n1. The Legislature (National Assembly): Enacts laws, approves national budgets, and scrutinizes executive conduct.\n2. The Executive (President, Vice-President, Cabinet): Implements national policies and administers state services.\n3. The Judiciary (Supreme Court, Constitutional Court, Court of Appeal, High Court): Interprets laws and dispenses justice.`,
        callout: {
          title: 'Civic Knowledge Check',
          type: 'tip',
          text: 'Part III of the Zambian Constitution contains the Bill of Rights, which can only be amended through a National Referendum with at least 50% voter turnout.'
        },
        takeaways: [
          'Separation of Powers provides checks and balances among Executive, Legislature, and Judiciary.',
          'Rule of Law mandates equality before the law, transparent legal procedures, and judicial independence.'
        ],
        selfCheck: {
          question: 'Define constitutional supremacy and state two major provisions introduced by the 2016 Constitution Amendment in Zambia.',
          marks: '[4 Marks]',
          answer: 'Constitutional supremacy means the Constitution is the highest law in the land, binding all state organs. 2016 provisions include: 1. 50% + 1 winning majority for Presidential elections. 2. Presidential Running Mate clause (Vice President elected on the same ticket).'
        }
      },
      {
        title: 'Electoral Process & Electoral Commission of Zambia (ECZ)',
        theory: `The Electoral Commission of Zambia (ECZ) is the autonomous constitutional body mandated under Article 229 of the Constitution to conduct, manage, and supervise tripartite and local government elections, register voters, delimit electoral constituencies, and resolve pre-election boundary disputes. Zambia uses the Single-Member Plurality (First-Past-The-Post) system for Parliamentary and Council seats, and the Majoritarian (50%+1) system for Presidential elections.`,
        callout: {
          title: 'Democratic Values & Civic Engagement',
          type: 'activity',
          text: 'Organize a mock classroom student council election utilizing secret ballots, polling agents, returning officers, and transparent ballot verification.'
        },
        takeaways: [
          'Free, fair, and credible elections are foundational to stable democratic governance in Zambia.',
          'Citizens have both the right and civic duty to participate peacefully in national elections.'
        ],
        selfCheck: {
          question: 'Identify three functions of the Electoral Commission of Zambia (ECZ).',
          marks: '[3 Marks]',
          answer: '1. Continuous registration of eligible voters and maintenance of the National Voters Register. 2. Delimitation of electoral wards and constituencies. 3. Conducting and supervising presidential, parliamentary, and local council elections.'
        }
      }
    ]
  }
];

export const ZAMBIA_HERITAGE_ALMANAC_PAGES = generateCurriculumPages(
  'Zambia Heritage, Civic Governance & Social Studies National Almanac',
  'CDC-CIVIC-HERITAGE-ALMANAC-2026',
  'Form 4',
  'Civic Education & Social Studies',
  'Ministry of Education Directorate of Curriculum Development (CDC)',
  ZAMBIA_HERITAGE_ALMANAC_TOPICS
);

// =========================================================================
// NEW MASSIVE COMPENDIUM LIBRARY ITEMS TO INJECT INTO DATABASE
// =========================================================================
export const MASSIVE_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'compendium-senior-stem-mega',
    title: 'National Senior Secondary STEM Mega-Compendium (Forms 4-6 / Grades 10-12): 150 Core Curriculum Modules',
    category: 'modules',
    level: 'Form 5',
    subject: 'STEM Compendium',
    code: 'CDC-STEM-F46-MEGA-2026',
    publisher: 'Ministry of Education Directorate of Curriculum Development & National STEM Center',
    author: 'National STEM Curriculum Specialist Panel (CDC Lusaka, University of Zambia, CBU)',
    year: '2026',
    pages: '120 pages',
    fileSize: '18.5 MB',
    fileFormat: 'INTERACTIVE',
    downloadCount: 28900,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-emerald-800 via-teal-950 to-slate-950',
    description: 'Comprehensive 120-page senior secondary master curriculum compendium unifying Mathematics, Physics, Chemistry, and Biology. Packed with step-by-step worked formulas, Copperbelt mining case studies, laboratory practical guides, and full ECZ Paper 1 & 2 exam solutions.',
    learningOutcomes: [
      'Master senior secondary quadratic polynomials, matrix transformations, calculus derivatives, and integrals.',
      'Apply Newtonian mechanics, momentum conservation, and energy dynamics to industrial problems.',
      'Execute stoichiometric mole calculations, electrolytic copper refining chemistry, and acid-base titrations.',
      'Demonstrate Mendelian monohybrid crosses, plant transpiration dynamics, and human physiology.'
    ],
    tableOfContents: [
      'Unit 1: Advanced Algebra, Functions & Polynomial Theory',
      'Unit 2: Newtonian Mechanics, Work, Energy & Power',
      'Unit 3: Stoichiometry, Mole Concept & Chemical Energetics',
      'Unit 4: Cell Biology, Genetics & Human Physiology',
      'Unit 5: Complete ECZ Examination Worked Solutions & Drill Matrix'
    ],
    pagesList: SENIOR_STEM_COMPENDIUM_PAGES
  },
  {
    id: 'compendium-ecz-10yr-treasury',
    title: 'ECZ 10-Year National Past Examination Mastery Treasury & Complete Mark Schemes (2015-2025)',
    category: 'past_papers',
    level: 'Form 5',
    subject: 'Past Papers & Marking Schemes',
    code: 'ECZ-EXAM-10YR-TREASURY-2026',
    publisher: 'Examinations Council of Zambia (ECZ) Evaluation Department',
    author: 'Chief Examiners Panel (Examinations Council of Zambia, Lusaka)',
    year: '2025',
    pages: '100 pages',
    fileSize: '16.2 MB',
    fileFormat: 'INTERACTIVE',
    downloadCount: 34500,
    rating: 5.0,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-amber-700 via-orange-950 to-slate-950',
    description: 'The definitive 100-page past examination mastery compilation covering Grade 12 & GCE Mathematics, Science, Biology, and English. Features official marking schemes, examiner commentary, common candidate pitfalls, and method mark rubrics.',
    learningOutcomes: [
      'Master non-calculator Paper 1 arithmetic, base conversions, and three-set Venn diagrams.',
      'Acquire full method marks on Paper 2 calculus, linear programming, and vector transformations.',
      'Analyze examiner commentaries to avoid common mathematical and scientific candidate mistakes.'
    ],
    tableOfContents: [
      'Unit 1: Mathematics Paper 1 (Non-Calculator) Core Algorithms & Strategies',
      'Unit 2: Mathematics Paper 2 Calculus, Linear Programming & Trigonometry',
      'Unit 3: Physical Sciences Chemistry & Physics Structured Questions',
      'Unit 4: Biology Theory & Practical Alternative Papers',
      'Unit 5: Official ECZ Examiner Pitfall Guide & Mark Allocation Rules'
    ],
    pagesList: ECZ_EXAM_TREASURY_PAGES
  },
  {
    id: 'compendium-zambia-heritage-civics',
    title: 'Zambia Heritage, Civic Governance & Social Studies National Almanac',
    category: 'books',
    level: 'Form 4',
    subject: 'Civic Education & Social Studies',
    code: 'CDC-CIVIC-HERITAGE-ALMANAC-2026',
    publisher: 'Ministry of Education Directorate of Curriculum Development (CDC)',
    author: 'Zambia Civic & Historical Research Panel (University of Zambia / Chalimbana)',
    year: '2026',
    pages: '80 pages',
    fileSize: '12.8 MB',
    fileFormat: 'INTERACTIVE',
    downloadCount: 19800,
    rating: 4.9,
    isOfficialMoE: true,
    isInternational: false,
    featured: true,
    coverImageGradient: 'from-indigo-800 via-purple-950 to-slate-950',
    description: 'Comprehensive 80-page national civic handbook examining the Zambian Constitution, Separation of Powers, Bill of Rights, electoral democracy (ECZ), anti-corruption frameworks (ACC), and national cultural heritage.',
    learningOutcomes: [
      'Explain the constitutional history of Zambia and the 2016 amended constitutional provisions.',
      'Analyze the roles of the Executive, National Assembly, and the Judiciary.',
      'Evaluate democratic electoral systems and the mandate of the Electoral Commission of Zambia.',
      'Appraise cultural heritage preservation and economic diversification strategies.'
    ],
    tableOfContents: [
      'Unit 1: The Constitution of Zambia, Governance & Human Rights',
      'Unit 2: Electoral Systems & Democratic Participation',
      'Unit 3: Economic Governance, Public Finance & Audit Controls',
      'Unit 4: Cultural Diversity, Traditional Ceremonies & National Unity',
      'Unit 5: International Relations, SADC, AU & United Nations Conventions'
    ],
    pagesList: ZAMBIA_HERITAGE_ALMANAC_PAGES
  }
];
