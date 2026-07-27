import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.trim();

    transporter = nodemailer.createTransport({
      service:"Gmail",
      port: 465,
      secure: true, // Use TLS/SSL
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await getTransporter().sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email Sent successfully to:", to, info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email Error dispatching to:", to, err.message);
    throw err;
  }
}

export async function sendRegistrationOtpEmail(email, otp) {
  await sendEmail({
    to: email,
    subject: "Verify Your Email - Fairway Forward",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Welcome to Fairway Forward</h2>
        <p style="color: #475569; font-size: 15px;">Your email verification code is:</p>
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="color: #16a34a; font-size: 36px; font-weight: bold; letter-spacing: 6px; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your Fairway Forward registration OTP is ${otp}`,
  });
}

export async function sendDrawResultsEmail(user, draw, winnings) {
  const won = winnings.length > 0;

  const subject = won
    ? `Congratulations! You won in the ${draw.periodKey} draw`
    : `Draw results for ${draw.periodKey}`;

  const winLines = winnings
    .map(
      (w) =>
        `<li>${w.tier}-Match: ${(w.prizeAmount / 100).toFixed(2)} GBP</li>`
    )
    .join("");

  await sendEmail({
    to: user.email,
    subject,
    html: `
      <h2>Hello ${user.profile.firstName}</h2>

      <p>The ${draw.periodKey} prize draw has been published.</p>

      ${
        won
          ? `
          <p><strong>You have winning matches!</strong></p>
          <ul>${winLines}</ul>
          <p>Please upload your scorecard proof.</p>
        `
          : `
          <p>Better luck next month.</p>
        `
      }

      <a href="${config.clientUrl}/dashboard">
        Dashboard
      </a>
    `,
    text: subject,
  });
}

export async function sendWinnerAlertEmail(user, winner) {
  await sendEmail({
    to: user.email,
    subject: "Winner Notification",
    html: `
      <h2>Hello ${user.profile.firstName}</h2>

      <p>
        Congratulations!
      </p>

      <p>
        You won ${(winner.prizeAmount / 100).toFixed(2)} GBP
        in ${winner.tier}-Match.
      </p>

      <a href="${config.clientUrl}/dashboard">
        Upload Proof
      </a>
    `,
    text: "Congratulations! You won.",
  });
}

export async function sendPasswordResetOtpEmail(user, otp) {
  await sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family:Arial;padding:20px">

        <h2>Hello ${user.profile.firstName}</h2>

        <p>Your password reset OTP is:</p>

        <h1 style="
          color:#16a34a;
          font-size:42px;
          letter-spacing:8px;
          text-align:center;
        ">
          ${otp}
        </h1>

        <p>
          This OTP is valid for
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this,
          ignore this email.
        </p>

      </div>
    `,
    text: `Your OTP is ${otp}`,
  });
}

export async function sendSubscriptionEmail(user, subscription, event) {
  const messages = {
    activated: `Your ${subscription.plan} subscription is active.`,
    canceled: "Your subscription has been cancelled.",
    lapsed: "Your subscription has expired.",
  };

  await sendEmail({
    to: user.email,
    subject: "Subscription Update",
    html: `
      <h2>Hello ${user.profile.firstName}</h2>

      <p>${messages[event]}</p>
    `,
    text: messages[event],
  });
}