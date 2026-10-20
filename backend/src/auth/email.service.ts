import { Resend } from 'resend';

type AuthEmailType =
  | 'sign-in'
  | 'email-verification'
  | 'forget-password'
  | 'change-email';

function requiredEnvironmentValue(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

const resend = new Resend(requiredEnvironmentValue('RESEND_API_KEY'));

export async function sendAuthEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const { error } = await resend.emails.send({
    from: requiredEnvironmentValue('RESEND_FROM_EMAIL'),
    to,
    subject,
    text,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}

export function verificationOtpEmail({ email, otp, type }: {
  email: string;
  otp: string;
  type: AuthEmailType;
}) {
  const subject =
    type === 'forget-password'
      ? 'Reset your Cheta password'
      : 'Verify your Cheta email';

  return sendAuthEmail({
    to: email,
    subject,
    text: `Your Cheta verification code is ${otp}. It expires soon.`,
  });
}
