import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, X, Images } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { StorageImage } from "@/components/StorageImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Shanthinikethan Model High School" },
      {
        name: "description",
        content:
          "Photo albums of classrooms, the library, laboratories, sports days and campus life at Shanthinikethan Model High School.",
      },
      { property: "og:title", content: "Gallery — Shanthinikethan Model High School" },
      {
        property: "og:description",
        content: "A look at everyday life on the Shanthinikethan campus, sorted into albums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

type Slide = { path: string; alt: string };


function GalleryPage() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [slide, setSlide] = useState<Slide | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const replaceImage = async (id: string, file: File) => {
    setReplacing(id);
    try {
      const image_url = await uploadMedia(file, 'gallery');
      const { error } = await supabase.from('gallery_images').update({ image_url }).eq('id', id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      toast.success('Photo replaced');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Photo replacement failed');
    } finally {
      setReplacing(null);
    }
  };

  const { data: uploads = [] } = useQuery({
    queryKey: ["gallery_images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const albums = useMemo(() => {
    const names = new Set<string>(["All"]);
    uploads.forEach((u) => names.add((u as { album?: string }).album || "General"));
    return [...names];
  }, [uploads]);

  const visibleUploads = uploads.filter(
    (u) => activeAlbum === "All" || ((u as { album?: string }).album || "General") === activeAlbum,
  );


  const addImage = useMutation({
    mutationFn: async () => {
      if (!files.length) throw new Error("Choose photos first");
      for (const file of files) {
        const path = await uploadMedia(file, "gallery");
        const { error } = await supabase.from("gallery_images").insert({ title: title.trim() || file.name, album: album.trim() || "General", image_url: path, created_by: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setTitle("");
      setFiles([]);
      toast.success("Photo added to the gallery");
      void queryClient.invalidateQueries({ queryKey: ["gallery_images"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photo removed");
      void queryClient.invalidateQueries({ queryKey: ["gallery_images"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Life at Shanthinikethan"
        description="Everyday moments from classrooms, corridors, fields and field trips — browse by album."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {isAdmin ? (
          <Reveal className="mb-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Upload a real school photo</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Give it an album name (event or year) so photos stay organised.
                </p>
                <form
                  className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addImage.mutate();
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="gallery-title">Caption</Label>
                    <Input
                      id="gallery-title"
                      value={title}
                      maxLength={120}
                      placeholder="Annual day rehearsal"
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gallery-album">Album</Label>
                    <Input
                      id="gallery-album"
                      value={album}
                      maxLength={60}
                      placeholder="Annual Day 2026"
                      onChange={(e) => setAlbum(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gallery-file">Photo</Label>
                    <Input
                      id="gallery-file"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    />
                  </div>
                  <Button type="submit" disabled={addImage.isPending}>
                    {addImage.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Upload
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        <div className="mb-8 flex flex-wrap gap-2">
          {albums.map((name) => (
            <Button
              key={name}
              type="button"
              onClick={() => setActiveAlbum(name)}
              className={cn(
                "rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors",
                activeAlbum === name
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-secondary",
              )}
            >
              {name}
            </Button>
          ))}
        </div>

        {visibleUploads.length === 0 ? (
          <Reveal className="glass mx-auto max-w-2xl p-12 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Images className="size-7" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold">No photos yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              School photos will appear here as soon as they are uploaded.
            </p>
          </Reveal>
        ) : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {visibleUploads.map(image => <Button key={image.id} variant="ghost" className="group relative h-auto overflow-hidden rounded-lg p-0" onClick={() => setSlide({ path: image.image_url, alt: image.title })} aria-label={`View ${image.title}`}>
              <StorageImage path={image.image_url} alt={image.title} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </Button>)}
          </div>
        )}

        {isAdmin && visibleUploads.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-lg font-semibold">Manage photos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visibleUploads.map((image) => (
                <div key={image.id} className="photo-frame relative">
                  <StorageImage
                    path={image.image_url}
                    alt={image.title}
                    className="h-32 w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    aria-label="Delete photo"
                    className="absolute right-2 top-2"
                    onClick={() => removeImage.mutate(image.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Label htmlFor={`replace-${image.id}`} className="mt-2 block text-sm">Replace photo</Label>
                  <Input id={`replace-${image.id}`} type="file" accept="image/*" disabled={replacing !== null} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) void replaceImage(image.id, file);
                    e.target.value = '';
                  }} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </section>

      <Dialog open={Boolean(slide)} onOpenChange={open => { if (!open) setSlide(null); }}>
        <DialogContent className="sm:max-w-5xl"><DialogHeader><DialogTitle>{slide?.alt || 'School photo'}</DialogTitle></DialogHeader>
          {slide && <StorageImage path={slide.path} alt={slide.alt} className="max-h-[75vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
