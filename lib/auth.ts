import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import InstagramProvider from 'next-auth/providers/instagram';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
      allowDangerousEmailAccountLinking: true,
    }),
    // Instagram Graph API Provider
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || 'mock-instagram-client-id',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'mock-instagram-client-secret',
      authorization: {
        params: {
          scope: 'user_profile,user_media,instagram_basic,instagram_content_publish',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    // TikTok Content Posting API Provider
    {
      id: 'tiktok',
      name: 'TikTok',
      type: 'oauth',
      version: '2.0',
      authorization: {
        url: 'https://www.tiktok.com/v2/auth/authorize/',
        params: {
          client_key: process.env.TIKTOK_CLIENT_KEY || 'mock-tiktok-key',
          scope: 'user.info.basic,video.upload,video.publish',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
      },
      userinfo: 'https://open.tiktokapis.com/v2/user/info/',
      profile(profile: any) {
        return {
          id: profile.data?.user?.open_id || profile.open_id || `tiktok_${Date.now()}`,
          name: profile.data?.user?.display_name || 'TikTok Creator',
          email: profile.data?.user?.email || null,
          image: profile.data?.user?.avatar_url || null,
        };
      },
      clientId: process.env.TIKTOK_CLIENT_KEY || 'mock-tiktok-key',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || 'mock-tiktok-secret',
      allowDangerousEmailAccountLinking: true,
    },
    // Passwordless Email / Magic Link Provider
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.sendgrid.net',
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'apikey',
          pass: process.env.EMAIL_SERVER_PASSWORD || 'mock-sendgrid-key',
        },
      },
      from: process.env.EMAIL_FROM || 'ClipViral AI <noreply@clipviral.ai>',
    }),
    // Credentials / Instant Creator Login Provider
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Passwordless Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'creator@clipviral.ai' },
        name: { label: 'Name', type: 'text', placeholder: 'Viral Creator' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const name = credentials.name || email.split('@')[0];

        try {
          const user = await prisma.user.upsert({
            where: { email },
            update: {
              name,
            },
            create: {
              email,
              name,
              image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
          });

          return user;
        } catch (dbError) {
          console.warn('[Prisma Auth Fallback] Database offline or connecting:', dbError);
          return {
            id: `usr_${Date.now()}`,
            name,
            email,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email) {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || undefined,
              image: user.image || undefined,
            },
            create: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.image,
            },
          });
        } catch (e) {
          console.warn('[Prisma signIn sync warning]:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;

        // Fetch user's active Stripe subscription tier and connected social accounts
        try {
          if (token.id) {
            const [subscription, accounts] = await Promise.all([
              prisma.subscription.findFirst({
                where: {
                  userId: token.id as string,
                  status: 'active',
                },
              }),
              prisma.account.findMany({
                where: {
                  userId: token.id as string,
                },
                select: {
                  provider: true,
                },
              }),
            ]);

            (session.user as any).subscriptionTier = subscription?.tier || 'starter';
            (session.user as any).connectedAccounts = accounts.map((a) => a.provider);
          }
        } catch (e) {
          (session.user as any).subscriptionTier = 'starter';
          (session.user as any).connectedAccounts = [];
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'clipviral-ai-editor-super-secret-dev-key-2026',
};
