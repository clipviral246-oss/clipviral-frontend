'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Video, Mail, User, Sparkles, ArrowRight, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

export function LoginForm() {
  const { locale, dict } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Google Login via NextAuth & Prisma
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);
    signIn('google', { callbackUrl: `/${locale}/dashboard` });
  };

  // Handle Email Sign In & Database User Persistence
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email,
        name: name || email.split('@')[0],
        callbackUrl: `/${locale}/dashboard`,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else if (res?.ok) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  // Instant Guest Demo Mode (Saves demo creator to DB)
  const handleGuestDemo = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    await signIn('credentials', {
      email: 'creator_demo@clipviral.ai',
      name: 'Viral Demo Creator',
      callbackUrl: `/${locale}/dashboard`,
      redirect: true,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
            <Video className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{dict.auth.title}</h2>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">{dict.auth.subtitle}</p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Google OAuth Provider Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/90 py-3 text-xs font-semibold text-white hover:bg-zinc-700 transition-all shadow-sm disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        <span>{dict.auth.googleButton}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-zinc-800" />
        <span className="absolute bg-zinc-900 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {dict.auth.or}
        </span>
      </div>

      {/* Email / User Persistence Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Name (optional)</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Alex Creator"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 pl-9 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">{dict.auth.emailLabel}</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.auth.emailPlaceholder}
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 pl-9 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{dict.common.loading}</span>
            </>
          ) : (
            <>
              <span>{locale === 'de' ? 'Anmelden & Benutzer in DB speichern' : 'Sign in & Save User to DB'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick 1-Click Guest Demo Mode */}
      <div className="pt-2 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleGuestDemo}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all"
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>{dict.auth.guestDemo}</span>
        </button>
      </div>

      {/* Terms & Privacy */}
      <p className="text-center text-[10px] text-zinc-500 leading-normal">
        {dict.auth.terms}
      </p>
    </div>
  );
}
