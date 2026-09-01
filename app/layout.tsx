import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Spendy — Know Your Money. Control Your Future.',
  description: 'Spendy is a secure personal finance platform that helps you track your income, expenses, savings, budgets, and financial goals in Ugandan Shillings (UGX).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spendy',
  },
};

export const viewport: Viewport = {
  themeColor: '#070A12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem('spendy_theme_mode_v2');
                if (mode === 'light' || (!mode && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen font-sans selection:bg-emerald-500 selection:text-white bg-[#f8fafc] dark:bg-[#070A12] text-gray-900 dark:text-white transition-colors duration-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
