import logo from "@/assets/school-logo.png";
import { cn } from "@/lib/utils";

/** School crest. Replace src/assets/school-logo.png with the real crest when available. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Shanthinikethan Model High School crest"
      width={96}
      height={96}
      className={cn("size-10 shrink-0 object-contain drop-shadow-sm", className)}
    />
  );
}
