import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    await getTransporter().verify();
    console.log("✅ Gmail Connected");

    const info = await getTransporter().sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email Sent:", info.response);

    return info;
  } catch (err) {
    console.error("❌ Email Error");
    console.error(err);
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