import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { EmailVerificationGuard } from "@/components/EmailVerificationGuard";

const layout = async ({ children }: { children: React.ReactNode }) => {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session) redirect('/sign-in')

  return (
    <EmailVerificationGuard session={session}>
      {children}
    </EmailVerificationGuard>
  );
};

export default layout;
