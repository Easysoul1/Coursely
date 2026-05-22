"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, setUser, setLoading, logout } = useAuthStore();
  const exchangedRef = useRef(false);

  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  useEffect(() => {
    setLoading(!isLoaded);

    if (isLoaded && isSignedIn && session?.user) {
      const u = session.user as {
        id: string;
        name?: string | null;
        email?: string | null;
        role: string;
        backendToken: string;
      };

      setUser({
        id: u.id,
        name: u.name || u.email || "User",
        email: u.email || "",
        role: (u.role as "STUDENT" | "ADMIN") || "STUDENT",
      });

      if (u.backendToken && !exchangedRef.current) {
        exchangedRef.current = true;
        localStorage.setItem("token", u.backendToken);
      }
    } else if (isLoaded && !isSignedIn) {
      logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
  }, [isLoaded, isSignedIn, session, setUser, setLoading, logout]);

  return { user, isLoaded, isSignedIn, isLoading: !isLoaded };
}
