import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,      // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
      },
    });
  }

  return transporter;
}


export async function sendEmail({ to, subject, html, text }) {
  const from = config.emailFrom;
  try {
    const info = await getTransporter().sendMail({ from, to, subject, html, text });
    if (!config.smtpHost) {
      console.log('[email:dev]', { to, subject, preview: text?.slice(0, 120) });
    }
    return info;
  } catch (err) {
    console.error('[email:error]', err);
  }
}

export async function sendDrawResultsEmail(user, draw, winnings) {
  const won = winnings.length > 0;
  const subject = won
    ? `Congratulations! You won in the ${draw.periodKey} draw`
    : `Draw results for ${draw.periodKey}`;

  const winLines = winnings
    .map((w) => `<li>${w.tier}-Match: ${(w.prizeAmount / 100).toFixed(2)} GBP</li>`)
    .join('');

  const html = `
    <h2>Hi ${user.profile.firstName},</h2>
    <p>The ${draw.periodKey} prize draw has been published.</p>
    ${won
      ? `<p><strong>You have winning matches!</strong></p><ul>${winLines}</ul>
         <p>Please log in to upload your scorecard proof for verification.</p>`
      : '<p>Better luck next month — keep logging your scores!</p>'}
    <p><a href="${config.clientUrl}/dashboard">View your dashboard</a></p>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text: subject,
  });
}

export async function sendWinnerAlertEmail(user, winner) {
  await sendEmail({
    to: user.email,
    subject: `Action required: Upload proof for your ${winner.tier}-Match win`,
    html: `
      <h2>Hi ${user.profile.firstName},</h2>
      <p>You won ${(winner.prizeAmount / 100).toFixed(2)} GBP in the ${winner.tier}-Match tier.</p>
      <p>Upload a screenshot of your scorecard to claim your prize.</p>
      <p><a href="${config.clientUrl}/dashboard">Upload proof now</a></p>
    `,
    text: `You won in the ${winner.tier}-Match tier. Upload proof at ${config.clientUrl}/dashboard`,
  });
}

export async function sendSubscriptionEmail(user, subscription, event) {
  const messages = {
    activated: `Your ${subscription.plan} subscription is now active.`,
    canceled: 'Your subscription will cancel at the end of the current billing period.',
    lapsed: 'Your subscription has lapsed. Renew to continue entering draws.',
  };
  const text = messages[event] ?? 'Your subscription status has changed.';
  await sendEmail({
    to: user.email,
    subject: `Fairway Forward — Subscription ${event}`,
    html: `<p>Hi ${user.profile.firstName},</p><p>${text}</p>`,
    text,
  });
}
