import { useState, useEffect, useCallback } from 'react';
import './App.css'
import GameBoard from './components/GameBoard';
import KeyBoard from './components/KeyBoard';

function App() {
  const [correctWord, setCorrectWord] = useState("REACT");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [keyStatus, setKeyStatus] = useState<Record<string, 'unused' | 'correct' | 'present' | 'absent'>>({});

  const startNewGame = useCallback(() => {
    setGameKey(k => k + 1);
    setKeyStatus({});
  }, []);

  useEffect(() => {
    const fetchRandomWord = async () => {
      console.log("Fetching new word, gameKey:", gameKey);
      const response = await fetch("http://localhost:5000/get_word");
      const data = await response.json();
      console.log(data);
      setCorrectWord(data["word"].toUpperCase());
      setIsGameOver(false);
    };
    fetchRandomWord();
  }, [gameKey])
  

  return (
    <div className='bg-slate-950 h-screen'>
      <div className='flex flex-col items-center text-white'>
        <GameBoard
          correctWord={correctWord}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          setKeyStatus={setKeyStatus}
        />
        <KeyBoard keyStatus={keyStatus} />
        <button
          onClick={startNewGame}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default App
