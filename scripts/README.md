# SEO Scripts

This directory contains scripts for managing URLs, sitemaps, and search engine submissions.

## Quick Reference

```bash
# Get all URLs programmatically from database
pnpm seo:urls:raw                # Raw text, one URL per line (for copy/paste)
pnpm seo:urls:print              # Print all URLs grouped by type
pnpm seo:urls:export             # Export to all-urls.json
pnpm seo:urls:indexnow           # Format for IndexNow API

# Verify setup
pnpm seo:verify                  # Check key file and sitemap

# Submit to search engines
pnpm seo:submit:all              # Submit all (uses database)
pnpm seo:submit:indexnow         # From sitemap.xml
pnpm seo:submit:indexnow:db      # From database (recommended)
pnpm seo:submit:bing             # Bing Webmaster API
```

## URL Collection Scripts

### `get-all-urls.ts`

Programmatically collects all URLs from your database and groups them by type.

**URL Groups:**
1. **Static Routes** - Homepage, job board, companies, blog, resources, etc.
2. **Job Pages** - Individual job postings (approved only, SEO-friendly slugs)
3. **Company Pages** - Company profile pages (unique companies from jobs, SEO-friendly slugs)
4. **Blog Pages** - Published blog posts
5. **Resource Pages** - Published resources (webring directory)

**Commands:**

```bash
# Print raw URLs (one per line, no formatting)
pnpm seo:urls:raw

# Example output:
# https://waterloo.works/
# https://waterloo.works/jobs
# https://waterloo.works/companies
# https://waterloo.works/blog
# https://waterloo.works/resources
# https://waterloo.works/jobs/software-engineer-google-waterloo
# https://waterloo.works/jobs/product-manager-meta-remote
# https://waterloo.works/companies/google
# https://waterloo.works/companies/meta
# ...

# Print all URLs with grouping
pnpm seo:urls:print

# Example output:
# 📂 Static Routes (9 URLs)
# ──────────────────────────────────────────────────
#    1. https://waterloo.works/
#    2. https://waterloo.works/jobs
#    3. https://waterloo.works/companies
#    ...
#
# 📂 Job Pages (45 URLs)
# ──────────────────────────────────────────────────
#    1. https://waterloo.works/jobs/clx123...
#    2. https://waterloo.works/jobs/clx456...
#    ...
```

```bash
# Export to JSON file
pnpm seo:urls:export

# Creates: all-urls.json
# {
#   "metadata": {
#     "site": "https://waterloo.works",
#     "totalUrls": 123,
#     "generatedAt": "2025-01-15T10:30:00.000Z"
#   },
#   "groups": [...],
#   "allUrls": [...]
# }
```

```bash
# Format for IndexNow submission
pnpm seo:urls:indexnow

# Outputs JSON array ready for IndexNow API
```

## Verification Script

### `verify-indexnow.ts`

Verifies your IndexNow setup is correct before submitting.

```bash
pnpm seo:verify
```

**Checks:**
- ✅ Key file accessible at `https://waterloo.works/c2625de7b6514de28e9ed33e320098e9.txt`
- ✅ Sitemap accessible at `https://waterloo.works/sitemap.xml`
- ✅ URL counts by type
- ✅ Provides indexing status instructions

## Submission Scripts

### `submit-indexnow.ts`

Submits URLs from your sitemap to IndexNow.

```bash
pnpm seo:submit:indexnow
```

**Features:**
- Reads from `https://waterloo.works/sitemap.xml`
- Submits to IndexNow API (Bing, Yandex, Seznam.cz)
- Handles batching (10,000 URL limit per request)
- Detailed logging

### `submit-indexnow-db.ts` (Recommended)

Submits URLs directly from database to IndexNow.

```bash
pnpm seo:submit:indexnow:db

# Or use the shorthand:
pnpm seo:submit:all
```

**Why use this over sitemap version?**
- ✅ Always up-to-date (reads from live database)
- ✅ No sitemap generation lag
- ✅ Includes all published content
- ✅ Filters by status (approved jobs, published blogs/resources)

**What it submits:**
1. Static routes (9 URLs)
2. Approved job pages (SEO slugs: `position-company-location`)
3. Company pages (unique companies with SEO slugs)
4. Published blog posts
5. Published resources

**Job URL Format:**
Jobs use SEO-friendly slugs generated from `position-company-location`:
- "Software Engineer" at "Google" in "Waterloo" → `/jobs/software-engineer-google-waterloo`
- "Product Manager" at "Meta" in "Remote" → `/jobs/product-manager-meta-remote`

### `submit-bing-webmaster.ts`

Alternative submission via Bing Webmaster API.

```bash
# Set API key first
export BING_WEBMASTER_API_KEY=your_key_here

# Submit
pnpm seo:submit:bing
```

**When to use:**
- Need Bing-specific features
- Want redundancy with IndexNow
- Monitoring Bing Webmaster analytics

**Note:** IndexNow already submits to Bing, so this is optional.

## Response Codes

### IndexNow

- **200 OK** - URLs received and will be processed
- **202 Accepted** ✅ - URLs queued for crawling (most common, this is success!)
- **400 Bad Request** - Check URL format and key location
- **403 Forbidden** - Verify key file is accessible
- **422 Unprocessable** - Invalid URL format or host mismatch

### Bing Webmaster API

- **200 OK** - URLs successfully submitted
- **401 Unauthorized** - Check API key
- **403 Forbidden** - Verify site ownership in Bing Webmaster

## Workflows

### Initial Setup

```bash
# 1. Verify setup
pnpm seo:verify

# 2. Check all URLs
pnpm seo:urls:print

# 3. Submit to IndexNow
pnpm seo:submit:all

# 4. Wait 24-48 hours, then check indexing:
#    site:waterloo.works
```

### After Adding Content

```bash
# After adding new jobs, blogs, or resources:
pnpm seo:submit:all

# This submits all URLs including new content
```

### Regular Monitoring

```bash
# Weekly - Export URLs for auditing
pnpm seo:urls:export

# Review all-urls.json for:
# - Total URL count trends
# - URL structure consistency
# - Missing pages
```

### Pre-Deployment

```bash
# Before deploying to production:
pnpm seo:verify                 # Ensure setup is correct
pnpm seo:urls:print             # Review URLs
```

### Post-Deployment

```bash
# After deploying new content:
pnpm seo:submit:all             # Submit to search engines
```

## Automation

### GitHub Actions

Create `.github/workflows/submit-indexnow.yml`:

```yaml
name: Submit to IndexNow

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Submit to IndexNow
        run: pnpm seo:submit:all
        env:
          NEXT_PUBLIC_SITE_URL: https://waterloo.works
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Post-Build Hook

Add to `package.json`:

```json
{
  "scripts": {
    "postbuild": "pnpm seo:submit:all"
  }
}
```

## Troubleshooting

### "No URLs found in database"

- Check database connection
- Verify jobs have `status: APPROVED`
- Verify blogs/resources have `published: true`

### "Key file not accessible"

- Ensure `public/c2625de7b6514de28e9ed33e320098e9.txt` exists
- Check file contains only the key (no extra whitespace)
- Verify deployment includes public directory

### "403 Forbidden from IndexNow"

- Key file must be accessible at exact URL
- Check CORS/CDN settings if using Cloudflare
- Verify domain matches sitemap URLs

### "Prisma connection error"

- Ensure `DATABASE_URL` environment variable is set
- Check database is accessible from script location
- Verify Prisma client is generated: `pnpm prisma generate`

## Files

```
scripts/
├── README.md                     # This file
├── get-all-urls.ts              # Collect all URLs from database
├── verify-indexnow.ts           # Verify IndexNow setup
├── submit-indexnow.ts           # Submit from sitemap
├── submit-indexnow-db.ts        # Submit from database (recommended)
├── submit-bing-webmaster.ts     # Submit via Bing API
├── generate-content.ts          # Generate markdown from database
└── SEO_SUBMISSION_GUIDE.md      # Full SEO guide

Generated files:
├── all-urls.json                # Exported URL list (from seo:urls:export)
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SITE_URL=https://waterloo.works
DATABASE_URL=postgresql://...

# Optional (for Bing Webmaster API)
BING_WEBMASTER_API_KEY=your_api_key
```

## Resources

- [IndexNow Documentation](https://www.indexnow.org/documentation)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Google Search Console](https://search.google.com/search-console)
- [Full SEO Guide](./SEO_SUBMISSION_GUIDE.md)
