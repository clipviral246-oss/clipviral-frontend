'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UploadClip } from '@/components/upload/FileUploadZone';

export type WorkflowStep = 'ai_choice' | 'intent' | 'upload' | 'editor' | 'done_for_you';

export type IntentMode = 'one_clip' | 'several_clips_one_video' | 'several_videos_batch';
export type ServiceMode = 'ai' | 'done_for_you';

export interface WorkflowIntentConfig {
  mode: IntentMode;
  smoothAudio: boolean;
}

export interface WorkflowContextType {
  currentStep: WorkflowStep;
  setCurrentStep: (step: WorkflowStep) => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  uploadedClips: UploadClip[];
  setUploadedClips: React.Dispatch<React.SetStateAction<UploadClip[]>>;
  intentConfig: WorkflowIntentConfig;
  setIntentConfig: React.Dispatch<React.SetStateAction<WorkflowIntentConfig>>;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  pendingFiles: File[] | null;
  setPendingFiles: (files: File[] | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  startUploadFlow: (files: FileList | File[], append?: boolean) => Promise<void>;
  aiProcessingResult: any | null;
  setAiProcessingResult: (result: any | null) => void;
  resetWorkflow: () => void;
}

const EditorWorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function EditorWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('ai_choice');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('ai');
  const [uploadedClips, setUploadedClips] = useState<UploadClip[]>([]);
  const [intentConfig, setIntentConfig] = useState<WorkflowIntentConfig>({
    mode: 'one_clip',
    smoothAudio: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aiProcessingResult, setAiProcessingResult] = useState<any | null>(null);

  // Restore clips from sessionStorage if user refreshes
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('clipviral_editor_clips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUploadedClips(parsed);
        }
      }
    } catch {}
  }, []);

  const saveClipsToStorage = (clips: UploadClip[]) => {
    try {
      sessionStorage.setItem('clipviral_editor_clips', JSON.stringify(clips));
    } catch {}
  };

  const startUploadFlow = async (files: FileList | File[], append: boolean = false) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadProgress(20);

    const newClips: UploadClip[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const localUrl = URL.createObjectURL(file);
      const clipId = `clip_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

      let duration = 12;
      try {
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.src = localUrl;
        await new Promise<void>((resolve) => {
          probe.onloadedmetadata = () => {
            if (probe.duration && isFinite(probe.duration) && probe.duration > 0) {
              duration = Math.round(probe.duration * 10) / 10;
            }
            resolve();
          };
          probe.onerror = () => resolve();
          setTimeout(resolve, 800);
        });
      } catch {}

      newClips.push({
        id: clipId,
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        duration,
        status: 'completed',
        progress: 100,
        previewUrl: localUrl,
        storageKey: localUrl,
        file,
      });
    }

    setUploadProgress(100);
    setIsUploading(false);

    setUploadedClips((prev) => {
      const updated = append ? [...prev, ...newClips] : newClips;
      saveClipsToStorage(updated);
      return updated;
    });
  };

  const resetWorkflow = () => {
    setUploadedClips([]);
    setCurrentStep('ai_choice');
    setAiProcessingResult(null);
    setPendingFiles(null);
    try {
      sessionStorage.removeItem('clipviral_editor_clips');
    } catch {}
  };

  return (
    <EditorWorkflowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        serviceMode,
        setServiceMode,
        uploadedClips,
        setUploadedClips,
        intentConfig,
        setIntentConfig,
        isUploading,
        setIsUploading,
        uploadProgress,
        setUploadProgress,
        pendingFiles,
        setPendingFiles,
        authModalOpen,
        setAuthModalOpen,
        startUploadFlow,
        aiProcessingResult,
        setAiProcessingResult,
        resetWorkflow,
      }}
    >
      {children}
    </EditorWorkflowContext.Provider>
  );
}

export function useEditorWorkflow() {
  const context = useContext(EditorWorkflowContext);
  if (!context) {
    throw new Error('useEditorWorkflow must be used within an EditorWorkflowProvider');
  }
  return context;
}

