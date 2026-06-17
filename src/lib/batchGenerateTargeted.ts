import { generateTargetedQuestions } from './targetedQuestionGenerator';
import type { Topic, Difficulty } from '../types';

/**
 * Batch generation plan for targeted SAT questions
 * Prioritizes weak areas based on San's May 2026 SAT score
 * Goal: 500+ new high-quality questions
 */
export const BATCH_GENERATION_PLAN: Array<{
  topic: Topic;
  difficulty: Difficulty;
  count: number;
  priority: number;
  reason: string;
}> = [
  // PRIORITY 1: Weakest R&W subarea (420-480 range)
  // Information & Ideas - 26% of R&W section = critical
  {
    topic: 'information-and-ideas',
    difficulty: 'easy',
    count: 50,
    priority: 1,
    reason: 'Build foundation in weakest area',
  },
  {
    topic: 'information-and-ideas',
    difficulty: 'medium',
    count: 75,
    priority: 1,
    reason: 'Most common difficulty on SAT (target difficulty)',
  },
  {
    topic: 'information-and-ideas',
    difficulty: 'hard',
    count: 50,
    priority: 1,
    reason: 'Challenge after mastering medium',
  },

  // PRIORITY 1: Weakest R&W subarea (420-480 range)
  // Standard English Conventions - 26% of R&W section = critical
  {
    topic: 'standard-english-conventions',
    difficulty: 'easy',
    count: 50,
    priority: 1,
    reason: 'Build foundation in weakest area',
  },
  {
    topic: 'standard-english-conventions',
    difficulty: 'medium',
    count: 75,
    priority: 1,
    reason: 'Most common difficulty on SAT (target difficulty)',
  },
  {
    topic: 'standard-english-conventions',
    difficulty: 'hard',
    count: 50,
    priority: 1,
    reason: 'Challenge after mastering medium',
  },

  // PRIORITY 2: Problem-Solving & Data Analysis (550-600 range)
  // Only 15% of math section but clear weakness
  {
    topic: 'problem-solving-data-analysis',
    difficulty: 'easy',
    count: 30,
    priority: 2,
    reason: 'Weaker math subarea - build skills',
  },
  {
    topic: 'problem-solving-data-analysis',
    difficulty: 'medium',
    count: 45,
    priority: 2,
    reason: 'Standard difficulty practice',
  },
  {
    topic: 'problem-solving-data-analysis',
    difficulty: 'hard',
    count: 25,
    priority: 2,
    reason: 'Stretch difficulty',
  },

  // PRIORITY 3: Average R&W subareas (550-600 range)
  // Craft & Structure - maintain and improve
  {
    topic: 'craft-and-structure',
    difficulty: 'easy',
    count: 20,
    priority: 3,
    reason: 'Maintenance - already average',
  },
  {
    topic: 'craft-and-structure',
    difficulty: 'medium',
    count: 30,
    priority: 3,
    reason: 'Maintenance - standard difficulty',
  },
  {
    topic: 'craft-and-structure',
    difficulty: 'hard',
    count: 20,
    priority: 3,
    reason: 'Maintenance - challenge problems',
  },

  // Expression of Ideas - maintain and improve
  {
    topic: 'expression-of-ideas',
    difficulty: 'easy',
    count: 20,
    priority: 3,
    reason: 'Maintenance - already average',
  },
  {
    topic: 'expression-of-ideas',
    difficulty: 'medium',
    count: 30,
    priority: 3,
    reason: 'Maintenance - standard difficulty',
  },
  {
    topic: 'expression-of-ideas',
    difficulty: 'hard',
    count: 20,
    priority: 3,
    reason: 'Maintenance - challenge problems',
  },

  // PRIORITY 4: Strong math areas (680-800 range)
  // Only medium/hard - no easy questions (he's already excellent)
  {
    topic: 'algebra',
    difficulty: 'medium',
    count: 20,
    priority: 4,
    reason: 'Strong area - maintenance at appropriate level',
  },
  {
    topic: 'algebra',
    difficulty: 'hard',
    count: 20,
    priority: 4,
    reason: 'Strong area - stretch and challenge',
  },

  {
    topic: 'advanced-math',
    difficulty: 'medium',
    count: 20,
    priority: 4,
    reason: 'Strong area - maintenance at appropriate level',
  },
  {
    topic: 'advanced-math',
    difficulty: 'hard',
    count: 20,
    priority: 4,
    reason: 'Strong area - stretch and challenge',
  },

  {
    topic: 'geometry-trigonometry',
    difficulty: 'medium',
    count: 20,
    priority: 4,
    reason: 'Strong area - maintenance at appropriate level',
  },
  {
    topic: 'geometry-trigonometry',
    difficulty: 'hard',
    count: 20,
    priority: 4,
    reason: 'Strong area - stretch and challenge',
  },
];

export async function generateAllTargetedQuestions() {
  console.log('🚀 Starting batch generation of 500+ targeted SAT questions...');

  const allGenerated = [];
  let successCount = 0;
  let failureCount = 0;

  // Group by priority to show progress
  const byPriority = new Map<number, typeof BATCH_GENERATION_PLAN>();
  BATCH_GENERATION_PLAN.forEach((item) => {
    if (!byPriority.has(item.priority)) {
      byPriority.set(item.priority, []);
    }
    byPriority.get(item.priority)!.push(item);
  });

  // Generate in order of priority
  for (const [priority, items] of byPriority) {
    console.log(
      `\n📊 Priority ${priority} (${items.length} batches, ${items.reduce((sum, i) => sum + i.count, 0)} questions)`
    );

    for (const item of items) {
      try {
        console.log(
          `  Generating ${item.count} ${item.difficulty} ${item.topic} questions...`
        );
        const generated = await generateTargetedQuestions(
          item.topic,
          item.difficulty,
          item.count
        );

        if (generated.length > 0) {
          allGenerated.push(...generated);
          successCount += generated.length;
          console.log(`    ✓ Generated ${generated.length} questions`);
        } else {
          failureCount++;
          console.log(`    ✗ Failed to generate - may need API key`);
        }

        // Rate limiting: wait 500ms between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        failureCount++;
        console.error(`    Error:`, error);
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Total generated: ${successCount} questions`);
  console.log(`   Failures: ${failureCount} batches`);

  // Save to localStorage
  if (allGenerated.length > 0) {
    try {
      const existing = localStorage.getItem('customQuestions');
      const existingQuestions = existing ? JSON.parse(existing) : [];
      const combined = [...existingQuestions, ...allGenerated];

      localStorage.setItem('customQuestions', JSON.stringify(combined));
      console.log(
        `\n💾 Saved ${allGenerated.length} new questions to localStorage`
      );
      console.log(`   Total questions in bank: ${combined.length}`);

      return allGenerated;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return [];
    }
  }

  return [];
}

// Summary of generation plan
export function getGenerationSummary(): {
  totalQuestions: number;
  byTopic: Record<string, number>;
  byDifficulty: Record<string, number>;
  byPriority: Record<number, number>;
} {
  let totalQuestions = 0;
  const byTopic: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byPriority: Record<number, number> = {};

  BATCH_GENERATION_PLAN.forEach((item) => {
    totalQuestions += item.count;
    byTopic[item.topic] = (byTopic[item.topic] || 0) + item.count;
    byDifficulty[item.difficulty] = (byDifficulty[item.difficulty] || 0) + item.count;
    byPriority[item.priority] = (byPriority[item.priority] || 0) + item.count;
  });

  return { totalQuestions, byTopic, byDifficulty, byPriority };
}
