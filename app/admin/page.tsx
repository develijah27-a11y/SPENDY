'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Database,
  TrendingUp,
  CheckCircle2,
  Search,
  Server,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const [searchUser, setSearchUser] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Platform synthetic admin metrics
  const totalVolumeUGX = 482950000;
  const totalMerchantVolume = 84320000;
  const totalUsersCount = 1420;
  const receiptsIssuedCount = 2840;

  const mockUsersList = [
    {
      id: 'u-1',
      name: 'David Mukasa',
      email: 'david@spendy.ug',
      phone: '+256 772 123 456',
      role: 'SuperAdmin',
      accountsCount: 5,
      status: 'Active',
      joined: '2026-08-01',
    },
    {
      id: 'u-2',
      name: 'Grace Nakato',
      email: 'grace.nakato@makerere.ac.ug',
      phone: '+256 755 992 110',
      role: 'Student User',
      accountsCount: 3,
      status: 'Active',
      joined: '2026-08-10',
    },
    {
      id: 'u-3',
      name: 'Brian Ssemwogerere',
      email: 'brian.boda@gmail.com',
      phone: '+256 701 445 889',
      role: 'Boda Rider / Trader',
      accountsCount: 2,
      status: 'Active',
      joined: '2026-08-14',
    },
    {
      id: 'u-4',
      name: 'Sarah Akello',
      email: 'akello.sarah@stanbic.co.ug',
      phone: '+256 788 331 229',
      role: 'Professional User',
      accountsCount: 4,
      status: 'Active',
      joined: '2026-08-18',
    },
    {
      id: 'u-5',
      name: 'John Baptist Okello',
      email: 'jb.okello@poultrymukono.ug',
      phone: '+256 776 550 119',
      role: 'Agri-Business',
      accountsCount: 3,
      status: 'Active',
      joined: '2026-08-22',
    },
  ];

  const filteredUsers = mockUsersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40">
              Admin Portal
            </span>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
              Security Level 4
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight mt-1.5 flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-purple-600 dark:text-purple-400 font-black" />
            <span>Spendy Platform Administration</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Real-time platform metrics, user directory, transaction throughput & Supabase cloud health
          </p>
        </div>

        <button
          onClick={handleRefreshMetrics}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-950 dark:text-white text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer w-fit shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono">
            {totalUsersCount.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
          </span>
        </div>

        {/* Total Volume */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Volume Processed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono">
            {formatUGX(totalVolumeUGX)}
          </p>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">UGX throughput across all accounts</span>
        </div>

        {/* Merchant Payments */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Merchant Payments</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono">
            {formatUGX(totalMerchantVolume)}
          </p>
          <span className="text-xs text-purple-700 dark:text-purple-300 font-bold">
            {receiptsIssuedCount} digital receipts generated
          </span>
        </div>

        {/* Database Health */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Supabase Cloud Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>12/12 Tables Live</span>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">RLS Active • Schema Synced</span>
        </div>
      </div>

      {/* System Infrastructure Health Card */}
      <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400 font-black" />
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white">Cloud Infrastructure & Security</h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                PostgreSQL connection, encryption keys, and edge deployment status
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-3.5 py-1 rounded-full border border-emerald-500/40">
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Supabase Project</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Connected</span>
            </div>
            <p className="font-mono text-xs font-bold text-gray-950 dark:text-white mt-1 truncate">
              nsitkygdnifujmygruza
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Row Level Security</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Enforced</span>
            </div>
            <p className="text-xs font-bold text-gray-950 dark:text-white mt-1">12 of 12 Tables Protected</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Vercel Auto-Deploy</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Active</span>
            </div>
            <p className="text-xs font-bold text-gray-950 dark:text-white mt-1">GitHub Actions Pipeline</p>
          </div>
        </div>
      </div>

      {/* Users Management Directory */}
      <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="font-black text-sm text-gray-950 dark:text-white">User Directory & Role Management</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Manage platform users, roles, and linked wallets</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <th className="pb-3 font-black">User</th>
                <th className="pb-3 font-black">Phone</th>
                <th className="pb-3 font-black">Role</th>
                <th className="pb-3 font-black">Accounts</th>
                <th className="pb-3 font-black">Status</th>
                <th className="pb-3 font-black">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center border border-purple-500/40">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-950 dark:text-white">{u.name}</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{u.phone}</td>
                  <td className="py-3.5">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${
                        u.role === 'SuperAdmin'
                          ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-gray-950 dark:text-white">{u.accountsCount} wallets</td>
                  <td className="py-3.5">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
