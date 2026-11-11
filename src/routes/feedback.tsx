import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CheckCircle2, GraduationCap, Loader2, School } from "lucide-react";
import { toast } from "sonner";
import { submitFeedback, feedbackSchema, FEEDBACK_CATEGORIES } from "@/lib/feedback.functions";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [
    { title: "Feedback | Shanthinikethan Model High School" },
    { name: "description", content: "Share your feedback about our faculty, facilities or school." },
    { property: "og:title", content: "Feedback | Shanthinikethan Model High School" },
    { property: "og:description", content: "Tell us about our faculty, facilities and school." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: FeedbackPage,
});

type Cat = keyof typeof FEEDBACK_CATEGORIES;
const cards: { cat: Cat; icon: typeof School; text: string }[] = [
  { cat: "faculty", icon: GraduationCap, text: "Share your thoughts about our teachers." },
  { cat: "facilities", icon: Building2, text: "Tell us about classrooms, transport and campus." },
  { cat: "school", icon: School, text: "Anything else about the school." },
];

function FeedbackForm({ cat, onDone }: { cat: Cat; onDone: () => void }) {
  const send = useServerFn(submitFeedback);
  const [f, setF] = useState({ name: "", mobile: "", email: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <div className="py-8 text-center"><CheckCircle2 className="mx-auto size-10 text-gold" /><p className="mt-3 font-medium">Thank you for your feedback!</p><Button className="mt-4" onClick={onDone}>Close</Button></div>;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="grid gap-3" onSubmit={async (e) => {
      e.preventDefault();
      const parsed = feedbackSchema.safeParse({ category: cat, ...f });
      if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form"); return; }
      setBusy(true);
      try { await send({ data: parsed.data }); setDone(true); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Could not send"); }
      finally { setBusy(false); }
    }}>
      <div className="grid gap-1.5"><Label htmlFor="fb-name">Name (optional)</Label><Input id="fb-name" value={f.name} onChange={set("name")} maxLength={100} /></div>
      <div className="grid gap-1.5"><Label htmlFor="fb-mobile">Mobile (optional)</Label><Input id="fb-mobile" inputMode="numeric" value={f.mobile} onChange={set("mobile")} maxLength={10} /></div>
      <div className="grid gap-1.5"><Label htmlFor="fb-email">Email (optional)</Label><Input id="fb-email" type="email" value={f.email} onChange={set("email")} /></div>
      <div className="grid gap-1.5"><Label htmlFor="fb-msg">Your feedback</Label><Textarea id="fb-msg" rows={5} value={f.message} onChange={set("message")} maxLength={2000} required /></div>
      <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <Button type="submit" disabled={busy} className="bg-gold-gradient">{busy ? <Loader2 className="animate-spin" /> : null}Send feedback</Button>
    </form>
  );
}

function FeedbackPage() {
  const [open, setOpen] = useState<Cat | null>(null);
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader title="Feedback" description="We value your thoughts. Choose a topic and tell us." />
      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map(({ cat, icon: Icon, text }) => (
          <button key={cat} onClick={() => setOpen(cat)} className="card-premium rounded-2xl p-6 text-left transition hover:-translate-y-1">
            <Icon className="size-8 text-gold" />
            <h2 className="mt-4 font-display text-xl font-semibold">{FEEDBACK_CATEGORIES[cat]}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            <span className="mt-4 inline-block text-sm font-medium text-gold">Give feedback →</span>
          </button>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-2xl">{open ? FEEDBACK_CATEGORIES[open] : ""}</DialogTitle></DialogHeader>
          {open ? <FeedbackForm key={open} cat={open} onDone={() => setOpen(null)} /> : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
