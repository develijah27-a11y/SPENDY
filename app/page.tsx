'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
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
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Smartphone,
  Check,
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Spendy and who is it designed for?',
      a: 'Spendy is a modern personal finance app tailored for individuals, freelancers, and small business owners in Uganda. It makes it easy to track daily expenses, income streams, monthly budgets, and multi-year savings goals in Ugandan Shillings (UGX).',
    },
    {
      q: 'Is my financial data secure and private?',
      a: 'Yes, absolutely. Your financial data is strictly isolated to your user account using PostgreSQL Row Level Security (RLS) and encrypted sessions. No other user can ever view your records, and Spendy never sells or shares your data with third parties.',
    },
    {
      q: 'Can I use Spendy on both mobile phones and desktop computers?',
      a: 'Yes! Spendy features a dedicated mobile layout with quick-touch navigation and a powerful desktop sidebar interface. Everything stays automatically synchronized across all your devices in real time.',
    },
    {
      q: 'How does Spendy handle offline usage?',
      a: 'Spendy is built with an offline-first architecture using local IndexedDB storage. You can record transactions and check your balances even without an active internet connection; your data will automatically sync to the cloud once you reconnect.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-white selection:bg-emerald-500 flex flex-col justify-between overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <SpendyLogo size="md" showTagline={false} />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#preview" className="hover:text-emerald-400 transition-colors">App Preview</a>
            <a href="#security" className="hover:text-emerald-400 transition-colors">Security</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/15 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>UGANDA&apos;S MODERN PERSONAL FINANCE &amp; BUDGET PLANNER</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Take control of <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            your money.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Track your income, manage expenses, create budgets, and work toward your financial goals — all in one place.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-slate-300" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3 font-semibold">
          100% Free • No Credit Card Required • Total Data Privacy
        </p>

        {/* 3. Visual Interactive Preview of the App */}
        <div id="preview" className="mt-14 relative mx-auto max-w-5xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/20 shadow-2xl shadow-emerald-950/40">
          <div className="rounded-2xl bg-[#090E1A] border border-white/10 overflow-hidden text-left p-4 sm:p-7 space-y-6">
            {/* Top Bar of Preview */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">
                  spendy.app/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live Encrypted Vault</span>
              </div>
            </div>

            {/* Dashboard Sample KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Total Balance</span>
                <p className="text-lg sm:text-2xl font-black font-mono text-emerald-400">UGX 2,450,000</p>
                <span className="text-[10px] font-semibold text-slate-400">Net active funds</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Month Income</span>
                <p className="text-lg sm:text-2xl font-black font-mono text-white">UGX 3,800,000</p>
                <span className="text-[10px] font-semibold text-emerald-400">Salary &amp; Side Hustle</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Month Expenses</span>
                <p className="text-lg sm:text-2xl font-black font-mono text-red-400">UGX 1,350,000</p>
                <span className="text-[10px] font-semibold text-slate-400">35.5% of income</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Net Savings</span>
                <p className="text-lg sm:text-2xl font-black font-mono text-purple-400">UGX 2,450,000</p>
                <span className="text-[10px] font-semibold text-purple-400">64.5% savings rate</span>
              </div>
            </div>

            {/* Split Feed: Recent Transactions & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Transactions Feed */}
              <div className="lg:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-white/10">
                  <span className="text-white">Recent Transactions</span>
                  <span className="text-emerald-400">Live Ledger</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Monthly Consulting Salary</p>
                        <p className="text-[10px] text-slate-400">Salary / Wage • Today</p>
                      </div>
                    </div>
                    <span className="font-black font-mono text-emerald-400">+ UGX 3,000,000</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Umeme Yaka &amp; NWSC Water</p>
                        <p className="text-[10px] text-slate-400">Utilities • Yesterday</p>
                      </div>
                    </div>
                    <span className="font-black font-mono text-red-400">- UGX 150,000</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Monthly Rent</p>
                        <p className="text-[10px] text-slate-400">Rent &amp; Housing • Aug 28</p>
                      </div>
                    </div>
                    <span className="font-black font-mono text-red-400">- UGX 800,000</span>
                  </div>
                </div>
              </div>

              {/* Budget Progress Meter */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-white/10">
                  <span className="text-white">Monthly Budgets</span>
                  <span className="text-emerald-400">67% Remaining</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Food &amp; Dining</span>
                      <span className="font-mono text-emerald-400">UGX 250,000 / 500,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Transport (Boda &amp; Matatu)</span>
                      <span className="font-mono text-amber-400">UGX 150,000 / 200,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>Tuition Savings Goal</span>
                      <span className="font-mono text-purple-400">UGX 1,500,000 / 2,000,000</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            ENGINEERED FOR FINANCIAL CLARITY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything you need to master your money
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-300">
            Powerful tools designed specifically for Ugandan currency, daily cash flows, mobile money, and long-term wealth goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/15 space-y-3 group hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Expense &amp; Income Tracker</h3>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
              Log daily transactions in seconds. Categorize food, transport, utilities, airtime, and business revenue with full audit history.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/15 space-y-3 group hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Smart Monthly Budgets</h3>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
              Set spending limits per category. Receive visual threshold warnings before you overspend so you always stay within budget.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/15 space-y-3 group hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Savings Goals &amp; Milestones</h3>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
              Create savings targets for emergency funds, tuition, plot purchases, and business capital. Track contributions with milestone progress.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl glass-panel border border-white/15 space-y-3 group hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-white">Financial Analytics</h3>
            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
              Visualize your net savings rate, monthly trends, and spending breakdowns computed strictly from your actual database records.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Security & Privacy Pillars */}
      <section id="security" className="py-16 px-4 sm:px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              BANK-GRADE ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Your financial data is 100% private and isolated
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-xl mx-auto">
              We know money data is deeply personal. Spendy is built from the ground up with strict security guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="p-5 rounded-2xl glass-panel border border-white/15 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-white">Row Level Isolation</h4>
              <p className="text-xs font-semibold text-slate-300">
                Every query is verified at the database level with PostgreSQL Row Level Security. No other user can ever view or modify your data.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/15 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-white">Encrypted Credentials</h4>
              <p className="text-xs font-semibold text-slate-300">
                Passwords are cryptographically hashed and sessions are managed with secure, expiring JWT tokens.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/15 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-white">Zero Third-Party Sharing</h4>
              <p className="text-xs font-semibold text-slate-300">
                Your data belongs solely to you. We do not sell user data, track you with ad cookies, or share information with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-3xl mx-auto space-y-8 text-left w-full">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl font-black text-white">
            Common questions about Spendy
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-white/15 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-black text-sm text-white cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs font-semibold text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="py-16 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-emerald-500/30 relative overflow-hidden bg-gradient-to-tr from-emerald-950/60 via-slate-900/80 to-teal-950/40 shadow-2xl space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Start taking control of your finances today.
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-xl mx-auto">
            Join individuals and entrepreneurs across Uganda building financial security with Spendy.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <SpendyLogo size="sm" showTagline={false} />
          <span>• Uganda Personal Finance Edition (UGX)</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          <Link href="/forgot-password" className="hover:text-white transition-colors">Reset Password</Link>
        </div>
        <p>© {new Date().getFullYear()} Spendy. All rights reserved.</p>
      </footer>
    </div>
  );
}
