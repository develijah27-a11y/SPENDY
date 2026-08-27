'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSpendy } from '@/lib/store/spendyStore';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, quickLoginDemo, resetPassword, isLoadingAuth } = useSpendy();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ error?: string; message?: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Successfully signed in! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 300);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userType: 'mukasa' | 'namubiru') => {
    quickLoginDemo(userType);
    setSuccessMsg(`Signed in as ${userType === 'mukasa' ? 'David Mukasa' : 'Sarah Namubiru'}! Redirecting...`);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await resetPassword(forgotEmail || email);
      setForgotStatus(res);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-black/15 dark:border-white/20 shadow-2xl space-y-6">
        {/* Brand Header with Official Spendy Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Link href="/" className="group cursor-pointer">
            <SpendyLogo size="lg" showTagline={true} variant="stacked" />
          </Link>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight mt-2">
            Welcome Back
          </h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Sign in to track Cash, MTN MoMo, Airtel Money & Bank accounts
          </p>
        </div>

        {/* Error Alert with Sharp Contrast */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Sign In Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. david.mukasa@spendy.ug"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-900 dark:text-white">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLoadingAuth}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Spendy'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 justify-center text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Logins</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('mukasa')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                DM
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-950 dark:text-white truncate">David Mukasa</p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">UGX 1.45M</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('namubiru')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                SN
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-950 dark:text-white truncate">Sarah Namubiru</p>
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">MoMo User</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Link to Signup */}
        <div className="text-center pt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
          >
            Create Spendy Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-black text-gray-950 dark:text-white">Reset Password</h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-gray-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Enter your email address and we will send you instructions to reset your password.
            </p>

            {forgotStatus?.error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                {forgotStatus.error}
              </div>
            )}

            {forgotStatus?.message && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {forgotStatus.message}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@spendy.ug"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
