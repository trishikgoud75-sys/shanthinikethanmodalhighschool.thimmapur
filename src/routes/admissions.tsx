import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, FileSignature, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/site-content";
import { SCHOOL_ADDRESS_LINES, SCHOOL_MAP_LINK, SCHOOL_NAME, ADMISSION_PERIOD, SCHOOL_CLASSES, SCHOOL_EMAIL } from "@/components/nav-items";
import { AdmissionForm } from "@/components/AdmissionForm";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — Shanthinikethan Model High School" },
      {
        name: "description",
        content:
          "Admission information, required documents and important dates for Shanthinikethan Model High School, Thimmapur Village, Kothur Mandal, Rangareddy District, Telangana 509325.",
      },
      { property: "og:title", content: "Admissions — Shanthinikethan Model High School" },
      {
        property: "og:description",
        content: "How to apply, what to bring and when — admissions at Shanthinikethan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://shanthinikethanmodalhighschool.lovable.app/admissions" }],
  }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  const { data } = useSiteContent("admissions");

  return (
    <>
      <PageHeader
        eyebrow="Admissions"
        title="Admission"
        description={`Admissions open from ${ADMISSION_PERIOD}. Classes: ${SCHOOL_CLASSES}.`}
      />

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <ol className="grid gap-4 sm:grid-cols-4">
          {["Enquire", "Submit documents", "Interaction", "Confirmation"].map((s, i) => (
            <Reveal key={s} delay={i * 80} className="glass flex items-center gap-3 p-5">
              <span className="bg-gold-gradient grid size-9 shrink-0 place-items-center rounded-full font-semibold">{i + 1}</span>
              <span className="font-medium">{s}</span>
            </Reveal>
          ))}
        </ol>
        <Reveal className="glass mt-6 p-6 sm:p-8">
          <h2 className="mb-6 font-display text-2xl font-semibold">Admission Form</h2>
          <AdmissionForm variant="full" />
        </Reveal>
      </section>


      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <Reveal className="glass p-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold">Documents required</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground">
            {(data?.requirements ?? []).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
            {!data?.requirements?.length ? <li>To be announced by the school office.</li> : null}
          </ul>
        </Reveal>

        <Reveal delay={120} className="glass p-8">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CalendarCheck className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold">Important dates</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            {(data?.dates ?? []).map((d) => (
              <div key={d.label} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="font-medium">{d.value}</dd>
              </div>
            ))}
            {!data?.dates?.length ? (
              <p className="text-muted-foreground">Admissions open from {ADMISSION_PERIOD}.</p>
            ) : null}
          </dl>
        </Reveal>

        <Reveal delay={200} className="glass p-8 lg:col-span-2">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <FileSignature className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold">How to apply</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {data?.contact ||
              "Visit the school office during working hours to collect an application form."}
          </p>
          <address className="mt-5 text-sm not-italic leading-relaxed text-muted-foreground">
            <span className="block font-medium text-foreground">{SCHOOL_NAME}</span>
            {SCHOOL_ADDRESS_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={SCHOOL_MAP_LINK} target="_blank" rel="noreferrer">
                <MapPin className="size-4" /> Get directions
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={`mailto:${SCHOOL_EMAIL}`}>Contact the office</a>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
