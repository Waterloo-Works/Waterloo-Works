import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GITHUB_TOKEN = process.env.GIST_KEY || '';

if (!GITHUB_TOKEN) {
  console.error('GIST_KEY environment variable is not set!');
}

/**
 * POST /api/upload-to-gist
 *
 * Uploads video chunks to GitHub Gist using git operations
 * Handles files larger than 100MB by chunking them
 */
export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    // Validate GitHub token
    if (!GITHUB_TOKEN) {
      return NextResponse.json({
        error: 'GitHub token not configured. Please set GIST_KEY environment variable.'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const description = formData.get('description') as string || 'Video recording from waterloo.app';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(`Uploading ${files.length} file(s) to GitHub Gist...`);

    // Create temporary directory
    const tempId = randomBytes(16).toString('hex');
    tempDir = join(tmpdir(), `gist-upload-${tempId}`);
    await mkdir(tempDir, { recursive: true });

    // Write all files to temp directory
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = join(tempDir, file.name);
      await writeFile(filePath, buffer);
      console.log(`Wrote ${file.name}: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
    }

    // First, create an empty gist via GitHub API to get the gist ID
    const createGistResponse = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        public: false, // Secret gist
        files: {
          'README.md': {
            content: `# ${description}\n\n${files.length > 1 ? `This video was split into ${files.length} parts due to size constraints.` : ''}\n\nFiles:\n${files.map((f, i) => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')}`
          }
        }
      })
    });

    if (!createGistResponse.ok) {
      const error = await createGistResponse.text();
      console.error('Failed to create gist:', error);
      return NextResponse.json({ error: 'Failed to create gist' }, { status: 500 });
    }

    const gistData = await createGistResponse.json();
    const gistId = gistData.id;
    const gistUrl = gistData.html_url;

    console.log(`Created gist: ${gistUrl}`);

    // Now use git to add the large video files
    try {
      // Configure git with credentials
      await execAsync(`git config --global credential.helper store`, { cwd: tempDir });

      // Clone the gist
      const gistCloneUrl = `https://${GITHUB_TOKEN}@gist.github.com/${gistId}.git`;
      console.log('Cloning gist...');
      await execAsync(`git clone ${gistCloneUrl} repo`, { cwd: tempDir });

      const repoDir = join(tempDir, 'repo');

      // Configure git user and increase buffer size for large files
      await execAsync('git config user.email "noreply@waterloo.app"', { cwd: repoDir });
      await execAsync('git config user.name "Waterloo App"', { cwd: repoDir });
      await execAsync('git config http.postBuffer 524288000', { cwd: repoDir }); // 500MB buffer

      // Push each file one at a time to avoid large payloads
      // This prevents SSL errors when uploading large total file sizes
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing chunk ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        // Copy this file to repo
        const sourcePath = join(tempDir, file.name);
        const destPath = join(repoDir, file.name);
        await execAsync(`cp "${sourcePath}" "${destPath}"`);

        // Add, commit, and push this chunk individually
        await execAsync('git add .', { cwd: repoDir });
        await execAsync(`git commit -m "Add chunk ${i + 1}/${files.length}: ${file.name}"`, { cwd: repoDir });

        console.log(`Pushing chunk ${i + 1}/${files.length} to gist...`);
        await execAsync('git push origin HEAD:main', { cwd: repoDir });
        console.log(`✓ Chunk ${i + 1}/${files.length} uploaded successfully`);

        // Delay between pushes to avoid rate limiting and connection issues
        if (i < files.length - 1) {
          console.log('Waiting 5 seconds before next chunk...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      console.log('Successfully uploaded all chunks to gist!');

      // Get the updated gist data to return file URLs
      const gistDataResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
        }
      });

      const updatedGistData = await gistDataResponse.json();

      return NextResponse.json({
        success: true,
        gistUrl,
        gistId,
        files: Object.keys(updatedGistData.files).map(filename => ({
          name: filename,
          url: updatedGistData.files[filename].raw_url,
          size: updatedGistData.files[filename].size,
        }))
      });

    } catch (gitError) {
      console.error('Git operation failed:', gitError);
      const errorMessage = gitError instanceof Error ? gitError.message : 'Unknown error';
      return NextResponse.json({
        error: 'Failed to upload files via git',
        details: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload to gist failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to upload to gist',
      details: errorMessage
    }, { status: 500 });
  } finally {
    // Clean up temp directory
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
        console.log('Cleaned up temp directory');
      } catch (cleanupError) {
        console.error('Failed to clean up temp directory:', cleanupError);
      }
    }
  }
}
