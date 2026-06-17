import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { READING_WRITING_TOPICS, MATH_TOPICS } from '../../data/constants';
import { Card } from '../ui/Card';

export const SectionChart: React.FC = () => {
  const topicProgress = useAppStore((s) => s.topicProgress);

  // Calculate section accuracies
  const rwTopics = READING_WRITING_TOPICS.filter((t) => topicProgress[t]);
  const mathTopics = MATH_TOPICS.filter((t) => topicProgress[t]);

  const rwAccuracy =
    rwTopics.length > 0
      ? rwTopics.reduce((sum, t) => sum + topicProgress[t].accuracyRate, 0) / rwTopics.length
      : 0;

  const mathAccuracy =
    mathTopics.length > 0
      ? mathTopics.reduce((sum, t) => sum + topicProgress[t].accuracyRate, 0) / mathTopics.length
      : 0;

  const maxAccuracy = Math.max(rwAccuracy, mathAccuracy, 0.5); // Min 50% for scaling

  const rwHeight = (rwAccuracy / maxAccuracy) * 100;
  const mathHeight = (mathAccuracy / maxAccuracy) * 100;

  return (
    <Card>
      <h3 className="mb-6 text-lg font-semibold">Section Performance</h3>

      {rwTopics.length === 0 && mathTopics.length === 0 ? (
        <p className="text-gray-600">No data yet. Complete a drill to see your performance.</p>
      ) : (
        <div className="flex gap-8">
          {/* Reading & Writing */}
          {rwTopics.length > 0 && (
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-4 flex h-48 w-full flex-col-reverse items-center justify-end">
                <div
                  className="w-12 rounded-t-lg bg-blue-600 transition-all duration-300"
                  style={{ height: `${rwHeight}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Reading & Writing</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(rwAccuracy * 100)}%
                </div>
              </div>
            </div>
          )}

          {/* Math */}
          {mathTopics.length > 0 && (
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-4 flex h-48 w-full flex-col-reverse items-center justify-end">
                <div
                  className="w-12 rounded-t-lg bg-green-600 transition-all duration-300"
                  style={{ height: `${mathHeight}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Math</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(mathAccuracy * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
