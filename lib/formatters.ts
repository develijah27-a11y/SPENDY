/**
 * Spendy Uganda Currency and Date Formatting Utilities
 */

/**
 * Formats a number to Ugandan Shillings format (UGX 1,450,000)
 */
export function formatUGX(amount: number | null | undefined, options?: { showSign?: boolean; isExpense?: boolean }): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'UGX 0';
  }

  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-UG', {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));

  if (options?.showSign) {
    if (options.isExpense || rounded < 0) {
      return `- UGX ${formatted}`;
    }
    return `+ UGX ${formatted}`;
  }

  return `UGX ${formatted}`;
}

/**
 * Compact UGX format for tight spaces (e.g. UGX 1.4M, UGX 350K)
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
  return `UGX ${amount}`;
}

/**
 * Format standard readable dates (e.g. 25 Aug 2026 or Today, 4:30 PM)
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
