import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  importFromOpenSAT,
  importFromKhanAcademy,
  validateQuestion,
  AVAILABLE_SOURCES,
  type ImportedQuestionSource,
} from '../../lib/questionImporter';
import type { Question } from '../../types';
import { TOPIC_LABELS } from '../../data/constants';

export const QuestionImporter: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<ImportedQuestionSource | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImportOpenSAT = async () => {
    setIsImporting(true);
    setError(null);
    setImportedQuestions([]);

    try {
      const questions = await importFromOpenSAT();

      // Validate questions
      const validQuestions = questions.filter(q => {
        const errors = validateQuestion(q);
        return errors.length === 0;
      });

      setImportedQuestions(validQuestions);
      alert(`Successfully imported ${validQuestions.length} questions from OpenSAT!`);
    } catch (err) {
      setError(`Error importing from OpenSAT: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportKhanAcademy = async () => {
    if (!csvInput.trim()) {
      setError('Please paste Khan Academy CSV data');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportedQuestions([]);

    try {
      const questions = await importFromKhanAcademy(csvInput);

      // Validate questions
      const validQuestions = questions.filter(q => {
        const errors = validateQuestion(q);
        return errors.length === 0;
      });

      setImportedQuestions(validQuestions);
      setCsvInput('');
      alert(`Successfully imported ${validQuestions.length} questions from Khan Academy!`);
    } catch (err) {
      setError(`Error importing from Khan Academy: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleApproveQuestion = (index: number) => {
    const question = importedQuestions[index];

    // Save to localStorage
    const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
    customQuestions.push(question);
    localStorage.setItem('customQuestions', JSON.stringify(customQuestions));

    // Remove from imported list
    setImportedQuestions(importedQuestions.filter((_, i) => i !== index));
    setError(null);
    alert('Question approved and saved!');
  };

  const handleRejectQuestion = (index: number) => {
    setImportedQuestions(importedQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Available Sources */}
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Import SAT Questions</h2>
        <p className="mb-6 text-gray-600">
          Choose a source to import real SAT questions to your question bank
        </p>

        <div className="space-y-4">
          {AVAILABLE_SOURCES.map((source) => (
            <div
              key={source.source}
              className={`rounded-lg border-2 p-4 cursor-pointer transition ${
                selectedSource?.source === source.source
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSource(source)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{source.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{source.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    ~{source.questionCount.toLocaleString()} questions available
                  </p>
                </div>
                <Badge variant="info">{source.source}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* OpenSAT Import */}
      {selectedSource?.source === 'opensat' && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Import from OpenSAT</h3>
          <p className="mb-4 text-sm text-gray-600">
            OpenSAT is an open-source community of SAT questions. This will fetch their latest questions.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleImportOpenSAT}
            disabled={isImporting}
          >
            {isImporting ? 'Importing from OpenSAT...' : 'Import Questions from OpenSAT'}
          </Button>
        </Card>
      )}

      {/* Khan Academy Import */}
      {selectedSource?.source === 'khan-academy' && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Import from Khan Academy</h3>
          <div className="mb-4 space-y-2 text-sm text-gray-600">
            <p>Khan Academy doesn't have a public API, but you can export your data:</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Go to https://www.khanacademy.org/test-prep/sat</li>
              <li>If you're an educator, go to your class and download the question report as CSV</li>
              <li>Paste the CSV content below</li>
            </ol>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">Paste Khan Academy CSV</label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Paste CSV data here..."
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-mono text-sm"
              rows={6}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleImportKhanAcademy}
            disabled={isImporting || !csvInput.trim()}
          >
            {isImporting ? 'Importing from Khan Academy...' : 'Import Questions'}
          </Button>
        </Card>
      )}

      {/* College Board Import Info */}
      {selectedSource?.source === 'college-board' && (
        <Card className="border-l-4 border-yellow-500 bg-yellow-50">
          <h3 className="mb-2 text-lg font-semibold text-yellow-900">College Board Institutional Access</h3>
          <p className="text-sm text-yellow-800">
            College Board's official SAT questions are available through their K-12 Reporting Portal API.
            This requires an institutional account and API credentials.
          </p>
          <div className="mt-4 space-y-2 text-sm text-yellow-800">
            <p className="font-medium">To use this:</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Log into your College Board account</li>
              <li>Request API access through K-12 Reporting Portal</li>
              <li>Generate API credentials</li>
              <li>Contact us for integration support</li>
            </ol>
          </div>
          <a
            href="https://satsuite.collegeboard.org/help-center/k12-reporting-portal/exporting-downloading-data/api-access"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Learn more about College Board API →
          </a>
        </Card>
      )}

      {/* Review Imported Questions */}
      {importedQuestions.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Review Imported Questions</h3>
          <p className="mb-4 text-sm text-gray-600">
            {importedQuestions.length} question(s) imported. Approve or reject each one before adding to your question bank.
          </p>

          <div className="space-y-6">
            {importedQuestions.map((question, index) => (
              <div
                key={index}
                className="rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="info">{TOPIC_LABELS[question.topic]}</Badge>
                    <Badge variant="warning">{question.difficulty}</Badge>
                  </div>
                  <button
                    onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedIndex === index ? 'Hide' : 'Show'} details
                  </button>
                </div>

                {selectedIndex === index && (
                  <div className="mb-4 space-y-3 bg-gray-50 p-4">
                    {question.stimulus && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Passage:</p>
                        <p className="text-sm text-gray-700">{question.stimulus}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-900">Question:</p>
                      <p className="text-sm text-gray-700">{question.stem}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Options:</p>
                      <div className="space-y-1">
                        {question.choices.map((choice) => (
                          <p
                            key={choice.id}
                            className={`text-sm ${
                              choice.id === question.correctAnswer
                                ? 'font-semibold text-green-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {choice.id}. {choice.text}
                            {choice.id === question.correctAnswer && ' ✓'}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Explanation:</p>
                      <p className="text-sm text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleApproveQuestion(index)}
                  >
                    ✓ Approve & Save
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleRejectQuestion(index)}
                  >
                    ✗ Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
