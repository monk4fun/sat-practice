import type { Question, Topic } from '../types';

export interface FailedQuestion {
  questionId: string;
  questionText: string;
  topic: Topic;
  difficulty: string;
  failureCount: number;
  lastFailedAt: string;
  masteredAt?: string;
  successAttemptsSinceFailure: number;
}

export function trackFailedQuestion(
  question: Question,
  failedQuestions: Record<string, FailedQuestion>
): Record<string, FailedQuestion> {
  const existing = failedQuestions[question.id];

  const updated = {
    ...failedQuestions,
    [question.id]: {
      questionId: question.id,
      questionText: question.stem,
      topic: question.topic,
      difficulty: question.difficulty,
      failureCount: (existing?.failureCount || 0) + 1,
      lastFailedAt: new Date().toISOString(),
      successAttemptsSinceFailure: 0,
      masteredAt: existing?.masteredAt,
    },
  };

  return updated;
}

export function trackSuccessOnFailedQuestion(
  questionId: string,
  failedQuestions: Record<string, FailedQuestion>
): Record<string, FailedQuestion> {
  const failed = failedQuestions[questionId];
  if (!failed) return failedQuestions;

  const updated = {
    ...failedQuestions,
    [questionId]: {
      ...failed,
      successAttemptsSinceFailure: failed.successAttemptsSinceFailure + 1,
      masteredAt: failed.successAttemptsSinceFailure >= 2
        ? new Date().toISOString()
        : undefined,
    },
  };

  // Remove from tracking once mastered (3+ successes after failure)
  if (failed.successAttemptsSinceFailure >= 2) {
    delete updated[questionId];
  }

  return updated;
}

export function getFailedQuestionsForReview(
  failedQuestions: Record<string, FailedQuestion>,
  limit: number = 5
): FailedQuestion[] {
  return Object.values(failedQuestions)
    .filter(q => !q.masteredAt) // Not yet mastered
    .sort((a, b) => {
      // Prioritize: most recent failures first, then most failures
      const recencyDiff =
        new Date(b.lastFailedAt).getTime() -
        new Date(a.lastFailedAt).getTime();
      if (recencyDiff !== 0) return recencyDiff;
      return b.failureCount - a.failureCount;
    })
    .slice(0, limit);
}

export function computeFailedQuestionWeight(failed: FailedQuestion): number {
  // Weight increases with each failure and recency
  const failureBoost = Math.min(4.0, 2.0 + failed.failureCount * 0.5);
  const daysSinceFailure = Math.floor(
    (Date.now() - new Date(failed.lastFailedAt).getTime()) / (24 * 60 * 60 * 1000)
  );

  // Decay over time: fresh failures get highest weight
  const recencyMultiplier = Math.max(1.0, 2.0 - daysSinceFailure * 0.2);

  return failureBoost * recencyMultiplier;
}
