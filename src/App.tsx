import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { DrillPage } from './pages/DrillPage';
import { ExamPage } from './pages/ExamPage';
import { ProgressPage } from './pages/ProgressPage';
import { AdminPage } from './pages/AdminPage';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useAutoImportQuestions } from './hooks/useAutoImportQuestions';
import { useAutoGenerateQuestions } from './hooks/useAutoGenerateQuestions';
import { useGenerateSimilarQuestions } from './hooks/useGenerateSimilarQuestions';

function AppContent() {
  useFirebaseSync();
  useAutoImportQuestions();
  useAutoGenerateQuestions();
  useGenerateSimilarQuestions();

  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/drill" element={<DrillPage />} />
              <Route path="/exam" element={<ExamPage />} />
              <Route path="/progress" element={<ProgressPage />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  );
}

export default App;
