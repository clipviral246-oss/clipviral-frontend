'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Play,
  Pause,
  Scissors,
  Sparkles,
  Volume2,
  Film,
  Zap,
  Check,
  Clock,
  AudioWaveform,
  Sliders,
  Maximize2
} from 'lucide-react';

export function ProductShowcase() {
  const { locale } = useLanguage();
  const isDe = locale === 'de';

  const [isPlaying, setIsPlaying] = useState(true);
  const [playProgress, setPlayProgress] = useState(42); // percentage across timeline
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Simulated playback animation when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => (prev >= 98 ? 2 : prev + 1));
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const aiTasks = [
    {
      id: 'dead-air',
      title: isDe ? 'Stille & Pausen' : 'Dead air',
      description: isDe ? 'Unnötige Denkpausen entfernt' : 'Awkward pauses & silence',
      count: 3,
      badge: isDe ? 'Entfernt' : 'Removed',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      id: 'restarts',
      title: isDe ? 'Neuanfänge' : 'Restarts',
      description: isDe ? 'Doppelte Sätze & Fehlstarts' : 'False takes & repeated sentences',
      count: 2,
      badge: isDe ? 'Entfernt' : 'Removed',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      id: 'mistakes',
      title: isDe ? 'Versprecher' : 'Mistakes',
      description: isDe ? 'Versprecher & Räuspern' : 'Stutters & coughs',
      count: 1,
      badge: isDe ? 'Entfernt' : 'Removed',
      badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      id: 'jumpcuts',
      title: isDe ? 'Dynamische Jump Cuts' : 'Jump cuts applied',
      description: isDe ? 'Perfekter Social-Media-Flow' : 'Snappy rhythm for retention',
      count: 5,
      badge: isDe ? 'Angewendet' : 'Applied',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
  ];

  // Visual waveform bars with defined amplitudes and cut highlights
  const waveformBars = [
    { h: 35, cut: false },
    { h: 60, cut: false },
    { h: 80, cut: false },
    { h: 95, cut: false },
    { h: 50, cut: false },
    // Cut 1: Dead air
    { h: 10, cut: true, label: 'Cut 1' },
    { h: 8, cut: true },
    { h: 12, cut: true },
    { h: 10, cut: true },
    // Next speech segment
    { h: 70, cut: false },
    { h: 90, cut: false },
    { h: 100, cut: false },
    { h: 65, cut: false },
    { h: 45, cut: false },
    // Cut 2: Restart
    { h: 15, cut: true, label: 'Cut 2' },
    { h: 10, cut: true },
    { h: 12, cut: true },
    // High energy hook
    { h: 85, cut: false },
    { h: 95, cut: false },
    { h: 75, cut: false },
    { h: 90, cut: false },
    { h: 60, cut: false },
    // Cut 3: Mistake
    { h: 12, cut: true, label: 'Cut 3' },
    { h: 15, cut: true },
    { h: 10, cut: true },
    // Final punchline
    { h: 80, cut: false },
    { h: 100, cut: false },
    { h: 90, cut: false },
    { h: 70, cut: false },
    { h: 50, cut: false },
    { h: 30, cut: false },
  ];

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Background ambient decorative glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90%] h-[320px] bg-gradient-to-r from-cyan-600/15 via-indigo-600/15 to-violet-600/15 blur-3xl -z-10 rounded-full pointer-events-none" />

      {/* Section Subtitle / Header Badge */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/80 text-xs font-semibold text-zinc-300 shadow-inner">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isDe ? 'Automatische Rohschnitt-KI' : 'Intelligent Auto-Cutter Engine'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {isDe ? 'Sieh zu, wie Rohmaterial viral wird' : 'Watch Raw Takes Turn Into Viral Gold'}
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          {isDe
            ? 'Unsere KI analysiert Sprachpausen, Versprecher und Wiederholungen in Sekunden und schneidet deine Videos publikumsreif.'
            : 'Our cutter strips dead air, repeated sentences, and stutters in seconds, leaving only high-retention content.'}
        </p>
      </div>

      {/* Main Promotional Mock-UI Card */}
      <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 overflow-hidden">
        
        {/* Top Window Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* File badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Film className="w-3.5 h-3.5 text-zinc-500" />
              <span>medicube-raw-take.mov</span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isDe ? 'Fertig' : 'Done'}
            </span>
          </div>
        </div>

        {/* Main Two-Column Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
          {/* Left Column: Mock Video Player Interface (9:16 vertical creator style with real HTML5 video) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[270px] sm:max-w-[290px] aspect-[9/16] rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl group">
              
              {/* Real Looping HTML5 Video of creator speaking to camera */}
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.pexels.com/videos/7092079/pictures/preview-0.jpg"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              >
                <source
                  src="https://videos.pexels.com/video-files/7092079/7092079-hd_1080_1920_30fps.mp4"
                  type="video/mp4"
                />
                <source
                  src="https://res.cloudinary.com/demo/video/upload/c_fill,ar_9:16,g_auto,w_720/samples/cld-sample-video.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Cinematic Vignette Gradient Overlays for high contrast & readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50 pointer-events-none z-10" />

              {/* Floating "Your Cut" Picture-in-Picture window (matching reference mock-UI) */}
              <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 shadow-xl">
                <div className="w-7 h-9 rounded-lg overflow-hidden bg-zinc-800 border border-white/20 relative flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Raw take"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white tracking-wide">
                    {isDe ? 'Dein Rohclip' : 'Your cut'}
                  </div>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    4:12 raw
                  </div>
                </div>
              </div>

              {/* Top-Right Resolution & AI Status Badge */}
              <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-cyan-300 font-semibold shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>4K • 60 FPS</span>
              </div>

              {/* Center Play / Pause interactive trigger button */}
              <button
                type="button"
                onClick={togglePlay}
                className={`absolute inset-0 m-auto w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all z-20 backdrop-blur-md ${
                  isPlaying
                    ? 'bg-black/40 hover:bg-cyan-500/90 text-white hover:text-zinc-950 border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 scale-105 shadow-cyan-500/40 opacity-100'
                }`}
                aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Dynamic Animated Viral Captions Overlay */}
              <div className="absolute bottom-11 inset-x-3 z-20 text-center pointer-events-none">
                <div className="inline-block px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl">
                  <p className="text-xs sm:text-sm font-black tracking-wide text-white uppercase leading-snug">
                    <span className="text-yellow-300 bg-yellow-400/20 px-1 py-0.5 rounded mr-1">
                      STOP EDITING
                    </span>{' '}
                    MANUALLY. <br />
                    <span className="text-cyan-400">START POSTING.</span>
                  </p>
                </div>
              </div>

              {/* Bottom In-Player Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 z-20 flex items-center justify-between text-[11px] font-mono text-zinc-300 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    00:{String(Math.floor((playProgress / 100) * 33)).padStart(2, '0')} / 00:33
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    AI Optimized
                  </span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Stats Panel showing Fake AI Tasks */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Header of detection breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{isDe ? 'Was der Cutter erkennt:' : 'What the cutter finds:'}</span>
                </h3>
                <span className="text-xs font-medium text-zinc-400 font-mono">
                  {isDe ? 'Auto-Erkennung aktiv' : 'AI Scan Complete'}
                </span>
              </div>

              {/* AI Detection Task List */}
              <div className="space-y-2.5">
                {aiTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-cyan-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-200">
                          {task.title}
                        </div>
                        <div className="text-xs text-zinc-500 hidden sm:block">
                          {task.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono text-white">
                        {task.count}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${task.badgeColor}`}
                      >
                        {task.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Length Compression & Reduction Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {isDe ? 'Videolänge nach Schnitt' : 'Video length'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                      0:33
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-500 line-through">
                      cut from 4:12
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    -87% {isDe ? 'Zeit gespart' : 'time saved'}
                  </span>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                    3m 39s {isDe ? 'tote Zeit entfernt' : 'dead air cut'}
                  </div>
                </div>
              </div>

              {/* Progress Bar Visualizing Time Condensation */}
              <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                  style={{ width: '87%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Sleek Audio Waveform Timeline with AI Cut Markers */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6 space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <AudioWaveform className="w-4 h-4 text-cyan-400" />
              <span>{isDe ? 'Intelligente Timeline & Wellenform' : 'AI Cut Waveform & Timeline'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-rose-500/50 border border-rose-500" />
                {isDe ? 'Entfernte Stille' : 'Removed Dead Air'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-cyan-500" />
                {isDe ? 'Behaltene Hooks' : 'Retained Footage'}
              </span>
            </div>
          </div>

          {/* Interactive Timeline Waveform Box */}
          <div className="relative h-20 sm:h-24 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 flex items-center justify-between overflow-hidden">
            
            {/* Cut Regions Highlight Overlays */}
            <div className="absolute inset-y-0 left-[16%] w-[12%] bg-rose-500/10 border-x border-rose-500/30 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-rose-400 -rotate-90 sm:rotate-0 tracking-wider">
                -18s
              </span>
            </div>
            <div className="absolute inset-y-0 left-[45%] w-[10%] bg-amber-500/10 border-x border-amber-500/30 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-amber-400 -rotate-90 sm:rotate-0 tracking-wider">
                -12s
              </span>
            </div>
            <div className="absolute inset-y-0 left-[70%] w-[11%] bg-violet-500/10 border-x border-violet-500/30 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-violet-400 -rotate-90 sm:rotate-0 tracking-wider">
                -24s
              </span>
            </div>

            {/* Dynamic Waveform Bars */}
            <div className="relative z-10 w-full flex items-center justify-between gap-1 h-full px-2">
              {waveformBars.map((bar, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                >
                  <div
                    className={`w-full max-w-[6px] rounded-full transition-all duration-300 ${
                      bar.cut
                        ? 'bg-rose-500/40 border border-dashed border-rose-500/60'
                        : idx * 3 < playProgress
                        ? 'bg-gradient-to-t from-cyan-400 to-indigo-400 shadow-sm shadow-cyan-500/50'
                        : 'bg-zinc-700/60'
                    }`}
                    style={{ height: `${bar.h}%` }}
                  />
                </div>
              ))}
            </div>

            {/* Moving Playhead Scrubber */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-150"
              style={{ left: `${playProgress}%` }}
            >
              <div className="relative h-full flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-zinc-950 shadow-md shadow-cyan-400/80 -mt-1" />
                <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
            </div>
          </div>

          {/* Timeline Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-zinc-400">
            <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? 'Stille' : 'Dead air'}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? 'Neustarts' : 'Restarts'}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isDe ? 'Versprecher' : 'Mistakes'}
              </span>
            </div>

            <div className="text-zinc-400 font-mono text-[11px] font-semibold">
              <span className="text-cyan-400">6 {isDe ? 'von' : 'of'} 6</span> {isDe ? 'Schnitte angewendet' : 'cuts applied'}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

