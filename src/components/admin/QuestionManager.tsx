import React, { useState } from 'react';
import { ALL_TOPICS, TOPIC_LABELS } from '../../data/constants';
import type { Topic, Difficulty, GeneratedQuestion } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { generateMultipleQuestions, convertToQuestion } from '../../lib/questionGenerator';
import { QUESTIONS } from '../../data/questions';

export const QuestionManager: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic>('algebra');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const questions = await generateMultipleQuestions(selectedTopic, selectedDifficulty, questionCount);
      setGeneratedQuestions(questions);
    } catch (err) {
      setError(`Error generating questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveQuestion = (index: number) => {
    const question = generatedQuestions[index];
    const newId = `custom-${Date.now()}-${index}`;
    const convertedQuestion = convertToQuestion(question, newId);

    // In a real app, this would save to a backend
    // For now, we'll store in localStorage
    const customQuestions = JSON.parse(localStorage.getItem('customQuestions') || '[]');
    customQuestions.push(convertedQuestion);
    localStorage.setItem('customQuestions', JSON.stringify(customQuestions));

    // Remove from generated list
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
    setError(null);
    alert('Question approved and saved!');
  };

  const handleRejectQuestion = (index: number) => {
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-2xl font-semibold">Generate SAT Questions</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as Topic)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {ALL_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {TOPIC_LABELS[topic]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">How many questions?</label>
            <input
              type="number"
              min="1"
              max="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, Math.min(5, parseInt(e.target.value))))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-600">Generate up to 5 at a time (each takes 10-20 seconds)</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <p className="mt-2 text-xs">Make sure VITE_CLAUDE_API_KEY is set in your .env file</p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating... This may take a minute' : 'Generate Questions'}
          </Button>
        </div>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Review Generated Questions</h3>
          <p className="mb-4 text-sm text-gray-600">
            {generatedQuestions.length} question(s) generated. Approve or reject each one.
          </p>

          <div className="space-y-6">
            {generatedQuestions.map((question, index) => (
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

      <Card>
        <h3 className="mb-4 text-lg font-semibold">Question Bank Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-xs text-blue-700">Default Questions</div>
            <div className="text-2xl font-bold text-blue-600">{QUESTIONS.length}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-xs text-green-700">Custom Questions</div>
            <div className="text-2xl font-bold text-green-600">
              {JSON.parse(localStorage.getItem('customQuestions') || '[]').length}
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-l-4 border-blue-500 bg-blue-50">
        <h3 className="mb-2 font-semibold text-blue-900">Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. Get your Claude API key from <a href="https://console.anthropic.com" className="underline">console.anthropic.com</a></li>
          <li>2. Create a <code className="bg-white px-1">.env</code> file in the project root with:</li>
          <li className="ml-4 font-mono bg-white p-2">VITE_CLAUDE_API_KEY=your_key_here</li>
          <li>3. Restart the dev server with <code className="bg-white px-1">npm run dev</code></li>
          <li>4. Come back here to generate questions</li>
        </ol>
      </Card>
    </div>
  );
};
