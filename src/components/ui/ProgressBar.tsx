import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantColors = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = false,
  variant = 'default',
}) => {
  const percentage = Math.round((value / max) * 100);
  const variantColor = variantColors[variant];

  return (
    <div className="w-full">
      {label && <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${variantColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-right text-xs text-gray-600">{percentage}%</div>
      )}
    </div>
  );
};
