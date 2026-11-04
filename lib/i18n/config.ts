export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
};

