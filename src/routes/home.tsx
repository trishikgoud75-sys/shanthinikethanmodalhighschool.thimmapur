import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSiteContent, useSaveSiteContent, contentDefaults } from '@/lib/site-content';
import { SLIDESHOW_HOLD_MS } from '@/lib/school-rules';
import { StorageImage } from '@/components/StorageImage';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { Reveal } from '@/components/Reveal';
import { ManagementMarquee } from '@/components/ManagementMarquee';
import { AdmissionForm } from '@/components/AdmissionForm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SCHOOL_NAME, SCHOOL_CLASSES, SCHOOL_ADDRESS_LINES, SCHOOL_MAP_EMBED, SCHOOL_MAP_LINK } from '@/components/nav-items';

export const Route = createFileRoute('/home')({ head: () => ({ meta: [
  { title: 'Shanthinikethan Model High School | Towards the Better Future' },
  { name: 'description', content: 'Shanthinikethan Model High School in Thimmapur, Telangana. Nursery to Class 10.' },
  { property: 'og:title', content: 'Shanthinikethan Model High School' },
  { property: 'og:description', content: 'Towards the Better Future — Nursery to Class 10 in Thimmapur, Telangana.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: HomePage });

/** School name revealed letter by letter. */
function AnimatedTitle({ text }: { text: string }) {
  let i = 0;
  return (
    <h1 aria-label={text} className="mx-auto max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
      {text.split(' ').map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {word.split('').map((ch) => {
            const delay = i++ * 45;
            return <span key={`${w}-${delay}`} aria-hidden className="hero-letter" style={{ animationDelay: `${delay}ms` }}>{ch}</span>;
          })}
          {w < text.split(' ').length - 1 ? <span aria-hidden>&nbsp;</span> : null}
        </span>
      ))}
    </h1>
  );
}

function HomePage() {
  const { isAdmin } = useAuth();
  const { data: content } = useSiteContent('homepage');
  const save = useSaveSiteContent('homepage');
  const [draft, setDraft] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const { data: photos = [] } = useQuery({ queryKey: ['gallery_images'], queryFn: async () => {
    const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
    if (error) throw error; return data;
  }});
  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % photos.length), SLIDESHOW_HOLD_MS + 1500);
    return () => clearInterval(timer);
  }, [photos.length]);

  return <main>
    {/* Hero: animated school name, class range, glowing Admission button */}
    <section className="mx-auto max-w-5xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
      <AnimatedTitle text={SCHOOL_NAME} />
      <p className="hero-letter mt-4 text-xs font-medium uppercase tracking-[0.3em] text-gold sm:text-sm" style={{ animationDelay: `${SCHOOL_NAME.length * 45 + 150}ms` }}>
        {SCHOOL_CLASSES}
      </p>
      <div className="hero-letter mt-8" style={{ animationDelay: `${SCHOOL_NAME.length * 45 + 350}ms` }}>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gold-gradient btn-glow rounded-full px-10 text-base font-semibold">Admission</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">Admission Form</DialogTitle></DialogHeader>
            <AdmissionForm variant="quick" />
          </DialogContent>
        </Dialog>
      </div>

      {/* A few short, admin-editable lines about the school */}
      <Reveal>
        <p className="mx-auto mt-10 max-w-3xl leading-relaxed text-muted-foreground">{content?.intro ?? contentDefaults.homepage.intro}</p>
      </Reveal>
      {isAdmin && <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left"><Textarea aria-label="School introduction" value={draft ?? content?.intro ?? contentDefaults.homepage.intro} onChange={e => setDraft(e.target.value)} rows={4} /><Button className="justify-self-end" disabled={save.isPending} onClick={async () => { try { await save.mutateAsync({ ...contentDefaults.homepage, ...content, intro: draft ?? content?.intro ?? contentDefaults.homepage.intro }); setDraft(null); toast.success('Introduction updated'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save'); } }}><Save />Save introduction</Button></div>}
    </section>

    {/* Photo slideshow: fade in, hold, fade out, soft zoom, loops forever */}
    <section aria-label="School photos" className="relative mx-auto aspect-[4/3] max-w-6xl overflow-hidden sm:aspect-[16/9]">
      {photos.length === 0 ? <PhotoPlaceholder className="size-full min-h-64" label="Photos coming soon" /> : photos.map((photo, i) => <div key={photo.id} className={`absolute inset-0 transition-opacity duration-[1500ms] motion-reduce:transition-none ${i === index % photos.length ? 'opacity-100' : 'opacity-0'}`} aria-hidden={i !== index % photos.length}><StorageImage path={photo.image_url} alt={photo.title} className={`size-full object-cover ${i === index % photos.length ? 'ken-burns' : ''}`} /></div>)}
    </section>

    {/* Address as text + Address button opening the map modal */}
    <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <Reveal>
        <MapPin className="mx-auto size-6 text-gold" />
        <h2 className="mt-3 font-display text-2xl font-semibold">School address</h2>
        <address className="mt-4 not-italic leading-relaxed text-muted-foreground">{SCHOOL_ADDRESS_LINES.map(line => <span key={line} className="block">{line}</span>)}</address>
        <Dialog>
          <DialogTrigger asChild><Button className="bg-gold-gradient mt-6"><MapPin />Address</Button></DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader><DialogTitle>Visit Shanthinikethan</DialogTitle></DialogHeader>
            <iframe title="School map" src={SCHOOL_MAP_EMBED} loading="lazy" className="h-[45vh] min-h-56 w-full rounded-lg border-0" />
            <Button asChild><a href={SCHOOL_MAP_LINK} target="_blank" rel="noreferrer"><Navigation />Get Directions</a></Button>
          </DialogContent>
        </Dialog>
      </Reveal>
    </section>

    {/* School Management photo strip */}
    <ManagementMarquee />
  </main>;
}
