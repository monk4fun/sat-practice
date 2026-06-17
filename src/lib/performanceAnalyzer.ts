import type { Topic, TopicProgress, DrillResult, ExamResult, SATSection } from '../types';

export interface WeakTopicAnalysis {
  topic: Topic;
  section: SATSection;
  accuracy: number;
  attemptCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
  generationUrgency: 'urgent' | 'needed' | 'optional' | 'none';
}

export interface PerformanceGaps {
  weakTopics: WeakTopicAnalysis[];
  improvingTopics: Topic[];
  masteredTopics: Topic[];
  recentPerformanceChange: number; // -1 to 1
}

export function analyzeDrillPerformance(
  _drillResult: DrillResult,
  topicProgress: Record<Topic, TopicProgress>
): PerformanceGaps {
  const gaps = identifyWeakTopics(topicProgress);

  // Calculate recent performance trend
  const recentChange = calculatePerformanceTrend(topicProgress);

  return {
    weakTopics: gaps.filter(t => t.priority !== 'low'),
    improvingTopics: gaps
      .filter(t => t.accuracy > 0.65 && t.accuracy < 0.8)
      .map(t => t.topic),
    masteredTopics: gaps
      .filter(t => t.accuracy >= 0.8)
      .map(t => t.topic),
    recentPerformanceChange: recentChange,
  };
}

export function analyzeExamPerformance(
  _examResult: ExamResult,
  topicProgress: Record<Topic, TopicProgress>
): PerformanceGaps {
  // Exams are high-stakes, so they should trigger more aggressive generation
  const gaps = identifyWeakTopics(topicProgress);

  // Boost urgency for exam-identified weak topics
  const boostedGaps = gaps.map(gap => ({
    ...gap,
    generationUrgency:
      gap.accuracy < 0.5 ? 'urgent' as const :
      gap.accuracy < 0.65 ? 'needed' as const :
      gap.accuracy < 0.8 ? 'optional' as const :
      'none' as const,
  }));

  return {
    weakTopics: boostedGaps.filter(t => t.priority !== 'low'),
    improvingTopics: boostedGaps
      .filter(t => t.accuracy > 0.65 && t.accuracy < 0.8)
      .map(t => t.topic),
    masteredTopics: boostedGaps
      .filter(t => t.accuracy >= 0.8)
      .map(t => t.topic),
    recentPerformanceChange: calculatePerformanceTrend(topicProgress),
  };
}

function identifyWeakTopics(topicProgress: Record<Topic, TopicProgress>): WeakTopicAnalysis[] {
  return Object.values(topicProgress).map(progress => ({
    topic: progress.topic,
    section: progress.section,
    accuracy: progress.accuracyRate,
    attemptCount: progress.totalAttempts,
    priority: prioritizeByAccuracy(progress.accuracyRate, progress.totalAttempts),
    suggestedDifficulty: suggestDifficultyForTopic(progress.accuracyRate),
    generationUrgency: getGenerationUrgency(progress.accuracyRate),
  }));
}

function prioritizeByAccuracy(accuracy: number, attempts: number): 'critical' | 'high' | 'medium' | 'low' {
  if (attempts < 3) return 'medium'; // Not enough data
  if (accuracy < 0.5) return 'critical';
  if (accuracy < 0.65) return 'high';
  if (accuracy < 0.8) return 'medium';
  return 'low';
}

function suggestDifficultyForTopic(accuracy: number): 'easy' | 'medium' | 'hard' {
  if (accuracy < 0.5) return 'easy'; // Build basics first
  if (accuracy < 0.65) return 'easy'; // Still need foundational work
  if (accuracy < 0.8) return 'medium'; // Progress to intermediate
  return 'hard'; // Challenge to reach mastery
}

function getGenerationUrgency(accuracy: number): 'urgent' | 'needed' | 'optional' | 'none' {
  if (accuracy === 0) return 'needed'; // Never attempted
  if (accuracy < 0.5) return 'urgent'; // Critical weakness
  if (accuracy < 0.65) return 'needed'; // Significant weakness
  if (accuracy < 0.8) return 'optional'; // Could use more practice
  return 'none'; // Mastered
}

function calculatePerformanceTrend(topicProgress: Record<Topic, TopicProgress>): number {
  const recentAccuracies = Object.values(topicProgress)
    .filter(p => p.totalAttempts >= 3)
    .map(p => p.accuracyRate);

  if (recentAccuracies.length === 0) return 0;

  const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;

  // Return normalized trend: -1 (declining) to +1 (improving)
  // This is a simplified trend - in production, track actual recent attempts
  return Math.min(1, Math.max(-1, (avgAccuracy - 0.65) / 0.35));
}

export function shouldGenerateQuestions(gaps: PerformanceGaps, lastGenerationTime: number): boolean {
  // Generate if:
  // 1. Has urgent or needed generation urgency topics
  // 2. Haven't generated in 30+ minutes
  // 3. Performance is declining

  const hasUrgentTopics = gaps.weakTopics.some(t =>
    t.generationUrgency === 'urgent' || t.generationUrgency === 'needed'
  );

  const timeSinceLastGen = Date.now() - lastGenerationTime;
  const isTimeForGen = timeSinceLastGen > 30 * 60 * 1000; // 30 minutes

  const isPerformanceDecining = gaps.recentPerformanceChange < -0.2;

  return hasUrgentTopics && (isTimeForGen || isPerformanceDecining);
}

export function selectTopicsForGeneration(gaps: PerformanceGaps, count: number = 3): Topic[] {
  // Prioritize: urgent > needed > optional
  const urgentTopics = gaps.weakTopics
    .filter(t => t.generationUrgency === 'urgent')
    .sort((a, b) => a.accuracy - b.accuracy) // Worst first
    .slice(0, count);

  if (urgentTopics.length >= count) return urgentTopics.map(t => t.topic);

  const neededTopics = gaps.weakTopics
    .filter(t => t.generationUrgency === 'needed')
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, count - urgentTopics.length);

  return [...urgentTopics, ...neededTopics].map(t => t.topic);
}
