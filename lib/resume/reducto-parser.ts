/**
 * Reducto Resume Parser
 * Extracts text from resume PDFs using Reducto pipeline
 */

import Reducto from 'reductoai';

const REDUCTO_PIPELINE_ID = process.env.REDUCTO_PIPELINE_ID!;

export interface ReductoParseResult {
  text: string;
  chunks: any[];
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
    const client = new Reducto();

    // Upload file to Reducto (returns Upload object with file_id and presigned_url)
    const upload = await client.upload({
      file: fileBuffer,
      extension: fileName.split('.').pop() || 'pdf'
    });

    console.log('Reducto upload successful:', upload.file_id);
    console.log('Presigned URL:', upload.presigned_url);

    // Run pipeline - use presigned_url if available, otherwise use Upload object
    const input = upload.presigned_url || upload;
    console.log('Using input for pipeline:', typeof input === 'string' ? input : 'Upload object');

    const result = await client.pipeline.run({
      input: input,
      pipeline_id: REDUCTO_PIPELINE_ID
    });

    console.log('Reducto pipeline completed in', result.duration, 'seconds');

    // Extract text from chunks
    const text = result.result?.chunks
      ?.map((chunk: any) => chunk.content)
      .join('\n\n') || '';

    return {
      text,
      chunks: result.result?.chunks || [],
      duration: result.duration,
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
