'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleResend = async () => {
    if (!email.trim()) {
      setResendStatus({ error: 'Please provide the email address used during registration.' });
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    try {
      const { error } = await resendVerificationEmail(email.trim());
      if (error) {
        setResendStatus({ error });
      } else {
        setResendStatus({ success: `Verification email resent to ${email.trim()}. Please check your inbox and spam folder.` });
      }
    } catch {
      setResendStatus({ error: 'Failed to resend verification link. Please try again in a few moments.' });
    } finally {
      setIsResending(false);
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
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <MailCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Check your email
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
              We&apos;ve sent an activation link to{' '}
              <strong className="text-white font-mono">{email || 'your registered email'}</strong>.
            </p>
            <p className="text-xs text-slate-400">
              Please click the link in your email to verify your account and start using Spendy.
            </p>
          </div>

          {resendStatus?.success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resendStatus.success}</span>
            </div>
          )}

          {resendStatus?.error && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resendStatus.error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {!emailParam && (
              <input
                type="email"
                placeholder="Enter email to resend link"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
              />
            )}

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Resending verification...' : 'Resend verification email'}</span>
            </button>

            <Link
              href="/login"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060911]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
