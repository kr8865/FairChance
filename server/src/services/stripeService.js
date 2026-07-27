import Stripe from 'stripe';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Donation } from '../models/Donation.js';
import { activateDemoSubscription } from './appService.js';

let stripe = null;
if (config.stripeSecretKey) {
  stripe = new Stripe(config.stripeSecretKey);
}

export function isStripeConfigured() {
  return Boolean(stripe && config.stripeMonthlyPriceId && config.stripeYearlyPriceId);
}

export async function createCheckoutSession(userId, plan) {
  if (!isStripeConfigured()) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let sub = await Subscription.findOne({ userId });
  if (!sub) {
    sub = await Subscription.create({ userId, status: 'none', priceAmount: plan === 'yearly' ? 9900 : 999 });
  }

  let customerId = sub.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
      metadata: { userId: userId.toString() },
    });
    customerId = customer.id;
    sub.stripeCustomerId = customerId;
    await sub.save();
  }

  const priceId = plan === 'yearly' ? config.stripeYearlyPriceId : config.stripeMonthlyPriceId;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.clientUrl}/dashboard?subscribed=1`,
    cancel_url: `${config.clientUrl}/pricing?canceled=1`,
    metadata: { userId: userId.toString(), plan },
  });

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(userId) {
  if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
  const sub = await Subscription.findOne({ userId });
  if (!sub?.stripeCustomerId) throw new Error('No billing account found');
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${config.clientUrl}/dashboard`,
  });
  return { url: session.url };
}

async function recordCharityAllocation(user) {
  if (!user.charityPreference?.charityId) return;
  const sub = await Subscription.findOne({ userId: user._id });
  if (!sub || sub.status !== 'active') return;
  const amount = Math.floor(sub.priceAmount * (user.charityPreference.contributionPercent / 100));
  await Donation.create({
    userId: user._id,
    charityId: user.charityPreference.charityId,
    type: 'subscription_allocation',
    amount,
    status: 'completed',
    subscriptionId: sub._id,
  });
}

async function syncSubscriptionFromStripe(stripeSub, userId) {
  const plan = stripeSub.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
  const priceAmount = stripeSub.items.data[0]?.price?.unit_amount ?? (plan === 'yearly' ? 9900 : 999);
  const statusMap = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'lapsed',
    incomplete: 'none',
    incomplete_expired: 'lapsed',
    paused: 'lapsed',
  };
  const status = statusMap[stripeSub.status] ?? 'none';

  await Subscription.findOneAndUpdate(
    { userId },
    {
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id,
      plan,
      status,
      priceAmount,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    { upsert: true }
  );
}

export async function handleStripeWebhook(rawBody, signature) {
  if (!stripe || !config.stripeWebhookSecret) {
    throw new Error('Stripe webhook not configured');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscriptionFromStripe(stripeSub, userId);
        const user = await User.findById(userId);
        if (user) await recordCharityAllocation(user);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object;
      const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
      if (sub) {
        await syncSubscriptionFromStripe(stripeSub, sub.userId.toString());
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
        if (sub) {
          sub.status = 'past_due';
          await sub.save();
        }
      }
      break;
    }
    default:
      break;
  }

  return event;
}

export async function cancelSubscription(userId) {
  const sub = await Subscription.findOne({ userId });
  if (!sub) throw new Error('No subscription found');

  if (sub.stripeSubscriptionId && stripe) {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    sub.cancelAtPeriodEnd = true;
    await sub.save();
    return sub;
  }

  sub.cancelAtPeriodEnd = true;
  await sub.save();
  return sub;
}

export async function subscribeUser(userId, plan) {
  if (isStripeConfigured()) {
    try {
      return await createCheckoutSession(userId, plan);
    } catch (err) {
      console.warn('[Stripe Checkout fallback] Could not create session:', err.message);
    }
  }
  await activateDemoSubscription(userId, plan);
  const user = await User.findById(userId);
  if (user) await recordCharityAllocation(user);
  const subscription = await Subscription.findOne({ userId });
  return { demo: true, subscription };
}
