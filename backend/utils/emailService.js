// Key feature: Sends reusable authentication emails through Mailtrap SMTP.
import nodemailer from "nodemailer";

const APP_NAME = "Aidela Africa";
const DEFAULT_EMAIL_FROM = "Aidela Africa <noreply@aidelaafrica.com>";

const escapeHtml = (value) =>
  `${value}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getEmailFrom = () => process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;

const getMailtrapConfig = () => ({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.MAILTRAP_PORT || 2525),
  user: process.env.MAILTRAP_USER,
  pass: process.env.MAILTRAP_PASS,
});

const getTransporter = () => {
  const config = getMailtrapConfig();

  if (!config.user || !config.pass) {
    throw new Error("MAILTRAP_USER and MAILTRAP_PASS are required to send emails");
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: getEmailFrom(),
      to,
      subject,
      text,
      html,
    });

    console.info(`Email queued for ${to}: ${info.messageId || "no-message-id"}`);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error(`Email delivery failed for ${to}: ${error.message}`);
    throw new Error("Unable to send email right now");
  }
};

const emailShell = ({ title, body, footer }) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:30px 30px 18px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0;color:#0649b5;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">${APP_NAME}</p>
                  <h1 style="margin:12px 0 0;color:#0f172a;font-size:26px;line-height:1.25;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">${body}</td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:20px 30px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">${footer}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

export const sendOtpEmail = async (email, otp) => {
  const safeOtp = escapeHtml(otp);

  return sendEmail({
    to: email,
    subject: "Your Aidela Africa Verification Code",
    text: [
      "Your Aidela Africa verification code",
      "",
      `Code: ${otp}`,
      "",
      "This code expires in 10 minutes. If you did not request it, ignore this email.",
    ].join("\n"),
    html: emailShell({
      title: "Verify your password reset",
      body: `
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
          Use this verification code to continue resetting your ${APP_NAME} password.
        </p>
        <div style="margin:26px 0;padding:20px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Verification code</p>
          <p style="margin:0;font-size:34px;letter-spacing:0.22em;font-weight:800;color:#0649b5;">${safeOtp}</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
          This code expires in 10 minutes. For your security, do not share it with anyone.
        </p>
      `,
      footer:
        "If you did not request this code, ignore this email. Your account remains protected.",
    }),
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const safeResetLink = escapeHtml(resetLink);

  return sendEmail({
    to: email,
    subject: "Reset your Aidela Africa password",
    text: [
      "Reset your Aidela Africa password",
      "",
      "Use the secure link below to choose a new password. It expires in 10 minutes.",
      resetLink,
      "",
      "If you did not request this, ignore this email.",
    ].join("\n"),
    html: emailShell({
      title: "Reset your password",
      body: `
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
          We received a request to reset your ${APP_NAME} password.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0;">
          <tr>
            <td bgcolor="#ed1e79" style="border-radius:10px;">
              <a href="${safeResetLink}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;">
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
          This link expires in 10 minutes. If the button does not work, copy and paste this link into your browser:
        </p>
        <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#0649b5;">
          <a href="${safeResetLink}" style="color:#0649b5;">${safeResetLink}</a>
        </p>
      `,
      footer:
        "If you did not request a password reset, ignore this email. Your password will not change.",
    }),
  });
};

export const sendSecurityAlert = async (email, details = {}) => {
  const action = escapeHtml(
    details.action || "A security-sensitive action happened on your account.",
  );

  return sendEmail({
    to: email,
    subject: details.subject || "Aidela Africa account security alert",
    text: [
      "Aidela Africa account security alert",
      "",
      details.action || "A security-sensitive action happened on your account.",
      "",
      "If this was not you, reset your password immediately.",
    ].join("\n"),
    html: emailShell({
      title: "Security alert",
      body: `
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">${action}</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
          If this was you, no action is needed. If not, reset your password immediately.
        </p>
      `,
      footer:
        "Aidela Africa sends security alerts to help protect your account.",
    }),
  });
};
