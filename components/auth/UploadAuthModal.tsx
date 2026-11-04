'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { useEditorWorkflow } from '@/context/EditorWorkflowContext';
import {
  Video,
  Mail,
  Lock,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface UploadAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadAuthModalProps) {
  const { locale } = useLanguage();
  const { pendingFiles } = useEditorWorkflow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Preserve current URL callback so user returns immediately with pending video
      await signIn('google', {
        callbackUrl: typeof window !== 'undefined' ? window.location.href : `/${locale}/editor`,
      });
    } catch {
      setError('Google Sign-In failed');
      setIsLoading(false);
    }
  };

  // Email Sign In / Sign Up handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (isSignUpMode) {
        // Register new account via /api/auth/register
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }

        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          setError(regData.error || 'Registration failed.');
          setIsLoading(false);
          return;
        }

        // Auto sign-in with newly created credentials
        const loginRes = await signIn('credentials', {
          email: cleanEmail,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          onSuccess?.();
          onClose();
        } else {
          setError(loginRes?.error || 'Account created! Please log in.');
        }
      } else {
        // Sign-in with existing credentials
        const loginRes = await signIn('credentials', {
          email: cleanEmail,
          password: password || undefined,
          redirect: false,
        });

        if (loginRes?.ok) {
          onSuccess?.();
          onClose();
        } else {
          const errText = loginRes?.error || 'Authentication failed.';
          if (errText.includes('sign up first') || errText.includes('No account found')) {
            // Auto switch to sign up prompt
            setIsSignUpMode(true);
            setError('No account found with this email. Please enter a password to sign up:');
          } else {
            setError(errText);
          }
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Centered Video Camera Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-cyan-400 shadow-xl shadow-indigo-500/10">
          <Video className="h-8 w-8 text-cyan-400" />
        </div>

        {/* Heading & Subheading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign up to continue your cut
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Your video upload is paused. Sign in to continue with the setup and AI cut flow.
          </p>
        </div>

        {/* Pending Files Notification Badge */}
        {pendingFiles && pendingFiles.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>
              {pendingFiles.length} {pendingFiles.length === 1 ? 'video' : 'videos'} queued • Resumes automatically
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-500/40 p-3 text-left text-xs text-red-300 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {/* Main Interaction Areas */}
        <div className="space-y-3 pt-1">
          {/* Continue with Google Button with authentic Google logo */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-850 hover:border-zinc-700 p-3.5 text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
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
            <span>Continue with Google</span>
          </button>
        </div>

        {/* 3. OR WITH EMAIL Divider */}
        <div className="relative flex items-center justify-center py-1">
          <div className="w-full border-t border-zinc-800" />
          <span className="absolute bg-zinc-950 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            OR WITH EMAIL
          </span>
        </div>

        {/* Email & Password Input Area */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                required
                className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Password field if in sign up mode or password entry */}
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUpMode ? 'Create a password (min. 6 chars)' : 'Password (optional if passwordless)'}
                className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Continue with Email Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white font-semibold py-3 text-xs shadow-sm hover:border-zinc-600 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>{isSignUpMode ? 'Create Account & Resume' : 'Continue with Email'}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5 text-cyan-400" />
              </>
            )}
          </button>

          {/* Mode Toggle Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode((prev) => !prev);
                setError(null);
              }}
              className="text-[11px] text-zinc-400 hover:text-cyan-400 transition-colors"
            >
              {isSignUpMode
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up with email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

