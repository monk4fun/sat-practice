import type { Question, Topic, Difficulty, SATSection } from '../types';

const CLAUDE_API_KEY = typeof window !== 'undefined'
  ? window.location.hostname === 'localhost'
    ? import.meta.env.VITE_CLAUDE_API_KEY
    : undefined
  : import.meta.env.VITE_CLAUDE_API_KEY;

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

async function generateQuestionsWithClaude(
  topic: Topic,
  difficulty: Difficulty,
  count: number = 1
): Promise<GeneratedQuestion[]> {
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY environment variable is not set');
  }

  const topicDescriptions: Record<Topic, string> = {
    'information-and-ideas': 'reading comprehension focusing on main ideas and supporting details',
    'craft-and-structure': 'reading comprehension about writing style, structure, and rhetorical devices',
    'expression-of-ideas': 'grammar and writing quality for clear expression',
    'standard-english-conventions': 'grammar rules, punctuation, and syntax',
    'algebra': 'algebraic equations, systems, and problem-solving',
    'advanced-math': 'functions, polynomials, exponentials, and advanced algebra',
    'problem-solving-data-analysis': 'statistics, probability, and data interpretation',
    'geometry-trigonometry': 'geometry, trigonometry, and spatial reasoning',
  };

  const difficultyLevel = {
    easy: 'straightforward and foundational',
    medium: 'requires careful reading/calculation and some strategic thinking',
    hard: 'complex, requires multiple steps and advanced reasoning',
  }[difficulty];

  const sectionMap: Record<Topic, SATSection> = {
    'information-and-ideas': 'reading-writing',
    'craft-and-structure': 'reading-writing',
    'expression-of-ideas': 'reading-writing',
    'standard-english-conventions': 'reading-writing',
    'algebra': 'math',
    'advanced-math': 'math',
    'problem-solving-data-analysis': 'math',
    'geometry-trigonometry': 'math',
  };

  const section = sectionMap[topic];
  const isReadingWriting = section === 'reading-writing';

  const prompt = `Generate ${count} high-quality SAT ${section} question(s) about "${topicDescriptions[topic]}".

Difficulty level: ${difficultyLevel}

CRITICAL: FOLLOW COLLEGE BOARD DESIGN STANDARDS

${
  isReadingWriting
    ? `
READING & WRITING DESIGN RULES:
- Passage: EXACTLY 25-150 words (count words), one clear thought
- Stem: Direct question about passage meaning, tone, or mechanics
- DISTRACTORS must reflect REAL STUDENT ERRORS:
  * Use passage language but misrepresent meaning
  * Include partially correct facts
  * Echo ideas not supported by passage
  * Trap with absolute qualifiers (always, never, all)
  * Present scope ambiguities or false implications
  * Preserve tone while changing meaning
- Each distractor must be plausible to students who misread or misconstrue
- Avoid "obviously wrong" answers
`
    : `
MATH DESIGN RULES:
- Problem must be clearly stated and unambiguous
- Include all necessary information (no missing data)
- DISTRACTORS must reflect REAL STUDENT ERRORS:
  * Intermediate results (e.g., side length when answer asks for area)
  * Inverted fractions (3/5 vs 5/3)
  * Scale misreading on graphs/tables
  * Solving for wrong variable (x when answer asks for 2x)
  * Common computational mistakes (+/- errors, order of operations)
  * Misreading what problem asks for
  * Off-by-one errors in sequences
- Distractors should be answers students get if they make one common mistake
`
}

GENERAL REQUIREMENTS:
- Make questions indistinguishable from official SAT questions
- Ensure difficulty level is accurate (${difficultyLevel})
- Write explanation that explains WHY correct answer works and WHY each distractor is wrong
- Use clear, academic language
- No trick wording—difficulty comes from reasoning, not semantics

Respond with ONLY valid JSON array (no markdown, no extra text):
[
  {
    ${isReadingWriting ? '"stimulus": "25-150 word passage here",\n    ' : ''}"stem": "question text",
    "choices": [
      {"id": "A", "text": "option"},
      {"id": "B", "text": "option"},
      {"id": "C", "text": "option"},
      {"id": "D", "text": "option"}
    ],
    "correctAnswer": "A",
    "explanation": "why A is correct and why B, C, D are wrong"
  }
]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    const questions = JSON.parse(content);

    return (Array.isArray(questions) ? questions : [questions]).map((q: any) => ({
      section,
      topic,
      difficulty,
      stimulus: q.stimulus,
      stem: q.stem,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function generateMultipleQuestions(
  topic: Topic,
  difficulty: Difficulty,
  count: number = 5
): Promise<GeneratedQuestion[]> {
  const allQuestions: GeneratedQuestion[] = [];

  // Generate in batches to avoid API issues
  const batchSize = 1;
  for (let i = 0; i < count; i += batchSize) {
    const batch = Math.min(batchSize, count - i);
    const questions = await generateQuestionsWithClaude(topic, difficulty, batch);
    allQuestions.push(...questions);
  }

  return allQuestions;
}

export function convertToQuestion(generated: GeneratedQuestion, id: string): Question {
  return {
    id,
    section: generated.section,
    topic: generated.topic,
    difficulty: generated.difficulty,
    stimulus: generated.stimulus,
    stem: generated.stem,
    choices: generated.choices,
    correctAnswer: generated.correctAnswer,
    explanation: generated.explanation,
  };
}
