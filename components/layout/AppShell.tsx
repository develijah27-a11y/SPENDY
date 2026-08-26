'use client';

import React from 'react';
import { SpendyProvider } from '@/lib/store/spendyStore';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from './QuickAddModal';
import { ReceiptModal } from './ReceiptModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SpendyProvider>
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white transition-colors">
          <Navbar />
          <div className="flex-1 flex w-full max-w-7xl mx-auto">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
          <BottomNav />
          <QuickAddModal />
          <ReceiptModal />
        </div>
      </SpendyProvider>
    </ThemeProvider>
  );
}
