const appName = process.env.APP_NAME || 'AuraRun';
const supportEmail = process.env.SUPPORT_EMAIL || 'support@aurarun.com';

const baseTemplate = ({ title, subtitle, body, ctaLabel, ctaUrl, note }) => `
  <div style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #eef0f2;">
        <h1 style="margin:0;font-size:22px;line-height:1.3;">${title}</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">${subtitle}</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${body}</p>
        <a href="${ctaUrl}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
          ${ctaLabel}
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#6b7280;word-break:break-all;">${ctaUrl}</p>
        <p style="margin:18px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">${note}</p>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #eef0f2;background:#fafafa;font-size:12px;color:#6b7280;">
        ${appName} · Need help? ${supportEmail}
      </div>
    </div>
  </div>
`;

export const buildVerifyEmailTemplate = ({ name = 'there', verifyUrl }) => {
  const title = `Verify your ${appName} account`;
  const subtitle = 'Confirm your email to activate account features.';
  const body = `Hi ${name}, please verify your email address to secure your account and enable order updates.`;
  const note = 'This link expires in 24 hours. If you did not create this account, you can ignore this email.';

  return {
    subject: `${appName}: Verify your email`,
    html: baseTemplate({
      title,
      subtitle,
      body,
      ctaLabel: 'Verify Email',
      ctaUrl: verifyUrl,
      note,
    }),
  };
};

export const buildResetPasswordTemplate = ({ name = 'there', resetUrl }) => {
  const title = `Reset your ${appName} password`;
  const subtitle = 'Use the secure link below to choose a new password.';
  const body = `Hi ${name}, we received a request to reset your password. Click below to continue.`;
  const note = 'This link expires in 30 minutes. If you did not request this, ignore this email and your password will remain unchanged.';

  return {
    subject: `${appName}: Password reset request`,
    html: baseTemplate({
      title,
      subtitle,
      body,
      ctaLabel: 'Reset Password',
      ctaUrl: resetUrl,
      note,
    }),
  };
};

export const buildSignupOtpTemplate = ({ name = 'there', otp }) => {
  const title = `Complete your ${appName} signup`;
  const subtitle = 'Use this one-time password to verify your account.';
  const body = `Hi ${name}, enter the OTP below to complete your registration.`;
  const note = 'This OTP expires in 10 minutes. Do not share it with anyone.';

  return {
    subject: `${appName}: Your signup OTP`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eef0f2;">
            <h1 style="margin:0;font-size:22px;line-height:1.3;">${title}</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">${subtitle}</p>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${body}</p>
            <div style="display:inline-block;padding:12px 18px;border:1px dashed #f97316;border-radius:10px;font-size:28px;font-weight:700;letter-spacing:0.16em;color:#111827;">
              ${otp}
            </div>
            <p style="margin:18px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">${note}</p>
          </div>
          <div style="padding:14px 24px;border-top:1px solid #eef0f2;background:#fafafa;font-size:12px;color:#6b7280;">
            ${appName} · Need help? ${supportEmail}
          </div>
        </div>
      </div>
    `,
  };
};
