import type { Locale } from './config';

const dictionaries = {
  de: () => import('@/messages/de.json').then((module) => module.default),
  en: () => import('@/messages/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    return dictionaries.de();
  }
  return dictionaries[locale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

