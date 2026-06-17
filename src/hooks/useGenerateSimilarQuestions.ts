import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Question } from '../types';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

interface GeneratedSimilarQuestion extends Question {
  relatedToQuestionId: string;
}

export function useGenerateSimilarQuestions() {
  const store = useAppStore();
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const generateForFailedQuestions = async () => {
      // Get recently failed questions (from last 5 attempts)
      const recentAttempts = store.questionAttempts.slice(-5);
      const failedAttempts = recentAttempts.filter(a => !a.isCorrect);

      for (const attempt of failedAttempts) {
        // Skip if already processing this question
        if (processingRef.current.has(attempt.questionId)) continue;
        processingRef.current.add(attempt.questionId);

        // Find the original question to understand what it's testing
        const allQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
        const originalQuestion = allQuestions.find((q: Question) => q.id === attempt.questionId);

        if (!originalQuestion) {
          processingRef.current.delete(attempt.questionId);
          continue;
        }

        try {
          const similar = await generateSimilarQuestions(originalQuestion, attempt.questionId);
          if (similar.length > 0) {
            // Add to custom questions
            const existing = JSON.parse(localStorage.getItem('customQuestions') || '[]');
            existing.push(...similar);
            localStorage.setItem('customQuestions', JSON.stringify(existing));

            console.log(
              `✅ Generated ${similar.length} similar questions for failed question "${originalQuestion.stem.substring(0, 50)}..."`
            );
          }
        } catch (error) {
          console.error('Similar question generation failed:', error);
        } finally {
          processingRef.current.delete(attempt.questionId);
        }
      }
    };

    // Check every 30 seconds for failed questions
    const interval = setInterval(generateForFailedQuestions, 30000);
    return () => clearInterval(interval);
  }, [store.questionAttempts]);
}

async function generateSimilarQuestions(
  question: Question,
  originalQuestionId: string
): Promise<GeneratedSimilarQuestion[]> {
  if (!CLAUDE_API_KEY) return [];

  try {
    const prompt = buildSimilarQuestionPrompt(question);

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
      console.error('Claude API error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // Parse JSON response
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed) ? parsed : [parsed];

    return questions
      .filter(q => q.stem && q.choices?.length === 4 && q.correctAnswer && q.explanation)
      .map((q: any, index: number) => ({
        id: `similar-${originalQuestionId}-${Date.now()}-${index}`,
        section: question.section,
        topic: question.topic,
        difficulty: question.difficulty,
        stem: q.stem,
        choices: q.choices.map((c: any) => ({ id: c.id, text: c.text })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        stimulus: q.stimulus,
        qualityScore: 4,
        source: 'ai-similar',
        relatedToQuestionId: originalQuestionId,
      }));
  } catch (error) {
    console.error('Similar question parsing failed:', error);
    return [];
  }
}

function buildSimilarQuestionPrompt(question: Question): string {
  const sectionType = question.section === 'math' ? 'Math' : 'Reading & Writing';
  const skillDescription = getSkillDescription(question.topic);

  return `Generate 1-2 SAT ${sectionType} questions that test the EXACT SAME skill/concept as the following question.

Original Question (Difficulty: ${question.difficulty}):
${question.stimulus ? `Stimulus: ${question.stimulus}\n` : ''}
Stem: ${question.stem}
Choices: ${question.choices.map(c => `${c.id}) ${c.text}`).join('; ')}
Correct Answer: ${question.correctAnswer}

Skill Being Tested: ${skillDescription}

CRITICAL REQUIREMENTS:
1. Generate questions testing the SAME concept/skill
2. Change the numbers, context, or wording (but NOT the underlying skill)
3. Same difficulty level (${question.difficulty})
4. Same section and topic
5. Format EXACTLY as JSON array (NO markdown, NO code blocks)
6. Each question must have: stem, choices (A-D), correctAnswer, explanation${question.stimulus ? ', stimulus' : ''}
7. Distractors should be plausible (common mistakes)

Example: If original tests "solving absolute value equations," new questions should also test that, but with different numbers/contexts.

Return ONLY valid JSON array:
[
  {
    ${question.stimulus ? '"stimulus": "...",\n    ' : ''}"stem": "...",
    "choices": [
      {"id": "A", "text": "..."},
      {"id": "B", "text": "..."},
      {"id": "C", "text": "..."},
      {"id": "D", "text": "..."}
    ],
    "correctAnswer": "A",
    "explanation": "..."
  }
]`;
}

function getSkillDescription(topic: string): string {
  const skills: Record<string, string> = {
    'algebra': 'solving linear and quadratic equations, working with expressions',
    'advanced-math': 'exponents, radicals, functions, sequences',
    'problem-solving-data-analysis': 'percentages, averages, statistics, ratios, data interpretation',
    'geometry-trigonometry': 'angles, triangles, circles, area/volume, coordinate geometry',
    'information-and-ideas': 'understanding main ideas, supporting details, and inferences',
    'craft-and-structure': 'tone, word choice, syntax, rhetorical devices, structure',
    'expression-of-ideas': 'clarity, concision, coherence, eliminating redundancy',
    'standard-english-conventions': 'grammar, punctuation, subject-verb agreement, parallelism',
  };
  return skills[topic] || 'the concept in the original question';
}
