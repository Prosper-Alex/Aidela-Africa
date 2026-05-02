// Key feature: Builds the password reset email subject and HTML body.
const brandName = "Aidela Africa";

const escapeHtml = (value) =>
  `${value}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

// Builds the email users receive when they ask to reset their password.
export const buildPasswordResetEmail = ({ name = "there", resetUrl }) => {
  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your Aidela Africa password",
    text: [
      `Hi ${name || "there"},`,
      "",
      "We received a request to reset your Aidela Africa password.",
      `Reset your password here: ${resetUrl}`,
      "",
      "This link expires in 15 minutes. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#102033;">
    <div style="display:none;max-height:0;overflow:hidden;">
      Reset your Aidela Africa password. This link expires in 15 minutes.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:1px solid #e2e8f0;">
                <div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f766e;">${brandName}</div>
                <h1 style="margin:14px 0 0;font-size:24px;line-height:1.3;color:#0f172a;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#334155;">
                  We received a request to reset your password. Tap the button below to choose a new one.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td bgcolor="#0f766e" style="border-radius:6px;">
                      <a href="${safeResetUrl}" style="display:inline-block;padding:14px 22px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
                        Reset password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#64748b;">
                  This link expires in 15 minutes. If you did not request a password reset, you can safely ignore this email.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
                  Button not working? Paste this link into your browser:<br />
                  <a href="${safeResetUrl}" style="color:#0f766e;word-break:break-all;">${safeResetUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
};
