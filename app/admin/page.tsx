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
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  Server,
  Lock,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const { transactions, accounts, categories } = useSpendy();

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
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
              Admin Portal
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
              Security Level 4
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Spendy Platform Administration</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time platform metrics, user directory, transaction throughput & Supabase cloud health
          </p>
        </div>

        <button
          onClick={handleRefreshMetrics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 text-xs font-semibold border border-black/10 dark:border-white/10 transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {totalUsersCount.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </span>
        </div>

        {/* Total Volume */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Volume Processed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {formatUGX(totalVolumeUGX)}
          </p>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">UGX throughput across all accounts</span>
        </div>

        {/* Merchant Payments */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Merchant Payments</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {formatUGX(totalMerchantVolume)}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">
            {receiptsIssuedCount} digital receipts generated
          </span>
        </div>

        {/* Database Health */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Supabase Cloud Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>12/12 Tables Live</span>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">RLS Active • Schema Synced</span>
        </div>
      </div>

      {/* System Infrastructure Health Card */}
      <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Cloud Infrastructure & Security</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                PostgreSQL connection, encryption keys, and Vercel edge deployment status
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Supabase Project</span>
              <span className="text-emerald-500 font-bold">Connected</span>
            </div>
            <p className="font-mono text-[11px] text-gray-800 dark:text-gray-200 mt-1 truncate">
              nsitkygdnifujmygruza
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Row Level Security</span>
              <span className="text-emerald-500 font-bold">Enforced</span>
            </div>
            <p className="text-[11px] text-gray-800 dark:text-gray-200 mt-1">12 of 12 Tables Protected</p>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Vercel Auto-Deploy</span>
              <span className="text-emerald-500 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-gray-800 dark:text-gray-200 mt-1">GitHub Actions Pipeline</p>
          </div>
        </div>
      </div>

      {/* Users Management Directory */}
      <div className="rounded-3xl glass-panel p-6 border border-black/10 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">User Directory & Role Management</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Manage platform users, roles, and linked wallets</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Accounts</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center border border-purple-500/30">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-gray-700 dark:text-gray-300">{u.phone}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        u.role === 'SuperAdmin'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30'
                          : 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-gray-800 dark:text-gray-200">{u.accountsCount} wallets</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
