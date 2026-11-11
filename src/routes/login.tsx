import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BootSplash } from "@/components/BootSplash";
import { LoginScreen } from "@/components/LoginScreen";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Shanthinikethan Model High School Portal" },
      {
        name: "description",
        content:
          "Sign in to the Shanthinikethan Model High School portal to view notices, results, gallery and school updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Sign in — Shanthinikethan Model High School" },
      { property: "og:description", content: "Access the student and parent portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/home", replace: true });
  }, [session, loading, navigate]);

  if (loading || session) return <BootSplash />;
  return <LoginScreen />;
}
