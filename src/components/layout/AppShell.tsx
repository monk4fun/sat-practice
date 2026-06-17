import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';
import { AutoGenerationNotification } from '../ui/AutoGenerationNotification';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <NavBar currentPath={location.pathname} />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
      </main>
      <AutoGenerationNotification />
    </div>
  );
};
