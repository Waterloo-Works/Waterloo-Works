/**
 * Video Chunking Utilities
 *
 * Chunks large video files into smaller pieces for GitHub Gist upload
 * GitHub Gist limit: 100MB per file, but git push over HTTPS has issues with large files
 * Using 7MB chunks - empirically determined max size that works reliably
 */

const CHUNK_SIZE = 7 * 1024 * 1024; // 7MB in bytes

export interface VideoChunk {
  data: Blob;
  index: number;
  totalChunks: number;
  filename: string;
}

/**
 * Chunks a video blob into smaller pieces
 * @param videoBlob - The video blob to chunk
 * @param baseFilename - Base filename (e.g., 'recording')
 * @returns Array of video chunks
 */
export async function chunkVideoBlob(
  videoBlob: Blob,
  baseFilename: string = 'video'
): Promise<VideoChunk[]> {
  const fileSize = videoBlob.size;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  console.log(`Chunking ${(fileSize / 1024 / 1024).toFixed(2)}MB video into ${totalChunks} chunks`);

  const chunks: VideoChunk[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const chunkBlob = videoBlob.slice(start, end, videoBlob.type);

    // Extract extension and clean codec info (e.g., "webm;codecs=vp8,opus" -> "webm")
    const extension = (videoBlob.type.split('/')[1] || 'webm').split(';')[0];
    const filename = totalChunks === 1
      ? `${baseFilename}.${extension}`
      : `${baseFilename}-part${i + 1}of${totalChunks}.${extension}`;

    chunks.push({
      data: chunkBlob,
      index: i,
      totalChunks,
      filename,
    });

    console.log(`Chunk ${i + 1}/${totalChunks}: ${filename} - ${(chunkBlob.size / 1024 / 1024).toFixed(2)}MB`);
  }

  return chunks;
}

/**
 * Converts a blob to base64 string
 * @param blob - The blob to convert
 * @returns Base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix to get pure base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a blob to ArrayBuffer
 * @param blob - The blob to convert
 * @returns ArrayBuffer
 */
export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
