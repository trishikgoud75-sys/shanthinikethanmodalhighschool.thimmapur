import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { GoogleIcon } from "@/components/GoogleIcon";
import { SCHOOL_NAME } from "@/components/nav-items";
import crest from "@/assets/school-logo.png";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create account — Shanthinikethan Model High School" },
      {
        name: "description",
        content:
          "Create your Shanthinikethan Model High School portal account to access notices, results and school updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Create account — Shanthinikethan Model High School" },
      { property: "og:description", content: "Register for the school portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
    email: z.string().trim().email("Please enter a valid email address.").max(255),
    password: z.string().min(6, "Password must be at least 6 characters.").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

function SignupPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<null | "email" | "google">(null);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/home", replace: true });
  }, [session, loading, navigate]);

  const handleSignup = async () => {
    const parsed = schema.safeParse({ fullName, email, password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your account details.");
      return;
    }
    setBusy("email");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: parsed.data.fullName },
        },
      });
      setBusy(null);
      if (error) {
        toast.error(
          error.message.toLowerCase().includes("already")
            ? "An account with this email already exists. Please log in."
            : "We couldn't create your account. Please try again.",
        );
        return;
      }
      if (!data.session) {
        setPendingConfirm(true);
        toast.success("Account created. Check your email to confirm your account.");
        return;
      }
      toast.success("Account created!");
      void navigate({ to: "/home", replace: true });
    } catch (error) {
      setBusy(null);
      toast.error(
        error instanceof TypeError
          ? "Unable to connect. Please check your internet connection."
          : "We couldn't create your account. Please try again.",
      );
    }
  };

  const handleGoogle = async () => {
    setBusy("google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        setBusy(null);
        toast.error("Google sign-in could not be completed. Please try again.");
        return;
      }
      if (result.redirected) return;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setBusy(null);
        toast.error("Google sign-in could not be completed. Please try again.");
        return;
      }
      void navigate({ to: "/home", replace: true });
    } catch {
      setBusy(null);
      toast.error("Google sign-in could not be completed. Please try again.");
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
          <p className="mt-2 text-sm text-muted-foreground">Create your portal account</p>
        </div>

        <Card className="glass animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="grid gap-4 p-5 sm:p-6">
            {pendingConfirm ? (
              <div className="grid gap-3 py-6 text-center">
                <Mail className="mx-auto size-9 text-primary" />
                <p className="text-sm font-medium">Confirm your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to {email}. Open it to activate your account, then log
                  in.
                </p>
                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-9"
                      maxLength={100}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      autoComplete="new-password"
                      className="pl-9"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                </div>

                <Button disabled={busy !== null} onClick={handleSignup}>
                  {busy === "email" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Create Account
                </Button>

                <div className="my-1 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                  disabled={busy !== null}
                  onClick={handleGoogle}
                >
                  {busy === "google" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Connecting to Google…
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      CONTINUE WITH GOOGLE
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
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
