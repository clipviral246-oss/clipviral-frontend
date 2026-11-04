# ClipViral AI - Stripe Integration & Setup Guide

This guide details how to set up the 3 subscription tiers (**Starter**, **Creator**, and **Pro**) in Stripe and configure webhooks to automatically update your Prisma database.

---

## ⚡ Option 1: Automated Script (Recommended)

Once you have added your `STRIPE_SECRET_KEY` into `.env.local`:

```bash
node scripts/setup-stripe.mjs
```

The script will automatically:
1. Create the **Starter**, **Creator**, and **Pro** products.
2. Create both **Monthly** and **Yearly** recurring prices with the 20% discount.
3. Print the exact price IDs to copy into your `.env.local`.

---

## 🛠️ Option 2: Manual Setup in Stripe Dashboard

If you prefer setting up via the Stripe Web UI ([dashboard.stripe.com](https://dashboard.stripe.com/test/products)):

### 1. Tier 1: Starter
- **Product Name**: `ClipViral AI Starter`
- **Price 1 (Monthly)**:
  - Amount: `19.00 EUR`
  - Billing period: `Monthly`
  - Recurring: Yes
- **Price 2 (Yearly - Billed Annually)**:
  - Amount: `180.00 EUR` (equivalent to €15/month)
  - Billing period: `Yearly`
  - Recurring: Yes

### 2. Tier 2: Creator (Most Popular)
- **Product Name**: `ClipViral AI Creator`
- **Price 1 (Monthly)**:
  - Amount: `49.00 EUR`
  - Billing period: `Monthly`
  - Recurring: Yes
- **Price 2 (Yearly - Billed Annually)**:
  - Amount: `468.00 EUR` (equivalent to €39/month)
  - Billing period: `Yearly`
  - Recurring: Yes

### 3. Tier 3: Pro / Agency
- **Product Name**: `ClipViral AI Pro`
- **Price 1 (Monthly)**:
  - Amount: `99.00 EUR`
  - Billing period: `Monthly`
  - Recurring: Yes
- **Price 2 (Yearly - Billed Annually)**:
  - Amount: `948.00 EUR` (equivalent to €79/month)
  - Billing period: `Yearly`
  - Recurring: Yes

---

## 🔔 Webhook Configuration

### Local Testing with Stripe CLI
1. Download or install the [Stripe CLI](https://docs.stripe.com/stripe-cli).
2. Login to your account:
   ```bash
   stripe login
   ```
3. Forward events to your local Next.js server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret output (`whsec_...`) and paste it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### Production Webhook Setup
1. Go to **Stripe Dashboard -> Developers -> Webhooks -> Add endpoint**.
2. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
3. **Events to Send**:
   - `checkout.session.completed` (activates subscription on checkout)
   - `customer.subscription.updated` (tracks renewals, tier switches, cancellations)
   - `customer.subscription.deleted` (downgrades expired accounts to Starter)
   - `invoice.payment_failed` (marks subscription past_due)
4. Copy the **Signing secret** (`whsec_...`) into your production environment variables.

---

## 📋 Environment Variables Checklist (`.env.local`)

```env
# Stripe Secret API Key (from Dashboard -> API Keys)
STRIPE_SECRET_KEY="sk_test_..."

# Stripe Webhook Signing Secret (from Webhooks -> Signing Secret)
STRIPE_WEBHOOK_SECRET="whsec_..."

# (Optional) Explicit Price IDs (if not using dynamic inline pricing)
STRIPE_PRICE_STARTER_MONTHLY="price_..."
STRIPE_PRICE_STARTER_YEARLY="price_..."
STRIPE_PRICE_CREATOR_MONTHLY="price_..."
STRIPE_PRICE_CREATOR_YEARLY="price_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_PRO_YEARLY="price_..."
```

---

## 🔄 How the Flow Works

1. **User selects plan** on `/pricing` (e.g., Creator Monthly or Yearly).
2. **Frontend calls** `POST /api/checkout` with `{ planId, billingCycle }`.
3. **Server generates** a secure Stripe Checkout Session with `mode: 'subscription'`, metadata, and returns the redirect URL.
4. **User completes payment** on Stripe's hosted checkout page.
5. **Stripe sends** `checkout.session.completed` to `/api/webhooks/stripe`.
6. **Webhook verifies signature** and upserts the `Subscription` table in Prisma with:
   - `status: 'active'`
   - `tier: 'creator'`
   - `stripeCustomerId: 'cus_...'`
   - `stripeSubscriptionId: 'sub_...'`
7. User is redirected back to `/dashboard?checkout_status=success` with unlocked features.

