/**
 * Video URL Parser
 *
 * Utilities for parsing and working with video URLs stored in gist format
 * Format: "gist_url|video_url1,video_url2,video_url3"
 */

export interface ParsedVideoUrl {
  gistUrl: string;
  videoUrls: string[];
  isChunked: boolean;
  firstVideoUrl: string;
}

/**
 * Parses a video URL string into its components
 * @param urlString - The URL string in format "gist_url|video_urls"
 * @returns Parsed video URL data
 */
export function parseVideoUrl(urlString: string): ParsedVideoUrl | null {
  if (!urlString) return null;

  // Check if it's in our gist format
  if (urlString.includes('|')) {
    const [gistUrl, videoUrlsStr] = urlString.split('|');
    const videoUrls = videoUrlsStr.split(',').filter(Boolean);

    return {
      gistUrl: gistUrl.trim(),
      videoUrls,
      isChunked: videoUrls.length > 1,
      firstVideoUrl: videoUrls[0],
    };
  }

  // Legacy format or external URL (Loom, YouTube, etc.)
  return {
    gistUrl: urlString,
    videoUrls: [urlString],
    isChunked: false,
    firstVideoUrl: urlString,
  };
}

/**
 * Checks if a URL is a GitHub Gist URL
 * @param url - The URL to check
 * @returns True if it's a gist URL
 */
export function isGistUrl(url: string): boolean {
  return url.includes('gist.github.com') || url.includes('gist.githubusercontent.com');
}

/**
 * Gets the raw video URL from a gist URL
 * @param gistUrl - The gist URL
 * @returns Raw video URL or null
 */
export function getRawVideoUrl(urlString: string): string | null {
  const parsed = parseVideoUrl(urlString);
  return parsed?.firstVideoUrl || null;
}

/**
 * Checks if a URL is a direct video file
 * @param url - The URL to check
 * @returns True if it's a direct video URL
 */
export function isDirectVideoUrl(url: string): boolean {
  return url.match(/\.(mp4|webm|ogg|mov|avi)$/i) !== null;
}

/**
 * Gets all video chunk URLs from a parsed URL
 * @param urlString - The URL string
 * @returns Array of video URLs
 */
export function getAllVideoUrls(urlString: string): string[] {
  const parsed = parseVideoUrl(urlString);
  return parsed?.videoUrls || [];
}
