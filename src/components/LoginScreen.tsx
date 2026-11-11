import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, CheckCircle2, Mail, Lock } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CursorGlow } from "@/components/CursorGlow";
import { LogoWatermark } from "@/components/LogoWatermark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleIcon } from "@/components/GoogleIcon";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SCHOOL_NAME } from "@/components/nav-items";
import crest from "@/assets/school-logo.png";
import campus from "@/assets/campus-hero.jpg";
import classroom from "@/assets/classroom.jpg";
import library from "@/assets/library.jpg";

const credentials = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  password: z.string().min(6, "Password must be at least 6 characters.").max(72),
});

/**
 * Full-screen first-run experience: animated school visual on the left (desktop)
 * and a glassmorphism sign-in card on the right; centered on mobile.
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState<null | "email" | "google">(null);
  const [success, setSuccess] = useState(false);

  const finish = () => {
    setSuccess(true);
    setTimeout(() => void navigate({ to: "/home", replace: true }), 600);
  };

  const finishVerifiedSignIn = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setBusy(null);
      toast.error("Google sign-in could not be completed. Please try again.");
      return;
    }
    finish();
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
      await finishVerifiedSignIn();
    } catch {
      setBusy(null);
      toast.error("Google sign-in could not be completed. Please try again.");
    }
  };

  const handleLogin = async () => {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your login details.");
      return;
    }
    setBusy("email");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setBusy(null);
      if (error) {
        // Surface the real Supabase failure (code + status) for debugging.
        console.error("[auth] signInWithPassword failed", {
          code: (error as { code?: string }).code,
          status: error.status,
          message: error.message,
          error,
        });
        const code = (error as { code?: string }).code ?? "";
        const msg = error.message.toLowerCase();
        toast.error(
          code === "email_not_confirmed" || msg.includes("confirm")
            ? "Please verify your email before signing in — check your inbox for the confirmation link."
            : msg.includes("failed to fetch") || msg.includes("network")
              ? "Unable to connect. Please check your internet connection."
              : "Email or password is incorrect. If you created this account with Google, use “Continue with Google”.",
        );
        return;
      }
      if (!data.session) {
        toast.error("Please verify your email before signing in.");
        return;
      }


      toast.success("Welcome back!");
      finish();
    } catch (error) {
      setBusy(null);
      toast.error(
        error instanceof TypeError
          ? "Unable to connect. Please check your internet connection."
          : "Email or password is incorrect.",
      );
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden">
      <AnimatedBackground />
      <LogoWatermark />
      <CursorGlow />

      <div className="relative grid min-h-screen w-full lg:grid-cols-2">
        {/* Desktop visual panel */}
        <aside className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0">
            {[campus, classroom, library].map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover opacity-0 animate-[fade-in_1.2s_ease-out_forwards]"
                style={{ animationDelay: `${i * 0.25}s`, opacity: i === 0 ? undefined : 0.35 }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/70 to-primary/20" />
          <span aria-hidden className="orb orb-a pointer-events-none opacity-60" />
          <span aria-hidden className="orb orb-b pointer-events-none opacity-40" />

          <div className="relative flex h-full flex-col justify-end gap-4 p-12">
            <img
              src={crest}
              alt={`${SCHOOL_NAME} crest`}
              className="size-24 float-soft drop-shadow-2xl animate-in fade-in zoom-in-95 duration-700"
            />
            <h1 className="max-w-md font-display text-4xl font-semibold leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              {SCHOOL_NAME}
            </h1>
            <p className="text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-1000">
              Towards the Better Future
            </p>
          </div>
        </aside>

        {/* Login panel */}
        <main className="relative flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <img
                src={crest}
                alt={`${SCHOOL_NAME} crest`}
                className="mx-auto size-20 float-soft drop-shadow-lg sm:size-24 animate-in fade-in zoom-in-95 duration-700"
              />
              <h1 className="mt-4 font-display text-xl font-semibold leading-tight sm:text-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
                {SCHOOL_NAME}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Towards the Better Future</p>
            </div>

            <Card className="glass animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-5 sm:p-7">
                {success ? (
                  <div className="grid place-items-center gap-3 py-12 text-center">
                    <CheckCircle2 className="size-10 text-primary animate-in zoom-in duration-300" />
                    <p className="text-sm font-medium">Signed in — opening your school portal…</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={crest}
                      alt=""
                      aria-hidden
                      className="mx-auto hidden size-14 drop-shadow lg:block"
                    />
                    <p className="mt-3 hidden text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground lg:block">
                      {SCHOOL_NAME}
                    </p>
                    <h2 className="mt-2 text-center font-display text-2xl font-semibold">
                      Welcome Back
                    </h2>

                    <div className="mt-6 grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            className="pl-9"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            className="pl-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                          />
                          Remember me
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <Button disabled={busy !== null} onClick={handleLogin}>
                        {busy === "email" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Login
                      </Button>

                      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
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
                        New to the school portal?{" "}
                        <Link to="/signup" className="font-medium text-primary hover:underline">
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
