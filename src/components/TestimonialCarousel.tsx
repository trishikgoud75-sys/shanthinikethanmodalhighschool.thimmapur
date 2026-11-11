import { useEffect, useState } from "react";
import { Quote, ChevronLeft, ChevronRight, MessageSquarePlus } from "lucide-react";
import { SCHOOL_EMAIL } from "./nav-items";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

export type Testimonial = { quote: string; name: string; role: string };

/**
 * Community Voices carousel. Renders a graceful empty state until the school
 * shares real testimonials — no people are invented.
 */
export function TestimonialCarousel({ items = [] as Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index % items.length];

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
          Community Voices
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          What students, parents and teachers say about life at Shanthinikethan.
        </p>
      </Reveal>

      <Reveal delay={120}>
        {!current ? (
          <div className="glass mt-10 flex flex-col items-center gap-4 p-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <MessageSquarePlus className="size-6" />
            </span>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              We are collecting reflections from our school community. Once shared, they will
              appear here.
            </p>
            <Button asChild variant="secondary" size="sm">
              <a href={`mailto:${SCHOOL_EMAIL}`}>Share your experience</a>
            </Button>
          </div>
        ) : (
          <figure className="glass relative mt-10 p-8 sm:p-12">
            <Quote className="size-8 text-primary/60" />
            <blockquote className="mt-4 text-lg leading-relaxed sm:text-xl">
              {current.quote}
            </blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{current.name}</span> ·{" "}
              {current.role}
            </figcaption>

            {items.length > 1 ? (
              <div className="mt-8 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous testimonial"
                  onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next testimonial"
                  onClick={() => setIndex((i) => (i + 1) % items.length)}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            ) : null}
          </figure>
        )}
      </Reveal>
    </section>
  );
}
