'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  TrendingUp,
  Wallet,
  PieChart,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  ReceiptText,
  Target,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Spendy and how does it work?',
      a: 'Spendy is a personal finance application built to give you complete visibility over your money. You record your daily income and expenses, set monthly category budgets, and track savings goals in Ugandan Shillings (UGX).',
    },
    {
      q: 'How is my financial data secured?',
      a: 'Your financial data is strictly isolated using PostgreSQL Row Level Security (RLS) and encrypted authentication tokens. Database policies ensure no other account can ever query or modify your records.',
    },
    {
      q: 'Can I use Spendy on my phone and computer?',
      a: 'Yes. Spendy is fully responsive across mobile phones, tablets, and desktop computers with real-time cloud synchronization and offline IndexedDB support.',
    },
    {
      q: 'Is Spendy free to use?',
      a: 'Yes, Spendy is completely free to create an account, track unlimited transactions, create category budgets, and monitor savings milestones.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070A12] text-slate-900 dark:text-white flex flex-col justify-between overflow-x-hidden transition-colors duration-200">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="cursor-pointer" aria-label="Spendy Home">
            <SpendyLogo size="md" showTagline={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#preview" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Overview</a>
            <a href="#problem" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Why Spendy</a>
            <a href="#capabilities" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Capabilities</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0 touch-target flex items-center justify-center"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                href="/app"
                prefetch={true}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 cursor-pointer touch-target whitespace-nowrap shrink-0"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={true}
                  className="px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-white transition-colors cursor-pointer touch-target flex items-center whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  prefetch={true}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 cursor-pointer touch-target whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Real Product Preview */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Next-Gen Personal Finance</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1]">
              Know where your money goes.
            </h1>

            <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Spendy gives you one simple place to track spending, plan your budget, and build better money habits.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/signup"
                prefetch={true}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer touch-target whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#preview"
                className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer touch-target whitespace-nowrap"
              >
                <span>See how it works</span>
              </a>
            </div>
          </div>

          {/* Right Column: Realistic Dashboard Preview */}
          <div id="preview" className="lg:col-span-6">
            <div className="rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden text-left p-5 sm:p-6 space-y-5">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] ml-2 font-semibold">
                    Spendy Dashboard
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                  This Month
                </span>
              </div>

              {/* Total Balance Snapshot */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  TOTAL BALANCE
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                  UGX 2,450,000
                </p>
              </div>

              {/* 3 Metrics: Income, Spent, Savings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Income</span>
                  <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    +UGX 3,200,000
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Spent</span>
                  <p className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 font-mono tabular-nums">
                    -UGX 1,480,000
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Savings</span>
                  <p className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                    UGX 720,000
                  </p>
                </div>
              </div>

              {/* Sample Spending Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Spending by Category</span>
                  <span className="text-slate-500 dark:text-slate-400">Month to Date</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Food &amp; Dining</span>
                      <span className="font-mono text-slate-900 dark:text-slate-200">UGX 420,000</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Transport</span>
                      <span className="font-mono text-slate-900 dark:text-slate-200">UGX 180,000</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Utilities</span>
                      <span className="font-mono text-slate-900 dark:text-slate-200">UGX 310,000</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Recent Transactions */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recent Activity
                </span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Consulting Salary</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Salary • Today</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+UGX 3,000,000</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Groceries &amp; Lunch</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Food • Yesterday</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">-UGX 25,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 2 — The Problem */}
      <section id="problem" className="py-16 px-4 sm:px-6 bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Your money shouldn&apos;t be a mystery.
          </h2>
          <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            People earn money, spend money, save money, and still don&apos;t know where it went. Spendy turns scattered transactions into understandable financial information.
          </p>
        </div>
      </section>

      {/* 4. Section 3 — Four Core Capabilities */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            PRODUCT CAPABILITIES
          </span>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Designed for everyday financial control
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Capability 1: Track */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white">Track</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                Record income and expenses in seconds with clear categories.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600 dark:text-slate-400">Fuel &amp; Boda</span>
                <span className="text-red-600 dark:text-red-400 font-bold">-UGX 15,000</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-600 dark:text-slate-400">Client Payment</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+UGX 450,000</span>
              </div>
            </div>
          </div>

          {/* Capability 2: Plan */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white">Plan</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                Create monthly budgets for the things that matter most.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Food Budget</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">73% used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '73%' }} />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">UGX 80,000 remaining</p>
            </div>
          </div>

          {/* Capability 3: Save */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white">Save</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                Create savings goals and monitor your contribution milestones.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Emergency Fund</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">60%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }} />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">UGX 1.2M of UGX 2.0M</p>
            </div>
          </div>

          {/* Capability 4: Understand */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white">Understand</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                See where your money goes with factual period summaries.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Top Spending</p>
              <p className="text-slate-600 dark:text-slate-400">Food &amp; Dining is currently your biggest expense (35%).</p>
            </div>
          </div>
        </div>
      </section>



      {/* 6. Section 6 — Final CTA */}
      <section className="py-20 px-4 sm:px-6 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
          Start understanding your money.
        </h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Create a free account in less than a minute and take control of your financial habits.
        </p>
        <div className="pt-2">
          <Link
            href="/signup"
            prefetch={true}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-98 cursor-pointer touch-target"
          >
            <span>Create your account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <SpendyLogo size="sm" showTagline={false} />
          <span>• Personal Finance Application</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" prefetch={true} className="hover:text-emerald-600 dark:hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" prefetch={true} className="hover:text-emerald-600 dark:hover:text-white transition-colors">Sign Up</Link>
          <Link href="/forgot-password" prefetch={true} className="hover:text-emerald-600 dark:hover:text-white transition-colors">Reset Password</Link>
        </div>
        <p>© {new Date().getFullYear()} Spendy. All rights reserved.</p>
      </footer>
    </div>
  );
}
