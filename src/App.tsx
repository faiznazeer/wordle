import { useEffect, useState, useCallback } from 'react';
import './App.css'
import InputField from './components/InputField';

function App() {

  const [gameKey, setGameKey] = useState(0);
  const [correctWord, setCorrectWord] = useState("REACT");
  const [colNumber, setColNumber] = useState(0);
  const [rowNumber, setRowNumber] = useState(0);
  const [grid, setGrid] = useState<string[][]>(Array(6).fill(Array(5).fill('')));
  const [colorGrid, setColorGrid] = useState<string[][]>(Array(6).fill(Array(5).fill('bg-gray-500')));

  const fetchRandomWord = useCallback(async () => {
    const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
    const data = await response.json();
    console.log(data);
    setCorrectWord(data[0].toUpperCase());
  }, []);

  const resetGame = useCallback(() => {
    setColNumber(0);
    setRowNumber(0);
    setGrid(Array(6).fill(Array(5).fill('')));
    setColorGrid(Array(6).fill(Array(5).fill('bg-gray-500')));
    setGameKey(prevKey => prevKey + 1);
  }, []);

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
  
  const handleKeyDown = (event: KeyboardEvent) => {
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
        console.log(grid[rowNumber]);
        console.log(rowNumber);
        console.log(colNumber);
        setRowNumber(rowNumber + 1);
        setColNumber(0);        
        checkAndColorRow(grid[rowNumber], correctWord);
      }
    } else if (/^[A-Z]$/.test(key)) {
      // Handle letter input
      if (colNumber < 5) {
        const newGrid = [...grid];
        newGrid[rowNumber][colNumber] = key;
        setGrid(newGrid);
        setColNumber(colNumber + 1);
      }
    }
  };

  useEffect(() => {
    const isGameCompleted = colorGrid[rowNumber - 1]?.every(color => color === 'bg-green-500');
    
    if (!isGameCompleted) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [colNumber, rowNumber, grid]);

  useEffect(() => {
    fetchRandomWord();
    console.log("gk", gameKey);
  }, [gameKey]);

  return (
    <div className='bg-slate-950 h-screen'>
      <div className='flex flex-col items-center text-white'>
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
        <button
          onClick={resetGame}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default App
