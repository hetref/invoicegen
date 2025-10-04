"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import { headers } from "next/headers";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/verify-email-sent",
    },
  });

  return result;
};

export const signIn = async (email: string, password: string) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/dashboard",
    },
    headers: await headers(),
  });

  return result;
};

export const signInSocial = async (provider: "google") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/dashboard",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};

export const sendVerificationEmail = async (email: string, callbackURL?: string) => {
  try {
    const result = await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: callbackURL || "/dashboard",
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send verification email" };
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const result = await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send password reset email" };
  }
};

export const resetPassword = async (newPassword: string, token: string) => {
  try {
    const result = await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reset password" };
  }
};
