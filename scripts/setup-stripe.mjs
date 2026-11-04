/**
 * ClipViral AI - Automatic Stripe Products & Prices Setup Script
 * Run: node scripts/setup-stripe.mjs
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey || secretKey.startsWith('sk_test_mock')) {
  console.log('⚠️ Please set a valid STRIPE_SECRET_KEY in your .env.local file first.');
  console.log('Example: STRIPE_SECRET_KEY=sk_test_51Pxxxxxxxxxxxx');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const TIERS = [
  {
    id: 'starter',
    name: 'ClipViral AI Starter',
    description: 'Perfect for hobbyists - 30 exports/mo, 10 clips/batch, 1080p Full-HD.',
    monthlyEur: 19,
    yearlyEurPerMonth: 15,
  },
  {
    id: 'creator',
    name: 'ClipViral AI Creator',
    description: 'Most Popular - Unlimited exports, 25+ clips/batch, 4K Ultra-HD, Priority Queue.',
    monthlyEur: 49,
    yearlyEurPerMonth: 39,
  },
  {
    id: 'pro',
    name: 'ClipViral AI Pro / Agency',
    description: 'Maximum throughput - 50+ batch uploads, dedicated GPU render nodes, full API access.',
    monthlyEur: 99,
    yearlyEurPerMonth: 79,
  },
];

async function setup() {
  console.log('🚀 Initializing ClipViral AI Stripe Products & Recurring Prices...\n');
  const results = {};

  for (const tier of TIERS) {
    console.log(`📦 Creating Product: ${tier.name}...`);

    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: {
        tier: tier.id,
      },
    });

    console.log(`  ✓ Product ID: ${product.id}`);

    // Create Monthly Recurring Price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: tier.monthlyEur * 100,
      recurring: {
        interval: 'month',
      },
      nickname: `${tier.name} - Monthly`,
      metadata: {
        tier: tier.id,
        billingCycle: 'monthly',
      },
    });
    console.log(`  ✓ Monthly Price (€${tier.monthlyEur}/mo): ${monthlyPrice.id}`);

    // Create Yearly Recurring Price (Billed Annually)
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: tier.yearlyEurPerMonth * 12 * 100,
      recurring: {
        interval: 'year',
      },
      nickname: `${tier.name} - Yearly`,
      metadata: {
        tier: tier.id,
        billingCycle: 'yearly',
      },
    });
    console.log(`  ✓ Yearly Price (€${tier.yearlyEurPerMonth * 12}/yr): ${yearlyPrice.id}\n`);

    results[tier.id] = {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    };
  }

  console.log('🎉 Setup Complete! Add these Price IDs to your .env.local file:');
  console.log('===============================================================');
  console.log(`STRIPE_PRICE_STARTER_MONTHLY="${results.starter.monthlyPriceId}"`);
  console.log(`STRIPE_PRICE_STARTER_YEARLY="${results.starter.yearlyPriceId}"`);
  console.log(`STRIPE_PRICE_CREATOR_MONTHLY="${results.creator.monthlyPriceId}"`);
  console.log(`STRIPE_PRICE_CREATOR_YEARLY="${results.creator.yearlyPriceId}"`);
  console.log(`STRIPE_PRICE_PRO_MONTHLY="${results.pro.monthlyPriceId}"`);
  console.log(`STRIPE_PRICE_PRO_YEARLY="${results.pro.yearlyPriceId}"`);
  console.log('===============================================================\n');
}

setup().catch((err) => {
  console.error('❌ Error creating Stripe products:', err);
  process.exit(1);
});

