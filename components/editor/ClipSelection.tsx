'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow, IntentMode } from '@/context/EditorWorkflowContext';
import { UploadAuthModal } from '@/components/auth/UploadAuthModal';
import { UploadClip } from '@/components/upload/FileUploadZone';
import {
  UploadCloud,
  FileVideo,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Play,
  Pause,
  Loader2,
  Film,
  Layers,
  Copy,
  Clock,
  HardDrive,
  Send
} from 'lucide-react';

interface ClipSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ClipSelection({ onContinue, onBack }: ClipSelectionProps) {
  const { locale } = useLanguage();
  const { data: session } = useSession();
  const {
    intentConfig,
    serviceMode,
    uploadedClips,
    setUploadedClips,
    startUploadFlow,
    isUploading,
    uploadProgress,
    pendingFiles,
    setPendingFiles,
    authModalOpen,
    setAuthModalOpen,
    setAiProcessingResult,
  } = useEditorWorkflow();

  const [isDragging, setIsDragging] = useState(false);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStepMessage, setAiStepMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMulti = intentConfig.mode !== 'one_clip';

  // Config text based on Intent
  const modeInfo = {
    one_clip: {
      badge: locale === 'de' ? '1 Clip' : '1 Single Clip',
      title: locale === 'de' ? 'Wähle deinen Video-Clip' : 'Select 1 Video Clip',
      subtitle:
        locale === 'de'
          ? 'Wähle genau eine Rohaufnahme aus. Wir schneiden Stille, Pausen und Versprecher automatisch heraus.'
          : 'Choose a single raw video. We will auto-detect silence, jump-cuts, and ums into one crisp viral video.',
      icon: Film,
      helper:
        locale === 'de'
          ? 'Nur 1 Video erlaubt (Modus: Ein einzelner Clip)'
          : '1 video allowed (Mode: One clip)',
    },
    several_clips_one_video: {
      badge: locale === 'de' ? 'Mehrere Clips' : 'Multiple Clips',
      title:
        locale === 'de'
          ? 'Wähle mehrere Clips für 1 Video'
          : 'Select Multiple Clips for 1 Video',
      subtitle:
        locale === 'de'
          ? 'Wähle 2 oder mehr Aufnahmen aus. Sie werden in deiner gewählten Reihenfolge zu einem viralen Video vereint.'
          : 'Select 2 or more clips. They will be assembled in order into a single viral video.',
      icon: Layers,
      helper:
        locale === 'de'
          ? 'Mehrere Clips auswählen (Reihenfolge anpassbar)'
          : 'Select multiple clips (in sequence order)',
    },
    several_videos_batch: {
      badge: locale === 'de' ? 'Batch-Upload' : 'Batch Selection',
      title:
        locale === 'de'
          ? 'Batch-Upload: Mehrere Videos'
          : 'Batch Select Videos',
      subtitle:
        locale === 'de'
          ? 'Lade all deine Rohaufnahmen hoch. Jedes Video wird automatisch zu einem eigenen, perfekten Clip editiert.'
          : 'Upload all your raw recordings. Each video will be processed individually into its own viral cut.',
      icon: Copy,
      helper:
        locale === 'de'
          ? 'Mehrere Videos auswählen (Jedes wird ein eigenes Video)'
          : 'Select multiple videos (Each becomes its own cut)',
    },
  }[intentConfig.mode];

  const handleFilesChosen = async (files: FileList | File[], append: boolean = false) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Check NextAuth session
    if (!session?.user) {
      setPendingFiles(fileList);
      setAuthModalOpen(true);
      return;
    }

    // Single clip mode constraint
    const filesToUpload = !isMulti ? [fileList[0]] : fileList;
    await startUploadFlow(filesToUpload, append && isMulti);
  };

  const handleAuthSuccess = async () => {
    if (pendingFiles && pendingFiles.length > 0) {
      const filesToUpload = !isMulti ? [pendingFiles[0]] : pendingFiles;
      await startUploadFlow(filesToUpload, isMulti);
      setPendingFiles(null);
    }
  };

  const handleDeleteClip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedClips((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        sessionStorage.setItem('clipviral_editor_clips', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const togglePreview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingClipId((current) => (current === id ? null : id));
  };

  const handleProceedWithAI = async () => {
    if (uploadedClips.length === 0) return;
    setIsProcessingAI(true);

    try {
      setAiStepMessage(
        locale === 'de'
          ? 'Transkribiere Audio mit OpenAI Whisper...'
          : 'Transcribing speech with OpenAI Whisper...'
      );
      await new Promise((r) => setTimeout(r, 650));

      setAiStepMessage(
        locale === 'de'
          ? 'Erkenne Stille, Wortpausen & Ähms...'
          : 'Detecting silences, dead air & ums...'
      );

      const targetClip = uploadedClips[0];
      const videoUrl = targetClip?.storageKey || targetClip?.previewUrl || '';
      const duration = targetClip?.duration || 18.5;

      const res = await fetch('/api/video/autoclip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          clipId: targetClip?.id || 'clip_01',
          duration,
          language: locale === 'de' ? 'de' : 'en',
          minSilence: 0.35,
        }),
      });

      const data = await res.json();
      setAiStepMessage(
        locale === 'de'
          ? 'Bereite CapCut-Timeline vor...'
          : 'Setting up CapCut-style studio editor...'
      );
      await new Promise((r) => setTimeout(r, 400));

      setAiProcessingResult(data);
      onContinue();
    } catch (e) {
      console.warn('AI processing fallback:', e);
      onContinue();
    } finally {
      setIsProcessingAI(false);
    }
  };

  const totalDuration = uploadedClips.reduce((acc, c) => acc + (c.duration || 0), 0);
  const totalSizeMb = (
    uploadedClips.reduce((acc, c) => acc + (c.size || 0), 0) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <>
      <UploadAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in-50 duration-200">
        {/* Top Bar Navigation - Consistent with Step 1 */}
        <div className="flex items-center justify-center gap-3 w-full pb-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessingAI || isUploading}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{locale === 'de' ? 'Schritt 2 von 3: Clips auswählen' : 'Step 2 of 3: Select Clips'}</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-zinc-850 border border-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 mb-1">
            <modeInfo.icon className="w-3 h-3 text-cyan-400" />
            <span>{modeInfo.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {modeInfo.title}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            {modeInfo.subtitle}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.webm,.mkv"
          multiple={isMulti}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesChosen(e.target.files, isMulti && uploadedClips.length > 0);
            }
          }}
        />

        {/* Main Content Area */}
        {uploadedClips.length === 0 ? (
          /* Empty Dropzone State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesChosen(e.dataTransfer.files, false);
              }
            }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 backdrop-blur-md ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01] shadow-2xl shadow-cyan-500/20'
                : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/60 shadow-xl'
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 shadow-inner mb-4">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              ) : (
                <UploadCloud className="h-8 w-8 text-cyan-400" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {isUploading
                ? locale === 'de'
                  ? 'Verarbeite Video-Metadaten...'
                  : 'Processing video metadata...'
                : locale === 'de'
                ? isMulti
                  ? 'Mehrere Videos hier ablegen oder durchsuchen'
                  : 'Video hier ablegen oder durchsuchen'
                : isMulti
                ? 'Drop multiple videos here or browse files'
                : 'Drop video here or click to browse'}
            </h3>

            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              {modeInfo.helper} • MP4, MOV, WEBM (bis zu 4K)
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-200 border border-zinc-750 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
            >
              <FileVideo className="h-3.5 w-3.5 text-cyan-400" />
              <span>{locale === 'de' ? 'Dateien auswählen' : 'Browse Files'}</span>
            </button>
          </div>
        ) : (
          /* Populated Clips Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  {uploadedClips.length}{' '}
                  {uploadedClips.length === 1
                    ? locale === 'de'
                      ? 'Clip geladen'
                      : 'clip selected'
                    : locale === 'de'
                    ? 'Clips geladen'
                    : 'clips selected'}
                </span>
                <span className="text-xs text-zinc-400">• {totalDuration.toFixed(1)}s total</span>
                <span className="text-xs text-zinc-500">• {totalSizeMb} MB</span>
              </div>

              {isMulti && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locale === 'de' ? '+ Weiteren Clip hinzufügen' : '+ Add another clip'}</span>
                </button>
              )}
            </div>

            {/* Clips Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedClips.map((clip, index) => {
                const isPlaying = playingClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    className="relative group rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-lg hover:border-zinc-700 transition-all"
                  >
                    {/* Video / Thumbnail preview */}
                    <div className="relative aspect-video bg-zinc-900 overflow-hidden flex items-center justify-center">
                      <video
                        src={clip.previewUrl || clip.storageKey}
                        className="w-full h-full object-contain"
                        controls={false}
                        loop
                        muted
                        ref={(el) => {
                          if (el) {
                            if (isPlaying) el.play().catch(() => {});
                            else el.pause();
                          }
                        }}
                      />

                      {/* Play / Pause Overlay */}
                      <button
                        type="button"
                        onClick={(e) => togglePreview(clip.id, e)}
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-zinc-950 shadow-lg">
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </div>
                      </button>

                      {/* Sequence Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-900/85 border border-zinc-700/60 text-[10px] font-bold text-zinc-200 backdrop-blur-sm">
                        #{index + 1}
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-zinc-950/80 text-[10px] font-mono text-cyan-300 border border-zinc-800 backdrop-blur-sm">
                        {clip.duration ? `${clip.duration.toFixed(1)}s` : '12s'}
                      </div>
                    </div>

                    {/* Clip Info Footer */}
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{clip.name}</p>
                        <p className="text-[10px] text-zinc-500">
                          {((clip.size || 0) / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteClip(clip.id, e)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title={locale === 'de' ? 'Clip entfernen' : 'Remove clip'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add more card if multi */}
              {isMulti && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/40 cursor-pointer min-h-[160px] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-all p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">
                    {locale === 'de' ? 'Clip hinzufügen' : 'Add another clip'}
                  </span>
                </div>
              )}
            </div>

            {/* Change clip button if single clip */}
            {!isMulti && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <span>{locale === 'de' ? 'Anderen Clip auswählen' : 'Choose a different clip'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator State */}
        {isProcessingAI && (
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 text-center space-y-2 animate-in fade-in-50">
            <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-semibold">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{aiStepMessage}</span>
            </div>
            <div className="h-1.5 w-52 mx-auto rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Action Button: Edit with AI or Done For You Brief */}
        {uploadedClips.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => {
                if (serviceMode === 'done_for_you') {
                  onContinue();
                } else {
                  handleProceedWithAI();
                }
              }}
              disabled={isProcessingAI || isUploading}
              className={`w-full flex items-center justify-center gap-2.5 rounded-2xl p-4 text-sm font-bold text-zinc-950 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] ${
                serviceMode === 'done_for_you'
                  ? 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-violet-500/20'
                  : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-600 shadow-cyan-500/20'
              }`}
            >
              {serviceMode === 'done_for_you' ? (
                <>
                  <Send className="h-4 w-4 text-zinc-950" />
                  <span>
                    {locale === 'de'
                      ? 'Weiter zum Briefing (Done for you)'
                      : 'Continue to Done For You Brief'}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : isProcessingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>
                    {locale === 'de'
                      ? 'KI analysiert Audio & schneidet...'
                      : 'AI Analyzing speech & creating cuts...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-zinc-950" />
                  <span>
                    {locale === 'de'
                      ? '✨ Mit KI schneiden & Studio öffnen'
                      : '✨ Edit with AI & Open Studio'}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

