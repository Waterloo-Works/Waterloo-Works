#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

interface SlashEntry {
  label: string;
  sourceLink: string;
  sourceUrl: string;
  text: string;
  links?: Array<{ text: string; url: string }>;
}

interface ParsedJob {
  position: string;
  description: string;
  location: string;
  contactUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

function parseSalary(text: string): { min: number | null; max: number | null } {
  // Look for patterns like "$175K – $250K" or "$60K – $70K"
  const salaryMatch = text.match(/\$(\d+)K\s*[–-]\s*\$(\d+)K/);
  if (salaryMatch) {
    return {
      min: parseInt(salaryMatch[1]) * 1000,
      max: parseInt(salaryMatch[2]) * 1000,
    };
  }
  return { min: null, max: null };
}

function parseLocation(text: string): string {
  // Extract location from text like "Location\nSan Francisco Office"
  const lines = text.split('\n');
  const locationIndex = lines.findIndex(line => line.trim() === 'Location');
  if (locationIndex !== -1 && locationIndex + 1 < lines.length) {
    const location = lines[locationIndex + 1].trim();
    // Clean up "San Francisco Office" to just "San Francisco, CA"
    if (location.includes('San Francisco')) {
      return 'San Francisco, CA';
    }
    return location;
  }
  return 'San Francisco, CA'; // Default
}

function groupByJob(entries: SlashEntry[]): Map<string, SlashEntry[]> {
  const jobMap = new Map<string, SlashEntry[]>();

  for (const entry of entries) {
    // Skip entries without meaningful sourceUrl
    if (!entry.sourceUrl || entry.sourceUrl === 'https://jobs.ashbyhq.com/slash-financial') {
      continue;
    }

    if (!jobMap.has(entry.sourceUrl)) {
      jobMap.set(entry.sourceUrl, []);
    }
    jobMap.get(entry.sourceUrl)!.push(entry);
  }

  return jobMap;
}

function parseJobGroup(entries: SlashEntry[]): ParsedJob | null {
  // Find the overview entry with full description
  const overviewEntry = entries.find(e => e.label === '#overview');
  if (!overviewEntry) return null;

  // Find the metadata entry with location and salary
  const metadataEntry = entries.find(e =>
    e.label === '._left_oj0x8_418.ashby-job-posting-left-pane._container_101oc_29'
  );

  // Extract position from sourceLink (remove "@ Slash Financial")
  let position = overviewEntry.sourceLink.replace(' @ Slash Financial', '').trim();

  // Get application URL
  const applyLink = overviewEntry.links?.find(l => l.text === 'Apply for this Job');
  const contactUrl = applyLink?.url || overviewEntry.sourceUrl;

  // Parse location and salary from metadata
  let location = 'San Francisco, CA';
  let salaryMin = null;
  let salaryMax = null;

  if (metadataEntry) {
    location = parseLocation(metadataEntry.text);
    const salary = parseSalary(metadataEntry.text);
    salaryMin = salary.min;
    salaryMax = salary.max;
  }

  return {
    position,
    description: overviewEntry.text,
    location,
    contactUrl,
    salaryMin,
    salaryMax,
  };
}

async function main() {
  const email = "edenchan717@gmail.com";
  const company = "Slash";
  const companyUrl = "https://jobs.ashbyhq.com/slash-financial";
  const filePath = "/tmp/slash-jobs.json";

  console.log(`📖 Reading jobs from ${filePath}...`);
  const rawData = fs.readFileSync(filePath, "utf-8");
  const entries = JSON.parse(rawData) as SlashEntry[];

  console.log(`📊 Found ${entries.length} total entries`);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email}`);

  // Group entries by job
  const jobGroups = groupByJob(entries);
  console.log(`📦 Grouped into ${jobGroups.size} unique job postings`);

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const [sourceUrl, entries] of jobGroups) {
    const parsed = parseJobGroup(entries);
    if (!parsed) {
      console.log(`⚠️  Skipping job with URL ${sourceUrl} - could not parse`);
      skippedCount++;
      continue;
    }

    // Check if job already exists
    const existing = await prisma.job.findFirst({
      where: {
        company,
        position: parsed.position,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${parsed.position}" - already exists`);
      skippedCount++;
      continue;
    }

    // Create job
    await prisma.job.create({
      data: {
        company,
        companyUrl,
        position: parsed.position,
        contact: "Apply Now",
        contactUrl: parsed.contactUrl,
        location: parsed.location,
        employmentType: "FULL_TIME",
        salaryMin: parsed.salaryMin,
        salaryMax: parsed.salaryMax,
        notes: parsed.description,
        postedBy: user.id,
        status: "APPROVED",
      },
    });

    console.log(`✅ Uploaded: ${parsed.position}`);
    uploadedCount++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Uploaded: ${uploadedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${jobGroups.size}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
