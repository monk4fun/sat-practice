import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AppState,
  Topic,
  ExamMode,
  QuestionAttempt,
  DrillResult,
  DailyStats,
} from '../types';
import { SECTION_FOR_TOPIC } from '../data/constants';

interface AppStore extends AppState {
  // Drill actions
  startDrill: (options: {
    topicFilter?: Topic;
    sectionFilter?: string;
  }) => void;
  answerDrillQuestion: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => void;
  advanceDrill: () => void;
  completeDrill: () => void;
  clearDrill: () => void;
  recordDrillResult: (drillResult: DrillResult) => void;

  // Exam actions
  startExam: (mode: ExamMode) => void;
  answerExamQuestion: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => void;
  flagExamQuestion: (questionId: string) => void;
  navigateExam: (direction: 'next' | 'prev') => void;
  submitSection: () => void;
  completeExam: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => void;
  clearExam: () => void;
  updateExamTimer: (remainingSeconds: number) => void;

  // Progress actions
  recordAttempt: (attempt: QuestionAttempt) => void;
  updateTopicProgress: (topic: Topic, isCorrect: boolean) => void;

  // Computed
  getWeakTopics: () => Topic[];
  getTopicAccuracy: (topic: Topic) => number;
  getTotalStats: () => {
    totalAttempted: number;
    totalCorrect: number;
    overallAccuracy: number;
  };
  getDailyStats: () => DailyStats[];
  getDrillHistory: () => DrillResult[];
  getDrillsByDate: (date: string) => DrillResult[];
}

const generateId = () => Math.random().toString(36).substring(2);

export const useAppStore = create<AppStore>()(
  persist(
    immer<AppStore>((set, get) => ({
      topicProgress: {} as Record<Topic, any>,
      questionAttempts: [] as QuestionAttempt[],
      examResults: [] as any[],
      drillResults: [] as DrillResult[],
      currentDrill: null,
      currentExam: null,

      // ─── Drill Actions ────────────────────────────────────────────────────

      startDrill: (options) => {
        set((state) => {
          state.currentDrill = {
            id: generateId(),
            startedAt: new Date().toISOString(),
            status: 'setup',
            questionIds: [],
            currentIndex: 0,
            answers: {},
            topicFilter: options.topicFilter,
            sectionFilter: options.sectionFilter as any,
          };
        });
      },

      answerDrillQuestion: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
        set((state) => {
          if (state.currentDrill) {
            state.currentDrill.answers[questionId] = answer;
          }
        });
      },

      advanceDrill: () => {
        set((state) => {
          if (state.currentDrill && state.currentDrill.status === 'active') {
            state.currentDrill.currentIndex += 1;
          }
        });
      },

      completeDrill: () => {
        set((state) => {
          if (state.currentDrill) {
            state.currentDrill.status = 'complete';
            state.currentDrill.completedAt = new Date().toISOString();
          }
        });
      },

      clearDrill: () => {
        set((state) => {
          state.currentDrill = null;
        });
      },

      recordDrillResult: (drillResult: DrillResult) => {
        set((state) => {
          state.drillResults.push(drillResult);
        });
      },

      // ─── Exam Actions ─────────────────────────────────────────────────────

      startExam: (mode: ExamMode) => {
        set((state) => {
          state.currentExam = {
            id: generateId(),
            mode,
            startedAt: new Date().toISOString(),
            status: 'active',
            sections: [],
            currentSectionIndex: 0,
            currentQuestionIndex: 0,
            answers: {},
            flaggedQuestions: [],
            remainingSeconds: 0,
          };
        });
      },

      answerExamQuestion: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
        set((state) => {
          if (state.currentExam) {
            state.currentExam.answers[questionId] = answer;
          }
        });
      },

      flagExamQuestion: (questionId: string) => {
        set((state) => {
          if (state.currentExam) {
            const idx = state.currentExam.flaggedQuestions.indexOf(questionId);
            if (idx === -1) {
              state.currentExam.flaggedQuestions.push(questionId);
            } else {
              state.currentExam.flaggedQuestions.splice(idx, 1);
            }
          }
        });
      },

      navigateExam: (direction: 'next' | 'prev') => {
        set((state) => {
          if (!state.currentExam) return;
          const currentSection = state.currentExam.sections[state.currentExam.currentSectionIndex];
          if (!currentSection) return;

          if (direction === 'next') {
            state.currentExam.currentQuestionIndex += 1;
          } else if (direction === 'prev' && state.currentExam.currentQuestionIndex > 0) {
            state.currentExam.currentQuestionIndex -= 1;
          }
        });
      },

      submitSection: () => {
        set((state) => {
          if (!state.currentExam) return;
          state.currentExam.currentSectionIndex += 1;
          state.currentExam.currentQuestionIndex = 0;
          state.currentExam.remainingSeconds = 0;

          if (state.currentExam.currentSectionIndex >= state.currentExam.sections.length) {
            state.currentExam.status = 'reviewing';
          }
        });
      },

      completeExam: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => {
        set((state) => {
          if (state.currentExam) {
            state.currentExam.status = 'complete';
            state.currentExam.completedAt = new Date().toISOString();
            state.currentExam.answers = answers;
          }
        });
      },

      clearExam: () => {
        set((state) => {
          state.currentExam = null;
        });
      },

      updateExamTimer: (remainingSeconds: number) => {
        set((state) => {
          if (state.currentExam) {
            state.currentExam.remainingSeconds = remainingSeconds;
          }
        });
      },

      // ─── Progress Actions ─────────────────────────────────────────────────

      recordAttempt: (attempt: QuestionAttempt) => {
        set((state) => {
          state.questionAttempts.push(attempt);
          get().updateTopicProgress(attempt.questionId.split('-')[0] as any, attempt.isCorrect);
        });
      },

      updateTopicProgress: (topic: Topic, isCorrect: boolean) => {
        set((state) => {
          if (!state.topicProgress[topic]) {
            state.topicProgress[topic] = {
              topic,
              section: SECTION_FOR_TOPIC[topic],
              totalAttempts: 0,
              correctAttempts: 0,
              accuracyRate: 0,
              lastAttemptedAt: new Date().toISOString(),
            };
          }

          const progress = state.topicProgress[topic];
          progress.totalAttempts += 1;
          if (isCorrect) {
            progress.correctAttempts += 1;
          }
          progress.accuracyRate = progress.correctAttempts / progress.totalAttempts;
          progress.lastAttemptedAt = new Date().toISOString();
        });
      },

      // ─── Computed ──────────────────────────────────────────────────────────

      getWeakTopics: () => {
        const progress = get().topicProgress;
        return Object.values(progress)
          .filter((p) => p.accuracyRate < 0.65)
          .sort((a, b) => a.accuracyRate - b.accuracyRate)
          .map((p) => p.topic);
      },

      getTopicAccuracy: (topic: Topic) => {
        return get().topicProgress[topic]?.accuracyRate ?? 0;
      },

      getTotalStats: () => {
        const attempts = get().questionAttempts;
        const totalAttempted = attempts.length;
        const totalCorrect = attempts.filter((a) => a.isCorrect).length;
        const overallAccuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
        return { totalAttempted, totalCorrect, overallAccuracy };
      },

      getDailyStats: () => {
        const drillResults = get().drillResults;
        const dailyMap = new Map<string, DailyStats>();

        drillResults.forEach((drill) => {
          const date = drill.completedAt.split('T')[0];
          if (!dailyMap.has(date)) {
            dailyMap.set(date, {
              date,
              drillsCompleted: 0,
              totalQuestions: 0,
              totalCorrect: 0,
              dailyAccuracy: 0,
              drillIds: [],
            });
          }

          const daily = dailyMap.get(date)!;
          daily.drillsCompleted += 1;
          daily.totalQuestions += drill.totalQuestions;
          daily.totalCorrect += drill.correctAnswers;
          daily.drillIds.push(drill.drillId);
          daily.dailyAccuracy = daily.totalCorrect / daily.totalQuestions;
        });

        return Array.from(dailyMap.values()).sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      getDrillHistory: () => {
        return get().drillResults.sort((a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      },

      getDrillsByDate: (date: string) => {
        return get().drillResults
          .filter((drill) => drill.completedAt.startsWith(date))
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      },
    })),
    {
      name: 'sat-practice-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        topicProgress: state.topicProgress,
        questionAttempts: state.questionAttempts,
        examResults: state.examResults,
        drillResults: state.drillResults,
        currentDrill: state.currentDrill,
        currentExam: state.currentExam,
      }),
    }
  )
);
