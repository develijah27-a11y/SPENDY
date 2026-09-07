'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
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

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070A12] text-white p-6 relative overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="flex flex-col items-center gap-5 relative z-10 max-w-sm w-full text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
            <SpendyLogo size="md" showTagline={false} />
          </div>
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
