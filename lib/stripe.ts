import Stripe from 'stripe';

export interface PricingPlan {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  monthlyPriceEur: number;
  yearlyPriceEur: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  maxClipsPerProject: number;
  exportResolution: string;
  features: string[];
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPriceEur: 19,
    yearlyPriceEur: 15,
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY,
    maxClipsPerProject: 10,
    exportResolution: '1080p Full HD',
    features: ['30 videos/mo', '10 clips/batch', 'Silence removal', 'DE & EN Subtitles'],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    monthlyPriceEur: 49,
    yearlyPriceEur: 39,
    monthlyPriceId: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_CREATOR_YEARLY,
    maxClipsPerProject: 25,
    exportResolution: '4K Ultra HD',
    features: ['Unlimited exports', '25+ clips/batch', 'AI B-Roll', 'Priority Queue', 'Team 3 seats'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPriceEur: 99,
    yearlyPriceEur: 79,
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
    maxClipsPerProject: 50,
    exportResolution: '4K ProRes / Custom',
    features: ['Unlimited batch 50+ clips', 'Dedicated GPU', 'Full API & Webhooks', '24/7 Slack support'],
  },
};

export class StripeService {
  private stripe: Stripe;
  private hasLiveSecret: boolean;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key';
    this.hasLiveSecret =
      secretKey !== 'sk_test_mock_stripe_key' &&
      !secretKey.startsWith('sk_test_mock') &&
      secretKey.startsWith('sk_');

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  /**
   * Generates a Stripe Checkout Session for subscription tiers
   */
  async createCheckoutSession(params: {
    planId: 'starter' | 'creator' | 'pro';
    billingCycle: 'monthly' | 'yearly';
    customerEmail?: string;
    userId?: string;
    locale?: 'de' | 'en';
  }): Promise<{ sessionId: string; url: string }> {
    const plan = PRICING_PLANS[params.planId];
    if (!plan) {
      throw new Error(`Invalid subscription plan: ${params.planId}`);
    }

    const appUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const lang = params.locale || 'de';

    const successUrl = `${appUrl}/${lang}/dashboard?checkout_status=success&session_id={CHECKOUT_SESSION_ID}&plan=${params.planId}`;
    const cancelUrl = `${appUrl}/${lang}/pricing?checkout_status=cancelled`;

    // Production flow when live Stripe Secret Key is present
    if (this.hasLiveSecret) {
      const isYearly = params.billingCycle === 'yearly';
      const existingPriceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;

      // Construct line items dynamically (supports direct Price ID or inline recurring price_data)
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = existingPriceId
        ? [{ price: existingPriceId, quantity: 1 }]
        : [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `ClipViral AI ${plan.name} (${isYearly ? 'Jährlich' : 'Monatlich'})`,
                description: `AI Video Editor Plan - ${plan.exportResolution}, max ${plan.maxClipsPerProject} clips/batch.`,
              },
              unit_amount: isYearly ? plan.yearlyPriceEur * 12 * 100 : plan.monthlyPriceEur * 100,
              recurring: {
                interval: isYearly ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ];

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: lineItems,
        customer_email: params.customerEmail,
        client_reference_id: params.userId || undefined,
        metadata: {
          userId: params.userId || 'anonymous_creator',
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
        subscription_data: {
          metadata: {
            userId: params.userId || 'anonymous_creator',
            planId: params.planId,
            billingCycle: params.billingCycle,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url || successUrl,
      };
    }

    // Development / Demo Fallback when testing without active Stripe API keys
    const mockSessionId = `cs_test_${Date.now()}_${params.planId}`;
    return {
      sessionId: mockSessionId,
      url: `${appUrl}/${lang}/dashboard?checkout_status=mock_success&plan=${params.planId}&session_id=${mockSessionId}`,
    };
  }

  /**
   * Verifies Stripe Webhook Event Signature
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

    if (this.hasLiveSecret && webhookSecret !== 'whsec_mock' && webhookSecret.startsWith('whsec_')) {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }

    // Mock parsed event for dev testing
    try {
      const parsed = JSON.parse(payload);
      return parsed as Stripe.Event;
    } catch {
      return {
        id: `evt_mock_${Date.now()}`,
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_mock',
            customer: 'cus_mock_123',
            subscription: 'sub_mock_123',
            metadata: {
              userId: 'user-creator-01',
              planId: 'creator',
              billingCycle: 'yearly',
            },
          } as any,
        },
      } as Stripe.Event;
    }
  }

  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

export const stripeService = new StripeService();
