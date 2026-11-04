import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClipViral AI | AI Video Editor for Viral Content',
  description:
    'Turn raw clips into viral TikToks, Reels, and YouTube Shorts with automated FFmpeg slicing, speech-to-text, and manual timeline trimming.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}
