import React from 'react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function AppLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      <DashboardSkeleton />
    </div>
  );
}
