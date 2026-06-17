import { useEffect } from 'react';

export function useAutoImportQuestions() {
  useEffect(() => {
    const importQuestionsOnce = async () => {
      // Check if we've already imported the question bank
      const hasImported = localStorage.getItem('questionsImported');
      if (hasImported === 'true') {
        return; // Already imported, skip
      }

      try {
        // Fetch the comprehensive questions JSON
        const response = await fetch('/sat-questions-200.json');
        const questions = await response.json();

        // Get existing custom questions
        const existing = JSON.parse(localStorage.getItem('customQuestions') || '[]');

        // Add new questions (avoiding duplicates by ID)
        const existingIds = new Set(existing.map((q: any) => q.id));
        const newQuestions = questions.filter((q: any) => !existingIds.has(q.id));

        // Combine and save
        const combined = [...existing, ...newQuestions];
        localStorage.setItem('customQuestions', JSON.stringify(combined));

        // Mark as imported
        localStorage.setItem('questionsImported', 'true');

        console.log(`✅ Auto-imported ${newQuestions.length} SAT questions`);
      } catch (error) {
        console.error('Auto-import failed:', error);
        // Silently fail - don't disrupt user experience
      }
    };

    importQuestionsOnce();
  }, []);
}
