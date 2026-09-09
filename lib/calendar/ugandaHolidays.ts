/**
 * Uganda Public Holidays & Cultural Celebrations Dataset
 * Helps users anticipate annual festive spending surges (feasts, transport, gifts, entertainment).
 */

export interface HolidayCelebration {
  date: string; // MM-DD format or YYYY-MM-DD
  name: string;
  category: 'celebration' | 'national' | 'religious';
  spendingImpact: 'extreme' | 'very_high' | 'high' | 'medium' | 'low';
  tag: string; // Short badge label
  spendingAdvice: string;
}

// Fixed-Date Holidays (every year)
export const FIXED_UGANDA_HOLIDAYS: Record<string, Omit<HolidayCelebration, 'date'>> = {
  '01-01': {
    name: "New Year's Day",
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Celebration',
    spendingAdvice: 'High social, party, and dining spending. Budget for festive entertainment and gifts.',
  },
  '01-26': {
    name: 'NRM Liberation Day',
    category: 'national',
    spendingImpact: 'medium',
    tag: 'Holiday',
    spendingAdvice: 'Public holiday — leisure, weekend trips, and family outings.',
  },
  '02-16': {
    name: 'Archbishop Janani Luwum Day',
    category: 'national',
    spendingImpact: 'low',
    tag: 'Holiday',
    spendingAdvice: 'Church memorial day — typically moderate devotional spending.',
  },
  '03-08': {
    name: "International Women's Day",
    category: 'celebration',
    spendingImpact: 'medium',
    tag: 'Celebration',
    spendingAdvice: 'Dining out, gifting, and family celebrations honoring women.',
  },
  '05-01': {
    name: 'Labour Day',
    category: 'national',
    spendingImpact: 'medium',
    tag: 'Holiday',
    spendingAdvice: 'Workplace gatherings, picnics, and family day-trips.',
  },
  '06-03': {
    name: "Uganda Martyrs' Day",
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Major Feast',
    spendingAdvice: 'Massive Namugongo pilgrimage — expect high transport, street food, hospitality, and devotional spending.',
  },
  '06-09': {
    name: 'National Heroes Day',
    category: 'national',
    spendingImpact: 'medium',
    tag: 'Holiday',
    spendingAdvice: 'Public holiday — relaxation, dining, and social events.',
  },
  '10-09': {
    name: 'Uganda Independence Day',
    category: 'celebration',
    spendingImpact: 'high',
    tag: 'National Feast',
    spendingAdvice: 'National holiday with concerts, BBQs, family lunches, and outdoor recreation.',
  },
  '12-24': {
    name: 'Christmas Eve',
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Holiday Eve',
    spendingAdvice: 'Last-minute grocery shopping, gift purchases, and upcountry transport fares rush.',
  },
  '12-25': {
    name: 'Christmas Day',
    category: 'celebration',
    spendingImpact: 'extreme',
    tag: 'Peak Festive',
    spendingAdvice: 'Highest spending day of the year in Uganda — lavish feasts, new clothes, family travel, and gifts.',
  },
  '12-26': {
    name: 'Boxing Day',
    category: 'celebration',
    spendingImpact: 'high',
    tag: 'Celebration',
    spendingAdvice: 'Family get-togethers, beach outings, leftover feasts, and leisure entertainment.',
  },
  '12-31': {
    name: "New Year's Eve",
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Cross-over',
    spendingAdvice: 'Nightlife, dining, church cross-over services, and firework celebrations.',
  },
};

// Variable Lunar / Movable Holidays (keyed by YYYY-MM-DD)
export const VARIABLE_UGANDA_HOLIDAYS: Record<string, Omit<HolidayCelebration, 'date'>> = {
  // 2025
  '2025-03-31': {
    name: 'Eid al-Fitr',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Eid Feast',
    spendingAdvice: 'End of Ramadan feasting, meat purchases, new clothing, and charitable giving.',
  },
  '2025-04-18': {
    name: 'Good Friday',
    category: 'religious',
    spendingImpact: 'medium',
    tag: 'Holy Day',
    spendingAdvice: 'Church services, fish and special meals.',
  },
  '2025-04-20': {
    name: 'Easter Sunday',
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Easter Feast',
    spendingAdvice: 'Family banquets, upcountry visits, and festive dining.',
  },
  '2025-04-21': {
    name: 'Easter Monday',
    category: 'celebration',
    spendingImpact: 'high',
    tag: 'Holiday',
    spendingAdvice: 'Outdoors, family outings, and recreational leisure.',
  },
  '2025-06-07': {
    name: 'Eid al-Adha',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Sacrifice Feast',
    spendingAdvice: 'Livestock purchases, meat sharing, family gatherings, and gifts.',
  },

  // 2026
  '2026-03-20': {
    name: 'Eid al-Fitr',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Eid Feast',
    spendingAdvice: 'End of Ramadan feasting, meat purchases, new clothing, and charitable giving.',
  },
  '2026-04-03': {
    name: 'Good Friday',
    category: 'religious',
    spendingImpact: 'medium',
    tag: 'Holy Day',
    spendingAdvice: 'Church services, fish, and holiday weekend kickoff.',
  },
  '2026-04-05': {
    name: 'Easter Sunday',
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Easter Feast',
    spendingAdvice: 'Major family celebrations, church feasts, and travel expenditures.',
  },
  '2026-04-06': {
    name: 'Easter Monday',
    category: 'celebration',
    spendingImpact: 'high',
    tag: 'Holiday',
    spendingAdvice: 'Public holiday — social picnics, day outings, and entertainment.',
  },
  '2026-05-27': {
    name: 'Eid al-Adha',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Sacrifice Feast',
    spendingAdvice: 'Livestock purchases, community sharing, and feast banquets.',
  },

  // 2027
  '2027-03-10': {
    name: 'Eid al-Fitr',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Eid Feast',
    spendingAdvice: 'End of Ramadan feasting, meat purchases, new clothing, and charitable giving.',
  },
  '2027-03-26': {
    name: 'Good Friday',
    category: 'religious',
    spendingImpact: 'medium',
    tag: 'Holy Day',
    spendingAdvice: 'Church services, holiday groceries, and travel.',
  },
  '2027-03-28': {
    name: 'Easter Sunday',
    category: 'celebration',
    spendingImpact: 'very_high',
    tag: 'Easter Feast',
    spendingAdvice: 'Major family banquets, gifting, and festive dining.',
  },
  '2027-03-29': {
    name: 'Easter Monday',
    category: 'celebration',
    spendingImpact: 'high',
    tag: 'Holiday',
    spendingAdvice: 'Public holiday — picnics and recreation.',
  },
  '2027-05-17': {
    name: 'Eid al-Adha',
    category: 'religious',
    spendingImpact: 'high',
    tag: 'Sacrifice Feast',
    spendingAdvice: 'Livestock purchases and family banquets.',
  },
};

/**
 * Returns holiday and celebration metadata for a specific date if one exists.
 */
export function getUgandaHoliday(year: number, monthIndex: number, day: number): HolidayCelebration | null {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const monthDayKey = `${m}-${d}`;
  const fullDateKey = `${year}-${m}-${d}`;

  // Check movable holidays first
  if (VARIABLE_UGANDA_HOLIDAYS[fullDateKey]) {
    return {
      date: fullDateKey,
      ...VARIABLE_UGANDA_HOLIDAYS[fullDateKey],
    };
  }

  // Check fixed annual holidays
  if (FIXED_UGANDA_HOLIDAYS[monthDayKey]) {
    return {
      date: fullDateKey,
      ...FIXED_UGANDA_HOLIDAYS[monthDayKey],
    };
  }

  return null;
}
