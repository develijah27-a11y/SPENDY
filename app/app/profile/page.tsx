'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Save,
} from 'lucide-react';

function ProfileContent() {
  const { user, profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'UGX');
  const [phone, setPhone] = useState(profile?.phone_number || '');

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCurrency(profile.currency || 'UGX');
      setPhone(profile.phone_number || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatus({ error: 'Full name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        currency,
        phone_number: phone.trim() || undefined,
      });

      if (error) {
        setStatus({ error });
      } else {
        setStatus({ success: 'Your profile has been saved successfully in PostgreSQL.' });
      }
    } catch {
      setStatus({ error: 'Failed to update profile. Please check your connection.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-white selection:bg-emerald-500 flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-white/15 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Spendy App</span>
          </Link>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            Protected Profile
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-emerald-400" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            Manage your personal details, preferred currency, and account identity.
          </p>
        </div>

        {status?.success && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{status.success}</span>
          </div>
        )}

        {status?.error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{status.error}</span>
          </div>
        )}

        {/* Profile Card Form */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="David Mukasa"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>

            {/* Email (Read only from Supabase Auth) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-200">
                  Email Address
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">Managed via Supabase Auth</span>
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-mono font-medium cursor-not-allowed"
              />
            </div>

            {/* Currency Preference */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-bold text-slate-200 mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 772 123 456"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Database isolation note */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile record updates are secured with PostgreSQL Row Level Security (RLS).</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
