import { useMemo } from 'react';
import { QUESTIONS } from '../data/questions';
import type { Question } from '../types';

export function useAllQuestions(): Question[] {
  return useMemo(() => {
    // Load custom questions from localStorage
    const customQuestionsJson = localStorage.getItem('customQuestions');
    const customQuestions: Question[] = customQuestionsJson
      ? JSON.parse(customQuestionsJson)
      : [];

    // Combine default and custom questions
    return [...QUESTIONS, ...customQuestions];
  }, []);
}
