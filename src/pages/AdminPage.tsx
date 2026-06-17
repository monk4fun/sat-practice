import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QuestionManager } from '../components/admin/QuestionManager';

export const AdminPage: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    // Simple password check - change this to something secure
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
          <p className="mb-6 text-gray-600">Enter the admin password to access question generation</p>

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
          <p className="mt-2 text-gray-600">Generate and manage SAT questions</p>
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

      <QuestionManager />
    </div>
  );
};
