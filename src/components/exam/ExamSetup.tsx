import React, { useState } from 'react';
import type { ExamMode } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ExamSetupProps {
  onStart: (mode: ExamMode) => void;
}

export const ExamSetup: React.FC<ExamSetupProps> = ({ onStart }) => {
  const [selectedMode, setSelectedMode] = useState<ExamMode>('mini');

  const modes: { id: ExamMode; name: string; description: string; time: string }[] = [
    {
      id: 'mini',
      name: 'Mini Exam',
      description: '10 R&W + 10 Math questions',
      time: '26 minutes',
    },
    {
      id: 'reading-writing-only',
      name: 'Reading & Writing',
      description: '27 + 27 questions (2 modules)',
      time: '64 minutes',
    },
    {
      id: 'math-only',
      name: 'Math Only',
      description: '22 + 22 questions (2 modules)',
      time: '70 minutes',
    },
    {
      id: 'full',
      name: 'Full Exam',
      description: 'Complete SAT (4 modules)',
      time: '2h 54m',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-6 text-2xl font-semibold">Choose an Exam</h2>

        <div className="space-y-3">
          {modes.map((mode) => (
            <label
              key={mode.id}
              className={`
                flex cursor-pointer gap-4 rounded-lg border-2 p-4 transition-all
                ${selectedMode === mode.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <input
                type="radio"
                name="exam-mode"
                value={mode.id}
                checked={selectedMode === mode.id}
                onChange={(e) => setSelectedMode(e.target.value as ExamMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{mode.name}</div>
                <div className="text-sm text-gray-600">{mode.description}</div>
              </div>
              <div className="text-right text-sm text-gray-600">⏱️ {mode.time}</div>
            </label>
          ))}
        </div>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <h3 className="mb-2 font-semibold text-blue-900">Tips for Success</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Work at a steady pace — don't spend too long on any one question</li>
          <li>• Flag difficult questions to review later</li>
          <li>• Answer every question — there's no penalty for guessing</li>
        </ul>
      </Card>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onStart(selectedMode)}
      >
        Start Exam
      </Button>
    </div>
  );
};
