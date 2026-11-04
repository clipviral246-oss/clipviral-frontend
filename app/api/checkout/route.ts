import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeService } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { planId, billingCycle, customerEmail, locale } = body;

    if (!planId || !['starter', 'creator', 'pro'].includes(planId)) {
      return NextResponse.json(
        { error: 'Valid planId ("starter", "creator", "pro") is required' },
        { status: 400 }
      );
    }

    const userId = (session?.user as any)?.id;
    const email = customerEmail || session?.user?.email || undefined;

    const checkout = await stripeService.createCheckoutSession({
      planId,
      billingCycle: billingCycle === 'yearly' ? 'yearly' : 'monthly',
      customerEmail: email,
      userId,
      locale: locale === 'en' ? 'en' : 'de',
    });

    return NextResponse.json({
      success: true,
      url: checkout.url,
      sessionId: checkout.sessionId,
    });
  } catch (error: any) {
    console.error('API /api/checkout POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe checkout session', details: error.message },
      { status: 500 }
    );
  }
}
