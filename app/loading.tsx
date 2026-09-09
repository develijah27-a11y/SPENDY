import React from 'react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      <DashboardSkeleton />
    </div>
  );
}
