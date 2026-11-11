import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StorageImage } from "./StorageImage";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

type Leader = { id: string; full_name: string; designation: string; photo_url: string | null };

/** School Management strip: moves only when the visitor swipes, scrolls or uses the arrows. */
export function ManagementMarquee() {
  const { data: people = [] } = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leadership").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as Leader[];
    },
  });
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const by = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section aria-label="School Management" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">School Management</h2>
        <div className="flex items-center gap-2">
          {people.length > 0 && (
            <div className="hidden gap-2 sm:flex">
              <Button size="icon" variant="outline" aria-label="Previous" onClick={() => by(-1)}><ChevronLeft /></Button>
              <Button size="icon" variant="outline" aria-label="Next" onClick={() => by(1)}><ChevronRight /></Button>
            </div>
          )}
          <Link to="/management" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold transition hover:gap-2.5">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      {people.length === 0 ? (
        <PhotoPlaceholder className="min-h-48 rounded-2xl" label="Photos coming soon" />
      ) : (
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] select-none"
          onPointerDown={(e) => { if (e.pointerType === "mouse" && scroller.current) drag.current = { x: e.clientX, left: scroller.current.scrollLeft }; }}
          onPointerMove={(e) => { if (drag.current && scroller.current) scroller.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); }}
          onPointerUp={() => { drag.current = null; }}
          onPointerLeave={() => { drag.current = null; }}
        >
          {people.map((p) => (
            <figure key={p.id} className="photo-frame w-44 shrink-0 snap-start overflow-hidden bg-card sm:w-52">
              {p.photo_url ? (
                <StorageImage path={p.photo_url} alt={p.full_name} className="pointer-events-none aspect-[4/5] w-full object-cover" />
              ) : (
                <PhotoPlaceholder className="aspect-[4/5]" />
              )}
              <figcaption className="p-3 text-center">
                <p className="truncate font-display text-sm font-semibold">{p.full_name}</p>
                <p className="truncate text-xs text-gold">{p.designation}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
