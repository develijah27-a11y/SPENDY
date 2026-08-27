'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSpendy } from '@/lib/store/spendyStore';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Wallet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isLoadingAuth } = useSpendy();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [startingBalance, setStartingBalance] = useState('');
  const [primaryAccountType, setPrimaryAccountType] = useState<'cash' | 'mtn_momo' | 'airtel_money' | 'bank'>('cash');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!agreeTerms) {
      setErrorMsg('Please accept the Spendy Terms of Service to proceed.');
      return;
    }

    setLoading(true);

    try {
      const balanceNum = startingBalance ? parseFloat(startingBalance) : 0;
      const res = await signUp({
        email,
        password,
        fullName,
        phone,
        startingBalance: balanceNum,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Account created successfully! Welcome to Spendy UGX.');
        setTimeout(() => {
          router.push('/');
        }, 350);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-black/15 dark:border-white/20 shadow-2xl space-y-6">
        {/* Brand Header with Official Spendy Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <Link href="/" className="group cursor-pointer">
            <SpendyLogo size="lg" showTagline={true} variant="stacked" />
          </Link>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight mt-2">
            Create Your Account
          </h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Start managing your personal finances in UGX with institutional clarity
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Mukasa"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  placeholder="david@spendy.ug"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
                Uganda Phone (MoMo)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0772 123 456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
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

          {/* Optional Starting Balance Setup */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-gray-900 dark:text-white">Initial Starting Balance (Optional)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                UGX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                placeholder="e.g. 500,000"
                min={0}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <select
                value={primaryAccountType}
                onChange={(e) => setPrimaryAccountType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cash">Cash in Pocket</option>
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>
            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
              You can adjust and link more wallets anytime in Accounts & Settings.
            </p>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              I agree to the Spendy Uganda Terms of Service & Privacy Policy
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || isLoadingAuth}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Creating Spendy Account...' : 'Get Started with Spendy UGX'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
