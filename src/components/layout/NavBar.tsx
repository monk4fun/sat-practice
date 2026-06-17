import React from 'react';
import { Link } from 'react-router-dom';
import { SyncStatus } from '../ui/SyncStatus';

interface NavBarProps {
  currentPath: string;
}

export const NavBar: React.FC<NavBarProps> = ({ currentPath }) => {
  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-blue-600">SAT Prep</div>
          <SyncStatus />
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              isActive('/')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/drill"
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              isActive('/drill')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Drill
          </Link>
          <Link
            to="/exam"
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              isActive('/exam')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Exam
          </Link>
          <Link
            to="/progress"
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              isActive('/progress')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Progress
          </Link>
        </div>
      </div>
    </nav>
  );
};
