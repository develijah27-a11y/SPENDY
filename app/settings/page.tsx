'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency } from '@/lib/formatters';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  Sun,
  Moon,
  Trash2,
  Download,
  Printer,
  FileText,
  Plus,
  Tag,
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    user,
    setUser,
    categories,
    addCategory,
    exportDataCSV,
    clearAllData,
  } = useSpendy();
  const { user: authUser, profile, updateProfile, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [successMsg, setSuccessMsg] = useState('');

  // Editable user profile fields
  const [fullName, setFullName] = useState(profile?.full_name || user?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone_number || user?.phone_number || '');

  // New Category Modal State
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#10B981');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile) {
      await updateProfile({
        full_name: fullName.trim(),
        phone_number: phone.trim() || undefined,
      });
    }
    setUser({
      ...user,
      full_name: fullName.trim(),
      phone_number: phone.trim() || undefined,
    });
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await addCategory({
      name: newCatName.trim(),
      type: newCatType,
      icon: 'Tag',
      color: newCatColor,
      is_default: false,
    });

    setShowAddCat(false);
    setNewCatName('');
    setSuccessMsg(`Added category "${newCatName.trim()}"!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to clear all your transactions, budgets, and savings goals? This action cannot be undone.'
      )
    ) {
      clearAllData();
      setSuccessMsg('All financial records have been reset to a clean slate.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Settings &amp; Preferences</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account details, appearance theme, categories, and data export
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Appearance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                Profile Details
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={authUser?.email || user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Email is linked to your authentication provider
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +256 700 000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                Save Profile
              </button>
            </form>
          </div>

          {/* Theme & Currency Preferences */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              App Preferences
            </h2>

            <div className="space-y-4 text-xs">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Currency Standard */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Primary Currency
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Ugandan Shilling (UGX)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Default standard for Spendy Uganda</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    UGX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Categories, Data Export, Danger Zone (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Custom Categories Manager */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                Categories
              </h2>
              <button
                onClick={() => setShowAddCat(true)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Export Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Financial Statements &amp; Reports
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generate structured, month-end PDF statements with cash flows, wealth balance sheets, and full audit ledgers.
            </p>
            <div className="space-y-2">
              <Link
                href="/review"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Monthly Statement (PDF)</span>
              </Link>
              <button
                onClick={exportDataCSV}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Raw Ledger (CSV)</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 sm:p-6 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
            <h2 className="text-sm font-bold text-red-700 dark:text-red-400">
              Reset Financial Records
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400/90">
              Clear all transactions, budgets, and savings targets to restart with a clean slate.
            </p>
            <button
              onClick={handleClearAll}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Reset All Financial Data
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Add Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freelance, Gym"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      newCatType === 'expense'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      newCatType === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
