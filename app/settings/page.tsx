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
  Sparkles,
  Download,
  Plus,
  Tag,
  Wallet,
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
    resetToDemoData,
    clearAllData,
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

  const handleResetToDemo = () => {
    if (confirm('Load Uganda sample transactions and balances? This is great for exploring all features.')) {
      resetToDemoData();
      setStartingBalInput('0');
      setSuccessMsg('Sample Uganda dataset loaded!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all sample data and start completely fresh with a clean slate?')) {
      clearAllData();
      setStartingBalInput('0');
      setSuccessMsg('All sample data removed! You now have a clean slate.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>App Settings & Preferences</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Configure appearance theme, profile, starting balances, custom categories, and CSV data export
          </p>
        </div>

        <button
          onClick={exportDataCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
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
              <span>Obsidian Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Starting Balance Configuration */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
            <span>Initial Opening / Starting Balance</span>
          </h3>

          <form onSubmit={handleSaveStartingBalance} className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                Starting Baseline Balance (UGX)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  UGX
                </span>
                <input
                  type="number"
                  min="0"
                  value={startingBalInput}
                  onChange={(e) => setStartingBalInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Your initial cash/bank opening baseline. Current Balance = (Starting Balance + Lifetime Income) - Lifetime Expenses.
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

        {/* Profile & Emergency Buffer */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
            <span>Profile & Regional Preferences</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Standard Currency</label>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-black text-gray-950 dark:text-white">Ugandan Shilling (UGX)</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Locked UGX 🇺🇬
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
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

              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Category Management Overview */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Categories ({categories.length})</span>
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                Expense and income categorization
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

      {/* Data Management: Clean Slate vs Sample Data */}
      <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
        <div>
          <h3 className="font-black text-sm text-gray-950 dark:text-white">Dataset & Account Ledger Management</h3>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            Switch between a clean 0-balance real ledger or explore with sample Uganda data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Start Fresh Button */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <h4 className="font-black text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Start Clean (Remove Sample Data)</span>
              </h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Wipes all mock transactions and resets your accounts to 0 UGX so you can record your real finances.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="w-full py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-700 dark:text-red-300 font-black text-xs transition-colors cursor-pointer"
            >
              Clear All Data (Clean Slate)
            </button>
          </div>

          {/* Load Sample Data Button */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <h4 className="font-black text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Load Sample Uganda Data</span>
              </h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Loads realistic sample transactions, budgets, MoMo & Bank balances for quick feature exploration.
              </p>
            </div>
            <button
              onClick={handleResetToDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-black text-xs transition-colors cursor-pointer"
            >
              Load Uganda Sample Data
            </button>
          </div>
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
