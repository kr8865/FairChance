import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import {
  subscribeUser,
  cancelSubscription,
  createBillingPortalSession,
  isStripeConfigured,
  handleStripeWebhook,
} from '../services/stripeService.js';

export const billingRouter = Router();

billingRouter.get('/plans', (_req, res) => {
  res.json({
    monthly: { price: 999, currency: 'gbp', label: '£9.99/month' },
    yearly: { price: 9900, currency: 'gbp', label: '£99/year', discount: '17% off' },
    stripeEnabled: isStripeConfigured(),
  });
});

billingRouter.use(authenticate);

billingRouter.post('/subscribe', async (req, res) => {
  try {
    const { plan } = z.object({ plan: z.enum(['monthly', 'yearly']) }).parse(req.body);
    const result = await subscribeUser(req.user._id.toString(), plan);
    if (result.url) {
      return res.json({ checkoutUrl: result.url });
    }
    res.json({ subscription: result.subscription, demo: true, message: 'Subscription activated' });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Subscription failed' });
  }
});

billingRouter.post('/demo-subscribe', async (req, res) => {
  try {
    const { plan } = z.object({ plan: z.enum(['monthly', 'yearly']) }).parse(req.body);
    const result = await subscribeUser(req.user._id.toString(), plan);
    res.json({ subscription: result.subscription ?? result, demo: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Subscription failed' });
  }
});

billingRouter.post('/cancel', async (req, res) => {
  try {
    const subscription = await cancelSubscription(req.user._id.toString());
    res.json({ subscription, message: 'Subscription will cancel at period end' });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Cancel failed' });
  }
});

billingRouter.post('/portal', async (req, res) => {
  try {
    const session = await createBillingPortalSession(req.user._id.toString());
    res.json({ url: session.url });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Portal unavailable' });
  }
});

export async function stripeWebhookHandler(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing signature' });
    await handleStripeWebhook(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    console.error('[stripe webhook]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : 'Webhook error' });
  }
}
