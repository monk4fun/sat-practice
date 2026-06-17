import React from 'react';

interface TimerProps {
  remainingSeconds: number;
  totalSeconds: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({ remainingSeconds, totalSeconds }) => {
  const isLowTime = remainingSeconds < 300; // < 5 minutes
  const isCriticalTime = remainingSeconds < 60;

  let bgColor = 'bg-gray-50';
  let textColor = 'text-gray-900';

  if (isLowTime && !isCriticalTime) {
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-900';
  } else if (isCriticalTime) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-600';
  }

  const progressPercent = (remainingSeconds / totalSeconds) * 100;

  return (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={`text-3xl font-bold ${textColor}`}>
          {formatTime(remainingSeconds)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-500 ${
            isCriticalTime ? 'bg-red-600' : isLowTime ? 'bg-yellow-600' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.max(0, progressPercent)}%` }}
        />
      </div>
    </div>
  );
};
