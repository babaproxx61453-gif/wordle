// src/routes/profile.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { getStats, PlayerStats } from '../utils/daily';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [stats, setStats] = useState<PlayerStats>(() => {
    return typeof window !== 'undefined' 
      ? getStats() 
      : { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: '' };
  });

  // Oturum Kontrolü (LocalStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('mysql_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          if (parsedUser.username) {
            localStorage.setItem('user_name', parsedUser.username);
          }
        } catch (e) {
          localStorage.removeItem('mysql_user');
          localStorage.removeItem('user_name');
        }
      }
    }
  }, []);

  // Kayıt Ol (MySQL API)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setMsg({ type: 'error', text: 'Tüm alanları doldur!' });
    if (password.length < 6) return setMsg({ type: 'error', text: 'Şifre en az 6 karakter olmalı!' });

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('https://kelime-backend-pl8m.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');

      setMsg({ type: 'success', text: 'Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsin.' });
      setIsLogin(true);
      setPassword('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  // Giriş Yap (MySQL API)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setMsg({ type: 'error', text: 'Tüm alanları doldur!' });

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('https://kelime-backend-pl8m.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Giriş başarısız.');

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mysql_user', JSON.stringify(data.user));
        if (data.user && data.user.username) {
          localStorage.setItem('user_name', data.user.username);
        }
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  // Çıkış Yap
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mysql_user');
      localStorage.removeItem('user_name');
    }
    setUser(null);
    setUsername('');
    setPassword('');
  };

  if (user) {
    const displayName = user.username || 'Oyuncu';
    const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10 text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg">
            {displayName[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          
          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-2xl font-extrabold text-amber-400">🔥 {stats.currentStreak}</div>
              <div className="text-[11px] text-slate-400 uppercase mt-0.5">Günlük Seri</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-2xl font-extrabold text-emerald-400">%{winRate}</div>
              <div className="text-[11px] text-slate-400 uppercase mt-0.5">Kazanma Oranı</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-2xl font-extrabold">{stats.gamesPlayed}</div>
              <div className="text-[11px] text-slate-400 uppercase mt-0.5">Oynanan</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-2xl font-extrabold">{stats.maxStreak}</div>
              <div className="text-[11px] text-slate-400 uppercase mt-0.5">En İyi Seri</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full h-11 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 hover:border-rose-800/50 border border-slate-700 rounded-xl font-medium transition text-slate-300"
          >
            Çıkış Yap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            onClick={() => { setIsLogin(true); setMsg(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setIsLogin(false); setMsg(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Kayıt Ol
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center mb-1">
          {isLogin ? 'Tekrar Hoş Geldin! 👋' : 'Profil Oluştur 👤'}
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6">
          {isLogin ? 'İstatistiklerine ve serine erişmek için giriş yap.' : 'Serini veritabanında saklamak için hızlıca kayıt ol.'}
        </p>

        <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ör. Kadir34"
              className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none transition text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none transition text-white"
            />
          </div>

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-medium text-center ${msg.type === 'error' ? 'bg-rose-950/50 border border-rose-800 text-rose-300' : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'İşleniyor...' : isLogin ? 'Giriş Yap 🚀' : 'Hesap Oluştur ✨'}
          </button>
        </form>
      </div>
    </main>
  );
}