import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SCHOOL_GRADES, UNSET_FEE } from '@/lib/school-rules';
export const Route = createFileRoute('/fees')({ head: () => ({ meta: [
  { title: 'Fees — Shanthinikethan Model High School' }, { name: 'description', content: 'Class-wise fee information from Nursery to Class 10 at Shanthinikethan Model High School.' },
  { property: 'og:title', content: 'Fees — Shanthinikethan Model High School' }, { property: 'og:description', content: 'The latest class-wise fees published by the school office.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: FeesPage });
function FeesPage() {
  const { isAdmin } = useAuth(); const cache = useQueryClient(); const [drafts, setDrafts] = useState<Record<string, string>>({});
  const { data = [], isPending, isError } = useQuery({ queryKey: ['fees'], queryFn: async () => { const { data, error } = await supabase.from('fees').select('*').order('sort_order'); if(error) throw error; return data; } });
  const save = useMutation({ mutationFn: async (row: { id: string; amount: string }) => { const { error } = await supabase.from('fees').update({ amount: row.amount.trim() || UNSET_FEE }).eq('id', row.id); if(error) throw error; }, onSuccess: () => { void cache.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee updated'); }, onError: (e: Error) => toast.error(e.message) });
  return <><PageHeader title="Fees" /><section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    {isPending ? <p>Loading fees…</p> : isError ? <p role="alert">Fees could not be loaded. Please try again.</p> : <table className="w-full text-left text-sm"><thead className="bg-secondary"><tr><th className="px-4 py-4">Class</th><th className="px-4 py-4">Fee amount</th></tr></thead><tbody>{SCHOOL_GRADES.map(grade => { const row = data.find(f => f.class_name === grade); return <tr key={grade} className="border-b border-border"><td className="px-4 py-4 font-medium">{grade}</td><td className="px-4 py-4">{isAdmin && row ? <div className="flex items-center gap-2"><Input aria-label={`Fee for ${grade}`} value={drafts[row.id] ?? row.amount} onChange={e => setDrafts({ ...drafts, [row.id]: e.target.value })} /><Button size="icon" aria-label={`Save fee for ${grade}`} disabled={save.isPending} onClick={() => save.mutate({ id: row.id, amount: drafts[row.id] ?? row.amount })}><Save /></Button></div> : row?.amount || UNSET_FEE}</td></tr>; })}</tbody></table>}
  </section></>;
}
