import React from 'react';
import { locales, Locale, defaultLocale } from '@/lib/i18n/config';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const instant = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : defaultLocale;

  return (
    <AuthProvider>
      <LanguageProvider initialLocale={currentLocale}>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </LanguageProvider>
    </AuthProvider>
  );
}
