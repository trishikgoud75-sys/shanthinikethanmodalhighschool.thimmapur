import { cn } from "@/lib/utils";

export type StripImage = { src: string; alt: string };

/**
 * Infinite, seamless horizontal image marquee. Pauses on hover; slows on mobile
 * and stops entirely for prefers-reduced-motion (handled in CSS).
 */
export function MovingImageStrip({
  images,
  reverse = false,
  className,
}: {
  images: StripImage[];
  reverse?: boolean;
  className?: string;
}) {
  const loop = [...images, ...images];

  return (
    <div className={cn("marquee group/marquee", className)} aria-hidden>
      <div className={cn("marquee-track", reverse && "marquee-reverse")}>
        {loop.map((img, i) => (
          <figure
            key={`${img.src}-${i}`}
            className="marquee-item photo-frame relative shrink-0 overflow-hidden"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
