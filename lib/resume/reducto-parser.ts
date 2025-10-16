/**
 * Reducto Resume Parser
 * Extracts text from resume PDFs using Reducto pipeline
 */

import Reducto, { toFile } from 'reductoai';

const REDUCTO_API_KEY = process.env.REDUCTO_API_KEY!;
const REDUCTO_PIPELINE_ID = process.env.REDUCTO_PIPELINE_ID!;

interface ReductoChunk {
  content: string;
  embed: string;
  enriched: string | null;
  enrichment_success: boolean;
  blocks: Array<{
    type: string;
    bbox: Record<string, unknown>;
    content: string;
    image_url: string | null;
    confidence: string;
    granular_confidence: Record<string, unknown>;
  }>;
}

export interface ReductoParseResult {
  text: string;
  chunks: ReductoChunk[];
  duration: number;
  success: boolean;
}

/**
 * Parse resume PDF using Reducto pipeline
 * @param fileBuffer - Resume file as Buffer
 * @param fileName - Original filename
 */
export async function parseResumeWithReducto(
  fileBuffer: Buffer,
  fileName: string
): Promise<ReductoParseResult> {
  try {
    const client = new Reducto({
      apiKey: REDUCTO_API_KEY
    });

    console.log('🔄 Uploading file and running pipeline...');

    // Step 1: Upload file to Reducto
    const file = await toFile(fileBuffer, fileName);
    const upload = await client.upload({ file });

    console.log('✅ File uploaded:', upload.file_id);

    // Step 2: Run pipeline using the input from upload
    // Use presigned_url if available, otherwise use file_id directly (already has reducto:// prefix)
    const inputUrl = upload.presigned_url || upload.file_id;
    console.log('📄 Running pipeline with input:', inputUrl);

    const result = await client.pipeline.run({
      input: inputUrl,  // Pipeline expects "input" parameter (not document_url)
      pipeline_id: REDUCTO_PIPELINE_ID
    });

    console.log('✅ Reducto pipeline completed');

    // Extract text from chunks - pipeline result is nested under result.parse.result.chunks
    const parseResult = result.result?.parse?.result as { chunks?: ReductoChunk[] } | undefined;
    const chunks = parseResult?.chunks || [];
    const text = chunks
      .map((chunk) => chunk.content)
      .join('\n\n') || '';

    const duration = (result.result?.parse?.duration as number | undefined) || 0;

    console.log(`📝 Extracted ${text.length} characters from ${chunks.length} chunks`);
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);

    return {
      text,
      chunks,
      duration,
      success: true
    };
  } catch (error) {
    console.error('Reducto parsing error:', error);
    throw new Error(
      `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse resume from Supabase Storage URL
 * Downloads the file and parses it with Reducto
 */
export async function parseResumeFromUrl(url: string): Promise<ReductoParseResult> {
  try {
    // Download file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download resume: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract filename from URL or use default
    const fileName = url.split('/').pop()?.split('?')[0] || 'resume.pdf';

    return await parseResumeWithReducto(buffer, fileName);
  } catch (error) {
    console.error('Error parsing resume from URL:', error);
    throw error;
  }
}
