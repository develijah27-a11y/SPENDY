'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { SpendyProvider } from '@/lib/store/spendyStore';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from './QuickAddModal';
import { ReceiptModal } from './ReceiptModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuthPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  return (
    <ThemeProvider>
      <AuthProvider>
        <SpendyProvider>
          {isPublicAuthPage ? (
            <div className="min-h-screen bg-[#060911] text-gray-100 selection:bg-emerald-500 selection:text-white">
              {children}
            </div>
          ) : (
            <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white transition-colors">
              <Navbar />
              <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-36 lg:pb-12 max-w-full overflow-x-hidden">
                {children}
              </main>
              <BottomNav />
              <QuickAddModal />
              <ReceiptModal />
            </div>
          )}
        </SpendyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

