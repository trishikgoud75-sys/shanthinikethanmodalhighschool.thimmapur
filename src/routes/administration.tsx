import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2, Trash2, Plus, Pencil, Save, Upload, Search, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { uploadMedia } from "@/lib/media";
import { useSiteContent, useSaveSiteContent, contentDefaults } from "@/lib/site-content";
import { SCHOOL_GRADES, UNSET_FEE } from "@/lib/school-rules";
import { SCHOOL_NAME } from "@/components/nav-items";
import { PeopleEditor } from "@/components/PeopleEditor";
import { StorageImage } from "@/components/StorageImage";
import { useLogoUrl } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/administration")({
  ssr: false,
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Private Administration | ${SCHOOL_NAME}` },
      { name: "description", content: "Private school administration access." },
      { property: "og:title", content: `Private Administration | ${SCHOOL_NAME}` },
      { property: "og:description", content: "Private school administration access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdministrationPage,
});

/* ---------------- Admission enquiries ---------------- */

type Enquiry = {
  id: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  mobile: string;
  alt_mobile: string | null;
  email: string | null;
  class_applying: string;
  created_at: string;
};

function FeedbackPanel() {
  const cache = useQueryClient();
  const { data: rows = [], isPending } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const labels: Record<string, string> = { faculty: "About Faculty", facilities: "About Facilities", school: "About School" };
  if (isPending) return <p className="text-muted-foreground">Loading…</p>;
  if (rows.length === 0) return <p className="text-muted-foreground">No feedback yet.</p>;
  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gold">{labels[r.category] ?? r.category}</span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{r.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">{[r.name, r.mobile, r.email].filter(Boolean).join(" · ") || "Anonymous"}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={async () => {
            if (!confirm("Delete this feedback?")) return;
            const { error } = await supabase.from("feedback").delete().eq("id", r.id);
            if (error) toast.error(error.message); else { toast.success("Deleted"); void cache.invalidateQueries({ queryKey: ["feedback"] }); }
          }}>Delete</Button>
        </div>
      ))}
    </div>
  );
}

function EnquiriesPanel() {
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Enquiry | null>(null);
  const { data: rows = [], isPending, isError } = useQuery({
    queryKey: ["admission_enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Enquiry[];
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admission_enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleting(null);
      toast.success("Enquiry deleted");
      void cache.invalidateQueries({ queryKey: ["admission_enquiries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const q = search.trim().toLowerCase();
  const visible = q
    ? rows.filter((r) =>
        [r.student_name, r.father_name, r.mother_name, r.mobile, r.class_applying, r.email ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : rows;

  return (
    <div className="grid gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search enquiries"
          placeholder="Search name, mobile or class…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {isPending ? (
        <p className="py-8 text-muted-foreground">Loading enquiries…</p>
      ) : isError ? (
        <p role="alert">Enquiries could not be loaded. Please try again.</p>
      ) : visible.length === 0 ? (
        <p className="py-8 text-muted-foreground">{q ? "No enquiries match your search." : "No enquiries yet."}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Father</th>
                <th className="px-4 py-3">Mother</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.student_name}</td>
                  <td className="px-4 py-3">{r.class_applying}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:+91${r.mobile}`} className="text-gold hover:underline">{r.mobile}</a>
                    {r.alt_mobile ? <span className="block text-xs text-muted-foreground">{r.alt_mobile}</span> : null}
                  </td>
                  <td className="px-4 py-3">{r.father_name}</td>
                  <td className="px-4 py-3">{r.mother_name}</td>
                  <td className="px-4 py-3">{r.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" aria-label={`Delete enquiry from ${r.student_name}`} onClick={() => setDeleting(r)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={Boolean(deleting)} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete enquiry from {deleting?.student_name}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Gallery ---------------- */

function GalleryPanel() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { data: images = [], isPending } = useQuery({
    queryKey: ["gallery_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => void cache.invalidateQueries({ queryKey: ["gallery_images"] });
  const add = useMutation({
    mutationFn: async () => {
      if (!files.length) throw new Error("Choose photos first");
      for (const file of files) {
        const image_url = await uploadMedia(file, "gallery");
        const { error } = await supabase.from("gallery_images").insert({
          title: title.trim() || file.name,
          album: album.trim() || "General",
          image_url,
          created_by: user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => { setTitle(""); setFiles([]); refresh(); toast.success("Photos added"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success("Photo removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const replace = async (id: string, file: File) => {
    try {
      const image_url = await uploadMedia(file, "gallery");
      const { error } = await supabase.from("gallery_images").update({ image_url }).eq("id", id);
      if (error) throw error;
      refresh();
      toast.success("Photo replaced");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Replacement failed");
    }
  };

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <div className="grid gap-2">
          <Label htmlFor="adm-gallery-title">Caption</Label>
          <Input id="adm-gallery-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="adm-gallery-album">Album</Label>
          <Input id="adm-gallery-album" value={album} maxLength={60} onChange={(e) => setAlbum(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="adm-gallery-file">Photos (choose several)</Label>
          <Input id="adm-gallery-file" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </div>
        <Button type="submit" disabled={add.isPending}>
          {add.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
        </Button>
      </form>
      {isPending ? (
        <p className="text-muted-foreground">Loading photos…</p>
      ) : images.length === 0 ? (
        <p className="text-muted-foreground">No photos uploaded yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="photo-frame relative">
              <StorageImage path={img.image_url} alt={img.title} className="h-32 w-full object-cover" />
              <Button type="button" size="icon" variant="destructive" aria-label="Delete photo" className="absolute right-2 top-2" onClick={() => { if (confirm("Delete this photo?")) remove.mutate(img.id); }}>
                <Trash2 className="size-4" />
              </Button>
              <Label htmlFor={`adm-replace-${img.id}`} className="mt-2 block text-sm">Replace photo</Label>
              <Input id={`adm-replace-${img.id}`} type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void replace(img.id, f);
                e.target.value = "";
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Events ---------------- */

type SchoolEvent = { id: string; title: string; description: string; event_date: string; image_url: string | null };
const emptyEvent = { title: "", description: "", event_date: "" };

function EventsPanel() {
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [file, setFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<SchoolEvent | null>(null);
  const { data: events = [], isPending } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data as SchoolEvent[];
    },
  });
  const refresh = () => void cache.invalidateQueries({ queryKey: ["events"] });
  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim() || !form.event_date || !form.description.trim()) throw new Error("Enter a title, date and description");
      let image_url = editing?.image_url ?? null;
      if (file) image_url = await uploadMedia(file, "events");
      const payload = { title: form.title.trim(), description: form.description.trim(), event_date: form.event_date, image_url };
      const result = editing
        ? await supabase.from("events").update(payload).eq("id", editing.id)
        : await supabase.from("events").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: () => { refresh(); setOpen(false); toast.success("Event saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setDeleting(null); toast.success("Event removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const start = (ev: SchoolEvent | null) => {
    setEditing(ev);
    setForm(ev ? { title: ev.title, description: ev.description, event_date: ev.event_date } : emptyEvent);
    setFile(null);
    setOpen(true);
  };

  return (
    <div className="grid gap-4">
      <Button className="justify-self-start" onClick={() => start(null)}><Plus />Add event</Button>
      {isPending ? <p className="text-muted-foreground">Loading events…</p> : events.length === 0 ? (
        <p className="text-muted-foreground">No events yet.</p>
      ) : (
        <div className="grid gap-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{ev.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(`${ev.event_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => start(ev)}><Pencil />Edit</Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${ev.title}`} onClick={() => setDeleting(ev)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit event" : "Add event"}</DialogTitle></DialogHeader>
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
            <Label htmlFor="adm-event-title">Title</Label>
            <Input id="adm-event-title" value={form.title} required maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Label htmlFor="adm-event-date">Date</Label>
            <Input id="adm-event-date" type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <Label htmlFor="adm-event-desc">Description</Label>
            <Textarea id="adm-event-desc" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Label htmlFor="adm-event-photo">Photo (optional)</Label>
            <Input id="adm-event-photo" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />}Save event</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleting?.title}?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Notices ---------------- */

type NoticeRow = { id: string; title: string; description: string; notice_date: string };
const emptyNotice = () => ({ title: "", description: "", notice_date: new Date().toISOString().slice(0, 10) });

function NoticesPanel() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NoticeRow | null>(null);
  const [form, setForm] = useState(emptyNotice());
  const [deleting, setDeleting] = useState<NoticeRow | null>(null);
  const { data: notices = [], isPending } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("notice_date", { ascending: false });
      if (error) throw error;
      return data as NoticeRow[];
    },
  });
  const refresh = () => void cache.invalidateQueries({ queryKey: ["notices"] });
  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim() || !form.description.trim() || !form.notice_date) throw new Error("Enter a title, date and description");
      const payload = { title: form.title.trim(), description: form.description.trim(), notice_date: form.notice_date };
      const result = editing
        ? await supabase.from("notices").update(payload).eq("id", editing.id)
        : await supabase.from("notices").insert({ ...payload, created_by: user?.id ?? null });
      if (result.error) throw result.error;
    },
    onSuccess: () => { refresh(); setOpen(false); toast.success("Notice saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setDeleting(null); toast.success("Notice deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const start = (n: NoticeRow | null) => {
    setEditing(n);
    setForm(n ? { title: n.title, description: n.description, notice_date: n.notice_date } : emptyNotice());
    setOpen(true);
  };

  return (
    <div className="grid gap-4">
      <Button className="justify-self-start" onClick={() => start(null)}><Plus />New notice</Button>
      {isPending ? <p className="text-muted-foreground">Loading notices…</p> : notices.length === 0 ? (
        <p className="text-muted-foreground">No notices yet.</p>
      ) : (
        <div className="grid gap-3">
          {notices.map((n) => (
            <div key={n.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(n.notice_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => start(n)}><Pencil />Edit</Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${n.title}`} onClick={() => setDeleting(n)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit notice" : "New notice"}</DialogTitle></DialogHeader>
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
            <Label htmlFor="adm-notice-title">Title</Label>
            <Input id="adm-notice-title" value={form.title} required maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Label htmlFor="adm-notice-date">Date</Label>
            <Input id="adm-notice-date" type="date" required value={form.notice_date} onChange={(e) => setForm({ ...form, notice_date: e.target.value })} />
            <Label htmlFor="adm-notice-desc">Description</Label>
            <Textarea id="adm-notice-desc" required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />}Save notice</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleting?.title}?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Fees ---------------- */

function FeesPanel() {
  const cache = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const { data = [], isPending } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fees").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async (row: { id: string; amount: string }) => {
      const { error } = await supabase.from("fees").update({ amount: row.amount.trim() || UNSET_FEE }).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => { void cache.invalidateQueries({ queryKey: ["fees"] }); toast.success("Fee updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <p className="text-muted-foreground">Loading fees…</p>;
  return (
    <table className="w-full max-w-2xl text-left text-sm">
      <thead className="bg-secondary">
        <tr><th className="px-4 py-3">Class</th><th className="px-4 py-3">Fee amount</th></tr>
      </thead>
      <tbody>
        {SCHOOL_GRADES.map((grade) => {
          const row = data.find((f) => f.class_name === grade);
          return (
            <tr key={grade} className="border-b border-border">
              <td className="px-4 py-3 font-medium">{grade}</td>
              <td className="px-4 py-3">
                {row ? (
                  <div className="flex items-center gap-2">
                    <Input aria-label={`Fee for ${grade}`} value={drafts[row.id] ?? row.amount} onChange={(e) => setDrafts({ ...drafts, [row.id]: e.target.value })} />
                    <Button size="icon" aria-label={`Save fee for ${grade}`} disabled={save.isPending} onClick={() => save.mutate({ id: row.id, amount: drafts[row.id] ?? row.amount })}><Save /></Button>
                  </div>
                ) : UNSET_FEE}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ---------------- About text ---------------- */

function AboutPanel() {
  const { data } = useSiteContent("about");
  const save = useSaveSiteContent("about");
  const [draft, setDraft] = useState<Partial<Record<"description" | "history" | "mission" | "vision", string>> | null>(null);
  const content = { ...contentDefaults.about, ...data, ...draft };
  const fields = [
    { key: "description", label: "About our school" },
    { key: "history", label: "Our history" },
    { key: "mission", label: "Our mission" },
    { key: "vision", label: "Our vision" },
  ] as const;

  return (
    <div className="grid max-w-2xl gap-4">
      {fields.map(({ key, label }) => (
        <div key={key} className="grid gap-2">
          <Label htmlFor={`adm-about-${key}`}>{label}</Label>
          <Textarea id={`adm-about-${key}`} rows={4} value={content[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
        </div>
      ))}
      <Button
        className="justify-self-start"
        disabled={save.isPending}
        onClick={async () => {
          try {
            await save.mutateAsync({ ...contentDefaults.about, ...data, ...draft });
            setDraft(null);
            toast.success("About page updated");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save");
          }
        }}
      >
        <Save />Save About text
      </Button>
    </div>
  );
}

/* ---------------- School logo ---------------- */

function LogoPanel() {
  const logo = useLogoUrl();
  const { data: branding } = useSiteContent("branding");
  const save = useSaveSiteContent("branding");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const changeLogo = async (file: File) => {
    setUploading(true);
    try {
      const logo_url = await uploadMedia(file, "branding");
      await save.mutateAsync({ ...branding, logo_url });
      toast.success("School logo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid max-w-sm gap-4">
      <div className="grid size-32 place-items-center rounded-2xl border border-border bg-background/60 p-4">
        <img src={logo} alt="Current school logo" className="max-h-full max-w-full object-contain" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) void changeLogo(f);
        e.target.value = "";
      }} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {branding?.logo_url ? "Replace logo" : "Upload logo"}
        </Button>
        {branding?.logo_url ? (
          <Button variant="outline" disabled={save.isPending || uploading} onClick={async () => {
            if (!confirm("Remove the uploaded logo and restore the original?")) return;
            try {
              await save.mutateAsync({ ...branding, logo_url: "" });
              toast.success("Original school logo restored");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not remove logo");
            }
          }}>
            <Trash2 className="size-4" />Remove uploaded logo
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

function OverviewPanel() {
  const { data, isPending, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const tables = ["gallery_images", "faculty", "leadership", "events", "notices", "admission_enquiries", "feedback"] as const;
      return Promise.all(tables.map(async (table) => {
        const result = await supabase.from(table).select("id", { count: "exact", head: true });
        if (result.error) throw result.error;
        return { table, count: result.count ?? 0 };
      }));
    },
  });
  const labels: Record<string, string> = { gallery_images: "Gallery photos", faculty: "Faculty", leadership: "School Management", events: "Events", notices: "Notices", admission_enquiries: "Admission enquiries", feedback: "Feedback" };
  if (isPending) return <p>Loading overview…</p>;
  if (error) return <p role="alert">Overview could not be loaded.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data?.map(({ table, count }) => <div key={table} className="rounded-lg border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{labels[table]}</p><p className="mt-3 text-3xl font-semibold text-gold">{count}</p></div>)}</div>;
}

function AdministrationPage() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [oauthBusy, setOauthBusy] = useState(false);
  const refusedRef = useRef(false);

  // Signed in but not an admin: refuse and log out.
  useEffect(() => {
    if (!loading && session && !isAdmin && !refusedRef.current) {
      refusedRef.current = true;
      toast.error("Access denied");
      void signOut().catch(() => toast.error("Could not fully clear sign-in. Please try again."));
    }
    if (!session) refusedRef.current = false;
  }, [loading, session, isAdmin, signOut]);

  const signInWithGoogle = async () => {
    setOauthBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/administration`,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setOauthBusy(false);
    }
    // On redirect the browser leaves the page; otherwise the session is set.
  };

  if (loading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-8 animate-spin text-gold" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
          <Button onClick={() => void signInWithGoogle()} disabled={oauthBusy} className="bg-gold-gradient rounded-full font-semibold">
            {oauthBusy ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in with Google
          </Button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4"><p role="alert">Access denied</p></main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Administration</h1>
          <p className="mt-1 text-sm font-semibold text-gold">Admin Mode</p>
        </div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link to="/home">Home</Link></Button><Button variant="outline" onClick={() => void signOut()}><LogOut className="size-4" />Sign out</Button></div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enquiries">Admission enquiries</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="management">School Management</TabsTrigger>
          <TabsTrigger value="about">About text</TabsTrigger>
          <TabsTrigger value="logo">School logo</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewPanel /></TabsContent>
        <TabsContent value="enquiries"><EnquiriesPanel /></TabsContent>
        <TabsContent value="feedback"><FeedbackPanel /></TabsContent>
        <TabsContent value="gallery"><GalleryPanel /></TabsContent>
        <TabsContent value="events"><EventsPanel /></TabsContent>
        <TabsContent value="notices"><NoticesPanel /></TabsContent>
        <TabsContent value="fees"><FeesPanel /></TabsContent>
        <TabsContent value="faculty"><PeopleEditor kind="faculty" /></TabsContent>
        <TabsContent value="management"><PeopleEditor kind="leadership" /></TabsContent>
        <TabsContent value="about"><AboutPanel /></TabsContent>
        <TabsContent value="logo"><LogoPanel /></TabsContent>
      </Tabs>
    </main>
  );
}
