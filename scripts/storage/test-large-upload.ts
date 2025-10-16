import { readFile } from 'fs/promises';
import { chunkVideoBlob } from '../../lib/video-chunking';

const CHUNK_SIZE = 80 * 1024 * 1024; // 80MB

async function uploadLargeFile(filePath: string) {
  console.log(`📹 Reading file: ${filePath}`);

  // Read the file
  const buffer = await readFile(filePath);
  console.log(`📊 File size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);

  // Convert buffer to Blob - need to create new Uint8Array to ensure proper ArrayBuffer type
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'video/quicktime' }); // .mov file

  // Chunk the file
  console.log('✂️  Chunking file...');
  const chunks = await chunkVideoBlob(blob, 'test-video');
  console.log(`✅ Created ${chunks.length} chunk(s)`);

  // Create FormData
  const formData = new FormData();
  for (const chunk of chunks) {
    const file = new File([chunk.data], chunk.filename, { type: chunk.data.type });
    formData.append('files', file);
    console.log(`   - ${chunk.filename}: ${(chunk.data.size / 1024 / 1024).toFixed(2)}MB`);
  }
  formData.append('description', 'Test 107MB .mov file upload with chunking');

  // Upload
  console.log('⬆️  Uploading to GitHub Gist...');
  const response = await fetch('http://localhost:3001/api/upload-to-gist', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  interface GistFile {
    name: string;
    url: string;
  }

  interface GistResult {
    success?: boolean;
    gistUrl?: string;
    files?: GistFile[];
    error?: string;
    details?: string;
  }

  const typedResult = result as GistResult;

  if (typedResult.success) {
    console.log('✅ Upload successful!');
    console.log(`🔗 Gist URL: ${typedResult.gistUrl}`);
    console.log('📹 Video URLs:');
    const videoUrls = (typedResult.files || [])
      .filter((f) => f.name.includes('.mov'))
      .map((f) => f.url);
    videoUrls.forEach((url: string, i: number) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    console.log(`\n📋 Full URL format: ${typedResult.gistUrl}|${videoUrls.join(',')}`);
  } else {
    console.error('❌ Upload failed:', typedResult.error);
    if (typedResult.details) {
      console.error('Details:', typedResult.details);
    }
  }
}

// Run the test
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: ts-node scripts/test-large-upload.ts <file-path>');
  process.exit(1);
}

uploadLargeFile(filePath).catch(console.error);
