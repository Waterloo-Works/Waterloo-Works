# 📋 Job Management CLI

A unified, user-friendly command-line tool for managing jobs on Waterloo App.

## Quick Start

```bash
# Show available commands
pnpm jobs help

# Add a single job interactively
pnpm jobs add

# Batch upload from JSON file
pnpm jobs upload path/to/jobs.json

# List all jobs
pnpm jobs list

# Delete all jobs from a company
pnpm jobs delete "Company Name"
```

## Commands

### 📝 Add Job Interactively

```bash
pnpm jobs add
```

Guides you through an interactive prompt to add a single job:
- Enter your email (must be registered)
- Company details (name, website)
- Job details (position, location, type)
- Salary range (optional)
- Application link
- Job description

### 📤 Batch Upload from JSON

```bash
pnpm jobs upload /path/to/jobs.json
```

Upload multiple jobs from a JSON file. Supports two formats:

**Standard Format:**
```json
[
  {
    "position": "Software Engineer",
    "location": "San Francisco, CA",
    "employmentType": "FULL_TIME",
    "salaryMin": "$120k",
    "salaryMax": "$180k",
    "contact": "Apply Now",
    "contactUrl": "https://company.com/apply",
    "description": "Job description here..."
  }
]
```

**Ashby Format (Auto-detected):**
The CLI automatically detects and parses Ashby job board JSON exports! Just export from Ashby and upload directly:

```bash
pnpm jobs upload ~/Downloads/ashby-jobs.json
# CLI detects Ashby format automatically
# Parses positions, locations, salaries, and application links
```

### 📋 List All Jobs

```bash
pnpm jobs list
```

View all approved jobs grouped by company with full details.

### 🗑️ Delete Company Jobs

```bash
pnpm jobs delete "Company Name"
```

Delete all jobs from a specific company (with confirmation).

## After Adding Jobs

**Always regenerate content after changes:**

```bash
pnpm run generate:content
```

This creates the markdown files that power the website. Then restart your dev server to see changes.

## Employment Types

- `FULL_TIME` - Full-time position
- `PART_TIME` - Part-time position  
- `CONTRACT` - Contract work
- `INTERNSHIP` - Internship
- `OTHER` - Other type

## Examples

### Adding a Single Job

```bash
$ pnpm jobs add
Your email: you@example.com
Company name: Acme Corp
Company website: https://acme.com
Position title: Senior Engineer
...
✅ Job created successfully!
```

### Batch Upload (Standard Format)

```bash
$ pnpm jobs upload jobs.json
Your email: you@example.com
Company name: TechCorp
Company website: https://techcorp.com

📄 Reading jobs.json...
Found 5 jobs to process

✅ Created: Software Engineer
✅ Created: Product Manager
⏭️  Skipping: DevOps Engineer (already exists)
...
```

### Batch Upload (Ashby Format)

```bash
$ pnpm jobs upload ~/Downloads/reducto-jobs.json
Your email: you@example.com
Company name: Reducto
Company website: https://reducto.ai

📄 Reading ~/Downloads/reducto-jobs.json...
🔍 Detected Ashby format, parsing...
Found 18 jobs to process

✅ Created: Backend/AI Engineer
✅ Created: Frontend Engineer
...
```

### Viewing All Jobs

```bash
$ pnpm jobs list

Reducto (18 jobs)
  • Backend/AI Engineer
    Location: San Francisco, CA | Type: FULL_TIME
    Salary: $150k - $300k
  • Frontend Engineer
    ...
```

### Cleaning Up

```bash
$ pnpm jobs delete "OldCompany"
Found 3 jobs for OldCompany:
  - Software Engineer
  - Product Manager
  - Designer

Delete all 3 jobs? (y/n): y
✅ Deleted 3 jobs
```

## Tips

1. **Test first** - Use `pnpm jobs add` to add one job and verify everything works
2. **Keep JSON organized** - Group jobs by company in separate files
3. **Always regenerate** - Run `pnpm run generate:content` after changes
4. **Ashby support** - Just export and upload, the CLI handles parsing automatically

## Troubleshooting

**"User not found"**
- Sign up on the website first
- Verify email address is correct

**"Job already exists"**
- CLI skips duplicates (same company + position)
- Use `pnpm jobs delete` first if needed

**Jobs not appearing**
- Run `pnpm run generate:content`
- Restart dev server
- Clear browser cache

## Migration from Old Scripts

All previous job management scripts have been consolidated into this CLI:
- ✅ `add-metavoice-job.ts` → `pnpm jobs add`
- ✅ `delete-reducto-jobs.ts` → `pnpm jobs delete "Reducto"`
- ✅ `upload-reducto-jobs.ts` → `pnpm jobs upload ashby.json`

The unified CLI is more powerful and easier to use!

---

# 👤 User Profile Management

## Backfill User Profiles

Creates UserProfile records for any existing users who don't have one yet. This is useful when deploying the profile feature to a database with existing users.

### Usage

```bash
# Preview which users need profiles (dry run)
pnpm tsx scripts/backfill-user-profiles.ts --dry-run

# Create profiles for all users who don't have one
pnpm tsx scripts/backfill-user-profiles.ts
```

### What It Does

- Scans all users in the database
- Identifies users without a UserProfile record
- Creates empty profiles for those users
- Reports detailed statistics

### Example Output

```bash
============================================================
🔄 User Profile Backfill Script
============================================================

📊 Found 127 total users

✅ Users with profiles: 120
⚠️  Users without profiles: 7

────────────────────────────────────────────────────────────
Creating profiles for 7 users...

  ✓ Created profile for: John Doe (user_abc123)
  ✓ Created profile for: jane@example.com (user_def456)
  ...

────────────────────────────────────────────────────────────

📈 SUMMARY
────────────────────────────────────────────────────────────
Total users: 127
Profiles already existed: 120
Profiles needed: 7

✅ Profiles created: 7
============================================================

🔍 Verifying database integrity...

✅ SUCCESS: All users now have profiles!
```

### When to Use

- **Initial deployment** - After adding the UserProfile feature to an existing database
- **After data migrations** - If user records were imported without profiles
- **Database recovery** - If profiles were accidentally deleted

### Safety Features

- **Dry run mode** - Preview changes without modifying the database
- **Idempotent** - Safe to run multiple times (skips users with existing profiles)
- **Detailed logging** - See exactly which profiles are created
- **Verification step** - Confirms all users have profiles after completion
- **Error handling** - Continues processing even if individual profiles fail

### Notes

- UserProfiles are automatically created on sign-up via the auth callback
- This script is only needed for **existing users** who signed up before the profile feature
- All profiles start empty (completionScore: 0) and can be filled in by users later
