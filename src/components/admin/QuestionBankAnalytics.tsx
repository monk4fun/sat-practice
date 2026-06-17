import React, { useEffect, useState } from 'react';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import { analyzeQuestionBank } from '../../lib/contentDomainAnalyzer';
import type { QuestionBankAnalysis, ContentDomainStats } from '../../lib/contentDomainAnalyzer';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export function QuestionBankAnalytics() {
  const allQuestions = useAllQuestions();
  const [analysis, setAnalysis] = useState<QuestionBankAnalysis | null>(null);

  useEffect(() => {
    const result = analyzeQuestionBank(allQuestions);
    setAnalysis(result);
  }, [allQuestions]);

  if (!analysis) {
    return <Card><p>Loading question bank analysis...</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Question Bank Analytics</h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div>
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-2xl font-bold">{analysis.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reading & Writing</p>
            <p className="text-2xl font-bold">{analysis.readingWriting.reduce((sum, s) => sum + s.count, 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Math</p>
            <p className="text-2xl font-bold">{analysis.math.reduce((sum, s) => sum + s.count, 0)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Official SAT Alignment: <Badge>{analysis.coverage}%</Badge>
          </p>
          <ProgressBar
            value={analysis.coverage}
            max={100}
            label="Content Domain Coverage"
            showPercentage={true}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-xl font-semibold">Reading & Writing Distribution</h3>
        <DomainStats stats={analysis.readingWriting} />
      </Card>

      <Card>
        <h3 className="mb-4 text-xl font-semibold">Math Distribution</h3>
        <DomainStats stats={analysis.math} />
      </Card>

      {analysis.gaps.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <h3 className="mb-3 text-lg font-semibold text-yellow-900">Content Gaps</h3>
          <ul className="space-y-2">
            {analysis.gaps.map((gap, i) => (
              <li key={i} className="text-sm text-yellow-800">• {gap}</li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-800">• {rec}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="border-green-200 bg-green-50">
        <h3 className="mb-3 text-lg font-semibold text-green-900">Official SAT Standards</h3>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-green-800">
          <div>
            <p className="font-medium">Reading & Writing Structure</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Total: 54 questions</li>
              <li>• Module 1: 27 questions (32 min)</li>
              <li>• Module 2: 27 questions (32 min)</li>
              <li>• Time per question: 1 min 11 sec</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Math Structure</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Total: 44 questions</li>
              <li>• Module 1: 22 questions (35 min)</li>
              <li>• Module 2: 22 questions (35 min)</li>
              <li>• Time per question: 1 min 35 sec</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface DomainStatsProps {
  stats: ContentDomainStats[];
}

const DomainStats: React.FC<DomainStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {stats.map(stat => {
        const percentage = Math.round(stat.percentage * 100);
        const target = Math.round(stat.targetPercentage * 100);
        const diff = percentage - target;

        return (
          <div key={stat.domain}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{stat.domain}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {stat.count} questions ({percentage}%)
                </span>
                <StatusBadge status={stat.status} diff={diff} />
              </div>
            </div>
            <ProgressBar
              value={percentage}
              max={target > 50 ? target + 10 : 50}
              label={`Target: ${target}%`}
              showPercentage={false}
            />
          </div>
        );
      })}
    </div>
  );
};

interface StatusBadgeProps {
  status: 'under' | 'aligned' | 'over';
  diff: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, diff }) => {
  const colors = {
    under: 'bg-red-100 text-red-800',
    aligned: 'bg-green-100 text-green-800',
    over: 'bg-yellow-100 text-yellow-800',
  };

  const labels = {
    under: `${diff}% below`,
    aligned: '✓ Aligned',
    over: `${diff}% above`,
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};
