import { useState, useEffect, useCallback } from 'react';
import './App.css'
import GameBoard from './components/GameBoard';
import KeyBoard from './components/KeyBoard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [correctWord, setCorrectWord] = useState("REACT");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [keyStatus, setKeyStatus] = useState<Record<string, 'unused' | 'correct' | 'present' | 'absent'>>({});
  const [allowedWordList, setAllowedWordList] = useState<Set<string>>(new Set());

  const startNewGame = useCallback(() => {
    setGameKey(k => k + 1);
    setKeyStatus({});
  }, []);

  useEffect(() => {
    const fetchRandomWord = async () => {
      console.log("Fetching new word, gameKey:", gameKey);
      const response = await fetch("https://8ztmszmnuc.execute-api.ap-south-1.amazonaws.com/prod/get_word");
      const data = await response.json();
      console.log(data);
      setCorrectWord(data["word"].toUpperCase());
      setIsGameOver(false);
    };
    fetchRandomWord();
  }, [gameKey])

  useEffect(() => {
    const fetchWordList = async () => {
      const response = await fetch("https://gist.githubusercontent.com/faiznazeer/358609c97790915efa0a2d90e6192cf0/raw/633058e11743065ad2822e1d2e6505682a01a9e6/wordle-nyt-words-14855.txt");
      const data = await response.text();
      setAllowedWordList(new Set(data.split("\n")));
      console.log("Word list fetched");
    };
    fetchWordList();
  }, []);
  
  return (
    <div className='bg-slate-950 h-screen'>
      <div className='flex flex-col items-center text-white'>
        <GameBoard
          correctWord={correctWord}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          setKeyStatus={setKeyStatus}
          allowedWordList={allowedWordList}
        />
        <KeyBoard keyStatus={keyStatus} />
        <button
          onClick={startNewGame}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Play Again
        </button>
        <ToastContainer />
      </div>
    </div>
  )
}

export default App
