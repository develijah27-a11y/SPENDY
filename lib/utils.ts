import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SP-${year}-${randomNum}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Formats a user's full name, compound name, or email into a single, clean first name
 * e.g., "Kwagala Elijah Hannington" -> "Kwagala"
 *       "kwagalaelijahhannington"   -> "Kwagala"
 *       "david_mukasa"             -> "David"
 */
export function formatSingleName(rawName?: string | null, fallback = 'Friend'): string {
  if (!rawName || typeof rawName !== 'string') return fallback;
  let text = rawName.trim();
  if (!text) return fallback;

  // If input contains email address, take prefix before @
  if (text.includes('@')) {
    text = text.split('@')[0];
  }

  // Strip trailing numbers/special characters
  text = text.replace(/[0-9_.-]+$/, '');

  // Split by whitespace, punctuation, or camelCase transition
  const tokens = text.split(/[\s._-]+|(?<=[a-z])(?=[A-Z])/).filter(Boolean);
  let firstToken = tokens.length > 0 ? tokens[0] : text;

  // Common East African & international compound name prefixes for unspaced entries
  const commonPrefixes = [
    'kwagala', 'elijah', 'hannington', 'mukasa', 'nakato', 'babirye', 'kato',
    'wasswa', 'mugisha', 'okello', 'otim', 'david', 'john', 'emmanuel',
    'brian', 'grace', 'sarah', 'mary', 'joseph', 'peter', 'paul', 'daniel',
    'moses', 'samuel', 'joshua', 'esther', 'rebecca', 'ruth', 'dorothy'
  ];

  const lower = firstToken.toLowerCase();
  for (const prefix of commonPrefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      firstToken = prefix;
      break;
    }
  }

  if (!firstToken) return fallback;

  // Capitalize neatly: First letter uppercase, rest lowercase
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
}
