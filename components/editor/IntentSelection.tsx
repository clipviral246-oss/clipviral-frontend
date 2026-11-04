'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow, IntentMode } from '@/context/EditorWorkflowContext';
import {
  Film,
  Layers,
  Copy,
  CheckCircle2,
  Volume2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Sliders
} from 'lucide-react';

interface IntentSelectionProps {
  onContinue: () => void;
  onBack?: () => void;
}

export function IntentSelection({ onContinue, onBack }: IntentSelectionProps) {
  const { locale } = useLanguage();
  const { intentConfig, setIntentConfig, uploadedClips } = useEditorWorkflow();

  const handleSelectMode = (mode: IntentMode) => {
    setIntentConfig((prev) => ({
      ...prev,
      mode,
    }));
  };

  const handleToggleSmoothAudio = () => {
    setIntentConfig((prev) => ({
      ...prev,
      smoothAudio: !prev.smoothAudio,
    }));
  };

  const options: Array<{
    id: IntentMode;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'one_clip',
      title: locale === 'de' ? 'Ein einzelner Clip' : 'One clip',
      description: locale === 'de' ? 'Ein fertiges Video aus einem Clip' : 'One video from one clip',
      icon: Film,
      badge: 'Popular',
    },
    {
      id: 'several_clips_one_video',
      title: locale === 'de' ? 'Mehrere Clips, ein Video' : 'Several clips, one video',
      description: locale === 'de' ? 'In der Reihenfolge, wie du sie auswählst' : 'In the order you pick them',
      icon: Layers,
    },
    {
      id: 'several_videos_batch',
      title: locale === 'de' ? 'Mehrere Videos (Batch)' : 'Several videos (batch)',
      description: locale === 'de' ? 'Jeder Clip wird zu einem eigenen Video' : 'Each one becomes its own video',
      icon: Copy,
      badge: 'Batch',
    },
  ];

  // Rule: If option 2 or 3 is selected, hide the 'Smooth audio between cuts' toggle
  const showSmoothAudioToggle = intentConfig.mode === 'one_clip';

  return (
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Bar Navigation - Matching Reference Header */}
      <div className="flex items-center justify-center gap-3 w-full pb-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/10">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>{locale === 'de' ? 'Schritt 1 von 3: Video-Format' : 'Step 1 of 3: Video Intent'}</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-2 pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {locale === 'de' ? 'Was erstellen wir?' : 'What are we making?'}
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          {locale === 'de'
            ? 'Wähle aus, wie deine Rohaufnahmen zusammengestellt werden sollen.'
            : 'Choose how your raw footage should be assembled into viral content.'}
        </p>
      </div>

      {/* 3 Intent Cards - Pixel-perfect matching reference */}
      <div className="space-y-3.5">
        {options.map((opt) => {
          const isSelected = intentConfig.mode === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => handleSelectMode(opt.id)}
              className={`group relative flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[2px] border-[#00c7d4] bg-[#081216]/80 shadow-[0_0_24px_rgba(0,199,212,0.18)]'
                  : 'border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-[#00e5ff]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{opt.title}</h3>
                    {opt.badge && (
                      <span className="rounded-full bg-[#003940] px-2.5 py-0.5 text-[11px] font-semibold text-[#00e5ff] border border-cyan-500/40">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{opt.description}</p>
                </div>
              </div>

              {/* Selection Radio Circle - Matching Reference */}
              <div className="pl-4">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? 'border-[3.5px] border-[#00c7d4] bg-transparent shadow-[0_0_8px_rgba(0,199,212,0.4)]'
                      : 'border-2 border-zinc-700 bg-transparent'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Smooth Audio Between Cuts Toggle (HIDDEN when option 2 or 3 is selected) */}
      {showSmoothAudioToggle && (
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/30 text-violet-300">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                {locale === 'de' ? 'Audio-Übergänge glätten' : 'Smooth audio between cuts'}
              </h4>
              <p className="text-[11px] text-zinc-400">
                {locale === 'de'
                  ? 'Entfernt Knacken und Atmer an den Schnittpunkten (15ms Anti-Click Microfades).'
                  : 'Applies 15ms anti-click microfades to eliminate sudden breath pops and audio clicks.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleSmoothAudio}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              intentConfig.smoothAudio ? 'bg-cyan-500' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                intentConfig.smoothAudio ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-2">
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-600 p-4 text-sm font-bold text-zinc-950 shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <span>{locale === 'de' ? 'Weiter zur Clip-Auswahl' : 'Continue to Select Clips'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

