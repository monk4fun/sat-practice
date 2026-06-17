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

  // Assign weights based on topic accuracy
  const weights = candidates.map((q) => computeWeight(q, topicProgress));

  // Weighted random sample without replacement
  return weightedSampleWithoutReplacement(candidates, weights, sampleSize);
}

function computeWeight(
  question: Question,
  topicProgress: Record<Topic, TopicProgress>
): number {
  const progress = topicProgress[question.topic];

  // Never attempted: high weight
  if (!progress || progress.totalAttempts === 0) return 2.0;

  const accuracy = progress.accuracyRate;

  // Weak topic (< 50%): highest weight
  if (accuracy < 0.5) return 4.0;

  // Below threshold (50–65%): elevated weight
  if (accuracy < 0.65) return 2.5;

  // Adequate (65–80%): normal weight
  if (accuracy < 0.8) return 1.0;

  // Strong (> 80%): lower weight
  return 0.5;
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
