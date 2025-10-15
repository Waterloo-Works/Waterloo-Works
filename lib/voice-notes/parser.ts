export type VoiceNotePlatform =
  | 'loom'
  | 'soundcloud'
  | 'google-drive'
  | 'dropbox'
  | 'cloudapp'
  | 'direct-audio'
  | 'gist';

export interface ParsedVoiceNote {
  url: string;
  platform: VoiceNotePlatform;
  embedUrl?: string;
  isValid: boolean;
  videoUrls?: string[]; // For gist with multiple chunks
}

const PLATFORM_PATTERNS = {
  loom: /(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)/,
  soundcloud: /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/,
  googleDrive: /(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  dropbox: /(?:https?:\/\/)?(?:www\.)?dropbox\.com\/s\/([a-zA-Z0-9]+)/,
  cloudapp: /(?:https?:\/\/)?(?:www\.)?(?:cl\.ly|cloudapp)\/([a-zA-Z0-9]+)/,
  directAudio: /^https?:\/\/.+\.(mp3|wav|m4a|ogg|webm)(\?.*)?$/i,
};

export function parseVoiceNoteUrl(url: string): ParsedVoiceNote {
  if (!url) {
    return { url: '', platform: 'direct-audio', isValid: false };
  }

  const trimmedUrl = url.trim();

  // GitHub Gist format: gist_url|video_url1,video_url2
  if (trimmedUrl.includes('|') && trimmedUrl.includes('gist.github.com')) {
    const [gistUrl, videoUrlsStr] = trimmedUrl.split('|');
    const videoUrls = videoUrlsStr.split(',').map(u => u.trim()).filter(Boolean);

    if (videoUrls.length > 0) {
      return {
        url: gistUrl.trim(), // Use gist page URL for "View original"
        platform: 'gist',
        embedUrl: videoUrls[0], // First video chunk for playback
        videoUrls, // All video chunks
        isValid: true,
      };
    }
  }

  // Loom
  const loomMatch = trimmedUrl.match(PLATFORM_PATTERNS.loom);
  if (loomMatch) {
    return {
      url: trimmedUrl,
      platform: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      isValid: true,
    };
  }

  // SoundCloud
  if (PLATFORM_PATTERNS.soundcloud.test(trimmedUrl)) {
    return {
      url: trimmedUrl,
      platform: 'soundcloud',
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(trimmedUrl)}&auto_play=false`,
      isValid: true,
    };
  }

  // Google Drive
  const driveMatch = trimmedUrl.match(PLATFORM_PATTERNS.googleDrive);
  if (driveMatch) {
    return {
      url: trimmedUrl,
      platform: 'google-drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      isValid: true,
    };
  }

  // Dropbox
  const dropboxMatch = trimmedUrl.match(PLATFORM_PATTERNS.dropbox);
  if (dropboxMatch) {
    // Convert to raw audio link
    const rawUrl = trimmedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    return {
      url: trimmedUrl,
      platform: 'dropbox',
      embedUrl: rawUrl,
      isValid: true,
    };
  }

  // Direct audio URL
  if (PLATFORM_PATTERNS.directAudio.test(trimmedUrl)) {
    return {
      url: trimmedUrl,
      platform: 'direct-audio',
      embedUrl: trimmedUrl,
      isValid: true,
    };
  }

  return { url: trimmedUrl, platform: 'direct-audio', isValid: false };
}

/**
 * Parse voice note URLs from text (e.g., job notes field)
 */
export function extractVoiceNoteUrls(text: string): ParsedVoiceNote[] {
  if (!text) return [];

  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];

  return urls
    .map(url => parseVoiceNoteUrl(url))
    .filter(parsed => parsed.isValid);
}
