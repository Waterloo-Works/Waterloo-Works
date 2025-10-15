#!/usr/bin/env tsx
import { PrismaClient, EmploymentType } from "@prisma/client";
import * as readline from "readline";
import fs from "fs";

const prisma = new PrismaClient();

// ANSI color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title: string) {
  console.log("\n" + "=".repeat(60));
  log(title, "bright");
  console.log("=".repeat(60) + "\n");
}

function printHelp() {
  printHeader("📋 Job Management CLI");
  console.log("Usage: pnpm jobs <command>\n");
  console.log("Commands:");
  console.log("  add              Add a single job interactively");
  console.log("  upload <file>    Batch upload jobs from JSON file");
  console.log("  delete <company> Delete all jobs from a company");
  console.log("  list             List all jobs in the database");
  console.log("  help             Show this help message\n");
}

async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    log(`❌ User with email ${email} not found.`, "red");
    log(`Please sign up on the website first or update the email.`, "yellow");
    process.exit(1);
  }

  return user;
}

async function addJobInteractive() {
  printHeader("➕ Add New Job");

  try {
    // Get uploader email
    const email = await question("Your email (uploader): ");
    const user = await getUser(email);
    log(`✅ Found user: ${user.fullName || user.email}\n`, "green");

    // Collect job details
    const company = await question("Company name: ");
    const companyUrl = await question("Company website (optional): ");
    const position = await question("Position title: ");
    const location = await question("Location (e.g., San Francisco, CA): ");

    log("\nEmployment Type:", "cyan");
    log("1. Full-time");
    log("2. Part-time");
    log("3. Contract");
    log("4. Internship");
    log("5. Other");
    const typeChoice = await question("Select type (1-5): ");
    const employmentTypeMap: Record<string, EmploymentType> = {
      "1": "FULL_TIME",
      "2": "PART_TIME",
      "3": "CONTRACT",
      "4": "INTERNSHIP",
      "5": "OTHER",
    };
    const employmentType = employmentTypeMap[typeChoice] || "FULL_TIME";

    const salaryMin = await question("Minimum salary (e.g., $120k, optional): ");
    const salaryMax = await question("Maximum salary (e.g., $180k, optional): ");
    const contact = await question("Contact text (e.g., Apply Now): ");
    const contactUrl = await question("Application URL: ");

    log("\nJob Description (paste below, press Ctrl+D when done):", "cyan");
    const description = await new Promise<string>((resolve) => {
      const chunks: string[] = [];
      process.stdin.on("data", (chunk) => {
        chunks.push(chunk.toString());
      });
      process.stdin.on("end", () => {
        resolve(chunks.join(""));
      });
      process.stdin.resume();
    });

    // Confirm before creating
    log("\n📝 Job Summary:", "bright");
    console.log(`Company: ${company}`);
    console.log(`Position: ${position}`);
    console.log(`Location: ${location}`);
    console.log(`Type: ${employmentType}`);
    console.log(`Salary: ${salaryMin || "N/A"} - ${salaryMax || "N/A"}`);
    console.log(`Contact: ${contact}`);
    console.log(`URL: ${contactUrl}\n`);

    const confirm = await question("Create this job? (y/n): ");
    if (confirm.toLowerCase() !== "y") {
      log("❌ Job creation cancelled", "yellow");
      return;
    }

    // Create job
    await prisma.job.create({
      data: {
        company,
        companyUrl: companyUrl || null,
        position,
        contact,
        contactUrl: contactUrl || null,
        location,
        employmentType,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        notes: description || null,
        postedBy: user.id,
        status: "APPROVED",
      },
    });

    log("\n✅ Job created successfully!", "green");
    log("Run 'pnpm run generate:content' to update the website.", "cyan");
  } catch (error) {
    log("\n❌ Error creating job:", "red");
    console.error(error);
  }
}

// Ashby JSON parser (for scraped job boards)
interface AshbyJob {
  label: string;
  sourceLink: string;
  sourceUrl: string;
  text: string;
  links?: Array<{ text: string; url: string }>;
}

function parseAshbyJson(data: any[], company: string): any[] {
  const jobMap = new Map<string, AshbyJob>();

  // Extract unique jobs from Ashby format
  for (const item of data) {
    if (item.label === "#overview" && item.sourceLink?.includes("@")) {
      jobMap.set(item.sourceUrl, item);
    }
  }

  const jobs = [];
  for (const [sourceUrl, job] of jobMap.entries()) {
    const position = job.sourceLink.replace(`@ ${company}`, "").trim();
    const applyLink = job.links?.find((link) => link.text === "Apply for this Job");

    // Parse location
    const locationMatch = job.text.match(/Location\s*\n([^\n]+)/);
    const location = locationMatch ? locationMatch[1].trim().split("\n")[0] : "Remote";

    // Parse employment type
    const employmentMatch = job.text.match(/Employment Type\s*\n([^\n]+)/);
    let employmentType: EmploymentType = "FULL_TIME";
    if (employmentMatch) {
      const type = employmentMatch[1].toLowerCase();
      if (type.includes("part time")) employmentType = "PART_TIME";
      else if (type.includes("contract")) employmentType = "CONTRACT";
      else if (type.includes("internship")) employmentType = "INTERNSHIP";
    }

    // Parse salary
    const compensationMatch = job.text.match(/Compensation\s*\n([^\n]+)/);
    let salaryMin = null;
    let salaryMax = null;
    if (compensationMatch) {
      const salaryMatch = compensationMatch[1].match(/\$(\d+)K\s*[–-]\s*\$(\d+)K/);
      if (salaryMatch) {
        salaryMin = `$${salaryMatch[1]}k`;
        salaryMax = `$${salaryMatch[2]}k`;
      }
    }

    jobs.push({
      position,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      contact: "Apply Now",
      contactUrl: applyLink?.url || sourceUrl,
      description: job.text,
    });
  }

  return jobs;
}

async function uploadFromJson(filePath: string) {
  printHeader("📤 Batch Upload from JSON");

  try {
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`, "red");
      process.exit(1);
    }

    const email = await question("Your email (uploader): ");
    const user = await getUser(email);
    log(`✅ Found user: ${user.fullName || user.email}\n`, "green");

    const company = await question("Company name for these jobs: ");
    const companyUrl = await question("Company website: ");

    log(`\n📄 Reading ${filePath}...`, "cyan");
    const rawData = fs.readFileSync(filePath, "utf-8");
    let data = JSON.parse(rawData);

    // Detect Ashby format and parse if needed
    if (Array.isArray(data) && data[0]?.label && data[0]?.sourceLink) {
      log("🔍 Detected Ashby format, parsing...", "cyan");
      data = parseAshbyJson(data, company);
    }

    if (!Array.isArray(data)) {
      log("❌ JSON file must contain an array of jobs", "red");
      process.exit(1);
    }

    log(`Found ${data.length} jobs to process\n`, "green");

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const item of data) {
      try {
        const existing = await prisma.job.findFirst({
          where: {
            company,
            position: item.position,
          },
        });

        if (existing) {
          log(`⏭️  Skipping: ${item.position} (already exists)`, "yellow");
          skipCount++;
          continue;
        }

        await prisma.job.create({
          data: {
            company,
            companyUrl: companyUrl || null,
            position: item.position,
            contact: item.contact || "Apply Now",
            contactUrl: item.contactUrl || item.applyUrl || null,
            location: item.location,
            employmentType: item.employmentType || "FULL_TIME",
            salaryMin: item.salaryMin || null,
            salaryMax: item.salaryMax || null,
            notes: item.description || item.notes || null,
            postedBy: user.id,
            status: "APPROVED",
          },
        });

        log(`✅ Created: ${item.position}`, "green");
        successCount++;
      } catch (error) {
        log(`❌ Error creating ${item.position}: ${error}`, "red");
        errorCount++;
      }
    }

    log("\n📊 Upload Summary:", "bright");
    log(`   ✅ Created: ${successCount}`, "green");
    log(`   ⏭️  Skipped: ${skipCount}`, "yellow");
    log(`   ❌ Errors: ${errorCount}`, "red");
    log("\nRun 'pnpm run generate:content' to update the website.", "cyan");
  } catch (error) {
    log("\n❌ Error uploading jobs:", "red");
    console.error(error);
  }
}

async function deleteCompanyJobs(company: string) {
  printHeader("🗑️  Delete Company Jobs");

  try {
    const jobs = await prisma.job.findMany({
      where: { company },
      select: { id: true, position: true },
    });

    if (jobs.length === 0) {
      log(`No jobs found for company: ${company}`, "yellow");
      return;
    }

    log(`Found ${jobs.length} jobs for ${company}:`, "cyan");
    jobs.forEach((job) => {
      console.log(`  - ${job.position}`);
    });

    const confirm = await question(`\nDelete all ${jobs.length} jobs? (y/n): `);
    if (confirm.toLowerCase() !== "y") {
      log("❌ Deletion cancelled", "yellow");
      return;
    }

    const result = await prisma.job.deleteMany({
      where: { company },
    });

    log(`\n✅ Deleted ${result.count} jobs`, "green");
    log("Run 'pnpm run generate:content' to update the website.", "cyan");
  } catch (error) {
    log("\n❌ Error deleting jobs:", "red");
    console.error(error);
  }
}

async function listJobs() {
  printHeader("📋 All Jobs");

  try {
    const jobs = await prisma.job.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        poster: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (jobs.length === 0) {
      log("No jobs found", "yellow");
      return;
    }

    log(`Total jobs: ${jobs.length}\n`, "green");

    // Group by company
    const byCompany = jobs.reduce((acc, job) => {
      if (!acc[job.company]) acc[job.company] = [];
      acc[job.company].push(job);
      return acc;
    }, {} as Record<string, typeof jobs>);

    for (const [company, companyJobs] of Object.entries(byCompany)) {
      log(`\n${company} (${companyJobs.length} jobs)`, "bright");
      companyJobs.forEach((job) => {
        console.log(`  • ${job.position}`);
        console.log(`    Location: ${job.location} | Type: ${job.employmentType}`);
        if (job.salaryMin || job.salaryMax) {
          console.log(`    Salary: ${job.salaryMin || "?"} - ${job.salaryMax || "?"}`);
        }
        console.log(`    Posted by: ${job.poster?.fullName || job.poster?.email}`);
      });
    }
  } catch (error) {
    log("\n❌ Error listing jobs:", "red");
    console.error(error);
  }
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case "add":
        await addJobInteractive();
        break;
      case "upload":
        if (!arg) {
          log("❌ Please provide a JSON file path", "red");
          log("Usage: pnpm jobs upload <file>", "cyan");
          process.exit(1);
        }
        await uploadFromJson(arg);
        break;
      case "delete":
        if (!arg) {
          log("❌ Please provide a company name", "red");
          log("Usage: pnpm jobs delete <company>", "cyan");
          process.exit(1);
        }
        await deleteCompanyJobs(arg);
        break;
      case "list":
        await listJobs();
        break;
      case "help":
      default:
        printHelp();
        break;
    }
  } catch (error) {
    log("\n❌ An error occurred:", "red");
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
