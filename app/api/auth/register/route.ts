import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Strict Check: Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    // Securely hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = name?.trim() || sanitizedEmail.split('@')[0];

    // Create user in MongoDB with default starter subscription
    const newUser = await (prisma.user as any).create({
      data: {
        email: sanitizedEmail,
        name: userName,
        password: hashedPassword,
        image: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        subscriptions: {
          create: {
            tier: 'starter',
            status: 'active',
            billingCycle: 'monthly',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Logging you in...',
      user: newUser,
    });
  } catch (error: any) {
    console.error('[Registration API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create user account in database.' },
      { status: 500 }
    );
  }
}
