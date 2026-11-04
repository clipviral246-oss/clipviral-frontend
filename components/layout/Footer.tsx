'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Video, ShieldCheck, Cpu, Zap } from 'lucide-react';

export function Footer() {
  const { locale, dict } = useLanguage();

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-10 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-cyan-400">
                <Video className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white">ClipViral AI</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {dict.common.tagline}. High-speed cloud rendering powered by advanced AI video processing.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> DSGVO / GDPR Compliant
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" /> GPU Accelerated
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-violet-400" /> 256-Bit SSL Secure
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Plattform</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href={`/${locale}/dashboard`} className="hover:text-white transition-colors">
                  {dict.nav.upload} (20+ Clips)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/editor`} className="hover:text-white transition-colors">
                  {dict.nav.timeline}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="hover:text-white transition-colors">
                  {dict.nav.pricing}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack & Stubs */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Features</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>Multi-Clip Batch Upload</li>
              <li>AI Silence Trimming</li>
              <li>Animated Auto-Captions</li>
              <li>Instant 4K 60FPS Export</li>
              <li>Cloud Sync & Storage</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
          <p>© 2026 ClipViral AI Technologies GmbH. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Impressum</span>
            <span className="hover:text-zinc-400 cursor-pointer">Datenschutz</span>
            <span className="hover:text-zinc-400 cursor-pointer">AGB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
