import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionCard } from '../question/QuestionCard';
import { useAllQuestions } from '../../hooks/useAllQuestions';

export const ExamReview: React.FC = () => {
  const exam = useAppStore((s) => s.currentExam);
  const completeExam = useAppStore((s) => s.completeExam);
  const allQuestions = useAllQuestions();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  if (!exam || exam.sections.length === 0) {
    return null;
  }

  const allQuestionIds = exam.sections.flatMap((s) => s.questionIds);
  const selectedQuestion = selectedQuestionId
    ? allQuestions.find((q) => q.id === selectedQuestionId)
    : null;

  const correctCount = allQuestionIds.filter(
    (qId) => exam.answers[qId] === allQuestions.find((q) => q.id === qId)?.correctAnswer
  ).length;

  const handleFinalize = () => {
    completeExam(exam.answers);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Review Your Answers</h2>
        <p className="mb-4 text-gray-600">
          You got {correctCount} out of {allQuestionIds.length} correct.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <h3 className="mb-4 font-semibold">Questions</h3>
            <div className="space-y-2">
              {allQuestionIds.map((qId: string, idx: number) => {
                const q = allQuestions.find((question: any) => question.id === qId);
                const isCorrect = exam.answers[qId] === q?.correctAnswer;
                const isFlagged = exam.flaggedQuestions.includes(qId);

                return (
                  <button
                    key={qId}
                    onClick={() => setSelectedQuestionId(qId)}
                    className={`
                      flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left
                      transition-colors
                      ${selectedQuestionId === qId
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="flex-shrink-0 font-medium">{idx + 1}</span>
                    <span
                      className={`flex-shrink-0 text-lg ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    {isFlagged && <span className="text-yellow-600">⚑</span>}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <QuestionCard
              question={selectedQuestion}
              selectedAnswer={exam.answers[selectedQuestion.id]}
              isSubmitted={true}
              onAnswerSelect={() => {}}
              showExplanation={true}
            />
          ) : (
            <Card>
              <p className="text-center text-gray-600">Select a question to review</p>
            </Card>
          )}
        </div>
      </div>

      <Card className="text-center">
        <p className="mb-4 text-gray-600">Ready to see your score?</p>
        <Button variant="primary" size="lg" onClick={handleFinalize} fullWidth>
          View Final Score
        </Button>
      </Card>
    </div>
  );
};
