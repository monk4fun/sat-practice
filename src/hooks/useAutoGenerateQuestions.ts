import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateMultipleQuestions, convertToQuestion } from '../lib/questionGenerator';
import {
  analyzeDrillPerformance,
  analyzeExamPerformance,
  shouldGenerateQuestions,
  selectTopicsForGeneration,
} from '../lib/performanceAnalyzer';
import type { Question } from '../types';

export function useAutoGenerateQuestions() {
  const store = useAppStore();
  const lastGenerationTimeRef = useRef(0);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    const checkAndGenerate = async () => {
      // Don't generate if already generating
      if (isGeneratingRef.current) return;

      // Don't generate if no recent drill/exam
      const lastDrill = store.drillResults[store.drillResults.length - 1];
      const lastExam = store.examResults[store.examResults.length - 1];

      if (!lastDrill && !lastExam) return;

      // Determine which was more recent
      const lastDrillTime = lastDrill ? new Date(lastDrill.completedAt).getTime() : 0;
      const lastExamTime = lastExam ? new Date(lastExam.completedAt).getTime() : 0;
      const lastActivityTime = Math.max(lastDrillTime, lastExamTime);

      // Only check performance after recent activity (within last 5 minutes)
      if (Date.now() - lastActivityTime > 5 * 60 * 1000) return;

      // Analyze performance
      const gaps = lastExamTime > lastDrillTime
        ? analyzeExamPerformance(lastExam!, store.topicProgress)
        : analyzeDrillPerformance(lastDrill!, store.topicProgress);

      // Check if generation is needed
      if (!shouldGenerateQuestions(gaps, lastGenerationTimeRef.current)) return;

      // Select weak topics for generation
      const topicsToGenerate = selectTopicsForGeneration(gaps, 3);
      if (topicsToGenerate.length === 0) return;

      isGeneratingRef.current = true;

      try {
        const newQuestions: Question[] = [];

        // Generate questions for each weak topic
        for (const topic of topicsToGenerate) {
          const topicInfo = gaps.weakTopics.find(t => t.topic === topic);
          if (!topicInfo) continue;

          const generatedBatch = await generateMultipleQuestions(
            topic,
            topicInfo.suggestedDifficulty,
            2 // Generate 2 questions per weak topic
          );

          // Convert to Question format and add quality score
          const questions = generatedBatch
            .map((q, i) =>
              convertToQuestion(q, `auto-gen-${topic}-${Date.now()}-${i}`)
            )
            .map(q => ({
              ...q,
              qualityScore: 4, // Default to 4-star (high-quality)
              source: 'ai-generated',
            }));

          newQuestions.push(...questions);
        }

        if (newQuestions.length > 0) {
          // Add to custom questions in localStorage
          const existing = JSON.parse(localStorage.getItem('customQuestions') || '[]');
          const combined = [...existing, ...newQuestions];
          localStorage.setItem('customQuestions', JSON.stringify(combined));

          console.log(`✅ Auto-generated ${newQuestions.length} new SAT questions for weak topics`);

          // Show notification (optional: could trigger toast)
          showGenerationNotification(newQuestions.length);

          lastGenerationTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error('Auto-generation failed:', error);
      } finally {
        isGeneratingRef.current = false;
      }
    };

    // Check every 10 seconds if drill/exam just completed
    const interval = setInterval(checkAndGenerate, 10000);

    return () => clearInterval(interval);
  }, [store.drillResults, store.examResults, store.topicProgress]);
}

function showGenerationNotification(count: number) {
  // Simple console notification (can be upgraded to toast)
  const msg = `🤖 Generated ${count} personalized practice questions for weak topics!`;
  console.log(msg);

  // Store notification in sessionStorage so UI can pick it up
  const notifications = JSON.parse(sessionStorage.getItem('autoGenNotifications') || '[]');
  notifications.push({
    message: msg,
    timestamp: Date.now(),
  });
  sessionStorage.setItem('autoGenNotifications', JSON.stringify(notifications));
}
