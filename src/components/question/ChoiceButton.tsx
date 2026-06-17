import React from 'react';
import type { Choice } from '../../types';

interface ChoiceButtonProps {
  choice: Choice;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  isSelected,
  isCorrect = false,
  isIncorrect = false,
  disabled = false,
  onClick,
}) => {
  let bgColor = 'bg-white border-gray-300 hover:bg-blue-50';
  if (isSelected && !disabled) bgColor = 'bg-blue-50 border-blue-500';
  if (isCorrect) bgColor = 'bg-green-100 border-green-500';
  if (isIncorrect) bgColor = 'bg-red-100 border-red-500';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex min-h-[60px] gap-3 rounded-lg border-2 p-4 text-left
        transition-colors
        ${bgColor}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        touch-action-manipulation
      `}
    >
      <div className={`
        flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
        border-2 font-bold
        ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-400 text-gray-400'}
        ${isCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
        ${isIncorrect ? 'border-red-500 bg-red-500 text-white' : ''}
      `}>
        {choice.id}
      </div>
      <span className="flex-1 text-gray-900">{choice.text}</span>
      {isCorrect && <span className="text-lg">✓</span>}
      {isIncorrect && <span className="text-lg">✗</span>}
    </button>
  );
};
