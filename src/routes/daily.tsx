import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { getTodayWord, getStats, saveGameResult, PlayerStats } from '../utils/daily';
import { DailyStatsModal } from '../components/daily-stats-modal';

// Kelime listesi (İleride solo-words.ts veya ortak bir dosyadan import edebilirsin)
const KELIME_LISTESI = ["ŞAHİN", "ASLAN", "TİLKİ", "SİNEK", "SÖĞÜT", "ÇAYIR", "IRMAK", "DOLAP", "KALEM", "MELEK"];

const MAX_TRIES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "SİL"]
];

export const Route = createFileRoute('/daily')({
  component: DailyPage,
});

export default function DailyPage() {
  const [targetWord] = useState(() => getTodayWord(KELIME_LISTESI).toUpperCase());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [stats, setStats] = useState<PlayerStats>(() => getStats());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Bugün zaten oynandı mı kontrolü
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastPlayedDate === today) {
      setIsGameOver(true);
      setIsModalOpen(true);
    }
  }, []);

  const handleFinishGame = useCallback((win: boolean) => {
    const updatedStats = saveGameResult(win);
    setStats(updatedStats);
    setIsWin(win);
    setIsGameOver(true);
    setIsModalOpen(true);
  }, []);

  const handleCharInput = useCallback((char: string) => {
    if (isGameOver) return;
    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + char);
    }
  }, [currentGuess, isGameOver]);

  const handleDelete = useCallback(() => {
    if (isGameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameOver]);

  const handleSubmit = useCallback(() => {
    if (isGameOver) return;
    if (currentGuess.length !== WORD_LENGTH) {
      alert("Kelime 5 harfli olmalıdır!");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      handleFinishGame(true);
    } else if (newGuesses.length >= MAX_TRIES) {
      handleFinishGame(false);
    }
  }, [currentGuess, guesses, isGameOver, targetWord, handleFinishGame]);

  // Fiziksel Klavye Desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else {
        const char = e.key.toLocaleUpperCase('tr-TR');
        if (/^[A-ZÇĞİÖŞÜ]$/.test(char)) {
          handleCharInput(char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput, handleDelete, handleSubmit, isGameOver]);

  // Harf Renk Durumunu Hesaplama (Yeşil, Sarı, Gri)
  const getLetterStatus = (letter: string, index: number, word: string) => {
    if (word[index] === letter) return 'bg-emerald-600 border-emerald-500 text-white';
    if (targetWord.includes(letter)) return 'bg-amber-500 border-amber-400 text-white';
    return 'bg-slate-700 border-slate-600 text-slate-300';
  };

  // Klavye Tuş Renkleri
  const getKeyStatus = (key: string) => {
    let status = 'bg-slate-800 text-white hover:bg-slate-700';
    for (const g of guesses) {
      for (let i = 0; i < g.length; i++) {
        if (g[i] === key) {
          if (targetWord[i] === key) return 'bg-emerald-600 text-white';
          if (targetWord.includes(key)) status = 'bg-amber-500 text-white';
          else if (status === 'bg-slate-800 text-white hover:bg-slate-700') status = 'bg-slate-900 text-slate-500 border border-slate-800';
        }
      }
    }
    return status;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 selection:bg-none">
      
      {/* Üst Bilgi */}
<div className="flex flex-col items-center mt-2 mb-4">
  <h1 className="text-3xl font-extrabold flex items-center gap-2">
    📅 Günlük Mod
  </h1>
  <p className="text-xs text-slate-400 mt-1">Her gün tek hakkın var!</p>
</div>

      {/* Oyun Tahtası (Grid) */}
      <div className="grid grid-rows-6 gap-2 my-auto">
        {Array.from({ length: MAX_TRIES }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = '';
                let statusClass = 'bg-slate-900 border-slate-800 text-white';

                if (guess) {
                  letter = guess[colIndex];
                  statusClass = getLetterStatus(letter, colIndex, guess);
                } else if (isCurrentRow && currentGuess[colIndex]) {
                  letter = currentGuess[colIndex];
                  statusClass = 'bg-slate-800 border-slate-500 text-white animate-pulse';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black uppercase transition-all duration-300 ${statusClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Ekran Klavyesi */}
      <div className="w-full max-w-lg mb-2 flex flex-col gap-1.5 px-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'SİL';
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'ENTER') handleSubmit();
                    else if (key === 'SİL') handleDelete();
                    else handleCharInput(key);
                  }}
                  className={`h-12 rounded-lg font-bold text-xs sm:text-sm transition flex items-center justify-center active:scale-95 ${
                    isSpecial ? 'px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold' : `flex-1 ${getKeyStatus(key)}`
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* İstatistik & Seri Pop-Up Modal */}
      <DailyStatsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        stats={stats} 
        isWin={isWin} 
        targetWord={targetWord} 
      />
    </div>
  );
}