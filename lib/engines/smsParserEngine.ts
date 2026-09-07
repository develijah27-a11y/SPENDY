/**
 * Spendy Mobile Money SMS Parser Engine
 * Handles parsing MTN Mobile Money and Airtel Money transaction confirmation texts in Uganda/East Africa.
 */

export interface ParsedSmsResult {
  success: boolean;
  type: 'expense' | 'income';
  amount: number;
  counterparty: string;
  phone?: string;
  transactionId?: string;
  provider: 'MTN MoMo' | 'Airtel Money' | 'Bank / Other';
  fee?: number;
  newBalance?: number;
  suggestedCategoryId: string;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Intelligent category predictor based on counterparty and narrative
 */
function predictCategory(counterparty: string, rawText: string, type: 'expense' | 'income'): string {
  const text = (counterparty + ' ' + rawText).toLowerCase();

  if (type === 'income') {
    if (text.includes('salary') || text.includes('payroll')) return 'cat-salary';
    if (text.includes('allowance') || text.includes('pocket money')) return 'cat-allowance';
    if (text.includes('sacco') || text.includes('dividend') || text.includes('interest')) return 'cat-investment';
    if (text.includes('profit') || text.includes('client') || text.includes('sales')) return 'cat-business-inc';
    return 'cat-gift';
  }

  // Expense matching
  if (text.includes('boda') || text.includes('safe boda') || text.includes('uber') || text.includes('fuel') || text.includes('total') || text.includes('shell') || text.includes('taxi')) {
    return 'cat-transport';
  }
  if (text.includes('restaurant') || text.includes('cafe') || text.includes('rolex') || text.includes('pork') || text.includes('food') || text.includes('bakery') || text.includes('javas') || text.includes('kfc')) {
    return 'cat-food';
  }
  if (text.includes('airtime') || text.includes('airtime recharge') || text.includes('calls')) {
    return 'cat-airtime';
  }
  if (text.includes('data bundle') || text.includes('internet') || text.includes('wifi') || text.includes('smiles') || text.includes('liquid')) {
    return 'cat-internet';
  }
  if (text.includes('umeme') || text.includes('nwsc') || text.includes('water') || text.includes('electricity') || text.includes('yaka')) {
    return 'cat-utilities';
  }
  if (text.includes('rent') || text.includes('landlord') || text.includes('housing')) {
    return 'cat-rent';
  }
  if (text.includes('school') || text.includes('tuition') || text.includes('fees') || text.includes('kindergarten') || text.includes('college')) {
    return 'cat-school';
  }
  if (text.includes('pharmacy') || text.includes('hospital') || text.includes('clinic') || text.includes('medical') || text.includes('drugs')) {
    return 'cat-medical';
  }
  if (text.includes('supermarket') || text.includes('groceries') || text.includes('shopping') || text.includes('market')) {
    return 'cat-shopping';
  }

  return 'cat-other-exp';
}

/**
 * Main parser function
 */
export function parseMobileMoneySms(smsText: string): ParsedSmsResult {
  const clean = smsText.trim();
  const lower = clean.toLowerCase();

  // 1. Determine Provider
  let provider: 'MTN MoMo' | 'Airtel Money' | 'Bank / Other' = 'Bank / Other';
  if (lower.includes("y'ello") || lower.includes('momo') || lower.includes('mtn')) {
    provider = 'MTN MoMo';
  } else if (lower.includes('airtel') || lower.includes('mp2') || lower.includes('airtel money')) {
    provider = 'Airtel Money';
  }

  // 2. Determine Transaction Type
  let type: 'expense' | 'income' = 'expense';
  if (
    lower.includes('received') ||
    lower.includes('cash in') ||
    lower.includes('deposited') ||
    lower.includes('credited with') ||
    lower.includes('has sent you')
  ) {
    type = 'income';
  }

  // 3. Extract Amount (e.g., UGX 25,000 or 25000 UGX or Ush 50,000)
  let amount = 0;
  const amountRegex = /(?:ugx|ush|shs|shs\.|kes|usd)[\s:]*([0-9,]+(?:\.[0-9]{1,2})?)|([0-9,]+(?:\.[0-9]{1,2})?)[\s]*(?:ugx|ush|shs)/i;
  const amountMatch = clean.match(amountRegex);
  if (amountMatch) {
    const rawVal = amountMatch[1] || amountMatch[2];
    amount = parseFloat(rawVal.replace(/,/g, ''));
  }

  // 4. Extract Counterparty
  let counterparty = '';
  let phone = '';

  // Patterns for "sent UGX ... to [Name] ([Phone])" or "paid to [Name]"
  const sentToMatch = clean.match(/(?:sent|paid|transferred)[\s\w,]*to\s+([A-Za-z0-9\s&'-]+?)(?:\s*\((256\d{9}|07\d{8}|\+256\d{9})\)|\s+on\s+|\s+fee:|\s*\.|\s+new balance)/i);
  if (sentToMatch) {
    counterparty = sentToMatch[1].trim();
    if (sentToMatch[2]) phone = sentToMatch[2].trim();
  }

  // Patterns for "received UGX ... from [Name] ([Phone])"
  const receivedFromMatch = clean.match(/received[\s\w,]*from\s+([A-Za-z0-9\s&'-]+?)(?:\s*\((256\d{9}|07\d{8}|\+256\d{9})\)|\s+on\s+|\s*\.|\s+new balance)/i);
  if (receivedFromMatch) {
    counterparty = receivedFromMatch[1].trim();
    if (receivedFromMatch[2]) phone = receivedFromMatch[2].trim();
  }

  // Airtime purchase fallback
  if (!counterparty && lower.includes('airtime')) {
    counterparty = provider === 'MTN MoMo' ? 'MTN Airtime Recharge' : 'Airtel Airtime Recharge';
  }

  if (!counterparty) {
    counterparty = type === 'income' ? 'Mobile Money Deposit' : 'Mobile Money Payment';
  }

  // 5. Extract Fee (if any)
  let fee: number | undefined;
  const feeMatch = clean.match(/fee[\s:]*(?:ugx|ush|shs)?[\s:]*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/,/g, ''));
  }

  // 6. Extract New Balance (if any)
  let newBalance: number | undefined;
  const balanceMatch = clean.match(/(?:new balance|balance)[\s:]*(?:ugx|ush|shs)?[\s:]*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (balanceMatch) {
    newBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // 7. Extract Transaction ID / Reference
  let transactionId: string | undefined;
  const txIdMatch = clean.match(/(?:trans(?:action)?\s*id|financial\s*trans\s*id|txn\s*id|ref(?:erence)?|id)[\s:]*([A-Za-z0-9._-]+)/i);
  if (txIdMatch) {
    transactionId = txIdMatch[1].trim();
  }

  // 8. Predict Category
  const suggestedCategoryId = predictCategory(counterparty, clean, type);

  const success = amount > 0;
  const confidence = success && counterparty && transactionId ? 'high' : success ? 'medium' : 'low';

  return {
    success,
    type,
    amount,
    counterparty,
    phone,
    transactionId,
    provider,
    fee,
    newBalance,
    suggestedCategoryId,
    rawText: clean,
    confidence,
  };
}

/**
 * Pre-configured realistic sample SMS texts for testing
 */
export const SAMPLE_MOBILE_MONEY_SMS = [
  {
    title: 'MTN MoMo - Sent to Boda',
    text: "Y'ello. You have sent UGX 15,000 to David Mukasa (256772123456) on 2026-09-06 19:30:15. Fee: UGX 1,000. New balance: UGX 142,500. Trans ID: 10982341.",
  },
  {
    title: 'MTN MoMo - Received Salary / Allowance',
    text: "Y'ello. You have received UGX 350,000 from Sarah Nakato (256782987654) on 2026-09-06 12:15. Financial Trans ID: 98127391. New balance: UGX 492,500.",
  },
  {
    title: 'Airtel Money - Grocery Shopping',
    text: "Txn ID: MP260906.8492. You have paid UGX 45,000 to Quality Supermarket Ntinda on 06/09/2026. Balance: UGX 115,000.",
  },
  {
    title: 'MTN MoMo - Umeme Yaka Electricity',
    text: "Y'ello. You have paid UGX 50,000 to Umeme Yaka (Merchant Code: 991200) on 2026-09-06 10:14. Trans ID: 887192. Token: 1948-2940-1092-3849.",
  },
  {
    title: 'Airtel Money - Received Peer Transfer',
    text: "Txn ID: MP260906.1284. You have received UGX 80,000 from Grace Babirye (256701234567) on 06/09/2026 14:02. New Balance: UGX 195,000.",
  },
];
