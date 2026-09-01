'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import { ShieldCheck } from 'lucide-react';

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
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col items-center gap-6 relative z-10 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Brand Logo */}
          <div className="relative p-4 rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/15 shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl">
            <SpendyLogo size="lg" showTagline={false} />
          </div>

          {/* Status info */}
          <div className="space-y-1.5">
            <h2 className="text-base font-black text-white tracking-tight">
              Loading Financial Workspace
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Encrypted Session • PostgreSQL Vault</span>
            </div>
          </div>

          {/* Ultra-sleek progress line */}
          <div className="w-44 h-1 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 rounded-full animate-[shimmer_1.4s_infinite_linear]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12]">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
