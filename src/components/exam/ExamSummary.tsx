import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { SCALED_SCORE_TABLE, READING_WRITING_TOPICS, MATH_TOPICS } from '../../data/constants';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

export const ExamSummary: React.FC = () => {
  const navigate = useNavigate();
  const exam = useAppStore((s) => s.currentExam);
  const clearExam = useAppStore((s) => s.clearExam);
  const allQuestions = useAllQuestions();

  if (!exam || exam.sections.length === 0) {
    return null;
  }

  // Calculate scores per section
  const sectionScores = exam.sections.map((section) => {
    const correct = section.questionIds.filter(
      (qId) => exam.answers[qId] === allQuestions.find((q) => q.id === qId)?.correctAnswer
    ).length;
    const total = section.questionIds.length;
    const scaledScore = SCALED_SCORE_TABLE[section.section](correct, total);

    return {
      section: section.section,
      correct,
      total,
      scaledScore,
    };
  });

  // Calculate overall score (average of scaled scores)
  const totalScaled = sectionScores.reduce((sum, s) => sum + s.scaledScore, 0);
  const estimatedTotalScore = Math.round(totalScaled / sectionScores.length) * 2; // Rough estimate for 400-1600

  const handleNewExam = () => {
    clearExam();
    navigate('/exam');
  };

  const handleHome = () => {
    clearExam();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card className="border-b-4 border-blue-500">
        <h2 className="mb-6 text-3xl font-bold">Exam Complete!</h2>

        <div className="mb-8 text-center">
          <div className="text-7xl font-bold text-blue-600">
            {estimatedTotalScore}
          </div>
          <div className="mt-2 text-lg text-gray-600">
            Estimated Combined Score (400–1600)
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sectionScores.map((score) => (
          <Card key={score.section}>
            <h3 className="mb-2 font-semibold text-gray-900">
              {score.section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
            </h3>
            <div className="mb-4">
              <div className="text-3xl font-bold text-blue-600">{score.scaledScore}</div>
              <div className="text-sm text-gray-600">
                {score.correct}/{score.total} correct
              </div>
            </div>
            <ProgressBar
              value={score.correct}
              max={score.total}
              variant={score.correct / score.total > 0.7 ? 'success' : 'warning'}
            />
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Breakdown by Topic</h3>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 font-medium text-gray-700">Reading & Writing</h4>
            <div className="space-y-2">
              {READING_WRITING_TOPICS.map((topic) => {
                const questions = allQuestions.filter((q) => q.topic === topic && exam.sections.some(s => s.questionIds.includes(q.id)));
                const correct = questions.filter((q) => exam.answers[q.id] === q.correctAnswer).length;

                if (questions.length === 0) return null;

                return (
                  <div key={topic} className="flex justify-between text-sm">
                    <span className="text-gray-600">{topic}</span>
                    <span className="font-medium text-gray-900">
                      {correct}/{questions.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-gray-700">Math</h4>
            <div className="space-y-2">
              {MATH_TOPICS.map((topic) => {
                const questions = allQuestions.filter((q) => q.topic === topic && exam.sections.some(s => s.questionIds.includes(q.id)));
                const correct = questions.filter((q) => exam.answers[q.id] === q.correctAnswer).length;

                if (questions.length === 0) return null;

                return (
                  <div key={topic} className="flex justify-between text-sm">
                    <span className="text-gray-600">{topic}</span>
                    <span className="font-medium text-gray-900">
                      {correct}/{questions.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button variant="primary" size="lg" fullWidth onClick={handleNewExam}>
          Try Another Exam
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={handleHome}>
          Go Home
        </Button>
      </div>
    </div>
  );
};
