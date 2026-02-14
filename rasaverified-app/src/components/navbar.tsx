'use client';

import { useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { AuthModal } from '@/components/auth-modal';
import { AddRestaurantModal } from '@/components/add-restaurant-modal';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);

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
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-300 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
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
