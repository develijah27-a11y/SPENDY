'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Account,
  Budget,
  Category,
  Debt,
  DebtPayment,
  FinancialGoal,
  FinancialHealthBreakdown,
  FinancialSummary,
  Loan,
  LoanRepayment,
  LoanType,
  LoanStatus,
  MerchantPaymentRequest,
  PaymentReceipt,
  PeriodFilter,
  DashboardMetrics,
  RecurringTransaction,
  SafeToSpendDetails,
  SavingsGoal,
  Transaction,
  Transfer,
  UserProfile,
} from '@/types';
import {
  calculateDashboardMetrics,
  calculateFinancialHealth,
  calculateSafeToSpend,
  generateDeterministicInsights,
} from '../engines/financeEngine';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency, getCurrentMonthKey } from '../formatters';
import { defaultPaymentProvider } from '../payments/providers/MockPaymentProvider';
import { generateUUID } from '../utils';
import {
  getStoreAll,
  putStoreItem,
  putStoreAll,
  deleteStoreItem,
  enqueueSync,
  getPendingSyncQueue,
  clearAllOfflineStores,
} from '../offline/indexedDb';
import {
  processSyncQueue,
  verifyCloudReachability,
  SyncState,
} from '../offline/syncEngine';

export const DEFAULT_SYSTEM_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F59E0B', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-transport', name: 'Transport (Boda & Matatu)', type: 'expense', icon: 'Bus', color: '#3B82F6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-airtime', name: 'Airtime & Calls', type: 'expense', icon: 'PhoneCall', color: '#EC4899', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-internet', name: 'Internet & Data', type: 'expense', icon: 'Wifi', color: '#8B5CF6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-rent', name: 'Rent & Housing', type: 'expense', icon: 'Home', color: '#10B981', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-utilities', name: 'Utilities (Umeme & NWSC)', type: 'expense', icon: 'Zap', color: '#EAB308', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-school', name: 'School & Education', type: 'expense', icon: 'GraduationCap', color: '#6366F1', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-medical', name: 'Healthcare & Medical', type: 'expense', icon: 'HeartPulse', color: '#EF4444', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-shopping', name: 'Shopping & Groceries', type: 'expense', icon: 'ShoppingBag', color: '#14B8A6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-entertainment', name: 'Entertainment & Leisure', type: 'expense', icon: 'Film', color: '#A855F7', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-family', name: 'Family & Relatives', type: 'expense', icon: 'Users', color: '#F97316', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-business-exp', name: 'Business & Inventory', type: 'expense', icon: 'Briefcase', color: '#06B6D4', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-personal', name: 'Personal Care & Salon', type: 'expense', icon: 'Sparkles', color: '#D946EF', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-other-exp', name: 'Other Expenses', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', is_default: true, created_at: new Date().toISOString() },
  // Income Categories
  { id: 'cat-salary', name: 'Salary / Wage', type: 'income', icon: 'Banknote', color: '#10B981', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-business-inc', name: 'Business Profit', type: 'income', icon: 'TrendingUp', color: '#059669', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-side-hustle', name: 'Side Hustle', type: 'income', icon: 'Zap', color: '#F59E0B', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-allowance', name: 'Allowance & Stipend', type: 'income', icon: 'Gift', color: '#3B82F6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-investment', name: 'Investment & SACCO Returns', type: 'income', icon: 'PieChart', color: '#8B5CF6', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-gift', name: 'Gift & Family Support', type: 'income', icon: 'Heart', color: '#EC4899', is_default: true, created_at: new Date().toISOString() },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748B', is_default: true, created_at: new Date().toISOString() },
];

interface SpendyContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  startingBalance: number;
  setStartingBalance: (amount: number) => void;

  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  loans: Loan[];
  transfers: Transfer[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  financialGoals: FinancialGoal[];
  recurringTransactions: RecurringTransaction[];
  notifications: Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>;

  // Offline & Synchronization
  syncState: SyncState;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  triggerManualSync: () => Promise<void>;
  isLoadingData: boolean;

  // Time Period Filtering
  periodFilter: PeriodFilter;
  setPeriodFilter: (period: PeriodFilter) => void;

  // Computed Metrics (Single Source of Truth)
  dashboardMetrics: DashboardMetrics;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  safeToSpend: SafeToSpendDetails;
  financialHealth: FinancialHealthBreakdown;
  insights: Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' }>;

  // Modals & UI States
  quickAddOpen: boolean;
  quickAddInitialTab: 'expense' | 'income' | 'loan' | 'pay' | 'transfer';
  openQuickAdd: (tab?: 'expense' | 'income' | 'loan' | 'pay' | 'transfer') => void;
  closeQuickAdd: () => void;
  activeReceipt: PaymentReceipt | null;
  openReceipt: (receipt: PaymentReceipt) => void;
  closeReceipt: () => void;

  // Transaction CRUD Actions
  addTransaction: (tx: {
    type: 'expense' | 'income';
    amount: number;
    category_id: string;
    description?: string;
    note?: string;
    account_id?: string;
    payment_method?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => Promise<void>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Loan Management Actions
  addLoan: (loan: {
    loan_type: LoanType;
    counterparty: string;
    principal_amount: number;
    due_date?: string;
    notes?: string;
  }) => Promise<void>;
  recordLoanRepayment: (loanId: string, amount: number, note?: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  // Debt Actions
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  recordDebtPayment: (debtId: string, amount: number, accountId?: string, note?: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  // Financial Goals Actions
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteFinancialGoal: (id: string) => Promise<void>;

  // Recurring Actions
  addRecurring: (tx: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => Promise<void>;
  toggleRecurring: (id: string) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;

  // Accounts & Transfers
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  createTransfer: (transfer: { from_account_id: string; to_account_id: string; amount: number; note?: string }) => Promise<void>;

  // Budgets & Savings
  setBudget: (budget: { category_id?: string | null; planned_amount: number; month?: string }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, accountId?: string) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Authentication & User Session
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: { email: string; password: string; fullName: string; phone?: string; startingBalance?: number }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;

  // Payments & Export
  processMerchantPayment: (req: MerchantPaymentRequest) => Promise<PaymentReceipt>;
  exportDataCSV: () => void;
  clearAllData: () => Promise<void>;
}

const SpendyContext = createContext<SpendyContextType | null>(null);

const DEFAULT_GUEST_USER: UserProfile = {
  id: '',
  email: '',
  full_name: '',
  phone_number: '',
  default_currency: 'UGX',
  starting_balance: 0,
  safe_spend_emergency_buffer: 50000,
};

export function SpendyProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>(DEFAULT_GUEST_USER);
  const [startingBalance, setStartingBalanceState] = useState<number>(0);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('this_month');

  // Real Database state — Brand new users start with clean arrays
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_SYSTEM_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>>([]);

  // Modal UI state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'expense' | 'income' | 'loan' | 'pay' | 'transfer'>('expense');
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // Offline Synchronization State
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Fetch all user records from Supabase
  const loadUserDataFromSupabase = useCallback(async (userId: string, userEmail: string, metaFullName?: string) => {
    if (!userId) return;
    setIsLoadingData(true);

    const storageKey = `spendy_user_vault_${userId}`;

    // 1. Instant local vault hydration (0ms render time)
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.startingBalance !== undefined) setStartingBalanceState(parsed.startingBalance);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.loans) setLoans(parsed.loans);
        if (parsed.accounts && parsed.accounts.length > 0) setAccounts(parsed.accounts);
        if (parsed.categories && parsed.categories.length > 0) setCategories(parsed.categories);
        if (parsed.transfers) setTransfers(parsed.transfers);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.financialGoals) setFinancialGoals(parsed.financialGoals);
        if (parsed.recurringTransactions) setRecurringTransactions(parsed.recurringTransactions);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch {
      // safe
    }

    if (!isSupabaseConfigured()) {
      setIsLoadingData(false);
      return;
    }

    try {
      // 2. Fetch cloud data concurrently with a 3.5-second timeout safeguard
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud sync timeout')), 3500));

      const cloudFetches = Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${userId}`),
        supabase.from('accounts').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('savings_goals').select('*').eq('user_id', userId),
        supabase.from('loans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').eq('user_id', userId).order('transfer_date', { ascending: false }),
        supabase.from('financial_goals').select('*').eq('user_id', userId),
        supabase.from('recurring_transactions').select('*').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      const results = await Promise.race([cloudFetches, timeoutPromise]) as PromiseSettledResult<any>[];

      // Unpack results safely
      if (Array.isArray(results)) {
        const [
          profileRes,
          catRes,
          accRes,
          txRes,
          budgetRes,
          goalRes,
          loanRes,
          transferRes,
          finGoalRes,
          recRes,
          notifRes
        ] = results;

        if (profileRes.status === 'fulfilled' && profileRes.value.data) {
          const profileData = profileRes.value.data;
          const profileFullName = profileData.full_name || metaFullName || userEmail.split('@')[0] || 'User';
          const profileStartingBal = Number(profileData.starting_balance || 0);
          const profileBuffer = Number(profileData.safe_spend_emergency_buffer || 50000);
          setUser({
            id: userId,
            email: userEmail,
            full_name: profileFullName,
            default_currency: 'UGX',
            starting_balance: profileStartingBal,
            safe_spend_emergency_buffer: profileBuffer,
          });
          setStartingBalanceState(profileStartingBal);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data && catRes.value.data.length > 0) {
          setCategories(catRes.value.data);
        }

        if (accRes.status === 'fulfilled' && accRes.value.data && accRes.value.data.length > 0) {
          setAccounts(accRes.value.data);
        } else if (accRes.status === 'fulfilled' && (!accRes.value.data || accRes.value.data.length === 0)) {
          setAccounts((prev) => {
            if (prev.length > 0) return prev;
            const defaultAcc: Account = {
              id: generateUUID(),
              user_id: userId,
              name: 'Cash / Mobile Money',
              type: 'cash',
              balance: 0,
              currency: 'UGX',
              color: '#10B981',
              is_archived: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            Promise.resolve(supabase.from('accounts').insert(defaultAcc)).catch(() => {});
            return [defaultAcc];
          });
        }

        if (txRes.status === 'fulfilled' && txRes.value.data) {
          setTransactions(txRes.value.data);
        }
        if (budgetRes.status === 'fulfilled' && budgetRes.value.data) {
          setBudgets(budgetRes.value.data);
        }
        if (goalRes.status === 'fulfilled' && goalRes.value.data) {
          setSavingsGoals(goalRes.value.data);
        }
        if (loanRes.status === 'fulfilled' && loanRes.value.data) {
          setLoans(loanRes.value.data);
        }
        if (transferRes.status === 'fulfilled' && transferRes.value.data) {
          setTransfers(transferRes.value.data);
        }
        if (finGoalRes.status === 'fulfilled' && finGoalRes.value.data) {
          setFinancialGoals(finGoalRes.value.data);
        }
        if (recRes.status === 'fulfilled' && recRes.value.data) {
          setRecurringTransactions(recRes.value.data);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.data) {
          setNotifications(notifRes.value.data);
        }
      }
    } catch (err) {
      console.warn('Background cloud data sync handled safely (using local data):', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [supabase]);

  // Reset store to empty guest state
  const resetUserStore = useCallback(() => {
    setUser(DEFAULT_GUEST_USER);
    setStartingBalanceState(0);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setLoans([]);
    setTransfers([]);
    setDebts([]);
    setFinancialGoals([]);
    setRecurringTransactions([]);
    setNotifications([]);
    setAccounts([]);
    setCategories(DEFAULT_SYSTEM_CATEGORIES);
  }, []);

  // Sync Supabase Auth Session Lifecycle
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoadingAuth(true);
      // 1. Instant local session check (0ms render time)
      try {
        const savedAuth = localStorage.getItem('spendy_auth_session_v1');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed.user?.id) {
            if (isMounted) {
              setIsAuthenticated(true);
              await loadUserDataFromSupabase(
                parsed.user.id,
                parsed.user.email || '',
                parsed.user.user_metadata?.full_name
              );
            }
          }
        }
      } catch {
        // safe
      }

      if (!isSupabaseConfigured()) {
        if (isMounted) setIsLoadingAuth(false);
        return;
      }

      // 2. Background check with 2.5s timeout safeguard
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 2500)
        );
        const res = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (isMounted) {
          if (res?.data?.session?.user) {
            setIsAuthenticated(true);
            await loadUserDataFromSupabase(
              res.data.session.user.id,
              res.data.session.user.email || '',
              res.data.session.user.user_metadata?.full_name
            );
          }
        }
      } catch (err) {
        console.warn('Auth session background check safely handled:', err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setIsAuthenticated(true);
          await loadUserDataFromSupabase(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name
          );
        } else {
          setIsAuthenticated(false);
          resetUserStore();
        }
        setIsLoadingAuth(false);
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, loadUserDataFromSupabase, resetUserStore]);

  // Persist offline cache per user ID
  useEffect(() => {
    if (!user.id || typeof window === 'undefined') return;
    try {
      const userStorageKey = `spendy_user_vault_${user.id}`;
      localStorage.setItem(
        userStorageKey,
        JSON.stringify({
          user,
          startingBalance,
          accounts,
          categories,
          transactions,
          loans,
          transfers,
          budgets,
          savingsGoals,
          debts,
          financialGoals,
          recurringTransactions,
        })
      );
    } catch {
      // safe
    }
  }, [user, startingBalance, accounts, categories, transactions, loans, transfers, budgets, savingsGoals, debts, financialGoals, recurringTransactions]);

  const setStartingBalance = async (amount: number) => {
    const val = Math.max(0, Math.round(amount || 0));
    setStartingBalanceState(val);
    setUser((prev) => ({ ...prev, starting_balance: val }));

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase
          .from('profiles')
          .update({ starting_balance: val, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Enriched transactions with Category & Account object mappings
  const enrichedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      const account = accounts.find((a) => a.id === tx.account_id);
      const category = categories.find((c) => c.id === tx.category_id);
      return { ...tx, account, category };
    });
  }, [transactions, accounts, categories]);

  // Dashboard Metrics strictly computed from real transactions
  const dashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(transactions, loans, periodFilter, startingBalance);
  }, [transactions, loans, periodFilter, startingBalance]);

  const currentMonthKey = getCurrentMonthKey();

  const totalBalance = dashboardMetrics.currentBalance;
  const monthlyIncome = dashboardMetrics.totalIncome;
  const monthlyExpenses = dashboardMetrics.totalSpending;
  const netSavings = dashboardMetrics.netPeriodSavings;

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend(
      accounts,
      budgets,
      transactions,
      recurringTransactions,
      debts,
      user.safe_spend_emergency_buffer || 50000,
      currentMonthKey
    );
  }, [accounts, budgets, transactions, recurringTransactions, debts, user.safe_spend_emergency_buffer, currentMonthKey]);

  const financialHealth = useMemo(() => {
    return calculateFinancialHealth(transactions, budgets, debts, savingsGoals, currentMonthKey);
  }, [transactions, budgets, debts, savingsGoals, currentMonthKey]);

  const insights = useMemo(() => {
    return generateDeterministicInsights(enrichedTransactions, budgets, currentMonthKey);
  }, [enrichedTransactions, budgets, currentMonthKey]);

  // Modal actions
  const openQuickAdd = (tab: 'expense' | 'income' | 'loan' | 'pay' | 'transfer' = 'expense') => {
    setQuickAddInitialTab(tab);
    setQuickAddOpen(true);
  };

  const closeQuickAdd = () => setQuickAddOpen(false);
  const openReceipt = (receipt: PaymentReceipt) => setActiveReceipt(receipt);
  const closeReceipt = () => setActiveReceipt(null);

  // Sync Runner
  const triggerAutoSync = async () => {
    if (!isSupabaseConfigured() || !user.id || typeof navigator === 'undefined' || !navigator.onLine) {
      setSyncState('offline');
      return;
    }

    try {
      setSyncState('syncing');
      const result = await processSyncQueue(supabase, user.id);
      const remaining = await getPendingSyncQueue(user.id);
      setPendingSyncCount(remaining.length);

      if (result.success) {
        setSyncState(remaining.length === 0 ? 'synced' : 'pending_sync');
        setLastSyncTime(new Date().toISOString());
      } else {
        setSyncState(remaining.length > 0 ? 'pending_sync' : 'synced');
      }
    } catch {
      setSyncState('error');
    }
  };

  const triggerManualSync = async () => {
    await triggerAutoSync();
  };

  // Add Transaction
  const addTransaction = async (data: {
    type: 'expense' | 'income';
    amount: number;
    category_id: string;
    description?: string;
    note?: string;
    account_id?: string;
    payment_method?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => {
    const rawAmt = Math.round(data.amount);
    if (rawAmt <= 0) return;

    const defaultAccId = data.account_id || accounts[0]?.id || generateUUID();
    const desc = data.description || data.note || (data.type === 'expense' ? 'Expense' : 'Income');

    const newTx: Transaction = {
      id: generateUUID(),
      user_id: user.id || 'usr_temp',
      account_id: defaultAccId,
      category_id: data.category_id,
      type: data.type,
      amount: rawAmt,
      currency: 'UGX',
      description: desc,
      note: desc,
      payment_method: data.payment_method || 'Cash / Mobile Money',
      merchant_name: data.merchant_name,
      receipt_number: data.receipt_number,
      transaction_date: data.transaction_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    setAccounts((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: defaultAccId,
            user_id: user.id,
            name: 'Cash / Mobile Money',
            type: 'cash',
            balance: data.type === 'income' ? rawAmt : -rawAmt,
            currency: 'UGX',
            color: '#10B981',
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }
      return prev.map((acc) => {
        if (acc.id === defaultAccId) {
          const delta = data.type === 'income' ? rawAmt : -rawAmt;
          return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
        }
        return acc;
      });
    });

    if (isSupabaseConfigured() && user.id) {
      try {
        const { error } = await supabase.from('transactions').insert({
          id: newTx.id,
          user_id: user.id,
          account_id: newTx.account_id,
          category_id: newTx.category_id,
          type: newTx.type,
          amount: newTx.amount,
          currency: 'UGX',
          note: newTx.note,
          merchant_name: newTx.merchant_name,
          receipt_number: newTx.receipt_number,
          transaction_date: newTx.transaction_date,
          created_at: newTx.created_at,
          updated_at: newTx.updated_at,
        });

        if (error) {
          console.warn('Supabase transaction insert failed, falling back to sync queue:', error.message);
          putStoreItem('transactions', newTx);
          await enqueueSync({
            id: generateUUID(),
            user_id: user.id,
            entity_type: 'transactions',
            entity_id: newTx.id,
            operation: 'CREATE',
            payload: newTx,
            created_at: new Date().toISOString(),
            attempt_count: 0,
            status: 'PENDING',
          });
        }
      } catch (err) {
        console.warn('Transaction insert exception:', err);
      }
    }
  };

  // Edit Transaction
  const editTransaction = async (id: string, updates: Partial<Transaction>) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return;

    const updatedAmount = updates.amount !== undefined ? Math.round(updates.amount) : existing.amount;
    const updatedTx: Transaction = {
      ...existing,
      ...updates,
      amount: updatedAmount,
      updated_at: new Date().toISOString(),
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updatedTx : t))
    );

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase
          .from('transactions')
          .update({
            amount: updatedTx.amount,
            category_id: updatedTx.category_id,
            note: updatedTx.description || updatedTx.note,
            merchant_name: updatedTx.merchant_name,
            transaction_date: updatedTx.transaction_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account_id) {
          const delta = tx.type === 'income' ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Loan Management
  const addLoan = async (data: {
    loan_type: LoanType;
    counterparty: string;
    principal_amount: number;
    due_date?: string;
    notes?: string;
  }) => {
    const principal = Math.round(data.principal_amount);
    if (principal <= 0 || !data.counterparty.trim()) return;

    const newLoan: Loan = {
      id: generateUUID(),
      user_id: user.id,
      loan_type: data.loan_type,
      counterparty: data.counterparty.trim(),
      principal_amount: principal,
      amount_paid: 0,
      remaining_balance: principal,
      status: 'pending',
      due_date: data.due_date,
      notes: data.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      repayments: [],
    };

    setLoans((prev) => [newLoan, ...prev]);

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('loans').insert({
          id: newLoan.id,
          user_id: user.id,
          loan_type: newLoan.loan_type,
          counterparty: newLoan.counterparty,
          principal_amount: newLoan.principal_amount,
          amount_paid: 0,
          remaining_balance: newLoan.remaining_balance,
          status: newLoan.status,
          due_date: newLoan.due_date || null,
          notes: newLoan.notes || null,
          created_at: newLoan.created_at,
          updated_at: newLoan.updated_at,
        });
      } catch {
        // safe
      }
    }
  };

  const recordLoanRepayment = async (loanId: string, amount: number, note?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    const existingLoan = loans.find((l) => l.id === loanId);
    if (!existingLoan) return;

    const newPaid = existingLoan.amount_paid + amt;
    const newRemaining = Math.max(0, existingLoan.principal_amount - newPaid);
    const newStatus: LoanStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

    const repayment: LoanRepayment = {
      id: generateUUID(),
      loan_id: loanId,
      amount: amt,
      payment_date: new Date().toISOString(),
      note,
      created_at: new Date().toISOString(),
    };

    const targetLoan: Loan = {
      ...existingLoan,
      amount_paid: newPaid,
      remaining_balance: newRemaining,
      status: newStatus,
      repayments: [...(existingLoan.repayments || []), repayment],
      updated_at: new Date().toISOString(),
    };

    setLoans((prev) =>
      prev.map((loan) => (loan.id === loanId ? targetLoan : loan))
    );

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase
          .from('loans')
          .update({
            amount_paid: targetLoan.amount_paid,
            remaining_balance: targetLoan.remaining_balance,
            status: targetLoan.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', loanId)
          .eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  const deleteLoan = async (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('loans').delete().eq('id', id).eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Transfers
  const createTransfer = async (data: { from_account_id: string; to_account_id: string; amount: number; note?: string }) => {
    const amt = Math.round(data.amount);
    if (amt <= 0 || data.from_account_id === data.to_account_id) return;

    const newTransfer: Transfer = {
      id: generateUUID(),
      user_id: user.id,
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      amount: amt,
      transfer_date: new Date().toISOString(),
      note: data.note,
      created_at: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === data.from_account_id) {
          return { ...acc, balance: acc.balance - amt, updated_at: new Date().toISOString() };
        }
        if (acc.id === data.to_account_id) {
          return { ...acc, balance: acc.balance + amt, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('transfers').insert({
          id: newTransfer.id,
          user_id: user.id,
          from_account_id: newTransfer.from_account_id,
          to_account_id: newTransfer.to_account_id,
          amount: newTransfer.amount,
          transfer_date: newTransfer.transfer_date,
          note: newTransfer.note,
          created_at: newTransfer.created_at,
        });
      } catch {
        // safe
      }
    }
  };

  // Budgets
  const setBudget = async (data: { category_id?: string | null; planned_amount: number; month?: string }) => {
    const month = data.month || currentMonthKey;
    const catId = data.category_id || null;
    const plannedAmt = Math.round(data.planned_amount);

    const newBudget: Budget = {
      id: generateUUID(),
      user_id: user.id,
      category_id: catId,
      month,
      planned_amount: plannedAmt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBudgets((prev) => {
      const filtered = prev.filter(
        (b) => !(b.month === month && (b.category_id || null) === catId)
      );
      return [...filtered, newBudget];
    });

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('budgets').upsert(
          {
            id: newBudget.id,
            user_id: user.id,
            category_id: newBudget.category_id,
            month: newBudget.month,
            planned_amount: newBudget.planned_amount,
            created_at: newBudget.created_at,
            updated_at: newBudget.updated_at,
          },
          { onConflict: 'user_id,category_id,month' }
        );
      } catch {
        // safe
      }
    }
  };

  const deleteBudget = async (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Savings Goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateUUID(),
      user_id: user.id,
      current_amount: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSavingsGoals((prev) => [...prev, newGoal]);

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('savings_goals').insert({
          id: newGoal.id,
          user_id: user.id,
          name: newGoal.name,
          purpose: newGoal.purpose,
          target_amount: newGoal.target_amount,
          current_amount: 0,
          deadline: newGoal.deadline || null,
          color: newGoal.color || '#10B981',
          status: 'active',
          created_at: newGoal.created_at,
          updated_at: newGoal.updated_at,
        });
      } catch {
        // safe
      }
    }
  };

  const contributeToGoal = async (goalId: string, amount: number, accountId?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    if (accountId) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, balance: acc.balance - amt } : acc))
      );
    }

    let updatedGoal: SavingsGoal | null = null;

    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newAmount = goal.current_amount + amt;
          const isCompleted = newAmount >= goal.target_amount;
          if (isCompleted) {
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#FBBF24', '#3B82F6', '#8B5CF6'],
              });
            } catch {
              // safe fallback
            }
          }
          updatedGoal = {
            ...goal,
            current_amount: newAmount,
            status: isCompleted ? 'completed' : 'active',
            updated_at: new Date().toISOString(),
          };
          return updatedGoal;
        }
        return goal;
      })
    );

    if (updatedGoal && isSupabaseConfigured() && user.id) {
      try {
        await supabase
          .from('savings_goals')
          .update({
            current_amount: (updatedGoal as SavingsGoal).current_amount,
            status: (updatedGoal as SavingsGoal).status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', goalId)
          .eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  // Add Custom Category
  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = {
      ...categoryData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCat]);

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('categories').insert({
          id: newCat.id,
          user_id: user.id,
          name: newCat.name,
          type: newCat.type,
          icon: newCat.icon || 'Tag',
          color: newCat.color || '#10B981',
          is_default: false,
          created_at: newCat.created_at,
        });
      } catch {
        // safe
      }
    }
  };

  // Legacy Debts & Financial Goals Actions
  const addDebt = async (debtData: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    const rawAmt = Math.round(debtData.total_amount);
    const newDebt: Debt = {
      id: generateUUID(),
      user_id: user.id,
      type: debtData.type,
      counterparty: debtData.counterparty,
      total_amount: rawAmt,
      remaining_amount: debtData.remaining_amount !== undefined ? Math.round(debtData.remaining_amount) : rawAmt,
      due_date: debtData.due_date,
      note: debtData.note,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payments: [],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const recordDebtPayment = async (debtId: string, amount: number, accountId?: string, note?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remaining_amount - amt);
          const payment: DebtPayment = {
            id: generateUUID(),
            user_id: user.id,
            debt_id: debtId,
            account_id: accountId,
            amount: amt,
            payment_date: new Date().toISOString(),
            note,
            created_at: new Date().toISOString(),
          };
          return {
            ...d,
            remaining_amount: newRemaining,
            status: newRemaining === 0 ? 'paid' : 'active',
            payments: [...(d.payments || []), payment],
            updated_at: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const deleteDebt = async (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const addFinancialGoal = async (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: generateUUID(),
      user_id: user.id,
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFinancialGoals((prev) => [...prev, newGoal]);

    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('financial_goals').insert({
          id: newGoal.id,
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description,
          target_amount: newGoal.target_amount,
          current_amount: newGoal.current_amount || 0,
          target_date: newGoal.target_date || null,
          status: newGoal.status,
          created_at: newGoal.created_at,
          updated_at: newGoal.updated_at,
        });
      } catch {
        // safe
      }
    }
  };

  const updateFinancialGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    setFinancialGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))
    );
  };

  const deleteFinancialGoal = async (id: string) => {
    setFinancialGoals((prev) => prev.filter((g) => g.id !== id));
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('financial_goals').delete().eq('id', id).eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  const addRecurring = async (tx: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => {
    const newRec: RecurringTransaction = {
      ...tx,
      id: generateUUID(),
      user_id: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setRecurringTransactions((prev) => [...prev, newRec]);
  };

  const toggleRecurring = async (id: string) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const deleteRecurring = async (id: string) => {
    setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
  };

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newAcc: Account = {
      ...account,
      id: generateUUID(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('accounts').insert(newAcc);
      } catch {
        // safe
      }
    }
  };

  const updateAccount = async (id: string, accountUpdates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...accountUpdates, updated_at: new Date().toISOString() } : a))
    );
  };

  const deleteAccount = async (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConfigured() && user.id) {
      try {
        await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
      } catch {
        // safe
      }
    }
  };

  const processMerchantPayment = async (req: MerchantPaymentRequest): Promise<PaymentReceipt> => {
    const res = await defaultPaymentProvider.processPayment({
      merchantId: req.merchantId,
      merchantName: req.merchantName,
      amount: req.amount,
      currency: 'UGX',
      categoryId: req.categoryId,
      payerAccountId: req.accountId,
      reference: req.reference,
      description: req.note,
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    const categoryObj = categories.find((c) => c.id === req.categoryId);
    const accountObj = accounts.find((a) => a.id === req.accountId);

    await addTransaction({
      account_id: req.accountId,
      category_id: req.categoryId,
      type: 'expense',
      amount: req.amount,
      merchant_name: req.merchantName,
      receipt_number: res.receiptNumber,
      description: req.note || `Merchant payment to ${req.merchantName}`,
      note: req.note || `Merchant payment to ${req.merchantName}`,
    });

    const receipt: PaymentReceipt = {
      receiptNumber: res.receiptNumber,
      merchantName: req.merchantName,
      amount: req.amount,
      currency: 'UGX',
      date: new Date().toISOString(),
      paymentMethod: accountObj?.name || 'Spendy Wallet',
      category: categoryObj?.name || 'General Expense',
      reference: req.reference,
      status: 'SUCCESS',
    };

    openReceipt(receipt);
    return receipt;
  };

  // Export CSV
  const exportDataCSV = () => {
    const headers = ['Record Type', 'Date', 'Type / Direction', 'Amount (UGX)', 'Category / Counterparty', 'Note / Description', 'Status'];
    const txRows = transactions.map((t) => [
      'TRANSACTION',
      t.transaction_date,
      t.type.toUpperCase(),
      t.amount,
      `"${t.category?.name || 'General'}"`,
      `"${(t.description || t.note || '').replace(/"/g, '""')}"`,
      'COMPLETED',
    ]);

    const loanRows = loans.map((l) => [
      'LOAN',
      l.created_at,
      l.loan_type === 'lent' ? 'LENT_OUT' : 'BORROWED',
      l.principal_amount,
      `"${l.counterparty}"`,
      `"Remaining: ${formatCurrency(l.remaining_balance)}. Notes: ${(l.notes || '').replace(/"/g, '""')}"`,
      l.status.toUpperCase(),
    ]);

    const allRows = [headers.join(','), ...txRows.map((r) => r.join(',')), ...loanRows.map((r) => r.join(','))];
    const csvContent = 'data:text/csv;charset=utf-8,' + allRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spendy_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all data for clean slate
  const clearAllData = async () => {
    setStartingBalanceState(0);
    setTransactions([]);
    setLoans([]);
    setTransfers([]);
    setBudgets([]);
    setSavingsGoals([]);
    setDebts([]);
    setFinancialGoals([]);
    setRecurringTransactions([]);

    if (isSupabaseConfigured() && user.id) {
      try {
        await Promise.all([
          supabase.from('transactions').delete().eq('user_id', user.id),
          supabase.from('budgets').delete().eq('user_id', user.id),
          supabase.from('savings_goals').delete().eq('user_id', user.id),
          supabase.from('loans').delete().eq('user_id', user.id),
          supabase.from('transfers').delete().eq('user_id', user.id),
          supabase.from('financial_goals').delete().eq('user_id', user.id),
          supabase.from('profiles').update({ starting_balance: 0 }).eq('id', user.id),
        ]);
      } catch (err) {
        console.warn('Clear data exception:', err);
      }
    }

    if (user.id && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`spendy_user_vault_${user.id}`);
      } catch {
        // safe
      }
    }
  };

  // Auth wrappers
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { error: error.message };
        }

        if (data?.user) {
          setIsAuthenticated(true);
          await loadUserDataFromSupabase(
            data.user.id,
            data.user.email || email.trim().toLowerCase(),
            data.user.user_metadata?.full_name
          );
          return {};
        }
      }
      return {};
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Authentication failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    startingBalance?: number;
  }): Promise<{ error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              phone_number: data.phone?.trim() || '',
              default_currency: 'UGX',
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (authData?.user) {
          setIsAuthenticated(true);
          resetUserStore();
          await loadUserDataFromSupabase(
            authData.user.id,
            data.email.trim().toLowerCase(),
            data.fullName.trim()
          );
          if (data.startingBalance && data.startingBalance > 0) {
            await setStartingBalance(data.startingBalance);
          }
          return {};
        }
      }
      return {};
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Registration failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signOut = async () => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error', e);
    } finally {
      setIsAuthenticated(false);
      resetUserStore();
      setIsLoadingAuth(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) return { error: error.message };
        return { message: `Password reset link sent to ${email.trim()}` };
      }
      return { message: `Password reset instructions sent to ${email.trim()}` };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Password reset request failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <SpendyContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoadingAuth,
        isLoadingData,
        signIn,
        signUp,
        signOut,
        resetPassword,
        startingBalance,
        setStartingBalance,
        accounts,
        categories,
        transactions: enrichedTransactions,
        loans,
        transfers,
        budgets,
        savingsGoals,
        debts,
        financialGoals,
        recurringTransactions,
        notifications,
        syncState,
        pendingSyncCount,
        lastSyncTime,
        triggerManualSync,
        periodFilter,
        setPeriodFilter,
        dashboardMetrics,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netSavings,
        safeToSpend,
        financialHealth,
        insights,
        quickAddOpen,
        quickAddInitialTab,
        openQuickAdd,
        closeQuickAdd,
        activeReceipt,
        openReceipt,
        closeReceipt,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addLoan,
        recordLoanRepayment,
        deleteLoan,
        addDebt,
        recordDebtPayment,
        deleteDebt,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        addCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        createTransfer,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        contributeToGoal,
        deleteSavingsGoal,
        processMerchantPayment,
        exportDataCSV,
        clearAllData,
      }}
    >
      {children}
    </SpendyContext.Provider>
  );
}

export function useSpendy() {
  const context = useContext(SpendyContext);
  if (!context) {
    throw new Error('useSpendy must be used within a SpendyProvider');
  }
  return context;
}
