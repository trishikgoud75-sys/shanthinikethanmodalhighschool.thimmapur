import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BootSplash } from "@/components/BootSplash";

/**
 * Entry gate: sends every visitor to the public home page.
 */
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shanthinikethan Model High School — Thimmapur, Rangareddy" },
      {
        name: "description",
        content:
          "Shanthinikethan Model High School, Thimmapur Village, Kothur Mandal, Rangareddy District. Notices, gallery, faculty, admissions and school updates.",
      },
      { property: "og:title", content: "Shanthinikethan Model High School" },
      {
        property: "og:description",
        content: "Empowering young minds for a brighter future — explore our school online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entry,
});

function Entry() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/home", replace: true });
  }, [navigate]);

  return <BootSplash />;
}
