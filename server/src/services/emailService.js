import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!transporter) {
    // Sanitize app password in case spaces were copied directly from Google
    const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: appPassword, // Uses the cleaned password variable
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email delivery failed:", err);
    throw err;
  }
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
      <h2>Hi ${user.profile?.firstName || "there"},</h2>

      <p>The ${draw.periodKey} prize draw has been published.</p>

      ${
        won
          ? `<p><strong>You have winning matches!</strong></p>
             <ul>${winLines}</ul>
             <p>Please log in to upload your scorecard proof for verification.</p>`
          : `<p>Better luck next month — keep logging your scores!</p>`
      }
    `,
    text: subject,
  });
}

export async function sendWinnerAlertEmail(user, winner) {
  await sendEmail({
    to: user.email,
    subject: `Upload proof for your ${winner.tier}-Match win`,
    html: `
      <h2>Hi ${user.profile?.firstName || "there"},</h2>

      <p>You won ${(winner.prizeAmount / 100).toFixed(2)} GBP.</p>

      <p>Please upload your scorecard proof.</p>
    `,
    text: `You won ${winner.tier}-Match.`,
  });
}

export async function sendPasswordResetOtpEmail(user, otp) {
  await sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    html: `
      <h2>Hello ${user.profile?.firstName || "there"},</h2>

      <p>Your OTP is:</p>

      <h1 style="font-size:40px;letter-spacing:6px;color:#16a34a;">
        ${otp}
      </h1>

      <p>This OTP is valid for <b>10 minutes</b>.</p>

      <p>If you didn't request a password reset, ignore this email.</p>
    `,
    text: `Your password reset OTP is ${otp}.`,
  });
}

export async function sendSubscriptionEmail(user, subscription, event) {
  const messages = {
    activated: `Your ${subscription.plan} subscription is now active.`,
    canceled: "Your subscription has been canceled.",
    lapsed: "Your subscription has expired.",
  };

  await sendEmail({
    to: user.email,
    subject: `Subscription ${event}`,
    html: `
      <h2>Hi ${user.profile?.firstName || "there"},</h2>

      <p>${messages[event]}</p>
    `,
    text: messages[event],
  });
}