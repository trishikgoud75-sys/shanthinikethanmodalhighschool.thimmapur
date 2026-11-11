import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SCHOOL_NAME } from "@/components/nav-items";
import crest from "@/assets/school-logo.png";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Shanthinikethan Model High School" },
      {
        name: "description",
        content:
          "Request a password reset link for your Shanthinikethan Model High School portal account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Reset password — Shanthinikethan Model High School" },
      { property: "og:description", content: "Recover access to the school portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) {
        toast.error("We couldn't send the reset link. Please try again.");
        return;
      }
      setSent(true);
      toast.success("Password reset link sent.");
    } catch {
      setBusy(false);
      toast.error("Unable to connect. Please try again.");
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden">
      <AnimatedBackground />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-7 text-center animate-fade-in">
          <img
            src={crest}
            alt={`${SCHOOL_NAME} crest`}
            className="mx-auto size-20 float-soft drop-shadow-lg sm:size-24"
          />
          <h1 className="mt-4 font-display text-xl font-semibold leading-tight sm:text-2xl">
            {SCHOOL_NAME}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Reset your password</p>
        </div>

        <Card className="glass animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="grid gap-4 p-5 sm:p-6">
            {sent ? (
              <div className="grid gap-3 py-6 text-center">
                <MailCheck className="mx-auto size-9 text-primary" />
                <p className="text-sm font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  If an account exists for {email}, a password reset link is on its way.
                </p>
                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button disabled={busy} onClick={handleReset}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Send reset link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Login
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
