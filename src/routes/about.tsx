import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Upload, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StorageImage } from '@/components/StorageImage';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { useAuth } from '@/hooks/useAuth';
import { useSiteContent, useSaveSiteContent, contentDefaults, type AboutContent } from '@/lib/site-content';
import { uploadMedia } from '@/lib/media';
export const Route = createFileRoute('/about')({ head: () => ({ meta: [
  { title: 'About — Shanthinikethan Model High School' }, { name: 'description', content: 'Our school history, mission and vision at Shanthinikethan Model High School, Thimmapur.' },
  { property: 'og:title', content: 'About Shanthinikethan Model High School' }, { property: 'og:description', content: 'Our history, mission and vision.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: AboutPage });
const sections = [{ key: 'description', title: 'About our school' }, { key: 'history', title: 'Our history' }, { key: 'mission', title: 'Our mission' }, { key: 'vision', title: 'Our vision' }] as const;
function AboutPage() {
  const { isAdmin } = useAuth(); const { data } = useSiteContent('about'); const save = useSaveSiteContent('about');
  const [draft, setDraft] = useState<AboutContent | null>(null); const [uploading, setUploading] = useState(false);
  const content = draft ?? data ?? contentDefaults.about;
  async function replacePhoto(index: number, file: File) {
    setUploading(true);
    try {
      const path = await uploadMedia(file, 'about');
      await persist({ ...content, photos: content.photos.map((photo, i) => i === index ? path : photo) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Photo replacement failed');
    } finally {
      setUploading(false);
    }
  }
  async function persist(value: AboutContent) { try { await save.mutateAsync(value); setDraft(null); toast.success('About page updated'); } catch(e) { toast.error(e instanceof Error ? e.message : 'Could not save'); } }
  return <><PageHeader title="About Shanthinikethan" /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><div className="grid gap-10 lg:grid-cols-2">
    <div className="grid gap-8">{sections.map(({key,title}) => <div key={key}><h2 className="font-display text-2xl font-semibold">{title}</h2>{isAdmin ? <div className="mt-3"><Label className="sr-only" htmlFor={`about-${key}`}>{title}</Label><Textarea id={`about-${key}`} value={content[key]} onChange={e => setDraft({ ...content, [key]: e.target.value })} rows={4} /></div> : <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{content[key] || (key === 'description' ? contentDefaults.homepage.intro : 'To be updated.')}</p>}</div>)}{isAdmin && <Button disabled={save.isPending} onClick={() => void persist(content)}><Save />Save About text</Button>}</div>
    <div className="grid content-start gap-5">{content.photos.length ? content.photos.map((photo,i) => <div key={`${photo}-${i}`} className="relative overflow-hidden rounded-lg"><StorageImage path={photo} alt="Shanthinikethan school" className="aspect-[4/3] w-full object-cover" />{isAdmin && <Button size="icon" variant="destructive" aria-label="Remove About photo" className="absolute right-2 top-2" onClick={() => void persist({ ...content, photos: content.photos.filter((_,k) => k !== i) })}><Trash2 /></Button>}</div>) : <PhotoPlaceholder className="aspect-[4/3] rounded-lg" />}
    {isAdmin && <div className="grid gap-2">{content.photos.map((photo, i) => <div key={photo} className="grid gap-2"><Label htmlFor={`about-replace-${i}`}>Replace photo {i + 1}</Label><Input id={`about-replace-${i}`} type="file" accept="image/*" disabled={uploading} onChange={e => { const file = e.target.files?.[0]; if (file) void replacePhoto(i, file); e.target.value = ''; }} /></div>)}<Label htmlFor="about-photo"><Upload className="mr-2 inline size-4" />Add photos</Label><Input id="about-photo" type="file" multiple accept="image/*" disabled={uploading} onChange={async e => { const files = Array.from(e.target.files ?? []); if(!files.length) return; setUploading(true); try { const paths = []; for(const file of files) paths.push(await uploadMedia(file,'about')); await persist({ ...content, photos: [...content.photos, ...paths] }); } catch(e) { toast.error(e instanceof Error ? e.message : 'Upload failed'); } finally { setUploading(false); } }} />{uploading && <p className="text-sm">Uploading photos…</p>}</div>}
    </div></div></section></>;
}
