"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  name: string | null;
  email: string | null;
  role: string;
} | null;

type AuthContextValue = {
  userId: string | null;
  user: UserProfile;
  isSignedIn: boolean;
  isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  user: null,
  isSignedIn: false,
  isAuthLoading: true,
});

function profileFromUser(u: User | null | undefined): UserProfile {
  if (!u) return null;
  return {
    name: typeof u.user_metadata?.full_name === "string" ? u.user_metadata.full_name : null,
    email: u.email ?? null,
    role: typeof u.app_metadata?.role === "string" ? u.app_metadata.role : "user",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUser(profileFromUser(data.user));
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUser(profileFromUser(session?.user));
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userId, user, isSignedIn: !isAuthLoading && userId !== null, isAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
