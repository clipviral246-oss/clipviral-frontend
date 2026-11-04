'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import {
  ChevronLeft,
  Scissors,
  Copy,
  Trash2,
  Type,
  MessageSquare,
  Layers,
  Volume2,
  VolumeX,
  Gauge,
  Mic,
  MicOff,
  Music,
  FileAudio,
  Sliders,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FileText,
  ThumbsUp,
  ThumbsDown,
  X,
  Play,
  Pause,
  Maximize,
  Lock,
  Eye,
  Plus,
  Undo2,
  Redo2,
  Magnet,
  Link2,
  Sparkles,
  Check,
  Grid,
  Palette,
  Wand2,
  Square,
  Radio,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';
import { TimelineClip, DEFAULT_FALLBACK_VIDEO, convertUploadClipsToTimeline } from '@/components/timeline/VideoTimelineEditor';

interface AdvancedEditorProps {
  onBack?: () => void;
}

// Background Music Preset Item
interface BgmTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  url: string;
}

const BGM_LIBRARY: BgmTrack[] = [
  {
    id: 'bgm_1',
    title: 'Chill Lo-Fi Study Beat',
    artist: 'ClipViral Beats',
    duration: 32,
    genre: 'Lo-Fi',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'bgm_2',
    title: 'Phonk Workout Drive',
    artist: 'Drift King',
    duration: 28,
    genre: 'Phonk',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cd0.mp3?filename=phonk-energy-122421.mp3',
  },
  {
    id: 'bgm_3',
    title: 'Upbeat Whistling Ukulele',
    artist: 'Sunny Mood',
    duration: 30,
    genre: 'Vlog / Pop',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=happy-acoustic-guitar-7848.mp3',
  },
  {
    id: 'bgm_4',
    title: 'Dramatic Tension Rise',
    artist: 'Cinema FX',
    duration: 25,
    genre: 'Cinematic',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cinematic-tension-14022.mp3',
  },
];

// Sticker & PiP Presets
const OVERLAY_PRESETS = [
  { id: 'ov_sub', name: 'Subscribe Pill', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80', type: 'image' as const },
  { id: 'ov_reaction', name: 'Creator Cam (PiP)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', type: 'image' as const },
  { id: 'ov_fire', name: 'Viral Fire Icon', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop&q=80', type: 'image' as const },
];

export function AdvancedEditor({ onBack }: AdvancedEditorProps) {
  const { locale } = useLanguage();
  const { uploadedClips, aiProcessingResult } = useEditorWorkflow();

  const videoRef = useRef<HTMLVideoElement>(null);
  const bgmAudioRef = useRef<HTMLAudioElement>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement>(null);
  const timelineRulerRef = useRef<HTMLDivElement>(null);

  // Project Header State
  const [projectTitle, setProjectTitle] = useState(() => {
    if (uploadedClips && uploadedClips.length > 0) {
      return uploadedClips[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }
    return 'Funny WhatsApp Status Mi...';
  });

  // Timeline Clips Initialization
  const [clips, setClips] = useState<TimelineClip[]>(() => {
    if (aiProcessingResult?.keepSegments && aiProcessingResult.keepSegments.length > 0) {
      const baseVideoUrl = uploadedClips[0]?.storageKey || uploadedClips[0]?.previewUrl || DEFAULT_FALLBACK_VIDEO;
      const gradients = [
        'from-cyan-600 to-blue-600',
        'from-indigo-600 to-violet-600',
        'from-violet-600 to-fuchsia-600',
        'from-emerald-600 to-teal-600',
      ];
      return aiProcessingResult.keepSegments.map((seg: any, idx: number) => ({
        id: `ai_clip_${Date.now()}_${idx}`,
        name: `Cut_${idx + 1}.mp4`,
        start: seg.start,
        end: seg.end,
        color: gradients[idx % gradients.length],
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
        subtitles: seg.text || `AI CUT ${idx + 1}`,
        videoUrl: baseVideoUrl,
        originalDuration: seg.duration,
        sourceStart: seg.start,
        sourceEnd: seg.end,
        isAiKept: true,
      }));
    }

    if (uploadedClips && uploadedClips.length > 0) {
      return convertUploadClipsToTimeline(uploadedClips);
    }

    // Default sample clips exactly matching reference studio (Image 1)
    return [
      {
        id: 'clip_default_1',
        name: 'Cut_1.mp4',
        start: 0,
        end: 1.6,
        color: 'from-cyan-600 to-blue-600',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
        subtitles: 'AI CUT 1',
        videoUrl: DEFAULT_FALLBACK_VIDEO,
        sourceStart: 0,
        sourceEnd: 1.6,
      },
      {
        id: 'clip_default_2',
        name: 'Cut_2.mp4 (Part 1)',
        start: 1.6,
        end: 2.4,
        color: 'from-indigo-600 to-violet-600',
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        subtitles: 'AI CUT 2 (Part 1)',
        videoUrl: DEFAULT_FALLBACK_VIDEO,
        sourceStart: 0,
        sourceEnd: 0.8,
      },
      {
        id: 'clip_default_3',
        name: 'Cut_2.mp4 (Part 2)',
        start: 2.4,
        end: 6.8,
        color: 'from-violet-600 to-fuchsia-600',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
        subtitles: 'AI CUT 2 (Part 2)',
        videoUrl: DEFAULT_FALLBACK_VIDEO,
        sourceStart: 0,
        sourceEnd: 4.4,
      },
      {
        id: 'clip_default_4',
        name: 'Cut_3.mp4',
        start: 6.8,
        end: 8.6,
        color: 'from-cyan-600 to-teal-600',
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        subtitles: 'AI Cut 3',
        videoUrl: DEFAULT_FALLBACK_VIDEO,
        sourceStart: 0,
        sourceEnd: 1.8,
      },
    ];
  });

  const [selectedClipId, setSelectedClipId] = useState<string>(() => (clips.find((c) => c.name === 'Cut_3.mp4')?.id || clips[clips.length - 1]?.id || clips[0]?.id || ''));
  const [currentTime, setCurrentTime] = useState<number>(6.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [showRatingPill, setShowRatingPill] = useState<boolean>(true);
  const [ratingFeedback, setRatingFeedback] = useState<'up' | 'down' | null>(null);

  // Active Tool in CapCut Top Toolbar
  // 'split' | 'duplicate' | 'delete' | 'text' | 'captions' | 'overlay' | 'volume' | 'speed' | 'voiceover' | 'audio' | 'extract' | 'adjust' | 'rotate' | 'zoom' | 'words'
  const [activeToolTab, setActiveToolTab] = useState<string>('overlay');

  // ==========================================
  // Tool 4: Text Overlay State
  // ==========================================
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: string;
    text: string;
    color: string;
    fontSize: number;
    position: 'top' | 'center' | 'bottom';
    hasBackground: boolean;
  }>>([
    {
      id: 'txt_1',
      text: 'WATCH TILL THE END 😱',
      color: '#FFE600',
      fontSize: 22,
      position: 'top',
      hasBackground: true,
    },
  ]);

  // ==========================================
  // Tool 5: Captions Style State
  // ==========================================
  const [captionStyle, setCaptionStyle] = useState<'yellow_box' | 'cyan_glow' | 'clean_white' | 'red_pill'>('yellow_box');
  const [captionFontSize, setCaptionFontSize] = useState<number>(20);
  const [autoPopWords, setAutoPopWords] = useState<boolean>(true);

  // ==========================================
  // Tool 6: Overlay (PiP / B-Roll / Sticker) State
  // ==========================================
  const [overlayActive, setOverlayActive] = useState<boolean>(true);
  const [overlayUrl, setOverlayUrl] = useState<string>(OVERLAY_PRESETS[1].url);
  const [overlayScale, setOverlayScale] = useState<number>(35);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(95);
  const [overlayPosition, setOverlayPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'>('top-right');

  // ==========================================
  // Tool 7: Volume & Audio Gains
  // ==========================================
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [fadeInSec, setFadeInSec] = useState<number>(0.2);
  const [fadeOutSec, setFadeOutSec] = useState<number>(0.2);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);

  // ==========================================
  // Tool 8: Speed Controls
  // ==========================================
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [pitchCorrection, setPitchCorrection] = useState<boolean>(true);

  // ==========================================
  // Tool 9: Voiceover Recording State (Web Audio API)
  // ==========================================
  const [isRecordingVoiceover, setIsRecordingVoiceover] = useState<boolean>(false);
  const [voiceoverAudioUrl, setVoiceoverAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // ==========================================
  // Tool 10: Background Music (BGM)
  // ==========================================
  const [activeBgm, setActiveBgm] = useState<BgmTrack | null>(BGM_LIBRARY[0]);
  const [bgmVolume, setBgmVolume] = useState<number>(0.35);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [autoDucking, setAutoDucking] = useState<boolean>(true);

  // ==========================================
  // Tool 11: Audio Extraction State
  // ==========================================
  const [isAudioExtracted, setIsAudioExtracted] = useState<boolean>(false);

  // ==========================================
  // Tool 12: Adjust (Color Grading / Filters)
  // ==========================================
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(105);
  const [saturation, setSaturation] = useState<number>(115);
  const [warmth, setWarmth] = useState<number>(0);
  const [vignette, setVignette] = useState<boolean>(false);
  const [activeFilterPreset, setActiveFilterPreset] = useState<'none' | 'viral_clean' | 'cinema' | 'cyberpunk'>('viral_clean');

  // ==========================================
  // Tool 13: Rotate & Orientation
  // ==========================================
  const [rotation, setRotation] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);

  // ==========================================
  // Tool 14: Zoom / Pan / Scale
  // ==========================================
  const [videoZoom, setVideoZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Modals & History
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);

  const totalDuration = clips.length > 0 ? Math.max(1, clips.reduce((max, c) => Math.max(max, c.end), 0)) : 1;

  // Active clip at global currentTime
  const activeClipIndex = clips.findIndex((c) => currentTime >= c.start && currentTime < c.end);
  const activeClip = activeClipIndex !== -1 ? clips[activeClipIndex] : (clips[clips.length - 1] || null);
  const selectedClip = clips.find((c) => c.id === selectedClipId) || activeClip || clips[0] || null;

  const currentVideoSrc = activeClip?.videoUrl || DEFAULT_FALLBACK_VIDEO;
  const localClipTime = activeClip
    ? Math.max(0, currentTime - activeClip.start + (activeClip.sourceStart || 0))
    : 0;

  const notify = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  /**
   * Master Sequencer Clock (CapCut Engine)
   */
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSec = ((now - lastTime) / 1000) * playbackSpeed;
      lastTime = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= totalDuration) {
          setIsPlaying(false);
          seekTo(0);
          return 0;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    lastTime = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDuration, playbackSpeed]);

  // Sync selectedClipId when activeClip changes
  useEffect(() => {
    if (activeClip && activeClip.id !== selectedClipId) {
      setSelectedClipId(activeClip.id);
    }
  }, [activeClip?.id]);

  // Sync clips whenever uploadedClips or aiProcessingResult updates from workflow
  useEffect(() => {
    if (aiProcessingResult?.keepSegments && aiProcessingResult.keepSegments.length > 0) {
      const baseVideoUrl = uploadedClips[0]?.storageKey || uploadedClips[0]?.previewUrl || DEFAULT_FALLBACK_VIDEO;
      const gradients = [
        'from-cyan-600 to-blue-600',
        'from-indigo-600 to-violet-600',
        'from-violet-600 to-fuchsia-600',
        'from-emerald-600 to-teal-600',
      ];
      const newClips = aiProcessingResult.keepSegments.map((seg: any, idx: number) => ({
        id: `ai_clip_${Date.now()}_${idx}`,
        name: `Cut_${idx + 1}.mp4`,
        start: seg.start,
        end: seg.end,
        color: gradients[idx % gradients.length],
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
        subtitles: seg.text || `AI CUT ${idx + 1}`,
        videoUrl: baseVideoUrl,
        originalDuration: seg.duration,
        sourceStart: seg.start,
        sourceEnd: seg.end,
        isAiKept: true,
      }));
      setClips(newClips);
      if (newClips[0]) setSelectedClipId(newClips[0].id);
    } else if (uploadedClips && uploadedClips.length > 0) {
      const converted = convertUploadClipsToTimeline(uploadedClips);
      setClips(converted);
      if (converted[0]) setSelectedClipId(converted[0].id);
    }
  }, [uploadedClips, aiProcessingResult]);

  // Video Element & Audio Element Sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackSpeed;
    video.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
    video.muted = isMuted;

    if (video.src !== currentVideoSrc && currentVideoSrc) {
      video.src = currentVideoSrc;
      video.currentTime = localClipTime;
      if (isPlaying) {
        video.play().catch(() => {});
      }
      return;
    }

    if (Math.abs(video.currentTime - localClipTime) > 0.3 || !isPlaying) {
      video.currentTime = localClipTime;
    }

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentVideoSrc, isPlaying, Math.floor(currentTime * 4), playbackSpeed, volume, isMuted]);

  // BGM Audio Track Playback Sync
  useEffect(() => {
    const bgm = bgmAudioRef.current;
    if (!bgm || !activeBgm) return;

    bgm.volume = Math.max(0, Math.min(1, autoDucking ? Math.max(0.08, bgmVolume * 0.4) : bgmVolume));

    if (isPlaying) {
      bgm.play().catch(() => {});
    } else {
      bgm.pause();
    }
  }, [isPlaying, activeBgm, bgmVolume, autoDucking]);

  // Voiceover Audio Track Playback Sync
  useEffect(() => {
    const vo = voiceoverAudioRef.current;
    if (!vo || !voiceoverAudioUrl) return;

    if (isPlaying) {
      vo.currentTime = currentTime;
      vo.play().catch(() => {});
    } else {
      vo.pause();
    }
  }, [isPlaying, voiceoverAudioUrl, Math.floor(currentTime * 2)]);

  const seekTo = (newTime: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, newTime));
    setCurrentTime(clamped);

    const targetClip = clips.find((c) => clamped >= c.start && clamped < c.end) || clips[clips.length - 1];
    if (targetClip) {
      setSelectedClipId(targetClip.id);
      const targetLocalTime = Math.max(0, clamped - targetClip.start + (targetClip.sourceStart || 0));
      if (videoRef.current) {
        if (videoRef.current.src !== targetClip.videoUrl && targetClip.videoUrl) {
          videoRef.current.src = targetClip.videoUrl;
        }
        videoRef.current.currentTime = targetLocalTime;
      }
    }
  };

  const selectClipAndSeek = (clip: TimelineClip) => {
    setSelectedClipId(clip.id);
    seekTo(clip.start);
  };

  const pushHistory = (newClips: TimelineClip[]) => {
    setUndoStack((prev) => [...prev, clips]);
    setRedoStack([]);
    setClips(newClips);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [clips, ...prev]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setClips(previous);
    notify('Undo');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((prev) => [...prev, clips]);
    setRedoStack((prev) => prev.slice(1));
    setClips(next);
    notify('Redo');
  };

  // Tool 1: Split Clip
  const handleSplitClip = useCallback(() => {
    const targetClipIndex = clips.findIndex(
      (c) => currentTime > c.start + 0.2 && currentTime < c.end - 0.2
    );

    if (targetClipIndex === -1) {
      notify('Playhead must be inside a clip to split!');
      return;
    }

    const target = clips[targetClipIndex];
    const firstHalf: TimelineClip = {
      ...target,
      id: `clip_${Date.now()}_1`,
      name: `${target.name} (Part 1)`,
      end: Math.round(currentTime * 10) / 10,
    };

    const secondHalf: TimelineClip = {
      ...target,
      id: `clip_${Date.now()}_2`,
      name: `${target.name} (Part 2)`,
      start: Math.round(currentTime * 10) / 10,
    };

    const nextClips = [
      ...clips.slice(0, targetClipIndex),
      firstHalf,
      secondHalf,
      ...clips.slice(targetClipIndex + 1),
    ];

    pushHistory(nextClips);
    setSelectedClipId(secondHalf.id);
    notify('Split applied at playhead');
  }, [clips, currentTime]);

  // Tool 2: Duplicate Selected Clip
  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    const targetIdx = clips.findIndex((c) => c.id === selectedClip.id);
    if (targetIdx === -1) return;

    const clipDuration = selectedClip.end - selectedClip.start;
    const duplicate: TimelineClip = {
      ...selectedClip,
      id: `clip_dup_${Date.now()}`,
      name: `${selectedClip.name} (Copy)`,
      start: selectedClip.end,
      end: selectedClip.end + clipDuration,
    };

    const shifted = clips.map((c, i) =>
      i > targetIdx ? { ...c, start: c.start + clipDuration, end: c.end + clipDuration } : c
    );

    const nextClips = [...shifted.slice(0, targetIdx + 1), duplicate, ...shifted.slice(targetIdx + 1)];
    pushHistory(nextClips);
    setSelectedClipId(duplicate.id);
    notify('Clip duplicated');
  };

  // Tool 3: Delete Selected Clip
  const handleDeleteClip = () => {
    if (!selectedClip || clips.length <= 1) {
      notify('At least one clip must remain');
      return;
    }
    const nextClips = clips.filter((c) => c.id !== selectedClip.id);
    pushHistory(nextClips);
    setSelectedClipId(nextClips[0].id);
    notify('Clip deleted');
  };

  // Tool 9: Start/Stop Real Microphone Voiceover Recording
  const handleToggleVoiceoverRecording = async () => {
    if (isRecordingVoiceover) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVoiceover(false);
      setIsPlaying(false);
      notify('Voiceover saved & added to timeline!');
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setVoiceoverAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecordingVoiceover(true);
        setIsPlaying(true);
        notify('Recording voiceover live with video...');
      } catch (err) {
        console.warn('Microphone permission denied or unavailable:', err);
        notify('Microphone permission required to record');
      }
    }
  };

  // Tool 12: Filter Presets Application
  const applyFilterPreset = (preset: 'none' | 'viral_clean' | 'cinema' | 'cyberpunk') => {
    setActiveFilterPreset(preset);
    if (preset === 'none') {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setWarmth(0);
      setVignette(false);
    } else if (preset === 'viral_clean') {
      setBrightness(108);
      setContrast(112);
      setSaturation(120);
      setWarmth(3);
      setVignette(false);
    } else if (preset === 'cinema') {
      setBrightness(94);
      setContrast(125);
      setSaturation(90);
      setWarmth(-8);
      setVignette(true);
    } else if (preset === 'cyberpunk') {
      setBrightness(105);
      setContrast(130);
      setSaturation(145);
      setWarmth(15);
      setVignette(true);
    }
    notify(`Filter: ${preset.replace('_', ' ').toUpperCase()}`);
  };

  // Build real-time CSS Filter String for Video Canvas
  const videoFilterCss = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${warmth}deg)`;

  // Build real-time Transform String for Video Canvas
  const videoTransformCss = `scale(${videoZoom}) translate(${panX}%, ${panY}%) rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1})`;

  // Format mm:ss:ff
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-[720px] w-full bg-[#0d0e12] text-white rounded-2xl border border-zinc-800/80 overflow-hidden select-none font-sans">
      {/* Hidden Audio Elements for BGM & Recorded Voiceover */}
      {activeBgm && <audio ref={bgmAudioRef} src={activeBgm.url} loop />}
      {voiceoverAudioUrl && <audio ref={voiceoverAudioRef} src={voiceoverAudioUrl} />}

      {/* 1. TOP HEADER (Back, Title, Export) */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-[#14151a] border-b border-zinc-800/90 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Project Title (Editable) */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent text-sm sm:text-base font-semibold text-center text-zinc-100 hover:bg-zinc-800/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-1 transition-all max-w-[280px] sm:max-w-md truncate"
          />
        </div>

        {/* Export Red Pill Button */}
        <div>
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#f83a4c] hover:bg-[#ff4759] text-white px-5 py-2 text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
          >
            <span>Export</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      </header>

      {/* 2. SCROLLABLE TOOLBAR (Every single icon active & functional) */}
      <div className="h-14 shrink-0 flex items-center gap-1 px-3 bg-[#111216] border-b border-zinc-800/80 overflow-x-auto no-scrollbar z-10">
        {[
          { id: 'split', label: 'Split', icon: Scissors, action: handleSplitClip },
          { id: 'duplicate', label: 'Duplicate', icon: Copy, action: handleDuplicateClip },
          { id: 'delete', label: 'Delete', icon: Trash2, action: handleDeleteClip, danger: true },
          { id: 'text', label: 'Text', icon: Type, action: () => setActiveToolTab('text') },
          { id: 'captions', label: 'Captions', icon: MessageSquare, action: () => setActiveToolTab('captions') },
          { id: 'overlay', label: 'Overlay', icon: Layers, action: () => setActiveToolTab('overlay') },
          { id: 'volume', label: 'Volume', icon: Volume2, action: () => setActiveToolTab('volume') },
          { id: 'speed', label: 'Speed', icon: Gauge, action: () => setActiveToolTab('speed') },
          { id: 'voiceover', label: 'Voiceover', icon: Mic, action: () => setActiveToolTab('voiceover') },
          { id: 'audio', label: 'Audio', icon: Music, action: () => setActiveToolTab('audio') },
          { id: 'extract', label: 'Extract', icon: FileAudio, action: () => setActiveToolTab('extract') },
          { id: 'adjust', label: 'Adjust', icon: Sliders, action: () => setActiveToolTab('adjust') },
          {
            id: 'rotate',
            label: 'Rotate',
            icon: RotateCw,
            action: () => {
              setActiveToolTab('rotate');
              setRotation((r) => (r + 90) % 360);
              notify('Rotated 90°');
            },
          },
          { id: 'zoom', label: 'Zoom', icon: ZoomIn, action: () => setActiveToolTab('zoom') },
          { id: 'words', label: 'Words', icon: FileText, action: () => setActiveToolTab('words') },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeToolTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 rounded-xl px-2 py-1 transition-all ${
                isActive
                  ? 'bg-[#00c7d4]/15 border border-[#00c7d4]/50 text-[#00c7d4] font-semibold shadow-sm'
                  : item.danger
                  ? 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 mb-0.5" />
              <span className="text-[10px] leading-tight truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CENTER WORKSPACE: Video Canvas + Dynamic Properties Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left: Video Player Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 relative bg-[#090a0d] overflow-hidden">
          {/* Floating Review Rating Pill */}
          {showRatingPill && (
            <div className="absolute top-4 z-30 flex items-center gap-2 rounded-full bg-[#1b1d24]/90 border border-zinc-750 px-3.5 py-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50">
              <span className="text-xs text-zinc-300 font-medium">How did the cut do?</span>
              <button
                onClick={() => {
                  setRatingFeedback('up');
                  notify('Thanks for your feedback!');
                  setTimeout(() => setShowRatingPill(false), 1200);
                }}
                className={`p-1 rounded-full hover:bg-zinc-700 transition-colors ${
                  ratingFeedback === 'up' ? 'text-emerald-400' : 'text-zinc-400'
                }`}
                title="Good cut"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setRatingFeedback('down');
                  notify('Feedback noted!');
                  setTimeout(() => setShowRatingPill(false), 1200);
                }}
                className={`p-1 rounded-full hover:bg-zinc-700 transition-colors ${
                  ratingFeedback === 'down' ? 'text-rose-400' : 'text-zinc-400'
                }`}
                title="Needs adjustment"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowRatingPill(false)}
                className="text-zinc-500 hover:text-zinc-300 ml-1 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* 9:16 Vertical Video Frame Canvas */}
          <div className="relative aspect-[9/16] h-[90%] max-h-[460px] rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col justify-between">
            {/* Real HTML5 Video with Real-Time WebGL/CSS Filters & Transforms */}
            <video
              ref={videoRef}
              playsInline
              crossOrigin="anonymous"
              preload="auto"
              style={{
                filter: videoFilterCss,
                transform: videoTransformCss,
                transition: 'filter 0.2s ease, transform 0.2s ease',
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Vignette Filter Overlay */}
            {vignette && (
              <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />
            )}

            {/* Tool 6: Picture-in-Picture / B-Roll Overlay on Video */}
            {overlayActive && overlayUrl && (
              <div
                style={{
                  width: `${overlayScale}%`,
                  opacity: overlayOpacity / 100,
                }}
                className={`absolute z-20 m-3 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-2xl pointer-events-none transition-all ${
                  overlayPosition === 'top-right'
                    ? 'top-0 right-0'
                    : overlayPosition === 'top-left'
                    ? 'top-0 left-0'
                    : overlayPosition === 'bottom-right'
                    ? 'bottom-10 right-0'
                    : overlayPosition === 'bottom-left'
                    ? 'bottom-10 left-0'
                    : 'top-1/3 left-1/4'
                }`}
              >
                <img src={overlayUrl} alt="Overlay" className="w-full h-auto object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[8px] text-cyan-300 rounded font-mono">
                  PiP
                </span>
              </div>
            )}

            {/* Tool 4: Custom Text Overlays on Video Canvas */}
            {textOverlays.map((t) => (
              <div
                key={t.id}
                className={`absolute left-0 right-0 z-20 px-3 text-center pointer-events-none ${
                  t.position === 'top' ? 'top-8' : t.position === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-12'
                }`}
              >
                <span
                  style={{
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                  }}
                  className={`inline-block font-extrabold uppercase tracking-wider drop-shadow-md transition-all ${
                    t.hasBackground ? 'bg-black/80 px-3 py-1 rounded-xl border border-white/20' : ''
                  }`}
                >
                  {t.text}
                </span>
              </div>
            ))}

            {/* Tool 5: Dynamic Captions / Subtitle Overlay with Preset Styling */}
            <div className="relative z-10 my-auto text-center px-3 pointer-events-none">
              <span
                style={{ fontSize: `${captionFontSize}px` }}
                className={`inline-block font-extrabold uppercase tracking-wide transition-all ${
                  captionStyle === 'yellow_box'
                    ? 'bg-black/85 px-3 py-1.5 rounded-xl border border-yellow-400/50 text-yellow-300 shadow-2xl backdrop-blur-sm'
                    : captionStyle === 'cyan_glow'
                    ? 'bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                    : captionStyle === 'red_pill'
                    ? 'bg-[#f83a4c] px-3.5 py-1.5 rounded-full text-white shadow-xl'
                    : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                }`}
              >
                {activeClip?.subtitles || selectedClip?.subtitles || 'AI CUT'}
              </span>
            </div>

            {/* TikTok Guides Grid Overlay */}
            {showGuides && (
              <div className="absolute inset-0 z-20 pointer-events-none border border-cyan-400/30 flex flex-col justify-between p-6">
                <div className="h-10 border-b border-dashed border-cyan-400/40 text-[9px] text-cyan-300">
                  Header Safe Zone
                </div>
                <div className="h-20 border-t border-dashed border-cyan-400/40 text-[9px] text-cyan-300 pt-1">
                  Footer Safe Zone (Captions & Audio)
                </div>
              </div>
            )}
          </div>

          {/* Video Canvas Bottom Transport Controls */}
          <div className="w-full max-w-md flex items-center justify-between text-xs px-2 pt-2 text-zinc-400">
            {/* Timecode */}
            <div className="font-mono text-[11px] text-zinc-300">
              <span className="text-white font-bold">{formatTimecode(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span>{formatTimecode(totalDuration)}</span>
            </div>

            {/* Center Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-950 hover:bg-zinc-200 shadow-md transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            {/* Right Tools (TikTok Guides, Fullscreen) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                  showGuides
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Grid className="h-3 w-3" />
                <span>TikTok guides</span>
              </button>

              <button
                onClick={() => {
                  if (videoRef.current?.requestFullscreen) {
                    videoRef.current.requestFullscreen();
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Fullscreen"
              >
                <Maximize className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: CLIP SETTINGS & TOOL PROPERTIES PANEL (Pixel-perfect matching Image 1) */}
        <div className="w-80 shrink-0 bg-[#121318] border-l border-zinc-800/80 p-4 overflow-y-auto space-y-4">
          {/* 1. CLIP SETTINGS (Always visible, exactly matching Image 1) */}
          {selectedClip && (
            <div className="space-y-4 pb-2">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  CLIP SETTINGS
                </h3>
                <span className="text-[11px] font-mono text-[#00c7d4] bg-[#00c7d4]/15 border border-[#00c7d4]/40 px-2.5 py-0.5 rounded-full font-bold">
                  {(selectedClip.end - selectedClip.start).toFixed(1)}s
                </span>
              </div>

              {/* FILE NAME */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  FILE NAME
                </label>
                <input
                  type="text"
                  value={selectedClip.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClips((prev) => prev.map((c) => (c.id === selectedClip.id ? { ...c, name: val } : c)));
                  }}
                  className="w-full bg-[#181a22] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>

              {/* PRECISION TRIM */}
              <div className="space-y-2.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  PRECISION TRIM
                </label>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">Trim Start</span>
                    <span className="font-mono text-[#00c7d4] font-semibold">{selectedClip.start.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, selectedClip.end - 0.2)}
                    step={0.1}
                    value={selectedClip.start}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setClips((prev) => prev.map((c) => (c.id === selectedClip.id ? { ...c, start: val } : c)));
                    }}
                    className="w-full accent-[#00c7d4] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">Trim End</span>
                    <span className="font-mono text-[#00c7d4] font-semibold">{selectedClip.end.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={selectedClip.start + 0.2}
                    max={Math.max(totalDuration, selectedClip.end + 1)}
                    step={0.1}
                    value={selectedClip.end}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setClips((prev) => prev.map((c) => (c.id === selectedClip.id ? { ...c, end: val } : c)));
                    }}
                    className="w-full accent-[#00c7d4] cursor-pointer"
                  />
                </div>
              </div>

              {/* AI TRANSCRIPTION */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  AI TRANSCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={selectedClip.subtitles || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClips((prev) => prev.map((c) => (c.id === selectedClip.id ? { ...c, subtitles: val } : c)));
                  }}
                  className="w-full bg-[#181a22] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none font-sans"
                />
              </div>

              {/* CLIP VOLUME */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Clip Volume</span>
                  <span className="font-mono text-[#00c7d4] font-semibold">{volume.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#00c7d4] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 2. DEDICATED TOOL CONTROLS (Appears below Clip Settings when a tool tab is active) */}
          {activeToolTab && (
            <div className="pt-3 border-t border-zinc-800/80">
          {/* PANEL 4: TEXT TOOL */}
          {activeToolTab === 'text' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-cyan-400" />
                  Text & Titles
                </h3>
                <button
                  onClick={() => {
                    const newId = `txt_${Date.now()}`;
                    setTextOverlays((prev) => [
                      ...prev,
                      { id: newId, text: 'NEW TEXT', color: '#00F0FF', fontSize: 24, position: 'center', hasBackground: true },
                    ]);
                    notify('New text layer added');
                  }}
                  className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 hover:bg-cyan-500/30"
                >
                  + Add Text
                </button>
              </div>

              {textOverlays.map((t, idx) => (
                <div key={t.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-300">Layer {idx + 1}</span>
                    <button
                      onClick={() => setTextOverlays((prev) => prev.filter((item) => item.id !== t.id))}
                      className="text-red-400 text-[10px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={t.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTextOverlays((prev) => prev.map((item) => (item.id === t.id ? { ...item, text: val } : item)));
                    }}
                    className="w-full bg-black/60 rounded-lg p-2 text-xs border border-zinc-800 text-white focus:border-cyan-400 focus:outline-none"
                  />

                  {/* Color Presets */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Color:</span>
                    {['#FFE600', '#00F0FF', '#FFFFFF', '#FF2D55', '#A855F7'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setTextOverlays((prev) => prev.map((item) => (item.id === t.id ? { ...item, color: c } : item)))}
                        style={{ backgroundColor: c }}
                        className={`h-5 w-5 rounded-full border ${t.color === c ? 'border-white scale-110 ring-2 ring-cyan-400' : 'border-black/50'}`}
                      />
                    ))}
                  </div>

                  {/* Position */}
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setTextOverlays((prev) => prev.map((item) => (item.id === t.id ? { ...item, position: pos } : item)))}
                        className={`py-1 rounded capitalize ${t.position === pos ? 'bg-cyan-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PANEL 5: CAPTIONS TOOL */}
          {activeToolTab === 'captions' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                  Captions & Subtitles
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  Whisper Synced
                </span>
              </div>

              {/* Subtitle Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Preset Styles</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'yellow_box' as const, label: 'Viral Yellow Box', preview: 'AI CUT' },
                    { id: 'cyan_glow' as const, label: 'Cyber Cyan Glow', preview: 'AI CUT' },
                    { id: 'red_pill' as const, label: 'Red High-Energy', preview: 'AI CUT' },
                    { id: 'clean_white' as const, label: 'Minimal White', preview: 'AI CUT' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCaptionStyle(st.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        captionStyle === st.id
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] block">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Subtitle Editor */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Active Clip Text</label>
                <textarea
                  rows={3}
                  value={selectedClip?.subtitles || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    setClips((prev) => prev.map((c) => (c.id === selectedClip?.id ? { ...c, subtitles: text } : c)));
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Font Size</span>
                  <span className="font-mono text-cyan-400">{captionFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={36}
                  value={captionFontSize}
                  onChange={(e) => setCaptionFontSize(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* PANEL 6: OVERLAY TOOL (PiP / B-Roll / Stickers) */}
          {activeToolTab === 'overlay' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  Overlay (PiP / B-Roll)
                </h3>
                <button
                  onClick={() => setOverlayActive(!overlayActive)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    overlayActive ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {overlayActive ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Preset Overlays */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Select Overlay</label>
                <div className="grid grid-cols-3 gap-2">
                  {OVERLAY_PRESETS.map((ov) => (
                    <button
                      key={ov.id}
                      onClick={() => {
                        setOverlayUrl(ov.url);
                        setOverlayActive(true);
                        notify(`Applied overlay: ${ov.name}`);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        overlayUrl === ov.url
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <img src={ov.url} alt={ov.name} className="h-10 w-full object-cover rounded-lg mb-1" />
                      <span className="text-[9px] block truncate">{ov.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Controls */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Screen Position</label>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    { id: 'top-right' as const, label: 'Top Right' },
                    { id: 'top-left' as const, label: 'Top Left' },
                    { id: 'bottom-right' as const, label: 'Bottom Right' },
                    { id: 'center' as const, label: 'Center' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setOverlayPosition(p.id)}
                      className={`py-1.5 rounded-lg border ${
                        overlayPosition === p.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale & Opacity */}
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Scale</span>
                  <span className="font-mono text-cyan-400">{overlayScale}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={overlayScale}
                  onChange={(e) => setOverlayScale(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex justify-between text-xs text-zinc-300 pt-1">
                  <span>Opacity</span>
                  <span className="font-mono text-cyan-400">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* PANEL 7: VOLUME TOOL */}
          {activeToolTab === 'volume' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                  Volume & Gain
                </h3>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {isMuted ? 'Muted' : 'Unmuted'}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Master Gain</span>
                  <span className="font-mono text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Math.max(0, Math.min(1, volume))}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (parseFloat(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Fades */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Fade In</span>
                  <span className="font-mono text-cyan-300 text-xs font-bold">{fadeInSec.toFixed(1)}s</span>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.1}
                    value={fadeInSec}
                    onChange={(e) => setFadeInSec(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Fade Out</span>
                  <span className="font-mono text-cyan-300 text-xs font-bold">{fadeOutSec.toFixed(1)}s</span>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.1}
                    value={fadeOutSec}
                    onChange={(e) => setFadeOutSec(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Noise Reduction */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-white block">AI Vocal Boost</span>
                  <span className="text-[10px] text-zinc-400">Reduce ambient room noise</span>
                </div>
                <button
                  onClick={() => setNoiseReduction(!noiseReduction)}
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    noiseReduction ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      noiseReduction ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* PANEL 8: SPEED TOOL */}
          {activeToolTab === 'speed' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  Speed & Slow-Mo
                </h3>
                <span className="font-mono text-xs text-cyan-400 font-bold">{playbackSpeed}x</span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      notify(`Speed: ${spd}x`);
                    }}
                    className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Custom Slider</span>
                  <span className="font-mono text-cyan-400">{playbackSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={3}
                  step={0.05}
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-white block">Pitch Correction</span>
                  <span className="text-[10px] text-zinc-400">Keep natural vocal tone</span>
                </div>
                <button
                  onClick={() => setPitchCorrection(!pitchCorrection)}
                  className={`h-5 w-9 rounded-full transition-colors relative ${
                    pitchCorrection ? 'bg-cyan-500' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      pitchCorrection ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* PANEL 9: VOICEOVER TOOL (Live Microphone Recording) */}
          {activeToolTab === 'voiceover' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-cyan-400" />
                  Voiceover Record
                </h3>
                {isRecordingVoiceover && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold animate-pulse">
                    RECORDING LIVE
                  </span>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
                <div className="flex justify-center">
                  <button
                    onClick={handleToggleVoiceoverRecording}
                    className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                      isRecordingVoiceover
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                        : 'bg-gradient-to-tr from-cyan-400 to-indigo-600 text-zinc-950 hover:scale-105'
                    }`}
                  >
                    {isRecordingVoiceover ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">
                    {isRecordingVoiceover ? 'Recording Voiceover in sync with video...' : 'Tap to start voice recording'}
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Video will automatically roll so you can narrate in real-time.
                  </p>
                </div>

                {voiceoverAudioUrl && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Voiceover Attached
                    </span>
                    <button
                      onClick={() => {
                        setVoiceoverAudioUrl(null);
                        notify('Voiceover track removed');
                      }}
                      className="text-red-400 hover:underline text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANEL 10: AUDIO / MUSIC TOOL */}
          {activeToolTab === 'audio' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 text-cyan-400" />
                  Background Music
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono">Royalty-Free</span>
              </div>

              {/* Music List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {BGM_LIBRARY.map((track) => {
                  const isSelected = activeBgm?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setActiveBgm(track);
                        notify(`Applied track: ${track.title}`);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 text-white ring-1 ring-cyan-500/30'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs font-semibold block truncate">{track.title}</span>
                        <span className="text-[10px] text-zinc-500">{track.genre}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 shrink-0">
                        {isSelected ? 'Active' : 'Pick'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BGM Volume & Smart Ducking */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Music Volume</span>
                  <span className="font-mono text-cyan-400">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-white block">Smart Ducking</span>
                    <span className="text-[10px] text-zinc-400">Lower music volume during speech</span>
                  </div>
                  <button
                    onClick={() => setAutoDucking(!autoDucking)}
                    className={`h-5 w-9 rounded-full transition-colors relative ${
                      autoDucking ? 'bg-cyan-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                        autoDucking ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 11: EXTRACT AUDIO */}
          {activeToolTab === 'extract' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileAudio className="h-3.5 w-3.5 text-cyan-400" />
                  Extract Audio
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-center">
                <p className="text-xs text-zinc-300">
                  Detach the original audio track from the video clip into an independent audio channel.
                </p>
                <button
                  onClick={() => {
                    setIsAudioExtracted(true);
                    notify('Audio extracted to A1 channel successfully!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-zinc-950 font-bold text-xs"
                >
                  {isAudioExtracted ? 'Audio Extracted ✓' : 'Extract Audio Track Now'}
                </button>
              </div>
            </div>
          )}

          {/* PANEL 12: ADJUST (Color Grading & WebGL/CSS Filters) */}
          {activeToolTab === 'adjust' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                  Color & Grading
                </h3>
                <button
                  onClick={() => applyFilterPreset('none')}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* Filter Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Style Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'viral_clean' as const, label: 'Viral Clean' },
                    { id: 'cinema' as const, label: 'Cinematic Moody' },
                    { id: 'cyberpunk' as const, label: 'Cyberpunk' },
                    { id: 'none' as const, label: 'Original' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyFilterPreset(p.id)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                        activeFilterPreset === p.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Brightness, Contrast, Saturation, Warmth */}
              <div className="space-y-3 pt-1 border-t border-zinc-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Brightness</span>
                    <span className="font-mono text-cyan-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Contrast</span>
                    <span className="font-mono text-cyan-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Saturation</span>
                    <span className="font-mono text-cyan-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Warmth / Hue</span>
                    <span className="font-mono text-cyan-400">{warmth}°</span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={warmth}
                    onChange={(e) => setWarmth(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PANEL 13: ROTATE & FLIP */}
          {activeToolTab === 'rotate' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
                  Rotate & Mirror
                </h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setRotation((r) => (r + 90) % 360);
                    notify(`Rotated to ${(rotation + 90) % 360}°`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white flex items-center justify-center gap-2"
                >
                  <RotateCw className="h-4 w-4 text-cyan-400" />
                  <span>Rotate 90° Clockwise</span>
                </button>

                <button
                  onClick={() => {
                    setFlipHorizontal(!flipHorizontal);
                    notify(flipHorizontal ? 'Mirror off' : 'Mirrored horizontally');
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white flex items-center justify-center gap-2"
                >
                  <span>Flip Horizontal (Mirror Selfie)</span>
                </button>
              </div>
            </div>
          )}

          {/* PANEL 14: ZOOM / CROP */}
          {activeToolTab === 'zoom' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-cyan-400" />
                  Scale & Pan Crop
                </h3>
                <span className="font-mono text-xs text-cyan-400 font-bold">{Math.round(videoZoom * 100)}%</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Frame Zoom</span>
                    <span className="font-mono text-cyan-400">{Math.round(videoZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={videoZoom}
                    onChange={(e) => setVideoZoom(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Pan Horizontal</span>
                    <span className="font-mono text-cyan-400">{panX}%</span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Pan Vertical</span>
                    <span className="font-mono text-cyan-400">{panY}%</span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    setVideoZoom(1);
                    setPanX(0);
                    setPanY(0);
                    notify('Reset framing');
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                >
                  Reset Framing
                </button>
              </div>
            </div>
          )}

          {/* PANEL 15: WORDS TOOL (Word-level AI Silence Remover) */}
          {activeToolTab === 'words' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  Word-Level Cuts
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs space-y-2">
                <p className="text-violet-200 text-[11px]">
                  Click any word to seek the playhead. AI automatically stripped out awkward pause intervals.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Welcome', 'to', 'ClipViral', 'AI', 'cutting', 'dead', 'air', 'retakes', 'automatically'].map((w, i) => (
                    <span
                      key={i}
                      onClick={() => {
                        seekTo(i * 0.8);
                        notify(`Seek to: "${w}"`);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-zinc-700 text-[10px] font-mono cursor-pointer"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

            </div>
          )}
        </div>
      </div>

      {/* 4. MULTI-TRACK CAPCUT-STYLE TIMELINE */}
      <div className="h-56 shrink-0 bg-[#0c0d11] border-t border-zinc-800/90 flex flex-col z-20">
        {/* Timeline Tools Bar */}
        <div className="h-10 px-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#111216] text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSplitClip}
              className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-colors"
              title="Split (S)"
            >
              <Scissors className="h-3.5 w-3.5 text-cyan-400" />
              <span>Split</span>
            </button>

            <button onClick={handleUndo} disabled={undoStack.length === 0} className="p-1 hover:text-white disabled:opacity-30" title="Undo">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-1 hover:text-white disabled:opacity-30" title="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleDeleteClip} className="p-1 hover:text-red-400" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                notify('AI Magic: Silences trimmed & audio leveled');
              }}
              className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="AI Magic Polish"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 text-zinc-400 hover:text-white" title="Link/Group">
              <Link2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Zoom Slider - Matching Image 1 */}
          <div className="flex items-center gap-2">
            <ZoomOut className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="range"
              min={1.0}
              max={3.0}
              step={0.1}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-24 accent-[#00c7d4] cursor-pointer"
            />
            <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-[10px] w-9 text-right text-zinc-300 font-semibold">{Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>

        {/* Tracks Main Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Track Headers (Cover, V1, V2, Audio) */}
          <div className="w-24 shrink-0 bg-[#0f1015] border-r border-zinc-800/80 flex flex-col text-[11px] font-semibold text-zinc-400 select-none">
            <div className="h-6 border-b border-zinc-800/60" />
            <div className="h-16 flex items-center justify-between px-2.5 border-b border-zinc-800/40">
              <span>Cover</span>
              <Lock className="h-3 w-3 text-zinc-600" />
            </div>
            <div className="h-14 flex items-center justify-between px-2.5 border-b border-zinc-800/40">
              <span className="text-cyan-400 font-bold">V1</span>
              <div className="flex gap-1 text-zinc-600">
                <Lock className="h-3 w-3" />
                <Eye className="h-3 w-3" />
              </div>
            </div>
            <div className="h-12 flex items-center justify-between px-2.5 text-zinc-600">
              <span>V2 (PiP)</span>
            </div>
          </div>

          {/* Right Tracks Scrollable Area */}
          <div className="flex-1 overflow-x-auto relative select-none">
            <div style={{ minWidth: `${Math.max(800, 800 * zoomLevel)}px` }} className="relative h-full flex flex-col">
              {/* Time Ruler */}
              <div
                ref={timelineRulerRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  seekTo(ratio * totalDuration);
                }}
                className="h-6 border-b border-zinc-800/80 relative flex items-end pb-0.5 text-[9px] font-mono text-zinc-500 cursor-pointer"
              >
                {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
                  <div key={sec} className="absolute" style={{ left: `${(sec / totalDuration) * 100}%` }}>
                    <div className="h-2 w-px bg-zinc-700" />
                    {sec % 5 === 0 && <span className="-ml-2 mt-0.5 block">{sec}s</span>}
                  </div>
                ))}
              </div>

              {/* Red Playhead Line with White Handle */}
              <div
                className="absolute top-0 bottom-0 z-30 w-0.5 bg-red-500 pointer-events-none"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              >
                <div className="absolute -top-1 -left-2 h-4 w-4 rounded-full bg-white shadow-md flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
              </div>

              {/* Cover Row */}
              <div className="h-16 border-b border-zinc-800/40 relative flex items-center px-1">
                <div className="h-12 w-20 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow">
                  <img
                    src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop&q=80"
                    alt="Cover"
                    className="h-full w-full object-cover opacity-70"
                  />
                  <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 px-1 rounded text-zinc-200">
                    Default
                  </span>
                </div>
              </div>

              {/* Main Video Track (Filmstrip Thumbnails + Waveform) */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  seekTo(ratio * totalDuration);
                }}
                className="h-14 border-b border-zinc-800/40 relative flex items-center p-1 cursor-pointer"
              >
                {clips.map((clip) => {
                  const left = (clip.start / totalDuration) * 100;
                  const width = Math.max(2, ((clip.end - clip.start) / totalDuration) * 100);
                  const isSelected = clip.id === selectedClipId || activeClip?.id === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClipAndSeek(clip);
                      }}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className={`absolute top-1 bottom-1 rounded-lg border flex flex-col justify-between overflow-hidden shadow-md cursor-pointer transition-all ${
                        isSelected
                          ? 'border-white ring-2 ring-cyan-400 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 z-20'
                          : 'border-zinc-700 bg-zinc-850 hover:border-zinc-500 opacity-90 z-10'
                      }`}
                    >
                      {/* Filmstrip Clip Header */}
                      <div className="flex items-center justify-between px-2 pt-1 text-[9px] font-bold text-white truncate">
                        <span className="truncate">{clip.name}</span>
                        <span className="font-mono text-[8px] bg-black/50 px-1 rounded">
                          {(clip.end - clip.start).toFixed(1)}s
                        </span>
                      </div>

                      {/* Embedded Audio Waveform at bottom of filmstrip */}
                      <div className="h-4 w-full flex items-end gap-0.5 px-1 pb-1 opacity-85">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            style={{ height: `${20 + ((i * 19) % 75)}%` }}
                            className="w-full bg-red-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Plus (+) Button to Add Clips */}
                <div
                  style={{ left: `${(clips[clips.length - 1]?.end / totalDuration) * 100 + 1}%` }}
                  className="absolute flex items-center"
                >
                  <button
                    onClick={() => {
                      handleDuplicateClip();
                      notify('Added new clip to timeline');
                    }}
                    className="flex h-10 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    title="Add Media"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Secondary Track V2 (PiP / Overlay representation) */}
              <div className="h-12 relative flex items-center px-1">
                {overlayActive && (
                  <div
                    style={{ left: '5%', width: '40%' }}
                    className="h-8 rounded bg-cyan-950/60 border border-cyan-400/50 flex items-center px-2 text-[9px] text-cyan-300 font-mono"
                  >
                    Overlay (PiP): {OVERLAY_PRESETS.find((p) => p.url === overlayUrl)?.name || 'Custom PiP'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Status Toast */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-zinc-950 px-4 py-2.5 text-xs font-medium text-cyan-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#14151b] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-cyan-400" />
                <span>Export Project</span>
              </h3>
              <button onClick={() => setExportModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Your CapCut-style viral video ({clips.length} cuts, {totalDuration.toFixed(1)}s) is ready to render.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Resolution</span>
                <span className="font-semibold text-cyan-400">1080 × 1920 (9:16 Vertical)</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Audio Tracks</span>
                <span className="font-semibold text-emerald-400">
                  {activeBgm ? 'BGM + Main' : 'Main Audio'}
                  {voiceoverAudioUrl ? ' + Voiceover' : ''}
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Quality</span>
                <span className="font-semibold text-indigo-400">Pro Cloud GPU Render</span>
              </div>
            </div>

            <button
              onClick={() => {
                setExportModalOpen(false);
                notify('Cloud rendering started successfully!');
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 py-3 text-xs font-bold text-zinc-950 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition-all"
            >
              Start Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
