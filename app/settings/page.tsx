'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Coins,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, resetToDemoData } = useSpendy();

  const [copied, setCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isSupabaseLive = isSupabaseConfigured();

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(
      `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to pristine Uganda demo data?')) {
      resetToDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          <span>App Settings & Integrations</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure profile preferences, Safe-to-Spend buffer, and Supabase cloud database
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Uganda demo data successfully restored!</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Currency Settings */}
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Currency & Regional Localization</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Primary Currency</label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">Ugandan Shilling (UGX)</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <span className="text-gray-400 font-mono">UGX 🇺🇬</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Safe-to-Spend Emergency Buffer</label>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300">
                <span className="font-bold text-white text-sm">{formatUGX(user.safe_spend_emergency_buffer || 50000)}</span>
                <p className="text-[11px] text-gray-400 mt-1">
                  Reserved liquid safety cushion kept untouched in Safe-to-Spend daily calculations.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-gray-400 mb-1">User Profile</label>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-semibold text-white">{user.full_name || 'David Mukasa'}</p>
                <p className="text-gray-400 text-[11px]">{user.email || 'david@spendy.ug'}</p>
                <p className="text-gray-400 text-[11px]">Phone: {user.phone_number || '0772 123 456'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Database Connection Status */}
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Cloud Database</span>
            </h3>

            {isSupabaseLive ? (
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Local Demo Mode
              </span>
            )}
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Spendy runs in dual mode: it uses your browser&apos;s persistent local storage for instant offline capability, and connects seamlessly to Supabase PostgreSQL when your API keys are added.
          </p>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-gray-400 text-[11px]">
              <span>.env.local configuration</span>
              <button
                onClick={handleCopyEnv}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-300 text-[11px] overflow-x-auto p-2 bg-white/5 rounded-xl">
              {`NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...`}
            </pre>
          </div>

          <div className="text-[11px] text-gray-400">
            * SQL Migration file is ready in <code className="text-emerald-400">supabase/schema.sql</code> with all RLS policies and Uganda seed categories.
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="rounded-3xl glass-panel p-6 border border-red-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-red-300 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Reset all transactions, budgets, and savings goals back to the pristine default Uganda sample dataset.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold text-xs transition-all cursor-pointer w-fit"
        >
          Reset to Uganda Demo Data
        </button>
      </div>
    </div>
  );
}
