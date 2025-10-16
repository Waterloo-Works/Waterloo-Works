#!/usr/bin/env tsx
/**
 * Backfill User Profiles
 *
 * Creates UserProfile records for any users who don't have one yet.
 * This is useful when the profile feature was added after users already signed up.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-user-profiles.ts
 *   pnpm tsx scripts/backfill-user-profiles.ts --dry-run  # Preview without making changes
 */

import { prisma } from "../../utils/prisma";

interface BackfillStats {
  totalUsers: number;
  usersWithProfiles: number;
  usersWithoutProfiles: number;
  profilesCreated: number;
  errors: number;
}

async function backfillProfiles(dryRun: boolean = false): Promise<BackfillStats> {
  const stats: BackfillStats = {
    totalUsers: 0,
    usersWithProfiles: 0,
    usersWithoutProfiles: 0,
    profilesCreated: 0,
    errors: 0,
  };

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔄 User Profile Backfill Script`);
  console.log(`${"=".repeat(60)}\n`);

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        profile: {
          select: { id: true }
        }
      }
    });

    stats.totalUsers = users.length;
    console.log(`📊 Found ${stats.totalUsers} total users\n`);

    // Filter users without profiles
    const usersWithoutProfiles = users.filter(user => !user.profile);
    const usersWithProfiles = users.filter(user => user.profile);

    stats.usersWithProfiles = usersWithProfiles.length;
    stats.usersWithoutProfiles = usersWithoutProfiles.length;

    console.log(`✅ Users with profiles: ${stats.usersWithProfiles}`);
    console.log(`⚠️  Users without profiles: ${stats.usersWithoutProfiles}\n`);

    if (usersWithoutProfiles.length === 0) {
      console.log("✨ All users already have profiles! Nothing to do.\n");
      return stats;
    }

    // Create profiles for users who don't have them
    console.log(`${"─".repeat(60)}`);
    console.log(`Creating profiles for ${usersWithoutProfiles.length} users...\n`);

    for (const user of usersWithoutProfiles) {
      try {
        if (!dryRun) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
            }
          });
        }

        stats.profilesCreated++;
        console.log(`  ✓ Created profile for: ${user.fullName || user.email} (${user.id})`);
      } catch (error) {
        stats.errors++;
        console.error(`  ✗ Failed to create profile for ${user.email}:`, error);
      }
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`\n📈 SUMMARY`);
    console.log(`${"─".repeat(60)}`);
    console.log(`Total users: ${stats.totalUsers}`);
    console.log(`Profiles already existed: ${stats.usersWithProfiles}`);
    console.log(`Profiles needed: ${stats.usersWithoutProfiles}`);

    if (dryRun) {
      console.log(`\n✅ Would create: ${stats.profilesCreated} profiles`);
      if (stats.errors > 0) {
        console.log(`⚠️  Would fail: ${stats.errors} profiles`);
      }
      console.log(`\n💡 Run without --dry-run to apply changes`);
    } else {
      console.log(`\n✅ Profiles created: ${stats.profilesCreated}`);
      if (stats.errors > 0) {
        console.log(`❌ Errors: ${stats.errors}`);
      }
    }

    console.log(`${"=".repeat(60)}\n`);

  } catch (error) {
    console.error("\n❌ Fatal error during backfill:", error);
    throw error;
  }

  return stats;
}

// Main execution
async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  try {
    await backfillProfiles(isDryRun);

    // Verify integrity after backfill (unless dry run)
    if (!isDryRun) {
      console.log("🔍 Verifying database integrity...\n");

      const usersWithoutProfiles = await prisma.user.findMany({
        where: {
          profile: null
        }
      });

      if (usersWithoutProfiles.length === 0) {
        console.log("✅ SUCCESS: All users now have profiles!\n");
      } else {
        console.warn(`⚠️  WARNING: ${usersWithoutProfiles.length} users still without profiles:`);
        usersWithoutProfiles.forEach(user => {
          console.warn(`  - ${user.email} (${user.id})`);
        });
        console.log();
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
