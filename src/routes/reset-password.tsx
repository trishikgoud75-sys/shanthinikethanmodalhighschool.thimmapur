import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SCHOOL_NAME } from "@/components/nav-items";
import crest from "@/assets/school-logo.png";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set new password — Shanthinikethan Model High School" },
      { name: "description", content: "Set a new password for your school portal account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Set new password — Shanthinikethan Model High School" },
      { property: "og:description", content: "Set a new password for your school portal account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  useEffect(() => {
    let active = true;
    const hashType = new URLSearchParams(window.location.hash.slice(1)).get("type");

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setCheckingRecovery(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setRecoveryReady((current) => current || (hashType === "recovery" && Boolean(data.session)));
      setCheckingRecovery(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async () => {
    const parsed = z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(72)
      .safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please enter a valid password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    void navigate({ to: "/home", replace: true });
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden">
      <AnimatedBackground />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-7 text-center">
          <img src={crest} alt={`${SCHOOL_NAME} crest`} className="mx-auto size-20 float-soft" />
          <h1 className="mt-4 font-display text-xl font-semibold">Set a new password</h1>
        </div>
        <Card className="glass">
          <CardContent className="grid gap-4 p-6">
            {checkingRecovery ? (
              <div className="grid place-items-center gap-3 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Verifying your reset link…
              </div>
            ) : recoveryReady ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button disabled={busy} onClick={submit}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Update password
                </Button>
              </>
            ) : (
              <div className="grid gap-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid or has expired. Request a new link to
                  continue.
                </p>
                <Button onClick={() => void navigate({ to: "/forgot-password", replace: true })}>
                  Request a new link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
