import type { SubjectMeta, SyllabusTopic } from '@/domain/types';

export const SUBJECTS_META: SubjectMeta[] = [
  {
    id: 'math',
    name: 'Mathematics',
    nameBn: 'গণিত',
    iconName: 'Calculator',
    description: 'Algebra, Trigonometry, Calculus, and Coordinate Geometry.',
    totalTopics: 38,
    totalChapters: 38,
  },
  {
    id: 'physics',
    name: 'Physics',
    nameBn: 'পদার্থ বিজ্ঞান',
    iconName: 'Atom',
    description: 'Mechanics, Heat, Waves, Optics, and Modern Physics.',
    totalTopics: 36,
    totalChapters: 36,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    nameBn: 'রসায়ন',
    iconName: 'FlaskConical',
    description: 'Physical, Inorganic, Organic, and Quantitative Chemistry.',
    totalTopics: 29,
    totalChapters: 29,
  },
  {
    id: 'english',
    name: 'English',
    nameBn: 'ইংরেজি',
    iconName: 'BookA',
    description: 'Grammar, Tenses, Vocabulary, Phrases, Idioms, and Comprehension.',
    totalTopics: 26,
    totalChapters: 12,
  },
  {
    id: 'cse',
    name: 'Computer Science & Engineering',
    nameBn: 'সিএসই',
    iconName: 'Cpu',
    description: 'Programming, Data Structures, Digital Electronics, OS, DBMS, Networks, and Circuits.',
    totalTopics: 32,
    totalChapters: 13,
  },
];

export const SYLLABUS_TOPICS: SyllabusTopic[] = [
  // ==========================================
  // MATHEMATICS (38 topics)
  // ==========================================
  // Algebra
  { id: 'math-alg-complex', subjectId: 'math', section: 'Algebra', chapter: 'Complex Numbers', name: 'জটিল রাশিমালা (Complex Numbers)', order: 1 },
  { id: 'math-alg-quadratic', subjectId: 'math', section: 'Algebra', chapter: 'Quadratic Equations', name: 'দ্বিঘাত সমীকরণ ও রাশি তত্ত্ব (Quadratic Equations)', order: 2 },
  { id: 'math-alg-determinant', subjectId: 'math', section: 'Algebra', chapter: 'Determinants', name: 'নির্ণায়ক (Determinants)', order: 3 },
  { id: 'math-alg-matrix', subjectId: 'math', section: 'Algebra', chapter: 'Matrices', name: 'ম্যাট্রিক্স (Matrices)', order: 4 },
  { id: 'math-alg-partial-fraction', subjectId: 'math', section: 'Algebra', chapter: 'Partial Fractions', name: 'আংশিক ভগ্নাংশ (Partial Fractions)', order: 5 },
  { id: 'math-alg-ap-gp', subjectId: 'math', section: 'Algebra', chapter: 'Progression', name: 'AP & GP (সমান্তর ও গুণোত্তর ধারা)', order: 6 },
  { id: 'math-alg-permutation', subjectId: 'math', section: 'Algebra', chapter: 'Permutations', name: 'বিন্যাস (Permutation)', order: 7 },
  { id: 'math-alg-combination', subjectId: 'math', section: 'Algebra', chapter: 'Combinations', name: 'সমাবেশ (Combination)', order: 8 },
  { id: 'math-alg-binomial', subjectId: 'math', section: 'Algebra', chapter: 'Binomial Theorem', name: 'দ্বিপদী উপপাদ্য (Binomial Theorem)', order: 9 },
  { id: 'math-alg-indices', subjectId: 'math', section: 'Algebra', chapter: 'Exponents', name: 'সূচক (Indices / Exponents)', order: 10 },
  { id: 'math-alg-logarithm', subjectId: 'math', section: 'Algebra', chapter: 'Logarithms', name: 'লগারিদমের ধারা (Logarithms Series)', order: 11 },

  // Trigonometry
  { id: 'math-trig-ratios', subjectId: 'math', section: 'Trigonometry', chapter: 'Trigonometric Ratios', name: 'ত্রিকোণমিতিক অনুপাত (Trigonometric Ratios)', order: 12 },
  { id: 'math-trig-associated', subjectId: 'math', section: 'Trigonometry', chapter: 'Associated Angles', name: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', order: 13 },
  { id: 'math-trig-compound', subjectId: 'math', section: 'Trigonometry', chapter: 'Compound Angles', name: 'যৌগিক কোণের ত্রিকোণমিতিক অনুপাত', order: 14 },
  { id: 'math-trig-transform', subjectId: 'math', section: 'Trigonometry', chapter: 'Transformations', name: 'সূত্রের রূপান্তর (Transformation of Formulas)', order: 15 },
  { id: 'math-trig-multiple', subjectId: 'math', section: 'Trigonometry', chapter: 'Multiple Angles', name: 'গুণিতক কোণের ত্রিকোণমিতিক অনুপাত', order: 16 },
  { id: 'math-trig-submultiple', subjectId: 'math', section: 'Trigonometry', chapter: 'Sub-multiple Angles', name: 'উপ-গুণিতক কোণের ত্রিকোণমিতিক অনুপাত', order: 17 },
  { id: 'math-trig-inverse', subjectId: 'math', section: 'Trigonometry', chapter: 'Inverse Circular Functions', name: 'বিপরীত বৃত্তীয় ফাংশন (Inverse Functions)', order: 18 },
  { id: 'math-trig-prop-triangle', subjectId: 'math', section: 'Trigonometry', chapter: 'Triangle Properties', name: 'ত্রিভুজের ধর্ম (Properties of Triangles)', order: 19 },
  { id: 'math-trig-solve-triangle', subjectId: 'math', section: 'Trigonometry', chapter: 'Triangle Solutions', name: 'ত্রিভুজের সমাধান (Solution of Triangles)', order: 20 },

  // Calculus
  { id: 'math-calc-limits', subjectId: 'math', section: 'Calculus', chapter: 'Functions & Limits', name: 'ফাংশন ও লিমিট (Functions & Limits)', order: 21 },
  { id: 'math-calc-continuity', subjectId: 'math', section: 'Calculus', chapter: 'Continuity', name: 'অবিচ্ছিন্ন ও অন্তরীকরণ যোগ্যতা (Continuity & Differentiability)', order: 22 },
  { id: 'math-calc-max-min', subjectId: 'math', section: 'Calculus', chapter: 'Extrema', name: 'লঘুমান ও গুরুমান (Maxima & Minima)', order: 23 },
  { id: 'math-calc-first-principle', subjectId: 'math', section: 'Calculus', chapter: 'First Principles', name: 'মূল নিয়মে অন্তরক সহগ (Differentiation by First Principle)', order: 24 },
  { id: 'math-calc-diff-standard', subjectId: 'math', section: 'Calculus', chapter: 'Standard Differentiation', name: 'ফাংশনগুলোর অন্তরীকরণ (Differentiation of Standard Functions)', order: 25 },
  { id: 'math-calc-geom-diff', subjectId: 'math', section: 'Calculus', chapter: 'Geometrical Interpretation', name: 'dy/dx এর জ্যামিতিক ব্যাখ্যা (Geometrical Meaning of Derivative)', order: 26 },
  { id: 'math-calc-successive', subjectId: 'math', section: 'Calculus', chapter: 'Successive Differentiation', name: 'পর্যায় অন্তরীকরণ ও লিবনিজের উপপাদ্য (Leibniz Theorem)', order: 27 },
  { id: 'math-calc-partial', subjectId: 'math', section: 'Calculus', chapter: 'Partial Differentiation', name: 'Partial Differentiation (আংশিক অন্তরীকরণ)', order: 28 },
  { id: 'math-calc-indefinite', subjectId: 'math', section: 'Calculus', chapter: 'Indefinite Integral', name: 'Integral Calculus (অনির্দিষ্ট যোগজীকরণ)', order: 29 },
  { id: 'math-calc-by-parts', subjectId: 'math', section: 'Calculus', chapter: 'Integration by Parts', name: 'খন্ড যোজন (Integration by Parts)', order: 30 },
  { id: 'math-calc-definite', subjectId: 'math', section: 'Calculus', chapter: 'Definite Integral', name: 'সঠিক যোজিত ফল (Definite Integrals)', order: 31 },

  // Geometry
  { id: 'math-geom-coordinates', subjectId: 'math', section: 'Geometry', chapter: 'Coordinates', name: 'স্থানাঙ্ক (Cartesian & Polar Coordinates)', order: 32 },
  { id: 'math-geom-locus', subjectId: 'math', section: 'Geometry', chapter: 'Locus', name: 'সঞ্চার পথ এবং ইহার সমীকরণ (Locus & Equation)', order: 33 },
  { id: 'math-geom-straight-line', subjectId: 'math', section: 'Geometry', chapter: 'Straight Lines', name: 'সরলরেখা (Straight Lines)', order: 34 },
  { id: 'math-geom-circle', subjectId: 'math', section: 'Geometry', chapter: 'Circles', name: 'বৃত্ত (Circles)', order: 35 },
  { id: 'math-geom-parabola', subjectId: 'math', section: 'Geometry', chapter: 'Conics', name: 'কনিক - পরাবৃত্ত (Parabola)', order: 36 },
  { id: 'math-geom-ellipse', subjectId: 'math', section: 'Geometry', chapter: 'Conics', name: 'কনিক - উপবৃত্ত (Ellipse)', order: 37 },
  { id: 'math-geom-hyperbola', subjectId: 'math', section: 'Geometry', chapter: 'Conics', name: 'কনিক - অধিবৃত্ত (Hyperbola)', order: 38 },

  // ==========================================
  // PHYSICS (36 topics)
  // ==========================================
  // Mechanics & Properties of Matter
  { id: 'phy-mech-units', subjectId: 'physics', section: 'Mechanics', chapter: 'Units', name: 'পরিমাপের একক (Units of Measurement)', order: 1 },
  { id: 'phy-mech-vectors', subjectId: 'physics', section: 'Mechanics', chapter: 'Vectors', name: 'ভেক্টর (Vectors & Vector Operations)', order: 2 },
  { id: 'phy-mech-linear-motion', subjectId: 'physics', section: 'Mechanics', chapter: 'Linear Motion', name: 'রৈখিক গতি (Linear Motion & Equations)', order: 3 },
  { id: 'phy-mech-2d-motion', subjectId: 'physics', section: 'Mechanics', chapter: '2D Motion', name: 'দ্বিমাত্রিক গতির সমীকরণ ও প্রক্ষেপক (Projectile)', order: 4 },
  { id: 'phy-mech-newton-laws', subjectId: 'physics', section: 'Mechanics', chapter: 'Newton\'s Laws', name: 'নিউটনের গতিসূত্র ও ভরবেগ (Newton\'s Laws & Momentum)', order: 5 },
  { id: 'phy-mech-rotational', subjectId: 'physics', section: 'Mechanics', chapter: 'Rotational Motion', name: 'কৌণিক গতিসূত্র (Rotational Motion & Torque)', order: 6 },
  { id: 'phy-mech-gravity', subjectId: 'physics', section: 'Mechanics', chapter: 'Gravitation', name: 'মহাকর্ষ-অভিকর্ষ (Gravitation & Gravity)', order: 7 },
  { id: 'phy-mech-pendulum', subjectId: 'physics', section: 'Mechanics', chapter: 'Simple Pendulum', name: 'সরল দোলক (Simple Pendulum)', order: 8 },
  { id: 'phy-mech-work-power-energy', subjectId: 'physics', section: 'Mechanics', chapter: 'Work & Energy', name: 'কাজ, ক্ষমতা ও শক্তি (Work, Power & Energy)', order: 9 },
  { id: 'phy-mech-elasticity', subjectId: 'physics', section: 'Mechanics', chapter: 'Elasticity', name: 'স্থিতিস্থাপকতা (Elasticity & Hooke\'s Law)', order: 10 },
  { id: 'phy-mech-fluid', subjectId: 'physics', section: 'Mechanics', chapter: 'Fluid Dynamics', name: 'প্রবাহী পদার্থ (Surface Tension & Viscosity)', order: 11 },

  // Heat & Thermodynamics
  { id: 'phy-heat-temp', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Thermometry', name: 'তাপ, তাপমাত্রা এবং থার্মোমিতি (Thermometry)', order: 12 },
  { id: 'phy-heat-expansion', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Thermal Expansion', name: 'পদার্থের তাপীয় প্রসারণ (Thermal Expansion)', order: 13 },
  { id: 'phy-heat-gas', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Kinetic Theory', name: 'তাপ ও গ্যাস (Heat & Kinetic Theory of Gases)', order: 14 },
  { id: 'phy-heat-first-law', subjectId: 'physics', section: 'Thermal Physics', chapter: 'First Law', name: 'তাপ গতিবিদ্যার ১ম সূত্র (First Law of Thermodynamics)', order: 15 },
  { id: 'phy-heat-transfer', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Heat Transfer', name: 'তাপ সঞ্চালন ও বিকিরণ (Conduction, Convection & Radiation)', order: 16 },
  { id: 'phy-heat-change-state', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Change of State', name: 'অবস্থার পরিবর্তন ও সুপ্ততাপ (Change of State & Latent Heat)', order: 17 },
  { id: 'phy-heat-second-law', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Second Law', name: 'তাপ গতিবিদ্যার ২য় সূত্র ও এনট্রপি (Second Law & Entropy)', order: 18 },
  { id: 'phy-heat-mech-equiv', subjectId: 'physics', section: 'Thermal Physics', chapter: 'Mechanical Equivalent', name: 'তাপের প্রকৃতি ও উহার যান্ত্রিক সমতা (Joule\'s Mechanical Equivalent)', order: 19 },

  // Waves & Sound
  { id: 'phy-sound-waves', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Wave Motion', name: 'তরঙ্গ গতি (Wave Motion & Wave Types)', order: 20 },
  { id: 'phy-sound-shm', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'SHM', name: 'সরল ছন্দিত গতি (Simple Harmonic Motion)', order: 21 },
  { id: 'phy-sound-velocity', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Sound Velocity', name: 'শব্দের বেগ (Velocity of Sound in Media)', order: 22 },
  { id: 'phy-sound-intensity', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Intensity', name: 'তরঙ্গের তীব্রতা ও শব্দের তীব্রতা লেভেল (Sound Intensity & Decibels)', order: 23 },
  { id: 'phy-sound-doppler', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Doppler Effect', name: 'ডপলার প্রভাব (Doppler Effect)', order: 24 },
  { id: 'phy-sound-superposition', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Superposition', name: 'শব্দের প্রতিফলন, প্রতিসরণ ও উপরিপাতন (Superposition & Beats)', order: 25 },
  { id: 'phy-sound-vibration', subjectId: 'physics', section: 'Waves & Acoustics', chapter: 'Vibrations', name: 'টানা তার ও বায়ুস্তম্ভের কম্পন (Stretched Strings & Organ Pipes)', order: 26 },

  // Optics
  { id: 'phy-optics-rectilinear', subjectId: 'physics', section: 'Optics', chapter: 'Propagation', name: 'আলোর সরলগতি ও ছায়া (Rectilinear Propagation)', order: 27 },
  { id: 'phy-optics-photometry', subjectId: 'physics', section: 'Optics', chapter: 'Photometry', name: 'ফটোমিতি বা দীপ্তিমিতি (Photometry & Luminous Flux)', order: 28 },
  { id: 'phy-optics-plane-refl', subjectId: 'physics', section: 'Optics', chapter: 'Plane Reflection', name: 'সমতলে আলোর প্রতিফলন (Reflection at Plane Surfaces)', order: 29 },
  { id: 'phy-optics-sphere-refl', subjectId: 'physics', section: 'Optics', chapter: 'Spherical Reflection', name: 'গোলকীয়তলে আলোর প্রতিফলন (Spherical Mirrors)', order: 30 },
  { id: 'phy-optics-plane-refr', subjectId: 'physics', section: 'Optics', chapter: 'Plane Refraction', name: 'সমতলে আলোর প্রতিসরণ ও প্রিজম (Refraction & Prisms)', order: 31 },
  { id: 'phy-optics-sphere-refr', subjectId: 'physics', section: 'Optics', chapter: 'Lenses', name: 'গোলকীয় তলে আলোর প্রতিসরণ ও লেন্স (Lenses & Lens Formula)', order: 32 },

  // Modern / Atomic Physics
  { id: 'phy-mod-modern', subjectId: 'physics', section: 'Modern Physics', chapter: 'Relativity & Atoms', name: 'আধুনিক পদার্থ বিজ্ঞান (Relativity, Mass-Energy Equivalence)', order: 33 },
  { id: 'phy-mod-photoelectric', subjectId: 'physics', section: 'Modern Physics', chapter: 'Photoelectric', name: 'আলোক তড়িৎ ক্রিয়া (Photoelectric Effect & Photons)', order: 34 },
  { id: 'phy-mod-xray', subjectId: 'physics', section: 'Modern Physics', chapter: 'X-Ray', name: 'X-Ray (রঞ্জন রশ্মি ও বৈশিষ্ট্য)', order: 35 },
  { id: 'phy-mod-radioactivity', subjectId: 'physics', section: 'Modern Physics', chapter: 'Nuclear Physics', name: 'তেজস্ক্রিয়তা ও পরমাণু নিউক্লিয়াস (Radioactivity & Half-life)', order: 36 },

  // ==========================================
  // CHEMISTRY (29 topics)
  // ==========================================
  // Physical Chemistry
  { id: 'chem-phys-states', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'States of Matter', name: 'পদার্থের অবস্থা ও পরিবর্তন (States of Matter)', order: 1 },
  { id: 'chem-phys-symbols', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Formulas & Valency', name: 'প্রতীক, যোজনী এবং সংকেত (Symbols, Valency & Formulas)', order: 2 },
  { id: 'chem-phys-atomic-struct', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Atomic Structure', name: 'পরমাণুর গঠন (Bohr Model, Quantum Numbers & Orbitals)', order: 3 },
  { id: 'chem-phys-periodic', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Periodic Table', name: 'পর্যায় সারণী ও পর্যায়বৃত্ত ধর্ম (Periodic Properties)', order: 4 },
  { id: 'chem-phys-bonding', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Chemical Bonding', name: 'রাসায়নিক বন্ধন (Ionic, Covalent & Metallic Bonds)', order: 5 },
  { id: 'chem-phys-reactions', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Reactions', name: 'রাসায়নিক বিক্রিয়া ও সাম্যাবস্থা (Reactions & Equilibrium)', order: 6 },
  { id: 'chem-phys-redox', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Redox', name: 'জারণ-বিজারণ (Oxidation-Reduction & Balancing)', order: 7 },
  { id: 'chem-phys-acids-bases', subjectId: 'chemistry', section: 'Physical Chemistry', chapter: 'Acids & Bases', name: 'এসিড, ক্ষারক ও লবণ (Acids, Bases & Neutralization)', order: 8 },

  // Metals & Non-metals (Inorganic)
  { id: 'chem-inorg-intro', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Metals Overview', name: 'ধাতুর প্রাথমিক আলোচনা ও ধাতু নিষ্কাশন (Extraction of Metals)', order: 9 },
  { id: 'chem-inorg-al', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Aluminium', name: 'অ্যালুমিনিয়াম ও এর যৌগসমূহ (Aluminium & Compounds)', order: 10 },
  { id: 'chem-inorg-fe', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Iron', name: 'আয়রন ও ইস্পাত প্রস্তুতি (Iron & Steel Manufacture)', order: 11 },
  { id: 'chem-inorg-cu', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Copper', name: 'কপার ও এর সংকর ধাতু (Copper & Alloys)', order: 12 },
  { id: 'chem-inorg-zn', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Zinc', name: 'জিংক ও গ্যালভানাইজিং (Zinc & Galvanizing)', order: 13 },
  { id: 'chem-inorg-water', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Water', name: 'পানি ও পানির খরতা (Water & Water Hardness)', order: 14 },
  { id: 'chem-inorg-oxides', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Oxides', name: 'অক্সাইড ও প্রকারভেদ (Acidic, Basic & Amphoteric Oxides)', order: 15 },
  { id: 'chem-inorg-hydroxides', subjectId: 'chemistry', section: 'Inorganic Chemistry', chapter: 'Hydroxides', name: 'হাইড্রোক্সাইড ও অধঃক্ষেপণ (Hydroxides & Precipitations)', order: 16 },

  // Organic Chemistry
  { id: 'chem-org-intro', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Organic Basics', name: 'জৈব যৌগের প্রাথমিক ধারণা (Introduction to Organic Compounds)', order: 17 },
  { id: 'chem-org-iupac', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Nomenclature', name: 'জৈব যৌগের নামকরণ (IUPAC Nomenclature)', order: 18 },
  { id: 'chem-org-isomerism', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Isomerism', name: 'জৈব যৌগের সমাণুতা (Structural & Stereoisomerism)', order: 19 },
  { id: 'chem-org-hydrocarbons', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Hydrocarbons', name: 'হাইড্রোকার্বন শ্রেণিবিভাগ (Classification of Hydrocarbons)', order: 20 },
  { id: 'chem-org-alkanes', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Alkanes', name: 'অ্যালকেন প্রস্তুতি ও ধর্ম (Alkanes Preparation & Reactions)', order: 21 },
  { id: 'chem-org-alkenes', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Alkenes', name: 'অ্যালকিন প্রস্তুতি ও সংযোজন বিক্রিয়া (Alkenes & Addition)', order: 22 },
  { id: 'chem-org-alkynes', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Alkynes', name: 'অ্যালকাইন প্রস্তুতি ও শনাক্তকরণ (Alkynes & Tests)', order: 23 },
  { id: 'chem-org-alcohols', subjectId: 'chemistry', section: 'Organic Chemistry', chapter: 'Alcohols', name: 'অ্যালকোহল প্রস্তুতি ও শনাক্তকরণ (Alcohols & Properties)', order: 24 },

  // Quantitative / Mathematical Chemistry
  { id: 'chem-math-avogadro', subjectId: 'chemistry', section: 'Quantitative Chemistry', chapter: 'Avogadro Concept', name: 'অ্যাভোগেড্রো প্রকল্প ও মোল ধারণা (Avogadro Law & Mole Concept)', order: 25 },
  { id: 'chem-math-gas-laws', subjectId: 'chemistry', section: 'Quantitative Chemistry', chapter: 'Gas Laws', name: 'গ্যাসের ধর্ম ও সূত্র (Boyle, Charles, Ideal Gas PV=nRT)', order: 26 },
  { id: 'chem-math-solution-units', subjectId: 'chemistry', section: 'Quantitative Chemistry', chapter: 'Solution Concentration', name: 'দ্রবণের ঘনমাত্রার বিভিন্ন একক (Molarity, Molality, Normality)', order: 27 },
  { id: 'chem-math-ph-buffers', subjectId: 'chemistry', section: 'Quantitative Chemistry', chapter: 'pH & Buffers', name: 'pH ও বাফার দ্রবণ (pH Scale, Buffer Solutions & Henderson Eq.)', order: 28 },
  { id: 'chem-math-electrolysis', subjectId: 'chemistry', section: 'Quantitative Chemistry', chapter: 'Electrolysis', name: 'তড়িৎ বিশ্লেষণ ও ফ্যারাডের সূত্র (Electrolysis & Faraday\'s Laws)', order: 29 },

  // ==========================================
  // ENGLISH (26 topics)
  // ==========================================
  // Fundamentals
  { id: 'eng-fund-person-number', subjectId: 'english', section: 'Fundamentals', chapter: 'Grammar Basics', name: 'Person & Number', order: 1 },
  { id: 'eng-fund-articles', subjectId: 'english', section: 'Fundamentals', chapter: 'Grammar Basics', name: 'Articles (A, An, The & Omission)', order: 2 },
  { id: 'eng-fund-determiners', subjectId: 'english', section: 'Fundamentals', chapter: 'Grammar Basics', name: 'Determiners & Quantifiers', order: 3 },
  { id: 'eng-fund-verb-conjugation', subjectId: 'english', section: 'Fundamentals', chapter: 'Grammar Basics', name: 'Conjugation of Verbs (Strong & Weak Verbs)', order: 4 },

  // Parts of Speech
  { id: 'eng-pos-types', subjectId: 'english', section: 'Parts of Speech', chapter: 'Parts of Speech', name: 'Eight Parts of Speech & Classification', order: 5 },
  { id: 'eng-pos-identification', subjectId: 'english', section: 'Parts of Speech', chapter: 'Parts of Speech', name: 'Identification of Parts of Speech in Sentences', order: 6 },
  { id: 'eng-pos-word-formation', subjectId: 'english', section: 'Parts of Speech', chapter: 'Parts of Speech', name: 'Word Formation (Prefixes, Suffixes & Roots)', order: 7 },
  { id: 'eng-pos-interchange', subjectId: 'english', section: 'Parts of Speech', chapter: 'Parts of Speech', name: 'Interchange of Parts of Speech (Noun/Verb/Adj/Adv)', order: 8 },

  // Prepositions
  { id: 'eng-prep-rules', subjectId: 'english', section: 'Prepositions', chapter: 'Prepositions', name: 'General Prepositions of Time, Place & Direction', order: 9 },
  { id: 'eng-prep-appropriate', subjectId: 'english', section: 'Prepositions', chapter: 'Prepositions', name: 'Appropriate Prepositions (Essential Exam List)', order: 10 },

  // Sentences & Clauses
  { id: 'eng-sent-types', subjectId: 'english', section: 'Sentences & Clauses', chapter: 'Sentence Structure', name: 'Sentence Classification (Simple, Complex, Compound)', order: 11 },
  { id: 'eng-sent-clauses', subjectId: 'english', section: 'Sentences & Clauses', chapter: 'Sentence Structure', name: 'Clauses (Principal, Subordinate & Coordinate Clauses)', order: 12 },
  { id: 'eng-sent-transform', subjectId: 'english', section: 'Sentences & Clauses', chapter: 'Sentence Structure', name: 'Transformation of Sentences (Affirmative/Negative, Degrees)', order: 13 },
  { id: 'eng-sent-combining', subjectId: 'english', section: 'Sentences & Clauses', chapter: 'Sentence Structure', name: 'Joining and Combining Sentences', order: 14 },
  { id: 'eng-sent-completion', subjectId: 'english', section: 'Sentences & Clauses', chapter: 'Sentence Structure', name: 'Sentence Completion & Conditionals', order: 15 },

  // Voice & Tenses
  { id: 'eng-voice-active-passive', subjectId: 'english', section: 'Voice & Tense', chapter: 'Voice Change', name: 'Voice Change (Active, Passive & Quasi-Passive)', order: 16 },
  { id: 'eng-tense-structures', subjectId: 'english', section: 'Voice & Tense', chapter: 'Uses of Tense', name: 'Tenses (12 Structures & Contextual Uses)', order: 17 },
  { id: 'eng-tense-sva', subjectId: 'english', section: 'Voice & Tense', chapter: 'Uses of Tense', name: 'Subject-Verb Agreement Rules', order: 18 },
  { id: 'eng-tense-right-forms', subjectId: 'english', section: 'Voice & Tense', chapter: 'Uses of Tense', name: 'Right Form of Verbs', order: 19 },
  { id: 'eng-tense-correction', subjectId: 'english', section: 'Voice & Tense', chapter: 'Uses of Tense', name: 'Sentence Correction & Error Spotting', order: 20 },

  // Verbals, Idioms & Vocabulary
  { id: 'eng-verbals-gerund-participle', subjectId: 'english', section: 'Advanced Grammar', chapter: 'Verbals', name: 'Gerund, Participle & Infinitive', order: 21 },
  { id: 'eng-vocab-phrases-idioms', subjectId: 'english', section: 'Vocabulary & Idioms', chapter: 'Idioms & Phrases', name: 'Phrases & Idiomatic Expressions', order: 22 },
  { id: 'eng-vocab-translation', subjectId: 'english', section: 'Vocabulary & Idioms', chapter: 'Translation', name: 'Translation Patterns & Proverbs', order: 23 },
  { id: 'eng-vocab-syn-ant', subjectId: 'english', section: 'Vocabulary & Idioms', chapter: 'Vocabulary', name: 'Synonyms & Antonyms', order: 24 },
  { id: 'eng-vocab-homophones', subjectId: 'english', section: 'Vocabulary & Idioms', chapter: 'Vocabulary', name: 'Homophones, Homonyms & Confusing Words', order: 25 },
  { id: 'eng-comp-reading', subjectId: 'english', section: 'Comprehension', chapter: 'Comprehension', name: 'Reading Comprehension & Question Framing', order: 26 },

  // ==========================================
  // COMPUTER SCIENCE & ENGINEERING (32 topics)
  // ==========================================
  // Programming & Software
  { id: 'cse-prog-c-cpp-basics', subjectId: 'cse', section: 'Programming', chapter: 'C & C++', name: 'C & C++ Programming (Variables, Operators, Control Flow)', order: 1 },
  { id: 'cse-prog-c-cpp-func-ptr', subjectId: 'cse', section: 'Programming', chapter: 'C & C++', name: 'Functions, Recursion, Pointers & File Handling', order: 2 },
  { id: 'cse-prog-cpp-oop', subjectId: 'cse', section: 'Programming', chapter: 'C & C++', name: 'Object-Oriented Programming (Classes, Inheritance, Polymorphism)', order: 3 },
  { id: 'cse-prog-python-basics', subjectId: 'cse', section: 'Programming', chapter: 'Python', name: 'Python Basics, Syntax, Strings & Control Statements', order: 4 },
  { id: 'cse-prog-python-ds', subjectId: 'cse', section: 'Programming', chapter: 'Python', name: 'Python Data Structures (Lists, Tuples, Dictionaries, Sets)', order: 5 },
  { id: 'cse-ds-arrays-ptrs', subjectId: 'cse', section: 'Data Structures', chapter: 'Data Structures', name: 'Arrays, Strings & Memory Representation', order: 6 },
  { id: 'cse-ds-linked-lists', subjectId: 'cse', section: 'Data Structures', chapter: 'Data Structures', name: 'Linked Lists (Singly, Doubly & Circular)', order: 7 },
  { id: 'cse-ds-stacks-queues', subjectId: 'cse', section: 'Data Structures', chapter: 'Data Structures', name: 'Stacks, Queues & Recursion Implementation', order: 8 },
  { id: 'cse-ds-trees-graphs', subjectId: 'cse', section: 'Data Structures', chapter: 'Data Structures', name: 'Trees (Binary Trees, BST) & Graph Traversals (BFS, DFS)', order: 9 },
  { id: 'cse-ds-algorithms', subjectId: 'cse', section: 'Data Structures', chapter: 'Data Structures', name: 'Sorting (Bubble, Quick, Merge) & Searching Algorithms', order: 10 },
  { id: 'cse-discrete-math', subjectId: 'cse', section: 'Mathematics in CSE', chapter: 'Discrete Math', name: 'Discrete Mathematics (Set Theory, Logic, Graph Theory)', order: 11 },

  // Systems, Architecture & OS
  { id: 'cse-dbms-concepts', subjectId: 'cse', section: 'Database Systems', chapter: 'DBMS', name: 'Database Concepts, ER Diagrams & Normalization (1NF, 2NF, 3NF)', order: 12 },
  { id: 'cse-dbms-sql-recovery', subjectId: 'cse', section: 'Database Systems', chapter: 'DBMS', name: 'SQL Queries, Transactions, ACID & Recovery Techniques', order: 13 },
  { id: 'cse-os-process-scheduling', subjectId: 'cse', section: 'Operating Systems', chapter: 'Operating Systems', name: 'Processes, CPU Scheduling Algorithms & Deadlocks', order: 14 },
  { id: 'cse-os-memory-files', subjectId: 'cse', section: 'Operating Systems', chapter: 'Operating Systems', name: 'Memory Management (Paging, Virtual Memory) & File Systems', order: 15 },
  { id: 'cse-micro-8086-arch', subjectId: 'cse', section: 'Microprocessors', chapter: 'Microprocessors', name: '8086 Microprocessor Architecture, Registers & Buses', order: 16 },
  { id: 'cse-micro-instructions', subjectId: 'cse', section: 'Microprocessors', chapter: 'Microprocessors', name: '8086 Instruction Set, Addressing Modes & Interrupts', order: 17 },
  { id: 'cse-micro-interfacing', subjectId: 'cse', section: 'Microprocessors', chapter: 'Microprocessors', name: 'Memory Interfacing & I/O Peripheral Interfacing', order: 18 },
  { id: 'cse-se-sdlc-design', subjectId: 'cse', section: 'Software Engineering', chapter: 'Software Engineering', name: 'Software Development Life Cycle (SDLC) & System Design', order: 19 },

  // Hardware, Electronics & Networking
  { id: 'cse-digital-numbers', subjectId: 'cse', section: 'Digital Electronics', chapter: 'Digital Electronics', name: 'Number Systems (Binary, Hex, Octal) & Boolean Algebra', order: 20 },
  { id: 'cse-digital-gates-kmap', subjectId: 'cse', section: 'Digital Electronics', chapter: 'Digital Electronics', name: 'Logic Gates, Logic Families & Karnaugh Maps (K-Maps)', order: 21 },
  { id: 'cse-digital-combinational', subjectId: 'cse', section: 'Digital Electronics', chapter: 'Digital Electronics', name: 'Combinational Circuits (Adders, Subtractors, Multiplexers, Decoders)', order: 22 },
  { id: 'cse-digital-sequential', subjectId: 'cse', section: 'Digital Electronics', chapter: 'Digital Electronics', name: 'Sequential Circuits, Flip-Flops (SR, JK, D, T), Counters & Registers', order: 23 },
  { id: 'cse-digital-converters', subjectId: 'cse', section: 'Digital Electronics', chapter: 'Digital Electronics', name: 'A/D and D/A Converters & VLSI Fundamentals', order: 24 },
  { id: 'cse-net-osi-tcp', subjectId: 'cse', section: 'Networking', chapter: 'Data Communication', name: 'OSI Reference Model & TCP/IP Protocol Architecture', order: 25 },
  { id: 'cse-net-media-topo', subjectId: 'cse', section: 'Networking', chapter: 'Data Communication', name: 'Transmission Media, Network Topologies & Devices', order: 26 },
  { id: 'cse-net-modulation-ip', subjectId: 'cse', section: 'Networking', chapter: 'Data Communication', name: 'Modulation, Multiplexing, IP Addressing & Subnetting', order: 27 },
  { id: 'cse-graphics-pipeline', subjectId: 'cse', section: 'Computer Graphics', chapter: 'Computer Graphics', name: 'Graphics Pipeline, Rasterization & 2D/3D Transformations', order: 28 },
  { id: 'cse-elec-semiconductors', subjectId: 'cse', section: 'Electronic Devices', chapter: 'Electronic Circuits', name: 'Semiconductors, P-N Junction Diodes & Rectifiers', order: 29 },
  { id: 'cse-elec-transistors-bjt', subjectId: 'cse', section: 'Electronic Devices', chapter: 'Electronic Circuits', name: 'BJT, FET, Transistor Biasing & Small Signal Amplifiers', order: 30 },
  { id: 'cse-elec-multivibrator', subjectId: 'cse', section: 'Electronic Devices', chapter: 'Electronic Circuits', name: 'Multivibrators, Oscillator Circuits & Photo-Electric Devices', order: 31 },
  { id: 'cse-circuits-dc-ac', subjectId: 'cse', section: 'Basic Electricity', chapter: 'Basic Electricity', name: 'DC & AC Circuits (Ohm\'s Law, Kirchhoff\'s Laws, RLC Resonance)', order: 32 },
];

