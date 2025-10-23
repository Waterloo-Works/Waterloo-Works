#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import { Ollama } from "ollama";

// Use Ollama Cloud instead of local
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
if (!OLLAMA_API_KEY) {
  throw new Error("OLLAMA_API_KEY not found in environment variables");
}

const ollama = new Ollama({
  host: 'https://ollama.com',
  headers: {
    Authorization: `Bearer ${OLLAMA_API_KEY}`
  }
});

const prisma = new PrismaClient();

const MARKDOWN_PROMPT = `You are a professional job description formatter. Convert the following job description into clean, well-structured markdown format.

Guidelines:
- Use proper markdown headings (## for sections like "About the Company", "About the Role", "Responsibilities", "Requirements", "Benefits")
- Use bullet points (-) for lists
- Use **bold** for important terms or job titles
- Keep the original content intact - only format it, don't rewrite or summarize
- Maintain all URLs and contact information
- Remove any redundant spacing or formatting artifacts
- Organize content logically into clear sections

Job Description:
{job_description}

Return ONLY the formatted markdown, no explanations or additional text.`;

async function markdownifyJobDescription(jobDescription: string): Promise<string> {
  try {
    const prompt = MARKDOWN_PROMPT.replace("{job_description}", jobDescription);

    const response = await ollama.generate({
      model: "llama3.1",
      prompt: prompt,
      options: {
        temperature: 0.3, // Lower temperature for more consistent formatting
        num_predict: 2000, // Allow longer responses for detailed JDs
      },
    });

    return response.response.trim();
  } catch (error) {
    console.error("Error formatting with Ollama:", error);
    throw error;
  }
}

async function main() {
  console.log("🔍 Connecting to Ollama Cloud...");
  console.log("✅ Using Ollama Cloud with API key");

  // Fetch all approved jobs with notes
  const jobs = await prisma.job.findMany({
    where: {
      status: "APPROVED",
      notes: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`\n📝 Found ${jobs.length} jobs with descriptions to format\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const progress = `[${i + 1}/${jobs.length}]`;

    console.log(`${progress} Processing: ${job.company} - ${job.position}`);

    if (!job.notes) {
      console.log(`   ⏭️  Skipping (no description)`);
      skipCount++;
      continue;
    }

    // Check if already markdown formatted (contains markdown headers)
    if (job.notes.includes("##") || job.notes.includes("**")) {
      console.log(`   ⏭️  Skipping (already formatted)`);
      skipCount++;
      continue;
    }

    try {
      const formattedMarkdown = await markdownifyJobDescription(job.notes);

      // Update the job with formatted markdown
      await prisma.job.update({
        where: { id: job.id },
        data: { notes: formattedMarkdown },
      });

      console.log(`   ✅ Formatted and updated`);
      successCount++;

      // Add a small delay to avoid overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : String(error));
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully formatted: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${jobs.length}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
