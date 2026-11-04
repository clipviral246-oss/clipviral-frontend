'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export function PricingCards() {
  const { locale, dict } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: 'starter' | 'creator' | 'pro') => {
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          locale,
          customerEmail: 'creator@clipviral.ai',
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout failed', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const tiers = [
    {
      id: 'starter' as const,
      name: dict.pricing.starter.name,
      tagline: dict.pricing.starter.tagline,
      price: billingCycle === 'yearly' ? dict.pricing.starter.priceYearly : dict.pricing.starter.priceMonthly,
      unit: billingCycle === 'yearly' ? dict.pricing.yearUnit : dict.pricing.monthUnit,
      features: dict.pricing.starter.features,
      isPopular: false,
      buttonStyle: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
    },
    {
      id: 'creator' as const,
      name: dict.pricing.creator.name,
      tagline: dict.pricing.creator.tagline,
      price: billingCycle === 'yearly' ? dict.pricing.creator.priceYearly : dict.pricing.creator.priceMonthly,
      unit: billingCycle === 'yearly' ? dict.pricing.yearUnit : dict.pricing.monthUnit,
      features: dict.pricing.creator.features,
      isPopular: true,
      popularLabel: dict.pricing.creator.popularBadge,
      buttonStyle: 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-zinc-950 font-bold hover:opacity-90 shadow-lg shadow-cyan-500/25',
    },
    {
      id: 'pro' as const,
      name: dict.pricing.pro.name,
      tagline: dict.pricing.pro.tagline,
      price: billingCycle === 'yearly' ? dict.pricing.pro.priceYearly : dict.pricing.pro.priceMonthly,
      unit: billingCycle === 'yearly' ? dict.pricing.yearUnit : dict.pricing.monthUnit,
      features: dict.pricing.pro.features,
      isPopular: false,
      buttonStyle: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500',
    },
  ];

  return (
    <div className="w-full space-y-10 py-6">
      {/* Header & Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          {dict.pricing.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {dict.pricing.title}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {dict.pricing.subtitle}
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {dict.pricing.monthly}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{dict.pricing.yearly}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {tiers.map((tier) => {
          const isLoading = loadingPlan === tier.id;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all ${
                tier.isPopular
                  ? 'border-cyan-500/50 bg-gradient-to-b from-indigo-950/40 via-zinc-900/60 to-zinc-950 shadow-2xl shadow-indigo-500/10 scale-100 md:scale-105 z-10'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-3.5 py-0.5 text-[11px] font-bold text-zinc-950 shadow-md">
                  {tier.popularLabel}
                </div>
              )}

              {/* Tier Header */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="mt-1 text-xs text-zinc-400 min-h-[32px]">{tier.tagline}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-400 font-normal">{tier.unit}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-4 border-t border-zinc-800/80 text-xs">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-zinc-300">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stripe Checkout Action CTA */}
              <div className="pt-8">
                <button
                  onClick={() => handleCheckout(tier.id)}
                  disabled={Boolean(loadingPlan)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all disabled:opacity-50 ${tier.buttonStyle}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{dict.common.loading}</span>
                    </>
                  ) : (
                    <>
                      <span>{dict.pricing.choosePlan}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Guarantee & Badges */}
      <div className="pt-4 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-6">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          {dict.pricing.guarantee}
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-cyan-400" />
          Stripe SSL 256-Bit Encryption
        </span>
      </div>
    </div>
  );
}

