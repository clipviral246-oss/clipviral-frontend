'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import { AIChoice } from '@/components/editor/AIChoice';
import { IntentSelection } from '@/components/editor/IntentSelection';
import { ClipSelection } from '@/components/editor/ClipSelection';
import { DoneForYouForm } from '@/components/editor/DoneForYouForm';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';

export default function EditorPage() {
  const { locale } = useLanguage();
  const { currentStep, setCurrentStep } = useEditorWorkflow();

  return (
    <div className="w-full">
      {/* STEP 1: Editing Style Choice Screen ("Edit it with AI" vs "Done for you") */}
      {currentStep === 'ai_choice' && (
        <AIChoice
          onProceedToIntent={() => setCurrentStep('intent')}
          onProceedToDoneForYou={() => setCurrentStep('done_for_you')}
          onBack={() => {
            if (typeof window !== 'undefined') {
              window.location.href = `/${locale}`;
            }
          }}
        />
      )}

      {/* STEP 2 (AI Flow): Intent Selection Screen ("What are we making?") */}
      {currentStep === 'intent' && (
        <IntentSelection
          onContinue={() => setCurrentStep('upload')}
          onBack={() => setCurrentStep('ai_choice')}
        />
      )}

      {/* STEP 3 (AI Flow): Clip Selection */}
      {currentStep === 'upload' && (
        <ClipSelection
          onContinue={() => setCurrentStep('editor')}
          onBack={() => setCurrentStep('intent')}
        />
      )}

      {/* DEDICATED DONE FOR YOU FLOW (Direct from Step 1 - As in reference video) */}
      {currentStep === 'done_for_you' && (
        <DoneForYouForm
          onBack={() => setCurrentStep('ai_choice')}
        />
      )}

      {/* STEP 4 (AI Flow): Advanced CapCut-Style Studio UI */}
      {currentStep === 'editor' && (
        <AdvancedEditor
          onBack={() => setCurrentStep('upload')}
        />
      )}
    </div>
  );
}
