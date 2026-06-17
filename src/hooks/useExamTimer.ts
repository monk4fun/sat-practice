import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useExamTimer(initialSeconds: number | null) {
  const updateTimer = useAppStore((s) => s.updateExamTimer);
  const exam = useAppStore((s) => s.currentExam);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!exam || initialSeconds === null) {
      // No timing pressure - don't start timer
      return;
    }

    // Initialize remaining seconds if not already set
    if (exam.remainingSeconds === 0) {
      updateTimer(initialSeconds);
    }

    // Set up interval for countdown (informational only, doesn't force submission)
    intervalRef.current = setInterval(() => {
      const currentExam = useAppStore.getState().currentExam;
      if (!currentExam) return;

      const newRemaining = currentExam.remainingSeconds - 1;

      if (newRemaining <= 0) {
        updateTimer(0);
        // Don't force submission - student can continue at their own pace
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
  }, [exam?.id, initialSeconds, updateTimer]);

  // If no time limit, return infinity so timer doesn't display
  if (initialSeconds === null) {
    return Infinity;
  }

  return exam?.remainingSeconds ?? 0;
}
