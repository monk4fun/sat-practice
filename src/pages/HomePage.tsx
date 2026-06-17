import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WeakTopicsAlert } from '../components/progress/WeakTopicsAlert';

export const HomePage: React.FC = () => {
  const getTotalStats = useAppStore((s) => s.getTotalStats);
  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">SAT Practice</h1>
        <p className="mt-2 text-lg text-gray-600">
          Improve your SAT score with adaptive drills and mock exams
        </p>
      </div>

      {stats.totalAttempted > 0 && (
        <Card className="border-b-4 border-blue-500 bg-blue-50">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-blue-700">Questions</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttempted}</div>
            </div>
            <div>
              <div className="text-xs text-blue-700">Correct</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalCorrect}</div>
            </div>
            <div>
              <div className="text-xs text-blue-700">Accuracy</div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.overallAccuracy * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      <WeakTopicsAlert />

      <Card>
        <h2 className="mb-4 text-xl font-semibold">Get Started</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/drill">
            <Button variant="primary" size="lg" fullWidth className="h-full flex-col">
              <div className="text-lg font-semibold">Practice Drill</div>
              <div className="text-sm opacity-90">Adaptive questions focusing on weak areas</div>
            </Button>
          </Link>
          <Link to="/exam">
            <Button variant="primary" size="lg" fullWidth className="h-full flex-col">
              <div className="text-lg font-semibold">Full Exam</div>
              <div className="text-sm opacity-90">Timed practice exam</div>
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Detailed Analytics</h2>
        <Link to="/progress">
          <Button variant="outline" fullWidth>
            View Progress Report
          </Button>
        </Link>
      </Card>
    </div>
  );
};
