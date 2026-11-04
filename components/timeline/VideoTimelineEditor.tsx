'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { signIn } from 'next-auth/react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Undo2, 
  Redo2, 
  Trash2, 
  RotateCcw, 
  Download, 
  UploadCloud, 
  Volume2, 
  Sparkles,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Clock,
  Share2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';

export interface TimelineClip {
  id: string;
  name: string;
  start: number; // in seconds
  end: number;   // in seconds
  color: string;
  thumbnail: string;
  subtitles?: string;
}

const INITIAL_CLIPS: TimelineClip[] = [
  {
    id: 'clip_hook_1',
    name: '01_Viral_Hook.mp4',
    start: 0,
    end: 3.5,
    color: 'from-cyan-600 to-blue-600',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
    subtitles: 'Das ist das Geheimnis für virale Videos!',
  },
  {
    id: 'clip_main_2',
    name: '02_Problem_Statement.mp4',
    start: 3.5,
    end: 9.8,
    color: 'from-indigo-600 to-violet-600',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    subtitles: 'Niemand hat Zeit für stundenlangen Schnitt...',
  },
  {
    id: 'clip_broll_3',
    name: '03_AI_Solution_Demo.mp4',
    start: 9.8,
    end: 16.2,
    color: 'from-violet-600 to-fuchsia-600',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    subtitles: 'Mit ClipViral AI schneidest du automatisch mit einem Klick.',
  },
  {
    id: 'clip_cta_4',
    name: '04_Call_To_Action.mp4',
    start: 16.2,
    end: 22.0,
    color: 'from-emerald-600 to-teal-600',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
    subtitles: 'Jetzt kostenlos testen und viral gehen!',
  },
];

export interface VideoTimelineEditorProps {
  onOpenUpload?: () => void;
}

export function VideoTimelineEditor({ onOpenUpload }: VideoTimelineEditorProps = {}) {
  const { locale, dict } = useLanguage();

  // Timeline & State
  const [clips, setClips] = useState<TimelineClip[]>(INITIAL_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string>(INITIAL_CLIPS[0].id);
  const [currentTime, setCurrentTime] = useState<number>(2.4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Social Media Publishing State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [socialCaption, setSocialCaption] = useState(
    'Das Geheimnis für 10x mehr Views 🚀 Geschnitten mit @ClipViralAI #viral #shorts #reels #ai'
  );
  const [connectedAccounts, setConnectedAccounts] = useState<{ tiktok: boolean; instagram: boolean }>({
    tiktok: false,
    instagram: false,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ postUrl: string; message: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);

  const totalDuration = clips.reduce((max, c) => Math.max(max, c.end), 22);
  const selectedClip = clips.find((c) => c.id === selectedClipId);

  // Helper for notification toast
  const notify = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Fetch connected social accounts status
  const fetchSocialConnections = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/social/publish`);
      const data = await res.json();
      if (data.connected) {
        setConnectedAccounts(data.connected);
      }
    } catch (e) {
      console.warn('Failed to fetch social accounts status:', e);
    }
  };

  useEffect(() => {
    fetchSocialConnections();
  }, []);

  // Simulate 1-click account connection for demo
  const handleSimulateConnect = async (platform: 'tiktok' | 'instagram') => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/social/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          simulateConnect: true,
        }),
      });
      const data = await res.json();
      if (data.connected) {
        setConnectedAccounts((prev) => ({ ...prev, [platform]: true }));
        setPublishError(null);
        notify(
          locale === 'de'
            ? `${platform.toUpperCase()} erfolgreich verbunden!`
            : `${platform.toUpperCase()} connected successfully!`
        );
      }
    } catch (e) {
      console.error('Connect failed:', e);
    }
  };

  // Trigger publishing to TikTok / Instagram
  const handlePublishToSocial = async () => {
    setIsPublishing(true);
    setPublishError(null);
    setPublishResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/social/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          videoUrl: `https://cdn.clipviral.ai/renders/render_${Date.now()}/master.mp4`,
          caption: socialCaption,
          projectId: `proj_${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error === 'ACCOUNT_NOT_CONNECTED') {
          setConnectedAccounts((prev) => ({ ...prev, [selectedPlatform]: false }));
        }
        throw new Error(data.message || data.error || 'Failed to publish video');
      }

      setPublishResult({
        postUrl: data.postUrl,
        message: data.message,
      });
      notify(
        locale === 'de'
          ? `Erfolgreich auf ${selectedPlatform.toUpperCase()} geteilt!`
          : `Successfully posted to ${selectedPlatform.toUpperCase()}!`
      );
    } catch (err: any) {
      setPublishError(err.message || 'Publishing error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Push new state with undo capability
  const updateClipsWithHistory = (newClips: TimelineClip[], actionDesc: string) => {
    setUndoStack((prev) => [...prev, clips]);
    setRedoStack([]);
    setClips(newClips);
    notify(actionDesc);
  };

  // Action: Split Clip at Playhead
  const handleSplitClip = () => {
    const targetClipIndex = clips.findIndex(
      (c) => currentTime > c.start && currentTime < c.end
    );

    if (targetClipIndex === -1) {
      notify(locale === 'de' ? 'Playhead muss sich innerhalb eines Clips befinden!' : 'Playhead must be inside a clip to split!');
      return;
    }

    const target = clips[targetClipIndex];
    const firstHalf: TimelineClip = {
      ...target,
      id: `${target.id}_part1`,
      name: `${target.name.replace('.mp4', '')}_A.mp4`,
      end: currentTime,
    };

    const secondHalf: TimelineClip = {
      ...target,
      id: `${target.id}_part2`,
      name: `${target.name.replace('.mp4', '')}_B.mp4`,
      start: currentTime,
    };

    const nextClips = [...clips];
    nextClips.splice(targetClipIndex, 1, firstHalf, secondHalf);
    setSelectedClipId(secondHalf.id);
    updateClipsWithHistory(
      nextClips,
      locale === 'de' ? `Schnitt bei ${currentTime.toFixed(1)}s durchgeführt` : `Split cut at ${currentTime.toFixed(1)}s`
    );
  };

  // Action: Manual Trim Start of Selected Clip
  const handleTrimStart = (newStart: number) => {
    if (!selectedClip) return;
    if (newStart >= selectedClip.end - 0.5) return;

    const nextClips = clips.map((c) =>
      c.id === selectedClipId ? { ...c, start: Math.max(0, newStart) } : c
    );
    updateClipsWithHistory(
      nextClips,
      locale === 'de' ? `Clip-Anfang auf ${newStart.toFixed(1)}s getrimmt` : `Trimmed start to ${newStart.toFixed(1)}s`
    );
  };

  // Action: Manual Trim End of Selected Clip
  const handleTrimEnd = (newEnd: number) => {
    if (!selectedClip) return;
    if (newEnd <= selectedClip.start + 0.5) return;

    const nextClips = clips.map((c) =>
      c.id === selectedClipId ? { ...c, end: newEnd } : c
    );
    updateClipsWithHistory(
      nextClips,
      locale === 'de' ? `Clip-Ende auf ${newEnd.toFixed(1)}s getrimmt` : `Trimmed end to ${newEnd.toFixed(1)}s`
    );
  };

  // Action: Delete Selected Clip
  const handleDeleteClip = () => {
    if (!selectedClip || clips.length <= 1) {
      notify(locale === 'de' ? 'Mindestens ein Clip muss in der Timeline verbleiben' : 'At least one clip must remain in timeline');
      return;
    }

    const nextClips = clips.filter((c) => c.id !== selectedClipId);
    setSelectedClipId(nextClips[0].id);
    updateClipsWithHistory(
      nextClips,
      locale === 'de' ? `Clip gelöscht` : `Clip deleted`
    );
  };

  // Action: Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, clips]);
    setClips(previousState);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    notify(locale === 'de' ? 'Aktion rückgängig gemacht (Undo)' : 'Action undone (Undo)');
  }, [undoStack, clips, locale]);

  // Action: Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, clips]);
    setClips(nextState);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    notify(locale === 'de' ? 'Aktion wiederholt (Redo)' : 'Action redone (Redo)');
  }, [redoStack, clips, locale]);

  // Action: Reset Timeline
  const handleResetTimeline = () => {
    updateClipsWithHistory(
      INITIAL_CLIPS,
      locale === 'de' ? 'Timeline auf Standard zurückgesetzt' : 'Timeline reset to initial clips'
    );
    setSelectedClipId(INITIAL_CLIPS[0].id);
    setCurrentTime(0);
  };

  // Keyboard Shortcuts (Space for Play/Pause, S for Split, Ctrl+Z for Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSplitClip();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSplitClip, handleUndo, handleRedo]);

  // Playhead simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Format mm:ss:ms
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full space-y-5">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scissors className="h-6 w-6 text-cyan-400" />
            {dict.timeline.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{dict.timeline.subtitle}</p>
        </div>

        {/* Global Action Triggers: Upload, Social Media Post & Export */}
        <div className="flex items-center gap-2.5">
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-sm"
              title="Add or upload more video clips"
            >
              <UploadCloud className="h-4 w-4 text-cyan-400" />
              <span>{locale === 'de' ? '+ Clips hochladen' : '+ Upload Clips'}</span>
            </button>
          )}

          {/* Post to TikTok / Instagram Button */}
          <button
            onClick={() => {
              fetchSocialConnections();
              setPublishResult(null);
              setPublishError(null);
              setSocialModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-pink-500/40 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 hover:border-pink-500/70 hover:bg-pink-500/20 transition-all shadow-lg shadow-pink-500/10"
          >
            <Share2 className="h-4 w-4 text-pink-400" />
            <span>Post to TikTok / Reels</span>
          </button>

          {/* Export MP4 Button */}
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-4 w-4" />
            {dict.timeline.exportVideo}
          </button>
        </div>
      </div>

      {/* Main Workspace (Preview + Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Player Preview (9:16 vertical TikTok/Reel frame with controls) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 md:p-6 shadow-xl relative overflow-hidden">
          <div className="relative aspect-[9/16] w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl flex flex-col justify-between p-4">
            {selectedClip && (
              <img
                src={selectedClip.thumbnail}
                alt="Active Frame"
                className="absolute inset-0 h-full w-full object-cover opacity-60 filter brightness-90"
              />
            )}

            {/* Top Overlay: Resolution & Clip Name */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
                1080 × 1920 (9:16)
              </span>
              <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-zinc-300 truncate max-w-[140px]">
                {selectedClip?.name}
              </span>
            </div>

            {/* Center: Live Dynamic Subtitle Badge Overlay */}
            <div className="relative z-10 my-auto text-center px-2">
              <div className="inline-block rounded-xl bg-black/80 backdrop-blur-md px-4 py-2 border border-violet-500/40 shadow-xl">
                <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-300 bg-clip-text text-sm sm:text-base font-extrabold text-transparent uppercase tracking-wide">
                  {selectedClip?.subtitles || 'ClipViral AI Cut Engine'}
                </span>
              </div>
            </div>

            {/* Bottom Overlay: Timecode */}
            <div className="relative z-10 flex items-center justify-between text-white text-[11px] font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span className="text-cyan-400 font-bold">{formatTimecode(currentTime)}</span>
              <span className="text-zinc-500">/</span>
              <span className="text-zinc-400">{formatTimecode(totalDuration)}</span>
            </div>
          </div>

          {/* Player Transport Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800"
              title="-1s"
            >
              -1s
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-zinc-950 font-bold hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-transform active:scale-95"
              aria-label={isPlaying ? dict.timeline.pause : dict.timeline.play}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 1))}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800"
              title="+1s"
            >
              +1s
            </button>
          </div>
        </div>

        {/* Right: Manual Trim Sliders & Selected Clip Inspector */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                {dict.timeline.selectedClip}
              </h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                {clips.length} {dict.timeline.cutsCount}
              </span>
            </div>

            {selectedClip ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-zinc-900/60 p-3 border border-zinc-800 space-y-1">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{selectedClip.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {formatTimecode(selectedClip.start)} - {formatTimecode(selectedClip.end)} ({(selectedClip.end - selectedClip.start).toFixed(1)}s)
                  </p>
                </div>

                {/* Manual Trim Start Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{dict.timeline.trimStart}:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{selectedClip.start.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={selectedClip.end - 0.5}
                    step={0.1}
                    value={selectedClip.start}
                    onChange={(e) => handleTrimStart(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Manual Trim End Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{dict.timeline.trimEnd}:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{selectedClip.end.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={selectedClip.start + 0.5}
                    max={totalDuration}
                    step={0.1}
                    value={selectedClip.end}
                    onChange={(e) => handleTrimEnd(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Subtitle / Whisper Preview Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">KI-Transkription / Untertitel</label>
                  <textarea
                    rows={2}
                    value={selectedClip.subtitles || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClips((prev) =>
                        prev.map((c) => (c.id === selectedClipId ? { ...c, subtitles: val } : c))
                      );
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs text-zinc-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Klicke auf einen Clip in der Timeline unten</p>
            )}
          </div>

          {/* Quick Clip Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
            <button
              onClick={handleDeleteClip}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {dict.timeline.deleteSelected}
            </button>

            <button
              onClick={handleResetTimeline}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {dict.timeline.resetTimeline}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-zinc-950 px-4 py-2.5 text-xs font-medium text-cyan-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* TIMELINE CONTROLS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSplitClip}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
            title="Split Cut at Playhead (Taste S)"
          >
            <Scissors className="h-3.5 w-3.5" />
            {dict.timeline.split} (S)
          </button>

          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
            title="Undo (Strg+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{dict.timeline.undo}</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
            title="Redo (Strg+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{dict.timeline.redo}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-400">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>{dict.timeline.shortcuts}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title={dict.timeline.zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-mono text-zinc-400 w-8 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title={dict.timeline.zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MULTITRACK TIMELINE TRACKS AREA */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl overflow-x-auto select-none">
        <div style={{ minWidth: `${Math.max(700, 700 * zoomLevel)}px` }} className="relative space-y-3">
          <div className="relative h-6 border-b border-zinc-800 flex items-end pb-1 text-[10px] font-mono text-zinc-500">
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => {
              const leftPercent = (sec / totalDuration) * 100;
              return (
                <div
                  key={sec}
                  className="absolute"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="h-2 w-px bg-zinc-700" />
                  {sec % 5 === 0 && <span className="-ml-2 mt-0.5 block">{sec}s</span>}
                </div>
              );
            })}
          </div>

          <div
            className="absolute top-0 bottom-0 z-30 w-0.5 bg-rose-500 pointer-events-none transition-all duration-75"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-2.5 h-5 w-5 bg-rose-500 rounded-sm shadow-md flex items-center justify-center text-[8px] font-bold text-white">
              ▼
            </div>
          </div>

          {/* Track 1: Video Track */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="h-3 w-3 text-cyan-400" />
              {dict.timeline.trackVideo}
            </span>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                setCurrentTime(ratio * totalDuration);
              }}
              className="relative h-20 w-full rounded-xl bg-zinc-900 border border-zinc-800/80 p-1 flex overflow-hidden cursor-pointer"
            >
              {clips.map((clip) => {
                const clipLength = clip.end - clip.start;
                const widthPercent = (clipLength / totalDuration) * 100;
                const isSelected = clip.id === selectedClipId;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(clip.id);
                      setCurrentTime(clip.start);
                    }}
                    style={{ width: `${widthPercent}%` }}
                    className={`relative h-full rounded-lg border-2 p-1.5 flex flex-col justify-between transition-all group overflow-hidden ${
                      isSelected
                        ? 'border-cyan-400 bg-gradient-to-r ' + clip.color + ' shadow-lg shadow-cyan-500/20'
                        : 'border-zinc-800 bg-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white font-medium z-10 truncate">
                      <span className="truncate">{clip.name}</span>
                      <span className="font-mono text-[9px] opacity-80 shrink-0">
                        {clipLength.toFixed(1)}s
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-[9px] text-zinc-300 z-10 font-mono">
                      <span>{clip.start.toFixed(1)}s</span>
                      <span>{clip.end.toFixed(1)}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Audio & Subtitles Track */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="h-3 w-3 text-violet-400" />
              {dict.timeline.trackAudio} (Whisper AI)
            </span>

            <div className="relative h-12 w-full rounded-xl bg-zinc-900 border border-zinc-800/80 p-1 flex gap-1 overflow-hidden">
              {clips.map((clip) => {
                const clipLength = clip.end - clip.start;
                const widthPercent = (clipLength / totalDuration) * 100;
                return (
                  <div
                    key={`audio_${clip.id}`}
                    style={{ width: `${widthPercent}%` }}
                    className="h-full rounded-md bg-violet-950/50 border border-violet-500/30 p-1.5 flex items-center overflow-hidden"
                  >
                    <p className="text-[10px] text-violet-200 truncate italic">
                      "{clip.subtitles || 'Audio segment'}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Publishing Modal (TikTok & Instagram Reels) */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-md">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post to Social Media</h3>
                  <p className="text-xs text-zinc-400">Direkt auf TikTok & Instagram Reels teilen</p>
                </div>
              </div>
              <button
                onClick={() => setSocialModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              {/* TikTok Tab */}
              <button
                onClick={() => {
                  setSelectedPlatform('tiktok');
                  setPublishResult(null);
                  setPublishError(null);
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  selectedPlatform === 'tiktok'
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-black text-xs border border-zinc-700">
                    TT
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">TikTok</p>
                    <span className="text-[10px] text-zinc-400">Video Post API</span>
                  </div>
                </div>
                {connectedAccounts.tiktok ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Verbunden
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                    Nicht verbunden
                  </span>
                )}
              </button>

              {/* Instagram Reels Tab */}
              <button
                onClick={() => {
                  setSelectedPlatform('instagram');
                  setPublishResult(null);
                  setPublishError(null);
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  selectedPlatform === 'instagram'
                    ? 'border-pink-500 bg-pink-950/30 shadow-lg shadow-pink-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white font-bold text-xs">
                    IG
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Instagram</p>
                    <span className="text-[10px] text-zinc-400">Reels Publish API</span>
                  </div>
                </div>
                {connectedAccounts.instagram ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Verbunden
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                    Nicht verbunden
                  </span>
                )}
              </button>
            </div>

            {/* Error Message */}
            {publishError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            {/* Success Message Banner with live link */}
            {publishResult && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{publishResult.message}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-400">Live Post ansehen:</span>
                  <a
                    href={publishResult.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-semibold text-cyan-300 hover:underline"
                  >
                    <span>{publishResult.postUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* CASE 1: Account NOT connected prompt */}
            {!connectedAccounts[selectedPlatform] ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-pink-400">
                  <Share2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {locale === 'de'
                      ? `Verbinde deinen ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} Account`
                      : `Connect your ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} account`}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {locale === 'de'
                      ? `Dein Konto ist noch nicht mit ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} verknüpft. Melde dich an, um Videos mit einem Klick zu veröffentlichen.`
                      : `Your account is not connected to ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} yet. Authorize now to publish videos directly.`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                  <button
                    onClick={() => signIn(selectedPlatform, { callbackUrl: `/${locale}/editor` })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95"
                  >
                    <span>
                      {locale === 'de'
                        ? `Mit ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'} anmelden`
                        : `Sign in with ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}`}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSimulateConnect(selectedPlatform)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    <span>1-Click Test Connect</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CASE 2: Account IS connected -> Post Form */
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-zinc-200">
                      @{selectedPlatform === 'tiktok' ? 'creator_tiktok' : 'creator_insta'} (Aktiv)
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">OAuth 2.0 Token Gültig</span>
                </div>

                {/* Caption Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-medium text-zinc-300">Video-Beschreibung & Hashtags</label>
                    <span className="text-zinc-500 text-[10px]">{socialCaption.length} Zeichen</span>
                  </div>
                  <textarea
                    rows={3}
                    value={socialCaption}
                    onChange={(e) => setSocialCaption(e.target.value)}
                    placeholder="Schreibe deine virale Caption..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                  />
                  {/* Suggested Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['#viral', '#shorts', '#clipviral', '#reels', '#fy'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!socialCaption.includes(tag)) {
                            setSocialCaption((prev) => `${prev} ${tag}`);
                          }
                        }}
                        className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-cyan-300 hover:border-zinc-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Info Preview */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">Format:</span>
                    <span>1080 × 1920 MP4 (9:16 Vertical)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-violet-400">Dauer:</span>
                    <span>{totalDuration.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Publish CTA Button */}
                <button
                  onClick={handlePublishToSocial}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {locale === 'de'
                          ? `Veröffentliche auf ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}...`
                          : `Publishing to ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}...`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>
                        {locale === 'de'
                          ? `Jetzt auf ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram Reels'} posten`
                          : `Publish to ${selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram Reels'} Now`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Ready Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                {dict.timeline.exportVideo}
              </h3>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              {locale === 'de'
                ? `Dein Projekt (${clips.length} Schnitte, ${totalDuration.toFixed(1)}s) wird über FFmpeg auf GPU-Knoten gerendert.`
                : `Your project (${clips.length} cuts, ${totalDuration.toFixed(1)}s) is being rendered via FFmpeg on cloud GPU nodes.`}
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Auflösung / Format:</span>
                <span className="font-semibold text-cyan-400">1080 × 1920 MP4 (9:16)</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Untertitel:</span>
                <span className="font-semibold text-violet-400">Eingebettet (Whisper {locale.toUpperCase()})</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Audio:</span>
                <span className="font-semibold text-emerald-400">Silence Trimming & Anti-Click Fades Aktiv</span>
              </div>
            </div>

            <button
              onClick={() => {
                setExportModalOpen(false);
                notify(locale === 'de' ? 'Video-Export erfolgreich gestartet!' : 'Video export triggered successfully!');
              }}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 py-2.5 text-xs font-semibold text-zinc-950 hover:opacity-95 transition-all"
            >
              {locale === 'de' ? 'Rendering jetzt starten' : 'Start Cloud Rendering Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
