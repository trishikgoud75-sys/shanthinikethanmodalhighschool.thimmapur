import { createFileRoute } from '@tanstack/react-router';
import { PeopleEditor } from '@/components/PeopleEditor';
import { PageHeader } from '@/components/PageHeader';
export const Route = createFileRoute('/management')({
  head: () => ({ meta: [
    { title: 'School Management — Shanthinikethan Model High School' },
    { name: 'description', content: 'Meet the school management, principal and leadership of Shanthinikethan Model High School in Thimmapur.' },
    { property: 'og:title', content: 'School Management — Shanthinikethan Model High School' },
    { property: 'og:description', content: 'The people leading Shanthinikethan Model High School.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: ManagementPage,
});
function ManagementPage() { return <><PageHeader title="School Management" /><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><PeopleEditor kind="leadership" /></section></>; }
