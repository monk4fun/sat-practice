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

    Each question should:
    ${
      isReadingWriting
        ? `
    - Include a brief passage (1-3 sentences) if appropriate
    - Have a clear stem asking what the passage suggests/means
    - Include 4 multiple choice options (A, B, C, D)
    - Have ONE correct answer and 3 plausible distractors
    - Include a detailed explanation of why the correct answer is right
    `
        : `
    - Be a standalone problem (no passage needed)
    - Have clear numerical or logical content
    - Include 4 multiple choice options (A, B, C, D)
    - Have ONE correct answer and 3 plausible distractors
    - Include a detailed explanation showing the solution
    `
    }

    Respond with ONLY valid JSON array (no markdown, no extra text). Each object should have:
    {
      "stimulus": "passage text (only for reading questions, omit for math)",
      "stem": "the question text",
      "choices": [
        {"id": "A", "text": "option text"},
        {"id": "B", "text": "option text"},
        {"id": "C", "text": "option text"},
        {"id": "D", "text": "option text"}
      ],
      "correctAnswer": "A",
      "explanation": "detailed explanation"
    }`;

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
