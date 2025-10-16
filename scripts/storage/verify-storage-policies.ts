#!/usr/bin/env tsx
/**
 * Verify Storage Policies
 * Checks if RLS policies exist for the resumes bucket
 */

import { prisma } from '../../utils/prisma';

async function verifyPolicies() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Verifying Storage Policies');
  console.log('='.repeat(60) + '\n');

  try {
    // Query to check if policies exist
    const policies = await prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'objects'
      AND policyname ILIKE '%resume%'
      ORDER BY policyname;
    `;

    console.log(`Found ${(policies as any[]).length} resume-related policies:\n`);

    if ((policies as any[]).length === 0) {
      console.log('❌ No policies found!');
      console.log('\n⚠️  Policies may not have been created successfully.');
      console.log('   Please run the SQL manually in Supabase SQL Editor:\n');
      console.log('   supabase/setup-resume-storage.sql\n');
    } else {
      (policies as any[]).forEach((policy: any, i: number) => {
        console.log(`${i + 1}. ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log();
      });

      console.log('✅ Policies exist!\n');
    }

    // Also check bucket configuration
    const bucket = await prisma.$queryRaw`
      SELECT id, name, public, file_size_limit, allowed_mime_types
      FROM storage.buckets
      WHERE name = 'resumes';
    `;

    if ((bucket as any[]).length > 0) {
      const b = (bucket as any[])[0];
      console.log('📦 Bucket Configuration:');
      console.log(`   Name: ${b.name}`);
      console.log(`   Public: ${b.public}`);
      console.log(`   Size Limit: ${(b.file_size_limit / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Allowed Types: ${b.allowed_mime_types?.join(', ') || 'None specified'}`);
      console.log();
    }

  } catch (error) {
    console.error('❌ Error querying policies:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('='.repeat(60) + '\n');
}

verifyPolicies();
