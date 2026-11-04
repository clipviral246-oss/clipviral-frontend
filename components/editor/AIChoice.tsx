'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import {
  Scissors,
  Send,
  ChevronRight,
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AIChoiceProps {
  onProceedToIntent: () => void;
  onProceedToDoneForYou: () => void;
  onBack?: () => void;
}

export function AIChoice({ onProceedToIntent, onProceedToDoneForYou, onBack }: AIChoiceProps) {
  const { locale } = useLanguage();
  const { setServiceMode } = useEditorWorkflow();

  const handleSelectAI = () => {
    setServiceMode('ai');
    onProceedToIntent();
  };

  const handleSelectDoneForYou = () => {
    setServiceMode('done_for_you');
    onProceedToDoneForYou();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Bar Navigation */}
      <div className="relative flex items-center justify-between w-full pb-4 border-b border-zinc-850">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-850 transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3.5 py-1 text-xs font-semibold text-violet-300 shadow-sm shadow-violet-500/10">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span>{locale === 'de' ? 'Schritt 1 von 4: Schnitt-Methode' : 'Step 1 of 4: Editing Style'}</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-2 pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {locale === 'de' ? 'Wie möchtest du schneiden?' : 'How do you want to edit?'}
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          {locale === 'de'
            ? 'Wähle automatischen KI-Schnitt oder manuelle Bearbeitung.'
            : 'Choose instant AI jump-cuts or done-for-you professional polish.'}
        </p>
      </div>

      {/* Two Large Choice Buttons (Matching Reference Design) */}
      <div className="space-y-4">
        {/* Button 1: Edit it with AI */}
        <button
          onClick={handleSelectAI}
          className="w-full group text-left relative flex items-center justify-between p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-400/80 hover:bg-zinc-850 hover:shadow-2xl hover:shadow-cyan-500/15 transition-all duration-200"
        >
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Circle Icon Badge */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md group-hover:scale-105 transition-transform">
              <Scissors className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {locale === 'de' ? 'Mit KI schneiden' : 'Edit it with AI'}
                </h3>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                  Instant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
                {locale === 'de'
                  ? 'Entfernt tote Zeiten, Versprecher und Ähms, und öffnet deinen fertigen Schnitt im Editor.'
                  : 'Cuts the dead air, the retakes and the ums, then opens your cut in the editor.'}
              </p>
            </div>
          </div>

          <div className="pl-4 text-zinc-500 group-hover:text-cyan-400 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </div>
        </button>

        {/* Button 2: Done for you (Now fully active human editor service) */}
        <button
          onClick={handleSelectDoneForYou}
          className="w-full group text-left relative flex items-center justify-between p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-violet-400/80 hover:bg-zinc-850 hover:shadow-2xl hover:shadow-violet-500/15 transition-all duration-200"
        >
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md group-hover:scale-105 transition-transform">
              <Send className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {locale === 'de' ? 'Für mich erledigen' : 'Done for you'}
                </h3>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-500/30">
                  {locale === 'de' ? 'Pro-Editor' : 'Human Editor'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
                {locale === 'de'
                  ? 'Ein professioneller Editor schneidet es von Anfang bis Ende: Untertitel, B-Roll, Overlays und visueller Feinschliff.'
                  : 'An editor edits it start to finish: captions, B-roll, overlays, visual polish.'}
              </p>
            </div>
          </div>

          <div className="pl-4 text-zinc-500 group-hover:text-violet-400 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </div>
        </button>
      </div>
    </div>
  );
}

