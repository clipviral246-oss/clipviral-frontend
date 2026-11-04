'use client';

import React, { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="py-8 sm:py-16 flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-cyan-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}

