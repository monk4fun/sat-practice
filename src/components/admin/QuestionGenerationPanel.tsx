import { useState } from 'react';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import {
  CURATION_STRATEGY,
  curateQuestionBank,
  generateFillGapsInstructions,
} from '../../lib/questionCurator';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function QuestionGenerationPanel() {
  const allQuestions = useAllQuestions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  const { curated, summary, gaps } = curateQuestionBank(allQuestions);
  const instructions = generateFillGapsInstructions(gaps);

  const handleGenerateMissing = async () => {
    setIsGenerating(true);
    setGenerationStatus('Starting generation of missing questions...');

    try {
      // This would call the targeted question generator
      // For now, provide instructions
      setGenerationStatus(
        'Generation requires Claude API key configured in environment. ' +
        'See instructions below to generate questions on-demand.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const totalTarget = CURATION_STRATEGY.reduce((sum, s) => sum + s.targetCount, 0);
  const totalCurated = curated.length;
  const coverage = Math.round((totalCurated / totalTarget) * 100);

  return (
    <div className="space-y-6">
      {/* Current Curation Status */}
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Question Curation Status</h2>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-700">Total Questions</div>
            <div className="text-3xl font-bold text-blue-600">{totalCurated}</div>
            <div className="mt-1 text-xs text-gray-600">of {totalTarget} target</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm text-green-700">Overall Coverage</div>
            <div className="text-3xl font-bold text-green-600">{coverage}%</div>
            <div className="mt-1 text-xs text-gray-600">curated for weak areas</div>
          </div>
          <div className={`rounded-lg p-4 ${gaps.length === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className={`text-sm ${gaps.length === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
              Content Gaps
            </div>
            <div className={`text-3xl font-bold ${gaps.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {gaps.length}
            </div>
            <div className="mt-1 text-xs text-gray-600">areas needing questions</div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-900">
            <strong>Strategy:</strong> Questions are curated to prioritize San's weak areas:
            Information & Ideas (420-480), Standard English Conventions (420-480), and
            Problem-Solving & Data Analysis (550-600).
          </p>
        </div>
      </Card>

      {/* Curation by Topic */}
      <Card>
        <h3 className="mb-4 text-xl font-semibold">Coverage by Topic</h3>

        <div className="space-y-4">
          {CURATION_STRATEGY.map((strategy) => {
            const stats = summary[strategy.topic];
            const percentComplete = Math.round((stats.count / stats.target) * 100);
            const isWeak = strategy.priority === 1;
            const isGap = stats.coverage < 50;

            return (
              <div key={strategy.topic} className="border-l-4 border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{strategy.topic}</div>
                    <div className="text-xs text-gray-600 mt-1">{strategy.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {stats.count}/{stats.target}
                    </div>
                    <Badge variant={isGap ? 'danger' : isWeak ? 'warning' : 'success'}>
                      {percentComplete}%
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full transition-all ${
                      isGap
                        ? 'bg-red-500'
                        : isWeak
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, percentComplete)}%` }}
                  />
                </div>

                {/* Difficulty breakdown */}
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-gray-600">
                    Easy: {strategy.difficultyAllocation.easy}
                  </span>
                  <span className="text-gray-600">
                    Medium: {strategy.difficultyAllocation.medium}
                  </span>
                  <span className="text-gray-600">
                    Hard: {strategy.difficultyAllocation.hard}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Gaps */}
      {gaps.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <h3 className="mb-3 text-lg font-semibold text-yellow-900">Content Gaps</h3>
          <div className="space-y-2">
            {gaps.map((gap, i) => (
              <div key={i} className="text-sm text-yellow-800">
                • {gap}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Generation Instructions */}
      <Card className={instructions.priority === 'critical' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
        <h3 className={`mb-3 text-lg font-semibold ${
          instructions.priority === 'critical' ? 'text-red-900' : 'text-blue-900'
        }`}>
          {instructions.priority === 'critical' ? '🔴 Critical:' : 'ℹ️'} {instructions.recommendation}
        </h3>

        <div className="space-y-3">
          {instructions.steps.map((step, i) => (
            <div key={i} className={`text-sm ${
              instructions.priority === 'critical' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {step}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button
            onClick={handleGenerateMissing}
            disabled={isGenerating}
            variant={instructions.priority === 'critical' ? 'danger' : 'primary'}
          >
            {isGenerating ? 'Generating...' : 'Generate Missing Questions'}
          </Button>
          {generationStatus && (
            <p className={`mt-2 text-sm ${
              instructions.priority === 'critical' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {generationStatus}
            </p>
          )}
        </div>
      </Card>

      {/* How It Works */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">How Question Curation Works</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>1. Weak Areas Prioritized:</strong> Questions are selected to maximize
            practice in San's weakest domains (Information & Ideas and Standard English
            Conventions), which each represent 26% of the Reading & Writing section.
          </div>
          <div>
            <strong>2. Smart Allocation:</strong> Questions are distributed across easy,
            medium, and hard difficulties, with emphasis on medium (the actual SAT standard
            difficulty).
          </div>
          <div>
            <strong>3. Quality Scoring:</strong> Higher-quality questions (scored closer to
            official SAT) are prioritized when multiple options exist.
          </div>
          <div>
            <strong>4. Gap Filling:</strong> If weak areas have insufficient questions, the
            system identifies gaps and can auto-generate targeted questions using Claude API.
          </div>
          <div>
            <strong>5. Adaptive Algorithm:</strong> The adaptive selector weights these
            curated questions based on San's performance, continuously focusing on weak areas
            until mastery.
          </div>
        </div>
      </Card>
    </div>
  );
}
