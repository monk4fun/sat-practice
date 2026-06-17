import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useExamTimer(initialSeconds: number, onTimeUp?: () => void) {
  const updateTimer = useAppStore((s) => s.updateExamTimer);
  const exam = useAppStore((s) => s.currentExam);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!exam) return;

    // Initialize remaining seconds if not already set
    if (exam.remainingSeconds === 0) {
      updateTimer(initialSeconds);
    }

    // Set up interval for countdown
    intervalRef.current = setInterval(() => {
      const currentExam = useAppStore.getState().currentExam;
      if (!currentExam) return;

      const newRemaining = currentExam.remainingSeconds - 1;

      if (newRemaining <= 0) {
        updateTimer(0);
        if (onTimeUp) {
          onTimeUp();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        updateTimer(newRemaining);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [exam?.id, initialSeconds, updateTimer, onTimeUp]);

  return exam?.remainingSeconds ?? 0;
}
