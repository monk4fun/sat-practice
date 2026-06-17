import React, { useEffect, useState } from 'react';
import type { ExamMode, ExamSection as ExamSectionType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { EXAM_CONFIG } from '../../data/constants';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Timer } from '../ui/Timer';
import { QuestionCard } from '../question/QuestionCard';
import { Badge } from '../ui/Badge';
import { ExamSetup } from './ExamSetup';
import { ExamReview } from './ExamReview';
import { ExamSummary } from './ExamSummary';
import { useExamTimer } from '../../hooks/useExamTimer';

export const ExamSession: React.FC = () => {
  const exam = useAppStore((s) => s.currentExam);
  const startExam = useAppStore((s) => s.startExam);
  const answerQuestion = useAppStore((s) => s.answerExamQuestion);
  const flagQuestion = useAppStore((s) => s.flagExamQuestion);
  const navigateExam = useAppStore((s) => s.navigateExam);
  const submitSection = useAppStore((s) => s.submitSection);
  const recordAttempt = useAppStore((s) => s.recordAttempt);
  const allQuestions = useAllQuestions();

  const [isInitialized, setIsInitialized] = useState(false);

  // Prevent accidental refresh during exam
  useEffect(() => {
    if (!exam || exam.status !== 'active') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exam?.status]);

  // Initialize exam if not started
  useEffect(() => {
    if (!exam && !isInitialized) {
      setIsInitialized(true);
    }
  }, [exam, isInitialized]);

  const handleStartExam = (mode: ExamMode) => {
    // Create exam sections based on mode
    const config = EXAM_CONFIG[mode];
    const sections: ExamSectionType[] = config.sections.map((sec) => {
      const sectionQuestions = allQuestions.filter((q) => q.section === sec.section).slice(
        0,
        sec.questions
      );
      return {
        section: sec.section,
        questionIds: sectionQuestions.map((q) => q.id),
        timeLimitSeconds: sec.timeLimitSeconds,
      };
    });

    startExam(mode);
    useAppStore.setState((state) => {
      if (state.currentExam) {
        state.currentExam.sections = sections;
        state.currentExam.remainingSeconds = sections[0].timeLimitSeconds;
      }
    });
  };

  const handleTimeUp = () => {
    submitSection();
  };

  if (!exam) {
    return <ExamSetup onStart={handleStartExam} />;
  }

  if (exam.status === 'reviewing' || exam.status === 'complete') {
    if (exam.status === 'reviewing') {
      return <ExamReview />;
    }
    return <ExamSummary />;
  }

  if (exam.sections.length === 0) {
    return null;
  }

  const currentSection = exam.sections[exam.currentSectionIndex];
  if (!currentSection) {
    return <ExamSummary />;
  }

  const currentQuestion = allQuestions.find(
    (q: any) => q.id === currentSection.questionIds[exam.currentQuestionIndex]
  );

  if (!currentQuestion) {
    return <ExamSummary />;
  }

  const remainingTime = useExamTimer(currentSection.timeLimitSeconds, handleTimeUp);
  const isFlagged = exam.flaggedQuestions.includes(currentQuestion.id);

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    answerQuestion(currentQuestion.id, answer);
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    navigateExam(direction);
  };

  const handleSubmitSection = () => {
    // Record all attempts in this section
    currentSection.questionIds.forEach((qId: string) => {
      const q = allQuestions.find((quest: any) => quest.id === qId);
      if (q && exam.answers[qId]) {
        recordAttempt({
          questionId: qId,
          selectedAnswer: exam.answers[qId],
          isCorrect: exam.answers[qId] === q.correctAnswer,
          attemptedAt: new Date().toISOString(),
          sessionId: exam.id,
          mode: 'exam',
        });
      }
    });
    submitSection();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Badge variant="info">
              Section {exam.currentSectionIndex + 1} of {exam.sections.length}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold">
              {currentSection.section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
            </h2>
          </div>
          <div className="text-right text-sm text-gray-600">
            Question {exam.currentQuestionIndex + 1} of {currentSection.questionIds.length}
          </div>
        </div>

        <Timer remainingSeconds={remainingTime} totalSeconds={currentSection.timeLimitSeconds} />
      </Card>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={exam.answers[currentQuestion.id]}
        isSubmitted={false}
        onAnswerSelect={handleAnswer}
        showExplanation={false}
      />

      <Card>
        <div className="mb-4 flex gap-2">
          <Button
            variant={isFlagged ? 'danger' : 'secondary'}
            onClick={() => flagQuestion(currentQuestion.id)}
          >
            {isFlagged ? '⚑ Flagged' : '⚐ Flag'}
          </Button>
          <Button
            variant="secondary"
            disabled={exam.currentQuestionIndex === 0}
            onClick={() => handleNavigate('prev')}
          >
            ← Previous
          </Button>
          {exam.currentQuestionIndex < currentSection.questionIds.length - 1 ? (
            <Button variant="primary" onClick={() => handleNavigate('next')}>
              Next →
            </Button>
          ) : (
            <Button variant="primary" fullWidth onClick={handleSubmitSection}>
              Submit Section
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
