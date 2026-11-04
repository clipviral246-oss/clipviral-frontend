import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err: any) {
      console.error(`[Stripe Webhook Signature Verification Failed]:`, err.message);
      return NextResponse.json({ error: `Webhook Signature Error: ${err.message}` }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Verified event: ${event.type} (${event.id})`);

    switch (event.type) {
      // 1. Checkout Session Completed: First-time purchase or upgrade
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId =
          typeof session.customer === 'string'
            ? session.customer
            : (session.customer as any)?.id || null;

        const stripeSubscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription as any)?.id || null;

        const metadata = session.metadata || {};
        const planTier = (metadata.planId as string) || 'creator';
        const billingCycle = (metadata.billingCycle as string) || 'monthly';

        // Find user by metadata userId or email
        let targetUserId: string | null = metadata.userId && metadata.userId !== 'anonymous_creator' ? metadata.userId : null;
        if (!targetUserId) {
          const email = session.customer_email || session.customer_details?.email;
          if (email) {
            const foundUser = await prisma.user.findUnique({
              where: { email },
            });
            targetUserId = foundUser ? foundUser.id : null;
          }
        }

        if (targetUserId && stripeSubscriptionId) {
          const finalUserId = targetUserId;
          // Upsert active subscription record in Prisma
          await prisma.subscription.upsert({
            where: {
              stripeSubscriptionId,
            },
            update: {
              status: 'active',
              tier: planTier,
              billingCycle,
              stripeCustomerId,
              cancelAtPeriodEnd: false,
            },
            create: {
              userId: finalUserId,
              stripeCustomerId,
              stripeSubscriptionId,
              tier: planTier,
              status: 'active',
              billingCycle,
              cancelAtPeriodEnd: false,
            },
          });

          console.log(
            `[Stripe Webhook] Subscription created/updated in DB for User ${finalUserId}: Tier ${planTier} (${billingCycle}).`
          );
        }
        break;
      }

      // 2. Subscription Updated: Plan changes, billing renewals, cancellations scheduled
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;
        const stripeCustomerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : (subscription.customer as any)?.id || null;

        const metadata = subscription.metadata || {};
        const updatedTier = metadata.planId || undefined;
        const billingCycle = metadata.billingCycle || undefined;

        // Current period timestamps
        const currentPeriodStart = (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000)
          : undefined;
        const currentPeriodEnd = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : undefined;

        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId,
          },
          data: {
            status: subscription.status, // 'active', 'past_due', 'canceled', 'trialing'
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeCustomerId,
            ...(updatedTier ? { tier: updatedTier } : {}),
            ...(billingCycle ? { billingCycle } : {}),
            ...(currentPeriodStart ? { currentPeriodStart } : {}),
            ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
          },
        });

        console.log(
          `[Stripe Webhook] Subscription ${stripeSubscriptionId} status updated to: ${subscription.status}.`
        );
        break;
      }

      // 3. Subscription Deleted: Subscription expired or immediately canceled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubscriptionId = subscription.id;

        // Downgrade user's subscription to 'starter' with status 'canceled'
        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId,
          },
          data: {
            status: 'canceled',
            tier: 'starter',
            cancelAtPeriodEnd: false,
          },
        });

        console.log(
          `[Stripe Webhook] Subscription ${stripeSubscriptionId} deleted. Reverted to starter tier.`
        );
        break;
      }

      // 4. Invoice Payment Failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof (invoice as any).subscription === 'string'
            ? (invoice as any).subscription
            : (invoice as any).subscription?.id;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'past_due' },
          });
          console.warn(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}. Marked past_due.`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('API /api/webhooks/stripe Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
