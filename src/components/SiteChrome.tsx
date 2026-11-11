import { useEffect, useState } from "react";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { resolveMediaUrl } from "@/lib/media";
import { ParticleField } from "./ParticleField";
import { CursorGlow } from "./CursorGlow";
import {
  SCHOOL_NAME,
  SCHOOL_ADDRESS_LINES,
  SCHOOL_PHONES,
  SCHOOL_EMAIL,
  SCHOOL_INSTAGRAM,
} from "./nav-items";
import crest from "@/assets/school-logo.png";

/**
 * Living backdrop behind every page: aurora-style gradient, slow drifting
 * blurred orbs in brand colours, a fine particle field that reacts to the
 * pointer, and a soft cursor glow. All calm down for prefers-reduced-motion.
 */
export function OrbBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <ParticleField className="absolute inset-0 size-full" />
      <CursorGlow />
    </div>
  );
}

/** The school logo: the admin-uploaded one when set, otherwise the bundled crest. */
export function useLogoUrl() {
  const { data } = useSiteContent("branding");
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void resolveMediaUrl(data?.logo_url).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [data?.logo_url]);
  return url ?? crest;
}

/** Small footer on every page: logo, name, phones, address, email, Instagram. Nothing else. */
export function SiteFooter() {
  const logo = useLogoUrl();

  return (
    <footer className="relative mt-16 border-t border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="gold-divider" />
      <div className="mx-auto flex min-h-[25vh] max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-center text-sm sm:px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="School logo" className="size-12 object-contain" />
          <p className="font-display text-lg font-semibold">{SCHOOL_NAME}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-muted-foreground">
          {SCHOOL_PHONES.map((p) => (
            <a key={p} href={`tel:+91${p}`} className="inline-flex items-center gap-1.5 hover:text-gold">
              <Phone className="size-4 text-gold" />
              {p}
            </a>
          ))}
        </div>

        <p className="inline-flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
          {SCHOOL_ADDRESS_LINES.join(", ")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-muted-foreground">
          <a href={`mailto:${SCHOOL_EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-gold">
            <Mail className="size-4 text-gold" />
            {SCHOOL_EMAIL}
          </a>
          <a
            href={SCHOOL_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="grid size-8 place-items-center rounded-full border border-gold/40 text-gold transition hover:bg-gold/10"
          >
            <Instagram className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
