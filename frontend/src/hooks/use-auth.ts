"use client";

import { useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAuthStore } from "@/stores/auth-store";
import { exchangeClerkToken } from "@/lib/api";

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { client } = useClerk();
  const { user, setUser, setLoading, logout } = useAuthStore();
  const exchangedRef = useRef(false);

  useEffect(() => {
    setLoading(!isLoaded);

    if (isLoaded && isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.emailAddresses[0]?.emailAddress || "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        role: (clerkUser.publicMetadata?.role as "STUDENT" | "ADMIN") || "STUDENT",
      });

      const tokenInStorage = typeof window !== "undefined" && localStorage.getItem("token");
      if (!tokenInStorage && !exchangedRef.current) {
        exchangedRef.current = true;
        const activeSession = client.activeSessions?.[0];
        activeSession?.getToken().then((clerkToken: string | null) => {
          if (clerkToken) {
            exchangeClerkToken(clerkToken).catch(() => {
              exchangedRef.current = false;
            });
          }
        });
      }
    } else if (isLoaded && !isSignedIn) {
      logout();
    }
  }, [isLoaded, isSignedIn, clerkUser, setUser, setLoading, logout, client.activeSessions]);

  return { user, isLoaded, isSignedIn, isLoading: !isLoaded };
}
