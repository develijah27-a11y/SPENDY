'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { SpendyProvider } from '@/lib/store/spendyStore';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from './QuickAddModal';
import { ReceiptModal } from './ReceiptModal';
import { RoutePreloader } from './RoutePreloader';

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
          <RoutePreloader />
          {isPublicAuthPage ? (
            <div className="min-h-screen bg-[#090D16] text-gray-100 selection:bg-emerald-500 selection:text-white">
              {children}
            </div>
          ) : (
            <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#090D16] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white transition-colors">
              {/* Desktop Sidebar (lg and up) */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Mobile / Tablet Header (<lg) */}
                <div className="lg:hidden">
                  <Navbar />
                </div>

                {/* Page Content with safe padding for mobile bottom bar */}
                <main className="flex-1 w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] lg:pb-12 max-w-full overflow-x-hidden">
                  {children}
                </main>
              </div>

              {/* Mobile Bottom Navigation (<lg) */}
              <BottomNav />

              {/* Global Modals */}
              <QuickAddModal />
              <ReceiptModal />
            </div>
          )}
        </SpendyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
