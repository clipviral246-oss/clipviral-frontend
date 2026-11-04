'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { 
  UploadCloud, 
  Film, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  HardDrive,
  FileVideo,
  Layers,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export interface UploadClip {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  status: 'ready' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  previewUrl?: string;
  file?: File;
  storageKey?: string;
}

export interface FileUploadZoneProps {
  onProceedToTimeline?: () => void;
}

export function FileUploadZone({ onProceedToTimeline }: FileUploadZoneProps = {}) {
  const { locale, dict } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clips, setClips] = useState<UploadClip[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format bytes into readable MB/GB
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Process incoming files from drag or input
  const handleFiles = useCallback((files: FileList | File[]) => {
    const validVideoTypes = [
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-matroska',
      'video/avi',
    ];

    const newClips: UploadClip[] = [];
    const maxFiles = 30;

    Array.from(files).forEach((file, index) => {
      if (
        file.type.startsWith('video/') ||
        validVideoTypes.includes(file.type) ||
        file.name.match(/\.(mp4|mov|webm|mkv)$/i)
      ) {
        if (clips.length + newClips.length < maxFiles) {
          const mockDuration = 12 + ((index * 7) % 45);
          newClips.push({
            id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${index}`,
            name: file.name,
            size: file.size,
            type: file.type || 'video/mp4',
            duration: mockDuration,
            status: 'ready',
            progress: 0,
            previewUrl: URL.createObjectURL(file),
            file,
          });
        }
      }
    });

    if (newClips.length > 0) {
      setClips((prev) => [...prev, ...newClips]);
      setUploadMessage(null);
      setErrorMessage(null);
    }
  }, [clips.length]);

  // Demo Benchmark Loader: generates 21 clips with mock blobs for batch testing
  const loadDemoBenchmarkClips = (count = 21) => {
    const titles = [
      'Hook_Reaction_01.mp4',
      'Main_Talking_Head_02.mp4',
      'B-Roll_Product_CloseUp.mp4',
      'Explainer_Screen_Capture.mp4',
      'Viral_Podcast_Cut_01.mov',
      'Interview_Answer_03.mp4',
      'Product_Unboxing_4k.mp4',
      'Fast_Paced_Jumpcut_Scene.mp4',
      'Street_Vlog_Action_Cam.webm',
      'TikTok_Trend_Dance_04.mp4',
      'AI_Avatar_German_Intro.mp4',
      'Subtitles_Speech_Sample.mp4',
      'B-Roll_City_Drone_4k.mov',
      'Customer_Testimonial_09.mp4',
      'Behind_The_Scenes_Candid.mp4',
      'Webinar_Highlight_Reel.mp4',
      'Keynote_Speech_Clip_12.mp4',
      'Call_To_Action_Ending.mp4',
      'Soundbite_Viral_Quote.mp4',
      'Product_Macro_Lighting.mp4',
      'Shorts_Vertical_916_Master.mp4',
    ];

    const generated: UploadClip[] = titles.slice(0, count).map((name, i) => {
      const sizeBytes = Math.floor((14 + (i * 8.5)) * 1024 * 1024);
      // Create a lightweight simulated blob representing the video file
      const mockBlob = new Blob([new Uint8Array(1024 * 32)], { type: 'video/mp4' });
      const file = new File([mockBlob], name, { type: 'video/mp4' });

      return {
        id: `bench_clip_${Date.now()}_${i}`,
        name,
        size: sizeBytes,
        type: 'video/mp4',
        duration: 15 + ((i * 9) % 55),
        status: 'ready',
        progress: 0,
        file,
      };
    });

    setClips(generated);
    setUploadMessage(null);
    setErrorMessage(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAll = () => {
    setClips([]);
    setUploadMessage(null);
    setErrorMessage(null);
  };

  /**
   * Upload single clip directly to Cloudinary using FormData and XHR for granular real-time progress
   */
  const uploadClipToCloudinary = (
    clip: UploadClip,
    signatureData: {
      signature: string;
      timestamp: number;
      api_key: string;
      cloud_name: string;
    }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          setClips((prev) =>
            prev.map((c) => (c.id === clip.id ? { ...c, progress: percent } : c))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            setClips((prev) =>
              prev.map((c) =>
                c.id === clip.id
                  ? {
                      ...c,
                      progress: 100,
                      status: 'completed',
                      storageKey: resp.secure_url || resp.public_id,
                    }
                  : c
              )
            );
          } catch {
            setClips((prev) =>
              prev.map((c) =>
                c.id === clip.id ? { ...c, progress: 100, status: 'completed' } : c
              )
            );
          }
          resolve();
        } else {
          setClips((prev) =>
            prev.map((c) => (c.id === clip.id ? { ...c, status: 'error' } : c))
          );
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setClips((prev) =>
          prev.map((c) => (c.id === clip.id ? { ...c, status: 'error' } : c))
        );
        reject(new Error(`Network error during Cloudinary upload of ${clip.name}`));
      };

      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        signatureData.cloud_name ||
        'lgxkjpat';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const formData = new FormData();
      const fileData = clip.file || new Blob(['mock video data'], { type: clip.type || 'video/mp4' });
      formData.append('file', fileData);
      formData.append('api_key', signatureData.api_key);
      formData.append('timestamp', String(signatureData.timestamp));
      formData.append('signature', signatureData.signature);

      xhr.open('POST', uploadUrl, true);
      xhr.send(formData);
    });
  };

  /**
   * Main Batch Upload Pipeline:
   * 1. Request Cloudinary upload signature, timestamp, and api_key from backend /api/upload
   * 2. Direct FormData POST upload of each raw video file to Cloudinary with real-time XHR progress
   * 3. Trigger BullMQ & Whisper background queue on Node.js Backend
   */
  const handleBatchUpload = async () => {
    if (clips.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);
    setUploadMessage(
      locale === 'de'
        ? `Hole Cloudinary Signatur für ${clips.length} Clips...`
        : `Fetching Cloudinary signature for ${clips.length} clips...`
    );

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

      // Step 1: Call Node.js Backend /api/upload to fetch Cloudinary signature, timestamp, and api_key
      const res = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: `proj_${Date.now()}`,
          clips: clips.map((c) => ({
            id: c.id,
            fileName: c.name,
            fileSize: c.size,
            fileType: c.type,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.signature) {
        throw new Error(data.error || 'Failed to fetch Cloudinary upload signature from backend');
      }

      const signatureData = {
        signature: data.signature,
        timestamp: data.timestamp,
        api_key: data.api_key || '886617579976247',
        cloud_name: data.cloud_name || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'lgxkjpat',
      };

      setUploadMessage(
        locale === 'de'
          ? `Lade ${clips.length} Clips direkt zu Cloudinary hoch...`
          : `Uploading ${clips.length} clips directly to Cloudinary...`
      );

      // Mark all as uploading
      setClips((prev) => prev.map((c) => ({ ...c, status: 'uploading', progress: 5 })));

      // Step 2: Upload clips in parallel batches with real-time XHR progress bar
      const concurrencyLimit = 5;
      const queue = [...clips];

      const worker = async () => {
        while (queue.length > 0) {
          const clip = queue.shift();
          if (!clip) break;
          await uploadClipToCloudinary(clip, signatureData);
        }
      };

      const workers = Array.from({ length: Math.min(concurrencyLimit, clips.length) }, () =>
        worker()
      );
      await Promise.all(workers);

      // Step 3: Trigger background AI job queue on Node.js Backend (BullMQ + Redis)
      await fetch(`${backendUrl}/api/video/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: clips.map((c) => c.id),
          options: {
            removeSilence: true,
            generateSubtitles: true,
            subtitleLanguage: locale,
          },
        }),
      });

      setUploadMessage(
        locale === 'de'
          ? `Alle ${clips.length} Clips erfolgreich über Cloudinary hochgeladen & in die Timeline geladen!`
          : `All ${clips.length} clips successfully uploaded via Cloudinary & queued for timeline!`
      );
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setErrorMessage(err.message || 'Error occurred during Cloudinary upload');
    } finally {
      setIsUploading(false);
    }
  };

  const totalBytes = clips.reduce((acc, c) => acc + c.size, 0);
  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-400" />
            {dict.upload.title}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{dict.upload.subtitle}</p>
        </div>

        {/* Demo Benchmark Loader for 20+ Clips */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadDemoBenchmarkClips(21)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-600/10 text-xs font-medium text-violet-300 hover:bg-violet-600/20 hover:border-violet-500/50 transition-all"
            title="Lade 21 Demo Clips für Batch-Cloudinary Benchmark"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            + 20+ Demo Clips (Cloudinary Test)
          </button>
          {clips.length > 0 && (
            <button
              onClick={clearAll}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {dict.upload.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/10 scale-[1.01]'
            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <UploadCloud className="h-8 w-8 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">{dict.upload.dropzoneTitle}</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">{dict.upload.dropzoneHint}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/80 px-4 py-2 text-xs font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors">
            <Film className="h-3.5 w-3.5 text-cyan-400" />
            {dict.upload.browseFiles}
          </div>
        </div>
      </div>

      {/* Feedback & Notifications */}
      {uploadMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
          <button
            onClick={() => onProceedToTimeline ? onProceedToTimeline() : router.push(`/${locale}/editor`)}
            className="flex items-center gap-1 font-semibold text-cyan-300 hover:underline shrink-0"
          >
            {dict.upload.openInTimeline}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clips List (Supporting 20+ Clips) */}
      {clips.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 backdrop-blur-sm">
          {/* Summary & Batch Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-xs font-bold text-cyan-400 border border-indigo-500/30">
                {clips.length}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {dict.upload.clipsCount} ({clips.length} / 30 Clips)
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-zinc-500" />
                    {formatFileSize(totalBytes)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    ca. {formatDuration(totalDuration)} {locale === 'de' ? 'Gesamtlänge' : 'total'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchUpload}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Cloudinary Uploading ({clips.filter((c) => c.status === 'completed').length}/{clips.length})...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    {dict.upload.uploadAll.replace('{count}', String(clips.length))}
                  </>
                )}
              </button>

              <button
                onClick={() => router.push(`/${locale}/editor`)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {dict.upload.openInTimeline}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Grid of Clips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {clips.map((clip, index) => {
              const isCompleted = clip.status === 'completed';
              const isCurrentUploading = clip.status === 'uploading';
              const isError = clip.status === 'error';

              return (
                <div
                  key={clip.id}
                  className="group relative flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-2.5 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                >
                  {/* Thumbnail / Index */}
                  <div className="relative flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
                    {clip.previewUrl ? (
                      <video
                        src={clip.previewUrl}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <FileVideo className="h-6 w-6 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-mono text-zinc-300">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Clip Metadata */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200" title={clip.name}>
                      {clip.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                      <span>{formatFileSize(clip.size)}</span>
                      <span>•</span>
                      <span>{formatDuration(clip.duration)}</span>
                    </div>

                    {/* Progress Bar */}
                    {(isCurrentUploading || isCompleted) && (
                      <div className="mt-1.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-200 ${
                            isCompleted
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                          }`}
                          style={{ width: `${clip.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Cloudinary Uploaded
                        </span>
                      ) : isCurrentUploading ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          {clip.progress}%
                        </span>
                      ) : isError ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          Fehlgeschlagen
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                          {dict.upload.status.ready}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeClip(clip.id)}
                    disabled={isUploading}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30"
                    title={dict.upload.card.remove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
