import { useState, useEffect, useCallback } from 'react';
import './App.css'
import GameBoard from './components/GameBoard';
import KeyBoard from './components/KeyBoard';

function App() {
  const [correctWord, setCorrectWord] = useState("REACT");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const startNewGame = useCallback(() => {
    setGameKey(k => k + 1);
  }, []);

  useEffect(() => {
    const fetchRandomWord = async () => {
      console.log("Fetching new word, gameKey:", gameKey);
      const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await response.json();
      console.log(data);
      setCorrectWord(data[0].toUpperCase());
      setIsGameOver(false);
    };
    fetchRandomWord();
  }, [gameKey])
  

  return (
    <div className='bg-slate-950 h-screen'>
      <div className='flex flex-col items-center text-white'>
        <GameBoard correctWord={correctWord} isGameOver={isGameOver} setIsGameOver={setIsGameOver}/>
        {/* <div>
          {correctWord}
        </div> */}
        <KeyBoard />
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
