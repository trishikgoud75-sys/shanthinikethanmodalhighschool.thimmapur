import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

/** Elegant empty state shown in every photo slot until the school uploads a real photo. */
export function PhotoPlaceholder({
  className,
  label = "Photo coming soon",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br from-secondary via-muted/60 to-secondary",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <span className="grid size-12 place-items-center rounded-full border border-gold/30 bg-background/60">
          <Camera className="size-5 text-gold" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
