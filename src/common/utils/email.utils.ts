import nodemailer from 'nodemailer';
import { config } from '@config/app.config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});


export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  await transporter.sendMail({
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};


export const sendVerificationEmail = async (
  to: string,
  firstName: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.frontend.url}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your email — CRM SaaS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to CRM SaaS, ${firstName}!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; padding: 12px 24px; background: #6366f1;
                  color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create an account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  firstName: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your password — CRM SaaS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName}, click the button below to reset your password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #6366f1;
                  color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, ignore this email.</p>
      </div>
    `,
  });
};