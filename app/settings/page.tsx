'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { useTheme } from '@/lib/theme/ThemeContext';
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
  Coins,
  Sun,
  Moon,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, resetToDemoData, clearAllData } = useSpendy();
  const { theme, setTheme } = useTheme();

  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable user profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [emergencyBuffer, setEmergencyBuffer] = useState(
    user?.safe_spend_emergency_buffer?.toString() || '50000'
  );

  const isSupabaseLive = isSupabaseConfigured();

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(
      `NEXT_PUBLIC_SUPABASE_URL=https://nsitkygdnifujmygruza.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const buf = parseFloat(emergencyBuffer) || 50000;
    setUser({
      ...user,
      full_name: fullName.trim(),
      phone_number: phone.trim() || undefined,
      safe_spend_emergency_buffer: buf,
    });
    setSuccessMsg('Profile and preferences updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetToDemo = () => {
    if (confirm('Load Uganda sample transactions and balances? This is great for demonstrating the app.')) {
      resetToDemoData();
      setSuccessMsg('Sample Uganda dataset loaded!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all sample data and start completely fresh with a 0-balance clean slate?')) {
      clearAllData();
      setSuccessMsg('All sample data removed! You now have a clean slate.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-emerald-500" />
          <span>App Settings & Preferences</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Configure appearance theme, profile, Safe-to-Spend emergency buffer, and cloud data
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Theme Settings */}
        <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Theme & Display Appearance</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-md'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span>Clean Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-md'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400" />
              <span>Obsidian Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Currency & Emergency Buffer */}
        <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Regional Localization</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1">Standard Currency</label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <span className="font-bold text-gray-900 dark:text-white">Ugandan Shilling (UGX)</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  Locked UGX 🇺🇬
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1">
                  Safe-to-Spend Emergency Buffer (UGX)
                </label>
                <input
                  type="number"
                  value={emergencyBuffer}
                  onChange={(e) => setEmergencyBuffer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white font-bold"
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Reserved safety cushion kept untouched in Safe-to-Spend daily allowance calculation.
                </p>
              </div>

              <div>
                <label className="block text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Data Management: Clean Slate vs Sample Data */}
      <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Dataset & Account Ledger Management</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Switch between a clean 0-balance real ledger or explore with sample Uganda data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Start Fresh Button */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Start Clean (Remove Sample Data)</span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Wipes all mock transactions and resets your accounts to 0 UGX so you can record your real finances.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="w-full py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-600 dark:text-red-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear All Data (Clean Slate)
            </button>
          </div>

          {/* Load Sample Data Button */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Load Sample Uganda Data</span>
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Loads realistic sample transactions, budgets, MoMo & Bank balances for quick feature demoing.
              </p>
            </div>
            <button
              onClick={handleResetToDemo}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Load Uganda Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
