import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TOPIC_LABELS } from '../../data/constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import type { DrillResult } from '../../types';

export const DrillSummary: React.FC = () => {
  const navigate = useNavigate();
  const drill = useAppStore((s) => s.currentDrill);
  const topicProgress = useAppStore((s) => s.topicProgress);
  const clearDrill = useAppStore((s) => s.clearDrill);
  const recordDrillResult = useAppStore((s) => s.recordDrillResult);
  const getWeakTopics = useAppStore((s) => s.getWeakTopics);
  const allQuestions = useAllQuestions();

  useEffect(() => {
    if (drill && drill.status === 'complete') {
      const drillQuestions = allQuestions.filter((q) => drill.questionIds.includes(q.id));
      const correctCount = drillQuestions.filter(
        (q) => drill.answers[q.id] === q.correctAnswer
      ).length;

      const drillResult: DrillResult = {
        drillId: drill.id,
        completedAt: drill.completedAt || new Date().toISOString(),
        totalQuestions: drill.questionIds.length,
        correctAnswers: correctCount,
        accuracy: correctCount / drill.questionIds.length,
        topicsCovered: Array.from(new Set(drillQuestions.map((q) => q.topic))),
      };

      recordDrillResult(drillResult);
    }
  }, [drill?.id]);

  if (!drill) return null;

  const drillQuestions = allQuestions.filter((q: any) => drill.questionIds.includes(q.id));
  const correctCount = drillQuestions.filter(
    (q: any) => drill.answers[q.id] === q.correctAnswer
  ).length;

  const weakTopics = getWeakTopics();

  const handleNewDrill = () => {
    clearDrill();
    window.location.reload();
  };

  const handleHome = () => {
    clearDrill();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-6 text-3xl font-bold">Drill Complete!</h2>

        <div className="mb-8 text-center">
          <div className="text-6xl font-bold text-blue-600">
            {correctCount}/{drillQuestions.length}
          </div>
          <div className="mt-2 text-xl text-gray-600">
            {Math.round((correctCount / drillQuestions.length) * 100)}% Correct
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm text-gray-600">Correct</div>
            <div className="text-3xl font-bold text-green-600">{correctCount}</div>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <div className="text-sm text-gray-600">Incorrect</div>
            <div className="text-3xl font-bold text-red-600">
              {drillQuestions.length - correctCount}
            </div>
          </div>
        </div>
      </Card>

      {weakTopics.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-red-600">
            Topics to Focus On
          </h3>
          <div className="space-y-4">
            {weakTopics.slice(0, 3).map((topic) => {
              const progress = topicProgress[topic];
              if (!progress) return null;
              return (
                <div key={topic}>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {TOPIC_LABELS[topic]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(progress.accuracyRate * 100)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={progress.correctAttempts}
                    max={progress.totalAttempts}
                    variant={progress.accuracyRate > 0.65 ? 'success' : 'danger'}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNewDrill}
        >
          Try Another Drill
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleHome}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
};
