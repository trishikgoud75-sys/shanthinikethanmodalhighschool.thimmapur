import { Logo } from "./Logo";

/** Brief branded loading screen shown while the session resolves. */
export function BootSplash() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <Logo className="size-16 float-soft" />
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            SHANTHINIKETHAN
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Model High School
          </p>
        </div>
        <div className="h-px w-40 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 rounded-full bg-primary loader-sweep" />
        </div>
        <p className="text-xs text-muted-foreground">Loading…</p>

      </div>
    </div>
  );
}
