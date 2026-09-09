'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState('UGX');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password rules validation
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

  // Strength score: 0 to 4
  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.minLength) score += 1;
    if (passwordChecks.hasUpper) score += 1;
    if (passwordChecks.hasLower) score += 1;
    if (passwordChecks.hasNumber) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(4, score);
  }, [password, passwordChecks]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  }, [password, strengthScore]);

  // If already logged in, redirect to /app
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/app');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
      } else {
        setErrorMsg('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error, needsEmailVerification } = await signUp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        currency,
      });

      if (error) {
        setErrorMsg(error);
      } else if (needsEmailVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        router.push('/app');
      }
    } catch {
      setErrorMsg('An error occurred during account creation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#060911] text-white selection:bg-emerald-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo */}
        <div className="text-center flex justify-center">
          <Link href="/" className="inline-block" aria-label="Spendy Home">
            <SpendyLogo size="lg" showTagline={false} />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-slate-950/90 p-6 sm:p-8 border-2 border-slate-700 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create your Spendy account
            </h1>
            <p className="text-sm font-bold text-slate-100 leading-snug">
              Start tracking your income, expenses, and savings goals with total privacy.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border-2 border-red-500/40 text-red-200 text-xs font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="David Mukasa"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-colors"
              />
            </div>

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
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>

            {/* Currency Preference */}
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-colors cursor-pointer"
              >
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-mono placeholder:font-sans placeholder:text-slate-400 text-sm font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-300">Password Strength:</span>
                    <span
                      className={
                        strengthScore <= 1
                          ? 'text-red-400'
                          : strengthScore === 2
                          ? 'text-amber-400'
                          : strengthScore === 3
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore <= 1
                          ? 'bg-red-500 w-1/4'
                          : strengthScore === 2
                          ? 'bg-amber-500 w-2/4'
                          : strengthScore === 3
                          ? 'bg-blue-500 w-3/4'
                          : 'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-mono placeholder:font-sans placeholder:text-slate-400 text-sm font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>

            {/* Requirements Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5 text-xs font-bold">
              <span className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                Password Requirements
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <span className={passwordChecks.minLength ? 'text-emerald-400' : 'text-slate-300'}>
                  {passwordChecks.minLength ? '✓' : '○'} 8+ characters
                </span>
                <span className={passwordChecks.hasUpper ? 'text-emerald-400' : 'text-slate-300'}>
                  {passwordChecks.hasUpper ? '✓' : '○'} Uppercase letter
                </span>
                <span className={passwordChecks.hasLower ? 'text-emerald-400' : 'text-slate-300'}>
                  {passwordChecks.hasLower ? '✓' : '○'} Lowercase letter
                </span>
                <span className={passwordChecks.hasNumber ? 'text-emerald-400' : 'text-slate-300'}>
                  {passwordChecks.hasNumber ? '✓' : '○'} Number (0-9)
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-4 border-t border-slate-700 text-center text-xs">
            <span className="text-slate-200 font-semibold">Already have an account? </span>
            <Link
              href="/login"
              className="font-black text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
