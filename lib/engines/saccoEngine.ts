/**
 * Spendy SACCO & Chama Investment Club Engine
 * Helps users track group savings, shares, dividends, and collective welfare funds in East Africa.
 */

export interface SaccoGroup {
  id: string;
  name: string;
  type: 'sacco' | 'chama' | 'investment_club' | 'family_pool';
  share_value: number; // e.g. 50,000 UGX per share
  shares_owned: number; // e.g. 20 shares
  monthly_contribution: number; // e.g. 100,000 UGX/month
  estimated_dividend_percent: number; // e.g. 12% per annum
  loan_borrowed: number; // e.g. outstanding group loan
  loan_interest_percent: number; // e.g. 5%
  next_due_date?: string;
  notes?: string;
  created_at: string;
}

export interface SaccoPortfolioMetrics {
  totalEquityValue: number;
  totalMonthlyCommitment: number;
  projectedAnnualDividends: number;
  totalLoansOutstanding: number;
  activeGroupCount: number;
}

export function calculateSaccoMetrics(groups: SaccoGroup[]): SaccoPortfolioMetrics {
  let totalEquityValue = 0;
  let totalMonthlyCommitment = 0;
  let projectedAnnualDividends = 0;
  let totalLoansOutstanding = 0;

  for (const g of groups) {
    const equity = g.share_value * g.shares_owned;
    totalEquityValue += equity;
    totalMonthlyCommitment += g.monthly_contribution;
    projectedAnnualDividends += equity * (g.estimated_dividend_percent / 100);
    totalLoansOutstanding += g.loan_borrowed;
  }

  return {
    totalEquityValue,
    totalMonthlyCommitment,
    projectedAnnualDividends,
    totalLoansOutstanding,
    activeGroupCount: groups.length,
  };
}

export const DEFAULT_SAMPLE_SACCOS: SaccoGroup[] = [
  {
    id: 'sacco-1',
    name: 'Wazalendo Family & Welfare SACCO',
    type: 'sacco',
    share_value: 50000,
    shares_owned: 30,
    monthly_contribution: 100000,
    estimated_dividend_percent: 11.5,
    loan_borrowed: 0,
    loan_interest_percent: 5,
    next_due_date: '2026-09-25',
    notes: 'Primary monthly community savings pool. Payouts every December.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sacco-2',
    name: 'Kampala Young Tech Innovators Club',
    type: 'investment_club',
    share_value: 100000,
    shares_owned: 15,
    monthly_contribution: 150000,
    estimated_dividend_percent: 14.0,
    loan_borrowed: 400000,
    loan_interest_percent: 4,
    next_due_date: '2026-09-30',
    notes: 'Invests in land plots in Mukono and treasury bills.',
    created_at: new Date().toISOString(),
  },
];
