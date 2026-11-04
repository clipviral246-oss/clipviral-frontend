'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import { UploadAuthModal } from '@/components/auth/UploadAuthModal';
import { UploadCloud, FileVideo, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function LandingHeroUpload() {
  const { locale } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    startUploadFlow,
    isUploading,
    uploadProgress,
    pendingFiles,
    setPendingFiles,
    authModalOpen,
    setAuthModalOpen,
    setCurrentStep,
  } = useEditorWorkflow();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChosen = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Check if user is logged in
    if (!session?.user) {
      // Pause upload flow and show NextAuth modal
      setPendingFiles(fileList);
      setAuthModalOpen(true);
      return;
    }

    // User is logged in: proceed directly with upload & setup navigation
    await executeUploadAndNavigate(fileList);
  };

  const executeUploadAndNavigate = async (files: File[]) => {
    setCurrentStep('ai_choice');
    await startUploadFlow(files);
    router.push(`/${locale}/editor`);
  };

  const handleAuthSuccess = async () => {
    if (pendingFiles && pendingFiles.length > 0) {
      setCurrentStep('ai_choice');
      await executeUploadAndNavigate(pendingFiles);
      setPendingFiles(null);
    } else {
      setCurrentStep('ai_choice');
      router.push(`/${locale}/editor`);
    }
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
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  return (
    <>
      <div className="w-full max-w-xl mx-auto pt-2">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 backdrop-blur-md ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-2xl shadow-cyan-500/20'
              : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/60 shadow-xl'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.webm,.mkv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesChosen(e.target.files);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Upload Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/10 to-violet-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              ) : (
                <UploadCloud className="h-8 w-8" />
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {locale === 'de' ? 'Rohaufnahme hier ablegen' : 'Drop your raw take here'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                {locale === 'de'
                  ? 'MP4 oder MOV aus deiner Mediathek (bis zu 20+ Clips)'
                  : 'MP4 or MOV from your camera roll (up to 20+ clips)'}
              </p>
            </div>

            {/* Choose Video Button */}
            {!isUploading ? (
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-zinc-800 hover:border-zinc-600 transition-all group-hover:border-cyan-500/50"
              >
                <FileVideo className="h-4 w-4 text-cyan-400" />
                <span>{locale === 'de' ? 'Video auswählen' : 'Choose a video'}</span>
              </button>
            ) : (
              <div className="w-full max-w-xs space-y-2 mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-cyan-400">
                  {locale === 'de' ? 'Wird vorbereitet...' : 'Preparing high-speed upload...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Intercept Modal */}
      <UploadAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

