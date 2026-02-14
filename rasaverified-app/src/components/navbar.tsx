'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Plus, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { AuthModal } from '@/components/auth-modal';
import { AddRestaurantModal } from '@/components/add-restaurant-modal';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-300 transition-colors">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">RasaVerified</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setShowAddRestaurant(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Restaurant
                </button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="flex items-center gap-2 text-sm text-gray-300 border border-white/10 rounded-full px-3 py-1.5 hover:text-emerald-300 hover:border-emerald-400/30 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-md shadow-lg overflow-hidden z-50">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-emerald-400" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <AddRestaurantModal isOpen={showAddRestaurant} onClose={() => setShowAddRestaurant(false)} />
    </>
  );
}
