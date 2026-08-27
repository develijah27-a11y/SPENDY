'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { buildFinancialSummary } from '@/lib/engines/financeEngine';
import { formatUGX } from '@/lib/formatters';
import {
  Sparkles,
  Send,
  Bot,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function CoachPage() {
  const { accounts, transactions, budgets, savingsGoals, debts, user } = useSpendy();

  const financialSummary = buildFinancialSummary(
    accounts,
    transactions,
    budgets,
    savingsGoals,
    debts
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'David'}! I am your Spendy AI Financial Coach. I've reviewed your accounts across MTN MoMo, Airtel, Cash, and Bank accounts.\n\nYou have a savings rate of ${financialSummary.savingsRatePercentage.toFixed(0)}% this month and a Safe-to-Spend allowance of ${formatUGX(financialSummary.safeToSpendDaily)}/day.\n\nHow can I help you optimize your money today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'How can I cut my transport & boda expenses in Kampala?',
    'Is my income enough to start a poultry side-hustle?',
    'Analyze my highest expense category and give me action steps.',
    'How should I allocate savings between tuition and emergency buffer?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          financialSummary,
        }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I am analyzing your finances. Try asking about specific categories or goals!',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-amber-500 font-black" />
          <span>AI Money Coach (Uganda Edition)</span>
        </h1>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
          Intelligent financial guidance, budget optimization, and East African economic context tips
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="text-xs font-bold px-3.5 py-2 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-800 dark:text-purple-200 border border-purple-500/30 text-left transition-all cursor-pointer shadow-sm"
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-2xl p-4 sm:p-6 flex flex-col h-[540px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isAI
                      ? 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-medium shadow-sm'
                      : 'bg-emerald-600 text-white font-semibold shadow-md'
                  }`}
                >
                  {m.text}
                </div>

                {!isAI && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-1 border border-emerald-500/30 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 animate-pulse">
                Spendy AI is analyzing your cash flow and generating insights...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Spendy Coach anything about your budget, savings, or spending..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-gray-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        * Spendy AI Coach provides general budgeting simulations and financial organization tips based on your entered data. It does not replace licensed financial advisory.
      </div>
    </div>
  );
}
