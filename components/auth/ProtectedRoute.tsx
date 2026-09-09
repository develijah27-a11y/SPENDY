'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

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
      <div className="w-full max-w-7xl mx-auto py-2">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto py-2">
        <DashboardSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
