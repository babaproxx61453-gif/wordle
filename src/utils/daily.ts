// src/utils/daily.ts

// 1. Günün kelimesini seçen fonksiyon (5 Harfli)
export function getTodayWord(wordList: string[]): string {
  const today = new Date().toISOString().split('T')[0]; // "2026-07-21"
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % wordList.length;
  return wordList[index];
}

// 2. Seri (Streak) ve İstatistik veri tipi
export interface PlayerStats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayedDate: string;
}

// 3. İstatistikleri okuma
export function getStats(): PlayerStats {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, maxStreak: 0, gamesPlayed: 0, gamesWon: 0, lastPlayedDate: '' };
  }
  const saved = localStorage.getItem('kd_daily_stats');
  return saved ? JSON.parse(saved) : { currentStreak: 0, maxStreak: 0, gamesPlayed: 0, gamesWon: 0, lastPlayedDate: '' };
}

// 4. İstatistikleri kaydetme / güncelleme
export function saveGameResult(isWin: boolean): PlayerStats {
  const today = new Date().toISOString().split('T')[0];
  const stats = getStats();

  if (stats.lastPlayedDate === today) return stats;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (stats.lastPlayedDate === yesterday) {
    stats.currentStreak = isWin ? stats.currentStreak + 1 : 0;
  } else {
    stats.currentStreak = isWin ? 1 : 0;
  }

  if (stats.currentStreak > stats.maxStreak) {
    stats.maxStreak = stats.currentStreak;
  }

  stats.gamesPlayed += 1;
  if (isWin) stats.gamesWon += 1;
  stats.lastPlayedDate = today;

  localStorage.setItem('kd_daily_stats', JSON.stringify(stats));
  return stats;
}