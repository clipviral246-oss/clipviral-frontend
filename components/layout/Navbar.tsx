'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { locales, localeNames } from '@/lib/i18n/config';
import { useSession, signOut } from 'next-auth/react';
import { 
  Video, 
  Globe, 
  User, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export function Navbar() {
  const { locale, setLocale, dict } = useLanguage();
  const { data: session } = useSession();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Conditional PRO badge: only display if authenticated user's database plan is 'PRO'
  const isPro = Boolean(
    session?.user &&
      (((session.user as any)?.plan && String((session.user as any).plan).toUpperCase() === 'PRO') ||
        ((session.user as any)?.subscriptionTier &&
          String((session.user as any).subscriptionTier).toUpperCase() === 'PRO'))
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo (Left) */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Video className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              ClipViral <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">AI</span>
              {isPro && (
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/20">
                  PRO
                </span>
              )}
            </span>
          </div>
        </Link>

        {/* Right Action Bar (Language Switcher + Sign In Button) */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              aria-label="Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <span>{localeNames[locale].flag}</span>
              <span className="uppercase font-semibold">{locale}</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocale(loc);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      locale === loc
                        ? 'bg-indigo-600/20 text-cyan-400 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{localeNames[loc].flag}</span>
                      <span>{localeNames[loc].nativeName}</span>
                    </span>
                    {locale === loc && <span className="text-[10px] bg-cyan-400/20 px-1.5 py-0.5 rounded text-cyan-300">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Session */}
          {session?.user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full border border-violet-500/50 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-semibold text-violet-300 border border-violet-500/40">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-300 max-w-[100px] truncate hidden sm:inline-block">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                {dict.common.logout}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-md shadow-indigo-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>{dict.common.login}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
