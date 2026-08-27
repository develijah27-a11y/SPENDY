'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  LogIn,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/app';

  const { signIn, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect to app
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim().toLowerCase(), password);
      if (error) {
        setErrorMsg(error);
      } else {
        router.push(returnUrl);
      }
    } catch {
      setErrorMsg('Unable to sign in. Please check your credentials and connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill for testing
  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#060911] text-white selection:bg-emerald-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="text-center flex justify-center">
          <Link href="/" className="inline-block">
            <SpendyLogo size="lg" showTagline={true} />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs font-semibold text-slate-300">
              Sign in to manage your money and track your financial growth.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-200">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline text-[11px]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !password}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Logins */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300">Quick Demo Test Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('david.mukasa@spendy.ug', 'Mukasa2026!')}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-black text-white">David Mukasa</p>
                <p className="text-[10px] text-slate-400 truncate">david.mukasa@spendy.ug</p>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('sarah.namubiru@spendy.ug', 'Namubiru2026!')}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-black text-white">Sarah Namubiru</p>
                <p className="text-[10px] text-slate-400 truncate">sarah.namubiru@spendy.ug</p>
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300 font-semibold text-center pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted credentials & secure JWT sessions</span>
          </div>

          {/* Link to Signup */}
          <div className="pt-3 border-t border-white/10 text-center text-xs">
            <span className="text-slate-300">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060911]" />}>
      <LoginContent />
    </Suspense>
  );
}
