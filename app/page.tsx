'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">UNO Game</h1>

      {session ? (
        <div className="text-center space-y-6">
          <p className="text-xl">Welcome to UNO!</p>

          {nickname && (
            <div className="space-y-2">
              <p className="text-lg">ニックネーム: <span className="font-semibold">{nickname}</span></p>
              <p className="text-sm text-gray-600">ログイン中: {session.user?.email}</p>
            </div>
          )}

          <div className="space-x-4">
            <button
              onClick={() => router.push('/setup-nickname')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
            >
              ニックネームを変更
            </button>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <p className="text-xl">Welcome to UNO!</p>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            Googleでログイン
          </button>
        </div>
      )}
    </main>
  );
}
