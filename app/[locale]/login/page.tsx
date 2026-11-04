'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="py-8 sm:py-16 flex items-center justify-center">
      <LoginForm />
    </div>
  );
}

