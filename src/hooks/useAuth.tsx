import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { adminAccessReady } from "@/lib/admin-access";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  join_date: string;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const navigate = useNavigate();
  const generation = useRef(0);
  const [session, setSession] = useState<Session | null>(null);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string, version: number) => {
    const [profileRes, adminRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.rpc("is_admin"),
    ]);
    if (version !== generation.current) return;
    setVerifiedUserId(userId);
    setProfile((profileRes.data as Profile | null) ?? null);
    setIsAdmin(adminRes.data === true && !adminRes.error);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    generation.current += 1;
    setSession(null);
    setVerifiedUserId(null);
    setProfile(null);
    setIsAdmin(false);
    setLoading(false);
    await cache.cancelQueries();
    cache.clear();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    await navigate({ to: "/home", replace: true });
    if (error) throw error;
  }, [cache, navigate]);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === "INITIAL_SESSION") return;
      const version = ++generation.current;
      setSession(nextSession);
      setVerifiedUserId(null);
      setIsAdmin(false);
      setProfile(null);
      setLoading(Boolean(nextSession?.user));
      if (nextSession?.user) {
        // Defer supabase calls out of the auth callback.
        setTimeout(() => {
          void loadUserData(nextSession.user.id, version);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    void (async () => {
      const version = ++generation.current;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active || version !== generation.current) return;

        const userResult = data.session ? await supabase.auth.getUser() : null;
        if (!active || version !== generation.current) return;
        if (error || userResult?.error || (data.session && !userResult?.data.user)) {
          // Remove only this browser's unusable credentials. A fresh Google or
          // email sign-in can then create a valid session without a refresh loop.
          await supabase.auth.signOut({ scope: "local" });
          if (!active) return;
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
          return;
        }

        setSession(data.session);
        if (data.session?.user) await loadUserData(data.session.user.id, version);
      } catch {
        if (!active || version !== generation.current) return;
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        if (active && version === generation.current) setLoading(false);
      }
    })();

    return () => {
      active = false;
      generation.current += 1;
      sub.subscription.unsubscribe();
    };
  }, [loadUserData]);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: adminAccessReady(session?.user.id, verifiedUserId, isAdmin),
    loading,
    refreshProfile: async () => {
      if (session?.user) await loadUserData(session.user.id, generation.current);
    },
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
