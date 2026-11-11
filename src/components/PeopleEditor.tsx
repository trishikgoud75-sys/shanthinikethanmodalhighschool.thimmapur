import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { uploadMedia } from '@/lib/media';
import { StorageImage } from './StorageImage';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

type Person = { id: string; full_name: string; designation: string; photo_url: string | null; subject?: string; qualification?: string };
const blank = { full_name: '', designation: '', subject: '', qualification: '' };
export function PeopleEditor({ kind }: { kind: 'faculty' | 'leadership' }) {
  const { isAdmin } = useAuth();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [deleting, setDeleting] = useState<Person | null>(null);
  const { data: people = [], isPending, isError } = useQuery({ queryKey: [kind], queryFn: async () => {
    const { data, error } = await supabase.from(kind).select('*').order('sort_order').order('created_at');
    if (error) throw error;
    return data as Person[];
  }});
  const refresh = () => { void cache.invalidateQueries({ queryKey: [kind] }); };
  const save = useMutation({ mutationFn: async () => {
    if (!form.full_name.trim() || !form.designation.trim()) throw new Error('Enter a name and designation');
    let photo_url = clearPhoto ? null : editing?.photo_url ?? null;
    if (file) photo_url = await uploadMedia(file, kind);
    const base = { full_name: form.full_name.trim(), designation: form.designation.trim(), photo_url };
    const payload = kind === 'faculty' ? { ...base, subject: form.subject.trim(), qualification: form.qualification.trim() } : base;
    const result = editing ? await supabase.from(kind).update(payload).eq('id', editing.id) : await supabase.from(kind).insert(payload);
    if (result.error) throw result.error;
  }, onSuccess: () => { refresh(); setOpen(false); toast.success('Profile saved'); }, onError: (e: Error) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: async (id: string) => {
    const { error } = await supabase.from(kind).delete().eq('id', id);
    if (error) throw error;
  }, onSuccess: () => { refresh(); setDeleting(null); toast.success('Profile removed'); }, onError: (e: Error) => toast.error(e.message) });
  const start = (person: Person | null) => {
    setEditing(person); setForm(person ? { full_name: person.full_name, designation: person.designation, subject: person.subject ?? '', qualification: person.qualification ?? '' } : blank);
    setFile(null); setClearPhoto(false); setOpen(true);
  };
  return <>
    {isAdmin && <Button onClick={() => start(null)} className="mb-6"><Plus />{kind === 'faculty' ? 'Add faculty' : 'Add person'}</Button>}
    {isPending ? <p className="py-12 text-muted-foreground">Loading profiles…</p> : isError ? <p role="alert">Profiles could not be loaded. Please try again.</p> : people.length === 0 ? <PhotoPlaceholder className="min-h-64 rounded-lg" label="Profiles coming soon" /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {people.map(person => <article key={person.id} className="group overflow-hidden rounded-lg border border-border bg-card">
        {person.photo_url ? <StorageImage path={person.photo_url} alt={person.full_name} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <PhotoPlaceholder className="aspect-[4/5]" />}
        <div className="relative bg-card p-5"><h2 className="font-display text-xl font-semibold break-words">{person.full_name}</h2><p className="mt-1 text-sm text-gold">{person.designation}</p>{person.subject && <p className="mt-2 text-sm">{person.subject}</p>}{person.qualification && <p className="mt-1 text-sm text-muted-foreground">{person.qualification}</p>}
          {isAdmin && <div className="mt-4 flex gap-2"><Button variant="outline" size="sm" onClick={() => start(person)}><Pencil />Edit</Button><Button variant="ghost" size="icon" aria-label={`Delete ${person.full_name}`} onClick={() => setDeleting(person)}><Trash2 className="text-destructive" /></Button></div>}
        </div>
      </article>)}
    </div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit profile' : 'Add profile'}</DialogTitle></DialogHeader><form className="grid gap-4" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
      {(['full_name', 'designation', ...(kind === 'faculty' ? ['subject', 'qualification'] : [])] as (keyof typeof blank)[]).map(key => <div key={key} className="grid gap-2"><Label htmlFor={`person-${key}`}>{key === 'full_name' ? 'Name' : key.charAt(0).toUpperCase() + key.slice(1)}</Label><Input id={`person-${key}`} value={form[key]} required={key === 'full_name' || key === 'designation'} maxLength={160} onChange={e => setForm({ ...form, [key]: e.target.value })} /></div>)}
      <div className="grid gap-2"><Label htmlFor="person-photo">{editing ? 'Replace photo' : 'Photo'}</Label><Input id="person-photo" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
      {editing?.photo_url && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={clearPhoto} onChange={e => setClearPhoto(e.target.checked)} />Remove current photo</label>}
      <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />}Save profile</Button>
    </form></DialogContent></Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={value => { if (!value) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Remove {deleting?.full_name}?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">This profile will no longer appear on the website.</p><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={remove.isPending} onClick={() => { if (deleting) remove.mutate(deleting.id); }}>Delete</Button></div></DialogContent></Dialog>
  </>;
}
