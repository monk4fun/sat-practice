import type { SATSection, Topic, ReadingWritingTopic, MathTopic } from '../types';

export const READING_WRITING_TOPICS: ReadingWritingTopic[] = [
  'information-and-ideas',
  'craft-and-structure',
  'expression-of-ideas',
  'standard-english-conventions',
];

export const MATH_TOPICS: MathTopic[] = [
  'algebra',
  'advanced-math',
  'problem-solving-data-analysis',
  'geometry-trigonometry',
];

export const ALL_TOPICS: Topic[] = [...READING_WRITING_TOPICS, ...MATH_TOPICS];

export const TOPIC_LABELS: Record<Topic, string> = {
  'information-and-ideas': 'Information & Ideas',
  'craft-and-structure': 'Craft & Structure',
  'expression-of-ideas': 'Expression of Ideas',
  'standard-english-conventions': 'Standard English Conventions',
  'algebra': 'Algebra',
  'advanced-math': 'Advanced Math',
  'problem-solving-data-analysis': 'Problem-Solving & Data Analysis',
  'geometry-trigonometry': 'Geometry & Trigonometry',
};

export const SECTION_LABELS: Record<SATSection, string> = {
  'reading-writing': 'Reading & Writing',
  'math': 'Math',
};

export const SECTION_FOR_TOPIC: Record<Topic, SATSection> = {
  'information-and-ideas': 'reading-writing',
  'craft-and-structure': 'reading-writing',
  'expression-of-ideas': 'reading-writing',
  'standard-english-conventions': 'reading-writing',
  'algebra': 'math',
  'advanced-math': 'math',
  'problem-solving-data-analysis': 'math',
  'geometry-trigonometry': 'math',
};

export const EXAM_CONFIG = {
  full: {
    sections: [
      { section: 'reading-writing' as const, questions: 27, timeLimitSeconds: 32 * 60 },
      { section: 'reading-writing' as const, questions: 27, timeLimitSeconds: 32 * 60 },
      { section: 'math' as const, questions: 22, timeLimitSeconds: 35 * 60 },
      { section: 'math' as const, questions: 22, timeLimitSeconds: 35 * 60 },
    ],
  },
  'reading-writing-only': {
    sections: [
      { section: 'reading-writing' as const, questions: 27, timeLimitSeconds: 32 * 60 },
      { section: 'reading-writing' as const, questions: 27, timeLimitSeconds: 32 * 60 },
    ],
  },
  'math-only': {
    sections: [
      { section: 'math' as const, questions: 22, timeLimitSeconds: 35 * 60 },
      { section: 'math' as const, questions: 22, timeLimitSeconds: 35 * 60 },
    ],
  },
  mini: {
    sections: [
      { section: 'reading-writing' as const, questions: 10, timeLimitSeconds: 12 * 60 },
      { section: 'math' as const, questions: 10, timeLimitSeconds: 14 * 60 },
    ],
  },
} as const;

export const SCALED_SCORE_TABLE = {
  'reading-writing': (raw: number, total: number) =>
    Math.round(200 + (raw / total) * 600),
  'math': (raw: number, total: number) =>
    Math.round(200 + (raw / total) * 600),
} as const;

export const DRILL_SESSION_LENGTH = 8;
export const WEAK_TOPIC_THRESHOLD = 0.65;
