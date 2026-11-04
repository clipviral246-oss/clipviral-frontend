import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser,
      });
    }

    // Create new user with default 'starter' subscription
    const newUser = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: name || sanitizedEmail.split('@')[0],
        image: image || null,
        subscriptions: {
          create: {
            tier: 'starter',
            status: 'active',
            billingCycle: 'monthly',
          },
        },
      },
      include: {
        subscriptions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'New user created successfully in database',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user in database', details: error.message },
      { status: 500 }
    );
  }
}

