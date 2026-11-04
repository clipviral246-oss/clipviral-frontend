'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { PricingCards } from '@/components/pricing/PricingCards';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { LandingHeroUpload } from '@/components/home/LandingHeroUpload';
import { Sparkles, ArrowRight, Video } from 'lucide-react';

export default function HomePage() {
  const { locale, dict } = useLanguage();

  return (
    <div className="space-y-16 py-6 sm:py-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/10">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ClipViral AI 2.0 • {locale === 'de' ? 'Der All-in-One KI-Videoschnitt für Creator' : 'All-in-One AI Video Editor for Creators'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {locale === 'de' ? (
            <>
              Rohmaterial rein. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Virale Meisterwerke
              </span>{' '}
              heraus.
            </>
          ) : (
            <>
              Raw Footage in. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Viral Masterpieces
              </span>{' '}
              out.
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {dict.common.tagline}. {locale === 'de'
            ? 'Batch-Upload für bis zu 20+ Clips, automatische Stille-Erkennung, dynamische deutsche Untertitel und intuitive Timeline-Steuerung in einem einzigen Workflow.'
            : 'Batch upload up to 20+ clips, automatic silence removal, animated captions, and interactive timeline cutting in one seamless workflow.'}
        </p>

        {/* Step 1: Auto-Upload Hero Dropzone (with Auth Check & NextAuth modal) */}
        <LandingHeroUpload />

        {/* Direct Link to Studio */}
        <div className="pt-2 flex justify-center">
          <Link
            href={`/${locale}/editor`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <span>{locale === 'de' ? 'Oder direkt zum Studio Workspace' : 'Or open Studio Workspace directly'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Product Showcase Mock-UI (AI Editing Workflow) */}
      <ProductShowcase />

      {/* Pricing Section */}
      <section className="pt-4 border-t border-zinc-800/60">
        <PricingCards />
      </section>
    </div>
  );
}
