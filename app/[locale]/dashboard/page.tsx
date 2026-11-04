'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import EditorPage from '../editor/page';

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => {
    router.replace(`/${locale}/editor`);
  }, [router, locale]);

  return <EditorPage />;
}
