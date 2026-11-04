'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Locale, defaultLocale, locales } from '@/lib/i18n/config';
import deDict from '@/messages/de.json';
import enDict from '@/messages/en.json';

const dictionaries: Record<Locale, typeof deDict> = {
  de: deDict,
  en: enDict,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof deDict>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  dict: typeof deDict;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If pathname starts with locale, keep in sync
    const segments = pathname?.split('/') || [];
    const pathLocale = segments[1] as Locale;
    if (locales.includes(pathLocale) && pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathname, locale]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocaleState(newLocale);

    // Save cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Update URL smoothly
    if (pathname) {
      const segments = pathname.split('/');
      if (locales.includes(segments[1] as Locale)) {
        segments[1] = newLocale;
        router.push(segments.join('/') || `/${newLocale}`);
      } else {
        router.push(`/${newLocale}${pathname}`);
      }
    }
  };

  const dict = dictionaries[locale] || dictionaries.de;

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string') {
      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
          return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        }, value);
      }
      return value;
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dict, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

