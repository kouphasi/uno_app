'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [gameId, setGameId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      // Check if user has a nickname
      fetch('/api/users/nickname')
        .then(res => res.json())
        .then(data => {
          if (data.nickname) {
            setNickname(data.nickname);
          } else {
            // No nickname set, redirect to setup
            router.push('/setup-nickname');
          }
        })
        .catch(err => {
          console.error('Failed to fetch nickname:', err);
        });
    }
  }, [session, router]);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/setup-nickname' });
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostPlayerName: nickname,
          maxPlayers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to create game');
      }

      const data = await response.json();
      // Store player info in localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', nickname);

      router.push(`/game/${data.gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: nickname }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to join game');
      }

      const data = await response.json();
      // Store player info in localStorage
      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', nickname);

      router.push(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-xl">読み込み中...</p>
        </div>
      </main>
    );
  }

  // Not logged in - show login screen
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">
            🎴 UNO
          </h1>
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700">Welcome to UNO!</p>
            <p className="text-sm text-gray-600">Googleアカウントでログインしてゲームを始めましょう</p>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 text-lg"
            >
              Googleでログイン
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Logged in but no nickname yet (shouldn't reach here due to redirect in useEffect)
  if (!nickname) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-xl">ニックネームを設定してください...</p>
        </div>
      </main>
    );
  }

  // Logged in with nickname - show game menu
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-800">
          🎴 UNO
        </h1>

        {/* User info */}
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">ようこそ</p>
          <p className="text-lg font-semibold text-gray-800">{nickname}</p>
          <div className="mt-3 space-x-2">
            <button
              onClick={() => router.push('/setup-nickname')}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              ニックネーム変更
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-600 hover:text-gray-700 underline"
            >
              ログアウト
            </button>
          </div>
        </div>

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Create New Game
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Join Game
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateGame} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プレイヤー名
              </label>
              <input
                type="text"
                value={nickname}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">ニックネームでゲームに参加します</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大プレイヤー数 (2-8)
              </label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={2}
                max={8}
                required
              />
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? '作成中...' : 'ゲーム作成'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinGame} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プレイヤー名
              </label>
              <input
                type="text"
                value={nickname}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">ニックネームでゲームに参加します</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ゲームID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ゲームIDを入力"
                required
              />
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? '参加中...' : 'ゲーム参加'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
