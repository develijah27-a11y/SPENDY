/**
 * Spendi Uganda — Centralized Currency & Date Formatting Utilities
 * Strict compliance with Product Brief: All amounts formatted as 'UGX 25,000'
 */

/**
 * Primary centralized currency formatter for Spendi.
 * Example: formatCurrency(25000) -> "UGX 25,000"
 */
export function formatCurrency(amount: number | null | undefined, options?: { showSign?: boolean; isExpense?: boolean }): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'UGX 0';
  }

  // Integer precision for Ugandan Shillings (no fractional cents)
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-UG', {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));

  if (options?.showSign) {
    if (options.isExpense || rounded < 0) {
      return `- UGX ${formatted}`;
    }
    if (rounded > 0) {
      return `+ UGX ${formatted}`;
    }
  }

  return `UGX ${formatted}`;
}

/**
 * Backward compatibility alias for formatCurrency
 */
export const formatUGX = formatCurrency;

/**
 * Compact UGX format for constrained chart pills (e.g. UGX 1.4M, UGX 350K)
 */
export function formatCompactUGX(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `UGX ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `UGX ${(amount / 1_000).toFixed(0)}K`;
  }
  return `UGX ${Math.round(amount)}`;
}

/**
 * Human-readable date formatting (e.g. "Today, 4:30 PM", "Yesterday", "24 Aug 2026")
 */
export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (isYesterday) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Grouping header date (e.g. "Today", "Yesterday", "25 August 2026")
 */
export function formatDateGroup(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Other';

  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Period date filter checking
 */
export type PeriodFilter = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'all_time';

export function isDateInPeriod(dateStr: string, period: PeriodFilter): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return d >= todayStart;

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const weekStart = new Date(now);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart;
    }

    case 'this_month':
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

    case 'last_month': {
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
    }

    case 'this_year':
      return d.getFullYear() === now.getFullYear();

    case 'all_time':
    default:
      return true;
  }
}

/**
 * Get current year-month in YYYY-MM format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format month key YYYY-MM to human readable (e.g. August 2026)
 */
export function formatMonthName(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
