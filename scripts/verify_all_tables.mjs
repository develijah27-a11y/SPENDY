import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsitkygdnifujmygruza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaXRreWdkbmlmdWpteWdydXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3NjU4OCwiZXhwIjoyMTAzMjUyNTg4fQ.KxfVxkUcjWQ9RQ6bbvUSgSP4LRLkfPEjRZGF5sovkT4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const tables = [
  'profiles',
  'accounts',
  'categories',
  'transactions',
  'transfers',
  'budgets',
  'savings_goals',
  'debts',
  'debt_payments',
  'financial_goals',
  'recurring_transactions',
  'notifications',
];

async function verifyTables() {
  console.log('--- VERIFYING ALL 12 TABLES IN SUPABASE ---');
  const results = [];

  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        results.push({ table, status: 'FAILED', error: error.message });
      } else {
        results.push({ table, status: 'EXISTS & ACTIVE', count: count || 0 });
      }
    } catch (e) {
      results.push({ table, status: 'ERROR', error: e.message });
    }
  }

  console.table(results);
}

verifyTables();
