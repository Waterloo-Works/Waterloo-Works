'use client';

import { useEffect, useState } from 'react';
import { parseVoiceNoteUrl, type ParsedVoiceNote } from '@/lib/voice-notes/parser';
import posthog from 'posthog-js';

interface VoiceNotePlayerProps {
  url: string;
  authorName?: string;
  context: 'employer_intro' | 'candidate_vouch';
  jobId?: string;
}

export function VoiceNotePlayer({ url, authorName, context, jobId }: VoiceNotePlayerProps) {
  const [parsed, setParsed] = useState<ParsedVoiceNote | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const result = parseVoiceNoteUrl(url);
    setParsed(result);
  }, [url]);

  const handlePlay = () => {
    if (!hasPlayed) {
      posthog.capture('voice_note_played', {
        platform: parsed?.platform,
        context,
        job_id: jobId,
        author_name: authorName,
      });
      setHasPlayed(true);
    }
  };

  if (!parsed || !parsed.isValid) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      {authorName && (
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm">
            {authorName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{authorName}</p>
            <p className="text-sm text-zinc-600">
              {context === 'employer_intro' ? 'Hiring Manager' : 'Vouched'}
            </p>
          </div>
        </div>
      )}

      {/* Loom embed */}
      {parsed.platform === 'loom' && (
        <div className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={parsed.embedUrl}
            frameBorder="0"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            onPlay={handlePlay}
          />
        </div>
      )}

      {/* SoundCloud embed */}
      {parsed.platform === 'soundcloud' && (
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          src={parsed.embedUrl}
          className="rounded-lg"
          onPlay={handlePlay}
        />
      )}

      {/* Google Drive embed */}
      {parsed.platform === 'google-drive' && (
        <iframe
          src={parsed.embedUrl}
          width="100%"
          height="200"
          frameBorder="0"
          className="rounded-lg"
          onPlay={handlePlay}
        />
      )}

      {/* Direct audio / Dropbox */}
      {(parsed.platform === 'direct-audio' || parsed.platform === 'dropbox' || parsed.platform === 'cloudapp') && (
        <audio
          src={parsed.embedUrl}
          controls
          className="w-full"
          onPlay={handlePlay}
          style={{ height: '54px' }}
        />
      )}

      {/* GitHub Gist video */}
      {parsed.platform === 'gist' && (
        <div>
          <video
            src={parsed.embedUrl}
            controls
            className="w-full rounded-lg"
            onPlay={handlePlay}
          />
          {parsed.videoUrls && parsed.videoUrls.length > 1 && (
            <p className="text-xs text-zinc-500 mt-2">
              This video has {parsed.videoUrls.length} parts. Playing part 1.
            </p>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
        <span className="capitalize">{parsed.platform === 'gist' ? 'GitHub Gist' : parsed.platform.replace('-', ' ')}</span>
        <span>•</span>
        <a
          href={parsed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-700 underline"
        >
          View original
        </a>
      </div>
    </div>
  );
}
