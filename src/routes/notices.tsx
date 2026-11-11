import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import {
  CalendarDays,
  Loader2,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { StorageImage } from "@/components/StorageImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl, uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices & Circulars — Shanthinikethan Model High School" },
      {
        name: "description",
        content:
          "Latest school notices, circulars and announcements for students and parents at Shanthinikethan Model High School.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Notices — Shanthinikethan Model High School" },
      {
        property: "og:description",
        content: "Announcements, circulars and important dates, newest first.",
      },
    ],
  }),
  component: NoticesPage,
});

type Notice = {
  id: string;
  title: string;
  description: string;
  notice_date: string;
  image_url: string | null;
  category: string;
  pinned: boolean;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
};

export const NOTICE_CATEGORIES = [
  "general",
  "exams",
  "events",
  "holidays",
  "fees",
  "admissions",
] as const;

const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  description: z.string().trim().min(1, "Add a short description").max(4000),
  notice_date: z.string().min(1, "Pick a date"),
  category: z.string().trim().min(1).max(40),
  pinned: z.boolean(),
});

const emptyForm = {
  title: "",
  description: "",
  notice_date: new Date().toISOString().slice(0, 10),
  category: "general",
  pinned: false,
};

function AttachmentLink({ path, name }: { path: string; name: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void resolveMediaUrl(path).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
    >
      <Paperclip className="size-4" />
      {name ?? "Download attachment"}
    </a>
  );
}

function NoticesPage() {
  const { isAdmin, user, session } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("notice_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });


  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setAttachment(null);
    setDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditing(notice);
    setForm({
      title: notice.title,
      description: notice.description,
      notice_date: notice.notice_date,
      category: notice.category ?? "general",
      pinned: notice.pinned ?? false,
    });
    setFile(null);
    setAttachment(null);
    setDialogOpen(true);
  };

  const saveNotice = useMutation({
    mutationFn: async () => {
      const parsed = noticeSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the form");

      let imagePath = editing?.image_url ?? null;
      if (file) imagePath = await uploadMedia(file, "notices");

      let attachmentPath = editing?.attachment_url ?? null;
      let attachmentName = editing?.attachment_name ?? null;
      if (attachment) {
        attachmentPath = await uploadMedia(attachment, "notice-files");
        attachmentName = attachment.name.slice(0, 120);
      }

      const payload = {
        ...parsed.data,
        image_url: imagePath,
        attachment_url: attachmentPath,
        attachment_name: attachmentName,
      };

      if (editing) {
        const { error } = await supabase.from("notices").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notices")
          .insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setDialogOpen(false);
      toast.success(editing ? "Notice updated" : "Notice published");
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const togglePin = useMutation({
    mutationFn: async (notice: Notice) => {
      const { error } = await supabase
        .from("notices")
        .update({ pinned: !notice.pinned })
        .eq("id", notice.id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notices"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteNotice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleteId(null);
      toast.success("Notice deleted");
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Notices"
        title="Notices & circulars"
        description="Everything students and parents need to know, newest announcements first."
      >
        {isAdmin ? (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New notice
          </Button>
        ) : session ? (
          <p className="text-sm text-muted-foreground">
            You are viewing notices as a student or parent.
          </p>
        ) : null}
      </PageHeader>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-center text-muted-foreground">No notices published yet.</p>
        ) : (
          <div className="grid gap-5">
            {notices.map((notice, i) => (
              <Reveal key={notice.id} delay={Math.min(i, 4) * 70}>
                <Card className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
                  {notice.image_url ? (
                    <StorageImage
                      path={notice.image_url}
                      alt={notice.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : null}
                  <CardContent className="p-6">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {new Date(notice.notice_date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">{notice.title}</h2>
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
                      {notice.description}
                    </p>
                    {notice.attachment_url ? (
                      <AttachmentLink
                        path={notice.attachment_url}
                        name={notice.attachment_name}
                      />
                    ) : null}
                    {isAdmin ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(notice)}>
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePin.mutate(notice)}
                        >
                          {notice.pinned ? (
                            <PinOff className="size-4" />
                          ) : (
                            <Pin className="size-4" />
                          )}
                          {notice.pinned ? "Unpin" : "Pin to top"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(notice.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit notice" : "New notice"}</DialogTitle>
            <DialogDescription>
              Published notices are visible to everyone visiting the site.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveNotice.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="notice-title">Title</Label>
              <Input
                id="notice-title"
                value={form.title}
                maxLength={160}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="notice-date">Date</Label>
                <Input
                  id="notice-date"
                  type="date"
                  value={form.notice_date}
                  onChange={(e) => setForm({ ...form, notice_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notice-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger id="notice-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notice-description">Description</Label>
              <Textarea
                id="notice-description"
                rows={6}
                maxLength={4000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notice-file">Cover image (optional)</Label>
              <Input
                id="notice-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notice-attachment">Attachment — PDF or document (optional)</Label>
              <Input
                id="notice-attachment"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-[hsl(var(--primary))]"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />
              Pin this notice to the top
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveNotice.isPending}>
                {saveNotice.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Publish notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the notice for everyone. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteNotice.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
