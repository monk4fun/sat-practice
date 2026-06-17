import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { selectAdaptiveQuestions } from '../../hooks/useAdaptiveSelector';
import { useAllQuestions } from '../../hooks/useAllQuestions';
import { DRILL_SESSION_LENGTH, READING_WRITING_TOPICS, MATH_TOPICS } from '../../data/constants';
import type { Topic, SATSection } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QuestionCard } from '../question/QuestionCard';
import { ProgressBar } from '../ui/ProgressBar';
import { DrillSummary } from './DrillSummary';

interface DrillSetupProps {
  onStart: (topicFilter?: Topic, sectionFilter?: SATSection) => void;
}

const DrillSetup: React.FC<DrillSetupProps> = ({ onStart }) => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-semibold">Start a Drill</h2>

      <div className="mb-6">
        <h3 className="mb-3 font-medium text-gray-900">Choose a topic (optional):</h3>
        <div className="grid gap-2">
          {[...READING_WRITING_TOPICS, ...MATH_TOPICS].map((topic) => (
            <label key={topic} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={topic}
                checked={selectedTopic === topic}
                onChange={(e) => setSelectedTopic(e.target.value as Topic)}
              />
              <span className="text-gray-700">{topic}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="topic"
              checked={selectedTopic === undefined}
              onChange={() => setSelectedTopic(undefined)}
            />
            <span className="text-gray-700">All topics</span>
          </label>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onStart(selectedTopic)}
      >
        Begin Drill ({DRILL_SESSION_LENGTH} questions)
      </Button>
    </Card>
  );
};

interface DrillQuestionProps {
  questionIndex: number;
  totalQuestions: number;
  question: any;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  isAnswered: boolean;
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void;
  onNext: () => void;
}

const DrillQuestion: React.FC<DrillQuestionProps> = ({
  questionIndex,
  totalQuestions,
  question,
  selectedAnswer,
  isAnswered,
  onAnswer,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <ProgressBar
        value={questionIndex + 1}
        max={totalQuestions}
        label={`Question ${questionIndex + 1} of ${totalQuestions}`}
        showPercentage={false}
      />

      <QuestionCard
        question={question}
        selectedAnswer={selectedAnswer}
        isSubmitted={isAnswered}
        onAnswerSelect={onAnswer}
        showExplanation={isAnswered}
      />

      {isAnswered && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onNext}
        >
          {questionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
        </Button>
      )}

      {!isAnswered && selectedAnswer && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onAnswer(selectedAnswer)}
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
};

export const DrillSession: React.FC = () => {
  const drill = useAppStore((s) => s.currentDrill);
  const topicProgress = useAppStore((s) => s.topicProgress);
  const failedQuestions = useAppStore((s) => s.failedQuestions);
  const startDrill = useAppStore((s) => s.startDrill);
  const answerQuestion = useAppStore((s) => s.answerDrillQuestion);
  const advanceDrill = useAppStore((s) => s.advanceDrill);
  const completeDrill = useAppStore((s) => s.completeDrill);
  const recordAttempt = useAppStore((s) => s.recordAttempt);
  const trackFailedQuestion = useAppStore((s) => s.trackFailedQuestion);
  const trackSuccessOnFailedQuestion = useAppStore((s) => s.trackSuccessOnFailedQuestion);
  const allQuestions = useAllQuestions();

  const [isAnswered, setIsAnswered] = useState(false);

  // Initialize drill if not started
  useEffect(() => {
    if (!drill) {
      const questionIds = selectAdaptiveQuestions(allQuestions, topicProgress, {
        count: DRILL_SESSION_LENGTH,
        failedQuestions,
      }).map((q) => q.id);

      startDrill({});
      // Update store with question IDs
      useAppStore.setState((state) => {
        if (state.currentDrill) {
          state.currentDrill.questionIds = questionIds;
          state.currentDrill.status = 'active';
        }
      });
    }
  }, [drill, startDrill, topicProgress, failedQuestions]);

  if (!drill) return null;

  const currentQuestion = allQuestions.find((q) => q.id === drill.questionIds[drill.currentIndex]);
  if (!currentQuestion) return null;

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!isAnswered) {
      answerQuestion(currentQuestion.id, answer);
      if (!drill.answers[currentQuestion.id]) {
        setIsAnswered(true);
      }
    }
  };

  const handleNext = () => {
    const isCorrect = drill.answers[currentQuestion.id] === currentQuestion.correctAnswer;
    recordAttempt({
      questionId: currentQuestion.id,
      selectedAnswer: drill.answers[currentQuestion.id],
      isCorrect,
      attemptedAt: new Date().toISOString(),
      sessionId: drill.id,
      mode: 'drill',
    });

    // Track failed questions for spaced repetition
    if (!isCorrect) {
      trackFailedQuestion(
        currentQuestion.id,
        currentQuestion.stem,
        currentQuestion.topic,
        currentQuestion.difficulty
      );
    } else if (failedQuestions[currentQuestion.id]) {
      // Track success on previously failed question
      trackSuccessOnFailedQuestion(currentQuestion.id);
    }

    if (drill.currentIndex < drill.questionIds.length - 1) {
      setIsAnswered(false);
      advanceDrill();
    } else {
      completeDrill();
    }
  };

  if (drill.status === 'setup' || drill.status === 'active') {
    if (drill.questionIds.length === 0) {
      return <DrillSetup onStart={(topic, section) => startDrill({ topicFilter: topic, sectionFilter: section })} />;
    }

    return (
      <DrillQuestion
        questionIndex={drill.currentIndex}
        totalQuestions={drill.questionIds.length}
        question={currentQuestion}
        selectedAnswer={drill.answers[currentQuestion.id]}
        isAnswered={isAnswered}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    );
  }

  return <DrillSummary />;
};
