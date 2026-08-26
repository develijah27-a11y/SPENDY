'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { AccountType } from '@/types';
import {
  Landmark,
  Plus,
  Smartphone,
  Wallet,
  Building2,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

export default function AccountsPage() {
  const { accounts, totalBalance, addAccount, updateAccount, deleteAccount } = useSpendy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('mtn_momo');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#10B981');

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setType('mtn_momo');
    setAccountNumber('');
    setBalance('');
    setColor('#10B981');
    setShowAddModal(true);
  };

  const openEditModal = (acc: any) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setAccountNumber(acc.account_number || '');
    setBalance(acc.balance.toString());
    setColor(acc.color || '#10B981');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0;

    if (editingId) {
      updateAccount(editingId, {
        name: name.trim(),
        type,
        account_number: accountNumber.trim() || undefined,
        balance: parsedBalance,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        account_number: accountNumber.trim() || undefined,
        balance: parsedBalance,
        currency: 'UGX',
        color,
        is_archived: false,
      });
    }

    setShowAddModal(false);
  };

  const getAccountIcon = (t: AccountType) => {
    switch (t) {
      case 'mtn_momo':
      case 'airtel_money':
        return Smartphone;
      case 'bank':
        return Building2;
      case 'spendy_wallet':
        return CreditCard;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-emerald-400" />
            <span>Accounts & Balances</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your cash, mobile money, SACCOs, and bank accounts
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Total Aggregation Banner */}
      <div className="rounded-3xl p-6 glass-panel border border-white/15 relative overflow-hidden shadow-2xl">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
          Combined Liquid Wealth
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">{formatUGX(totalBalance)}</h2>
        <p className="text-xs text-gray-400 mt-1">
          Spread across {accounts.length} active financial accounts in Uganda
        </p>
      </div>

      {/* Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          return (
            <div
              key={acc.id}
              className="rounded-3xl glass-panel p-5 border border-white/10 relative group hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: acc.color || '#10B981' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{acc.name}</h3>
                      <p className="text-[11px] text-gray-400 uppercase font-mono">
                        {acc.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(acc)}
                      aria-label="Edit account"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        aria-label="Delete account"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-[11px] text-gray-400">Current Balance:</span>
                  <p className="text-2xl font-bold font-mono text-white mt-0.5">
                    {formatUGX(acc.balance)}
                  </p>
                </div>
              </div>

              {acc.account_number && (
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-400 font-mono flex items-center justify-between">
                  <span>Number / Stage:</span>
                  <span className="text-gray-200">{acc.account_number}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">
                {editingId ? 'Edit Account' : 'Add New Account'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MTN MoMo, Centenary Bank, Petty Cash"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-white/15 text-white"
                >
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="cash">Cash (Physical Wallet)</option>
                  <option value="bank">Bank (Stanbic, Centenary, Equity, Absa, etc.)</option>
                  <option value="spendy_wallet">Spendy Digital Wallet</option>
                  <option value="other">SACCO / Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Balance (UGX)</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Account Number / Phone</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0772... or 903..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Accent Color</label>
                <div className="flex gap-2">
                  {['#10B981', '#FBBF24', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        color === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                {editingId ? 'Save Changes' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
