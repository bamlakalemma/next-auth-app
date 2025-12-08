'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      const userData = getUser();
      setAuthenticated(authStatus);
      setUser(userData);
    };

    checkAuth();
  }, []);

  const handleSignOut = () => {
    removeToken();
    setAuthenticated(false);
    setUser(null);
    router.push('/signin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-zinc-50">Authentication App</h1>
          {authenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.name || user?.email || 'User'}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white "
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/signin"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {authenticated ? 'Welcome Back!' : 'Welcome to Homepage'}
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {authenticated
              ? 'You are successfully authenticated. You can now access all features of the application.'
              : 'Get started by creating an account or signing in to your existing account.'}
          </p>
        </div>
      </main>
    </div>
  );
}
