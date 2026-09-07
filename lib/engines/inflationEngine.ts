/**
 * Spendy Inflation & Purchasing Power Hedger Engine
 * Models real wealth decay vs investment yields in East Africa (Bank of Uganda CPI baseline).
 */

export interface InflationScenario {
  startingAmount: number;
  annualInflationRate: number; // e.g. 5.5%
  years: number;
  futureNominalValue: number;
  purchasingPowerValue: number;
  purchasingPowerLoss: number;
  percentLoss: number;
}

export interface AssetComparison {
  name: string;
  nominalReturnRate: number;
  realReturnRate: number;
  valueAfter1Year: number;
  valueAfter3Years: number;
  valueAfter5Years: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  recommendation: string;
}

export function calculateInflationDecay(
  principal: number,
  annualInflationPercent = 5.5,
  years = 3
): InflationScenario {
  const r = annualInflationPercent / 100;
  // Real purchasing power: P = principal / (1 + r)^years
  const purchasingPowerValue = Math.round(principal / Math.pow(1 + r, years));
  const purchasingPowerLoss = principal - purchasingPowerValue;
  const percentLoss = Math.round((purchasingPowerLoss / principal) * 100);

  return {
    startingAmount: principal,
    annualInflationRate: annualInflationPercent,
    years,
    futureNominalValue: principal,
    purchasingPowerValue,
    purchasingPowerLoss,
    percentLoss,
  };
}

export function compareAssetVehicles(
  principal: number,
  annualInflationPercent = 5.5
): AssetComparison[] {
  const assets = [
    {
      name: 'Idle Cash (Wallet / Under Mattress)',
      returnRate: 0,
      risk: 'Low' as const,
      rec: 'Severe purchasing power bleed. Limit cash to immediate daily operational needs.',
    },
    {
      name: 'Bank Savings Account',
      returnRate: 2.5,
      risk: 'Low' as const,
      rec: 'Safer than physical cash, but loses ~3% annually to inflation. Good for instant liquidity.',
    },
    {
      name: 'Uganda Treasury Bills (364-Day)',
      returnRate: 12.0,
      risk: 'Low' as const,
      rec: 'Backed by Bank of Uganda. Delivers ~6.5% real net return beating inflation handsomely.',
    },
    {
      name: 'Licensed SACCO Shares & Pool',
      returnRate: 13.5,
      risk: 'Moderate' as const,
      rec: 'High dividend yields + emergency borrowing privileges. Ideal for 12-month capital.',
    },
    {
      name: 'USD / Foreign Currency Reserve',
      returnRate: 6.0,
      risk: 'Moderate' as const,
      rec: 'Hedges against domestic currency depreciation against international imports.',
    },
  ];

  return assets.map((a) => {
    const realReturn = a.returnRate - annualInflationPercent;
    const calcFuture = (years: number) => {
      // Future value with inflation adjusted: Principal * ((1 + nominal) / (1 + inflation))^years
      const growthFactor = (1 + a.returnRate / 100) / (1 + annualInflationPercent / 100);
      return Math.round(principal * Math.pow(growthFactor, years));
    };

    return {
      name: a.name,
      nominalReturnRate: a.returnRate,
      realReturnRate: realReturn,
      valueAfter1Year: calcFuture(1),
      valueAfter3Years: calcFuture(3),
      valueAfter5Years: calcFuture(5),
      riskLevel: a.risk,
      recommendation: a.rec,
    };
  });
}
