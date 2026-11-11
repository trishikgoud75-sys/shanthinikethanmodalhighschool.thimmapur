import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import { ThemeToggle } from "./ThemeToggle";
import { AnimatedLogo } from "./AnimatedLogo";
import { publicNav } from "./nav-items";
import { cn } from "@/lib/utils";

export function TopNav() {
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          "relative z-50 mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl px-3 transition-all duration-300 sm:gap-4 sm:px-5 glass",
          scrolled ? "h-14 shadow-lg backdrop-blur-2xl sm:h-16" : "h-16 sm:h-[4.75rem]",
        )}
      >
        <AnimatedLogo compact={scrolled} />

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {publicNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/home" }}
              activeProps={{ className: "text-foreground nav-active" }}
              className="nav-link rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {isAdmin && <>
            <span className="hidden text-xs font-semibold text-gold lg:block">Admin Mode</span>
            <Button asChild variant="outline" size="sm"><Link to="/administration" onClick={() => setOpen(false)}><ShieldCheck className="size-4" />Admin</Link></Button>
            <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={() => void signOut()}><LogOut className="size-4" /></Button>
          </>}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Mobile"
            className="absolute inset-x-3 top-24 max-h-[70vh] overflow-y-auto rounded-2xl p-3 glass animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {isAdmin && <p className="px-4 py-2 text-xs font-semibold text-gold lg:hidden">Admin Mode</p>}
            <ul className="grid gap-1">
              {publicNav.map((item, i) => (
                <li key={item.to} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/home" }}
                    activeProps={{ className: "bg-secondary text-foreground" }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
