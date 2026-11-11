import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { advanceLogoClicks } from "@/lib/admin-access";
import { cn } from "@/lib/utils";
import { useLogoUrl } from "./SiteChrome";

/**
 * School logo + wordmark. Uses the admin-uploaded logo when one is set,
 * otherwise the bundled crest. Always visible, including on mobile.
 */
export function AnimatedLogo({
  className,
  withText = true,
  compact = false,
}: {
  className?: string;
  withText?: boolean;
  compact?: boolean;
}) {
  const logo = useLogoUrl();
  const navigate = useNavigate();
  const clicks = useRef({ count: 0, at: 0 });

  return (
    <Link
      to="/home"
      onClick={(event) => {
        const next = advanceLogoClicks(clicks.current, Date.now());
        clicks.current = next;
        if (next.openAdmin) {
          event.preventDefault();
          void navigate({ to: "/administration" });
        }
      }}
      aria-label="Shanthinikethan Model High School — home"
      className={cn("group/logo flex min-w-0 items-center gap-2.5", className)}
    >
      <span className="logo-mark relative inline-flex shrink-0">
        <img
          src={logo}
          alt="Shanthinikethan Model High School logo"
          width={112}
          height={112}
          className={cn(
            "logo-img object-contain",
            compact ? "size-9 sm:size-10" : "size-10 sm:size-12",
          )}
        />
        <span aria-hidden className="logo-sheen" />
      </span>

      {withText ? (
        <span className="logo-text min-w-0 leading-none">
          <span className="block truncate font-display text-[0.95rem] font-semibold tracking-tight sm:text-base md:text-lg">
            Shanthinikethan
          </span>
          <span className="mt-1 block truncate font-display text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[0.68rem]">
            Model High School
          </span>
        </span>
      ) : null}
    </Link>
  );
}
