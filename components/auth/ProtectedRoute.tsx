'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Wallet, ShieldCheck, Sparkles } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/app');
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070A12] text-white p-6 relative overflow-hidden select-none">
        {/* Ambient Gradient Mesh Background */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-6 relative z-10 max-w-sm w-full text-center">
          {/* Animated Fintech Shield Emblem */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-30 blur-lg animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-[#0E1526] border border-white/15 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Spendy</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                Fintech
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              Securing session & loading local database...
            </p>
          </div>

          {/* Smooth Shimmer Progress Track */}
          <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-400 animate-pulse rounded-full" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted & isolated</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12]">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
