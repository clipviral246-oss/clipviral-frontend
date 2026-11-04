'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function AuthLoginPage() {
  return (
    <div className="py-8 sm:py-16 flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <LoginForm />
    </div>
  );
}

