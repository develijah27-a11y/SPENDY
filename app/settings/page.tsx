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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-emerald-500" />
            <span>App Settings & Preferences</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure appearance theme, profile, starting balances, custom categories, and CSV data export
          </p>
        </div>

        <button
          onClick={exportDataCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
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

        {/* Starting Balance Configuration */}
        <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Initial Opening / Starting Balance</span>
          </h3>

          <form onSubmit={handleSaveStartingBalance} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 mb-1">
                Starting Balance (UGX)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">
                  UGX
                </span>
                <input
                  type="number"
                  min="0"
                  value={startingBalInput}
                  onChange={(e) => setStartingBalInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white font-bold text-base"
                />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Your initial cash/bank opening baseline. Current Balance = (Starting Balance + Lifetime Income) - Lifetime Expenses.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              Save Starting Balance
            </button>
          </form>
        </div>

        {/* Profile & Emergency Buffer */}
        <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Profile & Regional Preferences</span>
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
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Category Management Overview */}
        <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>Categories ({categories.length})</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Expense and income categorization
              </p>
            </div>

            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-gray-800 dark:text-gray-200 border border-black/10 dark:border-white/10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#10B981' }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    cat.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
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

      {/* Add Custom Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Add Custom Category</h3>

            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. SACCO Contribution, Poultry Feed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2 rounded-xl font-bold border ${
                      newCatType === 'expense'
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                        : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/10 dark:border-white/10'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2 rounded-xl font-bold border ${
                      newCatType === 'income'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-black/10 dark:border-white/10'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Badge Color</label>
                <div className="flex gap-2">
                  {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCatColor === color ? 'scale-125 ring-2 ring-white' : ''
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
                  className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
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
