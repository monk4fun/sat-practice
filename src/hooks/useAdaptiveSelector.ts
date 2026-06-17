import type { Question, Topic, SATSection, TopicProgress } from '../types';

export function selectAdaptiveQuestions(
  allQuestions: Question[],
  topicProgress: Record<Topic, TopicProgress>,
  options: {
    count: number;
    topicFilter?: Topic;
    sectionFilter?: SATSection;
    recentAttempts?: string[];
  }
): Question[] {
  // Filter candidates
  let candidates = allQuestions.filter((q) => {
    if (options.topicFilter && q.topic !== options.topicFilter) return false;
    if (options.sectionFilter && q.section !== options.sectionFilter) return false;
    if (options.recentAttempts?.includes(q.id)) return false;
    return true;
  });

  // Ensure we don't try to sample more than available
  const sampleSize = Math.min(options.count, candidates.length);
  if (sampleSize === 0) return [];

  // Assign weights based on topic accuracy (with quality score boost)
  const weights = candidates.map((q) => {
    const baseWeight = computeWeight(q, topicProgress);
    return applyQualityBoost(baseWeight, (q as any).qualityScore);
  });

  // Weighted random sample without replacement
  return weightedSampleWithoutReplacement(candidates, weights, sampleSize);
}

function computeWeight(
  question: Question,
  topicProgress: Record<Topic, TopicProgress>
): number {
  const progress = topicProgress[question.topic];

  // Never attempted: high weight
  if (!progress || progress.totalAttempts === 0) {
    const baseWeight = 2.0;
    // For new topics: prioritize easy questions first
    return applyDifficultyModifier(baseWeight, 0, question.difficulty);
  }

  const accuracy = progress.accuracyRate;
  let baseWeight: number;

  // Determine base weight by accuracy
  if (accuracy < 0.5) {
    baseWeight = 4.0; // Weak topic (< 50%): highest weight
  } else if (accuracy < 0.65) {
    baseWeight = 2.5; // Below threshold (50–65%): elevated weight
  } else if (accuracy < 0.8) {
    baseWeight = 1.0; // Adequate (65–80%): normal weight
  } else {
    baseWeight = 0.5; // Strong (> 80%): lower weight
  }

  // PRIORITY 1: Recency penalty - boost weight if strong topic hasn't been attempted recently
  if (accuracy >= 0.8) {
    const daysSinceLastAttempt = getDaysSinceLastAttempt(progress.lastAttemptedAt);
    if (daysSinceLastAttempt >= 7) {
      // Increase weight for maintenance: strong topics lose weight over time
      const recencyBoost = Math.min(2.0, baseWeight + (daysSinceLastAttempt * 0.08));
      baseWeight = recencyBoost;
    }
  }

  // PRIORITY 2: Difficulty modifier - adjust weight based on difficulty and accuracy
  const finalWeight = applyDifficultyModifier(baseWeight, accuracy, question.difficulty);

  return finalWeight;
}

// Helper: Calculate days since last attempt
function getDaysSinceLastAttempt(lastAttemptedAt: string): number {
  if (!lastAttemptedAt) return 999; // Never attempted, treat as very old
  const lastDate = new Date(lastAttemptedAt).getTime();
  const now = new Date().getTime();
  const millisPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now - lastDate) / millisPerDay);
}

// Helper: Apply difficulty-based weight modifier
function applyDifficultyModifier(
  baseWeight: number,
  accuracy: number,
  difficulty: string
): number {
  // Difficulty adjustment based on accuracy:
  // - Weak students (< 65%): need easy questions to build confidence (1.5x easy, 1.0x medium, 0.3x hard)
  // - Strong students (>= 65%): need harder questions to maintain challenge (0.5x easy, 1.0x medium, 1.5x hard)
  const difficultyMultiplier: Record<string, number> = {};

  if (accuracy < 0.65) {
    // Weak student: prioritize easy, medium is normal, hard is rare
    difficultyMultiplier['easy'] = 1.5;
    difficultyMultiplier['medium'] = 1.0;
    difficultyMultiplier['hard'] = 0.3;
  } else if (accuracy >= 0.8) {
    // Strong student: skip easy, keep medium, prioritize hard
    difficultyMultiplier['easy'] = 0.5;
    difficultyMultiplier['medium'] = 1.0;
    difficultyMultiplier['hard'] = 1.5;
  } else {
    // Moderate student (65–80%): balanced difficulty
    difficultyMultiplier['easy'] = 0.8;
    difficultyMultiplier['medium'] = 1.2;
    difficultyMultiplier['hard'] = 1.0;
  }

  return baseWeight * (difficultyMultiplier[difficulty] || 1.0);
}

// Helper: Apply quality score boost (optional feature)
// Questions rated higher on SAT closeness get prioritized
function applyQualityBoost(weight: number, qualityScore?: number): number {
  if (!qualityScore) return weight;
  // Quality scores 1-5: boost by 10% per point above 3
  // 3.0 = 1.0x, 4.0 = 1.1x, 5.0 = 1.2x
  const boost = 1.0 + Math.max(0, (qualityScore - 3) * 0.1);
  return weight * boost;
}

function weightedSampleWithoutReplacement<T>(
  items: T[],
  weights: number[],
  count: number
): T[] {
  const result: T[] = [];
  const remainingItems = [...items];
  const remainingWeights = [...weights];

  const n = Math.min(count, items.length);

  for (let i = 0; i < n; i++) {
    const totalWeight = remainingWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let j = 0; j < remainingWeights.length; j++) {
      random -= remainingWeights[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    result.push(remainingItems[selectedIndex]);
    remainingItems.splice(selectedIndex, 1);
    remainingWeights.splice(selectedIndex, 1);
  }

  return result;
}
