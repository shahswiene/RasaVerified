'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isLoading, updateUser, logout } = useAuth();
  const router = useRouter();

  const updateNameMutation = useMutation(api.auth.updateName);
  const updatePasswordMutation = useMutation(api.auth.updatePassword);

  // Name form state
  const [newName, setNewName] = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSubmitting, setNameSubmitting] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Redirect if not logged in (after hydration)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    setNameSubmitting(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      await updateNameMutation({ userId: user.userId, name: trimmed });
      updateUser({ name: trimmed });
      setNewName('');
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
      if (process.env.NODE_ENV === 'development') {
        console.log('[profile] Name updated to:', trimmed);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update name';
      setNameError(message);
    } finally {
      setNameSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    setPwSubmitting(true);

    try {
      await updatePasswordMutation({
        userId: user.userId,
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
      if (process.env.NODE_ENV === 'development') {
        console.log('[profile] Password updated');
      }
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Failed to update password';
      const uncaughtIdx = message.indexOf('Uncaught Error: ');
      if (uncaughtIdx !== -1) {
        message = message.substring(uncaughtIdx + 'Uncaught Error: '.length).split('. at ')[0];
      }
      setPwError(message);
    } finally {
      setPwSubmitting(false);
    }
  };

  const memberSince = new Date(user.userId ? Date.now() : 0).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 h-[25rem] w-[25rem] rounded-full bg-emerald-500/8 blur-[160px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-2xl space-y-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Profile header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Profile Settings
          </h1>

          {/* User info card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <User className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{user.name}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">Member since {memberSince}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Change Name */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Change Name
            </h2>

            {nameSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                Name updated successfully!
              </div>
            )}
            {nameError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {nameError}
              </div>
            )}

            <form onSubmit={handleNameUpdate} className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                minLength={2}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder={user.name}
              />
              <button
                type="submit"
                disabled={nameSubmitting || !newName.trim()}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nameSubmitting ? 'Saving...' : 'Update'}
              </button>
            </form>
          </div>
        </motion.section>

        {/* Change Password */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              Change Password
            </h2>

            {pwSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                Password updated successfully!
              </div>
            )}
            {pwError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Danger zone */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-semibold text-red-300 mb-3">Sign Out</h2>
            <p className="text-sm text-gray-400 mb-4">
              You will need to sign in again to add restaurants or reviews.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="px-5 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
