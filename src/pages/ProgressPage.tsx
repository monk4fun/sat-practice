import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ProgressReport } from '../components/progress/ProgressReport';
import { SectionChart } from '../components/progress/SectionChart';
import { TopicBreakdown } from '../components/progress/TopicBreakdown';
import { WeakTopicsAlert } from '../components/progress/WeakTopicsAlert';
import { SixtyDayTracker } from '../components/progress/SixtyDayTracker';
import { Card } from '../components/ui/Card';

export const ProgressPage: React.FC = () => {
  const getTotalStats = useAppStore((s) => s.getTotalStats);
  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Your Progress</h1>
        <p className="mt-2 text-gray-600">Track your improvement across all SAT topics</p>
      </div>

      <ProgressReport />

      {stats.totalAttempted > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Overall Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Questions</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalAttempted}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Correct</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalCorrect}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(stats.overallAccuracy * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      <SixtyDayTracker />

      <WeakTopicsAlert />
      <SectionChart />
      <TopicBreakdown />
    </div>
  );
};
