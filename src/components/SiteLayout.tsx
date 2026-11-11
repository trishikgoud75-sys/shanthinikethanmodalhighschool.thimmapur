import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { TopNav } from "./TopNav";
import { ScrollProgress } from "./ScrollProgress";
import { PageTransition } from "./PageTransition";
import { OrbBackground, SiteFooter } from "./SiteChrome";

/** Sign-in screens render their own full-screen shell. */
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/administration"];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Login/entry screens render standalone (no nav, no footer).
  if (AUTH_ROUTES.includes(pathname)) return <>{children}</>;

  // Every other page is public: top navigation, content, slim footer.
  return (
    <div className="relative min-h-screen">
      <OrbBackground />
      <ScrollProgress />
      <TopNav />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </div>
  );
}
