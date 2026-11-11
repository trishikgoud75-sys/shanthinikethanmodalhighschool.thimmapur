import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StorageImage } from '@/components/StorageImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { uploadMedia } from '@/lib/media';
export const Route = createFileRoute('/events')({ head: () => ({ meta: [
  { title: 'Events — Shanthinikethan Model High School' }, { name: 'description', content: 'School events, dates and celebrations at Shanthinikethan Model High School.' },
  { property: 'og:title', content: 'Events — Shanthinikethan Model High School' }, { property: 'og:description', content: 'The latest school events and celebrations.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: EventsPage });
type SchoolEvent = { id: string; title: string; description: string; event_date: string; image_url: string | null };
const empty = { title: '', description: '', event_date: '' };
function EventsPage() {
  const { isAdmin } = useAuth(); const cache = useQueryClient();
  const [open,setOpen] = useState(false); const [editing,setEditing] = useState<SchoolEvent | null>(null); const [form,setForm] = useState(empty); const [file,setFile] = useState<File | null>(null); const [clearPhoto,setClearPhoto] = useState(false); const [deleting,setDeleting] = useState<SchoolEvent | null>(null);
  const { data: events = [], isPending, isError } = useQuery({ queryKey: ['events'], queryFn: async () => { const { data,error } = await supabase.from('events').select('*').order('event_date',{ascending:false}).order('created_at',{ascending:false}); if(error) throw error; return data; } });
  const refresh = () => { void cache.invalidateQueries({queryKey:['events']}); };
  const save = useMutation({ mutationFn: async () => {
    if(!form.title.trim() || !form.event_date || !form.description.trim()) throw new Error('Enter a title, date and description');
    let image_url = clearPhoto ? null : editing?.image_url ?? null; if(file) image_url = await uploadMedia(file,'events');
    const payload = {...form,title:form.title.trim(),description:form.description.trim(),image_url};
    const result = editing ? await supabase.from('events').update(payload).eq('id',editing.id) : await supabase.from('events').insert(payload); if(result.error) throw result.error;
  }, onSuccess: () => { refresh();setOpen(false);toast.success('Event saved'); },onError:(e:Error)=>toast.error(e.message) });
  const remove = useMutation({mutationFn:async(id:string)=>{ const {error}=await supabase.from('events').delete().eq('id',id);if(error)throw error;},onSuccess:()=>{refresh();setDeleting(null);toast.success('Event removed');},onError:(e:Error)=>toast.error(e.message)});
  const start = (event:SchoolEvent|null) => {setEditing(event);setForm(event?{title:event.title,description:event.description,event_date:event.event_date}:empty);setFile(null);setClearPhoto(false);setOpen(true);};
  return <><PageHeader title="School Events">{isAdmin&&<Button onClick={()=>start(null)}><Plus/>Add event</Button>}</PageHeader><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    {isPending?<p>Loading events…</p>:isError?<p role="alert">Events could not be loaded. Please try again.</p>:events.length===0?<div className="py-16 text-center"><CalendarDays className="mx-auto size-10 text-gold"/><h2 className="mt-4 font-display text-2xl">Events coming soon</h2></div>:<div className="grid gap-6 md:grid-cols-2">{events.map(event=><article key={event.id} className="overflow-hidden rounded-lg border border-border bg-card">{event.image_url&&<StorageImage path={event.image_url} alt={event.title} className="aspect-[16/9] w-full object-cover"/>}<div className="p-6"><time className="text-sm text-gold">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</time><h2 className="mt-2 font-display text-2xl font-semibold">{event.title}</h2><p className="mt-3 whitespace-pre-line text-muted-foreground">{event.description}</p>{isAdmin&&<div className="mt-5 flex gap-2"><Button variant="outline" onClick={()=>start(event)}><Pencil/>Edit</Button><Button variant="ghost" size="icon" aria-label={`Delete ${event.title}`} onClick={()=>setDeleting(event)}><Trash2 className="text-destructive"/></Button></div>}</div></article>)}</div>}
  </section><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?'Edit event':'Add event'}</DialogTitle></DialogHeader><form className="grid gap-4" onSubmit={e=>{e.preventDefault();save.mutate();}}><Label htmlFor="event-title">Title</Label><Input id="event-title" value={form.title} required maxLength={160} onChange={e=>setForm({...form,title:e.target.value})}/><Label htmlFor="event-date">Date</Label><Input id="event-date" type="date" required value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/><Label htmlFor="event-description">Description</Label><Textarea id="event-description" required rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><Label htmlFor="event-photo">Photo (optional)</Label><Input id="event-photo" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]??null)}/>{editing?.image_url&&<label className="flex gap-2 text-sm"><input type="checkbox" checked={clearPhoto} onChange={e=>setClearPhoto(e.target.checked)}/>Remove current photo</label>}<Button type="submit" disabled={save.isPending}>Save event</Button></form></DialogContent></Dialog>
  <Dialog open={Boolean(deleting)} onOpenChange={value=>{if(!value)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle>Delete {deleting?.title}?</DialogTitle></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={remove.isPending} onClick={()=>{if(deleting)remove.mutate(deleting.id);}}>Delete</Button></div></DialogContent></Dialog></>;
}
