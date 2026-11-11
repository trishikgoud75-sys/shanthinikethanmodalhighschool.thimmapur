import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { AnimatedBackground } from "./AnimatedBackground";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-secondary/50">
      <AnimatedBackground />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </Reveal>
      </div>
    </section>
  );
}
