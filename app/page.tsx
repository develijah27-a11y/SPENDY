'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  Users,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#060911] text-white selection:bg-emerald-500 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <SpendyLogo size="md" showTagline={true} />

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <span>Go to App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center py-12 sm:py-20 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Production-Ready Supabase Authentication with RLS</span>
        </div>

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Know your money. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Control your future.
            </span>
          </h1>
          <p className="text-sm sm:text-lg font-semibold text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Spendy is Uganda&apos;s intelligent personal finance platform. Built with military-grade privacy,
            Row Level Security, and isolated user profiles.
          </p>
        </div>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {isAuthenticated ? (
            <div className="space-y-2 text-center">
              <Link
                href="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue as {profile?.full_name || user?.email || 'User'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-400">Your session is active and secure.</p>
            </div>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-slate-300" />
                <span>Log In</span>
              </Link>
            </>
          )}
        </div>

        {/* Security & Authentication Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left w-full">
          <div className="p-5 rounded-3xl glass-panel border border-white/15 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Row Level Security</h3>
            <p className="text-xs font-semibold text-slate-300">
              Each user&apos;s records are strictly isolated at the PostgreSQL kernel level. User A cannot access User B.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/15 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Session Persistence</h3>
            <p className="text-xs font-semibold text-slate-300">
              Seamless browser token restoration, automatic refresh tokens, and instant zero-flash state detection.
            </p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/15 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Verified Identity</h3>
            <p className="text-xs font-semibold text-slate-300">
              Automated email verification, secure password recovery flows, and user profile management.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <p>© {new Date().getFullYear()} Spendy Uganda. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          <Link href="/forgot-password" className="hover:text-white transition-colors">Forgot Password</Link>
        </div>
      </footer>
    </div>
  );
}
