import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  onAuthChange,
  saveProgressToFirestore,
  loadProgressFromFirestore,
  onProgressChange,
  loadCustomQuestionsFromFirestore,
  saveCustomQuestionsToFirestore,
  isFirebaseConfigured,
} from '../lib/firebase';

export function useFirebaseSync() {
  const topicProgress = useAppStore((s) => s.topicProgress);
  const questionAttempts = useAppStore((s) => s.questionAttempts);
  const drillResults = useAppStore((s) => s.drillResults);
  const examResults = useAppStore((s) => s.examResults);
  const userIdRef = useRef<string | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Initialize Firebase and set up auth listener
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribeAuth = onAuthChange(async (user) => {
      if (user) {
        userIdRef.current = user.uid;

        // Load progress from cloud
        const cloudProgress = await loadProgressFromFirestore(user.uid);
        if (cloudProgress) {
          useAppStore.setState({
            topicProgress: cloudProgress.topicProgress || {},
            questionAttempts: cloudProgress.questionAttempts || [],
            drillResults: cloudProgress.drillResults || [],
            examResults: cloudProgress.examResults || [],
          });
        }

        // Load custom questions from cloud
        const cloudQuestions = await loadCustomQuestionsFromFirestore(user.uid);
        if (cloudQuestions && cloudQuestions.length > 0) {
          localStorage.setItem('customQuestions', JSON.stringify(cloudQuestions));
        }

        // Listen for remote changes
        const unsubscribeProgress = onProgressChange(user.uid, (cloudData) => {
          // Only update if cloud data is newer than local
          const cloudTime = new Date(cloudData.lastUpdated).getTime();
          if (cloudTime > lastSyncRef.current) {
            useAppStore.setState({
              topicProgress: cloudData.topicProgress || {},
              questionAttempts: cloudData.questionAttempts || [],
              drillResults: cloudData.drillResults || [],
              examResults: cloudData.examResults || [],
            });
          }
        });

        return () => unsubscribeProgress();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync progress to cloud whenever it changes
  useEffect(() => {
    if (!isFirebaseConfigured || !userIdRef.current) return;

    // Debounce syncs to avoid too many writes
    const now = Date.now();
    if (now - lastSyncRef.current < 3000) return; // Don't sync more than every 3 seconds

    lastSyncRef.current = now;

    saveProgressToFirestore(userIdRef.current, {
      topicProgress,
      questionAttempts,
      drillResults,
      examResults,
    });

    // Also sync custom questions
    const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
    if (customQuestions.length > 0) {
      saveCustomQuestionsToFirestore(userIdRef.current, customQuestions);
    }
  }, [topicProgress, questionAttempts, drillResults, examResults]);

  return {
    isConfigured: isFirebaseConfigured,
    userId: userIdRef.current,
  };
}
