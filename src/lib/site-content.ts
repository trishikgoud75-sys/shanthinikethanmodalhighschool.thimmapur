import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HomepageContent = {
  hero_title: string;
  hero_subtitle: string;
  hero_location: string;
  hero_pin: string;
  intro: string;
  highlights: { title: string; text: string }[];
};

export type AboutContent = {
  description: string;
  mission: string;
  vision: string;
  principal_message: string;
  history: string;
  photos: string[];
};

export type AdmissionsContent = {
  intro: string;
  requirements: string[];
  dates: { label: string; value: string }[];
  contact: string;
};

export type ContactContent = {
  phone: string;
  email: string;
  address_lines: string[];
  map_query: string;
  social: { label: string; url: string }[];
};

export type BrandingContent = {
  logo_url: string | null;
};

export type ContentMap = {
  homepage: HomepageContent;
  about: AboutContent;
  admissions: AdmissionsContent;
  contact: ContactContent;
  branding: BrandingContent;
};

export const contentDefaults: ContentMap = {
  homepage: {
    hero_title: "Shanthinikethan Model High School",
    hero_subtitle: "Empowering Young Minds for a Brighter Future",
    hero_location: "Thimmapur Village, Kothur Mandal, Ranga Reddy District",
    hero_pin: "509325",
    intro:
      "Shanthinikethan Model High School in Thimmapur offers English-medium education from Nursery to Class 10. Caring teachers, a safe campus and a balance of academics, sports and the arts help every child grow in knowledge, discipline and confidence.",
    highlights: [],
  },
  about: {
    description: "",
    mission: "",
    vision: "",
    principal_message: "",
    history: "",
    photos: [],
  },
  admissions: { intro: "", requirements: [], dates: [], contact: "" },
  contact: { phone: "", email: "", address_lines: [], map_query: "", social: [] },
  branding: { logo_url: null },
};

/** Reads one editable content block, falling back to sensible defaults. */
export function useSiteContent<K extends keyof ContentMap>(key: K) {
  return useQuery({
    queryKey: ["site_content", key],
    queryFn: async (): Promise<ContentMap[K]> => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return {
        ...contentDefaults[key],
        ...((data?.value ?? {}) as object),
      } as ContentMap[K];
    },
    staleTime: 60_000,
  });
}

/** Admin-only write for a content block (guarded server-side by RLS). */
export function useSaveSiteContent<K extends keyof ContentMap>(key: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: ContentMap[K]) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: value as never }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["site_content", key] });
    },
  });
}
