import { useEffect, useRef } from "react";
import { ParticleField } from "./ParticleField";
import { LogoWatermark } from "./LogoWatermark";

/** Light streaks that occasionally sweep across the backdrop. */
function Streaks() {
  return (
    <>
      <span aria-hidden className="streak streak-a" />
      <span aria-hidden className="streak streak-b" />
      <span aria-hidden className="streak streak-c" />
    </>
  );
}

/**
 * Tracks pointer position and scroll and exposes them as CSS custom properties
 * (`--px`, `--py`, `--sy`) on the given element, so purely CSS parallax layers
 * can react without re-rendering React. Skipped on coarse pointers (mobile) and
 * for prefers-reduced-motion.
 */
function useParallax(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    let sy = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
      el.style.setProperty("--sy", sy.toFixed(2));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };
    const onScroll = () => {
      sy = Math.min(window.scrollY / 800, 1.5);
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/**
 * Layered backdrop: perspective grid, drifting aurora orbs, light streaks and an
 * optional interactive particle network. Purely decorative.
 */
export function AnimatedBackground({
  className,
  particles = false,
}: {
  className?: string;
  particles?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}
    >
      <div className="parallax-slow absolute inset-0 grid-veil" />
      <div className="parallax-mid absolute inset-0">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
      </div>
      <div className="parallax-fast absolute inset-0">
        <span className="orb orb-c" />
      </div>
      <Streaks />
      {particles ? <ParticleField className="absolute inset-0 size-full opacity-80" /> : null}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

/** Fixed, full-viewport version used behind the whole app shell. */
export function SiteBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <LogoWatermark />

      <div className="parallax-slow absolute inset-0 grid-veil" />
      <div className="parallax-mid absolute inset-0">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
      </div>
      <div className="parallax-fast absolute inset-0">
        <span className="orb orb-c" />
      </div>
      <Streaks />
      <ParticleField className="absolute inset-0 size-full opacity-70" />
    </div>
  );
}
