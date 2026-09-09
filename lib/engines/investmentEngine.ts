/**
 * Spendy Personal Investment & Wealth Planning Engine
 * Tracks Unit Trusts, Treasury Bills, Government Bonds, Real Estate/Land,
 * Fixed Deposits, and Equities in East Africa.
 */

export type AssetClass =
  | 'unit_trust'
  | 'treasury_bill'
  | 'bond'
  | 'real_estate'
  | 'fixed_deposit'
  | 'stocks'
  | 'agri_pool';

export interface PersonalInvestment {
  id: string;
  name: string; // e.g. "UAP Old Mutual Umbrella Fund"
  asset_class: AssetClass;
  institution: string; // e.g. "UAP Old Mutual", "Bank of Uganda", "ICEA Lion"
  principal_amount: number; // UGX invested
  current_valuation: number; // Current UGX value
  expected_annual_return_pct: number; // e.g. 11.5%
  monthly_topup: number; // Recurring monthly contribution (0 if none)
  start_date: string; // YYYY-MM-DD
  maturity_date?: string; // YYYY-MM-DD (optional for open-ended funds)
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPortfolioMetrics {
  totalPortfolioValuation: number;
  totalPrincipalInvested: number;
  netUnrealizedGains: number;
  overallRoiPercent: number;
  projectedAnnualEarnings: number;
  totalMonthlyAdditions: number;
  activeAssetCount: number;
  allocationByClass: Record<AssetClass, { amount: number; percentage: number }>;
}

export const ASSET_CLASS_METADATA: Record<
  AssetClass,
  { label: string; icon: string; typicalYield: string; riskProfile: 'low' | 'moderate' | 'high' }
> = {
  unit_trust: {
    label: 'Unit Trust / MMF',
    icon: 'ShieldCheck',
    typicalYield: '10.5% - 12.5%',
    riskProfile: 'low',
  },
  treasury_bill: {
    label: 'Treasury Bills (BOU)',
    icon: 'Landmark',
    typicalYield: '10.0% - 13.0%',
    riskProfile: 'low',
  },
  bond: {
    label: 'Government Bonds',
    icon: 'Scale',
    typicalYield: '14.0% - 16.5%',
    riskProfile: 'low',
  },
  real_estate: {
    label: 'Land & Real Estate',
    icon: 'Home',
    typicalYield: '12.0% - 18.0%',
    riskProfile: 'moderate',
  },
  fixed_deposit: {
    label: 'Fixed Deposit',
    icon: 'Lock',
    typicalYield: '8.0% - 10.5%',
    riskProfile: 'low',
  },
  stocks: {
    label: 'Stocks & Equities',
    icon: 'TrendingUp',
    typicalYield: 'Variable / Dividends',
    riskProfile: 'high',
  },
  agri_pool: {
    label: 'Agribusiness Pool',
    icon: 'Wheat',
    typicalYield: '15.0% - 22.0%',
    riskProfile: 'moderate',
  },
};

export function calculateInvestmentMetrics(
  investments: PersonalInvestment[]
): InvestmentPortfolioMetrics {
  let totalPortfolioValuation = 0;
  let totalPrincipalInvested = 0;
  let projectedAnnualEarnings = 0;
  let totalMonthlyAdditions = 0;

  const classAmounts: Record<AssetClass, number> = {
    unit_trust: 0,
    treasury_bill: 0,
    bond: 0,
    real_estate: 0,
    fixed_deposit: 0,
    stocks: 0,
    agri_pool: 0,
  };

  for (const inv of investments) {
    totalPortfolioValuation += inv.current_valuation;
    totalPrincipalInvested += inv.principal_amount;
    projectedAnnualEarnings += inv.current_valuation * (inv.expected_annual_return_pct / 100);
    totalMonthlyAdditions += inv.monthly_topup || 0;
    classAmounts[inv.asset_class] = (classAmounts[inv.asset_class] || 0) + inv.current_valuation;
  }

  const netUnrealizedGains = totalPortfolioValuation - totalPrincipalInvested;
  const overallRoiPercent =
    totalPrincipalInvested > 0 ? (netUnrealizedGains / totalPrincipalInvested) * 100 : 0;

  const allocationByClass: Record<AssetClass, { amount: number; percentage: number }> = {} as any;
  for (const [key, amount] of Object.entries(classAmounts)) {
    const cls = key as AssetClass;
    allocationByClass[cls] = {
      amount,
      percentage: totalPortfolioValuation > 0 ? (amount / totalPortfolioValuation) * 100 : 0,
    };
  }

  return {
    totalPortfolioValuation,
    totalPrincipalInvested,
    netUnrealizedGains,
    overallRoiPercent,
    projectedAnnualEarnings,
    totalMonthlyAdditions,
    activeAssetCount: investments.length,
    allocationByClass,
  };
}

export function getStoredInvestments(): PersonalInvestment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('spendy_investments_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

