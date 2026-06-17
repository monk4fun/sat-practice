// ─── SAT Structure ────────────────────────────────────────────────────────────

export type SATSection = 'reading-writing' | 'math';

export type ReadingWritingTopic =
  | 'information-and-ideas'
  | 'craft-and-structure'
  | 'expression-of-ideas'
  | 'standard-english-conventions';

export type MathTopic =
  | 'algebra'
  | 'advanced-math'
  | 'problem-solving-data-analysis'
  | 'geometry-trigonometry';

export type Topic = ReadingWritingTopic | MathTopic;

export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Question Bank ────────────────────────────────────────────────────────────

export interface Choice {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  section: SATSection;
  topic: Topic;
  difficulty: Difficulty;
  stimulus?: string;
  stem: string;
  choices: Choice[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  tags?: string[];
  qualityScore?: number;
  source?: string;
}

// ─── Progress Tracking ───────────────────────────────────────────────────────

export interface TopicProgress {
  topic: Topic;
  section: SATSection;
  totalAttempts: number;
  correctAttempts: number;
  accuracyRate: number;
  lastAttemptedAt: string;
}

export interface QuestionAttempt {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  attemptedAt: string;
  sessionId: string;
  mode: 'drill' | 'exam';
}

// ─── Drill Session ────────────────────────────────────────────────────────────

export type DrillStatus = 'setup' | 'active' | 'complete';

export interface DrillSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: DrillStatus;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  topicFilter?: Topic;
  sectionFilter?: SATSection;
}

// ─── Exam Session ─────────────────────────────────────────────────────────────

export type ExamStatus = 'setup' | 'active' | 'paused' | 'reviewing' | 'complete';

export type ExamMode = 'full' | 'reading-writing-only' | 'math-only' | 'mini';

export interface ExamSection {
  section: SATSection;
  questionIds: string[];
  timeLimitSeconds: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ExamSession {
  id: string;
  mode: ExamMode;
  startedAt: string;
  completedAt?: string;
  status: ExamStatus;
  sections: ExamSection[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  flaggedQuestions: string[];
  remainingSeconds: number;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface SectionScore {
  section: SATSection;
  correct: number;
  total: number;
  rawScore: number;
  scaledScore: number;
}

export interface ExamResult {
  examId: string;
  completedAt: string;
  sectionScores: SectionScore[];
  totalScaledScore: number;
  topicBreakdown: Record<Topic, { correct: number; total: number }>;
}

export interface DrillResult {
  drillId: string;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  topicsCovered: Topic[];
}

export interface DailyStats {
  date: string;
  drillsCompleted: number;
  totalQuestions: number;
  totalCorrect: number;
  dailyAccuracy: number;
  drillIds: string[];
}

export interface GeneratedQuestion {
  section: SATSection;
  topic: Topic;
  difficulty: Difficulty;
  stem: string;
  stimulus?: string;
  choices: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

// ─── App State (for Zustand) ──────────────────────────────────────────────────

export interface AppState {
  topicProgress: Record<Topic, TopicProgress>;
  questionAttempts: QuestionAttempt[];
  examResults: ExamResult[];
  drillResults: DrillResult[];
  failedQuestions: Record<string, any>;
  currentDrill: DrillSession | null;
  currentExam: ExamSession | null;
}
