import React from 'react';
import type { Question } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TOPIC_LABELS } from '../../data/constants';
import { ChoiceButton } from './ChoiceButton';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  isSubmitted?: boolean;
  onAnswerSelect: (answer: 'A' | 'B' | 'C' | 'D') => void;
  showExplanation?: boolean;
}

const difficultyColor = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const;

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  isSubmitted = false,
  onAnswerSelect,
  showExplanation = false,
}) => {
  return (
    <Card>
      <div className="mb-4 flex gap-2">
        <Badge variant="info">{TOPIC_LABELS[question.topic]}</Badge>
        <Badge variant={difficultyColor[question.difficulty]}>
          {question.difficulty}
        </Badge>
      </div>

      {question.stimulus && (
        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm">
          <p className="whitespace-pre-wrap text-gray-700">{question.stimulus}</p>
        </div>
      )}

      <div className="mb-6 text-lg font-medium text-gray-900">
        {question.stem}
      </div>

      <div className="space-y-3">
        {question.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            isSelected={selectedAnswer === choice.id}
            isCorrect={isSubmitted && choice.id === question.correctAnswer}
            isIncorrect={
              isSubmitted && selectedAnswer === choice.id && choice.id !== question.correctAnswer
            }
            disabled={isSubmitted}
            onClick={() => !isSubmitted && onAnswerSelect(choice.id)}
          />
        ))}
      </div>

      {showExplanation && isSubmitted && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className={`rounded-lg p-4 ${
            selectedAnswer === question.correctAnswer
              ? 'bg-green-50'
              : 'bg-red-50'
          }`}>
            <div className="mb-2 font-semibold text-gray-900">
              {selectedAnswer === question.correctAnswer
                ? '✓ Correct!'
                : `✗ Incorrect. The correct answer is ${question.correctAnswer}`}
            </div>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
        </div>
      )}
    </Card>
  );
};
