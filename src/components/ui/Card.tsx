import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);
