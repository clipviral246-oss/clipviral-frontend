'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { VideoTimelineEditor } from '@/components/timeline/VideoTimelineEditor';
import { UploadCloud, Scissors, Layers, Sparkles } from 'lucide-react';

export default function EditorPage() {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upload' | 'timeline'>('upload');

  return (
    <div className="space-y-6 py-2">
      {/* Unified Editor Workspace Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ClipViral Studio Workspace
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20">
                Live Engine
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              {locale === 'de'
                ? 'Lade Rohclips hoch und bearbeite Schnitte in einer gemeinsamen Oberfläche'
                : 'Upload raw clips and edit cuts in one unified interface'}
            </p>
          </div>
        </div>

        {/* Workspace Mode Switcher Tabs */}
        <div className="inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>{locale === 'de' ? '1. Upload (20+ Clips)' : '1. Upload (20+ Clips)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Scissors className="h-4 w-4" />
            <span>{locale === 'de' ? '2. Timeline & Schnitt' : '2. Timeline & Cuts'}</span>
          </button>
        </div>
      </div>

      {/* Seamless Workspace Views */}
      {activeTab === 'upload' ? (
        <div className="animate-in fade-in-50 duration-200">
          <FileUploadZone onProceedToTimeline={() => setActiveTab('timeline')} />
        </div>
      ) : (
        <div className="animate-in fade-in-50 duration-200">
          <VideoTimelineEditor onOpenUpload={() => setActiveTab('upload')} />
        </div>
      )}
    </div>
  );
}
