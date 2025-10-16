#!/usr/bin/env tsx
/**
 * Setup Supabase Storage Policies for Resume Uploads
 *
 * This script creates the necessary RLS policies for the resumes bucket.
 * Run with: pnpm tsx scripts/setup-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const policies = [
  {
    name: 'Users can upload own resume',
    sql: `
      DROP POLICY IF EXISTS "Users can upload own resume" ON storage.objects;
      CREATE POLICY "Users can upload own resume"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can read own resume',
    sql: `
      DROP POLICY IF EXISTS "Users can read own resume" ON storage.objects;
      CREATE POLICY "Users can read own resume"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can update own resume',
    sql: `
      DROP POLICY IF EXISTS "Users can update own resume" ON storage.objects;
      CREATE POLICY "Users can update own resume"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Users can delete own resume',
    sql: `
      DROP POLICY IF EXISTS "Users can delete own resume" ON storage.objects;
      CREATE POLICY "Users can delete own resume"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
    `
  },
  {
    name: 'Admins can access all resumes',
    sql: `
      DROP POLICY IF EXISTS "Admins can access all resumes" ON storage.objects;
      CREATE POLICY "Admins can access all resumes"
      ON storage.objects FOR ALL
      TO authenticated
      USING (
        bucket_id = 'resumes'
        AND EXISTS (
          SELECT 1 FROM public."User"
          WHERE id = auth.uid()::text
          AND "isAdmin" = true
        )
      );
    `
  }
];

async function setupPolicies() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 Setting up Storage RLS Policies');
  console.log('='.repeat(60) + '\n');

  for (const policy of policies) {
    try {
      console.log(`Creating policy: ${policy.name}...`);

      // Use the Supabase Admin API to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });

      if (error) {
        // Try alternative method using fetch
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({
            query: policy.sql
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }

      console.log(`  ✓ Created: ${policy.name}\n`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${policy.name}:`, error);
      console.error('    Continuing...\n');
    }
  }

  console.log('─'.repeat(60));
  console.log('\n⚠️  Note: If policies failed to create via API, please run the SQL manually:');
  console.log('   Dashboard → SQL Editor → Run: supabase/setup-resume-storage.sql\n');
  console.log('='.repeat(60) + '\n');
}

setupPolicies()
  .then(() => {
    console.log('✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
