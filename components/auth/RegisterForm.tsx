'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Video,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

export function RegisterForm() {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google OAuth Sign In
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);
    signIn('google', { callbackUrl: `/${locale}/dashboard` });
  };

  // Submit Registration Form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Account created! Logging you in...');

      // Auto sign-in with the new credentials
      const loginRes = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        callbackUrl: `/${locale}/dashboard`,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      } else {
        router.push(`/${locale}/auth/login`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
            <Video className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {locale === 'de' ? 'Konto erstellen' : 'Create an Account'}
        </h2>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          {locale === 'de'
            ? 'Starte jetzt mit automatischem KI-Videoschnitt und viralen Untertiteln'
            : 'Start creating high-retention viral videos and AI cuts in minutes'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-300 animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 font-medium leading-snug">{errorMessage}</div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 py-3 text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
        <span>Sign up with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-zinc-800" />
        <span className="absolute bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          OR REGISTER WITH EMAIL
        </span>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Creator Name (optional)</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Creator"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 pl-10 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@example.com"
              required
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 pl-10 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 py-3 pl-10 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-cyan-400 hover:via-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-1 text-xs text-zinc-400">
        Already have an account?{' '}
        <Link
          href={`/${locale}/auth/login`}
          className="font-bold text-cyan-400 hover:text-cyan-300 underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

