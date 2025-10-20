'use client';

import { useEffect, useRef, useState } from 'react';
import posthog from 'posthog-js';
import { chunkVideoBlob } from '@/lib/video-chunking';
import type { RecordRTCPromisesHandler } from 'recordrtc';

/**
 * VideoRecorder Component
 *
 * Custom video recorder using RecordRTC (pure JavaScript/WebRTC)
 * Records camera + microphone with no React dependencies
 * Uploads to GitHub Gist with automatic chunking for large files
 */

interface VideoRecorderProps {
  onVideoRecorded: (url: string) => void;
  currentVideoUrl?: string;
}

interface GistFile {
  name: string;
  url: string;
  size: number;
}

type RecordingMode = 'camera' | 'screen' | 'screen-camera';

export function VideoRecorder({ onVideoRecorded, currentVideoUrl }: VideoRecorderProps) {
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(currentVideoUrl || '');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<RecordRTCPromisesHandler | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    setIsCameraReady(false);
  };

  // Initialize media stream based on recording mode
  const initializeMedia = async () => {
    try {
      setError(null);
      let stream: MediaStream;

      if (recordingMode === 'camera') {
        // Camera only
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }
        });
      } else if (recordingMode === 'screen') {
        // Screen only with system audio
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true, // System audio
        });

        // Add microphone audio
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }
        });

        // Combine screen video + system audio + microphone audio
        const audioTracks = [
          ...screenStream.getAudioTracks(),
          ...audioStream.getAudioTracks()
        ];

        stream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...audioTracks
        ]);
      } else {
        // Screen + Camera (picture-in-picture)
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true,
        });

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }
        });

        // For now, just use screen stream (PiP requires canvas mixing)
        // TODO: Implement canvas-based PiP if needed
        const audioTracks = [
          ...screenStream.getAudioTracks(),
          ...cameraStream.getAudioTracks()
        ];

        stream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...audioTracks
        ]);
      }

      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true; // Prevent echo
      }

      setIsCameraReady(true);

      posthog.capture('video_recorder_initialized', {
        context: 'job_voice_note',
        mode: recordingMode,
      });
    } catch (err) {
      console.error('Media initialization error:', err);

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permission denied. Please allow access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found.');
        } else {
          setError(`Failed to access ${recordingMode === 'camera' ? 'camera/microphone' : 'screen'}.`);
        }
      } else {
        setError(`Failed to access ${recordingMode === 'camera' ? 'camera/microphone' : 'screen'}.`);
      }

      posthog.capture('video_recorder_error', {
        context: 'job_voice_note',
        mode: recordingMode,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!streamRef.current) {
      await initializeMedia();
      if (!streamRef.current) return;
    }

    try {
      // Dynamic import to avoid SSR issues
      const { RecordRTCPromisesHandler } = await import('recordrtc');

      recorderRef.current = new RecordRTCPromisesHandler(streamRef.current, {
        type: 'video',
        mimeType: 'video/webm',
        bitsPerSecond: 128000,
      });

      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      posthog.capture('video_recording_started', {
        context: 'job_voice_note',
      });
    } catch (err) {
      console.error('Recording start error:', err);
      setError('Failed to start recording.');
    }
  };

  // Upload video to GitHub Gist
  const uploadToGist = async (blob: Blob): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadProgress('Preparing video...');

      // Chunk the video
      const chunks = await chunkVideoBlob(blob, `recording-${Date.now()}`);
      const totalSize = (blob.size / 1024 / 1024).toFixed(2);

      posthog.capture('video_upload_started', {
        context: 'job_voice_note',
        size_mb: parseFloat(totalSize),
        chunks: chunks.length,
      });

      setUploadProgress(`Uploading ${totalSize}MB (${chunks.length} ${chunks.length === 1 ? 'file' : 'parts'})...`);

      // Create FormData with all chunks
      const formData = new FormData();
      for (const chunk of chunks) {
        formData.append('files', chunk.data, chunk.filename);
      }
      formData.append('description', `Video recording from waterloo.app - ${new Date().toISOString()}`);

      // Upload to gist
      const response = await fetch('/api/upload-to-gist', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      posthog.capture('video_upload_completed', {
        context: 'job_voice_note',
        gist_url: result.gistUrl,
        size_mb: parseFloat(totalSize),
        chunks: chunks.length,
      });

      setUploadProgress('Upload complete!');
      setTimeout(() => setUploadProgress(''), 2000);

      // Return the gist data with video file URLs
      // Format: gist_url|video_urls (comma-separated if multiple chunks)
      const videoExtensions = ['.webm', '.mp4', '.mov', '.avi', '.mkv', '.m4v', '.ogg'];
      const videoUrls = (result.files as GistFile[])
        .filter((f) => {
          const fileName = f.name.toLowerCase();
          // Check if filename contains a video extension (handles both clean and codec-suffixed names)
          return videoExtensions.some(ext => fileName.includes(ext)) && f.name !== 'README.md';
        })
        .map((f) => f.url)
        .join(',');

      // Return format: "gist_url|video_urls"
      const finalUrl = `${result.gistUrl}|${videoUrls}`;
      console.log('📹 Video uploaded! Full URL:', finalUrl);
      console.log('  - Gist page:', result.gistUrl);
      console.log('  - Video URLs:', videoUrls);
      console.log('  - All files:', (result.files as GistFile[]).map((f) => f.name));
      return finalUrl;

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Upload failed: ${errorMessage}`);

      posthog.capture('video_upload_failed', {
        context: 'job_voice_note',
        error: errorMessage,
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      await recorderRef.current.stopRecording();

      const blob = await recorderRef.current.getBlob();
      const tempUrl = URL.createObjectURL(blob);

      setRecordedBlob(blob); // Save blob for download
      setRecordedVideoUrl(tempUrl); // Temporary preview URL
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Clean up recorder
      await recorderRef.current.destroy();
      recorderRef.current = null;

      // Stop camera
      cleanup();

      // Show recorded video
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = tempUrl;
        videoPreviewRef.current.srcObject = null;
        videoPreviewRef.current.muted = false;
        videoPreviewRef.current.controls = true;
      }

      posthog.capture('video_recording_completed', {
        context: 'job_voice_note',
        duration_seconds: recordingTime,
        size_mb: (blob.size / 1024 / 1024).toFixed(2),
      });

      // Upload to GitHub Gist
      const gistUrl = await uploadToGist(blob);

      if (gistUrl) {
        // Pass permanent gist URL to parent
        console.log('✅ Calling onVideoRecorded with:', gistUrl);
        onVideoRecorded(gistUrl);
      } else {
        // Fallback to temp URL if upload fails
        console.warn('⚠️ Upload failed, using temp URL:', tempUrl);
        setError('Upload failed. You can still download the video locally.');
        onVideoRecorded(tempUrl);
      }

    } catch (err) {
      console.error('Recording stop error:', err);
      setError('Failed to stop recording.');
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync with currentVideoUrl prop changes
  useEffect(() => {
    if (currentVideoUrl && currentVideoUrl !== recordedVideoUrl) {
      setRecordedVideoUrl(currentVideoUrl);
    }
  }, [currentVideoUrl, recordedVideoUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (recorderRef.current) {
        recorderRef.current.destroy().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Recording Mode Selector */}
      {!isRecording && !recordedVideoUrl && (
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setRecordingMode('camera');
              cleanup();
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              recordingMode === 'camera'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            📹 Camera
          </button>
          <button
            type="button"
            onClick={() => {
              setRecordingMode('screen');
              cleanup();
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              recordingMode === 'screen'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🖥️ Screen
          </button>
          <button
            type="button"
            onClick={() => {
              setRecordingMode('screen-camera');
              cleanup();
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              recordingMode === 'screen-camera'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🖥️📹 Both
          </button>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          className="w-full aspect-video object-cover"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            REC {formatTime(recordingTime)}
          </div>
        )}

        {/* No video message */}
        {!isCameraReady && !recordedVideoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center text-zinc-400">
              <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Click &quot;Start Recording&quot; to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !recordedVideoUrl && (
          <button
            type="button"
            onClick={isCameraReady ? startRecording : initializeMedia}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            {isCameraReady ? 'Start Recording' : 'Enable Camera'}
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Recording
          </button>
        )}

        {recordedVideoUrl && (
          <>
            <button
              type="button"
              onClick={() => {
                setRecordedVideoUrl('');
                setRecordingTime(0);
                initializeMedia();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Record Again
            </button>

            <a
              href={recordedVideoUrl}
              download={`recording-${Date.now()}.webm`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </>
        )}
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Success message */}
      {recordedVideoUrl && !isUploading && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Video recorded successfully! Duration: {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Help text */}
      {!isRecording && !recordedVideoUrl && !isUploading && (
        <p className="text-xs text-zinc-500">
          Record a video message about this job opportunity. Videos are automatically uploaded to GitHub Gist and chunked into 80MB parts if needed.
        </p>
      )}
    </div>
  );
}
