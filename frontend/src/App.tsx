import { useState, useEffect, useCallback } from 'react';
import './App.css'
import GameBoard from './components/GameBoard';
import KeyBoard from './components/KeyBoard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface User {
  name: string;
  email: string;
}

function App() {
  const [correctWord, setCorrectWord] = useState("REACT");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [keyStatus, setKeyStatus] = useState<Record<string, 'unused' | 'correct' | 'present' | 'absent'>>({});
  const [allowedWordList, setAllowedWordList] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const startNewGame = useCallback(() => {
    setGameKey(k => k + 1);
    setKeyStatus({});
  }, []);

  useEffect(() => {
    if (token) {
      // Verify token and set user
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      startNewGame();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    const fetchRandomWord = async () => {
      try {
        let word;
        if (token) {
          // Authenticated flow - fetch from API with game tracking
          const response = await fetch(`${API_URL}/get_word`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          word = data.word;
        } else {
          // Non-authenticated flow - fetch only word list
          const response = await fetch("https://gist.githubusercontent.com/faiznazeer/74d88006748a622aa696bdee811f38fd/raw/60531ab531c4db602dacaa4f6c0ebf2590b123da/wordle-nyt-answers-alphabetical.txt");
          const wordList = (await response.text()).split("\n");
          word = wordList[Math.floor(Math.random() * wordList.length)];
        }
        setCorrectWord(word.toUpperCase());
        setIsGameOver(false);
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    
    fetchRandomWord();
  }, [gameKey, token]);

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
      <nav className='bg-slate-900 p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <h1 className='text-white text-xl font-bold'>Unlimited Wordle</h1>
          {!token ? (
            <GoogleOAuthProvider clientId={import.meta.env.VITE_API_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
              />
            </GoogleOAuthProvider>
          ) : (
            <div className='relative'>
              <button 
                className='flex items-center gap-2 text-white hover:bg-slate-800 px-3 py-2 rounded-md'
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Hi {user?.name}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1'>
                  <button 
                    className='block w-full text-left px-4 py-2 text-white hover:bg-slate-700'
                    onClick={() => {
                      setIsDropdownOpen(false);
                    }}
                  >
                    Profile
                  </button>
                  <button 
                    className='block w-full text-left px-4 py-2 text-white hover:bg-slate-700'
                    onClick={() => {
                      localStorage.removeItem('token');
                      setToken(null);
                      setUser(null);
                      setIsDropdownOpen(false);
                      startNewGame();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className='flex flex-col items-center text-white'>
        <GameBoard
          correctWord={correctWord}
          isGameOver={isGameOver}
          setIsGameOver={setIsGameOver}
          setKeyStatus={setKeyStatus}
          allowedWordList={allowedWordList}
        />
        <KeyBoard keyStatus={keyStatus} />
        {isGameOver && <button
          onClick={startNewGame}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Play Again
        </button>}
        <ToastContainer />
      </div>
    </div>
  )
}

export default App
