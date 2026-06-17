import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TOPIC_LABELS } from '../../data/constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const WeakTopicsAlert: React.FC = () => {
  const getWeakTopics = useAppStore((s) => s.getWeakTopics);

  const weakTopics = getWeakTopics();

  if (weakTopics.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-red-500 bg-red-50">
      <h3 className="mb-2 text-lg font-semibold text-red-900">Focus Areas</h3>
      <p className="mb-4 text-sm text-red-700">
        You're scoring below 65% in these topics. Consider practicing them more.
      </p>
      <div className="mb-4 space-y-2">
        {weakTopics.map((topic) => (
          <div key={topic} className="text-sm text-red-800">
            • {TOPIC_LABELS[topic]}
          </div>
        ))}
      </div>
      <Link to="/drill">
        <Button variant="primary" size="sm" fullWidth>
          Start Drill
        </Button>
      </Link>
    </Card>
  );
};
