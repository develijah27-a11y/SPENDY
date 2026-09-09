import React from 'react';

export default function RootLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 animate-pulse space-y-6">
      {/* Top indeterminate indicator bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse z-50" />
      
      {/* Subtle Page Header Skeleton */}
      <div className="h-8 w-48 rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
      
      {/* Clean Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
      </div>

      <div className="h-64 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800" />
    </div>
  );
}
