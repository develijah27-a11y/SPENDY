'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  MailCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2,
  ExternalLink,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { resendVerificationEmail, verifyOtp } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetEmail = email.trim();
    const cleanToken = otpCode.trim().replace(/\D/g, '');

    if (!targetEmail) {
      setErrorMessage('Please provide your email address.');
      return;
    }

    if (cleanToken.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await verifyOtp(targetEmail, cleanToken);
      if (error) {
        setErrorMessage(error);
      } else {
        setVerifySuccess(true);
        setSuccessMessage('Email verified successfully! You can now log in to your account.');
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(targetEmail)}&verified=1`);
        }, 1800);
      }
    } catch {
      setErrorMessage('Verification failed. Please check your code or request a new one.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setErrorMessage('Please provide the email address used during registration.');
      return;
    }

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { error } = await resendVerificationEmail(targetEmail);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage(`New verification code and link sent to ${targetEmail}. Check your inbox!`);
      }
    } catch {
      setErrorMessage('Failed to resend verification email. Please try again in a moment.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#060911] text-white selection:bg-emerald-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="text-center flex justify-center">
          <Link href="/" className="inline-block cursor-pointer">
            <SpendyLogo size="lg" showTagline={false} />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-slate-950/90 border-2 border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10">
            {verifySuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <MailCheck className="w-8 h-8" />
            )}
          </div>

          {/* Heading and High-Contrast Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {verifySuccess ? 'Account Verified!' : 'Verify your email'}
            </h1>
            <p className="text-sm font-bold text-slate-100 leading-relaxed">
              We sent a 6-digit confirmation code and verification link to:
            </p>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 inline-block">
              <span className="font-mono font-bold text-emerald-400 text-sm break-all">
                {email || 'your registered email'}
              </span>
            </div>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!verifySuccess && (
            <>
              {/* Option 1: 6-Digit Code */}
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      Enter 6-Digit Code
                    </label>
                    <span className="text-[11px] font-bold text-slate-300">From your email</span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                    }}
                    placeholder="000000"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white font-mono font-black text-2xl tracking-[0.5em] text-center placeholder:text-slate-500 placeholder:tracking-widest focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-inner transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otpCode.trim().length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Verify Code</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider / Option 2 */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-wider text-slate-300">
                  Or click the link
                </span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-1">
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Received an email with a link?
                </p>
                <p className="text-xs font-medium text-slate-200">
                  Simply open your email and tap the confirmation button to activate immediately.
                </p>
              </div>

              {/* Email update if empty */}
              {!emailParam && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-white uppercase tracking-wider">
                    Registration Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to resend code"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              {/* Resend button */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending...' : 'Resend 6-Digit Code / Link'}</span>
              </button>
            </>
          )}

          {/* Primary CTA: Proceed to Login */}
          <div className="pt-2 border-t border-slate-700">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-400/50"
            >
              <span>Proceed to Log In</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
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
