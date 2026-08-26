'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSpendy } from '@/lib/store/spendyStore';
import { Wallet, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { setUser, clearAllData } = useSpendy();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phone.trim(),
            default_currency: 'UGX',
          },
        },
      });

      // Clear previous sample data for this new real user
      clearAllData();

      setUser({
        id: data?.user?.id || `user-${Date.now()}`,
        email: email.trim(),
        full_name: fullName.trim() || email.split('@')[0],
        phone_number: phone.trim() || undefined,
        default_currency: 'UGX',
        safe_spend_emergency_buffer: 50000,
      });

      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl glass-panel p-8 border border-black/10 dark:border-white/15 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Create Spendy Account
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Start managing your personal finances in UGX with complete clarity
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Mukasa"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. david@spendy.ug"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Uganda Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0772 123 456"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Get Started with Spendy'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
