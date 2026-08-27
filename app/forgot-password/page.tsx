'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ error: 'Please enter the email address associated with your Spendy account.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setStatus({ error });
      } else {
        setStatus({
          success: `Password reset instructions have been sent to ${email.trim()}. Please check your inbox and spam folder.`,
        });
      }
    } catch {
      setStatus({ error: 'Unable to send recovery email. Please check your internet connection and try again.' });
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
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 mb-3 shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-xs font-semibold text-slate-300">
              Enter your email address and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>

          {status?.success && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{status.success}</p>
                <p className="text-[11px] text-slate-300 font-normal">
                  Click the link in the email to set a new password.
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
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Log In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
