'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { CategoryType } from '@/types';
import {
  Tag,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';

export default function CategoriesPage() {
  const { categories, addCategory } = useSpendy();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Tag');

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addCategory({
        name: name.trim(),
        type: activeTab,
        color,
        icon,
        is_default: false,
      });
      setShowAddModal(false);
      setName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Financial Categories</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Uganda-focused expense and income category taxonomy
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2.5 rounded-2xl font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            activeTab === 'expense'
              ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Expense Categories ({categories.filter((c) => c.type === 'expense').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2.5 rounded-2xl font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            activeTab === 'income'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Income Categories ({categories.filter((c) => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-3xl glass-panel border border-black/15 dark:border-white/20 flex items-center gap-3.5 hover:border-emerald-500/40 transition-all shadow-md"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md font-black text-sm"
              style={{ backgroundColor: c.color }}
            >
              {c.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs sm:text-sm text-gray-950 dark:text-white truncate">{c.name}</p>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {c.is_default ? 'Standard Uganda' : 'Custom User'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">
                Add Custom {activeTab === 'expense' ? 'Expense' : 'Income'} Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SACCO Shares, Fuel, Church Tithe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Theme Color</label>
                <div className="flex gap-2">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                        color === col ? 'scale-125 ring-2 ring-emerald-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
