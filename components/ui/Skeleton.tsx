import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-xl bg-slate-200/80 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/60',
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-9 h-9 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-4 rounded-lg" />
            <Skeleton className="w-36 h-3 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-16 h-6 rounded-xl" />
      </div>
      <div className="space-y-3 pt-1">
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-3/4 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Full structural replica of the Spendy Dashboard (/app)
 * Used for instant skeleton loading without layout shift.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6 animate-in fade-in duration-150">
      {/* 1. Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="w-48 sm:w-64 h-8 rounded-xl" />
          <Skeleton className="w-36 h-3.5 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-28 h-9 rounded-xl" />
          <Skeleton className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      {/* 2. Top Overview: Balance & Safe-to-Spend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Balance Overview */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 rounded-2xl" />
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4 rounded-lg" />
                <Skeleton className="w-24 h-3 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-16 h-7 rounded-xl" />
          </div>

          <div className="space-y-2 py-1">
            <Skeleton className="w-24 h-3 rounded-md" />
            <Skeleton className="w-64 sm:w-80 h-10 rounded-2xl" />
          </div>

          {/* Account Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Right (5 cols): Safe to Spend Allowance */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 rounded-2xl" />
              <div className="space-y-1.5">
                <Skeleton className="w-28 h-4 rounded-lg" />
                <Skeleton className="w-36 h-3 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-16 h-6 rounded-xl" />
          </div>

          <div className="space-y-2 py-2">
            <Skeleton className="w-32 h-3 rounded-md" />
            <Skeleton className="w-48 h-8 rounded-xl" />
            <Skeleton className="w-full h-2.5 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 3. 4-Column Period Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-16 h-3 rounded-md" />
              <Skeleton className="w-6 h-6 rounded-lg" />
            </div>
            <Skeleton className="w-28 sm:w-36 h-7 rounded-xl" />
            <Skeleton className="w-20 h-2.5 rounded-md" />
          </div>
        ))}
      </div>

      {/* 4. Uganda Smart Financial Suite 5-Card Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg" />
          <Skeleton className="w-48 h-4 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* 5. 2-Column Main Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Transactions Activity */}
        <div className="lg:col-span-7 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Right Column (5 cols): Health & Goals */}
        <div className="lg:col-span-5 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
