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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#060911] text-white selection:bg-emerald-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="text-center flex justify-center">
          <Link href="/" className="inline-block cursor-pointer">
            <SpendyLogo size="lg" showTagline={true} />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-950/90 border-2 border-slate-700/80 shadow-2xl space-y-5 backdrop-blur-xl">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-100">
              Sign in to manage your finances, track spending, and review your savings.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email */}
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-white uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline text-xs"
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
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-inner transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-1 transition-colors"
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
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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

          {/* Link to Signup */}
          <div className="pt-3 border-t border-slate-700/80 text-center text-xs">
            <span className="text-white font-medium">Don&apos;t have an account? </span>
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
