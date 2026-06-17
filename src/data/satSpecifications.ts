// Official SAT Content Domains & Coverage

export const READING_WRITING_DOMAINS = [
  'information-and-ideas',
  'craft-and-structure',
  'standard-english-conventions',
  'expression-of-ideas',
] as const;

export const MATH_CONTENT_AREAS = [
  'algebra',
  'advanced-math',
  'problem-solving-data-analysis',
  'geometry-trigonometry',
] as const;

// Official SAT Question Distribution

export const OFFICIAL_SAT_DISTRIBUTION = {
  readingWriting: {
    total: 54,
    perModule: 27,
    domains: {
      'information-and-ideas': { min: 0.20, max: 0.24, target: 0.22 },
      'craft-and-structure': { min: 0.24, max: 0.28, target: 0.26 },
      'standard-english-conventions': { min: 0.24, max: 0.28, target: 0.26 },
      'expression-of-ideas': { min: 0.24, max: 0.28, target: 0.26 },
    },
  },
  math: {
    total: 44,
    perModule: 22,
    contentAreas: {
      'algebra': { min: 0.28, max: 0.36, target: 0.32 },
      'advanced-math': { min: 0.28, max: 0.36, target: 0.32 },
      'problem-solving-data-analysis': { min: 0.11, max: 0.16, target: 0.14 },
      'geometry-trigonometry': { min: 0.11, max: 0.16, target: 0.14 },
    },
  },
};

// Official SAT Timing

export const OFFICIAL_SAT_TIMING = {
  readingWriting: {
    module1: { minutes: 32, questions: 27, secondsPerQuestion: 71 },
    module2: { minutes: 32, questions: 27, secondsPerQuestion: 71 },
    totalMinutes: 64,
  },
  math: {
    module1: { minutes: 35, questions: 22, secondsPerQuestion: 95 },
    module2: { minutes: 35, questions: 22, secondsPerQuestion: 95 },
    totalMinutes: 70,
  },
  break: { minutes: 10 },
  totalDuration: 154, // 2 hours 34 minutes
};

// Passage Specifications for Reading & Writing

export const PASSAGE_SPECIFICATIONS = {
  minLength: 25,
  maxLength: 150,
  wordsPerQuestion: 1, // One question per passage (not multiple)
  types: [
    'literature',
    'history-social-studies',
    'humanities',
    'science-with-graphics',
  ] as const,
};

// Official Difficulty Scale (0-5)

export const DIFFICULTY_SCALE = {
  0: 'No difficulty (below expected range)',
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
} as const;

// Module 1 Typical Distribution (Mixed Difficulty)

export const MODULE_1_DIFFICULTY_DISTRIBUTION = {
  easy: { min: 0.18, max: 0.26, target: 0.22 }, // ~22% of questions
  medium: { min: 0.28, max: 0.36, target: 0.32 }, // ~32% of questions
  hard: { min: 0.18, max: 0.26, target: 0.22 }, // ~22% of questions
  unscored: { target: 0.24 }, // ~24% pretest questions
};

// Module 2 - Varies based on Module 1 performance

export const MODULE_2_DIFFICULTY_DISTRIBUTIONS = {
  easier: {
    // When student struggles on Module 1
    easy: { target: 0.32 },
    medium: { target: 0.45 },
    hard: { target: 0.23 },
  },
  harder: {
    // When student excels on Module 1
    easy: { target: 0.14 },
    medium: { target: 0.36 },
    hard: { target: 0.50 },
  },
};

// Distractor Quality Standards (College Board Design Principles)

export const DISTRACTOR_DESIGN_PRINCIPLES = {
  readingWriting: [
    'Use passage language but misrepresent meaning',
    'Include partially correct facts',
    'Echo reasonable-sounding ideas not supported by text',
    'Use absolute qualifiers (always, never, all) as traps',
    'Present scope ambiguities',
    'Preserve tone while changing meaning',
    'Reflect common student reasoning errors',
  ],
  math: [
    'Intermediate results (e.g., side not area)',
    'Inverted fractions (3/5 vs 5/3)',
    'Scale misreading on graphs',
    'Solving for x when answer asks for 2x',
    'Common computational errors',
    'Misunderstanding what problem asks for',
    'Off-by-one errors',
  ],
};

// Scoring: How difficulty affects point value

export const DIFFICULTY_POINT_WEIGHTING = {
  easy: 1.0, // Baseline point value
  medium: 1.25, // 25% more valuable
  hard: 1.5, // 50% more valuable
};

// Official SAT Score Ranges

export const OFFICIAL_SCORE_RANGES = {
  minPerSection: 200,
  maxPerSection: 800,
  minTotal: 400,
  maxTotal: 1600,
  average: {
    readingWriting: 521,
    math: 508,
    total: 1029,
  },
};

// Percentile Benchmarks

export const PERCENTILE_BENCHMARKS = [
  { score: 1200, percentile: 75, label: 'Competitive' },
  { score: 1280, percentile: 84, label: 'Very Good' },
  { score: 1350, percentile: 90, label: 'Excellent' },
  { score: 1400, percentile: 94, label: 'Outstanding' },
  { score: 1450, percentile: 96, label: 'Top 1-4%' },
  { score: 1550, percentile: 98, label: 'Exceptional' },
];

// Module Routing Logic

export const MODULE_ROUTING_THRESHOLDS = {
  // If Module 1 accuracy is above this threshold, student gets harder Module 2
  easyToHard: 0.75, // 75% accuracy threshold
  // Below this, get easier Module 2
  belowEasy: 0.60, // 60% accuracy threshold
  // Between: medium Module 2 (if it existed)
};

// Realistic Accuracy Drops between Module 1 and Module 2

export const REALISTIC_ACCURACY_CHANGES = {
  easyModuleToHardModule: {
    min: -0.08, // -8 percentage points
    max: -0.30, // -30 percentage points
    average: -0.18, // Average -18 percentage points
  },
};
