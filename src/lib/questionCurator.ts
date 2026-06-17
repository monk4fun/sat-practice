import type { Question, Topic } from '../types';

/**
 * Question Curator for San's weak areas
 *
 * Strategy when batch generation fails:
 * 1. Prioritize existing questions by San's weak domains
 * 2. Enable on-demand generation from admin panel
 * 3. Provide curated selection optimized for weak areas
 */

export interface CurationStrategy {
  topic: Topic;
  priority: 1 | 2 | 3 | 4;
  targetCount: number;
  reason: string;
  difficultyAllocation: {
    easy: number;
    medium: number;
    hard: number;
  };
}

/**
 * San's curated study plan
 * Based on May 2026 SAT score:
 * - Information & Ideas: 420-480 (CRITICAL)
 * - Standard English Conventions: 420-480 (CRITICAL)
 * - Problem-Solving & Data Analysis: 550-600 (WEAK)
 */
export const CURATION_STRATEGY: CurationStrategy[] = [
  {
    topic: 'information-and-ideas',
    priority: 1,
    targetCount: 175,
    reason: 'Weakest R&W domain (420-480) - 26% of section',
    difficultyAllocation: { easy: 50, medium: 75, hard: 50 },
  },
  {
    topic: 'standard-english-conventions',
    priority: 1,
    targetCount: 175,
    reason: 'Weakest R&W domain (420-480) - 26% of section',
    difficultyAllocation: { easy: 50, medium: 75, hard: 50 },
  },
  {
    topic: 'problem-solving-data-analysis',
    priority: 2,
    targetCount: 100,
    reason: 'Weaker math domain (550-600) - 15% of section',
    difficultyAllocation: { easy: 30, medium: 45, hard: 25 },
  },
  {
    topic: 'craft-and-structure',
    priority: 3,
    targetCount: 70,
    reason: 'Average R&W domain (550-600) - maintain skills',
    difficultyAllocation: { easy: 20, medium: 30, hard: 20 },
  },
  {
    topic: 'expression-of-ideas',
    priority: 3,
    targetCount: 70,
    reason: 'Average R&W domain (550-600) - maintain skills',
    difficultyAllocation: { easy: 20, medium: 30, hard: 20 },
  },
  {
    topic: 'algebra',
    priority: 4,
    targetCount: 40,
    reason: 'Strong area (680-800) - light maintenance only',
    difficultyAllocation: { easy: 0, medium: 20, hard: 20 },
  },
  {
    topic: 'advanced-math',
    priority: 4,
    targetCount: 40,
    reason: 'Strong area (680-800) - light maintenance only',
    difficultyAllocation: { easy: 0, medium: 20, hard: 20 },
  },
  {
    topic: 'geometry-trigonometry',
    priority: 4,
    targetCount: 40,
    reason: 'Strong area (680-800) - light maintenance only',
    difficultyAllocation: { easy: 0, medium: 20, hard: 20 },
  },
];

/**
 * Curate existing questions to match San's weak areas
 */
export function curateQuestionBank(allQuestions: Question[]): {
  curated: Question[];
  summary: Record<Topic, { count: number; target: number; coverage: number }>;
  gaps: string[];
} {
  const curated: Question[] = [];
  const summary: Record<Topic, { count: number; target: number; coverage: number }> = {
    'information-and-ideas': { count: 0, target: 0, coverage: 0 },
    'craft-and-structure': { count: 0, target: 0, coverage: 0 },
    'expression-of-ideas': { count: 0, target: 0, coverage: 0 },
    'standard-english-conventions': { count: 0, target: 0, coverage: 0 },
    'algebra': { count: 0, target: 0, coverage: 0 },
    'advanced-math': { count: 0, target: 0, coverage: 0 },
    'problem-solving-data-analysis': { count: 0, target: 0, coverage: 0 },
    'geometry-trigonometry': { count: 0, target: 0, coverage: 0 },
  };

  // Process each curation strategy
  for (const strategy of CURATION_STRATEGY) {
    const topicQuestions = allQuestions
      .filter(q => q.topic === strategy.topic)
      .sort((a, b) => {
        // Prefer higher quality scores
        const qualityDiff = ((b as any).qualityScore || 0) - ((a as any).qualityScore || 0);
        if (qualityDiff !== 0) return qualityDiff;
        // Then prefer official sources
        return ((b as any).source === 'official' ? 1 : 0) - ((a as any).source === 'official' ? 1 : 0);
      });

    // Allocate by difficulty
    const allocated: Question[] = [];
    const difficulties = ['easy', 'medium', 'hard'] as const;

    for (const difficulty of difficulties) {
      const target = strategy.difficultyAllocation[difficulty];
      const matching = topicQuestions
        .filter(q => q.difficulty === difficulty && !allocated.includes(q))
        .slice(0, target);
      allocated.push(...matching);
    }

    curated.push(...allocated);

    // Track summary
    summary[strategy.topic] = {
      count: allocated.length,
      target: strategy.targetCount,
      coverage: Math.round((allocated.length / strategy.targetCount) * 100),
    };
  }

  // Identify gaps
  const gaps: string[] = [];
  for (const [topic, stats] of Object.entries(summary)) {
    if (stats.coverage < 50) {
      gaps.push(`${topic}: ${stats.count}/${stats.target} (${stats.coverage}% coverage)`);
    }
  }

  return { curated, summary, gaps };
}

/**
 * Generate admin instructions for filling gaps
 */
export function generateFillGapsInstructions(
  gaps: string[]
): {
  recommendation: string;
  steps: string[];
  priority: 'critical' | 'high' | 'normal';
} {
  if (gaps.length === 0) {
    return {
      recommendation: 'Question bank is well-curated for weak areas',
      steps: [
        'Current selection covers weak areas adequately',
        'Start drilling immediately to improve weak domains',
        'Monitor progress in Information & Ideas and Conventions',
      ],
      priority: 'normal',
    };
  }

  const hasP1Gap = gaps.some(g =>
    g.includes('information-and-ideas') || g.includes('standard-english-conventions')
  );

  return {
    recommendation: hasP1Gap
      ? 'Critical: Need more questions in weakest areas'
      : 'Important: Additional questions would help in weaker domains',
    steps: [
      '1. Go to Admin Panel → Question Generation',
      '2. Click "Generate Missing Questions" (requires valid Claude API key)',
      '3. System will auto-fill gaps in priority order',
      '4. Generated questions added to question bank',
      `   Gaps to fill: ${gaps.join('; ')}`,
      '5. Start drilling to practice weak areas',
    ],
    priority: hasP1Gap ? 'critical' : 'high',
  };
}

/**
 * Calculate adaptive weights from curation strategy
 * Used by selectAdaptiveQuestions algorithm
 */
export function getAdaptiveWeightsFromCuration(): Record<Topic, number> {
  const weights: Record<Topic, number> = {
    'information-and-ideas': 5.0,
    'standard-english-conventions': 5.0,
    'problem-solving-data-analysis': 2.5,
    'craft-and-structure': 2.0,
    'expression-of-ideas': 2.0,
    'algebra': 0.3,
    'advanced-math': 0.3,
    'geometry-trigonometry': 0.3,
  };

  return weights;
}
