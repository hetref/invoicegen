import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(session) redirect('/dashboard')

  return (
    <div>
      {children}
    </div>
  );
};

export default layout;
