import { DocumentPage } from './libraryData';
import { CURRICULUM_5000_COMPENDIUMS, generateCompendiumPages } from './massiveCurriculum5000Pages';

// Helper to create rich structured pages for modules and textbooks
export const CDC_ART_F1_T1_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Module Preface, National Policy & CDC Leadership Panel',
    chapterTitle: 'Preface & Foundational Framework',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT
THE CURRICULUM DEVELOPMENT CENTRE (CDC), LUSAKA (2025)

ART AND DESIGN TEACHING MODULE — FORM 1 TERM 1
(Ordinary Secondary Level — Competence-Based Curriculum Framework)

PREFACE & CURRICULUM FOUNDATION
The Art and Design Teaching Module for Form 1 has been developed in response to the introduction of the Competence-Based Curriculum (CBC), a transformative initiative aimed at enhancing education quality, relevance, and lifelong learning for all Zambians.

Under the leadership of the Ministry of Education, this module transitions the learning experience from passive rote memorization to active, hands-on visual literacy, creative critical thinking, and socio-economic empowerment. Art and Design is no longer treated merely as a hobby, but as a dynamic discipline driving innovation, cultural identity, industrial packaging, digital communication, and entrepreneurship.

MINISTRY & CDC CURRICULUM PANEL LEADERSHIP:
• Permanent Secretary - Educational Services: Joel Kamoko (Mr.)
• Director - Curriculum Development: Dr. Charles Ndakala
• Senior Specialist Social Sciences: Joackim Musonda
• Senior Specialist Expressive Arts: Charles M. Walima
• Curriculum Specialist Art & Design (CDC): Kelvin Makungu

AUTHORS & WRITING PANEL:
• Dr. Christopher Chileshe — Chalimbana University
• Noah K. Kalala — Mufulira College of Education
• Cecilia T. Katongola — Chibolele Secondary School
• Herbert Mwiba — Nyimba Boarding Secondary School
• Precious Mwenya — Kikombe Secondary School
• Cyprian Mooya — President, Expressive Arts Teachers Association of Zambia (EATAZ)

GENERAL COMPETENCES DEVELOPED IN THIS MODULE:
1. Critical Thinking: Analyzing visual stimuli, identifying balance, and critiquing aesthetic quality.
2. Analytical Thinking: Breaking down complex 3D forms into basic geometric primitives.
3. Creativity and Innovation: Formulating original compositions using local and sustainable materials.
4. Collaboration & Communication: Working in studio groups, executing group murals, and presenting visual art critique.`,
    calloutBox: {
      title: 'CDC Curriculum Directive (2025/2026)',
      type: 'tip',
      content: 'Teachers are required to allocate at least 70% of instructional time in Art and Design to hands-on studio practice, observational drawing, and authentic local material exploration.'
    },
    keyTakeaways: [
      'Art and Design under the CBC empowers learners with 21st-century problem solving and vocational skills.',
      'Developed by leading Zambian art educators from Chalimbana University, Mufulira College, and secondary schools nationwide.',
      'Emphasizes authentic exploration of indigenous Zambian heritage and contemporary creative industries.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: '1.1 Introduction to Art, Crafts & Design — Branches of Art',
    chapterTitle: 'Unit 1: Art Awareness & Appreciation',
    content: `1.1 INTRODUCTION TO ART, CRAFTS AND DESIGN
Art is a diverse range of human activities involving the creation of visual, auditory, or performed artifacts that express the creator's imagination, ideas, or technical skill, intended to be appreciated for their beauty or emotional power.

1.1.1 SUBTOPIC: ART AWARENESS AND APPRECIATION
Art permeates all aspects of human society. From the clothes we wear, the architecture of our homes, the layout of national currencies, to traditional ceremonies (such as Kuomboka and Nc'wala), art is central to cultural preservation and communication.

THREE PRIMARY CATEGORIES OF ART:
1. Visual Arts:
Art forms created primarily to be appreciated through sight. Examples include painting, drawing, sculpture, printmaking, photography, graphic design, textile design, and ceramics.

2. Performing Arts:
Art forms where artists use their voices, bodies, or inanimate objects to convey artistic expression. Examples include music, traditional dance, drama, theatre, mime, and puppetry.

3. Literary Arts:
The creation of written works of artistic value. Examples include poetry, prose, novels, short stories, folk tales, and dramatic scripts.

BRANCHES OF VISUAL ART:
• Fine Arts:
Art created primarily for aesthetics and intellectual contemplation rather than practical utility. The value of fine art lies in its expressive power, emotional impact, and philosophical commentary.
Key media: Oil on canvas, acrylics, marble and stone sculpture, bronze casting, fine graphite and charcoal drawing.

• Applied Arts:
The application of artistic design to practical, everyday functional objects. Applied arts merge beauty with engineering and ergonomics.
Key fields: Industrial design, automotive design, fashion and garment design, furniture making, commercial ceramics, and interior architecture.

• Decorative Arts:
Art forms focused on designing and manufacturing functional objects that are embellished for ornamental elegance.
Key fields: Jewellery crafting, glassblowing, mosaic wall tiling, tapestry, embroidery, and ornamental metalwork.`,
    calloutBox: {
      title: 'Classroom Studio Activity',
      type: 'activity',
      content: 'In groups of four, survey your school environment. Identify at least 3 examples of Fine Art, 3 examples of Applied Art, and 3 examples of Decorative Art. Record your findings in an illustrated table.'
    },
    keyTakeaways: [
      'Visual arts appeal to sight, performing arts to time and movement, and literary arts to the written word.',
      'Fine Arts prioritize pure aesthetic expression; Applied Arts combine beauty with everyday utility.',
      'Decorative arts beautify functional everyday objects like jewellery and ceramics.'
    ],
    selfCheckQuestions: [
      {
        question: 'Differentiate clearly between Fine Art and Applied Art, giving one example of each from a Zambian context.',
        answer: 'Fine Art is created primarily for aesthetic appreciation and emotional expression (e.g. Henry Tayali’s painting "Destiny"), whereas Applied Art combines aesthetics with practical functionality (e.g. a designed Chitenge fabric or an ergonomically designed wooden stool).'
      }
    ]
  },
  {
    pageNumber: 3,
    pageTitle: '1.1.2 Careers in Art & 1.1.3 Societal Functions of Art',
    chapterTitle: 'Unit 1: Art Awareness & Appreciation',
    content: `1.1.2 SUBTOPIC: CAREERS IN ART AND DESIGN
Art and Design offers diverse, highly lucrative career pathways in the modern knowledge-based economy. Learners studying Art and Design can pursue specialized professions across multiple sectors:

A. Visual & Fine Arts Careers:
• Studio Artist / Painter: Creates original artworks for galleries, private collectors, and public commissions.
• Sculptor: Crafts 3D monuments, public statues, and architectural installations using stone, wood, metal, or resin.
• Art Curator / Museum Director: Manages, preserves, and organizes art collections and historical exhibitions.
• Art Conservator: Uses chemistry and fine motor skills to restore aged or damaged historical artifacts.
• Art Educator / Lecturer: Teaches expressive arts at primary, secondary, and tertiary university levels.

B. Commercial, Digital & Applied Design Careers:
• Graphic Designer: Creates visual identities, corporate logos, posters, book covers, and packaging.
• UI/UX Designer: Designs digital user interfaces and user experiences for mobile applications and software.
• Fashion Designer: Conceptualizes and manufactures garments, traditional attire, and accessories.
• Interior Designer: Plans spatial aesthetics, lighting, color palettes, and furnishings in residential and corporate spaces.
• Industrial / Product Designer: Designs ergonomic electronic gadgets, household appliances, and tools.
• Animator & Game Designer: Produces 2D/3D characters and visual effects for film, advertising, and digital entertainment.
• Cartographer / Medical Illustrator: Specializes in scientific, anatomical, and geographical rendering.

1.1.3 SUBTOPIC: FUNCTIONS OF VISUAL ARTS IN SOCIETY
1. Economic Function & Wealth Creation:
Visual arts generate substantial income through tourism, handicraft exports, graphic branding, advertising, and fashion design.

2. Cultural Preservation & Identity:
Art documents national history, moral values, and spiritual customs, ensuring indigenous traditions (such as Makishi masquerades and Nyau secret society crafts) are passed to future generations.

3. Social & Political Commentary:
Artists act as the conscience of society, addressing issues such as environmental conservation, corruption, human rights, and social justice.

4. Psychological & Therapeutic Function:
Creating and viewing art enhances mental wellness, relieves stress, and fosters cognitive development and emotional resilience.`,
    calloutBox: {
      title: 'Career Spotlight — Creative Industry in Zambia',
      type: 'tip',
      content: 'Zambia’s growing digital media, advertising, and tourism sectors have created unprecedented demand for certified Graphic Designers, Brand Specialists, and Cultural Curators.'
    },
    keyTakeaways: [
      'Art career opportunities extend beyond traditional painting to graphic design, UI/UX, architecture, and animation.',
      'Art serves economic, cultural, therapeutic, and socio-political roles in modern Zambia.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: '1.1.4 Pioneers of Zambian Visual Arts',
    chapterTitle: 'Unit 1: Art Awareness & Appreciation',
    content: `1.1.4 SUBTOPIC: PIONEERS OF ZAMBIAN VISUAL ARTS
The history of modern Zambian visual arts is rich with visionary figures whose masterworks have gained global acclaim while preserving indigenous African pride.

1. HENRY TAYALI (1943–1987) — The Giant of Zambian Art:
• Background: Born in Serenje, studied at Evelyn Hone College, Makerere University (Uganda), and the Kunstakademie Düsseldorf (Germany).
• Style & Mastery: Renowned for monumental expressionist paintings, woodcuts, and sculptures depicting the socio-economic struggles of urban working-class Africans.
• Iconic Masterpieces: "Destiny" (1975–1980), "Crowd", "The Village", "Shebeen".
• Legacy: The Henry Tayali Visual Arts Centre in Lusaka Showgrounds is named in his enduring honour.

2. GABRIEL ELLISON (OGDS, MBE):
• Background: Prominent painter, illustrator, author, and civil servant who served as head of the Graphic Arts Section in the Zambia Information Services (ZIS).
• Contributions: Designer of Zambia's National Coat of Arms, national postal stamps, military insignia, and author of foundational art history literature.
• Style: Vibrant, rhythmic oil paintings capturing Zambian landscapes, flora, fauna, and cultural folklore.

3. CYNTHIA ZUKAS (MBE):
• Background: Vital matriarch of Zambian visual arts; founding member of the Mpapa Gallery (1978) and the Zambia National Visual Arts Council (VAC).
• Impact: Provided exhibition platforms and mentorship for generations of indigenous Zambian artists during periods when commercial galleries were non-existent.

4. AKWILA SIMPASA (1945–1980s):
• Style: Avant-garde painter and jazz musician known for raw, emotional, dynamic line work and deeply expressive human portraiture.

5. GODFREY SETTI (1958–2002):
• Background: Prolific painter, art educator, and scholar holding a Master of Fine Arts from Reading University (UK).
• Style: Known for his vibrant, flowing brushstrokes capturing spiritual ceremonies and everyday community life in rural and peri-urban Zambia.

6. SHADRECK SIMUKANGA & MARTIN ABASI PHIRI:
• Celebrated for master wood and stone carving, depicting traditional Zambian folklore, human dignity, and wildlife.`,
    calloutBox: {
      title: 'ECZ Examination Focus',
      type: 'ecz_exam',
      content: 'Past ECZ exam questions frequently ask candidates to identify the designer of the Zambian Coat of Arms (Gabriel Ellison) and the creator of the monumental artwork "Destiny" (Henry Tayali).'
    },
    keyTakeaways: [
      'Henry Tayali is Zambia’s most internationally celebrated modernist painter and sculptor.',
      'Gabriel Ellison designed the Zambian National Coat of Arms and national insignia.',
      'Cynthia Zukas pioneered the Mpapa Gallery and the National Visual Arts Council (VAC).'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: '1.1.5 The 7 Elements of Art (The Building Blocks)',
    chapterTitle: 'Unit 2: Elements and Principles of Art',
    content: `1.1.5 SUBTOPIC: ELEMENTS OF ART
The Elements of Art are the fundamental visual components or "building blocks" that an artist uses to construct any visual composition.

THE SEVEN ELEMENTS OF ART:

1. LINE:
A continuous mark made on a surface by a moving point.
• Types of Lines: Contour lines, outline, gesture lines, cross-contour, hatching lines.
• Line Directions & Emotional Connotations:
  - Horizontal lines: Suggest calm, peace, stability, and rest (e.g. horizon over Lake Kariba).
  - Vertical lines: Convey strength, dignity, height, and spirituality (e.g. towering baobab trees).
  - Diagonal lines: Create dynamic tension, movement, drama, and action.
  - Curved / Organic lines: Suggest fluidity, grace, softness, and natural rhythm.

2. SHAPE:
A two-dimensional (2D) enclosed area defined by a boundary line. Shapes possess height and width but NO depth.
• Geometric Shapes: Precise mathematical shapes (circle, square, triangle, rectangle, hexagon).
• Organic / Freeform Shapes: Irregular, asymmetrical shapes found in nature (leaves, clouds, water puddles).

3. FORM:
A three-dimensional (3D) object or the visual illusion of 3D depth on a flat 2D surface. Forms have height, width, AND depth.
• Geometric Forms: Cube, sphere, cylinder, cone, pyramid.
• Organic Forms: Human body, rocks, animals, hand-carved wooden sculptures.

4. VALUE / TONE:
The lightness or darkness of a hue or surface. Value is determined by the light source interacting with planes of an object.
• Highlights: The brightest area where direct light strikes.
• Mid-tones: The true local color/tone under ambient lighting.
• Core Shadows & Cast Shadows: The darkest regions where light is blocked.

5. COLOUR (HUE):
The visual sensation produced when light wavelengths strike the retina. Properties: Hue (color name), Value (lightness/darkness), Intensity/Chroma (purity and brightness).

6. TEXTURE:
The surface quality of an artwork.
• Tactile (Actual) Texture: The real physical texture that can be felt by touching (e.g. rough bark, smooth polished stone, thick impasto paint).
• Visual (Implied) Texture: The illusion of surface roughness or smoothness created through skillful shading and pencil work.

7. SPACE:
The area around, between, and within components of a piece.
• Positive Space: The actual subject matter (e.g. a drawing of a clay pot).
• Negative Space: The empty or background area surrounding the subject.`,
    calloutBox: {
      title: 'Mnemonic for the 7 Elements of Art',
      type: 'tip',
      content: 'Remember the mnemonic: "Little Snakes Feel Very Cold To See" -> Line, Shape, Form, Value, Colour, Texture, Space.'
    },
    keyTakeaways: [
      'Shapes are 2D (height & width), while Forms are 3D (height, width & depth).',
      'Positive space is the subject; negative space is the background area.',
      'Value creates the illusion of 3D volume on flat paper.'
    ]
  },
  {
    pageNumber: 6,
    pageTitle: '1.1.6 The Principles of Art (Compositional Rules)',
    chapterTitle: 'Unit 2: Elements and Principles of Art',
    content: `1.1.6 SUBTOPIC: PRINCIPLES OF ART
While the Elements are the building blocks, the Principles of Art are the rules and guidelines governing how an artist arranges those elements into a cohesive, aesthetically pleasing composition.

THE SEVEN PRINCIPLES OF ART:

1. BALANCE:
The distribution of visual weight within an artwork.
• Symmetrical (Formal) Balance: Elements on both sides of a central axis are mirror images or identical in weight, creating stability and solemnity.
• Asymmetrical (Informal) Balance: Different elements of varying size, color, or texture balance each other out across the composition, creating dynamic visual interest.
• Radial Balance: Elements radiate outward from a central focal point like spokes on a bicycle wheel or petals on a sunflower.

2. CONTRAST:
The juxtaposition of strongly differing elements (light vs dark, rough vs smooth, large vs small, sharp vs soft) to create drama and prevent monotony.

3. EMPHASIS & FOCAL POINT:
The area of the composition that draws the viewer’s eye first. Emphasis can be achieved through contrast, placement along the Rule of Thirds, isolation, or converging leading lines.

4. MOVEMENT & RHYTHM:
• Rhythm: The repetition of visual elements (lines, shapes, colors) to create a visual tempo or beat.
• Movement: Guiding the viewer’s eye path through the artwork toward focal points using directional lines and gradients.

5. PATTERN & REPETITION:
The organized, planned repetition of specific motifs across a surface (e.g. traditional Chitenge cloth motifs and geometric basketry weaves).

6. PROPORTION & SCALE:
• Proportion: The relative size relationship between different parts of a single object (e.g. human facial proportions: eyes sit midway between the top of the skull and chin).
• Scale: The size of an object in relation to the surrounding environment or a standard human measure.

7. UNITY & HARMONY:
The sense of wholeness and visual oneness where all elements belong together seamlessly. Achieved through consistent color schemes, proximity, and repetition.`,
    calloutBox: {
      title: 'Studio Composition Tip',
      type: 'tip',
      content: 'Avoid placing your main focal point dead-center in your drawing. Use the "Rule of Thirds" by dividing your paper into a 3x3 grid and placing the focal point at one of the 4 grid intersections.'
    },
    keyTakeaways: [
      'Balance can be symmetrical, asymmetrical, or radial.',
      'Emphasis creates a focal point that captures immediate attention.',
      'Unity ensures that all parts of an artwork work together as a single whole.'
    ]
  },
  {
    pageNumber: 7,
    pageTitle: '1.1.8 Shading Techniques & Tonal Gradation Scales',
    chapterTitle: 'Unit 3: Studio Drawing & Observation',
    content: `1.1.8 SUBTOPIC: TYPES OF SHADING TECHNIQUES
Shading is the process of applying varying degrees of darkness to a 2D line drawing to create the illusion of three-dimensional form, volume, and light.

THE SIX ESSENTIAL SHADING TECHNIQUES:

1. HATCHING:
Applying closely spaced parallel lines in one direction. Shorter, denser lines create deeper shadows; widely spaced lines produce lighter mid-tones.

2. CROSS-HATCHING:
Intersecting two or more sets of parallel lines at angles (e.g., perpendicular or diagonal). The denser the overlapping lattice, the darker the tonal value. Ideal for rendering rich shadow depths and coarse textures.

3. STIPPLING / POINTILLISM:
Applying thousands of individual dots using the tip of a pencil, fine-liner pen, or ink nib. Areas with tightly clustered dots create dark shadows, while dispersed dots represent highlights.

4. SMUDGING / BLENDING:
Softening pencil marks using a blending stump (tortillon), soft tissue, or chamois cloth to produce ultra-smooth, continuous tone gradients. Ideal for human skin tones, spherical forms, and polished surfaces.

5. SCUMBLING / SCRIBBLE SHADING:
Applying controlled, overlapping circular loops and scribbled strokes. Produces expressive, organic textures suitable for hair, tree foliage, and fabric.

6. MASHING / BURNISHING:
Applying heavy pencil pressure with soft graphite (4B, 6B) to saturate paper tooth and produce intense, velvet-black shadows.

THE 9-STEP TONAL VALUE SCALE:
Every student must construct a standard 9-step gray scale:
[Step 1: Pure Paper White (100% Highlight)]
[Step 2: Very Light Gray]
[Step 3: Light Gray]
[Step 4: Medium Light Gray]
[Step 5: Mid-Tone Gray (50% Value)]
[Step 6: Medium Dark Gray]
[Step 7: Dark Gray]
[Step 8: Very Dark Gray]
[Step 9: Deepest Black (Core Shadow)]`,
    calloutBox: {
      title: 'Pencil Grade Selection Guide',
      type: 'tip',
      content: 'Use H-grade pencils (2H, 4H) for faint preliminary guidelines; use HB for general line work; use soft B-grade pencils (2B, 4B, 6B) for rich shading and shadows.'
    },
    keyTakeaways: [
      'Mastery of cross-hatching, stippling, and blending is foundational for observational drawing.',
      'A 9-step tonal scale trains the artist’s eye to distinguish subtle value shifts.'
    ]
  },
  {
    pageNumber: 8,
    pageTitle: '1.2 History of Zambian Art & Traditional Crafts',
    chapterTitle: 'Unit 4: Zambian Cultural Heritage',
    content: `1.2 HISTORY OF ZAMBIAN ART & PRE-HISTORIC ROCK ART
Zambia possesses one of the richest collections of pre-historic rock art in Central and Southern Africa, dating back thousands of years to Late Stone Age hunter-gatherer populations (the BaTwa / San ancestors).

MAJOR ROCK ART SITES IN ZAMBIA:
• Mwela Rock Paintings (Kasama, Northern Province):
Contains over 1,000 documented rock art sites. Displays naturalistic wildlife paintings (antelopes, elephants) and stylized red schematic designs.
• Nachikufu Cave (Mpika, Muchinga Province):
Features layered prehistoric paintings and archaeological deposits spanning over 18,000 years.
• Nsalu Cave (Serenje, Central Province):
Famous for intricate geometric and schematic rock engravings and painted yellow and red cross-grid patterns.

CULTURAL SIGNIFICANCE OF ROCK ART:
1. Spiritual & Ritual Ceremonies: Recording rain-making prayers, initiation rites, and spirit world visions.
2. Historical Documentation: Depicting hunting expeditions, migrations, and wildlife abundance.

TRADITIONAL ZAMBIAN CRAFTS:

1. WOODCARVING & MASKS:
• Makishi Masquerade (Luvale, Chokwe, Luchazi, Mbunda of Western/North-Western Zambia):
Intricately carved wooden and bark masks worn during Mukanda initiation rites (e.g. Likishi lya Mwana Pwevo symbolizing female beauty, and Kayipu the king mask).
• Tonga Royal Stools & Mortars (Mwiko): Hand-carved hardwood functional items.

2. BASKETRY & WEAVING:
• Barotse Coiled Baskets (Western Province): Woven from Makenge tree roots, known for watertight weaving and dark dyed geometric patterns.
• Tonga Winnowing Baskets (Busu): Functional shallow baskets used for grain processing.

3. TEXTILES & CERAMICS:
• Chitenge Fabric: Traditional printed cotton fabric used for wraps, head ties, and modern Zambian high-fashion tailoring.
• Traditional Pottery: Hand-coiled clay pots (Inongo/Nongo) pit-fired with organic tree bark and smoke reduction to create polished black surfaces.`,
    calloutBox: {
      title: 'Heritage Preservation Note',
      type: 'activity',
      content: 'National Heritage Conservation Commission (NHCC) protects all Zambian rock art sites. It is strictly illegal to paint over, deface, or chip off ancient rock art.'
    },
    keyTakeaways: [
      'Mwela, Nachikufu, and Nsalu caves are world-renowned Zambian prehistoric rock art sites.',
      'Makishi masquerade masks and Makenge root basketry represent premier indigenous craft traditions.'
    ]
  },
  {
    pageNumber: 9,
    pageTitle: '1.3 Colour Theory & Visible Spectrum Harmonies',
    chapterTitle: 'Unit 5: Colour Science and Design',
    content: `1.3 INTRODUCTION TO COLOUR & THE VISIBLE SPECTRUM
Colour is the optical perception of light reflected off surfaces. Sir Isaac Newton proved in 1666 that white sunlight passing through a triangular glass prism splits into the visible spectrum:
Red, Orange, Yellow, Green, Blue, Indigo, Violet (ROYGBIV).

THE 12-PART COLOUR WHEEL:
1. Primary Colours (The Foundations):
• Red, Yellow, Blue.
• Pure hues that cannot be created by mixing any other pigments together.

2. Secondary Colours:
• Created by mixing equal parts of two primary colours:
  - Orange = Red + Yellow
  - Green = Yellow + Blue
  - Violet (Purple) = Red + Blue

3. Tertiary (Intermediate) Colours:
• Created by mixing a primary colour with its adjacent secondary colour:
  - Red-Orange, Yellow-Orange, Yellow-Green, Blue-Green, Blue-Violet, Red-Violet.

COLOUR SCHEMES & HARMONIES:
• Monochromatic Scheme: Uses variations in tints (color + white) and shades (color + black) of a single hue. Creates a calm, harmonious mood.
• Complementary Scheme: Hues located directly opposite each other on the color wheel (e.g. Red & Green, Blue & Orange, Yellow & Violet). Produces high contrast, vibrant energy, and optical vibration.
• Analogous Scheme: Three or four hues sitting side-by-side on the color wheel (e.g. Yellow, Yellow-Orange, Orange). Creates natural harmony often found in autumn foliage and sunsets.
• Triadic Scheme: Three hues spaced equally around the color wheel forming an equilateral triangle (e.g. Red, Yellow, Blue).

TEMPERATURE OF COLOUR:
• Warm Colours: Reds, Oranges, Yellows. Evoke sunlight, fire, energy, and appear to advance forward.
• Cool Colours: Blues, Greens, Purples. Evoke water, sky, shade, calm, and appear to recede backward.`,
    calloutBox: {
      title: 'Formula for Tints, Shades & Tones',
      type: 'formula',
      content: '• Tint = Pure Hue + White | • Shade = Pure Hue + Black | • Tone = Pure Hue + Gray'
    },
    keyTakeaways: [
      'Primary colours (Red, Yellow, Blue) cannot be mixed; secondary colours are equal mixes of two primaries.',
      'Complementary colours sit opposite each other on the wheel and create high-impact contrast.'
    ]
  },
  {
    pageNumber: 10,
    pageTitle: '1.4 Studio Practice & 1.5 Graphic Design Typography',
    chapterTitle: 'Unit 6: Studio Practice & Typography',
    content: `1.4 STUDIO DRAWING PRACTICES
A professional studio artist executes drawing across three distinct stages:

1. Sketches:
Quick, loose, preliminary drawings capturing gestures, proportions, and basic silhouettes in minutes without detail.
2. Studies:
Detailed analytical investigations focusing on specific segments (e.g. an anatomical study of a human hand, light reflection on a ceramic vessel, or folds in drapery).
3. Complete Works:
Fully rendered, exhibition-ready artworks with refined composition, balanced tonal values, and polished presentation.

1.5 GRAPHIC DESIGN, LETTERING & CALLIGRAPHY
Graphic Design is visual communication that combines images, words, and typography to convey messages to an audience.

ANATOMY OF TYPOGRAPHY:
• Baseline: The invisible horizontal line on which text characters sit.
• Cap Height: The height of capital letters measured from the baseline.
• Ascender: The portion of a lowercase letter that extends above the mean line (e.g. in 'b', 'd', 'h', 'k').
• Descender: The portion of a letter that extends below the baseline (e.g. in 'g', 'j', 'p', 'q', 'y').
• Serif: Small decorative projection or foot at the ends of letter strokes (e.g. Times New Roman).
• Sans-Serif: Clean lettering without decorative feet (e.g. Arial, Helvetica).

GRID LETTERING:
Constructing precise, uniform capital letters using a standardized grid (e.g., 5-square high by 3-square or 4-square wide ratio). Ensures mathematical spacing, consistent stroke thickness, and professional sign-writing clarity.

CALLIGRAPHY:
The art of beautiful, stylized handwriting using broad-edge dip pens, ink brushes, or chisel-tip markers held at a consistent 45-degree angle.`,
    calloutBox: {
      title: 'Studio Safety & Equipment Maintenance',
      type: 'warning',
      content: 'Always cap solvent markers after use to prevent vapor inhalation. Clean paintbrushes with water/soap immediately after acrylic sessions to prevent bristles from hardening permanently.'
    },
    keyTakeaways: [
      'Drawings progress from rapid sketches to detailed studies to complete exhibition works.',
      'Typography anatomy includes baseline, cap height, ascenders, descenders, and serifs.',
      'Grid lettering ensures geometric uniformity for sign writing and commercial posters.'
    ]
  }
];

export const PES_F1_T2_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Module Vision, Philosophy & Safety Standards',
    chapterTitle: 'Preface & Foundational Standards',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT
THE CURRICULUM DEVELOPMENT CENTRE (CDC), LUSAKA (2025)

PHYSICAL EDUCATION AND SPORT TEACHING MODULE — FORM 1 TERM 2
(Ordinary Secondary Level — Competence-Based Curriculum Framework)

VISION & PREFACE
The Competence-Based Curriculum (CBC) framework positions Physical Education and Sport (PES) as an indispensable pillar for total human development, wellness, and national pride. The Form 1 Term 2 module provides structured lesson guides, scientific fitness testing protocols, gymnastics routines, indigenous Zambian games, and lifesaving water safety principles.

MINISTRY & CDC PES WRITING PANEL:
• Gwen Chewe — Kasama College of Education (Senior Lecturer)
• Samson Chuube — Munali Girls Secondary School
• Wisha Hamuyamba — Munali Boys Secondary School
• Maxwell Kalima — Arakan Secondary School
• James Kapansa — Malcolm Moffat College of Education
• Omega Sinyangwe — Chinyanta Secondary School

CORE OBJECTIVES OF TERM 2 PES:
1. Develop health-related physical fitness components for lifelong cardiovascular and muscular health.
2. Execute gymnastic floor stunts and tumbling with strict adherence to safety and spotting mechanics.
3. Preserve indigenous Zambian games as vehicles for agility, strategy, and cultural identity.
4. Master lifesaving swimming rules, pool hygiene, and drowning prevention techniques.`,
    calloutBox: {
      title: 'Teacher Safety Directive',
      type: 'tip',
      content: 'Never allow learners to perform gymnastic tumbling or apparatus vaults without designated, trained student spotters and certified landing mats in place.'
    },
    keyTakeaways: [
      'PES promotes lifelong wellness, motor competence, and collaborative teamwork.',
      'Developed by expert physical education lecturers from Kasama, Malcolm Moffat, Munali, and Arakan.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: 'Topic 1.5 Health-Related Components of Fitness',
    chapterTitle: 'Unit 1: Physical Fitness & Health Promotion',
    content: `TOPIC 1.5: FITNESS ACTIVITIES & HEALTH PROMOTION
Physical fitness is the ability of the body systems to work together efficiently, allowing an individual to be healthy and effectively perform daily activities, academic tasks, sports, and emergency situations without undue fatigue.

THE FIVE HEALTH-RELATED COMPONENTS OF FITNESS:

1. CARDIOVASCULAR ENDURANCE (AEROBIC CAPACITY):
• The ability of the heart, lungs, and blood vessels to supply oxygen and nutrients to working muscles during sustained, continuous physical activity.
• Key Activities: Distance running (1500m, 3000m), cycling, swimming, skipping rope, continuous soccer play.

2. MUSCULAR STRENGTH:
• The maximum amount of force a muscle or muscle group can exert against a resistance in a single maximal effort (1-Repetition Maximum).
• Key Activities: Heavy weightlifting, shot put throwing, pushing a stalled vehicle, maximal isometric hold.

3. MUSCULAR ENDURANCE:
• The ability of a muscle or muscle group to perform repeated contractions over an extended period without fatigue.
• Key Activities: Push-ups, sit-ups/curl-ups, high-repetition bodyweight squats, plank holds.

4. FLEXIBILITY:
• The complete range of motion (ROM) available around a specific joint or series of joints.
• Key Activities: Gymnastics, yoga stretching, hurdle stretch, sit-and-reach exercise.

5. BODY COMPOSITION:
• The relative proportion of fat-free mass (muscle, bone, vital organs, water) compared to total body adipose (fat) tissue.
• Maintained through a balanced diet, proper hydration, and regular aerobic and resistance exercise.`,
    calloutBox: {
      title: 'Health vs Skill Components',
      type: 'tip',
      content: 'Health-related components keep the body disease-free and functionally fit for everyday life; Skill-related components (agility, speed, power) enhance performance in specific competitive sports.'
    },
    keyTakeaways: [
      'The 5 health-related components are Cardiovascular Endurance, Muscular Strength, Muscular Endurance, Flexibility, and Body Composition.',
      'Cardiovascular endurance directly strengthens heart efficiency and reduces lifestyle disease risk.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: 'Standard Fitness Assessment Battery Protocols',
    chapterTitle: 'Unit 1: Physical Fitness & Health Promotion',
    content: `STANDARD FITNESS ASSESSMENT PROTOCOLS (CDC TESTING BATTERY)
Teachers must administer standardized fitness assessments to benchmark student health and track physiological improvement.

1. COOPER 12-MINUTE RUN / WALK TEST:
• Purpose: Measures aerobic capacity and VO2 max estimation.
• Protocol: Administered on a standard 400m running track. Learners run/walk continuously for exactly 12 minutes. Total distance covered in meters is recorded.
• Rating Standards (Boys Form 1): >2,700m (Excellent), 2,400–2,700m (Good), 2,200–2,399m (Average), <2,200m (Needs Improvement).

2. KASCH-BOYER 30CM STEP TEST:
• Purpose: Evaluates cardiovascular recovery heart rate after standardized submaximal workload.
• Protocol: Learner steps up and down on a 30.5cm (12 inch) sturdy bench at a cadence of 24 steps per minute (96 bpm on a metronome) for 3 minutes.
• Recovery Recording: Learner immediately sits down; recovery pulse is counted for a full 60 seconds starting within 5 seconds of completion. Lower recovery pulse indicates superior aerobic conditioning.

3. SIT-AND-REACH TEST:
• Purpose: Measures flexibility of the lower back and hamstring muscle group.
• Protocol: Learner sits on the floor with legs fully extended against the test box, knees kept straight. Reaching forward smoothly with palms down, the maximal point reached and held for 2 seconds is measured in centimeters.

4. TRUNK EXTENSION & SHOULDER REACH TESTS:
• Trunk Extension: Measures spinal extensor flexibility lying prone and arching the torso.
• Shoulder Reach: Measures shoulder girdle mobility using a calibrated measuring wand.`,
    calloutBox: {
      title: 'Testing Safety Rules',
      type: 'warning',
      content: 'Always conduct a thorough 10-minute dynamic warm-up before fitness testing. Never test learners who are feeling dizzy, dehydrated, or recovering from acute malaria or respiratory illness.'
    },
    keyTakeaways: [
      'Cooper 12-min test measures aerobic endurance; Kasch-Boyer step test evaluates heart rate recovery.',
      'Sit-and-reach test is the global standard for hamstring and lower back flexibility.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: 'Isotonic vs Isometric Muscle Actions',
    chapterTitle: 'Unit 1: Physical Fitness & Health Promotion',
    content: `1.5.2 & 1.5.3 ISOTONIC VS ISOMETRIC ACTIVITIES

MUSCULAR CONTRACTION MECHANISMS:

1. ISOTONIC (DYNAMIC) EXERCISES:
• Definition: Muscle contraction where muscle length changes dynamically while tension remains relatively constant, producing visible movement across a skeletal joint.
• Sub-Types of Isotonic Actions:
  a. Concentric Contraction (Positive Work):
     - The muscle actively shortens while generating force.
     - Example: The upward lifting phase of a bicep curl (bicep shortens), or pushing upward from the bottom of a push-up.
  b. Eccentric Contraction (Negative Work):
     - The muscle actively lengthens while resisting a load or controlling descent.
     - Example: Lowering the body down under control during a push-up, or lowering a barbell back down.

• Benefits: Builds functional dynamic power, athletic agility, and muscular endurance.

2. ISOMETRIC (STATIC) EXERCISES:
• Definition: Muscle contraction where muscles exert high tension against an immovable object or load, but NO visible joint movement occurs and the muscle length remains constant.
• Key Examples:
  - Pushing with maximum effort against a solid brick wall.
  - Plank Hold (holding forearm bridge position with locked core for 60 seconds).
  - Wall Sit (knees bent at 90 degrees with back flat against a wall).
  - Static Glute Bridge hold.

• Key Advantages:
  1. Requires zero specialized gym equipment.
  2. Excellent for post-injury rehabilitation without irritating joint cartilage.
  3. Rapidly increases static stabilizing core strength.`,
    calloutBox: {
      title: 'Biomechanics Comparison Table',
      type: 'formula',
      content: '• Isotonic = Muscle Length Changes (Concentric = Shortens, Eccentric = Lengthens) | • Isometric = Muscle Length Stays Constant (Static Joint Angle)'
    },
    keyTakeaways: [
      'Isotonic contractions involve movement (concentric lifting and eccentric lowering).',
      'Isometric contractions generate high muscle tension with zero joint movement.'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: 'Topic 1.6 Gymnastics: Floor Work, Stunts & Spotting',
    chapterTitle: 'Unit 2: Gymnastics & Body Mechanics',
    content: `TOPIC 1.6: GYMNASTICS (STUNTS, ROLLS & TUMBLING)
Gymnastics develops body awareness, spatial orientation, poise, core stabilization, and muscular power.

FUNDAMENTAL GYMNASTIC MOVEMENTS:

1. FORWARD ROLL (SOMERSAULT):
• Phase 1 (Starting Position): Squat on balls of feet, knees together, arms extended forward.
• Phase 2 (Hand Placement): Place hands flat on mat, shoulder-width apart, fingers pointing forward.
• Phase 3 (Execution): Tuck chin tightly against chest (looking at navel), push off toes, roll smoothly along the curved upper spine (shoulders and back). The top of the head MUST NEVER touch the mat.
• Phase 4 (Recovery): Grasp shins, maintain tight tuck, and roll back onto feet in an upright squat without hands pushing off floor.

2. BACKWARD ROLL:
• Squat down, hands positioned beside ears with palms facing up/backward and fingers pointing toward shoulders.
• Push backward from feet, round the back, roll over shoulders, place hands on mat, and press firmly against the floor to relieve pressure on the neck as feet touch down.

3. THE BRIDGE (BACK EXTENSION):
• Lie supine (flat on back), bend knees with feet flat on the mat close to glutes.
• Place hands palms down beside ears with fingers pointing toward shoulders.
• Press firmly through feet and hands simultaneously, extending arms and arching spine into a smooth curve.

4. HANDSTAND WITH WALL / SPOTTER SUPPORT:
• Step forward into lunge, reach hands to mat shoulder-width apart, kick back leg upward followed by lead leg.
• Lock elbows straight, tuck ribs, squeeze glutes, point toes directly toward ceiling.

SPOTTING SAFETY PROTOCOLS:
• Spotters must stand to the side of the performer, never directly in the roll trajectory.
• Place supporting hands on the performer’s hips and upper shoulder blades to guide rotation and prevent head or neck impact.`,
    calloutBox: {
      title: 'Critical Gymnastic Safety Rule',
      type: 'warning',
      content: 'During rolls, the crown of the head must NEVER take direct vertical impact. The chin must remain tightly tucked into the chest to ensure the curved upper back contacts the mat.'
    },
    keyTakeaways: [
      'Forward rolls require chin tucked to chest so the upper back rolls along the mat.',
      'Spotting protects learners from cervical spine trauma and builds movement confidence.'
    ]
  },
  {
    pageNumber: 6,
    pageTitle: 'Topic 1.7 Indigenous Zambian Traditional Games',
    chapterTitle: 'Unit 3: Recreational Games and Indigenous Heritage',
    content: `TOPIC 1.7: INDIGENOUS ZAMBIAN TRADITIONAL GAMES
Traditional Zambian games have been played across generations, fostering agility, strategic cunning, aerobic fitness, and community solidarity without requiring expensive commercial equipment.

PROMINENT TRADITIONAL GAMES IN FORM 1 CURRICULUM:

1. CHAIN TAG (KOLOBOLA / CHUNGU CHABAZUNGU):
• Rules: One player is chosen as the "Tagger". When the tagger touches another player, the two hold hands to form a chain.
• Progression: As more runners are tagged, the chain grows longer. Only the players at the extreme ends (the "heads" of the chain) can tag free runners. Free runners can dodge under arms to break the chain.
• Physical Fitness Benefits: High-intensity agility, rapid lateral deceleration, and collaborative coordination.

2. SHEEP-SHEEP COME ALL (MPWEMU MPWEMU):
• Setup: Two safe goal zones separated by a wide center field guarded by 2 "Wolves/Defenders".
• Rules: The Shepherd calls: "Sheep, Sheep, come home!" The Sheep respond: "We are afraid of the Wolf!" The Shepherd replies: "The Wolf has gone to Kasama, come all!"
• The sheep must sprint across the middle zone. Tagged sheep become wolves in subsequent rounds until one champion sheep remains.
• Fitness Benefits: Sprint speed, deceptive cutting, spatial anticipation.

3. CIYATO (STONE CATCHING / JUGGLING):
• Setup: 10 to 15 small stones placed in a shallow hollow in the ground.
• Execution: Player tosses a lead stone ("mother stone") in the air, scoops out designated stones from the hole, and catches the tossed stone with the same hand before it strikes the ground.
• Fitness Benefits: Exceptional hand-eye coordination, fine motor dexterity, and peripheral visual tracking.

4. MUSICAL CHAIRS & KNOWLEDGE HERITAGE GAMES:
• "Who Am I?" riddle-based indigenous cultural games teaching clan totems, proverbs, and geography.`,
    calloutBox: {
      title: 'Cultural Heritage Value',
      type: 'activity',
      content: 'Organize a school-wide Traditional Games Day. Document variations of names used for Chain Tag and Ciyato across Bemba, Tonga, Lozi, Tumbuka, Kaonde, Luvale, and Lunda traditions.'
    },
    keyTakeaways: [
      'Indigenous games build sprint speed, evasion agility, and collaborative spirit.',
      'Provide zero-cost, highly accessible recreational physical activity.'
    ]
  },
  {
    pageNumber: 7,
    pageTitle: 'Topic 1.8 Swimming Fundamentals, Drownproofing & Rescues',
    chapterTitle: 'Unit 4: Aquatic Skills and Water Safety',
    content: `TOPIC 1.8: SWIMMING FUNDAMENTALS & WATER SAFETY
Water safety is a life-critical survival skill. In Zambia, proximity to rivers (Zambezi, Kafue, Luangwa) and lakes (Kariba, Bangweulu, Tanganyika) makes drowning prevention paramount.

THE GOLDEN RESCUE PROTOCOL:
"REACH, THROW, ROW, DON’T GO!"
Unless you are a certified, fully equipped lifeguard, NEVER jump into deep water to save a drowning victim, as a panicking victim will instinctively pull the rescuer underwater.

1. REACH:
Lie flat on your stomach on the pool deck or bank (to prevent being pulled in) and extend an object to the victim (bamboo pole, branch, towel, paddle, shepherd’s crook).

2. THROW:
Toss a buoyant floating object attached to a rope (lifebuoy, sealed empty 5-liter plastic container, football, inflatable ring) beyond the victim and pull them gently to the edge.

3. ROW:
Use a boat, canoe, or surfboard to paddle close to the victim without jumping into the water.

4. DON’T GO:
Call emergency services immediately and alert nearby adults.

SURVIVAL DROWNPROOFING (SURVIVAL FLOAT):
• A technique allowing non-swimmers to survive in deep water for hours with minimal energy expenditure.
• Mechanism: Relax face down in the water with arms dangling loosely. When ready for a breath, gently push arms downward, raise chin just above water surface, inhale deeply through mouth, and return face down while slowly exhaling underwater through nose.

POOL HYGIENE & SANITATION:
• Mandatory soapy shower before entering pool water to remove sweat, cosmetics, and bacteria.
• Strict prohibition of swimming with open wounds or infectious illnesses.
• Zero glass bottles, sharp objects, running on slippery aprons, or horseplay on pool decks.`,
    calloutBox: {
      title: 'CPR Protocol in Drowning Resuscitation',
      type: 'warning',
      content: 'Once victim is on land: Check response and breathing -> If not breathing, deliver 5 initial rescue breaths -> Followed by continuous cycles of 30 chest compressions (100–120 bpm) and 2 rescue breaths.'
    },
    keyTakeaways: [
      'Reach, Throw, Row, Don’t Go is the foundational lifesaving principle.',
      'Survival floating preserves energy and prevents drowning in deep water.'
    ]
  }
];

export const MATH_F1_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Unit 1: Algebraic Variables, Terms & Expressions',
    chapterTitle: 'Unit 1: Foundations of Algebra',
    content: `CDC FORM 1 MATHEMATICS — MODULE 1.1
ALGEBRAIC EXPRESSIONS & LINEAR EQUATIONS

1.1 INTRODUCTION TO ALGEBRAIC NOTATION
Algebra is generalized arithmetic where letters (variables) represent unknown numbers or changing values.

KEY TERMINOLOGY:
1. Variable: A letter or symbol representing an unknown value (e.g. x, y, a, b).
2. Constant: A fixed numerical value that does not change (e.g. 5, -12, 3/4).
3. Coefficient: The numerical multiplier in front of a variable (e.g. in 7x, 7 is the coefficient). If no number is written, the coefficient is 1 (e.g. x = 1x).
4. Term: A single number, variable, or product of numbers and variables separated by + or - signs (e.g. in 4x² - 3x + 8, the terms are 4x², -3x, and 8).
5. Expression: A combination of terms connected by arithmetic operations without an equals sign (e.g. 3x + 7).
6. Equation: A mathematical statement showing that two expressions are equal (e.g. 3x + 7 = 22).

LIKE AND UNLIKE TERMS:
• Like Terms: Terms that possess the exact same variables raised to the exact same powers, regardless of their numerical coefficients.
  - Examples of Like Terms: 3x and 8x; -5ab and 12ab; 7y² and 2y².
• Unlike Terms: Terms with different variables or differing exponents.
  - Examples of Unlike Terms: 4x and 4y; 3x² and 3x³; 5a and 5ab.

RULE FOR ADDITION & SUBTRACTION:
You can ONLY combine (add or subtract) LIKE terms by adding their coefficients. Unlike terms CANNOT be merged into a single term!`,
    calloutBox: {
      title: 'Common Student Error',
      type: 'warning',
      content: 'Do NOT write 3x + 4y = 7xy! 3x and 4y are unlike terms and cannot be combined into one term.'
    },
    workedExamples: [
      {
        question: 'Simplify the algebraic expression: 5x + 3y - 2x + 7y - 4',
        steps: [
          'Step 1: Group like terms together: (5x - 2x) + (3y + 7y) - 4',
          'Step 2: Combine coefficients of x: 5x - 2x = 3x',
          'Step 3: Combine coefficients of y: 3y + 7y = 10y',
          'Step 4: Keep the constant -4 intact.'
        ],
        answer: '3x + 10y - 4'
      }
    ],
    keyTakeaways: [
      'Variables represent unknown numbers; coefficients multiply variables.',
      'Only like terms (identical variable powers) can be added or subtracted.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: 'Unit 2: Expanding Brackets & The Distributive Law',
    chapterTitle: 'Unit 2: Simplifying Algebraic Expressions',
    content: `1.2 EXPANDING BRACKETS (THE DISTRIBUTIVE LAW)
The Distributive Law states that every term inside a set of parentheses must be multiplied by the factor outside the parentheses:
a(b + c) = ab + ac
a(b - c) = ab - ac

RULES OF SIGNS IN MULTIPLICATION:
• Positive × Positive = Positive (+ × + = +)
• Positive × Negative = Negative (+ × - = -)
• Negative × Positive = Negative (- × + = -)
• Negative × Negative = Positive (- × - = +)

EXPANDING AND SIMPLIFYING MULTI-BRACKET EXPRESSIONS:
When simplifying expressions containing multiple sets of brackets:
1. First expand all brackets by multiplying the outside terms.
2. Carefully apply the negative sign to all terms inside when distributing a negative coefficient.
3. Collect all like terms.
4. Simplify to lowest terms.`,
    calloutBox: {
      title: 'Sign Trap Alert',
      type: 'warning',
      content: 'When expanding -3(2x - 5), remember: -3 × (-5) = +15. The result is -6x + 15, NOT -6x - 15.'
    },
    workedExamples: [
      {
        question: 'Expand and simplify: 4(3x - 2) - 2(5x - 4)',
        steps: [
          'Step 1: Expand first bracket: 4 × 3x + 4 × (-2) = 12x - 8',
          'Step 2: Expand second bracket: -2 × 5x + (-2) × (-4) = -10x + 8',
          'Step 3: Combine expressions: 12x - 8 - 10x + 8',
          'Step 4: Group like terms: (12x - 10x) + (-8 + 8) = 2x + 0'
        ],
        answer: '2x'
      }
    ],
    keyTakeaways: [
      'Multiply the outside multiplier by EVERY term inside the bracket.',
      'A negative outside changes the signs of all terms within the bracket.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: 'Unit 3: Solving Single-Variable Linear Equations',
    chapterTitle: 'Unit 3: Linear Equations Mastery',
    content: `1.3 SOLVING LINEAR EQUATIONS IN ONE VARIABLE
A linear equation is an algebraic equality where the highest power of the variable is 1.

THE BALANCE PRINCIPLE:
Think of an equation as a balanced two-pan weighing scale. Whatever mathematical operation you apply to the Left-Hand Side (LHS), you MUST apply equally to the Right-Hand Side (RHS) to maintain balance.

INVERSE OPERATIONS:
• The inverse of Addition (+) is Subtraction (-).
• The inverse of Subtraction (-) is Addition (+).
• The inverse of Multiplication (×) is Division (÷).
• The inverse of Division (÷) is Multiplication (×).

SYSTEMATIC 4-STEP METHOD FOR SOLVING EQUATIONS:
1. Clear brackets (if any) using the distributive property.
2. Clear fractions (if any) by multiplying all terms by the Lowest Common Denominator (LCD).
3. Collect all variable terms on one side (usually LHS) and all constant numbers on the opposite side (RHS).
4. Divide both sides by the coefficient of the variable to isolate x.`,
    calloutBox: {
      title: 'ECZ Step-Marking Tip',
      type: 'ecz_exam',
      content: 'ECZ examiners award method marks (M1) for showing clear inverse operations on both sides. Never write down just the final answer without intermediate steps!'
    },
    workedExamples: [
      {
        question: 'Solve the equation: 5(2x - 3) = 3(x + 9)',
        steps: [
          'Step 1: Expand brackets on both sides: 10x - 15 = 3x + 27',
          'Step 2: Subtract 3x from both sides: 10x - 3x - 15 = 27 -> 7x - 15 = 27',
          'Step 3: Add 15 to both sides: 7x = 27 + 15 -> 7x = 42',
          'Step 4: Divide both sides by 7: x = 42 / 7 = 6',
          'Step 5: Check solution in original equation: LHS = 5(12 - 3) = 45; RHS = 3(6 + 9) = 45 (True!)'
        ],
        answer: 'x = 6'
      }
    ],
    keyTakeaways: [
      'Inverse operations isolate the variable on one side of the equals sign.',
      'Always substitute your final answer back into the original equation to verify.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: 'Unit 4: Equations with Fractional Coefficients',
    chapterTitle: 'Unit 4: Fractions in Algebra',
    content: `1.4 LINEAR EQUATIONS WITH ALGEBRAIC FRACTIONS
Equations containing fractions are solved by clearing the denominators using the Lowest Common Multiple (LCM) of all denominators.

METHOD:
1. Find the LCM of all numerical denominators in the equation.
2. Multiply every single term on both LHS and RHS by this LCM.
3. Simplify the resulting integer equation.
4. Solve for the unknown variable.`,
    workedExamples: [
      {
        question: 'Solve for x: (2x + 1) / 3 - (x - 2) / 4 = 3',
        steps: [
          'Step 1: Identify denominators 3, 4, and 1. The LCM is 12.',
          'Step 2: Multiply every term by 12: 12 × [(2x + 1)/3] - 12 × [(x - 2)/4] = 12 × 3',
          'Step 3: Simplify: 4(2x + 1) - 3(x - 2) = 36',
          'Step 4: Expand brackets: 8x + 4 - 3x + 6 = 36',
          'Step 5: Combine like terms: 5x + 10 = 36',
          'Step 6: Subtract 10 from both sides: 5x = 26',
          'Step 7: Divide by 5: x = 26/5 = 5.2 (or 5 1/5)'
        ],
        answer: 'x = 26/5 (5.2)'
      }
    ],
    keyTakeaways: [
      'Multiplying by the LCM clears all fractions in a single step.',
      'Place numerator expressions in brackets when multiplying to avoid sign errors.'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: 'Unit 5: Real-World Word Problems in Zambian Commerce',
    chapterTitle: 'Unit 5: Word Problem Formulations',
    content: `1.5 WORD PROBLEMS INVOLVING LINEAR EQUATIONS
Translating real-life situations into algebraic equations is a crucial 21st-century competence.

TRANSLATING ENGLISH TO ALGEBRA:
• "A number increased by 8" -> x + 8
• "5 less than twice a number" -> 2x - 5
• "Three times the sum of x and 4" -> 3(x + 4)
• "The product of a number and 7 is 42" -> 7x = 42

PROBLEM-SOLVING STRATEGY:
1. Let a letter (e.g. x) represent the primary unknown quantity.
2. Express all other unknown quantities in terms of x.
3. Write down an equation connecting the quantities based on the problem statement.
4. Solve the equation.
5. State the final answer with proper units (e.g. Kwacha, meters, kilograms).`,
    workedExamples: [
      {
        question: 'A trader in Soweto Market, Lusaka bought 3 bags of maize and 2 bags of beans for K1,650. If a bag of beans costs K150 more than a bag of maize, find the cost of a bag of maize.',
        steps: [
          'Step 1: Let the cost of 1 bag of maize = Kx.',
          'Step 2: Cost of 1 bag of beans = K(x + 150).',
          'Step 3: Total cost equation: 3(x) + 2(x + 150) = 1650',
          'Step 4: Expand: 3x + 2x + 300 = 1650',
          'Step 5: 5x + 300 = 1650 -> 5x = 1350',
          'Step 6: x = 1350 / 5 = K270 (Maize bag)',
          'Step 7: Check: 3(270) + 2(420) = 810 + 840 = K1,650 (Correct!)'
        ],
        answer: 'Cost of 1 bag of maize = K270 (and 1 bag of beans = K420)'
      }
    ],
    keyTakeaways: [
      'Define unknown variables clearly at the start of any word problem.',
      'Check that the algebraic solution makes logical sense in real-world units.'
    ]
  }
];

export const ECZ_G12_MATH_EXAM_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'ECZ Paper 1 Section A — Matrix Algebra, Set Theory & Arithmetic',
    chapterTitle: 'ECZ Grade 12 National Exam Solutions',
    content: `EXAMINATIONS COUNCIL OF ZAMBIA (ECZ)
GRADE 12 MATHEMATICS EXAMINATION (PAPER 1)
OFFICIAL MODEL SOLUTIONS & MARKING SCHEME

QUESTION 1 (Indices & Scientific Notation):
Evaluate: (16/81)^(-3/4)
Solution:
Step 1: Apply negative exponent rule: (16/81)^(-3/4) = (81/16)^(3/4)
Step 2: Take the 4th root: 4th root of 81 = 3; 4th root of 16 = 2.
Step 3: Raise to the 3rd power: (3/2)^3 = 27/8 = 3 3/8.
Marks awarded: [B2]

QUESTION 2 (Matrix Algebra):
Given matrix A = [[3, -1], [2, 4]] and B = [[5], [-2]], find:
(a) The determinant of matrix A (det A)
(b) The inverse matrix A^(-1)
(c) The matrix product AB

Step-by-step Working:
(a) det A = (3 × 4) - (-1 × 2) = 12 - (-2) = 12 + 2 = 14. [B1]
(b) Adjugate matrix = [[4, 1], [-2, 3]]
    Inverse A^(-1) = (1/14) × [[4, 1], [-2, 3]] = [[4/14, 1/14], [-2/14, 3/14]] = [[2/7, 1/14], [-1/7, 3/14]]. [M1, A1]
(c) AB = [[3, -1], [2, 4]] × [[5], [-2]]
    Row 1: (3 × 5) + (-1 × -2) = 15 + 2 = 17
    Row 2: (2 × 5) + (4 × -2) = 10 - 8 = 2
    Result AB = [[17], [2]]. [M1, A1]`,
    calloutBox: {
      title: 'Examiner Advice on Matrix Multiplication',
      type: 'ecz_exam',
      content: 'Remember: Matrix multiplication is (Row × Column). Matrix A (2x2) times Matrix B (2x1) results in a (2x1) matrix.'
    },
    keyTakeaways: [
      'Determinant of [[a, b], [c, d]] is ad - bc.',
      'Inverse matrix is (1/det) × [[d, -b], [-c, a]].'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: 'ECZ Paper 1 Section B — Calculus (Derivatives & Tangents)',
    chapterTitle: 'ECZ Grade 12 National Exam Solutions',
    content: `QUESTION 3 (Calculus — Differentiation):
The equation of a curve is given by y = 2x³ - 9x² + 12x + 5.
(a) Find the derivative dy/dx.
(b) Find the gradient of the curve at the point where x = 3.
(c) Determine the coordinates of the turning points (stationary points) of the curve and classify their nature.

Full Worked Solution:
(a) Differentiating term by term using power rule d/dx(ax^n) = n·a·x^(n-1):
    dy/dx = (3 × 2x²) - (2 × 9x) + 12 = 6x² - 18x + 12. [A2]

(b) At x = 3:
    Gradient m = 6(3)² - 18(3) + 12 = 6(9) - 54 + 12 = 54 - 54 + 12 = 12. [B1]

(c) At turning points, dy/dx = 0:
    6x² - 18x + 12 = 0
    Divide entire equation by 6:
    x² - 3x + 2 = 0
    Factorize: (x - 1)(x - 2) = 0
    Therefore, x = 1 or x = 2.

Calculate corresponding y-coordinates:
• At x = 1: y = 2(1)³ - 9(1)² + 12(1) + 5 = 2 - 9 + 12 + 5 = 10. -> Point A(1, 10)
• At x = 2: y = 2(8) - 9(4) + 12(2) + 5 = 16 - 36 + 24 + 5 = 9. -> Point B(2, 9)

Determine nature using Second Derivative (d²y/dx²):
d²y/dx² = 12x - 18
• At x = 1: d²y/dx² = 12(1) - 18 = -6 < 0 (MAXIMUM TURNING POINT).
• At x = 2: d²y/dx² = 12(2) - 18 = +6 > 0 (MINIMUM TURNING POINT).`,
    calloutBox: {
      title: 'Stationary Point Classification Rule',
      type: 'formula',
      content: '• If d²y/dx² < 0 at turning point -> MAXIMUM | • If d²y/dx² > 0 at turning point -> MINIMUM'
    },
    keyTakeaways: [
      'Turning points occur when dy/dx = 0.',
      'The second derivative tests whether a stationary point is a local maximum or minimum.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: 'ECZ Paper 2 Section A — Coordinate Geometry & Linear Programming',
    chapterTitle: 'ECZ Grade 12 National Exam Solutions',
    content: `QUESTION 4 (Coordinate Geometry & Line Equations):
In the Cartesian plane, line L1 passes through points P(-2, 5) and Q(4, -7).
(a) Find the gradient of line L1.
(b) Determine the midpoint of PQ.
(c) Find the equation of the perpendicular bisector of PQ in the form y = mx + c.

Working Steps:
(a) Gradient m1 = (y2 - y1) / (x2 - x1) = (-7 - 5) / (4 - (-2)) = -12 / 6 = -2. [B1]

(b) Midpoint M = ((x1 + x2)/2, (y1 + y2)/2) = ((-2 + 4)/2, (5 + -7)/2) = (2/2, -2/2) = (1, -1). [B1]

(c) Perpendicular line gradient m2:
    Since L1 ⊥ L2, m1 × m2 = -1 -> -2 × m2 = -1 -> m2 = +1/2.
    Using point-slope formula with Midpoint (1, -1):
    y - y1 = m(x - x1)
    y - (-1) = (1/2)(x - 1)
    y + 1 = (1/2)x - 1/2
    y = (1/2)x - 1/2 - 1
    y = (1/2)x - 3/2 (or 2y = x - 3). [M1, A1]`,
    calloutBox: {
      title: 'Perpendicular Lines Theorem',
      type: 'formula',
      content: 'Two non-vertical lines are perpendicular if and only if the product of their gradients is -1 (m1 · m2 = -1).'
    },
    keyTakeaways: [
      'Perpendicular bisector passes through the midpoint and has negative reciprocal slope.',
      'Always express linear equations in requested format (y = mx + c or ax + by = c).'
    ]
  }
];

// Map of library item ID to its structured multi-page content
export const CDC_ART_F1_T3_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Term 3 Vision & 1.11 Topic: Crafts in 2D Overview',
    chapterTitle: 'Unit 1: 2D Crafts & Surface Techniques',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT
THE CURRICULUM DEVELOPMENT CENTRE (CDC), LUSAKA (2025)

ART & DESIGN TEACHING MODULE — FORM 1 TERM 3
(Ordinary Secondary Level — Competence-Based Curriculum Framework)

VISION & PREFACE
Permanent Secretary - Educational Services: Dr. Kelvin Mambwe
Director - Curriculum Development: Dr. Charles Ndakala
Curriculum Specialist Art & Design: Kelvin Makungu

"Quality, lifelong education for all which is accessible, inclusive and relevant to individual, national and global needs and value systems. Term 3 transitions learners from foundational theory into applied craft production, 3D sculpture, bookbinding, and creative entrepreneurship."

1.11 TOPIC: CRAFTS IN 2D
Two-dimensional (2D) crafts encompass surface design, composite image assembly, and planar textile structures created on flat planes.

KEY TECHNICAL TERMINOLOGY:
• Collage: An artistic composition made by gluing various materials (such as paper, fabric, wood shavings, seeds, pressed leaves) onto a flat surface.
• Montage: The technique of selecting, cutting, and combining several photographic images or visual fragments to produce a composite picture with unified thematic meaning.
• Mosaic: The art of creating pictures or geometric patterns by embedding small pieces (tesserae) of colored glass, stone, ceramic tile, or colored card onto an adhesive substrate.
• Frieze: A decorative horizontal band of painted or relief-sculpted narrative imagery running along the upper wall of a room or public building.
• Warp: The lengthwise, stationary threads held under high tension on a weaving loom.
• Weft: The crosswise threads woven over and under the stationary warp threads.
• Loom: A wooden or mechanical frame used to maintain warp thread tension during weaving.`,
    calloutBox: {
      title: 'Term 3 Studio Focus',
      type: 'tip',
      content: 'Encourage learners to gather abundant local organic materials (dried banana fibers, sisal, maize husks, melon seeds) for 2D collage and weaving projects.'
    },
    keyTakeaways: [
      '2D crafts integrate diverse textural elements into unified surface compositions.',
      'Warp threads run lengthwise; weft threads interlace crosswise.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: '1.11.1 Picture Making: Collage, Montage, Mosaic & Frieze',
    chapterTitle: 'Unit 1: 2D Crafts & Surface Techniques',
    content: `1.11.1 SUBTOPIC: PICTURE MAKING TECHNIQUES

1. COLLAGE EXECUTION METHOD:
• Material Sourcing: Collect magazine paper, fabric swatches (Chitenge scraps), sandpaper, burlap, natural tree bark, dried leaves, and eggshells.
• Support: Sturdy cardboard, hardboard, or heavy cartridge paper (250+ gsm).
• Adhesive: PVA white wood glue or cassava meal starch paste applied with a stiff flat brush.
• Process:
  1. Sketch a light pencil outline of the subject (e.g. a Zambian market vendor or wildlife).
  2. Tear or cut materials into desired shapes and tonal values.
  3. Lay down large background areas first before pasting foreground details.
  4. Press flat under heavy books to prevent paper curling while drying.

2. PHOTOMONTAGE & THEMATIC STORYTELLING:
• Used extensively in socio-political commentary, advertising, and editorial design.
• Combines juxtaposed photo fragments to create provocative metaphors (e.g. merging a green forest with modern smartphone circuitry to comment on technology and nature).

3. MOSAIC WITH LOCAL TESSERAE:
• Tesserae: Cut small, uniform 1cm × 1cm square pieces of colored ceramic tiles, broken glass, painted cardboard, or eggshells.
• Spacing: Leave a uniform 1mm to 2mm "grout line" between each piece.
• Contrast: Use contrasting grout colors to emphasize the mosaic silhouette.`,
    calloutBox: {
      title: 'Studio Safety with Mosaic Materials',
      type: 'warning',
      content: 'When cutting ceramic tiles or glass tesserae, students must wear protective eye goggles and handle tile nippers under strict teacher supervision.'
    },
    keyTakeaways: [
      'Layer collage from background to foreground to achieve spatial depth.',
      'Maintain consistent grout lines in mosaic compositions.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: '1.11.2 Weaving, Plaiting & Cardboard Loom Construction',
    chapterTitle: 'Unit 1: 2D Crafts & Surface Techniques',
    content: `1.11.2 SUBTOPIC: WEAVING, PLAITING AND KNOTTING

1. WEAVING LOOM FUNDAMENTALS:
A loom maintains tension on the warp threads so the weft can be woven through smoothly.

BUILDING A SIMPLE CARDBOARD NOTCH LOOM:
• Materials: Heavy cardboard sheet (20cm × 30cm), ruler, pencil, scissors, strong cotton twine for warp, wool/synthetic yarn for weft.
• Step 1: Draw lines 5mm apart along the top and bottom edges of the cardboard.
• Step 2: Cut 1cm deep notches along each marked line.
• Step 3: Wind the warp thread from top notch to bottom notch, maintaining firm, even tension without bending the cardboard.

2. THREE CORE WEAVING PATTERNS:
• Plain Weave (Tabby): The simplest and strongest weave where the weft passes over one warp thread and under the next (1-over-1-under).
• Twill Weave: The weft passes over two warp threads and under one (or over 2, under 2) in a staggered step, creating a distinct diagonal rib or chevron pattern.
• Basket Weave: Two or more weft threads are interlaced together over and under two or more warp threads, producing a checkered texture.

3. FINISHING & CASTING OFF:
• Carefully cut warp loops from the back of the cardboard.
• Tie adjacent pairs of warp threads in reef knots to prevent fraying.
• Trim fringe evenly to produce coasters, table runners, or wall tapestries.`,
    calloutBox: {
      title: 'Weaving Tension Tip',
      type: 'tip',
      content: 'Do not pull the weft thread too tight at the edges; leave a slight angle or arc ("bubble") when laying the weft to prevent the sides of the woven piece from pulling inward (hourglass effect).'
    },
    keyTakeaways: [
      'Cardboard notch looms provide accessible, low-cost weaving setups.',
      'Plain weave is 1-over-1-under; twill weave produces diagonal ribs.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: '1.12.1 Book Craft & Japanese Stab Binding Techniques',
    chapterTitle: 'Unit 2: 3D Crafts & Bookbinding',
    content: `1.12 TOPIC: CRAFTS IN 3D

1.12.1 SUBTOPIC: BOOK CRAFT AND BINDING SKILLS
Bookbinding is the craft of gathering, stitching, and encasing individual sheets of paper into a protective, durable cover.

ESSENTIAL TOOLS & MATERIALS:
• Awl: Pointed steel tool for punching sewing holes through paper signatures.
• Bone Folder: Smooth bone or plastic tool used for folding, creasing paper, and rubbing down pasted cloth.
• Linen Thread & Beeswax: Heavy-duty thread coated in beeswax to prevent tangling.
• Gray Board / Strawboard: Rigid 2mm board for book covers.
• Bookbinding Cloth (Buckram) & PVA Glue.

BOOKBINDING STYLES:

1. Saddle-Stitching (Pamphlet Stitch):
• Used for single-section booklets (5 to 15 pages).
• Sheets are folded in half (creating a folio/signature).
• Three holes are punched along the spine crease: Center, Top, and Bottom.
• Thread passes from inside-center -> outside-top -> inside-bottom -> outside-center and ties in a square knot around the center thread span.

2. Japanese Stab Binding (Yotsume Toji - 4-Hole Binding):
• Used for single loose leaves without spine folding.
• A stack of individual pages is clamped between two cover boards.
• Four equidistant holes are punched along the left margin (1.5cm from edge).
• Thread loops around the spine and through each hole in a decorative, exposed binding pattern.

3. Case Binding (Hardcover Books):
• Multiple folded signatures are sewn together with tape or ribbons.
• The spine is reinforced with cheesecloth (mull/crash) and glued to rigid cardboard case boards covered in decorative marbled paper or leather.`,
    calloutBox: {
      title: 'Practical Application in Schools',
      type: 'activity',
      content: 'Students bind their own 20-page A5 Art Sketchbook with decorative Chitenge fabric covers and hand-sewn saddle stitching.'
    },
    keyTakeaways: [
      'Saddle-stitching is ideal for folded booklets; stab binding secures loose sheets.',
      'Bone folders create crisp, fiber-aligned folds in paper.'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: '1.12.2 Papier-mâché: Armatures, Cassava Starch & Finishes',
    chapterTitle: 'Unit 2: 3D Crafts & Bookbinding',
    content: `1.12.2 SUBTOPIC: PAPIER-MÂCHÉ CRAFT
Papier-mâché (French for "chewed paper") is a malleable composite material consisting of paper pieces or pulp bound with an adhesive starch paste.

TWO METHODS OF PAPIER-MÂCHÉ:

1. Layered Paper (Strip) Method:
• Newspaper or brown kraft paper is torn (NEVER cut with scissors) into 2cm × 10cm strips. Tearing fibers creates feathered edges that blend seamlessly.
• Strips are dipped into adhesive paste, excess paste is wiped off between fingers, and applied in overlapping layers over an armature or mould.
• Apply at least 4 to 6 crisscrossing layers, allowing each layer to dry thoroughly.

2. Paper Mash (Pulp) Method:
• Shred newspaper or egg cartons into small 1cm squares.
• Soak in a bucket of boiling water for 24 hours.
• Boil and mash vigorously with a wooden pestle or electric blender until it forms a smooth slurry.
• Squeeze out excess water through a mesh cloth or mosquito netting.
• Knead with PVA wood glue, cassava starch paste, and a tablespoon of cooking oil/salt (preservative) to form a sculptable paper clay.

LOCAL RECIPE FOR CASSAVA MEAL STARCH GLUE:
• Mix 2 tablespoons of cassava meal (fine flour) with 100ml cold water to make a smooth paste.
• Pour into 300ml boiling water while stirring constantly over gentle heat for 3 minutes until translucent and viscous. Allow to cool.

ARMATURE CONSTRUCTION:
• The internal skeleton supporting hollow sculptures. Made from galvanized wire, rolled newspaper taped with masking tape, cardboard tubes, or inflated balloons.

FINISHING & SEALING:
• Sand surface with fine sandpaper (grade 180).
• Apply a primer coat of white emulsion paint or Gesso.
• Paint using acrylics, gouache, or oil paints.
• Apply clear polyurethane varnish to protect against moisture and insects.`,
    calloutBox: {
      title: 'Mold Prevention Tip',
      type: 'warning',
      content: 'Never apply new layers of papier-mâché over wet layers. In humid conditions, dry sculptures in direct sunlight or well-ventilated draft areas to prevent mold formation.'
    },
    keyTakeaways: [
      'Tearing paper strips produces feathered edges that smooth out seamlessly.',
      'Cassava meal starch provides an authentic, high-adhesion zero-cost local glue.'
    ]
  },
  {
    pageNumber: 6,
    pageTitle: '1.13 Sculpture in the Round, Relief & Maquettes',
    chapterTitle: 'Unit 3: 3D Sculpture & Carving',
    content: `1.13 TOPIC: SCULPTURE
Sculpture is the branch of visual arts that operates in three dimensions.

THREE FORMS OF SCULPTURE:

1. SCULPTURE IN THE ROUND (FREESTANDING):
• A fully 3D sculpture that is completely detached from any background plane.
• Designed to be walked around and viewed from all 360 degrees.
• The sculptor must balance weight, negative space, and visual rhythm from every perspective.
• Examples: Traditional Makishi masquerade figures, carved wildlife figurines, public bronze statues.

2. RELIEF SCULPTURE:
• Sculptural forms that project outward from a flat supporting background plane.
• Categorized by depth of projection:
  - Low Relief (Bas-relief): Shallow projection where figures extend less than 50% of their actual depth from the background (e.g. coins, commemorative wall plaques).
  - High Relief (Haut-relief): Bold projection where figures project more than 50% from the background, often casting deep, dramatic shadows.
  - Sunken Relief (Intaglio): The sculpture is carved below the surrounding flat surface plane.

3. THE MAQUETTE:
• A small, preliminary scale model or three-dimensional sketch made of clay, plasticine, wax, or wire.
• Purpose: Allows the sculptor to test proportions, weight distribution, and compositional balance before committing expensive hardwood, marble, or bronze casting.`,
    calloutBox: {
      title: 'Studio Assessment Criterion',
      type: 'tip',
      content: 'When evaluating a freestanding sculpture, inspect it from at least 4 distinct compass viewpoints (North, South, East, West) to ensure aesthetic cohesion.'
    },
    keyTakeaways: [
      'Freestanding sculptures can be viewed from 360 degrees; relief sculptures project from a wall.',
      'Maquettes are 3D prototypes used to test structural balance before final carving.'
    ]
  },
  {
    pageNumber: 7,
    pageTitle: '1.13.3 Subtractive Wood Carving & Grain Management',
    chapterTitle: 'Unit 3: 3D Sculpture & Carving',
    content: `1.13.3 SUBTOPIC: SUBTRACTIVE WOOD CARVING

SCULPTURAL PROCESSES:
• Additive Sculpture: Building up material (e.g. clay modelling, papier-mâché, metal welding).
• Subtractive Sculpture: Carving away unwanted material from a solid block until the desired form emerges.

SELECTING LOCAL ZAMBIAN TIMBER:
• Softwoods (Easy to carve for beginners): Jacaranda, Pine, Mukula bark, Baobab wood.
• Hardwoods (Dense, durable, fine grain for master carving): Mukwa (Pterocarpus angolensis), Rosewood, Teak (Baikiaea plurijuga), Mupapa.

WOOD CARVING TOOLS:
1. Straight Chisels: Flat cutting edge for planning flat surfaces and crisp edges.
2. Gouges (U-Gouges): Curved scoop blades for roughing out hollows and rounded forms.
3. V-Tools (Parting Tools): V-shaped cutting edge for incising sharp lines and decorative textures.
4. Wooden Mallet: High-density hardwood mallet to strike chisel handles. (NEVER use a steel claw hammer on wood chisel handles!).
5. Rasp & Riffler Files: Coarse steel files for shaping contours.

GRAIN DIRECTION SAFETY & RULES:
• Always observe the grain direction before making a cut.
• Carving WITH the grain produces smooth, controlled shavings.
• Carving AGAINST the grain causes wood fibers to split and tear unpredictably.
• For heavy material removal during initial roughing-out, carve ACROSS the grain.
• Always keep both hands behind the cutting edge of the chisel. Secure wood firmly in a workbench vise.`,
    calloutBox: {
      title: 'Workshop Safety Golden Rule',
      type: 'warning',
      content: 'Never hold the wood in one hand while pushing a sharp chisel toward that hand with the other! Secure the wood block with bench clamps or a vise.'
    },
    keyTakeaways: [
      'Subtractive carving removes material; additive sculpting builds up material.',
      'Always carve with the wood grain during finishing to prevent splitting.'
    ]
  },
  {
    pageNumber: 8,
    pageTitle: '1.14 Art Entrepreneurship, Pricing & Curating Exhibitions',
    chapterTitle: 'Unit 4: Art Entrepreneurship & Commerce',
    content: `1.14 TOPIC: ENTREPRENEURSHIP IN ART & CREATIVE COMMERCE
Under the CBC, art education equips learners with commercial viability, business acumen, and self-employment capabilities.

ART BUSINESS MODELS IN ZAMBIA:
• Custom Commission Services: Portrait painting, customized greeting cards, family murals, signage.
• Commercial Branding & Graphic Services: School badges, logo designs, marketing flyers, social media banners.
• Craft Production & Souvenir Retail: Handwoven basketry, carved wooden animals, beaded jewellery for tourist lodges and export markets.
• Fashion & Textile Embellishment: Screen-printed T-shirts, batik tie-dye chitenge dresses, fabric bags.

PRICING FORMULA FOR ARTWORKS:
A professional artist must never guess prices. Use the standard formula:
Total Selling Price = (Material Costs) + (Labor Hours × Hourly Rate) + (Overhead 15%) + (Profit Margin 20–30%)

Example Calculation:
• Materials (canvas, paint, brushes): K120
• Labor: 6 hours at K30/hr = K180
• Overhead (studio space, lighting): K45
• Subtotal = K345
• Profit Margin (25% of K345) = K86.25
• Final Retail Price = K431.25 (Rounded to K430 or K450).

ORGANIZING A SCHOOL ART EXHIBITION:
1. Curation: Selecting the strongest artworks representing diverse media.
2. Mounting & Framing: Mounting sketches on neutral black/gray backing cards.
3. Labeling: Every artwork must display an exhibition label:
   - Title of Artwork
   - Artist's Name & Grade/Class
   - Medium (e.g. Charcoal on cartridge paper)
   - Year of Production
   - Price / "Not For Sale" (NFS)
4. Lighting & Spatial Flow: Arrange pieces at standard eye-level (center at 150cm from floor) with uncluttered viewing corridors.`,
    calloutBox: {
      title: 'Entrepreneurship Practical Challenge',
      type: 'tip',
      content: 'Form a student cooperative enterprise. Produce a batch of 20 hand-bound fabric sketchbooks and market them to fellow students and teachers.'
    },
    keyTakeaways: [
      'Art pricing must scientifically account for materials, labor hours, overhead, and profit margin.',
      'Exhibition artworks must be mounted with professional title labels positioned at eye level.'
    ]
  },
  {
    pageNumber: 9,
    pageTitle: 'Appendix A: Kombekombe Secondary School Model Lesson Plan',
    chapterTitle: 'Appendix: Official CDC Lesson Plan Models',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
CURRICULUM DEVELOPMENT CENTRE (CDC) VERIFIED LESSON PLAN MODEL

SCHOOL: Kombekombe Secondary School
DEPARTMENT: Performing & Creative Arts Department
TEACHER: Mr. Mbeketi Mabula
CLASS: Form 1 C | DATE: Term 3 Week 4 | DURATION: 80 Minutes
TOPIC: 1.9 Drawing and Painting from Still Life
SUBTOPIC: 1.9.1 Still Life Composition & Observational Tonal Modeling

SPECIFIC COMPETENCES:
By the end of the lesson, learners should be able to:
1. Arrange a balanced still life group featuring a ceramic cup, a fruit, and a drapery fold.
2. Accurately sketch elliptical perspective rims of cylindrical objects.
3. Apply 3-zone tonal shading (highlight, mid-tone, cast shadow) based on a single directional light source.

TEACHING & LEARNING RESOURCES:
• Table setup with white cloth, ceramic cup, fresh orange, and desk spotlight lamp.
• 2B and 4B graphite pencils, vinyl erasers, A4 drawing paper, pencil sharpeners.

LESSON PROGRESSION:
1. INTRODUCTION (10 Minutes):
• Review of geometric shapes and the 7 elements of art.
• Teacher demonstration of drawing an ellipse at eye level, below eye level, and above eye level.

2. DEVELOPMENT / LESSON BODY (55 Minutes):
• Stage 1 (15 min): Learners sketch light guideline construction lines establishing height-to-width ratios.
• Stage 2 (20 min): Identifying the primary light source; mapping out core shadows and cast shadows on the table.
• Stage 3 (20 min): Applying cross-hatching and smooth blending with blending stumps. Teacher circulates providing individual corrective guidance.

3. CONCLUSION & PLENARY (15 Minutes):
• Gallery Walk: Students place drawings on desks and circulate silently with sticky notes writing 1 constructive critique.
• Teacher summarizes common strengths and assigns homework: Practice shading an egg under bedside lamp.`,
    calloutBox: {
      title: 'CDC Teacher Quality Metric',
      type: 'tip',
      content: 'A quality CBC lesson plan incorporates learner-centered activities, active demonstration, and structured peer assessment rubrics.'
    },
    keyTakeaways: [
      'Cylindrical still life objects require mastery of ellipses and tonal light modeling.',
      'Peer critique gallery walks reinforce visual literacy and constructive communication.'
    ]
  }
];

export const PES_F1_T3_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Term 3 Overview & Topic 1.9 Athletics Track Events',
    chapterTitle: 'Unit 1: Athletics & Track Mechanics',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT
THE CURRICULUM DEVELOPMENT CENTRE (CDC), LUSAKA (2025)

PHYSICAL EDUCATION AND SPORT TEACHING MODULE — FORM 1 TERM 3
(Ordinary Secondary Level — Competence-Based Curriculum Framework)

TOPIC 1.9: SPORTS SKILLS DEVELOPMENT

1.9.1 ATHLETICS (TRACK EVENTS):
Athletics is the foundation of all sporting movement, developing raw speed, explosive power, and spatial pacing.

STANDARD 400M TRACK GEOMETRY:
• An official track consists of two parallel straights (84.39m each) connected by two semi-circular bends (radius 36.50m).
• 8 staggered lanes, each 1.22m wide.
• Sprint races (100m, 200m, 400m) are run entirely within assigned lanes from start to finish.

SPRINT START MECHANICS (CROUCH START):
"On Your Marks":
• Front foot placed 1 to 1.5 foot lengths behind start line; rear knee resting on track.
• Hands placed just behind line, shoulder-width apart, thumb and index fingers forming a high bridge ('V' shape).

"Set":
• Hips rise smoothly above shoulder level.
• Weight shifts forward onto hands; center of gravity shifts slightly ahead of base of support.
• Head in neutral alignment with spine, eyes focused 1 meter down the track.

"Gun Fire / Clap":
• Explosive drive off both starting blocks; arms pump vigorously in opposition to legs.
• Drive phase maintained with a 45-degree forward lean for the first 15 to 20 meters before transitioning to upright sprinting posture.

RELAY RACES (4×100M & 4×400M):
• The 20m Baton Exchange Zone: The baton MUST be passed strictly within the marked 20-meter changeover box. Passing outside results in immediate team disqualification.
• Non-Visual Baton Exchange (Sprint Relays): The incoming runner shouts a verbal signal ("Hand!" or "Hop!"), and the outgoing runner extends an open hand backward without turning their head.`,
    calloutBox: {
      title: 'Relay Rule Reminder',
      type: 'warning',
      content: 'If the baton drops during a pass, the runner who dropped it must retrieve it without interfering with runners in other lanes.'
    },
    keyTakeaways: [
      'Crouch start consists of three phases: "On your marks", "Set", and explosive drive.',
      'In 4x100m relays, the baton pass must occur entirely within the 20-meter exchange zone.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: '1.9.2 Ball Games: Football & Netball Pitch Specifications & Drills',
    chapterTitle: 'Unit 2: Competitive Ball Games',
    content: `1.9.2 SUBTOPIC: BALL GAMES (FOOTBALL & NETBALL)

A. FOOTBALL (SOCCER) REGULATION DIMENSIONS & DRILLS:
• Pitch Dimensions (FIFA & FAZ Standard):
  - Length (Touchline): 90m to 120m (International: 100m–110m).
  - Width (Goal Line): 45m to 90m (International: 64m–75m).
  - Center Circle: Radius of 9.15m (10 yards).
  - Penalty Area (18-yard box): Extends 16.5m from each goal post and 16.5m onto the pitch; Penalty Spot located at 11m (12 yards) from goal line.
  - Goalposts: Width 7.32m (8 yards) by Height 2.44m (8 feet).

• Fundamental Drills:
  1. Push Pass (Inside of the Foot): Supporting foot placed 15cm beside the ball pointing at target; striking foot rotated 90 degrees outward; strike ball dead-center with firm ankle.
  2. Instep Drive (Shooting): Supporting foot planted beside ball; toes of striking foot pointing down; strike ball with laces for maximum velocity.
  3. Slalom Cone Dribbling: Rapid alternating touches with inside and outside of both feet.

B. NETBALL COURT DIMENSIONS & PASSING MECHANICS:
• Court Dimensions: 30.5m long by 15.25m wide, divided into three equal "Thirds" (Goal Third, Center Third, Goal Third).
• Goal Circle: Semi-circle with radius of 4.9m.
• Center Circle: Diameter of 90cm.
• Ring Height: 3.05m (10 feet); ring diameter 380mm.

• Passing & Footwork Rules:
  - Footwork Rule: A player cannot run with the ball. The landed foot must remain anchored (pivot allowed) until the ball is released within 3 seconds.
  - Contact Rule: A player cannot push, bump, or hold an opponent.
  - Obstruction: Defending players must stand at least 0.9m (3 feet) away from the player with the ball before extending arms to defend.`,
    calloutBox: {
      title: 'Netball Shooting Technique',
      type: 'tip',
      content: 'Hold the ball high above the head on the fingertips of the dominant shooting hand, non-dominant hand lightly supporting the side. Dip knees and push through legs, releasing with a high arc and wrist snap (swan neck follow-through).'
    },
    keyTakeaways: [
      'Football pitches require 9.15m center circles and 11m penalty spots.',
      'Netball enforces the 3-second rule, 0.9m defending distance, and strict landing footwork.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: '1.9.3 Board Games: Chess Rules, Special Moves & Notation',
    chapterTitle: 'Unit 3: Board & Racquet Games',
    content: `1.9.3 SUBTOPIC: BOARD GAMES (CHESS & DRAUGHTS)

CHESS FUNDAMENTALS:
Chess is a game of strategic mastery played on an 8×8 grid of 64 alternating light and dark squares.
• Setup: "White on right" (bottom-right corner square must be white); "Queen on her own color" (White Queen on d1 white square, Black Queen on d8 dark square).

PIECE MOVEMENTS & VALUES:
1. King (♔ - Priceless): Moves 1 square in any direction. The game objective is to checkmate the opponent's king.
2. Queen (♕ - 9 Points): Moves any distance along ranks (horizontal), files (vertical), or diagonals.
3. Rook (♖ - 5 Points): Moves any distance along straight vertical and horizontal lines.
4. Bishop (♗ - 3 Points): Moves any distance along diagonals on its starting color.
5. Knight (♘ - 3 Points): Moves in an 'L' shape (2 squares in one direction, then 1 square at 90 degrees). Only piece capable of jumping over other pieces.
6. Pawn (♙ - 1 Point): Moves 1 square forward (optionally 2 squares on its first move). Captures 1 square diagonally forward.

SPECIAL CHESS RULES:
• Castling: A simultaneous defensive move between King and Rook.
  - King moves 2 squares toward Rook; Rook jumps over King to adjacent square.
  - Conditions: Neither King nor Rook has moved; no pieces between them; King is NOT in check, does NOT pass through check, and does NOT land in check.
• En Passant (In Passing): If a pawn advances 2 squares past an opponent's adjacent pawn, the opponent may capture it diagonally as if it had advanced only 1 square (must be played on the immediate next turn).
• Pawn Promotion: When a pawn reaches the 8th rank, it can be promoted to any piece (usually Queen).

ALGEBRAIC NOTATION:
Squares are identified by column letter (a-h) and row number (1-8). E.g., 1. e4 e5, 2. Nf3 Nc6, 3. Bb5 (Ruy Lopez opening). O-O = Kingside castle, O-O-O = Queenside castle, + = Check, # = Checkmate.`,
    calloutBox: {
      title: 'Cognitive Strategy Value',
      type: 'tip',
      content: 'Chess improves working memory, calculation speed, impulse control, and forward spatial planning.'
    },
    keyTakeaways: [
      'Castling secures the king and connects rooks.',
      'En passant captures pawns that leap 2 squares forward adjacent to your pawn.',
      'Standard algebraic notation records every move with column letters and row numbers.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: 'Topic 1.10 Anatomy & Physiology: Human Skeletal System',
    chapterTitle: 'Unit 4: Anatomy & Biomechanics',
    content: `TOPIC 1.10: ANATOMY AND PHYSIOLOGY (HUMAN SKELETAL SYSTEM)
The human skeletal system provides structural framework, organ protection, mineral storage (calcium and phosphorus), blood cell production (hematopoiesis in bone marrow), and acts as a system of levers for muscle contraction.

THE 206 BONES OF THE ADULT SKELETON:
Divided into two primary anatomical divisions:

1. AXIAL SKELETON (80 Bones — Along Central Axis):
• Cranium & Facial Bones (22): Frontal, Parietal, Temporal, Occipital, Mandible (jaw).
• Vertebral Column (33 vertebrae in infants / 26 in adult fused structure):
  - 7 Cervical vertebrae (Neck - C1 Atlas, C2 Axis).
  - 12 Thoracic vertebrae (Upper back - articulates with ribs).
  - 5 Lumbar vertebrae (Lower back - heavy load-bearing).
  - 1 Sacrum (5 fused vertebrae).
  - 1 Coccyx (4 fused tailbone vertebrae).
• Thoracic Ribcage:
  - 12 pairs of ribs (7 True ribs attached directly to sternum, 3 False ribs attached to cartilage, 2 Floating ribs).
  - Sternum (Breastbone).

2. APPENDICULAR SKELETON (126 Bones — Limbs & Girdles):
• Pectoral (Shoulder) Girdle: Clavicle (collarbone) and Scapula (shoulder blade).
• Upper Limbs: Humerus (arm), Radius (thumb-side forearm), Ulna (pinky-side forearm), 8 Carpals (wrist), 5 Metacarpals (palm), 14 Phalanges (fingers).
• Pelvic (Hip) Girdle: Ilium, Ischium, Pubis fused into pelvis.
• Lower Limbs: Femur (thigh — longest, strongest bone), Patella (kneecap), Tibia (shinbone — weight-bearing), Fibula (lateral stabilizer), 7 Tarsals (ankle), 5 Metatarsals (foot sole), 14 Phalanges (toes).`,
    calloutBox: {
      title: 'Mnemonic for Vertebral Column',
      type: 'tip',
      content: 'Remember the meal times: "Crunchy Toast Lunch" -> Cervical (7 at 7am), Thoracic (12 at 12 noon), Lumbar (5 at 5pm).'
    },
    keyTakeaways: [
      'The adult skeleton consists of 206 bones: 80 axial and 126 appendicular.',
      'The femur is the longest, strongest bone; the tibia is the main shin weight-bearer.'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: 'Classification of Skeletal Joints & Movement Mechanics',
    chapterTitle: 'Unit 4: Anatomy & Biomechanics',
    content: `CLASSIFICATION OF SKELETAL JOINTS
A joint (articulation) is the junction where two or more bones meet.

THREE STRUCTURAL CLASSES OF JOINTS:

1. FIBROUS (IMMOVEABLE / SYNARTHRODIAL) JOINTS:
• Bones held tightly together by dense fibrous connective tissue with zero movement.
• Examples: Cranial sutures of the skull; pelvic bone fusions.

2. CARTILAGINOUS (SLIGHTLY MOVEABLE / AMPHIARTHRODIAL) JOINTS:
• Bones connected by fibrocartilage pads; permits limited shock-absorbing movement.
• Examples: Intervertebral discs between spine vertebrae; Pubic symphysis; Rib-to-sternum junction.

3. SYNOVIAL (FREELY MOVEABLE / DIARTHRODIAL) JOINTS:
• Features a joint cavity filled with lubricating synovial fluid enclosed in a fibrous capsule and lined with articular cartilage.

SIX TYPES OF SYNOVIAL JOINTS:
a. Ball and Socket Joint:
• Highest range of motion in all planes (Flexion, Extension, Abduction, Adduction, Rotation, Circumduction).
• Examples: Hip joint (Femur into Acetabulum); Shoulder joint (Humerus into Glenoid cavity).

b. Hinge Joint:
• Uniaxial movement in one plane like a door hinge (Flexion and Extension).
• Examples: Knee joint; Elbow joint; Interphalangeal finger joints.

c. Pivot Joint:
• Rotational movement around a central axis.
• Examples: Atlas-Axis (C1-C2) joint in neck (turning head "no"); Proximal Radioulnar joint.

d. Saddle Joint:
• Biaxial movement (side-to-side and back-and-forth).
• Example: Thumb carpometacarpal joint (enables opposable thumb grip).

e. Gliding (Plane) Joint:
• Flat bone surfaces slide past one another.
• Examples: Carpals in wrist; Tarsals in ankle.

f. Condyloid (Ellipsoid) Joint:
• Biaxial movement without full rotation.
• Examples: Radiocarpal wrist joint; Metacarpophalangeal knuckles.`,
    calloutBox: {
      title: 'Joint Movement Glossary',
      type: 'formula',
      content: '• Flexion = Decreasing joint angle | • Extension = Increasing joint angle | • Abduction = Moving away from midline | • Adduction = Moving toward midline'
    },
    keyTakeaways: [
      'Synovial joints are freely moveable and cushioned with synovial fluid.',
      'Ball & socket allows 360 rotation; hinge joints permit flexion and extension.'
    ]
  },
  {
    pageNumber: 6,
    pageTitle: 'Topic 1.11 Sports Biomechanics: Force, Acceleration & Velocity',
    chapterTitle: 'Unit 4: Anatomy & Biomechanics',
    content: `TOPIC 1.11: SPORTS BIOMECHANICS
Biomechanics is the study of mechanical laws relating to the movement or structure of living organisms in sports.

NEWTON'S LAWS OF MOTION IN SPORT:

1. FIRST LAW (LAW OF INERTIA):
An object will remain at rest or in uniform motion in a straight line unless acted upon by an external net force.
• Sport Example: A soccer ball sits motionless on the penalty spot until a player's foot applies an external muscular force.

2. SECOND LAW (LAW OF ACCELERATION):
The acceleration of an object is directly proportional to the net force applied to it and inversely proportional to its mass.
• Formula: Force = Mass × Acceleration (F = m × a)
• Unit of Force: Newtons (N).

WORKED BIOMECHANICAL CALCULATION 1:
A netball player passes a 0.45 kg netball, accelerating it at 25 m/s². Calculate the force applied by the player's arms.
• Given: Mass m = 0.45 kg, Acceleration a = 25 m/s².
• Formula: F = m × a
• Calculation: F = 0.45 kg × 25 m/s² = 11.25 N.

3. THIRD LAW (ACTION AND REACTION):
For every action, there is an equal and opposite reaction force.
• Sport Example: When a sprinter's spikes push backward and downward against the starting blocks (Action), the starting blocks push forward and upward on the sprinter (Reaction), propelling them down the track.

SPEED AND VELOCITY IN SPRINTING:
• Speed = Distance ÷ Time (S = d / t)
• Velocity = Displacement ÷ Time (with direction).

WORKED CALCULATION 2 (30M SPRINT TEST):
A Form 1 student completes a 30m sprint test in 4.8 seconds. Calculate the average running speed.
• Speed = 30m / 4.8s = 6.25 m/s.`,
    calloutBox: {
      title: 'Biomechanics Formula Box',
      type: 'formula',
      content: '• Force = Mass × Acceleration (F = ma) | • Weight = Mass × gravity (W = mg, g ≈ 9.8 m/s²) | • Speed = Distance / Time (S = d/t)'
    },
    keyTakeaways: [
      'Force equals mass times acceleration (F = ma).',
      'Newton’s 3rd law explains how starting blocks propel sprinters forward.'
    ]
  }
];

export const PES_F2_T12_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    pageTitle: 'Topic 2.1 History of PE: Ancient Athens vs Sparta',
    chapterTitle: 'Unit 1: History of PE & Olympic Movement',
    content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
DIRECTORATE OF CURRICULUM DEVELOPMENT
THE CURRICULUM DEVELOPMENT CENTRE (CDC), LUSAKA (2026)

PHYSICAL EDUCATION AND SPORT TEACHING MODULE — FORM 2 (TERMS 1 & 2)
(Ordinary Secondary Level — Competence-Based Curriculum Framework)

VISION & PREFACE
Permanent Secretary - Educational Services: Dr. Kelvin Mambwe
Director - Curriculum Development: Dr. Charles Ndakala
Authors: Gwen Chewe (Kasama College), Wisha Hamuyamba (Munali Boys), James Kapansa (Malcolm Moffat).

TOPIC 2.1: HISTORY OF PHYSICAL EDUCATION AND SPORT

2.1.1 ANCIENT GREECE: THE BIRTHPLACE OF SYSTEMATIC PHYSICAL EDUCATION
Physical education as an organized discipline originated in Ancient Greece around the 8th Century BC, grounded in two philosophical ideals:
1. "Mens sana in corpore sano" — A sound mind in a sound body.
2. "Arete" — The pursuit of moral, physical, and intellectual excellence.

COMPARISON OF ATHENIAN AND SPARTAN MODELS:

A. THE ATHENIAN MODEL (HOLISTIC DEVELOPMENT):
• Philosophy: Believed that physical fitness and intellectual culture must be balanced equally.
• Education System: Athenian boys attended the "Palaestra" (wrestling and gymnastic school) for running, jumping, wrestling, and discus, alongside the "Didaskaleion" for music, rhetoric, mathematics, and philosophy.
• Goal: To produce well-rounded, democratic citizens with graceful physical posture and refined minds.

B. THE SPARTAN MODEL (MILITARY ENDURANCE):
• Philosophy: State survival through absolute military dominance.
• Education System (The Agoge): At age 7, Spartan boys were removed from families into communal military barracks. Training focused on brutal physical conditioning, survival in wilderness, pain tolerance, swimming in cold rivers, and hand-to-hand combat.
• Female Physical Education: Spartan girls underwent rigorous athletic training (running, javelin, gymnastics) so they would give birth to robust, warrior offspring.
• Goal: To build an invincible, obedient fighting force.

MODERN RELEVANCE IN ZAMBIA:
Modern Zambian physical education blends the Athenian holistic approach (school sports fostering academic balance) with structured fitness discipline found in defense forces and police sports programs.`,
    calloutBox: {
      title: 'Historical Debate Question',
      type: 'activity',
      content: 'In class debate groups: "Which system better prepares a youth for national development — the balanced Athenian model or the disciplined Spartan model?"'
    },
    keyTakeaways: [
      'Athens championed balanced mind-body development; Sparta prioritized military survival and physical toughness.',
      'Greek philosophical ideals of Arete and Mens Sana in Corpore Sano remain central to modern PES.'
    ]
  },
  {
    pageNumber: 2,
    pageTitle: 'Topic 2.1.2 Origins & Universal Symbols of the Olympic Games',
    chapterTitle: 'Unit 1: History of PE & Olympic Movement',
    content: `2.1.2 THE OLYMPIC GAMES (776 BC TO PRESENT)

ORIGIN OF ANCIENT OLYMPIC GAMES:
• First recorded in 776 BC in Olympia, Ancient Greece, held in honour of Zeus, king of the gods.
• Held every four years — a 4-year cycle known as an "Olympiad".
• The Olympic Truce (Ekecheiria): All wars and legal disputes between Greek city-states were suspended to guarantee safe passage for athletes and spectators traveling to Olympia.
• Events in Ancient Games: Stadion (192m sprint), Diaulos (384m race), Dolichos (long-distance race), Pentathlon (running, long jump, javelin, discus, wrestling), Pankration (all-out combat sport), and Chariot racing.
• The Olive Wreath (Kotinos): The only official prize was a crown of wild olive leaves, though victorious athletes received heroic status, free meals for life, and tax exemptions in their home cities.

THE MODERN OLYMPIC REVIVAL:
• Revived in 1896 in Athens, Greece by French educator Baron Pierre de Coubertin.
• The Olympic Creed: "The most important thing in the Olympic Games is not to win but to take part, just as the most important thing in life is not the triumph but the struggle."

UNIVERSAL OLYMPIC SYMBOLS:
1. The 5 Interlinked Rings:
• Designed by Pierre de Coubertin in 1913.
• The five rings represent the five inhabited continents of the world united by Olympism (Blue = Europe, Yellow = Asia, Black = Africa, Green = Oceania, Red = Americas).
• At least one of the six colors (including the white background) appears in every national flag on Earth.

2. The Olympic Motto:
• "Citius, Altius, Fortius — Communiter" (Latin for "Faster, Higher, Stronger — Together").

3. The Olympic Flame & Torch Relay:
• Lit in Olympia, Greece using a parabolic mirror focusing natural sunlight, then carried across the globe in an international torch relay to ignite the cauldron at the opening ceremony.`,
    calloutBox: {
      title: 'Zambia Olympic Heritage Milestone',
      type: 'tip',
      content: 'Zambia first competed as an independent nation at the 1964 Tokyo Olympics (marching under the new Zambian flag at the closing ceremony on independence night, October 24, 1964). Samuel Matete won Zambia’s historic Olympic Silver Medal in the 400m hurdles at the 1996 Atlanta Games.'
    },
    keyTakeaways: [
      'The ancient games began in 776 BC; revived in 1896 in Athens.',
      'The 5 rings symbolize the union of the 5 continents and meeting of athletes worldwide.'
    ]
  },
  {
    pageNumber: 3,
    pageTitle: 'Topic 2.2 Sports First Aid, Injuries & The R.I.C.E. Protocol',
    chapterTitle: 'Unit 2: Sports Health, First Aid & Safety',
    content: `TOPIC 2.2: PHYSICAL EDUCATION AND HEALTH

2.2.1 FIRST AID, SPORTS INJURIES & EMERGENCY MANAGEMENT
First Aid is the immediate, temporary assistance given to an injured or ill athlete before professional medical help arrives.

CLASSIFICATION OF SPORTS INJURIES:
1. Acute Injuries: Occur suddenly due to a traumatic impact or sudden twist (e.g. sprained ankle, bone fracture, dislocated shoulder, hamstring tear).
2. Chronic (Overuse) Injuries: Develop gradually over time due to repetitive stress and inadequate rest (e.g. shin splints, tendonitis, runner’s knee).

COMMON SOFT TISSUE INJURIES:
• Sprain: Tearing or stretching of LIGAMENTS (fibrous tissue connecting bone to bone).
• Strain: Tearing or stretching of MUSCLES or TENDONS (tissue connecting muscle to bone).
• Contusion (Bruise): Internal bleeding caused by blunt impact without breaking the skin.

THE R.I.C.E. PROTOCOL FOR ACUTE SOFT TISSUE INJURIES:
Apply immediately within the first 24 to 48 hours to minimize internal swelling and speed recovery:

1. REST (R):
• Immediately stop all activity. Immobilize the injured limb to prevent further tissue damage.

2. ICE (I):
• Apply crushed ice wrapped in a damp towel (NEVER apply bare ice directly onto skin) for 15 to 20 minutes every 2 to 3 hours.
• Reduces blood flow (vasoconstriction), controls internal swelling, and numbs pain receptors.

3. COMPRESSION (C):
• Wrap the injured area firmly with an elastic crepe bandage, starting distal (furthest from heart) and wrapping proximal.
• Bandage should be snug to limit fluid accumulation, but NOT so tight as to cut off circulation (check for tingling or pale nails).

4. ELEVATION (E):
• Prop the injured limb up on pillows above the level of the heart to facilitate venous fluid drainage away from the injury site.

THE "NO H.A.R.M." RULE FOR FIRST 48 HOURS:
Avoid: Heat (hot baths), Alcohol, Running/Exercise, Massage (these all increase swelling!).`,
    calloutBox: {
      title: 'First Aid Treatment Table',
      type: 'formula',
      content: '• R = Rest | • I = Ice (15-20 min) | • C = Compression (Elastic wrap) | • E = Elevation (Above heart level) | • Avoid H.A.R.M.'
    },
    keyTakeaways: [
      'Sprains affect ligaments; strains affect muscles or tendons.',
      'The R.I.C.E. protocol must be applied within minutes to control inflammation and pain.'
    ]
  },
  {
    pageNumber: 4,
    pageTitle: 'Topic 2.3 The 6 Skill-Related Components of Fitness',
    chapterTitle: 'Unit 3: Skill Fitness Assessment & Training',
    content: `TOPIC 2.3: SKILL-RELATED COMPONENTS OF FITNESS
While health-related fitness maintains general physiological health, skill-related components enable athletes to execute complex motor tasks efficiently in competitive sports.

THE SIX SKILL-RELATED COMPONENTS:

1. AGILITY:
• The ability to rapidly change the direction and position of the entire body under control at high speed.
• Test: Illinois Agility Run Test (weaving through cones on a 10m × 5m course).
• Sports: Football winger evading a tackle, netball defender tracking a shooter, badminton court movement.

2. BALANCE:
• The ability to maintain the body's center of mass over its base of support, whether stationary (static) or moving (dynamic).
• Test: Stork Stand Test (standing on ball of one foot with other foot against knee, eyes closed).
• Sports: Gymnastic balance beam, skateboarding, landing after a volleyball spike.

3. COORDINATION:
• The ability to integrate multiple sensory inputs (visual, auditory, kinesthetic) with motor systems to produce smooth, accurate movements.
• Test: Alternate Hand Wall Toss Test (tossing tennis ball against wall from 2m away catching with alternate hands for 30s).
• Sports: Racquet tennis strokes, cricket batting, soccer juggling.

4. POWER:
• The ability to exert maximum muscular force in the shortest possible time (Power = Force × Velocity).
• Test: Standing Long Jump (Broad Jump) or Vertical Jump Test (Sargent Jump).
• Sports: High jump takeoff, sprinting start, boxing punch, basketball dunk.

5. REACTION TIME:
• The time elapsed between the presentation of a sensory stimulus and the initiation of the physical motor response.
• Test: Ruler Drop Test (catching a dropped 30cm ruler between thumb and index finger).
• Sports: Sprint start gun response, goalkeeper diving for a penalty kick.

6. SPEED:
• The ability to perform a movement or cover a distance in the shortest possible time.
• Test: 30-Meter Flying Sprint Test.
• Sports: 100m sprint, football counter-attack sprint.`,
    calloutBox: {
      title: 'Testing Battery Reference',
      type: 'tip',
      content: 'In Form 2, each student completes a full Skill-Related Fitness Profile recording test scores across all 6 parameters in their PE journal.'
    },
    keyTakeaways: [
      'The 6 components are Agility, Balance, Coordination, Power, Reaction Time, and Speed.',
      'Power combines strength and speed (Power = Force × Velocity).'
    ]
  },
  {
    pageNumber: 5,
    pageTitle: 'Topic 2.4 Complex Gymnastics: The 6 Phases of the Squat Vault',
    chapterTitle: 'Unit 4: Gymnastics on Apparatus',
    content: `TOPIC 2.4: GYMNASTICS (VAULTING ON APPARATUS)
Vaulting on gymnastic apparatus (vaulting box / buck) requires high-speed approach, explosive takeoff, and spatial body control.

THE SIX BIOMECHANICAL PHASES OF THE SQUAT VAULT:

1. THE RUN-UP:
• Smooth, progressive acceleration over 15 to 20 meters, reaching peak controlled velocity 2 strides before the springboard.

2. HURDLE STEP & TAKE-OFF:
• The gymnast performs a low, forward hurdle jump onto the springboard.
• Punch both feet simultaneously onto the sweet spot of the springboard with ankles locked and arms swinging upward.

3. PRE-FLIGHT (FIRST FLIGHT PHASE):
• Body rises into the air toward the vaulting box at an angle of approximately 45 degrees with arms fully extended forward.

4. THE BLOCK (HAND PLACEMENT):
• Both hands strike the top of the vaulting box shoulder-width apart.
• Violent, instantaneous push ("shoulder block") off the box while tucking knees tightly to the chest (squat position) to pass between or over the hands.

5. POST-FLIGHT (SECOND FLIGHT PHASE):
• As hands push off, the body extends forward and upward, opening up from the tucked squat into an upright landing posture.

6. THE LANDING:
• Land on both feet simultaneously with feet shoulder-width apart, knees flexing to 90 degrees to absorb ground impact forces.
• Arms extended diagonally upward in a 'V' shape for balance; hold position steady for 2 seconds without taking recovery steps.

SAFETY & SPOTTING ON THE VAULT:
• Two spotters stand on either side of the landing zone.
• Spotters place their hands on the performer's upper arm and waist to assist forward trajectory and prevent backward falls.`,
    calloutBox: {
      title: 'Apparatus Safety Check',
      type: 'warning',
      content: 'Inspect the vaulting box lock pins and verify that the springboard non-slip rubber surface is clean and securely anchored before every jump.'
    },
    keyTakeaways: [
      'The 6 vault phases are Run-up, Take-off, Pre-flight, Block, Post-flight, and Landing.',
      'A powerful shoulder block off the apparatus creates high post-flight lift for a safe landing.'
    ]
  },
  {
    pageNumber: 6,
    pageTitle: 'Topic 2.6 Zambian Sports Administrative Pyramid & Governance',
    chapterTitle: 'Unit 5: Sports Management & Administration',
    content: `TOPIC 2.6: ORGANISATION AND MANAGEMENT OF GAMES AND SPORTS

THE NATIONAL SPORTS ADMINISTRATIVE STRUCTURE IN ZAMBIA:
Zambia's sporting ecosystem is governed through a multi-tier statutory administrative hierarchy:

1. MINISTRY OF YOUTH, SPORT AND ARTS (MYSA):
• The apex Government ministry responsible for formulating national sports policies, funding infrastructure, and approving international delegations.

2. NATIONAL SPORTS COUNCIL OF ZAMBIA (NSCZ):
• The statutory governing body established under Act No. 88 of the Laws of Zambia.
• Mandate: Registers, coordinates, regulates, and funds all National Sports Federations (Associations) in the country.

3. NATIONAL OLYMPIC COMMITTEE OF ZAMBIA (NOCZ):
• Affiliated with the International Olympic Committee (IOC).
• Responsible for preparing and sending Team Zambia to the Olympic Games, Commonwealth Games, and All Africa Games.

4. NATIONAL SPORTS FEDERATIONS (ASSOCIATIONS):
• Dedicated governing bodies for specific sports disciplines:
  - Football Association of Zambia (FAZ) — affiliated with FIFA / CAF.
  - Zambia Athletics (ZA) — affiliated with World Athletics.
  - Netball Association of Zambia (NAZ).
  - Zambia Volleyball Association (ZAVA).
  - Chess Federation of Zambia (CFZ).

5. PROVINCIAL & DISTRICT SPORTS COMMITTEES:
• Coordinates regional leagues, grassroots talent scouting, and district school championships.

6. CLUBS, SCHOOLS & COMMUNITY ACADEMIES:
• The foundational base of the pyramid where athletes are discovered, coached, and developed.`,
    calloutBox: {
      title: 'Administrative Pyramid Hierarchy',
      type: 'tip',
      content: 'Apex: MYSA -> Statutory Regulator: NSCZ -> Olympic Body: NOCZ -> Federations: FAZ/ZA/NAZ -> Grassroots: Schools & Clubs.'
    },
    keyTakeaways: [
      'The Ministry of Youth, Sport & Arts sets policy; NSCZ is the statutory regulator of all sports associations.',
      'Grassroots school sport forms the foundational talent pipeline for national federations.'
    ]
  }
];

import { 
  SENIOR_STEM_COMPENDIUM_PAGES, 
  ECZ_EXAM_TREASURY_PAGES, 
  ZAMBIA_HERITAGE_ALMANAC_PAGES 
} from './massiveLibraryPages';

// Combine all registered pages
export const LIBRARY_PAGES_REGISTRY: Record<string, DocumentPage[]> = {
  'cdc-mod-art-f1-t1': CDC_ART_F1_T1_PAGES,
  'cdc-mod-art-f1-t3': CDC_ART_F1_T3_PAGES,
  'cdc-mod-pes-f1-t2': PES_F1_T2_PAGES,
  'cdc-mod-pes-f1-t3': PES_F1_T3_PAGES,
  'cdc-mod-pes-f2-t12': PES_F2_T12_PAGES,
  'mod-f1-math-01': MATH_F1_PAGES,
  'pp-g12-math-2025': ECZ_G12_MATH_EXAM_PAGES,
  'compendium-senior-stem-mega': SENIOR_STEM_COMPENDIUM_PAGES,
  'compendium-ecz-10yr-treasury': ECZ_EXAM_TREASURY_PAGES,
  'compendium-zambia-heritage-civics': ZAMBIA_HERITAGE_ALMANAC_PAGES
};

// Helper function to resolve or dynamically create rich multi-page breakdowns for any library item
export function getDocumentPages(item: {
  id: string;
  title: string;
  subject: string;
  level: string;
  code: string;
  pages?: string;
  tableOfContents?: string[];
  learningOutcomes?: string[];
  sampleContent?: string;
  pagesList?: DocumentPage[];
}): DocumentPage[] {
  // If item has pre-loaded or dynamically generated pagesList
  if (item.pagesList && item.pagesList.length > 0) {
    return item.pagesList;
  }

  // Check if item is from the 5,000+ curriculum compendium collection
  const compSpec = CURRICULUM_5000_COMPENDIUMS.find(s => s.id === item.id);
  if (compSpec) {
    return generateCompendiumPages(compSpec);
  }

  // Check if item has a custom registered rich page set
  if (LIBRARY_PAGES_REGISTRY[item.id]) {
    return LIBRARY_PAGES_REGISTRY[item.id];
  }

  // If item has sampleContent with section dividers, split it into pages
  if (item.sampleContent && item.sampleContent.includes('======================================================================')) {
    const rawSections = item.sampleContent
      .split('======================================================================')
      .map(s => s.trim())
      .filter(s => s.length > 30);

    if (rawSections.length >= 2) {
      return rawSections.map((sec, idx) => {
        const lines = sec.split('\n');
        const header = lines[0]?.trim() || `Section ${idx + 1}`;
        const body = lines.slice(1).join('\n').trim();
        return {
          pageNumber: idx + 1,
          pageTitle: header.replace(/^[0-9.]+\s*/, '') || `Unit ${idx + 1}`,
          chapterTitle: `Unit ${idx + 1}: ${item.subject}`,
          content: body || sec,
          keyTakeaways: [
            `Core syllabus benchmark for ${item.level} ${item.subject}.`,
            `Aligned with Ministry of Education CDC competence framework.`
          ]
        };
      });
    }
  }

  // If tableOfContents exists, generate dedicated multi-page structured curriculum sections
  if (item.tableOfContents && item.tableOfContents.length > 0) {
    const pages: DocumentPage[] = [];
    let pageNum = 1;

    // Cover / Preface
    pages.push({
      pageNumber: pageNum++,
      pageTitle: `Curriculum Overview & Competence Framework`,
      chapterTitle: `Introduction & Preface`,
      content: `REPUBLIC OF ZAMBIA — MINISTRY OF EDUCATION
CURRICULUM DEVELOPMENT CENTRE (CDC) & NATIONAL DIGITAL LIBRARY

${item.title.toUpperCase()}
Document Code: ${item.code} | Level: ${item.level} | Subject: ${item.subject}

PREFACE & CBC PEDAGOGICAL POLICY:
This instructional textbook has been prepared under the Competence-Based Curriculum (CBC) framework by the Directorate of Curriculum Development. It provides teachers, facilitators, and learners with comprehensive syllabus coverage, systematic topic progressions, hands-on inquiry tasks, and authentic Zambian case studies.

LEARNING OUTCOMES & GENERAL COMPETENCES:
${(item.learningOutcomes || [
  `Develop critical thinking and systematic problem-solving skills.`,
  `Apply theoretical principles to Zambian industrial, agricultural, and technological contexts.`,
  `Prepare thoroughly for Examinations Council of Zambia (ECZ) assessments.`
]).map((o, i) => `${i + 1}. ${o}`).join('\n')}

INSTRUCTIONAL DIRECTIVES:
1. Conduct regular student-led interactive investigations and group studio work.
2. Cross-reference formulas and derivations with official CDC syllabus standards.
3. Complete end-of-unit review questions and diagnostic formative assessments.`,
      calloutBox: {
        title: 'Ministry of Education CDC Guideline',
        type: 'tip',
        content: `Learners should maintain a dedicated subject exercise portfolio and record all hands-on experiment results.`
      },
      keyTakeaways: [
        `Official CDC-approved syllabus resource for ${item.level} ${item.subject}.`,
        `Includes theoretical expositions, worked examples, and ECZ self-check questions.`
      ]
    });

    // For each chapter in Table of Contents, create multiple deep, high-yield pages
    item.tableOfContents.forEach((tocTitle, cIdx) => {
      const chapterNum = cIdx + 1;

      // Page A: Theory & Core Concepts
      pages.push({
        pageNumber: pageNum++,
        pageTitle: `${tocTitle} — Theoretical Foundations`,
        chapterTitle: `Chapter ${chapterNum}: ${tocTitle}`,
        content: `CURRICULUM DEVELOPMENT CENTRE (CDC) — ${item.level.toUpperCase()} ${item.subject.toUpperCase()}
CHAPTER ${chapterNum}: ${tocTitle.toUpperCase()}
PART 1: THEORETICAL PRINCIPLES & CONCEPTUAL FRAMEWORK

1. CORE CONCEPTUAL DEFINITIONS:
This section establishes the foundational theories, laws, and structural relationships governing ${tocTitle}. Learners examine the underlying principles through inductive and deductive reasoning, establishing rigorous conceptual clarity.

2. DETAILED SYLLABUS SPECIFICATIONS:
• Core Concepts: Detailed breakdown of variables, classifications, and system dynamics.
• Scientific / Quantitative Foundations: Exploration of models, equations, and qualitative behavior under varying physical and socio-economic parameters.
• Methodological Rigor: Emphasizes correct academic terminology, SI units of measurement, and precise diagrams.

3. CONTEXTUAL RELEVANCE TO ZAMBIA:
Concepts from ${tocTitle} are applied across key national development sectors, including Copperbelt mineral processing, Kariba and Kafue Gorge hydroelectric generation, agricultural value chains in Central and Southern provinces, and environmental conservation in national parks.`,
        calloutBox: {
          title: 'Curriculum Competence Focus',
          type: 'tip',
          content: `Focus on understanding fundamental principles before attempting multi-step numerical calculations or analytical essays.`
        },
        keyTakeaways: [
          `Mastery of ${tocTitle} foundational definitions is essential for higher-level applications.`,
          `Relate concepts to everyday Zambian industrial and environmental contexts.`
        ],
        selfCheckQuestions: [
          {
            question: `State the fundamental principle governing ${tocTitle} and explain its importance in ${item.subject}.`,
            marks: '[3 Marks]',
            answer: `The fundamental principle requires understanding core definitions, adhering to standard SI units, and evaluating system dynamics under CBC standards.`
          }
        ]
      });

      // Page B: Worked Exemplars & Step-by-Step Problem Solving
      pages.push({
        pageNumber: pageNum++,
        pageTitle: `${tocTitle} — Worked Exemplars & Calculations`,
        chapterTitle: `Chapter ${chapterNum}: ${tocTitle}`,
        content: `CURRICULUM DEVELOPMENT CENTRE (CDC) — ${item.level.toUpperCase()} ${item.subject.toUpperCase()}
CHAPTER ${chapterNum}: ${tocTitle.toUpperCase()}
PART 2: WORKED EXEMPLARS, FORMULAS & ALGORITHMIC DERIVATIONS

1. STEP-BY-STEP PROBLEM-SOLVING STRATEGY:
When approaching problems in ${tocTitle}, follow the structured 4-stage method:
Step 1 (Identification): Extract known parameters and state the required target quantity.
Step 2 (Formula / Law Selection): State the governing equation or conceptual model clearly.
Step 3 (Substitution & Execution): Substitute numerical values with matching SI units and execute calculations.
Step 4 (Validation & Units): Verify physical realism of the answer and append correct units.

2. COMMON PITFALLS & EXAMINER GUIDANCE:
Examinations Council of Zambia (ECZ) reports indicate candidates frequently lose marks by omitting intermediate working, using incorrect unit conversions, or confusing fundamental definitions. Always show complete derivations to secure method marks (M1, M2).`,
        workedExamples: [
          {
            title: `Exemplar Problem: Application of ${tocTitle}`,
            problemStatement: `Analyze a standard scenario in ${tocTitle} for ${item.level} ${item.subject}, calculating target values and justifying the step-by-step procedure.`,
            steps: [
              `Extract given data and state initial conditions clearly.`,
              `Apply the governing principle or formula specific to ${tocTitle}.`,
              `Perform algebraic simplification and substitute known numerical values.`,
              `Calculate the final result and round to appropriate significant figures.`
            ],
            finalAnswer: `Demonstrated accurate step-by-step solution yielding full method and accuracy marks under ECZ marking criteria.`
          }
        ],
        calloutBox: {
          title: 'ECZ Examination Strategy',
          type: 'ecz_exam',
          content: `Method marks (M-marks) are awarded for correct formula usage even if an arithmetic calculation error occurs in the final step.`
        },
        keyTakeaways: [
          `Always state formulas and show step-by-step working.`,
          `Ensure units are consistent before substituting into mathematical equations.`
        ]
      });

      // Page C: Review Drills & Self-Check Assessment
      pages.push({
        pageNumber: pageNum++,
        pageTitle: `${tocTitle} — Practice Drills & Exam Assessment`,
        chapterTitle: `Chapter ${chapterNum}: ${tocTitle}`,
        content: `CURRICULUM DEVELOPMENT CENTRE (CDC) — ${item.level.toUpperCase()} ${item.subject.toUpperCase()}
CHAPTER ${chapterNum}: ${tocTitle.toUpperCase()}
PART 3: PRACTICE DRILLS, INQUIRY TASKS & PAST EXAM QUESTIONS

1. STRUCTURED REVIEW QUESTIONS:
Complete the following diagnostic review questions without reference to notes to evaluate personal concept retention and examination readiness.

2. INQUIRY & PRACTICAL LAB / STUDIO TASK:
In small peer learning circles, design a 15-minute investigation or diagrammatic mind map demonstrating the core mechanics of ${tocTitle}. Prepare an oral summary explaining the societal benefits and technological applications.

3. SUMMARY CHECKLIST:
Before proceeding to the subsequent unit, ensure complete mastery of key terminology, mathematical formulas, and practical experimental techniques.`,
        calloutBox: {
          title: 'Self-Directed Revision Activity',
          type: 'activity',
          content: `Form study pairs and take turns explaining key concepts of ${tocTitle} aloud for 3 minutes without referring to textbook notes.`
        },
        keyTakeaways: [
          `Continuous self-testing dramatically enhances long-term memory retention.`,
          `Review mistakes immediately using the provided answers and marking keys.`
        ],
        selfCheckQuestions: [
          {
            question: `Explain two key applications of ${tocTitle} in modern Zambian industry or society.`,
            marks: '[4 Marks]',
            answer: `Applications include enhancing efficiency in resource utilization, supporting infrastructure/technological development, and solving community challenges.`
          },
          {
            question: `Describe the typical experimental setup or analytical procedure used to investigate ${tocTitle}.`,
            marks: '[5 Marks]',
            answer: `Procedure involves defining control variables, taking repeated measurements, calculating mean values, and plotting analytical graphs to verify hypotheses.`
          }
        ]
      });
    });

    return pages;
  }

  // Default 5-page rich curriculum pack
  return [
    {
      pageNumber: 1,
      pageTitle: 'Unit 1: Foundations & Theoretical Framework',
      chapterTitle: 'Unit 1: Introduction & Principles',
      content: `${item.title.toUpperCase()}\nMinistry of Education CDC Official Framework (${item.code})\n\n1. Foundational Overview:\nThis unit establishes the core principles and conceptual framework for ${item.level} ${item.subject}. Learners develop critical thinking and inquiry-based competencies.`,
      keyTakeaways: [`Foundational mastery of ${item.subject} concepts.`]
    },
    {
      pageNumber: 2,
      pageTitle: 'Unit 2: Core Concepts & Methodologies',
      chapterTitle: 'Unit 2: Conceptual Mastery',
      content: `2. Deep-Dive Conceptual Exploration:\nDetailed study of primary topics, analytical models, and systematic problem solving in ${item.subject}.`,
      keyTakeaways: [`Understand structured methodologies and application.`]
    },
    {
      pageNumber: 3,
      pageTitle: 'Unit 3: Step-by-Step Worked Exemplars',
      chapterTitle: 'Unit 3: Problem Solving & Exemplars',
      content: `3. Step-by-Step Worked Problems:\nExemplars illustrating standard solution formats, mathematical derivations, and technical explanations aligned with ECZ marking schemes.`,
      keyTakeaways: [`Step-by-step clarity earns maximum method marks.`]
    },
    {
      pageNumber: 4,
      pageTitle: 'Unit 4: Real-World Zambian Context & Projects',
      chapterTitle: 'Unit 4: Authentic Applications',
      content: `4. Contextual Zambian Applications:\nPractical case studies connecting classroom concepts to national economic growth, environmental sustainability, and community development.`,
      keyTakeaways: [`Connect academic theory to everyday real-world solutions.`]
    },
    {
      pageNumber: 5,
      pageTitle: 'Unit 5: Revision Drills & ECZ Examination Guide',
      chapterTitle: 'Unit 5: Assessment & Revision',
      content: `5. Self-Assessment & Examination Readiness:\nStructured review questions, diagnostic self-check drills, and past ECZ question formats.`,
      keyTakeaways: [`Regular timed revision builds examination confidence.`]
    }
  ];
}

