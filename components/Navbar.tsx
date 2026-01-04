'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('fitlog-user') : null;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUsername(user.username || 'User');
      } catch (error) {
        // Invalid stored data
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const userData = {
        username: username.trim(),
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('fitlog-user', JSON.stringify(userData));
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setUsername('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fitlog-user');
    setIsLoggedIn(false);
    setUsername('');
    router.push('/exercises');
  };

  const isHomePage = pathname === '/exercises' || pathname === '/';

  return (
    <>
      <nav className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Home */}
            <div className="flex items-center">
              <Link
                href="/exercises"
                className={`flex items-center gap-2 text-xl font-bold ${
                  isHomePage
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
                } transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>FitLog</span>
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-4">
              <Link
                href="/exercises"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/exercises' || pathname === '/'
                    ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Exercises
              </Link>
              <Link
                href="/dashboard"
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Dashboard
              </Link>

              {/* Login/User Section */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Login
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Enter your name to personalize your experience
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setUsername('');
                  }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

