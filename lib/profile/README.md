# Profile System with Ollama Integration

Complete implementation of user profiles with resume upload, AI-powered parsing, and embedding-based job matching.

## Quick Start

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Or download from: https://ollama.com/download
```

### 2. Pull Required Models

```bash
# For resume parsing (choose one)
ollama pull llama3.2        # Recommended: Fast and accurate
ollama pull llama2          # Alternative
ollama pull mistral         # Alternative

# For embeddings (required for matching)
ollama pull nomic-embed-text  # Recommended: Best for semantic search
# Alternative: ollama pull mxbai-embed-large
```

### 3. Set Environment Variables

Add to `.env.local`:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set Up Supabase Storage

Follow instructions in `lib/profile/SUPABASE_STORAGE_SETUP.md` to:
1. Create `resumes` bucket
2. Set up RLS policies
3. Test upload access

### 5. Run Database Migration

```bash
npx prisma migrate dev --name add_user_profile_and_matching
npx prisma generate
```

### 6. Verify Ollama is Running

```bash
# Check Ollama status
curl http://localhost:11434

# List installed models
ollama list

# Test text generation
ollama run llama3.2 "Hello!"
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Uploads Resume                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│         Supabase Storage (resumes bucket)                │
│         Path: resumes/{userId}/{timestamp}-{filename}     │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│            Ollama: Resume Parsing (llama3.2)             │
│       Extract: name, skills, experience, education       │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│        Update UserProfile in PostgreSQL/Prisma           │
│     Store parsed data + calculate completion score       │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│     Ollama: Generate Embeddings (nomic-embed-text)       │
│       profileEmbedding = vector representation           │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│              Match with Job Embeddings                   │
│     Cosine similarity → Find best job matches            │
│       Store results in ProfileMatch table                │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### Profile Management

#### `GET /api/profile`
Get current user's profile

**Response:**
```json
{
  "id": "...",
  "userId": "...",
  "headline": "Software Engineer | React & Node.js",
  "location": "Waterloo, ON",
  "skills": ["React", "Node.js", "TypeScript"],
  "completionScore": 85,
  "isComplete": true,
  ...
}
```

#### `POST /api/profile`
Create or update profile

**Request Body:**
```json
{
  "headline": "Software Engineer",
  "location": "Waterloo, ON",
  "skills": ["React", "Node.js"],
  "desiredRoles": ["Software Engineer", "Full Stack Developer"],
  ...
}
```

#### `PATCH /api/profile`
Partially update profile (merge with existing data)

#### `DELETE /api/profile`
Delete user's profile

### Resume Upload

#### `POST /api/profile/resume`
Upload and optionally parse resume

**Form Data:**
- `resume`: File (PDF, DOC, DOCX)
- `parse`: "true" | "false" (default: false)
- `autoFill`: "true" | "false" (default: false)

**Response:**
```json
{
  "success": true,
  "profile": { ... },
  "parsedData": {
    "fullName": "John Doe",
    "skills": ["React", "Python"],
    "currentRole": "Software Engineer",
    ...
  },
  "uploadResult": {
    "url": "https://...",
    "path": "resumes/user-123/1699999999-resume.pdf",
    "fileName": "resume.pdf"
  }
}
```

#### `DELETE /api/profile/resume`
Delete user's resume

## Core Modules

### 1. Resume Upload (`resume-upload.ts`)

```typescript
import { uploadResume, deleteResume } from "@/lib/profile/resume-upload";

// Upload resume
const result = await uploadResume(userId, file);
// Returns: { url, path, fileName }

// Delete resume
await deleteResume(path);
```

### 2. Ollama Client (`ollama-client.ts`)

```typescript
import { ollama } from "@/lib/profile/ollama-client";

// Generate text
const response = await ollama.generate({
  model: "llama3.2",
  prompt: "Extract data from resume...",
  format: "json"
});

// Generate embeddings
const embedding = await ollama.generateEmbedding(
  "nomic-embed-text",
  "Software engineer with 5 years experience"
);
```

### 3. Resume Parser (`resume-parser.ts`)

```typescript
import { parseResume } from "@/lib/profile/resume-parser";

// Parse resume file
const parsedData = await parseResume(file, {
  model: "llama3.2" // Optional, defaults to llama3.2
});

// Returns structured data: name, skills, experience, etc.
```

### 4. Embeddings (`embeddings/generate.ts`)

```typescript
import {
  generateProfileEmbedding,
  generateJobEmbedding,
  cosineSimilarity
} from "@/lib/embeddings/generate";

// Generate profile embedding
const { embedding, version } = await generateProfileEmbedding(profile);

// Generate job embedding
const { embedding, version } = await generateJobEmbedding(job);

// Calculate similarity
const similarity = cosineSimilarity(profileEmbedding, jobEmbedding);
// Returns: 0.0 to 1.0 (higher = more similar)
```

## Database Schema

### UserProfile

Main profile table with all user information and preferences:

```prisma
model UserProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique

  // Basic Info
  headline            String?
  location            String?
  openToRemote        Boolean   @default(true)

  // Resume
  resumeUrl           String?
  resumeFileName      String?
  resumeUploadedAt    DateTime?
  resumeParsedData    Json?

  // Experience
  currentRole         String?
  yearsOfExperience   Int?
  experienceSummary   String?   @db.Text

  // Skills (for matching)
  skills              String[]
  primarySkills       String[]

  // Education
  degree              String?
  school              String?
  graduationYear      Int?

  // Preferences
  desiredRoles        String[]
  desiredLocations    String[]
  employmentTypes     EmploymentType[]
  minSalary           Int?
  maxSalary           Int?

  // Embeddings (stored as JSON text)
  profileEmbedding    String?   @db.Text
  embeddingVersion    String?
  lastEmbeddedAt      DateTime?

  // Metadata
  completionScore     Int       @default(0)
  isComplete          Boolean   @default(false)
  isPublic            Boolean   @default(false)
  isSearchable        Boolean   @default(true)

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

### ProfileMatch

Stores computed job matches with scoring:

```prisma
model ProfileMatch {
  id                  String      @id @default(cuid())
  userProfileId       String
  jobId               String

  // Scores (0-100)
  overallScore        Float
  skillsScore         Float
  experienceScore     Float
  locationScore       Float
  salaryScore         Float

  // Match details
  matchedSkills       String[]
  missingSkills       String[]
  scoreBreakdown      Json
  matchReason         String?   @db.Text

  // User interaction
  isSeen              Boolean   @default(false)
  isDismissed         Boolean   @default(false)
  isInterested        Boolean   @default(false)

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@unique([userProfileId, jobId])
}
```

## Profile Completeness

Profile completeness is calculated automatically based on filled fields:

```typescript
Weights:
- Resume uploaded: 15 points
- Headline: 8 points
- Current role: 10 points
- Experience summary: 12 points
- Skills: 15 points
- Primary skills: 10 points
- Education: 13 points
- Location: 3 points
- Links (LinkedIn, GitHub): 4 points
- Other fields: 10 points

Total: 100 points
```

Profile is considered "complete" when score >= 80.

## Matching Algorithm

### 1. Generate Embeddings

```typescript
// Profile text combines:
- Headline
- Current role
- Skills (weighted heavily)
- Experience summary
- Desired roles
- Locations
```

### 2. Calculate Similarity

```typescript
const similarity = cosineSimilarity(profileEmbedding, jobEmbedding);
// Returns 0.0 to 1.0
```

### 3. Detailed Scoring

```typescript
overallScore = (
  vectorSimilarity * 0.40 +  // 40% semantic similarity
  skillsMatch * 0.30 +       // 30% exact skill matches
  experienceMatch * 0.15 +   // 15% experience level
  locationMatch * 0.10 +     // 10% location compatibility
  salaryMatch * 0.05         // 5% salary alignment
) * 100
```

## Usage Examples

### Frontend: Upload Resume with Auto-Fill

```typescript
async function handleResumeUpload(file: File) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('parse', 'true');
  formData.append('autoFill', 'true');

  const response = await fetch('/api/profile/resume', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (data.success) {
    console.log('Profile auto-filled:', data.profile);
    console.log('Parsed data:', data.parsedData);
  }
}
```

### Backend: Generate Matches

```typescript
import { generateProfileEmbedding } from "@/lib/embeddings/generate";
import { prisma } from "@/utils/prisma";

async function generateMatchesForUser(userId: string) {
  // Get user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId }
  });

  // Generate embedding if not exists
  if (!profile.profileEmbedding) {
    const { embedding, version } = await generateProfileEmbedding(profile);

    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        profileEmbedding: JSON.stringify(embedding),
        embeddingVersion: version,
        lastEmbeddedAt: new Date()
      }
    });
  }

  // Find similar jobs
  // (Implementation depends on vector search capability)
}
```

## Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434

# Start Ollama
ollama serve

# Check logs
tail -f ~/.ollama/logs/server.log
```

### Resume Parsing Fails

1. Ensure Ollama is running: `ollama list`
2. Check if model is downloaded: `ollama pull llama3.2`
3. Test model directly: `ollama run llama3.2 "Extract data from: [paste resume text]"`
4. Check API route logs for detailed error messages

### Embedding Generation Slow

- **Nomic Embed Text**: ~100-200 tokens/sec (fast)
- **Llama2 Embeddings**: ~50 tokens/sec (slower but good quality)
- **MxBai Embed**: ~150 tokens/sec (balanced)

For production, consider:
- Generating embeddings in background jobs
- Caching embeddings
- Using GPU acceleration for Ollama

### Storage Issues

1. Check Supabase bucket exists: `resumes`
2. Verify RLS policies are set up correctly
3. Check file size limits (default: 5MB)
4. Ensure signed URLs haven't expired (default: 1 year)

## Performance Considerations

### Resume Parsing
- **Time**: 3-10 seconds depending on resume length and model
- **Recommendation**: Show loading state, parse asynchronously

### Embedding Generation
- **Time**: 1-3 seconds per profile/job
- **Recommendation**: Generate in background after profile updates

### Matching
- **With Vector DB** (pgvector): Sub-second for thousands of jobs
- **In-Memory** (cosine similarity): Scales to ~10,000 comparisons
- **Recommendation**: Implement pgvector for production scale

## Next Steps

1. **Implement Matching UI**
   - Create `/profile/matches` page
   - Show match scores and breakdown
   - Allow save/dismiss actions

2. **Add Background Jobs**
   - Generate embeddings for new profiles
   - Regenerate matches daily
   - Clean up old signed URLs

3. **Enhance Parsing**
   - Support more resume formats
   - Extract more structured data
   - Improve parsing accuracy with better prompts

4. **Optimize Embeddings**
   - Implement pgvector for faster similarity search
   - Add caching layer
   - Batch embedding generation

5. **Add Analytics**
   - Track match quality (user feedback)
   - Monitor parsing accuracy
   - Measure profile completion rates

## Resources

- **Ollama Docs**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **Nomic Embed Text**: https://ollama.com/library/nomic-embed-text
- **Llama 3.2**: https://ollama.com/library/llama3.2
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Storage**: https://supabase.com/docs/guides/storage
