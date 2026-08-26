import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = process.env.SUPABASE_PROJECT_ID || 'nsitkygdnifujmygruza';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.log('SUPABASE_ACCESS_TOKEN not found in environment. Please supply via .env.local.');
  process.exit(1);
}

async function runSqlMigration() {
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Sending SQL migration to Supabase project ${projectId}...`);

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlContent,
      }),
    });

    const resultText = await response.text();
    console.log('Status Code:', response.status);

    if (response.ok) {
      console.log('✅ Supabase database migration executed successfully!');
    } else {
      console.error('❌ Migration error:', response.statusText, resultText);
    }
  } catch (error) {
    console.error('Execution error:', error);
  }
}

runSqlMigration();
