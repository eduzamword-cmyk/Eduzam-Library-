/**
 * Republic of Zambia - Ministry of Education
 * Curriculum Development Centre (CDC) & National e-Library Knowledge Engine
 * 
 * Provides real-time curriculum retrieval, competence-based outcome mapping,
 * and comprehensive progression stage matrices across all educational levels and subjects.
 */

export type LessonNature = 'theory' | 'practical' | 'fieldwork' | 'revision';

export interface StageDistribution {
  introMin: string;
  devMin: string;
  appMin: string;
  concMin: string;
}

/**
 * Intelligent Lesson Stage Minutes Calculator according to total duration and lesson nature.
 * For practical/fieldwork lessons, significantly MORE time is awarded to the Hands-on Practical/Application stage.
 */
export function calculateStageMinutes(
  totalMinutes: number | string,
  nature: LessonNature = 'theory'
): StageDistribution {
  const total = Math.max(15, parseInt(String(totalMinutes), 10) || 80);

  let introPct = 0.125;
  let devPct = 0.50;
  let appPct = 0.25;
  let concPct = 0.125;

  if (nature === 'practical' || nature === 'fieldwork') {
    // For practical/hands-on lessons, award major time share (55% - 65%) to Practical Execution / Hands-on Experimentation Stage
    introPct = 0.12; // Quick safety hook & briefing
    devPct = 0.18;  // Concise procedure demonstration
    appPct = 0.58;  // MAJORITY OF TIME AWARDED TO PRACTICAL/HANDS-ON WORK
    concPct = 0.12; // Cleanup, data review & wrap-up
  } else if (nature === 'revision') {
    // Revision / Timed Assessment
    introPct = 0.10;
    devPct = 0.20;
    appPct = 0.55;  // Extensive assessment drills
    concPct = 0.15;
  } else {
    // Standard Theory / Classroom Instruction
    introPct = 0.125; // 10m out of 80m
    devPct = 0.50;   // 40m out of 80m
    appPct = 0.25;   // 20m out of 80m
    concPct = 0.125; // 10m out of 80m
  }

  let intro = Math.max(2, Math.round(total * introPct));
  let dev = Math.max(3, Math.round(total * devPct));
  let conc = Math.max(2, Math.round(total * concPct));
  let app = total - (intro + dev + conc);

  // Guarantee that in practical mode, appMin receives >= 50% of total lesson time
  if ((nature === 'practical' || nature === 'fieldwork') && app < Math.floor(total * 0.5)) {
    const boost = Math.floor(total * 0.5) - app;
    app += boost;
    if (dev - boost >= 3) {
      dev -= boost;
    } else {
      const remainder = boost - (dev - 3);
      dev = 3;
      intro = Math.max(2, intro - remainder);
    }
  }

  // Exact sanity check to make sure sum equals total duration
  const currentSum = intro + dev + app + conc;
  if (currentSum !== total) {
    app += (total - currentSum);
  }

  return {
    introMin: String(intro),
    devMin: String(dev),
    appMin: String(app),
    concMin: String(conc)
  };
}

/**
 * Auto-detect lesson nature based on subject and topic keywords
 */
export function autoDetectLessonNature(subject: string = '', topic: string = ''): LessonNature {
  const text = `${subject} ${topic}`.toLowerCase();
  if (/pe|physical education|sports|athletics|football|netball|fieldwork|survey|geography field/i.test(text)) {
    return 'fieldwork';
  }
  if (/practical|laboratory|lab|experiment|science|biology|chemistry|physics|computer|agriculture|woodwork|metalwork|technical drawing|home economics|food|nutrition|art|craft|music/i.test(text)) {
    return 'practical';
  }
  if (/revision|past paper|mock|test|assessment|exam preparation/i.test(text)) {
    return 'revision';
  }
  return 'theory';
}

export interface CDCLessonDataset {
  topic: string;
  subTopic: string;
  generalCompetences: string;
  specificCompetences: string;
  rationale: string;
  priorKnowledge: string;
  references: string;
  resources: string;
  learningEnvironment: string;
  expectedStandards: string;
  homework: string;
  lessonEvaluation: string;
  stages: {
    introMin: string;
    introTeacher: string;
    introLearners: string;
    introFormation: string;
    introAssessment: string;

    devMin: string;
    devTeacher: string;
    devLearners: string;
    devFormation: string;
    devAssessment: string;

    appMin: string;
    appTeacher: string;
    appLearners: string;
    appFormation: string;
    appAssessment: string;

    concMin: string;
    concTeacher: string;
    concLearners: string;
    concFormation: string;
    concAssessment: string;
  };
}

export const NATIONAL_CDC_CURRICULUM_BANK: Record<string, CDCLessonDataset[]> = {
  'mathematics': [
    {
      topic: 'Algebraic Expressions & Linear Equations',
      subTopic: 'Solving Linear Equations in One Variable with Fractional Coefficients',
      generalCompetences: 'Develop logical reasoning, analytical problem-solving, and algebraic manipulation skills required for STEM disciplines and national examinations.',
      specificCompetences: '1. Identify the Lowest Common Multiple (LCM) of denominators in algebraic equations.\n2. Apply the multiplication property of equality to clear fractional terms.\n3. Transpose terms systematically to isolate the unknown variable.\n4. Verify solutions by substitution into original expressions.',
      rationale: 'Linear equations provide the foundational mathematical framework for calculating rates, proportions, economic balances, and scientific relationships.',
      priorKnowledge: 'Learners understand basic operations on integers and simplification of simple algebraic terms.',
      references: 'MoE CDC Zambia Senior Secondary Syllabus (Grade 10-12) Code: CDC-MATH-S10; National e-Library Ref: ZAM-ELIB-CDC-M1024.',
      resources: 'Whiteboard, mathematical instruments, pupil textbooks, graded problem worksheets, algebraic balance scales.',
      learningEnvironment: 'Collaborative desk arrangement in pairs with clear view of the central instructional board.',
      expectedStandards: 'Learners should accurately solve at least 4 out of 5 linear equations with fractional coefficients within 20 minutes.',
      homework: 'Complete Exercises 4.3 questions 1 to 8 on page 112 of the Zambia Senior Secondary Mathematics Pupils Book 10.',
      lessonEvaluation: 'Learners demonstrated high proficiency in clearing fractions using LCM; fractional negative signs require minor recap during the next starter activity.',
      stages: {
        introMin: '10',
        introTeacher: 'Presents a real-world agricultural market problem: "If half a bag of fertilizer plus K150 equals K450, how much is the whole bag?" Guides learners to formulate the equation x/2 + 150 = 450.',
        introLearners: 'Analyze the problem scenario, propose variable representations, and express the relation in symbolic algebraic form.',
        introFormation: 'Whole class plenary discussion with front-facing focus.',
        introAssessment: 'Oral questioning and immediate formative feedback on equation formulation.',

        devMin: '40',
        devTeacher: 'Demonstrates on the board the two-step method: finding the LCM of denominators to multiply every term, followed by collecting like terms and isolating x. Solves 2 worked examples with active questioning.',
        devLearners: 'Follow the demonstration, record worked examples in exercise books, and solve a guided trial problem on mini-slates.',
        devFormation: 'Paired learning clusters for peer scaffolding and mutual verification.',
        devAssessment: 'Direct observation of slate solutions and targeted questioning on sign transposition rules.',

        appMin: '20',
        appTeacher: 'Distributes structured practice worksheet with graded difficulty (Standard, Extended, and Challenge items). Circulates to provide differentiated support.',
        appLearners: 'Solve worksheet problems independently, showing all systematic transposition steps in their exercise books.',
        appFormation: 'Individual desk seatwork with quiet peer consultation.',
        appAssessment: 'Marking of student workbooks against the CDC marking criteria and error correction.',

        concMin: '10',
        concTeacher: 'Leads a 3-minute synthesis highlighting the golden rule of equations: "Whatever operation you perform on one side must be performed on the other." Assigns homework.',
        concLearners: 'Summarize key steps in their learning journals and participate in a 2-minute quick-fire exit ticket.',
        concFormation: 'Whole class plenary wrap-up.',
        concAssessment: 'Exit ticket check on one quick fractional equation (3x/4 = 12).'
      }
    },
    {
      topic: 'Coordinate Geometry & Straight Line Graphs',
      subTopic: 'Determining Gradient, Distance, and Equations of Straight Lines',
      generalCompetences: 'Interpret spatial and graphical relationships to model physical trajectories and rate-of-change functions.',
      specificCompetences: '1. Calculate the gradient (m) of a straight line connecting two coordinate points.\n2. Determine the distance and midpoint between two points on the Cartesian plane.\n3. Formulate the equation of a line in the form y = mx + c given gradient and intercept.',
      rationale: 'Coordinate geometry bridges pure algebra and graphical analysis, serving as a pillar for physics mechanics and engineering graphics.',
      priorKnowledge: 'Plotting Cartesian coordinates (x, y) in all four quadrants.',
      references: 'Curriculum Development Centre (CDC) Mathematics Syllabus Grade 11; National e-Library Module: ZAM-ELIB-MATH-G11-04.',
      resources: 'Cartesian grid boards, rulers, geometric instruments, graphing worksheets, projector.',
      learningEnvironment: 'Standard classroom arrangement with adequate table space for drawing graphs.',
      expectedStandards: 'At least 85% of learners should accurately compute the gradient and write the linear equation.',
      homework: 'Complete Grade 11 Mathematics Workbook Exercise 6.2, Questions 1 through 10.',
      lessonEvaluation: 'Students grasped the gradient formula m = (y2-y1)/(x2-x1) smoothly. Midpoint calculations were executed with 95% accuracy.',
      stages: {
        introMin: '10',
        introTeacher: 'Displays two points on a projected road gradient incline and asks learners to calculate the steepness (rise over run).',
        introLearners: 'Recall prior graphing concepts, determine the vertical rise and horizontal run from the visual diagram.',
        introFormation: 'Whole class interactive visual prompt.',
        introAssessment: 'Check understanding through thumbs up/down response on positive vs negative slopes.',

        devMin: '40',
        devTeacher: 'Derives the slope formula m = (y2-y1)/(x2-x1) and straight-line equation y - y1 = m(x - x1). Models 2 comprehensive examples with positive and negative coordinates.',
        devLearners: 'Copy structured notes, participate in step-by-step calculations, and solve parallel problems.',
        devFormation: 'Paired collaboration at desk pods.',
        devAssessment: 'Random sample check of student exercise books for sign accuracy in negative coordinates.',

        appMin: '20',
        appTeacher: 'Assigns 4 differentiated analytical problems on determining line equations and finding parallel line slopes.',
        appLearners: 'Work independently on textbook questions, applying formulas and plotting lines on grid paper.',
        appFormation: 'Independent seatwork.',
        appAssessment: 'Walk-around grading and on-the-spot remediation.',

        concMin: '10',
        concTeacher: 'Reviews the relationship between parallel gradients (m1 = m2) and perpendicular lines (m1 * m2 = -1).',
        concLearners: 'Record summary formula box in exercise books.',
        concFormation: 'Whole class consolidation.',
        concAssessment: 'Quick oral recap of the standard line equation components.'
      }
    }
  ],

  'physics': [
    {
      topic: 'Current Electricity & Circuit Laws',
      subTopic: "Ohm's Law and Series-Parallel Resistor Networks",
      generalCompetences: 'Apply scientific principles and experimental methodologies to analyze electrical circuits and energy transfer mechanisms.',
      specificCompetences: '1. State Ohm\'s Law and write the mathematical relationship V = IR.\n2. Set up a functional circuit with an ammeter, voltmeter, variable resistor, and power source.\n3. Calculate equivalent resistance in series and parallel networks.\n4. Interpret V-I characteristic graphs for ohmic and non-ohmic conductors.',
      rationale: 'Electricity powers modern industrial, domestic, and communications infrastructure; understanding circuit laws is crucial for STEM careers.',
      priorKnowledge: 'Basic concepts of electric charge, potential difference, and simple circuit components.',
      references: 'Republic of Zambia Ministry of Education CDC Physics Grade 11 Syllabus (CDC-PHYS-G11); National e-Library: ZAM-ELIB-SCI-P1108.',
      resources: 'DC power packs/batteries, connecting wires, ammeters, voltmeters, rheostats, carbon resistors (10Ω, 20Ω, 50Ω), bulb holders.',
      learningEnvironment: 'Physics laboratory with bench power sockets, safety earth grounding, and designated apparatus trays.',
      expectedStandards: 'Learners should construct an operational test circuit and determine unknown resistance with less than 5% experimental deviation.',
      homework: 'Answer Question 4 & 5 from ECZ Physics Past Paper 2 (2024 Series) on circuit calculations.',
      lessonEvaluation: 'Practical setup was highly engaging. All groups successfully verified that current is directly proportional to voltage at constant temperature.',
      stages: {
        introMin: '10',
        introTeacher: 'Demonstrates a dimming light bulb using a variable resistor and poses the question: "Why does the brightness decrease when resistance increases?"',
        introLearners: 'Observe the demonstration, discuss the relationship between current and resistance, and share initial hypotheses.',
        introFormation: 'Laboratory horseshoe arrangement around the main demonstration bench.',
        introAssessment: 'Diagnostic oral questions on the role of potential difference in pushing charges.',

        devMin: '40',
        devTeacher: 'Explains Ohm\'s law V = IR, shows circuit schematic symbols, and models safe connection of meters (ammeter in series, voltmeter in parallel). Guides lab teams.',
        devLearners: 'Assemble test circuits in lab groups of 4, take readings of current (I) at varying voltages (V), and tabulate data.',
        devFormation: 'Small experimental workstations of 4 learners per bench.',
        devAssessment: 'Continuous lab inspection checking meter polarity, secure wire connections, and accurate table recordings.',

        appMin: '20',
        appTeacher: 'Instructs groups to plot the V against I graph, calculate the slope (Resistance), and solve a theoretical parallel circuit calculation.',
        appLearners: 'Plot graph on millimeter grid paper, draw the line of best fit, extract the gradient value, and compare with labeled resistor values.',
        appFormation: 'Small group collaborative data analysis.',
        appAssessment: 'Evaluation of plotted graphs and accuracy of calculated slope values.',

        concMin: '10',
        concTeacher: 'Consolidates findings by highlighting that gradient represents resistance. Emphasizes experimental precautions (zero error, switch-off to prevent heating).',
        concLearners: 'Disconnect apparatus neatly, return components to trays, and record concluding statement in lab notebooks.',
        concFormation: 'Tidy workstation plenary.',
        concAssessment: 'Oral check on why ammeters have low internal resistance.'
      }
    }
  ],

  'biology': [
    {
      topic: 'Plant Nutrition & Photosynthesis',
      subTopic: 'The Light and Dark Stages of Photosynthesis and Factor Limiting Rates',
      generalCompetences: 'Understand biochemical mechanisms of energy conversion in living organisms and their ecological significance for food security.',
      specificCompetences: '1. State the balanced chemical equation for photosynthesis.\n2. Describe the structure of a dicotyledonous leaf adapted for photosynthesis.\n3. Investigate experimentally the necessity of light, chlorophyll, and carbon dioxide.\n4. Explain limiting factors: light intensity, CO2 concentration, and temperature.',
      rationale: 'Photosynthesis forms the trophic foundation of all terrestrial and aquatic food chains and maintains atmospheric oxygen balance.',
      priorKnowledge: 'Cell structure (chloroplasts, vacuole), simple plant tissues, and energy requirements of living organisms.',
      references: 'CDC Zambia Senior Secondary Biology Syllabus Grade 10 (Code: CDC-BIO-G10); National e-Library: ZAM-ELIB-BIO-1003.',
      resources: 'Potted variegated plants (Coleus/Hibiscus), boiling tubes, ethanol, iodine solution, water baths, white tiles, forceps, microscope slides of leaf cross-sections.',
      learningEnvironment: 'Biology Laboratory equipped with Bunsen burners, water baths, and proper ventilation.',
      expectedStandards: 'Learners should execute the starch test on a destarched leaf and accurately infer the role of chlorophyll with 100% safety compliance.',
      homework: 'Draw and label a high-power microscopic diagram of a stomatal pore and answer Revision Review 3.4.',
      lessonEvaluation: 'Starch test demonstrated distinct blue-black coloration in green areas of variegated leaves; safety precautions with ethanol water baths were adhered to flawlessly.',
      stages: {
        introMin: '10',
        introTeacher: 'Shows a healthy green potted plant and a yellowed plant kept in darkness for 48 hours. Asks: "What biochemical process was halted in the dark?"',
        introLearners: 'Compare the two plant specimens, recall the function of chloroplasts, and propose reasons for the color and vigor disparity.',
        introFormation: 'Whole class observation around the lab demonstration table.',
        introAssessment: 'Oral questioning on word equation for photosynthesis.',

        devMin: '40',
        devTeacher: 'Outlines the chemical equation: 6CO2 + 6H2O -> C6H12O6 + 6O2. Demonstrates the 4-step starch test: boiling water, boiling ethanol in water bath (decolorizing), warm rinse, iodine application.',
        devLearners: 'Conduct the starch experiment in lab pairs following strict safety protocols (turn off Bunsen flame before ethanol immersion). Record observations.',
        devFormation: 'Paired lab benches with safety goggles.',
        devAssessment: 'Formative observation of lab technique, handling of forceps, and accurate recording of color changes.',

        appMin: '20',
        appTeacher: 'Provides rate-of-photosynthesis graphical data (bubble count vs light distance) for analytical interpretation.',
        appLearners: 'Interpret the graph, identify the saturation point, and explain which factor becomes limiting at plateau.',
        appFormation: 'Individual data interpretation in lab manuals.',
        appAssessment: 'Inspection of written explanations and accurate terminology (limiting factors).',

        concMin: '10',
        concTeacher: 'Summarizes the key adaptations of the leaf (palisade mesophyll, spongy air spaces, xylem/phloem veins, stomata) and assigns homework.',
        concLearners: 'Summarize the 4-step starch test in their notebooks and pack away glassware safely.',
        concFormation: 'Plenary wrap-up.',
        concAssessment: 'Quick-fire question: "Why must the leaf be boiled in ethanol?"'
      }
    }
  ],

  'english language': [
    {
      topic: 'Structure & Composition: Argumentative Discourse',
      subTopic: 'Developing Cohesive Paragraphs and Logical Transition Connectives',
      generalCompetences: 'Express ideas persuasively, coherently, and accurately in both written and spoken English in compliance with ECZ Grade 12 examination standards.',
      specificCompetences: '1. Formulate a clear, debate-ready thesis statement on a contemporary national issue.\n2. Construct persuasive topic sentences supported by empirical evidence and counter-arguments.\n3. Utilize appropriate transitional discourse markers (e.g., furthermore, consequently, conversely).\n4. Apply correct syntactic structure and punctuation throughout essay paragraphs.',
      rationale: 'Argumentative competence enables learners to articulate civic perspectives, write academic research papers, and participate effectively in democratic dialogue.',
      priorKnowledge: 'Basic paragraph structure (topic sentence, supporting sentences, concluding sentence).',
      references: 'CDC Senior Secondary English Language Syllabus Grade 11-12; National e-Library: ZAM-ELIB-ENG-L1102; ECZ Paper 1 Examination Guidelines.',
      resources: 'Sample model argumentative essays, discourse marker reference charts, highlighters, writing prompt handouts.',
      learningEnvironment: 'Classroom arranged in a U-shape for structured debate and peer analysis.',
      expectedStandards: 'All learners produce a 3-paragraph argumentative extract containing a distinct thesis, at least three cohesive discourse markers, and zero fragment errors.',
      homework: 'Write a full 350-word argumentative essay on the topic: "Digital Learning Should Complement Traditional Textbooks in All Zambian High Schools."',
      lessonEvaluation: 'Learners actively debated the prompt. The use of contrastive markers (e.g. "on the contrary", "notwithstanding") showed significant improvement in written drafts.',
      stages: {
        introMin: '10',
        introTeacher: 'Presents a controversial motion: "Examinations are the only reliable measure of student intelligence." Solicits rapid opposing viewpoints.',
        introLearners: 'Engage in a 3-minute mini-debate, offering rapid arguments for and against the motion.',
        introFormation: 'U-shape debate arrangement.',
        introAssessment: 'Observe learner articulation and identification of logical vs emotional arguments.',

        devMin: '40',
        devTeacher: 'Analyzes a model paragraph on the projector. Highlights the "PEEL" technique (Point, Evidence, Explanation, Link). Explains categories of transitional words (additive, contrastive, causative, sequential).',
        devLearners: 'Annotate sample essays with highlighters, identifying topic sentences and circling discourse markers.',
        devFormation: 'Pair-work analysis groups.',
        devAssessment: 'Check annotated samples to verify correct identification of connective transitions.',

        appMin: '20',
        appTeacher: 'Sets a 20-minute timed writing task: "Draft an introductory paragraph and one body paragraph supporting or opposing the introduction of free national tertiary education."',
        appLearners: 'Write paragraphs individually, implementing PEEL structure and purposeful transitional words.',
        appFormation: 'Silent individual writing condition.',
        appAssessment: 'Peer exchange and rubric-based feedback on thesis clarity and coherence.',

        concMin: '10',
        concTeacher: 'Invites two learners to read their body paragraphs aloud. Highlights strong rhetorical choices and provides collective editorial feedback.',
        concLearners: 'Note down exemplary phrases and write down the evening composition assignment.',
        concFormation: 'Whole class plenary.',
        concAssessment: 'Exit ticket: Write one sentence using the discourse marker "Notwithstanding".'
      }
    }
  ],

  'physical education': [
    {
      topic: 'Invasion Games: Basketball Fundamentals',
      subTopic: 'Chest Pass, Bounce Pass, and Defensive Footwork in Match Situations',
      generalCompetences: 'Demonstrate motor coordination, tactical spatial awareness, teamwork, and cardiovascular endurance in competitive game scenarios.',
      specificCompetences: '1. Execute the two-handed chest pass with correct foot step and wrist snap.\n2. Perform a bounce pass that strikes the court 2/3 of the distance to the receiver.\n3. Maintain the low defensive stance (athletic stance) with active lateral sliding.\n4. Apply passing combinations in a 3-on-2 attacking drill under defensive pressure.',
      rationale: 'Physical education promotes lifelong health, cardiovascular fitness, motor agility, and collaborative leadership.',
      priorKnowledge: 'Basic ball handling, bouncing, and spatial court boundary awareness.',
      references: 'CDC Physical Education & Sports Syllabus (Grade 8-12); National e-Library: ZAM-ELIB-PE-G1005; FIBA Official Basketball Rules.',
      resources: 'Regulation size 7 & 6 basketballs (1 per pair), training cones, whistle, stopwatches, bibs (red and blue).',
      learningEnvironment: 'Standard outdoor basketball court or cleared sports hall with perimeter safety clearance.',
      expectedStandards: 'Learners should complete 10 consecutive passes with a moving partner without a turnover or traveling infraction.',
      homework: 'Log 20 minutes of aerobic conditioning (skipping or jogging) in personal fitness diary.',
      lessonEvaluation: 'Pass execution was crisp; focus on stepping forward into the pass improved accuracy by 40% across all student pairs.',
      stages: {
        introMin: '10',
        introTeacher: 'Blows whistle, conducts attendance, leads dynamic warm-up (jogging lines, high knees, butt kicks, arm circles, defensive shuffles).',
        introLearners: 'Follow teacher commands, perform dynamic stretching, and elevate heart rate safely.',
        introFormation: 'Three parallel lines spaced 3 meters apart facing the instructor.',
        introAssessment: 'Visual check for full range of motion and active participation.',

        devMin: '40',
        devTeacher: 'Demonstrates chest pass technique: thumbs pointing down upon release, step with dominant foot, ball at chest height. Demonstrates bounce pass and lateral defensive slide.',
        devLearners: 'Practice in stationary pairs at 5m distance (15 passes each), progress to dynamic passing while jogging down the court.',
        devFormation: 'Two facing lines (Line A & Line B) across the length of the court.',
        devAssessment: 'Individual coaching cues: "Snap wrists outward!", "Step into the pass!"',

        appMin: '20',
        appTeacher: 'Sets up a 3-on-2 fast-break drill: 3 attackers must make at least 3 passes before shooting, while 2 defenders attempt to intercept.',
        appLearners: 'Rotate through attacking and defending roles, applying learned passes under timed pressure.',
        appFormation: 'Half-court attack formation with offensive triangle and defensive tandem.',
        appAssessment: 'Peer evaluation on passing decision-making and defense positioning.',

        concMin: '10',
        concTeacher: 'Calls freeze on whistle. Leads cool-down static stretches (hamstrings, calves, shoulders). Reviews key coaching points.',
        concLearners: 'Perform static stretches, lower breathing rate, and answer review questions on pass selection.',
        concFormation: 'Seated semi-circle around the centre court circle.',
        concAssessment: 'Oral assessment: "When is a bounce pass preferable to a chest pass?"'
      }
    }
  ],

  'agricultural science': [
    {
      topic: 'Soil Science & Plant Nutrition',
      subTopic: 'Soil Texture, Structure, and Determination of Soil pH for Crop Optimization',
      generalCompetences: 'Evaluate soil physical and chemical characteristics to implement sustainable agronomic practices and maximize crop yield.',
      specificCompetences: '1. Differentiate between sand, silt, and clay soil fractions by feel and sedimentation.\n2. Determine the pH of various farm soil samples using universal indicator solution and pH meters.\n3. Recommend appropriate soil amendments (agricultural lime or organic compost) based on test results.\n4. Relate soil acidity to nutrient availability (Nitrogen, Phosphorus, Potassium).',
      rationale: 'Agriculture is the backbone of Zambia\'s food security and rural economy; scientific soil management prevents degradation and boosts harvest yields.',
      priorKnowledge: 'Basic soil layers, weathering of rocks, and concept of acidity/alkalinity from junior science.',
      references: 'CDC Senior Secondary Agricultural Science Syllabus Grade 11 (Code: CDC-AGRI-G11); National e-Library: ZAM-ELIB-AGRI-1104.',
      resources: 'Soil samples (sandy loam, clay, compost), test tubes, universal indicator, barium sulphate, distilled water, pH colour charts, measuring cylinders.',
      learningEnvironment: 'Agriculture laboratory / School demonstration farm shed.',
      expectedStandards: 'All learners test 3 unknown soil samples and correctly categorize their pH with corresponding liming recommendations.',
      homework: 'Collect a 100g topsoil sample from home or school garden and complete the jar sedimentation test.',
      lessonEvaluation: 'Practical testing was exceptionally clear; students successfully diagnosed acidic soils and calculated lime requirement per hectare.',
      stages: {
        introMin: '10',
        introTeacher: 'Displays stunted maize leaves with purple coloration and asks learners to diagnose whether the symptom is caused by nutrient deficiency or soil acidity.',
        introLearners: 'Observe the crop specimen, discuss soil factors affecting phosphorus uptake, and suggest hypotheses.',
        introFormation: 'Semi-circle around farm display bench.',
        introAssessment: 'Oral diagnostic assessment on essential plant nutrients (NPK).',

        devMin: '40',
        devTeacher: 'Demonstrates the universal indicator pH test procedure: soil sample + barium sulphate (for clearing) + distilled water + 3 drops indicator, shaken and settled.',
        devLearners: 'Perform soil pH tests in groups of 4 on school garden soil, nursery soil, and uncultivated bush soil. Match colours to the pH scale.',
        devFormation: 'Work groups of 4 at agriculture testing stations.',
        devAssessment: 'Inspection of test tube preparation and accurate matching against official CDC soil pH charts.',

        appMin: '20',
        appTeacher: 'Presents a farmer case study with soil pH 4.8 wishing to grow soya beans (optimal pH 6.0 - 6.5). Asks learners to write an agronomic recommendation.',
        appLearners: 'Calculate lime application rate per hectare and write a 4-point advisory note for the farmer.',
        appFormation: 'Individual farm advisory write-up.',
        appAssessment: 'Evaluation of agronomic advice and calculation accuracy.',

        concMin: '10',
        concTeacher: 'Summarizes the importance of routine soil testing before each planting season and outlines next week\'s farm field plot visit.',
        concLearners: 'Clean and dry test tubes, store chemical reagents securely, and record homework assignment.',
        concFormation: 'Plenary station clean-up.',
        concAssessment: 'Quick question on the effect of agricultural lime on acidic soils.'
      }
    }
  ],

  'computer studies': [
    {
      topic: 'Algorithms & Problem Solving',
      subTopic: 'Flowcharts, Pseudocode, and Selection Control Structures (IF-THEN-ELSE)',
      generalCompetences: 'Apply algorithmic logic, computational thinking, and structured programming paradigms to solve real-world automation problems.',
      specificCompetences: '1. Identify standard flowchart symbols (terminal, process, decision, input/output, connector).\n2. Construct a flowchart implementing single and dual-alternative selection structures.\n3. Convert graphical flowcharts into standard structured pseudocode.\n4. Trace algorithm execution using dry-run trace tables to verify correctness.',
      rationale: 'Algorithmic reasoning is the universal foundation of software engineering, robotics, and automated systems in the modern digital economy.',
      priorKnowledge: 'Sequence of instructions, basic arithmetic operators, and variables.',
      references: 'CDC Computer Studies Grade 10-12 Syllabus (Code: CDC-ICT-G10); National e-Library: ZAM-ELIB-COMP-1002; ECZ ICT Practical Paper 2 Blueprint.',
      resources: 'Computer laboratory terminals, flowchart design templates, trace table worksheets, whiteboard.',
      learningEnvironment: 'Computer Laboratory with networked terminals, digital projector, and workstation chairs.',
      expectedStandards: 'Learners should design a valid flowchart and trace table for a grading system with 100% logic accuracy.',
      homework: 'Design a flowchart and pseudocode algorithm to calculate electricity billing based on tiered ZESCO tariff bands.',
      lessonEvaluation: 'Students quickly mastered the decision diamond symbol; trace tables successfully caught boundary condition bugs in learner algorithms.',
      stages: {
        introMin: '10',
        introTeacher: 'Presents an everyday decision scenario: "If it rains, carry an umbrella; otherwise, wear a sunhat." Asks learners how a computer makes decisions.',
        introLearners: 'Discuss logical conditions (True/False boolean outcomes) and propose how automated systems evaluate criteria.',
        introFormation: 'Whole class interactive visual prompt.',
        introAssessment: 'Check understanding of boolean conditions through rapid true/false scenarios.',

        devMin: '40',
        devTeacher: 'Introduces standard ISO flowchart symbols on board. Demonstrates an algorithm determining if a student has passed (Score >= 50). Constructs trace table.',
        devLearners: 'Draw symbols in exercise books, follow step-by-step logic tracing, and write equivalent pseudocode (IF score >= 50 THEN OUTPUT "PASS" ELSE OUTPUT "FAIL").',
        devFormation: 'Individual computer workstations with paired logic checks.',
        devAssessment: 'Inspection of symbol precision (diamond vs rectangle) and connector arrow directions.',

        appMin: '20',
        appTeacher: 'Assigns task: "Design a flowchart and pseudocode for an ATM withdrawal algorithm validating PIN and checking sufficient balance."',
        appLearners: 'Draft the multi-decision flowchart and write a trace table with 3 test cases (valid PIN & sufficient funds, invalid PIN, insufficient funds).',
        appFormation: 'Independent workstation problem-solving.',
        appAssessment: 'Validation of trace table test cases and error-handling paths.',

        concMin: '10',
        concTeacher: 'Reviews key rules of structured pseudocode (capitalized keywords, indentation) and announces next topic: Iteration / Loops.',
        concLearners: 'Save digital flowcharts to student network folders and record homework assignment.',
        concFormation: 'Plenary log-off.',
        concAssessment: 'Exit ticket: State the function of the parallelogram symbol.'
      }
    }
  ]
};

/**
 * Synthesizes a comprehensive, 100% complete Zambian CDC & CBC lesson plan dataset
 * ensuring all curriculum fields and progression stages are fully populated.
 */
/**
 * Synthesizes a comprehensive, 100% complete Zambian CDC & CBC lesson plan dataset
 * with support for 45 distinct pedagogical variants for any topic.
 */
export function generateSynthesizedCDCPlan(
  subject: string, 
  level: string, 
  topic: string, 
  variantIndex: number = 1,
  duration: number | string = 80,
  nature?: LessonNature
): CDCLessonDataset {
  const normSubject = (subject || 'Mathematics').trim().toLowerCase();
  const normLevel = (level || 'Grade 10').trim();
  const cleanTopic = (topic || '').trim();
  const effectiveNature = nature || autoDetectLessonNature(normSubject, cleanTopic);
  const stageMins = calculateStageMinutes(duration, effectiveNature);

  // 1. Check if we have exact match in our curriculum bank
  for (const [key, list] of Object.entries(NATIONAL_CDC_CURRICULUM_BANK)) {
    if (normSubject.includes(key) || key.includes(normSubject)) {
      if (cleanTopic) {
        const found = list.find(item => item.topic.toLowerCase().includes(cleanTopic.toLowerCase()) || cleanTopic.toLowerCase().includes(item.topic.toLowerCase()));
        if (found) {
          // If variantIndex > 1, create a specific tailored variant
          if (variantIndex > 1) {
            return applyVariantTransformation(found, variantIndex, subject, normLevel, cleanTopic, duration, effectiveNature);
          }
          return {
            ...found,
            stages: {
              ...found.stages,
              ...stageMins
            }
          };
        }
      }
      if (list.length > 0) {
        const base = list[0];
        const targetTopic = cleanTopic || base.topic;
        const adapted = {
          ...base,
          topic: targetTopic,
          subTopic: `${targetTopic} - Variant ${variantIndex}: ${getVariantTitle(variantIndex)}`,
          references: `Republic of Zambia MoE CDC ${subject} (${normLevel}) Syllabus; National e-Library: ZAM-ELIB-${subject.substring(0, 4).toUpperCase()}-${normLevel.replace(/[^0-9]/g, '') || '10'}-V${variantIndex}.`,
        };
        return applyVariantTransformation(adapted, variantIndex, subject, normLevel, targetTopic, duration, effectiveNature);
      }
    }
  }

  // 2. Dynamic Universal Zambian Curriculum Generator supporting 45 distinct variants
  const isPE = /physical education|p\.e\.?|pe|sports/i.test(normSubject);
  const isLanguage = /english|bemba|nyanja|tonga|lozi|french|literature/i.test(normSubject);
  const isScience = /science|biology|chemistry|physics|agricultural|computer/i.test(normSubject);
  const isSocial = /history|geography|civic|religious|social/i.test(normSubject);
  const isVocational = /woodwork|metalwork|technical|design|home economics|food|fashion|art|music/i.test(normSubject);

  const fallbackTopic = cleanTopic || (isScience ? 'Scientific Principles and Practical Applications' : isLanguage ? 'Syntactic Structures and Expressive Composition' : isSocial ? 'Civic Governance, Heritage and Sustainable Development' : isVocational ? 'Design Principles, Materials and Workshop Practice' : isPE ? 'Movement Fundamentals and Teamwork' : 'Foundational Competencies and Analysis');
  
  const variantTitle = getVariantTitle(variantIndex);
  const fallbackSubTopic = `${fallbackTopic} - Approach ${variantIndex}: ${variantTitle}`;

  const baseDataset: CDCLessonDataset = {
    topic: fallbackTopic,
    subTopic: fallbackSubTopic,
    generalCompetences: `Demonstrate mastery of ${subject} core competencies, critical inquiry, problem-solving, and practical application aligned with the Zambia Competence-Based Curriculum (CBC) framework (Variant ${variantIndex}: ${variantTitle}).`,
    specificCompetences: `1. Explain fundamental concepts and terminology associated with ${fallbackTopic} using ${variantTitle.toLowerCase()}.\n2. Apply structured analytical methods and practical procedures to investigate contextual challenges in Zambia.\n3. Collaborate effectively in peer teams to execute inquiry tasks and evaluate outcomes.\n4. Communicate findings clearly and demonstrate civic/economic awareness.`,
    rationale: `Mastery of ${fallbackTopic} through ${variantTitle} equips learners with vital analytical, practical, and critical thinking capabilities for national development in Zambia.`,
    priorKnowledge: `Learners possess foundational understanding from prior units in ${subject} and have encountered basic terminology related to ${fallbackTopic}.`,
    references: `Republic of Zambia Ministry of Education CDC National ${subject} Syllabus (${normLevel}); National e-Library Resource ID: ZAM-ELIB-CDC-${subject.slice(0, 4).toUpperCase()}-V${variantIndex}; ECZ Curriculum Framework.`,
    resources: getVariantResources(isScience, isLanguage, isPE, isVocational, variantIndex),
    learningEnvironment: getVariantEnvironment(isPE, isScience, isVocational, variantIndex),
    expectedStandards: `At least 88% of learners achieve competence in explaining and applying ${fallbackTopic} through ${variantTitle} within the lesson duration.`,
    homework: `Complete Exercise Variant ${variantIndex} (Questions 1-6) on ${fallbackTopic} from the approved MoE Pupil's Textbook for ${normLevel}.`,
    lessonEvaluation: `Variant ${variantIndex} (${variantTitle}) successfully engaged learners. Active participation and formative checkpoints confirmed high conceptual mastery.`,
    stages: {
      introMin: stageMins.introMin,
      introTeacher: getVariantIntroTeacher(fallbackTopic, variantIndex),
      introLearners: getVariantIntroLearners(variantIndex),
      introFormation: isPE ? 'Dynamic staggered formation across the court.' : 'Whole-class interactive plenary setting.',
      introAssessment: 'Diagnostic questioning and entry readiness check.',

      devMin: stageMins.devMin,
      devTeacher: getVariantDevTeacher(fallbackTopic, variantIndex),
      devLearners: getVariantDevLearners(variantIndex),
      devFormation: isPE ? 'Paired drill lines with rotational pacing.' : 'Collaborative table clusters / lab pods.',
      devAssessment: 'Formative observation, guided questioning, and spot checks.',

      appMin: stageMins.appMin,
      appTeacher: getVariantAppTeacher(fallbackTopic, variantIndex),
      appLearners: getVariantAppLearners(variantIndex),
      appFormation: isPE ? 'Small-sided application simulation game.' : (effectiveNature === 'practical' ? 'Hands-on laboratory/workshop station layout with active experimentation.' : 'Individual focused seatwork with peer consultation.'),
      appAssessment: effectiveNature === 'practical' ? 'Direct observation of practical performance, experimental measurements, and rubric checklist.' : 'Marking workbook solutions against standard MoE criteria.',

      concMin: stageMins.concMin,
      concTeacher: getVariantConcTeacher(fallbackTopic, variantIndex),
      concLearners: getVariantConcLearners(variantIndex),
      concFormation: isPE ? 'Seated cool-down reflection circle.' : 'Whole-class plenary wrap-up and exit ticket.',
      concAssessment: 'Quick-fire exit ticket questions testing lesson outcomes.'
    }
  };

  return baseDataset;
}

export function getVariantTitle(index: number): string {
  const titles = [
    'SPRINT Action Research & Inquiry Approach',
    'Cooperative Peer Jigsaw Methodology',
    'Zambian Industrial & Agricultural Problem-Solving',
    'ICT & National e-Library Digital Simulation',
    'Inclusive SEN Differentiated Mastery Framework',
    'Fieldwork & Community Practical Investigation',
    'Peer Assessment Rubric Workshop',
    'Socratic Guided Discovery Model',
    'Indigenous Zambian Knowledge & Science Integration',
    'Project-Based Entrepreneurship & Enterprise Education',
    'Constructivist Scaffolded Inquiry',
    'Explicit Direct Instruction & Worked Examples',
    'Flipped Classroom Pre-Reading Analysis',
    'Station Rotation Blended Learning Model',
    'Concept Mapping & Hierarchical Synthesis',
    'Experimental Scientific Hypothesis Testing',
    'Case Study Analysis (ZESCO & Mining)',
    'Think-Pair-Share Collaborative Dialogue',
    'Gamified Quiz & Interactive Challenge',
    'Remedial Mastery Intervention Cycle',
    'Inquiry-Based Scientific Modeling',
    'Environmental Conservation & Sustainable Development Link',
    'Historical Chronology & Primary Source Analysis',
    'Spatial Data Interpretation & GIS Mapping',
    'Financial Literacy & Resource Allocation Modeling',
    'Civic Ethics & Community Responsibility Debate',
    'Structural Design & Technical Drawing Protocol',
    'Nutritional & Health Wellness Practical Application',
    'Creative Arts Expression & Aesthetic Critique',
    'Traditional Music & Cultural Heritage Performance',
    'Advanced Algorithmic Problem Solving & Logic',
    'Biotechnical & Agricultural Production Inquiry',
    'Chemical Synthesis & Environmental Safety Protocol',
    'Mechanics & Kinetic Energy Practical Investigation',
    'Linguistic Syntactic Mastery & Expository Writing',
    'Sociolinguistic Oral Communication & Debate',
    'Mathematical Modeling of Economic Growth',
    'Statistical Data Collection & Field Census Project',
    'Renewable Energy & Solar Tech Practical Assembly',
    'Water Resource Management & Hydrological Audit',
    'Post-Colonial Literature & Critical Discourse Analysis',
    'Entrepreneurial Business Plan Formulation',
    'Biomechanics & Athletic Performance Optimization',
    'Community Health & Epidemiology Tracking Study',
    'National Heritage Preservation & Cultural Tourism Project'
  ];
  return titles[(index - 1) % titles.length] || `Advanced Pedagogical Variant ${index}`;
}

function getVariantResources(isScience: boolean, isLanguage: boolean, isPE: boolean, isVocational: boolean, index: number): string {
  const mediaTypes = ['Digital tablets', 'Printed charts', 'Laboratory specimens', 'Audio recordings', 'Field measurement kits', 'Interactive models'];
  const media = mediaTypes[(index - 1) % mediaTypes.length];
  if (isScience) return `Laboratory apparatus, chemical reagents, safety goggles, ${media}, MoE Physics/Chemistry/Biology Textbook.`;
  if (isLanguage) return `Anthology texts, vocabulary cards, whiteboard markers, dictionary, ${media}.`;
  if (isPE) return `Cones, training bibs, whistles, stopwatches, match balls, ${media}.`;
  if (isVocational) return `Workshop tools, safety gear, raw material samples, drafting boards, ${media}.`;
  return `Pupil textbooks, whiteboard, structured worksheets, exercise books, ${media}.`;
}

function getVariantEnvironment(isPE: boolean, isScience: boolean, isVocational: boolean, index: number): string {
  if (isPE) return index % 2 === 0 ? 'Outdoor school sports field with full safety perimeter.' : 'Covered pavilion hall with matting and cone markers.';
  if (isScience) return index % 2 === 0 ? 'Equipped science laboratory with running water and fume cupboards.' : 'Interactive multimedia computer lab with workstation benches.';
  if (isVocational) return 'Design & technology workshop with safety-inspected workbenches and tool racks.';
  return index % 3 === 0 ? 'U-shaped seating arrangement for interactive debate and discussion.' : 'Collaborative cluster seating for small group problem solving.';
}

function getVariantIntroTeacher(topic: string, index: number): string {
  const hooks = [
    `Introduces ${topic} by presenting a compelling real-world challenge faced by Zambian communities.`,
    `Leads a 5-minute SPRINT brainstorming session on ${topic} to gauge prior experiences.`,
    `Displays an interactive chart illustrating ${topic} and poses a guiding Socratic question.`,
    `Facilitates a quick diagnostic quiz on foundational concepts related to ${topic}.`,
    `Demonstrates a surprising physical phenomenon or numerical puzzle connected to ${topic}.`
  ];
  return hooks[(index - 1) % hooks.length];
}

function getVariantIntroLearners(index: number): string {
  const responses = [
    'Actively analyze the problem scenario, share observations, and formulate initial hypotheses.',
    'Participate in small-group brainstorming and record preliminary ideas on mini-whiteboards.',
    'Respond to diagnostic prompts and connect past lessons to the current topic.',
    'Examine visual exhibits and note down key guiding questions for the lesson.'
  ];
  return responses[(index - 1) % responses.length];
}

function getVariantDevTeacher(topic: string, index: number): string {
  const devStyles = [
    `Presents core principles of ${topic} using structured step-by-step whiteboard models and guided examples.`,
    `Facilitates a collaborative jigsaw activity where expert groups investigate sub-components of ${topic}.`,
    `Demonstrates practical application methods for ${topic} with active student participation.`,
    `Guides learners through a structured inquiry workbook exploring ${topic} in depth.`
  ];
  return devStyles[(index - 1) % devStyles.length];
}

function getVariantDevLearners(index: number): string {
  const learnerDev = [
    'Take detailed structured notes, ask clarifying questions, and collaborate in paired desk pods.',
    'Rotate through expert stations, synthesize findings, and teach peer group members.',
    'Execute guided practice tasks and record observations in structured science/exercise logs.'
  ];
  return learnerDev[(index - 1) % learnerDev.length];
}

function getVariantAppTeacher(topic: string, index: number): string {
  return `Assigns differentiated practical exercises and contextual problem sets on ${topic} (Variant ${index}). Circulates to provide individual scaffolding.`;
}

function getVariantAppLearners(index: number): string {
  return 'Work independently and in assigned pairs to solve complex problem items in workbooks, applying learned principles.';
}

function getVariantConcTeacher(topic: string, index: number): string {
  return `Synthesizes key takeaways for ${topic} (Variant ${index}), clarifies remaining misconceptions, and administers exit ticket assessment.`;
}

function getVariantConcLearners(index: number): string {
  return 'Summarize core learnings in personal notebooks and complete the plenary exit ticket.';
}

function applyVariantTransformation(
  base: CDCLessonDataset, 
  variantIndex: number, 
  subject: string, 
  level: string, 
  topic: string,
  duration: number | string = 80,
  nature: LessonNature = 'theory'
): CDCLessonDataset {
  const variantTitle = getVariantTitle(variantIndex);
  const stageMins = calculateStageMinutes(duration, nature);

  return {
    ...base,
    topic: topic,
    subTopic: `${topic} - Variant ${variantIndex}: ${variantTitle}`,
    generalCompetences: `${base.generalCompetences} [Pedagogical Approach Variant ${variantIndex}: ${variantTitle}]`,
    specificCompetences: `${base.specificCompetences}\n${variantIndex}. Apply specialized ${variantTitle.toLowerCase()} methods to master ${topic}.`,
    references: `${base.references} | Variant ${variantIndex}: ${variantTitle} Curriculum Extension.`,
    expectedStandards: `At least ${80 + (variantIndex % 15)}% of learners achieve high proficiency in ${topic} using ${variantTitle}.`,
    homework: `Complete Variant ${variantIndex} Assignment Sheet on ${topic} from approved MoE resources.`,
    lessonEvaluation: `Variant ${variantIndex} (${variantTitle}) delivered excellent student engagement and measurable mastery.`,
    stages: {
      ...base.stages,
      ...stageMins
    }
  };
}
