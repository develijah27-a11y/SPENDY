'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Settings,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

function SettingsContent() {
  const router = useRouter();
  const { user, updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Validation
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.matches;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      if (password !== confirmPassword) {
        setPasswordStatus({ error: 'Passwords do not match.' });
      } else {
        setPasswordStatus({ error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.' });
      }
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setPasswordStatus({ error });
      } else {
        setPasswordStatus({ success: 'Password updated successfully! Next login will require your new password.' });
        setPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordStatus({ error: 'Failed to update password. Please check your connection.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-white selection:bg-emerald-500 flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-white/15 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Spendy App</span>
          </Link>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            Account Security
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-purple-400" />
            <span>Security & Authentication Settings</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            Manage your password, credentials, and active authentication session.
          </p>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Change Password</h3>
              <p className="text-xs font-semibold text-slate-300">
                Update your login password securely through Supabase Auth.
              </p>
            </div>
          </div>

          {passwordStatus?.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{passwordStatus.success}</span>
            </div>
          )}

          {passwordStatus?.error && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordStatus.error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              />
            </div>

            {/* Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px]">
              <p className="font-bold text-slate-300 mb-1">Requirements:</p>
              <div className="grid grid-cols-2 gap-1 font-semibold">
                <span className={passwordChecks.minLength ? 'text-emerald-400' : 'text-slate-400'}>
                  {passwordChecks.minLength ? '✓' : '○'} 8+ characters
                </span>
                <span className={passwordChecks.hasUpper ? 'text-emerald-400' : 'text-slate-400'}>
                  {passwordChecks.hasUpper ? '✓' : '○'} Uppercase letter
                </span>
                <span className={passwordChecks.hasLower ? 'text-emerald-400' : 'text-slate-400'}>
                  {passwordChecks.hasLower ? '✓' : '○'} Lowercase letter
                </span>
                <span className={passwordChecks.hasNumber ? 'text-emerald-400' : 'text-slate-400'}>
                  {passwordChecks.hasNumber ? '✓' : '○'} Number (0-9)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword || !isPasswordValid}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Active Session & Logout Card */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Active Session & Sign Out</h3>
                <p className="text-xs font-semibold text-slate-300">
                  Signed in as <strong className="text-white font-mono">{user?.email || 'Authenticated User'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Signing out clears all active session cookies and tokens from the browser.</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
