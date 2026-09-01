import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';

let supabaseUrl = 'https://nsitkygdnifujmygruza.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaXRreWdkbmlmdWpteWdydXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3NjU4OCwiZXhwIjoyMTAzMjUyNTg4fQ.KxfVxkUcjWQ9RQ6bbvUSgSP4LRLkfPEjRZGF5sovkT4';
let supabaseAnonKey = '';

try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    } else if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1].trim();
    }
  }
} catch (e) {
  console.warn('Could not read .env.local file:', e.message);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function runIsolationTest() {
  console.log('================================================================');
  console.log('🚀 MULTI-USER ISOLATION & REAL SUPABASE CRUD TEST');
  console.log('================================================================\n');

  const ts = Date.now();
  const userAEmail = `test_alpha_${ts}@example.com`;
  const userBEmail = `test_beta_${ts}@example.com`;
  const testPassword = 'Password123!TestSecure';

  // 1. Create confirmed User A using Admin API
  console.log(`1️⃣ Creating confirmed User A: ${userAEmail}...`);
  const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
    email: userAEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test User Alpha', default_currency: 'UGX' },
  });

  if (errA || !userAData.user) {
    console.error('❌ Failed to create User A:', errA?.message);
    process.exit(1);
  }
  const userAId = userAData.user.id;
  console.log(`   ✅ User A created with ID: ${userAId}`);

  // 2. Create confirmed User B using Admin API
  console.log(`\n2️⃣ Creating confirmed User B: ${userBEmail}...`);
  const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
    email: userBEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test User Beta', default_currency: 'UGX' },
  });

  if (errB || !userBData.user) {
    console.error('❌ Failed to create User B:', errB?.message);
    process.exit(1);
  }
  const userBId = userBData.user.id;
  console.log(`   ✅ User B created with ID: ${userBId}`);

  // 3. Authenticate User A and User B via standard client
  console.log('\n3️⃣ Logging in User A & User B via standard client...');
  const clientA = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signA, error: signAErr } = await clientA.auth.signInWithPassword({
    email: userAEmail,
    password: testPassword,
  });
  if (signAErr) {
    console.error('❌ Sign in A failed:', signAErr.message);
    process.exit(1);
  }
  console.log('   ✅ User A authenticated.');

  const clientB = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signB, error: signBErr } = await clientB.auth.signInWithPassword({
    email: userBEmail,
    password: testPassword,
  });
  if (signBErr) {
    console.error('❌ Sign in B failed:', signBErr.message);
    process.exit(1);
  }
  console.log('   ✅ User B authenticated.');

  // Create primary accounts
  const accountAId = crypto.randomUUID();
  await clientA.from('accounts').insert({
    id: accountAId,
    user_id: userAId,
    name: 'Cash / Mobile Money',
    type: 'cash',
    balance: 0,
    currency: 'UGX',
  });

  const accountBId = crypto.randomUUID();
  await clientB.from('accounts').insert({
    id: accountBId,
    user_id: userBId,
    name: 'Cash / Mobile Money',
    type: 'cash',
    balance: 0,
    currency: 'UGX',
  });

  // Get categories
  const { data: dbCategories } = await clientA.from('categories').select('*');
  let incomeCatId = dbCategories?.find(c => c.type === 'income')?.id;
  let expenseCatId = dbCategories?.find(c => c.type === 'expense')?.id;

  if (!incomeCatId) {
    incomeCatId = crypto.randomUUID();
    await clientA.from('categories').insert({
      id: incomeCatId,
      user_id: userAId,
      name: 'Salary',
      type: 'income',
      icon: 'Banknote',
      color: '#10B981',
    });
  }

  if (!expenseCatId) {
    expenseCatId = crypto.randomUUID();
    await clientA.from('categories').insert({
      id: expenseCatId,
      user_id: userAId,
      name: 'Rent',
      type: 'expense',
      icon: 'Home',
      color: '#EF4444',
    });
  }

  // 4. Verify User B starts with 0 transactions (Clean Slate)
  console.log(`\n4️⃣ Verifying User B starts with 0 transactions (No Dummy Data)...`);
  const { data: initTxB, error: txBErr } = await clientB.from('transactions').select('*');
  if (txBErr) {
    console.error('❌ Error fetching User B initial transactions:', txBErr.message);
  }
  console.log(`   User B transactions count: ${initTxB?.length || 0}`);
  if ((initTxB?.length || 0) !== 0) {
    console.error('❌ Failed: User B should start with 0 transactions!');
    process.exit(1);
  }
  console.log('   ✅ User B confirmed clean 0 transactions.');

  // 5. User A records transactions (Income: UGX 1,500,000, Expense: UGX 350,000)
  console.log(`\n5️⃣ User A recording transactions (Income: UGX 1,500,000, Expense: UGX 350,000)...`);
  const txA1 = {
    id: crypto.randomUUID(),
    user_id: userAId,
    account_id: accountAId,
    category_id: incomeCatId,
    type: 'income',
    amount: 1500000,
    currency: 'UGX',
    note: 'Consulting Salary',
    transaction_date: new Date().toISOString(),
  };

  const txA2 = {
    id: crypto.randomUUID(),
    user_id: userAId,
    account_id: accountAId,
    category_id: expenseCatId,
    type: 'expense',
    amount: 350000,
    currency: 'UGX',
    note: 'Apartment Rent',
    transaction_date: new Date().toISOString(),
  };

  const { error: insA1Err } = await clientA.from('transactions').insert(txA1);
  const { error: insA2Err } = await clientA.from('transactions').insert(txA2);

  if (insA1Err || insA2Err) {
    console.error('❌ Error inserting User A transactions:', insA1Err || insA2Err);
    process.exit(1);
  }
  console.log('   ✅ User A transactions successfully saved to Supabase PostgreSQL.');

  // 6. Check User A balance calculation
  console.log(`\n6️⃣ Checking User A transactions and calculated balance...`);
  const { data: txA } = await clientA.from('transactions').select('*');
  console.log(`   User A transactions retrieved: ${txA?.length || 0}`);
  const incomeA = txA?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
  const expenseA = txA?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
  const balanceA = incomeA - expenseA;
  console.log(`   User A Total Income:   UGX ${incomeA.toLocaleString()}`);
  console.log(`   User A Total Expenses: UGX ${expenseA.toLocaleString()}`);
  console.log(`   User A Net Balance:    UGX ${balanceA.toLocaleString()}`);

  if (balanceA !== 1150000) {
    console.error(`❌ Expected UGX 1,150,000 but calculated UGX ${balanceA}`);
    process.exit(1);
  }
  console.log('   ✅ User A balance calculation strictly verified.');

  // 7. Strict Data Isolation Check: Query from User B client
  console.log(`\n7️⃣ Testing User B isolation (ensuring User B CANNOT see User A's data)...`);
  const { data: txBAfterA } = await clientB.from('transactions').select('*');
  console.log(`   User B sees: ${txBAfterA?.length || 0} transactions.`);

  if ((txBAfterA?.length || 0) !== 0) {
    console.error('❌ SECURITY FAILURE: User B was able to view User A transactions!');
    process.exit(1);
  }
  console.log('   🔒 Data Isolation Confirmed: User B has 0 records and cannot see User A data.');

  // 8. User B adds own transaction
  console.log(`\n8️⃣ User B recording own Income (UGX 500,000 Side Hustle)...`);
  const txB1 = {
    id: crypto.randomUUID(),
    user_id: userBId,
    account_id: accountBId,
    category_id: incomeCatId,
    type: 'income',
    amount: 500000,
    currency: 'UGX',
    note: 'Side Hustle Design Project',
    transaction_date: new Date().toISOString(),
  };

  const { error: insB1Err } = await clientB.from('transactions').insert(txB1);
  if (insB1Err) {
    console.error('❌ Error inserting User B transaction:', insB1Err);
    process.exit(1);
  }
  console.log('   ✅ User B transaction saved.');

  // 9. Re-verify User A data isolation from User B
  console.log(`\n9️⃣ Re-verifying User A sees ONLY User A transactions (2 records)...`);
  const { data: txAFinal } = await clientA.from('transactions').select('*');
  console.log(`   User A final transaction count: ${txAFinal?.length || 0}`);
  if (txAFinal?.length !== 2) {
    console.error(`❌ User A expected 2 records but found ${txAFinal?.length}`);
    process.exit(1);
  }
  console.log('   🔒 Multi-User Isolation Confirmed in both directions.');

  // 10. Cleanup test records
  console.log(`\n🔟 Cleaning up test records and test users...`);
  await adminClient.from('transactions').delete().eq('user_id', userAId);
  await adminClient.from('transactions').delete().eq('user_id', userBId);
  await adminClient.from('categories').delete().eq('user_id', userAId);
  await adminClient.from('categories').delete().eq('user_id', userBId);
  await adminClient.from('accounts').delete().eq('user_id', userAId);
  await adminClient.from('accounts').delete().eq('user_id', userBId);
  await adminClient.auth.admin.deleteUser(userAId);
  await adminClient.auth.admin.deleteUser(userBId);
  console.log('   🧹 Cleanup complete.');

  console.log('\n================================================================');
  console.log('🎉 ALL MULTI-USER ISOLATION & CRUD TESTS PASSED PERFECTLY!');
  console.log('================================================================\n');
}

runIsolationTest().catch((e) => {
  console.error('Unhandled test exception:', e);
  process.exit(1);
});
