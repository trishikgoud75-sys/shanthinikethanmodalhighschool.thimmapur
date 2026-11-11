import crest from "@/assets/school-logo.png";
import { cn } from "@/lib/utils";

/**
 * Very subtle institutional watermark: an oversized, blurred, slowly drifting
 * copy of the school crest sitting far behind the content.
 */
export function LogoWatermark({ className }: { className?: string }) {
  return (
    <img
      src={crest}
      alt=""
      aria-hidden
      className={cn("logo-watermark pointer-events-none select-none", className)}
    />
  );
}
