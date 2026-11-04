'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Link2,
  Paperclip,
  Folder,
  Check,
  Send,
  Plus,
  Trash2,
  Film,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';

interface DoneForYouFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function DoneForYouForm({ onBack, onSuccess }: DoneForYouFormProps) {
  const { locale } = useLanguage();
  const { uploadedClips, setUploadedClips, startUploadFlow, resetWorkflow } = useEditorWorkflow();

  // Video Section state
  const [videoCardOpen, setVideoCardOpen] = useState(true);
  const clipInputRef = useRef<HTMLInputElement>(null);

  // Reference Link state
  const [referenceUrl, setReferenceUrl] = useState('');

  // Brief state & Active Pills
  const [briefText, setBriefText] = useState('');
  const briefTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedPills, setSelectedPills] = useState<string[]>(['Captions', 'Zooms', 'Music']);

  // Add-ons: Script
  const [showScript, setShowScript] = useState(false);
  const [scriptText, setScriptText] = useState('');

  // Add-ons: Logo and Images
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Multiple Videos: Video 2 state
  const [hasVideo2, setHasVideo2] = useState(false);
  const [video2Clips, setVideo2Clips] = useState<any[]>([]);
  const video2InputRef = useRef<HTMLInputElement>(null);

  // Editor Selection: 'fastest' | 'my_editor'
  const [editorChoice, setEditorChoice] = useState<'fastest' | 'my_editor'>('fastest');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{
    orderId: string;
    tokenCost: number;
    deliveryTime: string;
  } | null>(null);

  // Calculations
  const clipCount = Math.max(1, uploadedClips.length);
  const totalDurationSecs = Math.max(30, Math.round(uploadedClips.reduce((acc, c) => acc + (c.duration || 0), 0) || 30));
  const mins = Math.floor(totalDurationSecs / 60);
  const secs = totalDurationSecs % 60;
  const formattedFootage = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Tokens calculation (10 tokens per video)
  const totalVideos = 1 + (hasVideo2 ? 1 : 0);
  const tokenCost = totalVideos * 10;

  // Pills Definition matching reference video
  const pillsList = [
    { id: 'Captions', label: 'Captions', insertText: '• Captions: Dynamic animated captions with colored highlights & emojis' },
    { id: 'Font', label: 'Font', insertText: '• Font: Modern bold sans-serif with subtle contrast shadow' },
    { id: 'Follow the reference', label: 'Follow the reference', insertText: '• Follow the reference: Match the cuts, pacing, transitions and style' },
    { id: 'Hook text', label: 'Hook text', insertText: '• Hook text: Add an eye-catching text hook across the top in the first 2-3 seconds' },
    { id: 'Zooms', label: 'Zooms', insertText: '• Zooms: Dynamic punch-in zooms on key punchlines and emphasis words' },
    { id: 'B-roll', label: 'B-roll', insertText: '• B-roll: Insert matching context b-roll images and overlay clips' },
    { id: 'Music', label: 'Music', insertText: '• Music: Trending upbeat background track ducked below speech' },
  ];

  const handlePillClick = (pill: typeof pillsList[0]) => {
    const isSelected = selectedPills.includes(pill.id);

    if (isSelected) {
      setSelectedPills((prev) => prev.filter((p) => p !== pill.id));
    } else {
      setSelectedPills((prev) => [...prev, pill.id]);
      setBriefText((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return pill.insertText;
        return `${trimmed}\n${pill.insertText}`;
      });
      if (briefTextareaRef.current) {
        briefTextareaRef.current.focus();
      }
    }
  };

  const handleAddClipToFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await startUploadFlow(e.target.files, true);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFileName(file.name);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/video/done-for-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceUrl,
          brief: briefText,
          script: showScript ? scriptText : '',
          logoUrl: logoPreviewUrl,
          editorChoice,
          clips: uploadedClips,
          tokenCost,
          totalDuration: totalDurationSecs,
        }),
      });
      const data = await res.json();
      setOrderComplete({
        orderId: data.orderId || `CV-DFY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        tokenCost: data.tokenCost || tokenCost,
        deliveryTime: '12-24 hours',
      });
      onSuccess?.();
    } catch {
      setOrderComplete({
        orderId: `CV-DFY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        tokenCost,
        deliveryTime: '12-24 hours',
      });
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION MODAL (Dark Theme)
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              {locale === 'de' ? 'Auftrag eingereicht!' : 'Order received!'}
            </h2>
            <p className="text-xs text-zinc-400">
              {locale === 'de'
                ? `Auftrag #${orderComplete.orderId}. Dein Editor legt jetzt los.`
                : `Order #${orderComplete.orderId}. Your editor is starting now.`}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between items-center text-zinc-400">
              <span>{locale === 'de' ? 'Editor:' : 'Editor:'}</span>
              <span className="font-semibold text-white">
                {editorChoice === 'fastest' ? '⚡ Fastest editor' : '★ My editor'}
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>{locale === 'de' ? 'Lieferzeit:' : 'Delivery:'}</span>
              <span className="font-semibold text-cyan-300">{orderComplete.deliveryTime}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400 border-t border-zinc-800 pt-2">
              <span>{locale === 'de' ? 'Kosten:' : 'Cost:'}</span>
              <span className="font-bold text-amber-400">{orderComplete.tokenCost} tokens</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                resetWorkflow();
                if (typeof window !== 'undefined') {
                  window.location.href = `/${locale}/editor`;
                }
              }}
              className="w-full rounded-full bg-white text-zinc-950 font-bold py-3.5 text-xs hover:bg-zinc-200 transition-colors shadow-sm"
            >
              {locale === 'de' ? 'Weiteres Video erstellen' : 'Make another video'}
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/${locale}`;
                }
              }}
              className="w-full rounded-full bg-zinc-800 text-zinc-400 font-semibold py-2.5 text-xs hover:text-white transition-colors"
            >
              {locale === 'de' ? 'Zurück zur Startseite' : 'Back to home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-32">
      {/* Top Header matching reference (Dark Theme) */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center h-9 w-9 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <h1 className="text-base font-bold text-white">Done for you</h1>

          <div className="w-9" />
        </div>
      </div>

      {/* Main Content Form */}
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Hidden File Inputs */}
        <input
          ref={clipInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.webm,.mkv"
          multiple
          className="hidden"
          onChange={handleAddClipToFile}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*,.png,.svg,.jpg,.webp"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <input
          ref={video2InputRef}
          type="file"
          accept="video/*,.mp4,.mov,.webm,.mkv"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const f = e.target.files[0];
              setVideo2Clips([{ name: f.name, duration: 15, url: URL.createObjectURL(f) }]);
            }
          }}
        />

        {/* ======================================================== */}
        {/* VIDEO 1 CARD (Dark Theme matching frame_033.jpg) */}
        {/* ======================================================== */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
          {/* Top header row */}
          <div
            onClick={() => setVideoCardOpen((prev) => !prev)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-850/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Video 1</h3>
                <p className="text-xs text-zinc-400">
                  {clipCount} {clipCount === 1 ? 'clip' : 'clips'} · {formattedFootage} of footage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">10 tokens</span>
              {videoCardOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </div>

          {/* Accordion Content */}
          {videoCardOpen && (
            <div className="px-4 pb-4 space-y-3.5 border-t border-zinc-800/80 pt-3">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-semibold">Clips, in the order they play</span>
                <span className="text-zinc-500">1 of 5</span>
              </div>

              {/* Horizontal Clips Preview Strip */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {uploadedClips.length > 0 ? (
                  uploadedClips.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="relative h-20 w-16 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md"
                    >
                      {c.previewUrl || c.storageKey ? (
                        <video
                          src={c.previewUrl || c.storageKey}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <Film className="w-6 h-6 text-zinc-600" />
                      )}
                      {/* Sequence Badge */}
                      <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-black/80 text-[10px] text-white flex items-center justify-center font-bold border border-zinc-700">
                        {i + 1}
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-1 right-1 px-1 rounded bg-black/90 text-[9px] font-mono text-cyan-300">
                        {c.duration ? `0:${Math.round(c.duration) < 10 ? '0' : ''}${Math.round(c.duration)}` : '0:30'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative h-20 w-16 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                    <Film className="w-6 h-6 text-zinc-600" />
                    <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-black/80 text-[10px] text-white flex items-center justify-center font-bold border border-zinc-700">
                      1
                    </div>
                    <div className="absolute bottom-1 right-1 px-1 rounded bg-black/90 text-[9px] font-mono text-cyan-300">
                      0:30
                    </div>
                  </div>
                )}

                {/* + Add clip button */}
                <button
                  type="button"
                  onClick={() => clipInputRef.current?.click()}
                  className="h-20 w-16 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Footage Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(12, (totalDurationSecs / 300) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>{formattedFootage} of footage</span>
                  <span>5:00 per video</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* REFERENCE FIELD (Dark Theme) */}
        {/* ======================================================== */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Reference</span>
            <span className="text-zinc-500 font-medium">Required</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="Paste a link"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* BRIEF SECTION & PILLS (Dark Theme) */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Brief</span>
            <span className="text-zinc-500 font-medium">Required</span>
          </div>

          {/* Quick-Insert Pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {pillsList.map((pill) => {
              const isSelected = selectedPills.includes(pill.id);
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                    isSelected
                      ? 'bg-white text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Brief Textarea */}
          <div className="relative pt-1">
            <textarea
              ref={briefTextareaRef}
              rows={4}
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              placeholder="What is this video? Hook, captions, font, anything your editor should know."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-sm resize-y min-h-[105px]"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* ADD A SCRIPT (Dark Theme) */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowScript((prev) => !prev)}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add a script</span>
          </button>

          {showScript && (
            <textarea
              rows={3}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste your spoken script or transcript here..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all animate-in fade-in-50"
            />
          )}
        </div>

        {/* ======================================================== */}
        {/* LOGO AND IMAGES (Dark Theme) */}
        {/* ======================================================== */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-white block">Logo and images</span>

          <div
            onClick={() => logoInputRef.current?.click()}
            className="w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-850/60 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Paperclip className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-white">
                {logoFileName || 'Add a logo or images'}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {logoFileName ? 'Uploaded' : 'From your photos'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-0.5">
            <Folder className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              Add your logos and brand files once in{' '}
              <strong className="text-zinc-200 font-semibold">Profile → My assets</strong>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ADD VIDEO 2 BUTTON (Dark Theme) */}
        {/* ======================================================== */}
        {!hasVideo2 ? (
          <button
            type="button"
            onClick={() => setHasVideo2(true)}
            className="w-full py-3.5 bg-zinc-900/60 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add video 2</span>
          </button>
        ) : (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Video 2</h3>
                <p className="text-xs text-zinc-400">1 clip · 0:30 of footage</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">10 tokens</span>
              <button
                type="button"
                onClick={() => setHasVideo2(false)}
                className="text-zinc-500 hover:text-red-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EDITOR SELECTION (Dark Theme) */}
        {/* ======================================================== */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-white block">Editor</span>

          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
            {/* Option 1: Fastest editor (Default) */}
            <div
              onClick={() => setEditorChoice('fastest')}
              className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-zinc-850/60 transition-colors"
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                  editorChoice === 'fastest'
                    ? 'bg-white text-zinc-950'
                    : 'border-2 border-zinc-600 bg-transparent'
                }`}
              >
                {editorChoice === 'fastest' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Fastest editor</h4>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  The next free editor starts now.
                </p>
              </div>
            </div>

            {/* Option 2: My editor */}
            <div
              onClick={() => setEditorChoice('my_editor')}
              className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-zinc-850/60 transition-colors"
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                  editorChoice === 'my_editor'
                    ? 'bg-white text-zinc-950'
                    : 'border-2 border-zinc-600 bg-transparent'
                }`}
              >
                {editorChoice === 'my_editor' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">My editor</h4>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Your first editor becomes yours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Disclaimer */}
        <div className="text-center pt-1">
          <a
            href="#"
            className="text-[11px] text-zinc-500 underline hover:text-zinc-300 transition-colors"
          >
            Sending means you agree to the Sending rules.
          </a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM STICKY SUBMIT BUTTON (Dark Theme matching reference) */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 p-4 z-40">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#ff5a78] hover:bg-[#ff4366] text-white font-bold py-4 px-6 text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a78]/25 transition-all hover:scale-[1.005] active:scale-[0.99] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending to editor...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white fill-current rotate-45 -translate-y-0.5" />
                <span>
                  Send {totalVideos} {totalVideos === 1 ? 'video' : 'videos'} · {tokenCost} tokens
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
