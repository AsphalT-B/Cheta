import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { PrismaService } from '../prisma/prisma.service.js';
import { sendAuthEmail, verificationOtpEmail } from './email.service.js';

const prisma = new PrismaService();
const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!baseURL) {
  throw new Error('BETTER_AUTH_URL is not configured');
}

if (!secret) {
  throw new Error('BETTER_AUTH_SECRET is not configured');
}

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: 'Cheta',
  baseURL,
  secret,
  trustedOrigins,
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Reset your Cheta password',
        text: `Click this link to reset your Cheta password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendAuthEmail({
          to: user.email,
          subject: 'Approve your Cheta email change',
          text: `Approve changing your Cheta email to ${newEmail}: ${url}`,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        void sendAuthEmail({
          to: user.email,
          subject: 'Confirm deletion of your Cheta account',
          text: `Confirm deletion of your Cheta account: ${url}`,
        });
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await verificationOtpEmail({ email, otp, type });
      },
      sendVerificationOnSignUp: false,
      otpLength: 6,
    }),
  ],
});
