# SEO Submission Guide

This guide covers how to submit your site to search engines for indexing using the automated scripts.

## Quick Start

```bash
# 1. Submit to IndexNow (Bing, Yandex, Seznam.cz automatically)
pnpm tsx scripts/submit-indexnow.ts

# 2. Submit to Bing Webmaster API (optional, redundant with IndexNow)
export BING_WEBMASTER_API_KEY=your_api_key_here
pnpm tsx scripts/submit-bing-webmaster.ts
```

## What Each Script Does

### IndexNow Script (`submit-indexnow.ts`)
- Reads your sitemap from `https://waterloo.works/sitemap.xml`
- Submits all URLs to IndexNow API
- Automatically notifies Bing, Yandex, and other IndexNow partners
- **No API key needed** (uses the key file already hosted)
- Run this after deploying new content

### Bing Webmaster Script (`submit-bing-webmaster.ts`)
- Uses Bing Webmaster API directly
- Requires API key from Bing Webmaster Tools
- Alternative to IndexNow for Bing-specific submission
- Useful for additional Bing-specific features

## Setup Instructions

### 1. IndexNow (Recommended - Submit Once)

IndexNow is the easiest way to notify multiple search engines at once.

**Prerequisites:**
- ✅ API key file already hosted at: `https://waterloo.works/c2625de7b6514de28e9ed33e320098e9.txt`
- ✅ Sitemap already generated at: `https://waterloo.works/sitemap.xml`

**Run the script:**
```bash
pnpm tsx scripts/submit-indexnow.ts
```

**What happens:**
1. Script fetches your sitemap
2. Extracts all URLs (jobs, companies, blogs, resources, static pages)
3. Submits to IndexNow API
4. IndexNow automatically notifies Bing, Yandex, Seznam.cz

**When to run:**
- After deploying new content
- After updating existing pages
- After major site changes
- Recommended: Set up as a post-deploy hook

---

### 2. Google Search Console (Manual - One Time Setup)

Google doesn't support IndexNow yet, so you need to submit manually.

**Steps:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://waterloo.works`
3. Verify ownership (several methods available):
   - DNS verification
   - HTML file upload
   - HTML tag
   - Google Analytics
4. Submit sitemap:
   - Go to **Sitemaps** in left sidebar
   - Enter: `https://waterloo.works/sitemap.xml`
   - Click **Submit**

**Verification Methods:**
- **DNS (Recommended)**: Add TXT record to your domain
- **HTML File**: Upload verification file to `/public` directory
- **HTML Tag**: Add meta tag to `<head>` in `app/layout.tsx`

---

### 3. Bing Webmaster Tools (Manual + Optional API)

**Initial Setup (One Time):**
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site: `https://waterloo.works`
3. Verify ownership (similar to Google)
4. Submit sitemap: `https://waterloo.works/sitemap.xml`

**Optional - API Submission:**

If you want to use the API for programmatic submissions:

1. In Bing Webmaster Tools, go to **Settings > API Access**
2. Copy your API key
3. Set environment variable:
   ```bash
   export BING_WEBMASTER_API_KEY=your_api_key_here
   ```
4. Run the script:
   ```bash
   pnpm tsx scripts/submit-bing-webmaster.ts
   ```

**Note:** Using IndexNow already submits to Bing, so this API is optional.

---

## Automation Options

### Option 1: Post-Build Script

Add to `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "pnpm tsx scripts/submit-indexnow.ts"
  }
}
```

### Option 2: GitHub Actions (Recommended)

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

      - name: Submit to IndexNow
        run: pnpm tsx scripts/submit-indexnow.ts
        env:
          NEXT_PUBLIC_SITE_URL: https://waterloo.works
```

### Option 3: Cloudflare Workers Deploy Hook

If using Cloudflare Workers (your current setup), add to your deploy script:
```bash
# After deployment succeeds
curl -X POST https://waterloo.works/api/submit-indexnow
```

Then create an API route that triggers the submission.

---

## Monitoring & Verification

### Check if URLs are indexed:

**Google:**
```
site:waterloo.works
```

**Bing:**
```
site:waterloo.works
```

### View Indexing Status:

**Google Search Console:**
- Go to **Coverage** report
- See indexed vs. not indexed pages
- Check for errors

**Bing Webmaster:**
- Go to **Reports & Data > Index Explorer**
- See indexed pages count
- Check crawl stats

---

## Troubleshooting

### IndexNow Submission Fails

**Error: 403 Forbidden**
- Verify key file is accessible: `https://waterloo.works/c2625de7b6514de28e9ed33e320098e9.txt`
- Ensure it contains only the key string (no extra whitespace)

**Error: 422 Unprocessable Entity**
- Check sitemap is valid XML
- Verify all URLs use HTTPS
- Ensure URLs match your domain

### Google Not Indexing

**Common causes:**
1. **robots.txt blocking**: Check `https://waterloo.works/robots.txt`
   - Should allow search engines
   - Should reference sitemap
2. **Sitemap errors**: Use Google's Sitemap tester
3. **Low-quality content**: Ensure pages have unique, valuable content
4. **New site**: Can take 1-4 weeks for initial indexing

**Solutions:**
- Submit individual URLs via Search Console
- Request indexing for important pages
- Build backlinks to improve crawl frequency

### Bing API Errors

**401 Unauthorized:**
- Check API key is correct
- Verify site is added to Bing Webmaster Tools

**403 Forbidden:**
- Ensure site is verified in Bing Webmaster

---

## Best Practices

1. **Submit after content changes**: Run IndexNow script when you:
   - Add new jobs/companies/blogs/resources
   - Update existing content
   - Change site structure

2. **Don't spam**:
   - IndexNow rate limits apply
   - No need to resubmit unchanged URLs
   - Wait at least 10 minutes between submissions

3. **Monitor indexing**:
   - Check Search Console weekly
   - Track indexed pages count
   - Fix crawl errors promptly

4. **Sitemap hygiene**:
   - Keep sitemap under 50MB / 50,000 URLs
   - Update `lastModified` dates accurately
   - Use priority values correctly (0.0-1.0)

5. **Content quality**:
   - Unique, valuable content
   - Proper meta titles/descriptions
   - Internal linking structure
   - Mobile-friendly pages

---

## Current Configuration

**Your Setup:**
- ✅ Sitemap: `https://waterloo.works/sitemap.xml`
- ✅ Robots.txt: `https://waterloo.works/robots.txt`
- ✅ IndexNow key: `https://waterloo.works/c2625de7b6514de28e9ed33e320098e9.txt`
- ✅ Static generation: All SEO pages (jobs, companies, blogs, resources)
- ✅ Content-collections: 4 collections with 38+ documents
- ✅ Meta tags: Title, description, Open Graph for social sharing

**Public Routes:**
- Jobs: `/jobs`, `/jobs/[slug]`
- Companies: `/companies`, `/companies/[slug]`
- Blogs: `/blog`, `/blog/[slug]`
- Resources: `/resources`, `/resources/[slug]`

**Blocked Routes (robots.txt):**
- `/api/*`
- `/admin/*`
- `/dashboard/*`
- `/my-jobs/*`
- `/inbox/*`
- `/bookmarks/*`

---

## Resources

- [IndexNow Documentation](https://www.indexnow.org/documentation)
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Bing Webmaster API Reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api)
- [Next.js Sitemap Guide](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
