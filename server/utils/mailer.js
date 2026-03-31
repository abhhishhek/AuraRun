import nodemailer from 'nodemailer';

const isMailerConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.MAIL_FROM
);

const getTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!isMailerConfigured()) {
    throw new Error('SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.');
  }

  const transport = getTransport();
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

export { isMailerConfigured };

