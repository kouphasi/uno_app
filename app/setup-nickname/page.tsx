'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SetupNicknamePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    if (nickname.length < 2) {
      setError('ニックネームは2文字以上で入力してください');
      return;
    }

    if (nickname.length > 20) {
      setError('ニックネームは20文字以内で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // Save nickname to API
      const response = await fetch('/api/users/nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.message || 'ニックネームの保存に失敗しました');
        setIsLoading(false);
        return;
      }

      // Update session with new nickname
      await update({ nickname: nickname.trim() });

      // Redirect to home or game page
      router.push('/');
    } catch (err) {
      setError('ニックネームの保存に失敗しました');
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>ログインしてください</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">ニックネームを設定</h1>
          <p className="text-gray-600">ゲームで使用するニックネームを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              ニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: プレイヤー1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '保存中...' : '保存して始める'}
          </button>
        </form>

        {session.user?.email && (
          <p className="text-center text-sm text-gray-500">
            ログイン中: {session.user.email}
          </p>
        )}
      </div>
    </main>
  );
}
