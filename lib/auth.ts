import { betterAuth } from "better-auth";
import { lastLoginMethod } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email-verification";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Don't block sign in, but verify in application layer
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }, request) => {
      await sendPasswordResetEmail(user.email, user.name, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, request) => {
      await sendVerificationEmail(user.email, user.name, url);
    },
    sendOnSignUp: true, // Automatically send verification email on sign up
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    lastLoginMethod({
      storeInDatabase: true,
    }),
    nextCookies(),
  ],
});
