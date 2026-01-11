'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/exercises');
    router.refresh();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.name || user.email || 'User';
  };

  const isHomePage = pathname === '/exercises' || pathname === '/';

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

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

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-4">
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
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {getUserDisplayName()}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors min-h-[44px]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors min-h-[44px] flex items-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors min-h-[44px] flex items-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/exercises"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center ${
                    pathname === '/exercises' || pathname === '/'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Exercises
                </Link>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center ${
                    pathname === '/dashboard'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Dashboard
                </Link>
                {user ? (
                  <div className="px-4 py-3 space-y-2">
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                      {getUserDisplayName()}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="w-full px-4 py-3 text-base font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors min-h-[44px]"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="block w-full px-4 py-3 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] flex items-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMobileMenu}
                      className="block w-full px-4 py-3 text-base font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors min-h-[44px] flex items-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

    </>
  );
}

