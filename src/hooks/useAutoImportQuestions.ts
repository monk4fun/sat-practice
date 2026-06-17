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
        // Fetch both question sets
        const response1 = await fetch('/sat-questions-200.json');
        const response2 = await fetch('/sat-questions-expanded.json');

        const questions1 = await response1.json();
        const questions2 = await response2.json();
        const allQuestions = [...questions1, ...questions2];

        // Get existing custom questions
        const existing = JSON.parse(localStorage.getItem('customQuestions') || '[]');

        // Add new questions (avoiding duplicates by ID)
        const existingIds = new Set(existing.map((q: any) => q.id));
        const newQuestions = allQuestions.filter((q: any) => !existingIds.has(q.id));

        // Combine and save
        const combined = [...existing, ...newQuestions];
        localStorage.setItem('customQuestions', JSON.stringify(combined));

        // Mark as imported
        localStorage.setItem('questionsImported', 'true');

        console.log(`✅ Auto-imported ${newQuestions.length} SAT questions`);
        console.log(`📊 Total question bank: ${combined.length} questions`);
      } catch (error) {
        console.error('Auto-import failed:', error);
        // Silently fail - don't disrupt user experience
      }
    };

    importQuestionsOnce();
  }, []);
}
