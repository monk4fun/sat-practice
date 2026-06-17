import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QuestionManager } from '../components/admin/QuestionManager';
import { QuestionImporter } from '../components/admin/QuestionImporter';

type AdminTab = 'generate' | 'import' | 'library';

export const AdminPage: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('generate');

  const handleAuth = () => {
    if (password === 'satprep2024') {
      setIsAuthed(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthed && localStorage.getItem('adminAuth') !== 'true') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <Card className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold">Admin Access</h1>
          <p className="mb-6 text-gray-600">Enter the admin password to access question management</p>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2"
          />

          <Button variant="primary" size="lg" fullWidth onClick={handleAuth}>
            Login
          </Button>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600">
              For security, set a strong password in the code and change the default.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Generate, import, and manage SAT questions</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setIsAuthed(false);
          }}
        >
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🤖 Generate with AI
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'import'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📥 Import from Sources
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'library'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Question Library
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' && <QuestionManager />}
      {activeTab === 'import' && <QuestionImporter />}
      {activeTab === 'library' && <QuestionLibraryTab />}
    </div>
  );
};

const QuestionLibraryTab: React.FC = () => {
  const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Question Bank Overview</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 p-6">
            <div className="text-sm text-blue-700">Default Questions</div>
            <div className="mt-2 text-4xl font-bold text-blue-600">80</div>
            <p className="mt-2 text-xs text-blue-600">Official SAT practice questions</p>
          </div>

          <div className="rounded-lg bg-green-50 p-6">
            <div className="text-sm text-green-700">Custom Questions</div>
            <div className="mt-2 text-4xl font-bold text-green-600">{customQuestions.length}</div>
            <p className="mt-2 text-xs text-green-600">Generated or imported</p>
          </div>

          <div className="rounded-lg bg-purple-50 p-6">
            <div className="text-sm text-purple-700">Total Available</div>
            <div className="mt-2 text-4xl font-bold text-purple-600">{80 + customQuestions.length}</div>
            <p className="mt-2 text-xs text-purple-600">For adaptive practice</p>
          </div>
        </div>
      </Card>

      {customQuestions.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Custom Questions</h3>
          <div className="space-y-3">
            {customQuestions.slice(0, 10).map((q: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{q.stem.substring(0, 60)}...</p>
                    <p className="mt-1 text-xs text-gray-600">
                      {q.topic} • {q.difficulty}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">ID: {q.id}</span>
                </div>
              </div>
            ))}
          </div>
          {customQuestions.length > 10 && (
            <p className="mt-4 text-sm text-gray-600">
              ... and {customQuestions.length - 10} more questions
            </p>
          )}
        </Card>
      )}

      <Card className="border-l-4 border-blue-500 bg-blue-50">
        <h3 className="mb-2 font-semibold text-blue-900">How to Grow Your Question Bank</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. <strong>Generate with AI:</strong> Create realistic SAT questions using Claude AI</li>
          <li>2. <strong>Import from Sources:</strong> Fetch questions from OpenSAT (free API) or Khan Academy</li>
          <li>3. <strong>Review & Approve:</strong> Validate each question before it goes into your bank</li>
          <li>4. <strong>Adaptive Training:</strong> Your son's practice drills automatically use all questions</li>
        </ol>
      </Card>
    </div>
  );
};
