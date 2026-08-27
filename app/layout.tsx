import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spendy — Know Your Money. Control Your Future.',
  description: 'Spendy is a secure personal finance platform that helps you track your income, expenses, savings, budgets, and financial goals.',
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
    <html lang="en" className={`dark ${jakarta.variable} ${mono.variable}`}>
      <body className="antialiased min-h-screen bg-[#070A12] text-gray-100 font-sans selection:bg-emerald-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
