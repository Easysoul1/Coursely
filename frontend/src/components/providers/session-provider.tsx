"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

function AuthSync({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthSync>{children}</AuthSync>
    </NextAuthSessionProvider>
  );
}
