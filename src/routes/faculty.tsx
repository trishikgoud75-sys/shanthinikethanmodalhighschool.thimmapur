import { createFileRoute } from '@tanstack/react-router';
import { PeopleEditor } from '@/components/PeopleEditor';
import { PageHeader } from '@/components/PageHeader';
export const Route = createFileRoute('/faculty')({
  head: () => ({ meta: [
    { title: 'Faculty — Shanthinikethan Model High School' },
    { name: 'description', content: 'Teacher profiles, subjects and qualifications at Shanthinikethan Model High School, Thimmapur.' },
    { property: 'og:title', content: 'Faculty — Shanthinikethan Model High School' },
    { property: 'og:description', content: 'Meet the teachers of Shanthinikethan Model High School.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: FacultyPage,
});
function FacultyPage() { return <><PageHeader title="Our Faculty" /><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><PeopleEditor kind="faculty" /></section></>; }
