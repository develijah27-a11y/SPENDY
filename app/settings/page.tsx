'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatCurrency } from '@/lib/formatters';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  Coins,
  Sun,
  Moon,
  Trash2,
  Download,
  Plus,
  Tag,
  ShieldCheck,
  RotateCcw,
  WifiOff,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    user,
    setUser,
    startingBalance,
    setStartingBalance,
    categories,
    addCategory,
    exportDataCSV,
    clearAllData,
    syncState,
    pendingSyncCount,
    triggerManualSync,
  } = useSpendy();
  const { theme, setTheme } = useTheme();

  const [successMsg, setSuccessMsg] = useState('');

  // Editable user profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [emergencyBuffer, setEmergencyBuffer] = useState(
    user?.safe_spend_emergency_buffer?.toString() || '50000'
  );
  const [startingBalInput, setStartingBalInput] = useState(
    startingBalance?.toString() || '0'
  );

  // New Category Modal State
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#10B981');

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

  const handleSaveStartingBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.round(parseFloat(startingBalInput) || 0);
    setStartingBalance(parsed);
    setSuccessMsg(`Starting balance set to ${formatCurrency(parsed)}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
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
    if (confirm('Are you sure you want to clear all your transactions, budgets, and savings goals? This action is permanent.')) {
      clearAllData();
      setStartingBalInput('0');
      setSuccessMsg('All your financial records have been reset to a clean slate.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <SettingsIcon className="w-4 h-4" />
            <span>Preferences & Data Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            App Settings & Account
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Configure appearance theme, profile details, starting balance, custom categories, and export your data.
          </p>
        </div>

        <button
          onClick={exportDataCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Theme Settings */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500 font-bold" />
            <span>Theme & Display Appearance</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-black shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
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
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-black shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400" />
              <span>Sleek Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Starting Balance */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
            <span>Opening Baseline Starting Balance</span>
          </h3>

          <form onSubmit={handleSaveStartingBalance} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                Opening Balance (UGX)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-600 dark:text-emerald-400">
                  UGX
                </span>
                <input
                  type="number"
                  min="0"
                  value={startingBalInput}
                  onChange={(e) => setStartingBalInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-14 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Your initial cash/bank opening baseline. Net Balance = (Starting Balance + Income) - Expenses.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
            >
              Save Starting Balance
            </button>
          </form>
        </div>

        {/* Profile & Currency Preferences */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
            <span>Profile &amp; Regional Preferences</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Standard Currency</label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-black text-gray-950 dark:text-white">Ugandan Shilling (UGX)</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Locked UGX 🇺🇬
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                  Safe-to-Spend Emergency Buffer (UGX)
                </label>
                <input
                  type="number"
                  value={emergencyBuffer}
                  onChange={(e) => setEmergencyBuffer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
              >
                Save Profile Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Custom Category Management */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Categories ({categories.length})</span>
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                Expense and income categories
              </p>
            </div>

            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-gray-950 dark:text-white border border-slate-300 dark:border-slate-700 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color || '#10B981' }}
                  />
                  <span className="font-bold text-gray-950 dark:text-white">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md ${
                    cat.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                  }`}
                >
                  {cat.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone: Clean Slate */}
      <div className="rounded-3xl glass-panel p-6 border border-red-500/20 shadow-xl space-y-4">
        <div>
          <h3 className="font-black text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Danger Zone &amp; Account Reset</span>
          </h3>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            Permanently clear all logged transactions, budgets, and savings goals from your account.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold max-w-lg">
            This action cannot be undone. Make sure you have downloaded a report of your data beforehand if you need a record.
          </p>
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Add Custom Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-gray-950 dark:text-white">Add Custom Category</h3>

            <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. SACCO Contribution, Poultry Feed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2 rounded-xl font-black border ${
                      newCatType === 'expense'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2 rounded-xl font-black border ${
                      newCatType === 'income'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Badge Color</label>
                <div className="flex gap-2">
                  {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCatColor === color ? 'scale-125 ring-2 ring-emerald-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer shadow-md"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
