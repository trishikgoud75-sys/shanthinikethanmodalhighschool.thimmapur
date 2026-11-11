import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import campus from "@/assets/campus-hero.jpg";
import classroom from "@/assets/classroom.jpg";
import library from "@/assets/library.jpg";
import lab from "@/assets/science-lab.jpg";
import sports from "@/assets/sports.jpg";
import bus from "@/assets/school-bus.jpg";

const tiles = [
  { src: campus, alt: "Campus grounds at golden hour", span: "sm:col-span-2 sm:row-span-2" },
  { src: classroom, alt: "A bright classroom in session", span: "" },
  { src: lab, alt: "Students working in the science laboratory", span: "" },
  { src: library, alt: "The school library reading room", span: "" },
  { src: sports, alt: "Students on the sports ground", span: "" },
  { src: bus, alt: "School transport bus on campus", span: "sm:col-span-2" },
];

/** Bento-style gallery teaser shown on the homepage. */
export function GalleryPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Life at Shanthinikethan</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Moments from classrooms, laboratories, the library and the field.
            </p>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View gallery <ArrowRight className="size-4" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[10rem] sm:grid-cols-4">
        {tiles.map((tile, i) => (
          <Reveal key={tile.alt} delay={i * 70} className={tile.span}>
            <Link
              to="/gallery"
              className="group relative block size-full overflow-hidden rounded-2xl border border-border"
            >
              <img
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-xs font-medium">
                <span className="line-clamp-1 text-foreground/90">{tile.alt}</span>
                <ArrowRight className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
