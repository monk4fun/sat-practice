import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ALL_TOPICS, TOPIC_LABELS } from '../../data/constants';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const TopicBreakdown: React.FC = () => {
  const topicProgress = useAppStore((s) => s.topicProgress);

  const topicsWithData = ALL_TOPICS.filter((t) => topicProgress[t] && topicProgress[t].totalAttempts > 0);

  if (topicsWithData.length === 0) {
    return (
      <Card>
        <p className="text-gray-600">No practice data yet. Start with a drill!</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-6 text-lg font-semibold">Topic Breakdown</h3>
      <div className="space-y-6">
        {topicsWithData.map((topic) => {
          const progress = topicProgress[topic];
          if (!progress) return null;

          const accuracy = progress.accuracyRate;
          const variant = accuracy > 0.8 ? 'success' : accuracy > 0.65 ? 'warning' : 'danger';

          return (
            <div key={topic}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-gray-900">{TOPIC_LABELS[topic]}</span>
                <span className="text-sm text-gray-600">
                  {progress.correctAttempts}/{progress.totalAttempts} ({Math.round(accuracy * 100)}%)
                </span>
              </div>
              <ProgressBar
                value={progress.correctAttempts}
                max={progress.totalAttempts}
                variant={variant}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
