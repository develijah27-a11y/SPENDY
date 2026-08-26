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
  Lightbulb,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function CoachPage() {
  const { accounts, transactions, budgets, savingsGoals, debts } = useSpendy();

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
      text: `Hello David! I am your Spendy AI Financial Coach. I've reviewed your accounts across MTN MoMo, Airtel, Cash, and Stanbic Bank. 

You have a savings rate of ${financialSummary.savingsRatePercentage.toFixed(0)}% this month and a Safe-to-Spend allowance of ${formatUGX(financialSummary.safeToSpendDaily)}/day.

How can I help you optimize your money today?`,
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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span>AI Money Coach (Uganda Edition)</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Intelligent financial guidance, budget optimization, and East African economic context tips
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-left transition-all cursor-pointer"
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl glass-panel border border-white/15 shadow-2xl p-4 sm:p-6 flex flex-col h-[520px]">
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isAI
                      ? 'bg-white/5 border border-white/10 text-gray-200'
                      : 'bg-emerald-600 text-white font-medium shadow-md'
                  }`}
                >
                  {m.text}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-1 border border-emerald-500/30">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 animate-pulse">
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
          className="pt-4 border-t border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Spendy Coach anything about your budget, savings, or spending..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-400 text-center">
        * Spendy AI Coach provides general budgeting simulations and financial organization tips based on your entered data. It does not replace licensed financial advisory.
      </div>
    </div>
  );
}
