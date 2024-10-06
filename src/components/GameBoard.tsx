import { useEffect, useState, useCallback } from 'react';
import InputField from './InputField';

export default function GameBoard({ correctWord, isGameOver, setIsGameOver, updateKeyStatus }: { correctWord: string, isGameOver: boolean, setIsGameOver: any, updateKeyStatus: any}) {
    const [colNumber, setColNumber] = useState(0);
    const [rowNumber, setRowNumber] = useState(0);
    const [grid, setGrid] = useState<string[][]>(Array(6).fill(null).map(() => Array(5).fill('')));
    const [colorGrid, setColorGrid] = useState<string[][]>(Array(6).fill(null).map(() => Array(5).fill('bg-gray-500')));

    const checkAndColorRow = (rowToCheck: string[], correctWord: string) => {
        const coloredRow = rowToCheck.map((letter, index) => {
        if (letter === correctWord[index]) {
            return 'bg-green-500';
        } else if (correctWord.includes(letter)) {
            return 'bg-yellow-500';
        } else {
            return 'bg-gray-500';
        }
        });
        // Update the grid with colored information
        const newColorGrid = [...colorGrid];
        newColorGrid[rowNumber] = coloredRow;
        setColorGrid(newColorGrid);
    };
    
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        event.preventDefault(); // Add this line
        // event.stopPropagation(); // Add this line
        if (isGameOver) return;

        const key = event.key.toUpperCase();
        if (key === 'BACKSPACE') {
            // Handle backspace
            if (colNumber > 0) {
                const newGrid = [...grid];
                newGrid[rowNumber][colNumber - 1] = '';
                setGrid(newGrid);
                setColNumber(colNumber - 1);
            }
        } else if (key === 'ENTER') {
            // Handle enter key (submit word)
            if (colNumber === 5) {
                const newRowNumber = rowNumber + 1;
                setRowNumber(newRowNumber);
                setColNumber(0);        
                checkAndColorRow(grid[rowNumber], correctWord);
                
                // Check if the game is completed after this guess
                const isGameCompleted = grid[rowNumber].join('') === correctWord;
                if (isGameCompleted || newRowNumber === 6) {
                    setIsGameOver(true);
                }
            }
        } else if (/^[A-Z]$/.test(key) && colNumber < 5) {
            // Handle letter input
            const newGrid = [...grid];
            newGrid[rowNumber][colNumber] = key;
            setGrid(newGrid);
            setColNumber(colNumber + 1);
        }
    }, [colNumber, rowNumber, grid, correctWord, isGameOver, setIsGameOver]);

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => handleKeyDown(event);
        window.addEventListener('keydown', keyDownHandler);
        return () => {
          window.removeEventListener('keydown', keyDownHandler);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        setColNumber(0);
        setRowNumber(0);
        setGrid(Array(6).fill(null).map(() => Array(5).fill('')));
        setColorGrid(Array(6).fill(null).map(() => Array(5).fill('bg-gray-500')));
    }, [correctWord]);

    return (
    <div>
        {grid.map((row: string[], rowIndex: number) => (
          <div key={rowIndex} className='flex'>
            {row.map((letter: string, colIndex: number) => (
              <InputField
                key={`${rowIndex}-${colIndex}`}
                value={letter}
                isActive={rowIndex === rowNumber && colIndex === colNumber}
                bgColor={colorGrid[rowIndex][colIndex]}
              />
            ))}
          </div>
        ))}
        {/* Add empty rows to always display 6 rows */}
        {[...Array(6 - grid.length)].map((_, index) => (
          <div key={`empty-${index}`} className='flex'>
            {[...Array(5)].map((_, colIndex) => (
              <InputField
                key={`empty-${index}-${colIndex}`}
                value=""
                isActive={false}
                bgColor={'bg-gray-500'}
              />
            ))}
          </div>
        ))}
    </div>
    );
}