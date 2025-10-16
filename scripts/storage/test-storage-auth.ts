#!/usr/bin/env tsx
/**
 * Test Storage Authentication
 * Tests if the current user can upload to storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testStorageAuth() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 Testing Storage Authentication');
  console.log('='.repeat(60) + '\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Check current auth status
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log('Auth Status:');
  if (authError) {
    console.log('  ❌ Not authenticated:', authError.message);
    console.log('\n⚠️  This script needs to be run from the browser with an authenticated user.');
    console.log('   The issue is that storage uploads use client-side auth.\n');
    return;
  }

  if (!user) {
    console.log('  ❌ No user found');
    return;
  }

  console.log(`  ✓ Authenticated as: ${user.email}`);
  console.log(`  ✓ User ID: ${user.id}\n`);

  // Try to upload a test file
  console.log('Testing file upload...');
  const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  const testPath = `${user.id}/test-${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(testPath, testFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.log('  ❌ Upload failed:', error.message);
    console.log('  Error code:', error.name);
    console.log('\n' + '─'.repeat(60));
    console.log('🔍 Debugging Info:');
    console.log('─'.repeat(60));
    console.log(`  Upload path: ${testPath}`);
    console.log(`  Expected folder: ${user.id}`);
    console.log(`  Auth UID: ${user.id}`);
    console.log('\n💡 The RLS policy should allow this upload.');
    console.log('   Please verify policies were created correctly.\n');
  } else {
    console.log('  ✓ Upload successful!');
    console.log(`  Path: ${data.path}\n`);

    // Clean up test file
    await supabase.storage.from('resumes').remove([testPath]);
    console.log('  ✓ Test file cleaned up\n');
  }

  console.log('='.repeat(60) + '\n');
}

testStorageAuth().catch(console.error);
