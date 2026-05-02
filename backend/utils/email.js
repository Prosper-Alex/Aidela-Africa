// Key feature: Sends transactional password reset emails through the Resend API.
import { Resend } from "resend";

const APP_NAME = "Aidela Africa";
const DEFAULT_EMAIL_FROM = "Aidela Africa <onboarding@resend.dev>";

const escapeHtml = (value) =>
  `${value}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send emails");
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const getEmailFrom = () => {
  return process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;
};

export const sendResetEmail = async (email, resetUrl) => {
  const resend = getResendClient();
  const safeResetUrl = escapeHtml(resetUrl);

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Reset your password",
    text: [
      `Reset your ${APP_NAME} password`,
      "",
      "We received a request to reset your password.",
      "Use the link below to choose a new password. This link expires in 15 minutes.",
      "",
      resetUrl,
      "",
      "If you did not request this, ignore this email. Your password will stay unchanged.",
    ].join("\n"),
    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Reset your password</title>
        </head>
        <body style="margin:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#08111f,#0f766e);padding:34px 32px;">
                      <p style="margin:0;color:#99f6e4;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">${APP_NAME}</p>
                      <h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;line-height:1.2;">Reset your password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:#334155;">
                        We received a request to reset the password for your ${APP_NAME} account.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                        <tr>
                          <td bgcolor="#0f766e" style="border-radius:12px;">
                            <a href="${safeResetUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
                        This link expires in 15 minutes. For your security, do not share it with anyone.
                      </p>
                      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#64748b;">
                        If the button does not work, copy and paste this link into your browser:
                      </p>
                      <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#0f766e;">
                        <a href="${safeResetUrl}" style="color:#0f766e;">${safeResetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:22px 32px;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
                        If you did not request this, ignore this email. Your password will stay unchanged.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message || "Resend email request failed");
  }

  console.info(`Password reset email sent to ${email}: ${data?.id || "no-id"}`);
  return data;
};
