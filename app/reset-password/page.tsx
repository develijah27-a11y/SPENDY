'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      if (password !== confirmPassword) {
        setStatus({ error: 'Passwords do not match.' });
      } else {
        setStatus({ error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.' });
      }
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setStatus({ error });
      } else {
        setStatus({
          success: 'Password updated successfully! You can now log in using your new password.',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch {
      setStatus({ error: 'Failed to update password. Your recovery link may have expired.' });
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 mb-3 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create new password
            </h1>
            <p className="text-xs font-semibold text-slate-300">
              Please enter and confirm your new secure password.
            </p>
          </div>

          {status?.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{status.success}</p>
                <p className="text-[11px] text-slate-300 font-normal">
                  Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {status?.error && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {!status?.success && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* New Password */}
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

              {/* Confirm Password */}
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

              {/* Requirements checklist */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-300 mb-1">Password Requirements:</p>
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
                disabled={isSubmitting || !isPasswordValid}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Back to Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
