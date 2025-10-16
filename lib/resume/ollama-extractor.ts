/**
 * Ollama Resume Data Extractor
 * Uses Ollama Cloud (gpt-oss:120b) to extract structured profile data from resume text
 */

import { Ollama } from 'ollama';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY!;

export interface ExtractedProfileData {
  headline?: string;
  location?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  experienceSummary?: string;
  skills: string[];
  primarySkills: string[];
  degree?: string;
  school?: string;
  graduationYear?: number;
  desiredRoles: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
}

const EXTRACTION_PROMPT = `You are an expert resume parser. Extract structured profile information from the resume text below.

**IMPORTANT RULES:**
1. Return ONLY valid JSON - no markdown, no explanations, no code blocks
2. Be conservative - only extract data that is clearly present
3. Calculate yearsOfExperience from work history dates (e.g., Aug 2024 - Present + Aug 2023 - March 2024 + Sep 2022 - Feb 2022 = ~2.5 years)
4. Extract ALL technical skills mentioned (languages, frameworks, tools, technologies)
5. Identify top 3-5 PRIMARY skills based on prominence, recency, and frequency
6. Extract education details (degree, school, graduation year)
7. Find ALL URLs - look for LinkedIn, GitHub, portfolio websites, personal sites
8. Generate a professional headline from current role + key skills (e.g., "Software Engineer | React & Node.js")
9. Infer location from most recent job or education
10. Summarize work experience in 2-3 concise sentences focusing on impact and technologies
11. Infer desiredRoles from experience (e.g., if they're a "Software Developer", add "Software Engineer", "Full Stack Developer")

**JSON SCHEMA (return exactly this structure):**
{
  "headline": "string (professional headline)",
  "location": "string (city, state/country)",
  "currentRole": "string (most recent job title)",
  "yearsOfExperience": number (total years, can be decimal),
  "experienceSummary": "string (2-3 sentence summary)",
  "skills": ["array of ALL skills"],
  "primarySkills": ["array of top 3-5 most important skills"],
  "degree": "string (highest degree earned)",
  "school": "string (university name)",
  "graduationYear": number (year graduated),
  "desiredRoles": ["array of target job titles based on experience"],
  "linkedinUrl": "string (full URL) or null",
  "githubUrl": "string (full URL) or null",
  "portfolioUrl": "string (full URL) or null",
  "personalWebsite": "string (full URL) or null"
}

**Resume Text:**
{resumeText}

**Return only the JSON object:**`;

/**
 * Extract structured profile data from resume text using Ollama Cloud
 */
export async function extractProfileWithOllama(
  resumeText: string
): Promise<ExtractedProfileData> {
  try {
    const ollama = new Ollama({
      host: 'https://ollama.com',
      headers: {
        Authorization: `Bearer ${OLLAMA_API_KEY}`
      }
    });

    console.log('Extracting profile data with Ollama gpt-oss:120b...');

    const prompt = EXTRACTION_PROMPT.replace('{resumeText}', resumeText);

    // Use non-streaming for easier JSON parsing
    const response = await ollama.chat({
      model: 'gpt-oss:120b',
      messages: [
        {
          role: 'system',
          content: 'You are a resume parser that returns ONLY valid JSON. No markdown, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      options: {
        temperature: 0.1, // Low temperature for consistency
        num_predict: 2000 // Max tokens for response
      }
    });

    const content = response.message.content;
    console.log('Raw Ollama response:', content.substring(0, 200) + '...');

    // Clean up response (remove markdown code blocks if present)
    let jsonStr = content.trim();

    // Remove markdown code blocks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\s*$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/```\s*$/, '');
    }

    // Parse JSON
    const extracted = JSON.parse(jsonStr.trim()) as ExtractedProfileData;

    // Validate required fields
    if (!extracted.skills || !Array.isArray(extracted.skills)) {
      throw new Error('Invalid extraction: skills array is required');
    }
    if (!extracted.primarySkills || !Array.isArray(extracted.primarySkills)) {
      extracted.primarySkills = extracted.skills.slice(0, 5);
    }
    if (!extracted.desiredRoles || !Array.isArray(extracted.desiredRoles)) {
      extracted.desiredRoles = [];
    }

    console.log('Successfully extracted profile data');
    console.log('Skills:', extracted.skills.length, 'Primary:', extracted.primarySkills.length);

    return extracted;
  } catch (error) {
    console.error('Ollama extraction error:', error);

    // If JSON parsing fails, try to extract manually
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON response. Raw response was likely malformed.');
    }

    throw new Error(
      `Failed to extract profile data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate and sanitize extracted data
 */
export function validateExtractedData(data: Partial<ExtractedProfileData>): ExtractedProfileData {
  return {
    headline: data.headline?.trim() || undefined,
    location: data.location?.trim() || undefined,
    currentRole: data.currentRole?.trim() || undefined,
    yearsOfExperience: typeof data.yearsOfExperience === 'number' && data.yearsOfExperience >= 0
      ? Math.round(data.yearsOfExperience * 10) / 10 // Round to 1 decimal
      : undefined,
    experienceSummary: data.experienceSummary?.trim() || undefined,
    skills: Array.isArray(data.skills)
      ? data.skills.filter(s => s && s.trim()).map(s => s.trim())
      : [],
    primarySkills: Array.isArray(data.primarySkills)
      ? data.primarySkills.filter(s => s && s.trim()).map(s => s.trim()).slice(0, 5)
      : [],
    degree: data.degree?.trim() || undefined,
    school: data.school?.trim() || undefined,
    graduationYear: typeof data.graduationYear === 'number'
      && data.graduationYear > 1950
      && data.graduationYear <= new Date().getFullYear() + 10
      ? data.graduationYear
      : undefined,
    desiredRoles: Array.isArray(data.desiredRoles)
      ? data.desiredRoles.filter(r => r && r.trim()).map(r => r.trim())
      : [],
    linkedinUrl: data.linkedinUrl?.trim() || undefined,
    githubUrl: data.githubUrl?.trim() || undefined,
    portfolioUrl: data.portfolioUrl?.trim() || undefined,
    personalWebsite: data.personalWebsite?.trim() || undefined
  };
}
