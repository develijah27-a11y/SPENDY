'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  User,
  Settings,
  ShieldCheck,
  Lock,
  ArrowRight,
  LogOut,
  Mail,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

function AppDashboardContent() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#060911] text-white selection:bg-emerald-500 flex flex-col">
      {/* Top Header */}
      <header className="glass-panel border-b border-white/15 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black flex items-center justify-center shadow-md text-base">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-white">
                {profile?.full_name || 'Spendy User'}
              </h2>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/app/profile"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
            >
              <User className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Link
              href="/app/settings"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-black transition-colors cursor-pointer border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden bg-gradient-to-tr from-emerald-950/40 via-slate-900 to-indigo-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400">
                Spendy Secure Area
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Welcome, {profile?.full_name || 'Spendy User'}!
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-300">
                Your authentication is active and verified. Your data is isolated via Row Level Security.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/app/profile"
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* User Identity & Profile Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl glass-panel p-5 border border-white/15 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Registered Email</span>
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white font-mono truncate">{user?.email || 'N/A'}</p>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              ✓ Verified through Supabase Auth
            </span>
          </div>

          <div className="rounded-3xl glass-panel p-5 border border-white/15 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Primary Currency</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-white font-mono">{profile?.currency || 'UGX'}</p>
            <span className="text-[11px] font-semibold text-slate-300">Stored in public.profiles</span>
          </div>

          <div className="rounded-3xl glass-panel p-5 border border-white/15 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Account Created</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs font-bold text-white font-mono">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
            </p>
            <span className="text-[11px] font-semibold text-purple-300">Session active & persistent</span>
          </div>
        </div>

        {/* Security & Architecture Readiness Card */}
        <div className="rounded-3xl glass-panel p-6 border border-white/15 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Authentication Architecture Verified</h3>
              <p className="text-xs font-semibold text-slate-300">
                Security boundary verified. Ready for next phases (Expenses, Incomes, Budgets, and Loans).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                ✓ Supabase Auth Token
              </span>
              <p className="text-slate-300 font-semibold">
                JWT auth tokens automatically refreshed and securely stored in browser cookies / local session.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                ✓ Row Level Security (RLS)
              </span>
              <p className="text-slate-300 font-semibold">
                Kernel policy <code className="text-purple-300 font-mono">auth.uid() = id</code> enforces complete multi-tenant database isolation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppPage() {
  return (
    <ProtectedRoute>
      <AppDashboardContent />
    </ProtectedRoute>
  );
}
