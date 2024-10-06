import React from 'react';

interface KeyProps {
  letter: string;
  onClick: (letter: string) => void;
  status: 'unused' | 'correct' | 'present' | 'absent';
}

const Key: React.FC<KeyProps> = ({ letter, onClick, status }) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'correct': return 'bg-green-500';
      case 'present': return 'bg-yellow-500';
      case 'absent': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <button
      className={`${getBackgroundColor()} px-2 py-4 text-sm font-bold rounded m-0.5 text-white transition-colors`}
      onClick={() => onClick(letter)}
      style={{ minWidth: letter.length > 1 ? '48px' : '36px' }}
    >
      {letter}
    </button>
  );
};

interface KeyBoardProps {
  onKeyPress: (letter: string) => void;
  keyStatus: Record<string, 'unused' | 'correct' | 'present' | 'absent'>;
}

export default function KeyBoard({ onKeyPress, keyStatus }: KeyBoardProps) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="flex flex-col items-center gap-1 mt-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center w-full">
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              onClick={onKeyPress}
              status={keyStatus[letter] || 'unused'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}