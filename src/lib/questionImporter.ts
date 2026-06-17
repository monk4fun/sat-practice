import type { Question, Topic, SATSection } from '../types';

// Khan Academy topics available for mapping
// 'algebra', 'advanced-math', 'problem-solving-data-analysis', 'geometry-trigonometry'

export interface ImportedQuestionSource {
  source: 'khan-academy' | 'opensat' | 'college-board';
  url: string;
  title: string;
  description: string;
  questionCount: number;
}

export const AVAILABLE_SOURCES: ImportedQuestionSource[] = [
  {
    source: 'opensat',
    url: 'https://pinesat.com/api/questions',
    title: 'OpenSAT API',
    description: 'Community-curated, open-source SAT questions with public API',
    questionCount: 500, // Approximate
  },
  {
    source: 'khan-academy',
    url: 'https://www.khanacademy.org/test-prep/sat',
    title: 'Khan Academy SAT Prep',
    description: 'Official College Board partner with 1,000+ questions (requires web scraping)',
    questionCount: 1000,
  },
  {
    source: 'college-board',
    url: 'https://satsuite.collegeboard.org/practice',
    title: 'College Board Official Practice',
    description: 'Official SAT questions (requires institutional API access)',
    questionCount: 8000,
  },
];

/**
 * Fetch questions from OpenSAT public API
 * This is the easiest and most legal approach
 */
export async function importFromOpenSAT(): Promise<Question[]> {
  try {
    const response = await fetch('https://pinesat.com/api/questions');
    const data = await response.json();

    // Map OpenSAT format to our Question type
    const questions: Question[] = (data.questions || data || []).map((q: any, index: number) => ({
      id: `opensat-${index}`,
      section: q.section === 'Math' ? 'math' : 'reading-writing',
      topic: mapOpenSATTopicToOurs(q.topic),
      difficulty: mapDifficulty(q.difficulty),
      stem: q.question || q.stem,
      stimulus: q.passage || q.context,
      choices: [
        { id: 'A' as const, text: q.optionA || q.choices?.[0] },
        { id: 'B' as const, text: q.optionB || q.choices?.[1] },
        { id: 'C' as const, text: q.optionC || q.choices?.[2] },
        { id: 'D' as const, text: q.optionD || q.choices?.[3] },
      ],
      correctAnswer: (q.answer || q.correct_answer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation || q.rationale || 'See solution',
    }));

    return questions;
  } catch (error) {
    console.error('Error importing from OpenSAT:', error);
    throw new Error('Failed to fetch questions from OpenSAT API');
  }
}

/**
 * Khan Academy requires special handling since they don't have a public API
 * This provides instructions for institutional access
 */
export async function importFromKhanAcademy(csv: string): Promise<Question[]> {
  // This requires the user to manually export from Khan Academy as CSV
  // Parse the CSV format they provide
  const lines = csv.split('\n');
  const questions: Question[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Expected CSV format: questionId, topic, difficulty, stem, choiceA, choiceB, choiceC, choiceD, answer, explanation
    const parts = line.split(',');
    if (parts.length < 10) continue;

    questions.push({
      id: `khan-${i}`,
      section: determineSection(parts[1]),
      topic: parts[1] as Topic,
      difficulty: mapDifficulty(parts[2]),
      stem: parts[3],
      stimulus: parts[9] || undefined,
      choices: [
        { id: 'A' as const, text: parts[4] },
        { id: 'B' as const, text: parts[5] },
        { id: 'C' as const, text: parts[6] },
        { id: 'D' as const, text: parts[7] },
      ],
      correctAnswer: parts[8].toUpperCase() as 'A' | 'B' | 'C' | 'D',
      explanation: parts[9] || 'See Khan Academy explanation',
    });
  }

  return questions;
}

/**
 * College Board institutional API import
 * Requires valid API credentials
 */
export async function importFromCollegeBoard(apiKey: string): Promise<Question[]> {
  try {
    // This would use College Board's K-12 Reporting Portal API
    // Documentation: https://satsuite.collegeboard.org/help-center/k12-reporting-portal/exporting-downloading-data/api-access
    const endpoint = 'https://api.collegeboard.org/v1/student-questions';

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`College Board API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Parse and convert College Board format to our Question type
    return (data.questions || []).map((q: any) => ({
      id: `cb-${q.id}`,
      section: q.section as SATSection,
      topic: q.topic as Topic,
      difficulty: q.difficulty,
      stem: q.question,
      stimulus: q.passage,
      choices: q.choices,
      correctAnswer: q.answer,
      explanation: q.explanation,
    }));
  } catch (error) {
    console.error('Error importing from College Board:', error);
    throw new Error('Failed to fetch questions from College Board API. Verify credentials.');
  }
}

/**
 * Validate imported questions before adding to question bank
 */
export function validateQuestion(q: any): string[] {
  const errors: string[] = [];

  if (!q.stem || typeof q.stem !== 'string') {
    errors.push('Question stem is missing or invalid');
  }

  if (!q.choices || q.choices.length !== 4) {
    errors.push('Question must have exactly 4 choices');
  }

  if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
    errors.push('Correct answer must be A, B, C, or D');
  }

  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }

  if (!['reading-writing', 'math'].includes(q.section)) {
    errors.push('Section must be reading-writing or math');
  }

  return errors;
}

// Helper functions
function mapDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('hard')) return 'hard';
  if (d.includes('medium')) return 'medium';
  return 'easy';
}

function determineSection(topic: string): 'reading-writing' | 'math' {
  const mathTopics = ['algebra', 'advanced-math', 'problem-solving', 'geometry', 'trigonometry'];
  return mathTopics.some(t => topic.toLowerCase().includes(t)) ? 'math' : 'reading-writing';
}

function mapOpenSATTopicToOurs(topic: string): Topic {
  const topicMap: Record<string, Topic> = {
    'algebra': 'algebra',
    'geometry': 'geometry-trigonometry',
    'trigonometry': 'geometry-trigonometry',
    'reading': 'information-and-ideas',
    'writing': 'standard-english-conventions',
    'math': 'algebra',
  };

  for (const [key, value] of Object.entries(topicMap)) {
    if (topic.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'algebra'; // Default fallback
}
